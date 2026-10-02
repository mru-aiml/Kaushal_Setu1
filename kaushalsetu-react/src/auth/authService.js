// KAUSHALSETU — authentication service (Phase 2A).
//
// Two modes, one interface:
//  - backend mode (VITE_API_BASE_URL set + reachable): real accounts in the
//    backend database (scrypt-hashed passwords, token sessions, Google OAuth
//    code flow, role stored on the user row and locked server-side).
//  - local mode (no backend): demo-grade localStorage sessions (Phase 1
//    behavior), clearly labeled in the UI.
//
// Public interface (unchanged for UI code):
//   signUp / signIn / signInWithGoogle / assignRole / demoSignIn / signOut
//   getSession / getToken / onChange / refresh / consumeOAuthGrant
//   getMode / googleStatus / aiStatus
//
// SECURITY: role is assigned once (server-enforced). No public API changes a
// locked role. Secrets stay backend-only.

import { normalizeRole, ROLE_IDS } from '../data/roles';
import { API_BASE } from '../services/apiBase';

const SESSION_KEY = 'kaushalsetu.session.v1';
const USERS_KEY = 'kaushalsetu.accounts.v1';

const delay = (ms = 350) => new Promise((r) => setTimeout(r, ms));
const uid = () => `u_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;

// ---------- mode probing ----------
let modeCache = null; // 'backend' | 'local'
let modePromise = null;
let serverInfo = { googleConfigured: false, ai: { configured: false } };

function probeBackend() {
  if (!API_BASE) return Promise.resolve('local');
  if (modePromise) return modePromise;
  modePromise = fetch(`${API_BASE}/api/health`)
    .then((r) => {
      if (!r.ok) throw new Error('unhealthy');
      return r.json();
    })
    .then((h) => {
      serverInfo = { googleConfigured: !!h?.auth?.googleConfigured, ai: h?.ai || { configured: false } };
      modeCache = 'backend';
      return 'backend';
    })
    .catch(() => {
      modeCache = 'local';
      return 'local';
    });
  return modePromise;
}

export function getMode() {
  return modeCache || (API_BASE ? 'probing' : 'local');
}

// ---------- session store ----------
function readSession() {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function writeSession(session) {
  if (session) localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  else localStorage.removeItem(SESSION_KEY);
  emit();
}

const listeners = new Set();
function emit() {
  const s = readSession();
  listeners.forEach((fn) => {
    try {
      fn(s);
    } catch {
      /* ignore listener errors */
    }
  });
}

async function apiCall(method, path, { body, token } = {}) {
  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const err = new Error(data.error || `Request failed (HTTP ${res.status})`);
    err.status = res.status;
    err.code = data.code;
    err.fields = data.fields;
    throw err;
  }
  return data;
}

// ---------- local fallback store (Phase 1 behavior) ----------
function readUsers() {
  try {
    return JSON.parse(localStorage.getItem(USERS_KEY) || '[]');
  } catch {
    return [];
  }
}
function writeUsers(users) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}
function stripLocal(record) {
  if (!record) return null;
  const { passwordHash, ...pub } = record;
  return pub;
}

export const authService = {
  ready: probeBackend(),
  getMode,
  serverInfo: () => serverInfo,

  getSession() {
    return readSession();
  },

  getToken() {
    return readSession()?.token || null;
  },

  onChange(fn) {
    listeners.add(fn);
    return () => listeners.delete(fn);
  },

  // Rehydrate from backend (existing-user lifecycle: role comes WITH the account).
  async refresh() {
    const s = readSession();
    if (!s?.token || s.mode !== 'backend') return s;
    try {
      const { user } = await apiCall('GET', '/api/me', { token: s.token });
      const next = { user: { ...user, demo: user.demo || user.provider === 'demo' }, token: s.token, mode: 'backend' };
      writeSession(next);
      return next;
    } catch {
      writeSession(null);
      return null;
    }
  },

  async signUp({ name, email, password }) {
    const mode = await probeBackend();
    if (mode === 'backend') {
      const { user, token } = await apiCall('POST', '/api/auth/signup', { body: { name, email, password } });
      const session = { user, token, mode: 'backend' };
      writeSession(session);
      return session;
    }
    await delay(450);
    const cleanEmail = String(email || '').trim().toLowerCase();
    const cleanName = String(name || '').trim();
    if (!cleanName) throw new Error('Please enter your full name.');
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(cleanEmail)) throw new Error('Please enter a valid email address.');
    if (!password || password.length < 6) throw new Error('Password must be at least 6 characters.');
    const users = readUsers();
    if (users.some((u) => u.email === cleanEmail)) {
      const err = new Error('An account with this email already exists. Please sign in.');
      err.code = 'account_exists';
      throw err;
    }
    const record = {
      id: uid(), name: cleanName, email: cleanEmail,
      passwordHash: `local:${password.length}:${cleanEmail}`,
      provider: 'email', role: null, onboarded: false, demo: false, createdAt: new Date().toISOString(),
    };
    users.push(record);
    writeUsers(users);
    const session = { user: stripLocal(record), mode: 'local' };
    writeSession(session);
    return session;
  },

  async signIn({ email, password }) {
    const mode = await probeBackend();
    if (mode === 'backend') {
      const { user, token } = await apiCall('POST', '/api/auth/signin', { body: { email, password } });
      const session = { user, token, mode: 'backend' };
      writeSession(session);
      return session;
    }
    await delay(450);
    const cleanEmail = String(email || '').trim().toLowerCase();
    const users = readUsers();
    const found = users.find((u) => u.email === cleanEmail);
    if (!found || found.provider !== 'email') {
      const err = new Error('No account found with this email. Please sign up first.');
      err.code = 'not_found';
      throw err;
    }
    if (found.passwordHash !== `local:${String(password || '').length}:${cleanEmail}`) {
      const err = new Error('Incorrect password. Please try again.');
      err.code = 'bad_credentials';
      throw err;
    }
    const session = { user: stripLocal(found), mode: 'local' };
    writeSession(session);
    return session;
  },

  // Backend mode: REAL Google OAuth (redirects to Google; new users land on
  // onboarding, existing users go straight to their dashboard via /auth/callback).
  // Local mode: Google is unavailable — the UI disables the button with a message.
  async signInWithGoogle() {
    const mode = await probeBackend();
    if (mode !== 'backend') {
      const err = new Error('Google sign-in needs the backend API. Start the KaushalSetu server or use email sign-in.');
      err.code = 'google_unavailable';
      throw err;
    }
    const res = await fetch(`${API_BASE}/api/auth/google/url`);
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      const err = new Error(data.error || 'Google sign-in is not available.');
      err.code = data.code || 'google_unavailable';
      throw err;
    }
    window.location.href = data.url;
    return { redirect: true };
  },

  // Called by the /auth/callback page after Google redirects back.
  async consumeOAuthGrant(code) {
    const { user, token } = await apiCall('POST', '/api/auth/google/consume', { body: { code } });
    const session = { user, token, mode: 'backend' };
    writeSession(session);
    return session;
  },

  // Clerk exchange: verify the Clerk JWT server-side, receive a normal
  // backend session. Afterwards the app uses ONLY the backend token.
  async signInWithClerk(clerkJwt) {
    const mode = await probeBackend();
    if (mode !== 'backend') {
      const err = new Error('Clerk sign-in needs the backend API. Start the KaushalSetu server or use email sign-in.');
      err.code = 'clerk_unavailable';
      throw err;
    }
    const { user, token } = await apiCall('POST', '/api/auth/clerk', { body: { token: clerkJwt } });
    const session = { user, token, mode: 'backend' };
    writeSession(session);
    return session;
  },

  async assignRole(role) {
    if (!ROLE_IDS.includes(role)) throw new Error('Unknown role.');
    const session = readSession();
    if (!session?.user) throw new Error('Not signed in.');
    if (session.mode === 'backend') {
      const { user } = await apiCall('PUT', '/api/me', { body: { role }, token: session.token });
      const next = { user, token: session.token, mode: 'backend' };
      writeSession(next);
      return next;
    }
    await delay(250);
    if (session.user.demo) {
      const next = { user: { ...session.user, role }, mode: 'local' };
      writeSession(next);
      return next;
    }
    if (session.user.onboarded) {
      const err = new Error('Role is already assigned to this account.');
      err.code = 'role_locked';
      throw err;
    }
    const users = readUsers().map((u) => (u.id === session.user.id ? { ...u, role, onboarded: true } : u));
    writeUsers(users);
    const next = { user: { ...session.user, role, onboarded: true }, mode: 'local' };
    writeSession(next);
    return next;
  },

  async demoSignIn(role) {
    const r = normalizeRole(role);
    const mode = await probeBackend();
    if (mode === 'backend') {
      const { user, token } = await apiCall('POST', '/api/demo/session', { body: { role: r } });
      const session = { user: { ...user, demo: true }, token, mode: 'backend' };
      writeSession(session);
      return session;
    }
    await delay(300);
    const session = {
      user: {
        id: `demo_${r}`, name: `Demo ${r === 'trainingCentre' ? 'Training Centre' : r[0].toUpperCase() + r.slice(1)}`,
        email: `demo.${r}@kaushalsetu.in`, provider: 'demo', role: r,
        onboarded: true, demo: true, createdAt: new Date().toISOString(),
      },
      mode: 'local',
    };
    writeSession(session);
    return session;
  },

  async signOut() {
    const s = readSession();
    if (s?.token && s.mode === 'backend') {
      try {
        await apiCall('POST', '/api/auth/logout', { token: s.token });
      } catch {
        /* session already invalid — clear locally anyway */
      }
    }
    writeSession(null);
  },
};
