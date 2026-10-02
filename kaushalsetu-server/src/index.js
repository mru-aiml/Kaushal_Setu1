// KAUSHALSETU backend API. Express + cors package + PostgreSQL.
// Conventions: JSON in/out, Bearer sessions, server-side RBAC on every route.
// There is exactly ONE CORS implementation (below). Route handlers use the
// internal route() registry; Express provides transport + CORS + preflight.
import express from 'express';
import cors from 'cors';
import fs from 'node:fs';
import crypto from 'node:crypto';
import XLSX from 'xlsx';
import { config } from './config.js';
import { send, requireAuth, bearer } from './rbac.js';
import {
  hashPassword, verifyPassword, publicUser, getUserById, createSession,
  userFromToken, destroySession, googleAuthUrl, verifyGoogleCode,
  findOrCreateGoogleUser, createGrant, consumeGrant, googleConfigured,
  verifyClerkToken, findOrCreateClerkUser, clerkConfigured,
} from './auth.js';
import { get, all, run } from './db/pg.js';
import { ping as dbPing } from './db/pg.js';
import { now, uid } from './util.js';
import { ENTITIES, ROLE_ENTITIES, canRead, canWrite, validateRow } from './entities.js';
import { PROFILE_SCHEMAS, validateProfile, getProfile, saveProfile } from './profiles.js';
import { parseFile, validateImport, extractResume, extOf } from './import.js';
import { aiStatus, careerRecommendations, generateCurriculum, validateCareerResult, validateCurriculumResult } from './ai.js';
import { REPORT_CATALOG, generateReport, getReport, reportPath, mimeFor } from './reports.js';
import { governmentStats, trainingCentreStats, employerStats, candidateStats } from './stats.js';


const app = express();

// ---- Single CORS implementation (cors package) ----
// Allowlist = FRONTEND_URL ∪ CORS_ORIGINS (both normalized, no trailing /).
// At least one of them must be the production frontend origin on Render,
// otherwise browsers receive no Access-Control-Allow-Origin (the classic
// "blocked by CORS policy" symptom). Localhost stays allowed for development.
const allowSet = new Set(
  [config.frontendUrl, ...config.corsOrigins].map((o) => String(o || '').trim().replace(/\/+$/, '')).filter(Boolean)
);
const allowedOrigins = [...allowSet];

app.use(
  cors({
    origin: (origin, callback) => {
      // No Origin (curl, Render health checks, server-to-server) → allow.
      if (!origin || allowedOrigins.includes(origin.replace(/\/+$/, ''))) {
        return callback(null, true);
      }
      return callback(new Error('Not allowed by CORS'));
    },
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  })
);
// NOTE: no app.options() duplicate and no express.json() here — the cors
// middleware above already answers all preflights, and bodies are parsed by
// readBody() below (which enforces MAX_BODY with proper 400/413 errors).

const MAX_BODY = () => config.maxUploadBytes + 1024 * 1024;

function readBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    let size = 0;
    req.on('data', (c) => {
      size += c.length;
      if (size > MAX_BODY()) {
        reject(Object.assign(new Error(`Request too large (limit ${Math.round(config.maxUploadBytes / 1048576)} MB)`), { status: 413 }));
        req.destroy();
        return;
      }
      chunks.push(c);
    });
    req.on('end', () => {
      const raw = Buffer.concat(chunks).toString('utf8');
      if (!raw) return resolve({});
      try {
        resolve(JSON.parse(raw));
      } catch {
        reject(Object.assign(new Error('Invalid JSON body'), { status: 400 }));
      }
    });
    req.on('error', reject);
  });
}




// Documented demo accounts (demo.*@kaushalsetu.in) and ephemeral demo sessions
// are sandboxed exactly like demo workspaces: shared seed rows are visible,
// their own writes never leak into real aggregates.
const DEMO_ACCOUNT = /^demo\.(govt|tc|emp|cand)@kaushalsetu\.in$/i;
const isDemoUser = (u) => !u ? false : (u.provider === 'demo' || String(u.id).startsWith('demo_') || DEMO_ACCOUNT.test(u.email || ''));

// Shared-dataset visibility: demo-owned rows are visible only to their owner.
// Seed rows (owner 'seed') and real rows are visible per role rules.
function visibility(user) {
  if (isDemoUser(user)) return { clause: ` AND (owner = $1 OR owner = 'seed')`, params: [user.id] };
  return { clause: ` AND owner NOT LIKE 'demo\\_%' ESCAPE '\\'`, params: [] };
}

async function rowById(entity, id) {
  return (await get(`SELECT * FROM ${entity} WHERE id = $1`, [id])) || null;
}

