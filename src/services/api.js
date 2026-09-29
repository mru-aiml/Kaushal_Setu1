// Centralized backend API client (Phase 2A).
// Base URL comes from VITE_API_BASE_URL. All auth state flows through
// authService (token storage) — components never touch tokens directly.

import { authService } from '../auth/authService';

export const API_BASE = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/$/, '');

export const apiAvailable = () => API_BASE.length > 0;

export class ApiError extends Error {
  constructor(status, data) {
    super(data?.error || `Request failed (HTTP ${status})`);
    this.status = status;
    this.code = data?.code;
    this.fields = data?.fields;
  }
}

async function request(method, path, { body, token } = {}) {
  if (!apiAvailable()) {
    throw new ApiError(0, { error: 'Backend API is not configured.', code: 'no_backend' });
  }
  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new ApiError(res.status, data);
  return data;
}

const authed = (method, path, opts = {}) => request(method, path, { ...opts, token: authService.getToken() });

export const api = {
  get: (path, opts) => authed('GET', path, opts),
  post: (path, body, opts) => authed('POST', path, { ...opts, body }),
  put: (path, body, opts) => authed('PUT', path, { ...opts, body }),
  del: (path, opts) => authed('DELETE', path, opts),
  anon: (method, path, body) => request(method, path, { body }),

  // Real file download (PDF/CSV/XLSX). Returns { filename, blob } — the
  // browser receives an actual generated file, never a placeholder.
  async download(path, fallbackName = 'download') {
    if (!apiAvailable()) throw new ApiError(0, { error: 'Backend API is not configured.', code: 'no_backend' });
    const res = await fetch(`${API_BASE}${path}`, {
      headers: { Authorization: `Bearer ${authService.getToken()}` },
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new ApiError(res.status, data);
    }
    const blob = await res.blob();
    const disp = res.headers.get('content-disposition') || '';
    const m = disp.match(/filename="([^"]+)"/);
    return { filename: m ? m[1] : fallbackName, blob };
  },
};

export function saveBlob({ filename, blob }) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 3000);
}
