// Tiny pure helpers (no database dependency).
export const now = () => new Date().toISOString();
export const uid = (p = 'id') => `${p}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`;