function assertRowWritable(entity, row, user) {
  if (!row) return 'Record not found';
  if (!canWrite(entity, user)) return 'Access restricted for this dataset';
  // Demo sessions work on their own copies: shared seed rows are read-only.
  if (isDemoUser(user) && row.owner === 'seed') {
    return 'Demo sessions cannot modify shared demonstration rows — add your own record instead';
  }
  if (ENTITIES[entity].access === 'own' && row.owner !== user.id) return 'You can only modify your own records';
  return null;
}

// Demo sessions see seed rows alongside their own (sandbox view); owners see
// their own rows; cross-role aggregate reads fall through to visibility().
function ownerFilter(entity, user) {
  const def = ENTITIES[entity];
  if (def.access === 'own' && user.role !== 'government' && (def.roles || []).includes(user.role)) {
    if (isDemoUser(user)) return { clause: `owner IN ($1, 'seed')`, params: [user.id] };
    return { clause: `owner = $1`, params: [user.id] };
  }
  return null; // shared dataset or cross-role read → visibility() applies
}

const routes = [];

function route(method, pattern, handler) {
  routes.push({ method, pattern, handler });
}

function matchRoute(method, pathname) {
  for (const r of routes) {
    if (r.method !== method) continue;
    const params = {};
    const rp = r.pattern.split('/');
    const pp = pathname.split('/');
    if (rp.length !== pp.length) continue;
    let ok = true;
    for (let i = 0; i < rp.length; i++) {
      if (rp[i].startsWith(':')) params[rp[i].slice(1)] = decodeURIComponent(pp[i]);
      else if (rp[i] !== pp[i]) { ok = false; break; }
    }
    if (ok) return { handler: r.handler, params };
  }
  return null;
}

// ---------------- public ----------------
route('GET', '/api/health', async (req, res) => {
  let dbOk = false;
  try {
    dbOk = await dbPing();
  } catch {
    dbOk = false;
  }
  send(res, 200, {
    ok: true, service: 'kaushalsetu-server', phase: '3',
    database: { connected: dbOk, engine: 'postgresql' },
    timestamp: now(),
    auth: { mode: 'backend', googleConfigured: googleConfigured(), clerkConfigured: clerkConfigured() },
    ai: aiStatus(),
  });
});

route('POST', '/api/auth/signup', async (req, res, _p, body) => {
  const name = String(body.name || '').trim();
  const email = String(body.email || '').trim().toLowerCase();
  const password = String(body.password || '');
  if (!name) return send(res, 400, { error: 'Please enter your full name.' });
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return send(res, 400, { error: 'Please enter a valid email address.' });
  if (password.length < 6) return send(res, 400, { error: 'Password must be at least 6 characters.' });
  if (await get('SELECT id FROM users WHERE email = $1', [email])) {
    return send(res, 409, { error: 'An account with this email already exists. Please sign in.', code: 'account_exists' });
  }
  const id = uid('u');
  await run(`INSERT INTO users (id, email, name, password_hash, provider, role, onboarded, created_at)
    VALUES ($1, $2, $3, $4, 'email', NULL, FALSE, $5)`, [id, email, name, hashPassword(password), now()]);
  const user = await getUserById(id);
  const token = await createSession(id);
  send(res, 201, { user: publicUser(user), token });
});

route('POST', '/api/auth/signin', async (req, res, _p, body) => {
  const email = String(body.email || '').trim().toLowerCase();
  const password = String(body.password || '');
  const u = await get('SELECT * FROM users WHERE email = $1', [email]);
  if (!u || u.provider !== 'email' || !verifyPassword(password, u.password_hash)) {
    return send(res, 401, { error: 'Invalid email or password.', code: 'bad_credentials' });
  }
  const token = await createSession(u.id);
  send(res, 200, { user: publicUser(await getUserById(u.id)), token });
});

route('GET', '/api/auth/google/url', async (req, res) => {
  if (!googleConfigured()) {
    return send(res, 503, { error: 'Google sign-in is not configured on this server. Use email sign-in, or ask the administrator to set GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET.', code: 'google_not_configured' });
  }
  const state = crypto.randomBytes(16).toString('hex');
  send(res, 200, { url: googleAuthUrl(state) });
});

route('GET', '/api/auth/google/callback', async (req, res, _p, _b, query) => {
  if (!googleConfigured()) return send(res, 503, { error: 'Google sign-in is not configured.' });
  const code = query.get('code');
  if (!code) return send(res, 400, { error: 'Missing authorization code from Google.' });
  try {
    const claims = await verifyGoogleCode(code);
    const { user } = await findOrCreateGoogleUser(claims);
    const grant = await createGrant(user.id);
    const dest = new URL('/auth/callback', config.frontendUrl);
    dest.searchParams.set('code', grant);
    res.writeHead(302, { Location: dest.toString() });
    res.end();
  } catch (e) {
    const dest = new URL('/login', config.frontendUrl);
    dest.searchParams.set('error', 'google_failed');
    res.writeHead(302, { Location: dest.toString() });
    res.end();
  }
});

