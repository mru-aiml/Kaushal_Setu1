// Migration runner: applies migrations/*.sql in order, tracked in
// schema_migrations. Usage: npm run db:migrate
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { pool, closePool } from '../src/db/pg.js';

const dir = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'migrations');

async function main() {
  await pool.query(`CREATE TABLE IF NOT EXISTS schema_migrations (
    filename TEXT PRIMARY KEY, applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  )`);
  const applied = new Set(
    (await pool.query('SELECT filename FROM schema_migrations')).rows.map((r) => r.filename)
  );
  const files = fs.readdirSync(dir).filter((f) => f.endsWith('.sql')).sort();
  let n = 0;
  for (const f of files) {
    // Demo-data seed (003) is applied via db:seed, not db:migrate.
    if (f.startsWith('003_')) continue;
    if (applied.has(f)) {
      console.log(`skip  ${f} (already applied)`);
      continue;
    }
    const sql = fs.readFileSync(path.join(dir, f), 'utf8');
    console.log(`apply ${f} ...`);
    await pool.query(sql);
    await pool.query('INSERT INTO schema_migrations (filename) VALUES ($1)', [f]);
    console.log(`done  ${f}`);
    n++;
  }
  console.log(n === 0 ? 'Database is up to date.' : `Applied ${n} migration(s).`);
  await closePool();
}

main().catch(async (e) => {
  console.error('Migration failed:', e.message);
  await closePool();
  process.exit(1);
});
