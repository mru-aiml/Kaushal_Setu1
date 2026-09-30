// PostgreSQL data-access layer (Phase 3 / Goal 1).
// Single Pool for the whole backend. All queries are parameterized.
// Consumers use all()/get()/run() — never raw string interpolation.
import pg from 'pg';
import { config } from '../config.js';

const { Pool } = pg;

function connectionString() {
  if (process.env.DATABASE_URL) return process.env.DATABASE_URL;
  const host = process.env.DB_HOST || 'localhost';
  const port = process.env.DB_PORT || '5432';
  const name = process.env.DB_NAME || 'kaushalsetu';
  const user = process.env.DB_USER || 'postgres';
  const pass = process.env.DB_PASSWORD || 'postgres';
  return `postgresql://${encodeURIComponent(user)}:${encodeURIComponent(pass)}@${host}:${port}/${name}`;
}

export const pool = new Pool({
  connectionString: connectionString(),
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 8000,
});

pool.on('error', (err) => {
  // eslint-disable-next-line no-console
  console.error('Postgres pool error:', err.message);
});

export async function query(text, params = []) {
  return pool.query(text, params);
}

export async function all(text, params = []) {
  const r = await pool.query(text, params);
  return r.rows;
}

export async function get(text, params = []) {
  const r = await pool.query(text, params);
  return r.rows[0] || null;
}

export async function run(text, params = []) {
  const r = await pool.query(text, params);
  return { changes: r.rowCount };
}

export async function ping() {
  const r = await pool.query('SELECT 1 AS ok');
  return r.rows[0]?.ok === 1;
}

export async function closePool() {
  await pool.end();
}