route('POST', '/api/auth/google/consume', async (req, res, _p, body) => {
  const user = await consumeGrant(String(body.code || ''));
  if (!user) return send(res, 400, { error: 'Invalid or expired sign-in grant. Please try again.' });
  const token = await createSession(user.id);
  send(res, 200, { user: publicUser(user), token });
});

route('POST', '/api/auth/clerk', async (req, res, _p, body) => {
  // One-time exchange: verify the Clerk session JWT server-side, then issue
  // a normal backend Bearer token. Afterwards the client uses ONLY the
  // backend token — per-request auth is unchanged (single session system).
  const jwt = String(body.token || body.jwt || '');
  if (!jwt) return send(res, 400, { error: 'Missing Clerk session token.' });
  try {
    const identity = await verifyClerkToken(jwt);
    const { user, isNew } = await findOrCreateClerkUser(identity);
    const token = await createSession(user.id);
    send(res, 200, { user: publicUser(user), token, isNew });
  } catch (e) {
    send(res, e.status || 401, { error: e.message || 'Clerk sign-in failed.', code: e.code || 'clerk_invalid' });
  }
});

route('POST', '/api/demo/session', async (req, res, _p, body) => {
  const role = String(body.role || '');
  if (!['government', 'trainingCentre', 'employer', 'candidate'].includes(role)) {
    return send(res, 400, { error: 'Unknown role.' });
  }
  const id = `demo_${role}_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;
  const names = { government: 'Demo Government', trainingCentre: 'Demo Training Centre', employer: 'Demo Employer', candidate: 'Demo Candidate' };
  await run(`INSERT INTO users (id, email, name, password_hash, provider, role, onboarded, created_at)
    VALUES ($1, $2, $3, NULL, 'demo', $4, TRUE, $5)`, [id, `${id}@demo.kaushalsetu.in`, names[role], role, now()]);
  const token = await createSession(id);
  send(res, 201, { user: { ...publicUser(await getUserById(id)), demo: true }, token, demo: true });
});

route('POST', '/api/auth/logout', async (req, res) => {
  await destroySession(bearer(req));
  send(res, 200, { ok: true });
});

// ---------------- me / profile ----------------
route('GET', '/api/me', async (req, res) => {
  const user = await requireAuth(req, res);
  if (!user) return;
  send(res, 200, { user: { ...publicUser(user), demo: isDemoUser(user) } });
});

route('PUT', '/api/me', async (req, res, _p, body) => {
  const user = await requireAuth(req, res);
  if (!user) return;
  const sets = [];
  const params = [];
  if (body.name !== undefined) {
    const name = String(body.name).trim().slice(0, 120);
    if (!name) return send(res, 400, { error: 'Name cannot be empty.' });
    sets.push(`name = $${params.length + 1}`);
    params.push(name);
  }
  if (body.role !== undefined) {
    const role = String(body.role);
    if (!['government', 'trainingCentre', 'employer', 'candidate'].includes(role)) {
      return send(res, 400, { error: 'Unknown role.' });
    }
    if (user.onboarded && !isDemoUser(user)) {
      return send(res, 403, { error: 'Role is already assigned to this account and cannot be changed.', code: 'role_locked' });
    }
    sets.push(`role = $${params.length + 1}`);
    params.push(role);
    sets.push(`onboarded = TRUE`);
  }
  if (sets.length) {
    params.push(user.id);
    await run(`UPDATE users SET ${sets.join(', ')} WHERE id = $${params.length}`, params);
  }
  const fresh = await getUserById(user.id);
  send(res, 200, { user: { ...publicUser(fresh), demo: isDemoUser(fresh) } });
});

route('GET', '/api/profile-schema', async (req, res) => {
  const user = await requireAuth(req, res);
  if (!user) return;
  if (!user.role || !PROFILE_SCHEMAS[user.role]) return send(res, 400, { error: 'Choose a role first (onboarding).' });
  send(res, 200, { role: user.role, schema: PROFILE_SCHEMAS[user.role], supportsPhoto: true, supportsResume: user.role === 'candidate' });
});

route('GET', '/api/me/profile', async (req, res) => {
  const user = await requireAuth(req, res);
  if (!user) return;
  if (!user.role) return send(res, 400, { error: 'Choose a role first (onboarding).', code: 'no_role' });
  const p = await getProfile(user.id, user.role);
  send(res, 200, { profile: { ...p, resume: undefined } });
});

route('PUT', '/api/me/profile', async (req, res, _p, body) => {
  const user = await requireAuth(req, res);
  if (!user) return;
  if (!user.role) return send(res, 400, { error: 'Choose a role first (onboarding).', code: 'no_role' });
  const schema = PROFILE_SCHEMAS[user.role];
  if (!schema) return send(res, 400, { error: 'Unknown role.' });
  const { clean, errors } = validateProfile(user.role, body.data || {});
  if (Object.keys(errors).length) return send(res, 400, { error: 'Profile validation failed.', fields: errors });

  let photo = null;
  if (body.photo) {
    if (typeof body.photo !== 'string' || !body.photo.startsWith('data:image/')) {
      return send(res, 400, { error: 'Photo must be an image data URL.' });
    }
    if (body.photo.length > 700 * 1024) return send(res, 413, { error: 'Photo too large (max ~500 KB).' });
    photo = body.photo.slice(0, 700 * 1024);
  }
  let resume = null;
  let resumeName = null;
  if (body.resume) {
    if (typeof body.resume !== 'string' || !body.resume.startsWith('data:application/pdf')) {
      return send(res, 400, { error: 'Resume must be a PDF data URL.' });
    }
    if (body.resume.length > 2.8 * 1024 * 1024) return send(res, 413, { error: 'Resume too large (max 2 MB).' });
    resume = body.resume;
    resumeName = String(body.resumeName || 'resume.pdf').slice(0, 200);
  }
  const synced = { ...clean };
  if (clean.email && clean.email !== user.email && user.provider === 'email') {
    const clash = await get('SELECT id FROM users WHERE email = $1 AND id != $2', [clean.email, user.id]);
    if (!clash) await run('UPDATE users SET email = $1 WHERE id = $2', [clean.email, user.id]);
    else synced.email = user.email;
  }
  const nameField = clean.fullName || clean.centreName || clean.companyName || clean.headName;
  if (nameField && nameField !== user.name) {
    await run('UPDATE users SET name = $1 WHERE id = $2', [String(nameField).slice(0, 120), user.id]);
  }
  const p = await saveProfile(user.id, user.role, synced, { photo, resumeName, resume });
  send(res, 200, { profile: { ...p, resume: undefined }, message: 'Profile saved.' });
});

route('GET', '/api/me/resume', async (req, res) => {
  const user = await requireAuth(req, res);
  if (!user) return;
  const row = await get('SELECT resume, resume_name FROM profiles WHERE user_id = $1', [user.id]);
  if (!row?.resume) return send(res, 404, { error: 'No resume uploaded yet.' });
  const base64 = row.resume.split(',')[1] || '';
  const buf = Buffer.from(base64, 'base64');
  res.writeHead(200, {
    'Content-Type': 'application/pdf',
    'Content-Length': buf.length,
    'Content-Disposition': `attachment; filename="${(row.resume_name || 'resume.pdf').replace(/"/g, '')}"`,
  });
  res.end(buf);
});

