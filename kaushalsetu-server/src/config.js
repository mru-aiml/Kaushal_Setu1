// Backend configuration — env only. No secrets are ever sent to the frontend.
import fs from 'node:fs';
import path from 'node:path';

// Minimal .env loader (no dependency).
const envPath = path.join(process.cwd(), '.env');
if (fs.existsSync(envPath)) {
  for (const line of fs.readFileSync(envPath, 'utf8').split('\n')) {
    const t = line.trim();
    if (!t || t.startsWith('#')) continue;
    const i = t.indexOf('=');
    if (i > 0) {
      const k = t.slice(0, i).trim();
      const v = t.slice(i + 1).trim();
      if (!(k in process.env)) process.env[k] = v;
    }
  }
}

const num = (v, d) => {
  const n = Number(v);
  return Number.isFinite(n) ? n : d;
};

export const config = {
  port: num(process.env.PORT, 4000),
  host: process.env.HOST || '0.0.0.0',
  backendUrl: (process.env.BACKEND_URL || 'https://kaushalsetu-backend-xyyv.onrender.com').replace(/\/$/, ''),
  frontendUrl: (process.env.FRONTEND_URL || 'https://kaushalsetu1.vercel.app').replace(/\/$/, ''),
  corsOrigins: (process.env.CORS_ORIGINS || "")
  .split(',')
  .map(s => s.trim().replace(/\/$/, ''))
  .filter(Boolean),
  sessionDays: num(process.env.SESSION_DAYS, 30),
  googleClientId: process.env.GOOGLE_CLIENT_ID || '',
  googleClientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
  aiProvider: process.env.AI_PROVIDER || 'none',
  aiBaseUrl: (process.env.AI_BASE_URL || '').replace(/\/$/, ''),
  aiApiKey: process.env.AI_API_KEY || '',
  aiModel: process.env.AI_MODEL || '',
  aiTimeoutMs: num(process.env.AI_TIMEOUT_MS, 60000),
  dataDir: process.env.DATA_DIR || './data',
  maxUploadBytes: num(process.env.MAX_UPLOAD_BYTES, 5 * 1024 * 1024),
};

export const googleConfigured = () => !!(config.googleClientId && config.googleClientSecret);
export const aiConfigured = () => config.aiProvider !== 'none' && !!config.aiApiKey && !!config.aiModel && !!config.aiBaseUrl;
