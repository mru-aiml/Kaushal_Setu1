// Authentication: email/password (scrypt) + Google OAuth 2.0 authorization-code flow.
// Sessions are opaque Bearer tokens. Role is read from the users table —
// NEVER trusted from the client. PostgreSQL-backed (async).
import crypto from 'node:crypto';
import { get, run } from './db/pg.js';
import { now, uid } from './util.js';
import { config, googleConfigured } from './config.js';

const b64 = (n) => crypto.randomBytes(n).toString('base64url');

export function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.scryptSync(String(password), salt, 64).toString('hex');
  return `scrypt$${salt}$${hash}`;
}

export function verifyPassword(password, stored) {
  if (!stored) return false;
  const [scheme, salt, hash] = String(stored).split('$');
  if (scheme !== 'scrypt' || !salt || !hash) return false;
  const check = crypto.scryptSync(String(password), salt, 64).toString('hex');
  return crypto.timingSafeEqual(Buffer.from(check, 'hex'), Buffer.from(hash, 'hex'));
}

export function publicUser(u) {
  if (!u) return null;
  return { id: u.id, name: u.name, email: u.email, provider: u.provider, role: u.role, onboarded: !!u.onboarded, createdAt: u.created_at };
}

export async function getUserById(id) {
  return (await get('SELECT * FROM users WHERE id = $1', [id])) || null;
}

export async function createSession(userId) {
  const token = `ks_${b64(32)}`;
  const expires = new Date(Date.now() + config.sessionDays * 86400e3).toISOString();
  await run('INSERT INTO sessions (token, user_id, created_at, expires_at) VALUES ($1, $2, $3, $4)', [token, userId, now(), expires]);
  return token;
}

export async function userFromToken(token) {
  if (!token) return null;
  const s = await get('SELECT * FROM sessions WHERE token = $1', [token]);
  if (!s) return null;
  if (new Date(s.expires_at).getTime() < Date.now()) {
    await run('DELETE FROM sessions WHERE token = $1', [token]);
    return null;
  }
  return getUserById(s.user_id);
}

export async function destroySession(token) {
  if (token) await run('DELETE FROM sessions WHERE token = $1', [token]);
}

// ---------- Google OAuth (real authorization-code flow; env-gated) ----------

export function googleAuthUrl(state) {
  const p = new URLSearchParams({
    client_id: config.googleClientId,
    redirect_uri: `${config.backendUrl}/api/auth/google/callback`,
    response_type: 'code',
    scope: 'openid email profile',
    access_type: 'online',
    prompt: 'select_account',
    state,
  });
  return `https://accounts.google.com/o/oauth2/v2/auth?${p.toString()}`;
}

async function postForm(url, params) {
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams(params).toString(),
  });
  if (!res.ok) throw new Error(`Google token exchange failed (HTTP ${res.status})`);
  return res.json();
}