// ---------------- entities / data ----------------
route('GET', '/api/entities', async (req, res) => {
  const user = await requireAuth(req, res);
  if (!user) return;
  const mine = ROLE_ENTITIES[user.role] || [];
  send(res, 200, {
    entities: Object.fromEntries(Object.entries(ENTITIES).map(([k, v]) => [k, { label: v.label, fields: v.fields, readable: canRead(k, user), writable: canWrite(k, user) }])),
    mine,
    readable: Object.keys(ENTITIES).filter((e) => canRead(e, user)),
  });
});

route('GET', '/api/data/:entity', async (req, res, params, _b, query) => {
  const user = await requireAuth(req, res);
  if (!user) return;
  const { entity } = params;
  if (!ENTITIES[entity]) return send(res, 404, { error: 'Unknown dataset.' });
  if (!canRead(entity, user)) return send(res, 403, { error: 'Access restricted for this dataset.' });
  const vis = visibility(user);
  const scoped = ownerFilter(entity, user);
  // Build positional params in order.
  const parts = [];
  const p = [];
  if (scoped) {
    parts.push(scoped.clause.replace('$1', `$${p.length + 1}`));
    p.push(...scoped.params);
  } else if (vis.params.length) {
    parts.push(`(owner = $${p.length + 1} OR owner = 'seed')`);
    p.push(...vis.params);
  } else {
    parts.push(`owner NOT LIKE 'demo\\_%' ESCAPE '\\'`);
  }
  const q = (query.get('q') || '').trim();
  if (q) {
    const textFields = ENTITIES[entity].fields.filter((f) => f.type !== 'number').map((f) => f.name);
    if (textFields.length) {
      const start = p.length + 1;
      parts.push(`(${textFields.map((f, i) => `${f} ILIKE $${start + i}`).join(' OR ')})`);
      textFields.forEach(() => p.push(`%${q}%`));
    }
  }
  const limit = Math.min(Math.max(parseInt(query.get('limit') || '50', 10) || 50, 1), 200);
  const page = Math.max(parseInt(query.get('page') || '1', 10) || 1, 1);
  const where = `WHERE ${parts.join(' AND ')}`;
  const total = (await get(`SELECT COUNT(*)::INT c FROM ${entity} ${where}`, p)).c;
  const data = await all(`SELECT * FROM ${entity} ${where} ORDER BY created_at DESC LIMIT $${p.length + 1} OFFSET $${p.length + 2}`, [...p, limit, (page - 1) * limit]);
  send(res, 200, { data, total, page, limit, writable: canWrite(entity, user) });
});

