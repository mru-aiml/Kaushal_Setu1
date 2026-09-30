// RBAC helpers. Every protected endpoint resolves the user from the Bearer
// token and checks role server-side. The client-supplied role is never used.
import { userFromToken } from './auth.js';

export function send(res, status, body, headers = {}) {
  const payload = JSON.stringify(body);
  res.writeHead(status, { 'Content-Type': 'application/json', ...headers });
  res.end(payload);
}

export function bearer(req) {
  const h = req.headers.authorization || '';
  const m = h.match(/^Bearer\s+(.+)$/i);
  return m ? m[1].trim() : null;
}

// Attaches req.user or ends the request with 401. Returns user or null.
export async function requireAuth(req, res) {
  const user = await userFromToken(bearer(req));
  if (!user) {
    send(res, 401, { error: 'Not authenticated. Please sign in.' });
    return null;
  }
  req.user = user;
  return user;
}

// requireAuth + role membership, else 403. Returns user or null.
export async function requireRole(req, res, ...roles) {
  const user = await requireAuth(req, res);
  if (!user) return null;
  if (!roles.includes(user.role)) {
    send(res, 403, { error: `Access restricted. This resource requires the ${roles.join(' / ')} role.` });
    return null;
  }
  req.user = user;
  return user;
}