// Verify the id_token with Google and return the profile claims.
export async function verifyGoogleCode(code) {
  const tok = await postForm('https://oauth2.googleapis.com/token', {
    code,
    client_id: config.googleClientId,
    client_secret: config.googleClientSecret,
    redirect_uri: `${config.backendUrl}/api/auth/google/callback`,
    grant_type: 'authorization_code',
  });
  if (!tok.id_token) throw new Error('Google did not return an identity token');
  const infoRes = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${tok.id_token}`);
  if (!infoRes.ok) throw new Error('Google identity verification failed');
  const info = await infoRes.json();
  if (info.aud !== config.googleClientId) throw new Error('Google identity audience mismatch');
  if (!info.email) throw new Error('Google did not return an email address');
  return { sub: info.sub, email: String(info.email).toLowerCase(), name: info.name || info.email.split('@')[0] };
}

export async function findOrCreateGoogleUser({ sub, email, name }) {
  let u = await get('SELECT * FROM users WHERE google_sub = $1', [sub]);
  if (u) return { user: u, isNew: false };
  const existing = await get('SELECT * FROM users WHERE email = $1', [email]);
  if (existing) {
    // Link Google identity to the existing email account.
    await run('UPDATE users SET google_sub = $1 WHERE id = $2', [sub, existing.id]);
    const linked = await getUserById(existing.id);
    return { user: linked, isNew: !linked.onboarded };
  }
  const id = uid('u');
  await run(`INSERT INTO users (id, email, name, password_hash, provider, google_sub, role, onboarded, created_at)
    VALUES ($1, $2, $3, NULL, 'google', $4, NULL, FALSE, $5)`, [id, email, name, sub, now()]);
  return { user: await getUserById(id), isNew: true };
}

export async function createGrant(userId) {
  const code = `grant_${b64(24)}`;
  const expires = new Date(Date.now() + 5 * 60e3).toISOString();
  await run('INSERT INTO oauth_grants (code, user_id, created_at, expires_at) VALUES ($1, $2, $3, $4)', [code, userId, now(), expires]);
  return code;
}

export async function consumeGrant(code) {
  const g = await get('SELECT * FROM oauth_grants WHERE code = $1', [code]);
  if (!g || g.consumed) return null;
  if (new Date(g.expires_at).getTime() < Date.now()) return null;
  await run('UPDATE oauth_grants SET consumed = TRUE WHERE code = $1', [code]);
  return getUserById(g.user_id);
}

// ---------- Clerk (primary auth when configured; env-gated) ----------
// Clerk is an identity provider INTO the single backend session system:
// the frontend exchanges a Clerk session JWT once at POST /api/auth/clerk
// and receives a normal backend Bearer token. Per-request auth stays
// unchanged (local session tokens only) — no parallel auth system.

export function clerkConfigured() {
  return !!process.env.CLERK_SECRET_KEY;
}

export async function verifyClerkToken(jwt) {
  if (!clerkConfigured()) {
    const err = new Error('Clerk authentication is not configured on this server.');
    err.status = 503;
    err.code = 'clerk_not_configured';
    throw err;
  }
  const { verifyToken } = await import('@clerk/backend');
  let claims;
  try {
    claims = await verifyToken(jwt, { secretKey: process.env.CLERK_SECRET_KEY });
  } catch {
    const err = new Error('Invalid Clerk session. Please sign in again.');
    err.status = 401;
    err.code = 'clerk_invalid';
    throw err;
  }
  const emailClaim = String(claims.email || claims.email_address || '').toLowerCase();
  if (!claims.sub) {
    const err = new Error('Clerk did not return a usable identity.');
    err.status = 401;
    err.code = 'clerk_invalid';
    throw err;
  }
  // Email/display-name are resolved server-side only: JWT claim first, else
  // the Clerk API looked up by verified sub. Never from the frontend.
  let email = emailClaim;
  let name = claims.name || claims.username || '';
  if (!email || !name) {
    try {
      const { createClerkClient } = await import('@clerk/backend');
      const client = createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY });
      const cu = await client.users.getUser(claims.sub);
      email = email || String(cu.primaryEmailAddress?.emailAddress || '').toLowerCase();
      name = name || [cu.firstName, cu.lastName].filter(Boolean).join(' ') || cu.username || '';
    } catch {
      /* fall through to validation below */
    }
  }
  if (!email) {
    const err = new Error('Clerk did not return a usable identity.');
    err.status = 401;
    err.code = 'clerk_invalid';
    throw err;
  }
  return { sub: claims.sub, email, name: name || email.split('@')[0] };
}

export async function findOrCreateClerkUser({ sub, email, name }) {
  let u = await get('SELECT * FROM users WHERE clerk_id = $1', [sub]);
  if (u) return { user: u, isNew: !u.onboarded };
  const existing = await get('SELECT * FROM users WHERE email = $1', [email]);
  if (existing) {
    // Link Clerk identity to the existing email account (keeps role/profile).
    await run('UPDATE users SET clerk_id = $1 WHERE id = $2', [sub, existing.id]);
    const linked = await getUserById(existing.id);
    return { user: linked, isNew: !linked.onboarded };
  }
  const id = uid('u');
  await run(`INSERT INTO users (id, email, name, password_hash, provider, clerk_id, role, onboarded, created_at)
    VALUES ($1, $2, $3, NULL, 'clerk', $4, NULL, FALSE, $5)`, [id, email, name, sub, now()]);
  return { user: await getUserById(id), isNew: true };
}

export { googleConfigured };