route('POST', '/api/data/:entity', async (req, res, params, body) => {
  const user = await requireAuth(req, res);
  if (!user) return;
  const { entity } = params;
  if (!ENTITIES[entity] || !canWrite(entity, user)) return send(res, 403, { error: 'Access restricted for this dataset.' });
  const { clean, errors } = validateRow(entity, body || {});
  if (errors.length) return send(res, 400, { error: 'Validation failed.', fields: errors });
  const id = uid('r');
  const cols = Object.keys(clean);
  await run(`INSERT INTO ${entity} (id, owner, ${cols.join(', ')}, is_demo, created_at)
    VALUES ($1, $2, ${cols.map((_, i) => `$${i + 3}`).join(', ')}, FALSE, $${cols.length + 3})`,
    [id, user.id, ...Object.values(clean), now()]);
  send(res, 201, { record: await rowById(entity, id) });
});

route('PUT', '/api/data/:entity/:id', async (req, res, params, body) => {
  const user = await requireAuth(req, res);
  if (!user) return;
  const { entity, id } = params;
  if (!ENTITIES[entity]) return send(res, 404, { error: 'Unknown dataset.' });
  const problem = assertRowWritable(entity, await rowById(entity, id), user);
  if (problem) return send(res, problem === 'Record not found' ? 404 : 403, { error: problem });
  const { clean, errors } = validateRow(entity, body || {});
  if (errors.length) return send(res, 400, { error: 'Validation failed.', fields: errors });
  const cols = Object.keys(clean);
  await run(`UPDATE ${entity} SET ${cols.map((c, i) => `${c} = $${i + 1}`).join(', ')} WHERE id = $${cols.length + 1}`,
    [...Object.values(clean), id]);
  send(res, 200, { record: await rowById(entity, id) });
});

route('DELETE', '/api/data/:entity/:id', async (req, res, params) => {
  const user = await requireAuth(req, res);
  if (!user) return;
  const { entity, id } = params;
  if (!ENTITIES[entity]) return send(res, 404, { error: 'Unknown dataset.' });
  const problem = assertRowWritable(entity, await rowById(entity, id), user);
  if (problem) return send(res, problem === 'Record not found' ? 404 : 403, { error: problem });
  await run(`DELETE FROM ${entity} WHERE id = $1`, [id]);
  send(res, 200, { ok: true });
});

route('GET', '/api/data/:entity/export', async (req, res, params, _b, query) => {
  const user = await requireAuth(req, res);
  if (!user) return;
  const { entity } = params;
  if (!ENTITIES[entity] || !canRead(entity, user)) return send(res, 403, { error: 'Access restricted for this dataset.' });
  const format = (query.get('format') || 'csv').toLowerCase();
  if (!['csv', 'xlsx'].includes(format)) return send(res, 400, { error: 'Format must be csv or xlsx.' });
  const vis = visibility(user);
  let where;
  let wp;
  const scoped = ownerFilter(entity, user);
  if (scoped) {
    where = `WHERE ${scoped.clause}`;
    wp = scoped.params;
  } else if (vis.params.length) {
    where = `WHERE (owner = $1 OR owner = 'seed')`;
    wp = vis.params;
  } else {
    where = `WHERE owner NOT LIKE 'demo\\_%' ESCAPE '\\'`;
    wp = [];
  }
  const data = await all(`SELECT * FROM ${entity} ${where} ORDER BY created_at DESC`, wp);
  if (!data.length) return send(res, 404, { error: 'No data is available for the selected filters.', code: 'empty_report' });
  const head = ['id', ...ENTITIES[entity].fields.map((f) => f.name), 'created_at'];
  const q = (v) => {
    const s = String(v ?? '');
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  if (format === 'csv') {
    const csv = `# KaushalSetu export — ${ENTITIES[entity].label} (${new Date().toLocaleString()})\n`
      + head.map(q).join(',') + '\n'
      + data.map((r) => head.map((h) => q(r[h])).join(',')).join('\n') + '\n';
    res.writeHead(200, { 'Content-Type': 'text/csv', 'Content-Disposition': `attachment; filename="${entity}-export.csv"` });
    res.end(csv);
    return;
  }
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet([head, ...data.map((r) => head.map((h) => r[h] ?? ''))]), 'Data');
  const buf = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
  res.writeHead(200, {
    'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'Content-Disposition': `attachment; filename="${entity}-export.xlsx"`,
    'Content-Length': buf.length,
  });
  res.end(buf);
});

