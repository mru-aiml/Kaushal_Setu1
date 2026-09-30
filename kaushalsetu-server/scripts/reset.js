// DANGER: development-only database reset. Drops ALL tables and re-runs
// migrations from scratch. Requires CONFIRM=RESET to run.
// Usage: CONFIRM=RESET npm run db:reset
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { pool, closePool } from '../src/db/pg.js';

async function main() {
  if (process.env.CONFIRM !== 'RESET') {
    console.error('Refusing to reset: set CONFIRM=RESET to confirm (development only).');
    process.exit(1);
  }
  console.log('Dropping all KaushalSetu tables...');
  await pool.query(`DO $$ DECLARE r RECORD;
    BEGIN
      FOR r IN (SELECT tablename FROM pg_tables WHERE schemaname = 'public') LOOP
        EXECUTE 'DROP TABLE IF EXISTS ' || quote_ident(r.tablename) || ' CASCADE';
      END LOOP;
    END $$;`);
  const dir = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'migrations');
  const files = fs.readdirSync(dir).filter((f) => f.endsWith('.sql')).sort();
  for (const f of files) {
    if (f.startsWith('003_')) continue;
    console.log(`apply ${f} ...`);
    await pool.query(fs.readFileSync(path.join(dir, f), 'utf8'));
    await pool.query('INSERT INTO schema_migrations (filename) VALUES ($1) ON CONFLICT DO NOTHING', [f]);
  }
  console.log('Reset complete. Run `npm run db:seed` to repopulate demo data.');
  await closePool();
}

main().catch(async (e) => {
  console.error('Reset failed:', e.message);
  await closePool();
  process.exit(1);
});
