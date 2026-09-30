// Shared backend origin for the whole frontend (Phase 2A).
// Accepts BOTH of these .env forms and normalizes to the bare origin:
//   VITE_API_BASE_URL=http://localhost:4000
//   VITE_API_BASE_URL=http://localhost:4000/api
// API paths in code always start with `/api/...`, so a trailing `/api` in the
// env value is stripped to avoid `/api/api/...` 404s.
// Leaf module — no imports (avoids auth/api circular dependency).

const raw = (import.meta.env.VITE_API_BASE_URL || '').trim().replace(/\/+$/, '');

export const API_BASE = raw.replace(/\/api$/i, '');

export const apiAvailable = () => API_BASE.length > 0;