// ---------------- import ----------------
route('POST', '/api/import/parse', async (req, res, _p, body) => {
  const user = await requireAuth(req, res);
  if (!user) return;
  const filename = String(body.filename || '');
  const ext = extOf(filename);
  if (!['csv', 'xlsx', 'xls'].includes(ext)) {
    return send(res, 400, { error: 'Only CSV and XLSX files are accepted.' });
  }
  let buffer;
  try {
    buffer = Buffer.from(String(body.content || ''), 'base64');
  } catch {
    return send(res, 400, { error: 'Unreadable file content.' });
  }
  if (!buffer.length || buffer.length > config.maxUploadBytes) {
    return send(res, 413, { error: `File must be non-empty and under ${Math.round(config.maxUploadBytes / 1048576)} MB.` });
  }
  try {
    const { columns, rows: parsed } = parseFile(filename, buffer);
    const capped = parsed.slice(0, 1000);
    send(res, 200, { columns, rows: capped, total: parsed.length, truncated: parsed.length > capped.length });
  } catch (e) {
    send(res, 400, { error: e.message || 'Could not parse the file.' });
  }
});

route('POST', '/api/import/commit', async (req, res, _p, body) => {
  const user = await requireAuth(req, res);
  if (!user) return;
  const { entity, rows: fileRows, mapping } = body || {};
  if (!ENTITIES[entity] || !canWrite(entity, user)) {
    return send(res, 403, { error: 'Access restricted for this dataset.' });
  }
  if (!Array.isArray(fileRows) || !fileRows.length) return send(res, 400, { error: 'No rows to import.' });
  if (fileRows.length > 1000) return send(res, 400, { error: 'Import capped at 1000 rows per batch.' });
  const { valid, invalid, total } = validateImport(entity, fileRows, mapping);
  if (valid.length) {
    const cols = Object.keys(valid[0]);
    // One row = (id, owner, ...cols, is_demo, created_at)
    const fixed = valid.map((_, ri) => {
      const base = ri * (cols.length + 3);
      return `($${base + 1}, $${base + 2}, ${cols.map((_, ci) => `$${base + 3 + ci}`).join(', ')}, FALSE, $${base + 3 + cols.length})`;
    }).join(', ');
    const flat = [];
    for (const v of valid) flat.push(uid('r'), user.id, ...cols.map((c) => v[c]), now());
    await run(`INSERT INTO ${entity} (id, owner, ${cols.join(', ')}, is_demo, created_at) VALUES ${fixed}`, flat);
  }
  send(res, 200, {
    total,
    imported: valid.length,
    failed: invalid.length,
    errors: invalid.slice(0, 50),
    message: invalid.length
      ? `${valid.length} rows imported, ${invalid.length} rows could not be imported.`
      : `${valid.length} rows imported successfully.`,
  });
});

route('POST', '/api/import/resume', async (req, res, _p, body) => {
  const user = await requireAuth(req, res);
  if (!user) return;
  if (user.role !== 'candidate') return send(res, 403, { error: 'Resume import is available to candidates.' });
  const filename = String(body.filename || '');
  if (extOf(filename) !== 'pdf') return send(res, 400, { error: 'Only PDF resumes are accepted.' });
  let buffer;
  try {
    buffer = Buffer.from(String(body.content || ''), 'base64');
  } catch {
    return send(res, 400, { error: 'Unreadable file content.' });
  }
  if (!buffer.length || buffer.length > config.maxUploadBytes) {
    return send(res, 413, { error: `File must be non-empty and under ${Math.round(config.maxUploadBytes / 1048576)} MB.` });
  }
  if (!buffer.slice(0, 5).toString().includes('%PDF')) {
    return send(res, 400, { error: 'The uploaded file is not a valid PDF.' });
  }
  send(res, 200, extractResume(buffer));
});

// ---------------- AI ----------------
async function candidateInput(user) {
  const prof = await get('SELECT * FROM profiles WHERE user_id = $1', [user.id]);
  const demo = isDemoUser(user);
  const sc = demo ? `owner IN ($1, 'seed')` : `owner = $1`;
  const skills = await all(`SELECT skill, proficiency, years FROM candidate_skills WHERE ${sc}`, [user.id]);
  const education = await all(`SELECT level, degree, institute, year FROM education WHERE ${sc}`, [user.id]);
  const certs = await all(`SELECT name, issuer, year FROM certifications WHERE ${sc}`, [user.id]);
  const exp = await all(`SELECT title, company, years, description FROM experience WHERE ${sc}`, [user.id]);
  const market = await all(`SELECT skill, sector, district, demand_index, gap, trend FROM skill_demand WHERE owner NOT LIKE 'demo\\_%' ESCAPE '\\' ORDER BY demand_index DESC LIMIT 20`);
  const jobs = await all(`SELECT title, role, industry, skills, experience, location, salary_min, salary_max, openings FROM jobs WHERE status = 'Open' AND owner NOT LIKE 'demo\\_%' ESCAPE '\\' LIMIT 20`);
  const pdata = prof?.data;
  return {
    profile: pdata ? (typeof pdata === 'string' ? JSON.parse(pdata) : pdata) : {},
    skills, education, certifications: certs, experience: exp,
    market, jobs,
  };
}

route('POST', '/api/ai/career-recommendations', async (req, res) => {
  const user = await requireAuth(req, res);
  if (!user) return;
  if (user.role !== 'candidate') return send(res, 403, { error: 'Career recommendations are available to candidates.' });
  const input = await candidateInput(user);
  const hasProfile = Object.keys(input.profile).length > 0;
  if (!hasProfile && input.skills.length === 0) {
    return send(res, 400, { error: 'Complete your profile to receive career recommendations.', code: 'profile_incomplete' });
  }
  try {
    const result = validateCareerResult(await careerRecommendations(input));
    const id = uid('ai');
    await run('INSERT INTO career_recommendations (id, owner, input, result, is_demo, created_at) VALUES ($1, $2, $3, $4, FALSE, $5)',
      [id, user.id, JSON.stringify({ profileKeys: Object.keys(input.profile), skills: input.skills.length }), JSON.stringify(result), now()]);
    send(res, 200, { id, generated: 'ai', model: config.aiModel, result });
  } catch (e) {
    send(res, e.status || 502, { error: e.message, code: e.code || 'ai_error' });
  }
});

route('GET', '/api/ai/career-recommendations/latest', async (req, res) => {
  const user = await requireAuth(req, res);
  if (!user) return;
  if (user.role !== 'candidate') return send(res, 403, { error: 'Career recommendations are available to candidates.' });
  const row = await get('SELECT * FROM career_recommendations WHERE owner = $1 ORDER BY created_at DESC LIMIT 1', [user.id]);
  if (!row) return send(res, 404, { error: 'No recommendation generated yet.', code: 'none_yet' });
  const result = typeof row.result === 'string' ? JSON.parse(row.result) : row.result;
  send(res, 200, { id: row.id, generated: 'ai', result, createdAt: row.created_at });
});

route('POST', '/api/ai/curriculum', async (req, res, _p, body) => {
  const user = await requireAuth(req, res);
  if (!user) return;
  if (!['government', 'trainingCentre'].includes(user.role)) {
    return send(res, 403, { error: 'Curriculum generation is available to Government and Training Centre users.' });
  }
  const targetRole = String(body.targetRole || '').trim();
  if (!targetRole) return send(res, 400, { error: 'Target job role is required.' });
  try {
    const result = validateCurriculumResult(await generateCurriculum({
      targetRole,
      requiredSkills: body.requiredSkills || [],
      currentLevel: body.currentLevel || '',
      targetProficiency: body.targetProficiency || '',
      duration: body.duration || '',
      constraints: body.constraints || '',
      infrastructure: body.infrastructure || '',
      cohort: body.cohort || '',
    }));
    send(res, 200, { generated: 'ai', model: config.aiModel, result });
  } catch (e) {
    send(res, e.status || 502, { error: e.message, code: e.code || 'ai_error' });
  }
});

route('GET', '/api/ai/status', async (req, res) => {
  const user = await requireAuth(req, res);
  if (!user) return;
  send(res, 200, aiStatus());
});

// ---------------- curricula ----------------
const asJson = (v) => (typeof v === 'string' ? JSON.parse(v) : v);

route('GET', '/api/curricula', async (req, res) => {
  const user = await requireAuth(req, res);
  if (!user) return;
  if (!['government', 'trainingCentre'].includes(user.role)) return send(res, 403, { error: 'Access restricted.' });
  const data = await all('SELECT * FROM curricula WHERE owner = $1 ORDER BY created_at DESC', [user.id]);
  send(res, 200, { data: data.map((r) => ({ ...r, data: asJson(r.data) })) });
});

route('POST', '/api/curricula', async (req, res, _p, body) => {
  const user = await requireAuth(req, res);
  if (!user) return;
  if (!['government', 'trainingCentre'].includes(user.role)) return send(res, 403, { error: 'Access restricted.' });
  const data = body.data || body.result;
  if (!body.title || !data || !Array.isArray(data.modules)) {
    return send(res, 400, { error: 'A valid generated curriculum (title + modules) is required to save.' });
  }
  const id = uid('cur');
  await run('INSERT INTO curricula (id, owner, title, target_role, duration, data, status, is_demo, created_at) VALUES ($1, $2, $3, $4, $5, $6, $7, FALSE, $8)',
    [id, user.id, String(body.title).slice(0, 200), String(body.targetRole || '').slice(0, 200), String(body.duration || data.duration || '').slice(0, 100), JSON.stringify(data), 'draft', now()]);
  send(res, 201, { id });
});

route('PUT', '/api/curricula/:id', async (req, res, params, body) => {
  const user = await requireAuth(req, res);
  if (!user) return;
  const row = await get('SELECT * FROM curricula WHERE id = $1', [params.id]);
  if (!row || row.owner !== user.id) return send(res, 404, { error: 'Curriculum not found.' });
  const data = body.data || asJson(row.data);
  await run('UPDATE curricula SET title = $1, data = $2, status = $3 WHERE id = $4',
    [String(body.title || row.title).slice(0, 200), JSON.stringify(data), String(body.status || row.status).slice(0, 40), params.id]);
  send(res, 200, { ok: true });
});

route('DELETE', '/api/curricula/:id', async (req, res, params) => {
  const user = await requireAuth(req, res);
  if (!user) return;
  const row = await get('SELECT * FROM curricula WHERE id = $1', [params.id]);
  if (!row || row.owner !== user.id) return send(res, 404, { error: 'Curriculum not found.' });
  await run('DELETE FROM curricula WHERE id = $1', [params.id]);
  send(res, 200, { ok: true });
});

// ---------------- reports ----------------
route('GET', '/api/reports/catalog', async (req, res) => {
  const user = await requireAuth(req, res);
  if (!user) return;
  send(res, 200, { reports: REPORT_CATALOG[user.role] || [] });
});

route('GET', '/api/reports', async (req, res) => {
  const user = await requireAuth(req, res);
  if (!user) return;
  const data = await all('SELECT id, role, type, title, filters, format, filename, size, created_at FROM reports WHERE owner = $1 ORDER BY created_at DESC LIMIT 50', [user.id]);
  send(res, 200, { data: data.map((r) => ({ ...r, filters: typeof r.filters === 'string' ? JSON.parse(r.filters) : r.filters })) });
});

route('POST', '/api/reports/generate', async (req, res, _p, body) => {
  const user = await requireAuth(req, res);
  if (!user) return;
  try {
    const out = await generateReport(user, String(body.type || ''), body.filters || {}, String(body.format || 'pdf').toLowerCase());
    send(res, 201, { ...out, downloadUrl: `/api/reports/${out.id}/download` });
  } catch (e) {
    send(res, e.status || 500, { error: e.message || 'Report generation failed.', code: e.code });
  }
});

route('GET', '/api/reports/:id/download', async (req, res, params) => {
  const user = await requireAuth(req, res);
  if (!user) return;
  const rep = await getReport(params.id);
  if (!rep || rep.owner !== user.id) return send(res, 404, { error: 'Report not found.' });
  const fp = reportPath(rep.id, rep.format);
  if (!fs.existsSync(fp)) return send(res, 404, { error: 'Report file is no longer available. Please regenerate.' });
  const stat = fs.statSync(fp);
  res.writeHead(200, {
    'Content-Type': mimeFor(rep.format),
    'Content-Length': stat.size,
    'Content-Disposition': `attachment; filename="${rep.filename}"`,
    'Cache-Control': 'no-store',
  });
  fs.createReadStream(fp).pipe(res);
});

// ---------------- stats ----------------
route('GET', '/api/stats/:role', async (req, res, params) => {
  const user = await requireAuth(req, res);
  if (!user) return;
  if (params.role !== user.role) return send(res, 403, { error: 'Access restricted.' });
  const map = {
    government: await governmentStats(user),
    trainingCentre: await trainingCentreStats(user),
    employer: await employerStats(user),
    candidate: await candidateStats(user),
  };
  send(res, 200, map[params.role] || {});
});

// ---------------- server ----------------
// All API routes are registered above via route(). Express handles transport,
// CORS and preflight; the handler below only does routing + bodies.
app.use(async (req, res) => {
  const url = new URL(
    req.url,
    `http://${req.headers.host || 'localhost'}`
  );

  const found = matchRoute(req.method, url.pathname);

  if (!found) {
    send(res, 404, { error: 'Unknown endpoint.' });
    return;
  }

  let body = {};

  if (['POST', 'PUT', 'PATCH'].includes(req.method)) {
    try {
      body = await readBody(req);
    } catch (e) {
      send(res, e.status || 400, {
        error: e.message
      });
      return;
    }
  }

  try {
    await found.handler(
      req,
      res,
      found.params,
      body,
      url.searchParams
    );
  } catch (e) {
    console.error('API error:', e);

    if (!res.writableEnded) {
      send(res, 500, {
        error: 'Internal server error.'
      });
    }
  }
});

app.listen(config.port, config.host, () => {
  console.log(
    `KAUSHALSETU API listening on ${config.host}:${config.port} ` +
    `(PostgreSQL, AI: ${config.aiProvider}, ` +
    `Google: ${googleConfigured() ? 'configured' : 'not configured'})`
  );
});