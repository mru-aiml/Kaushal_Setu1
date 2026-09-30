// Migrate legacy SQLite data into PostgreSQL (Goal 1.5).
// Idempotent: INSERT ... ON CONFLICT (id) DO NOTHING — safe to re-run.
// Usage: npm run db:migrate:sqlite
import fs from 'node:fs';
import { DatabaseSync } from 'node:sqlite';
import { pool, closePool } from '../src/db/pg.js';

const SQLITE_PATH = process.env.SQLITE_PATH || './data/kaushalsetu.sqlite';

const TABLES = [
  'users', 'sessions', 'oauth_grants', 'profiles',
  'skill_demand', 'district_stats', 'training_centres', 'programmes',
  'employment_outcomes', 'employer_demands', 'courses', 'batches', 'trainers',
  'enrolments', 'placements', 'jobs', 'candidate_skills', 'education',
  'certifications', 'experience', 'applications', 'training_history',
  'career_recommendations', 'curricula', 'reports',
];

const CONFLICT_COL = { sessions: 'token', oauth_grants: 'code', profiles: 'user_id' };

const norm = (v) => {
  if (v === undefined) return null;
  if (typeof v === 'number' && (v === 0 || v === 1)) return v; // keep; pg coerces to boolean
  return v;
};

function pgValue(col, v) {
  if (v === null || v === undefined) return null;
  if (col === 'is_demo' || col === 'onboarded' || col === 'consumed') return !!v;
  return v;
}

async function main() {
  if (!fs.existsSync(SQLITE_PATH)) {
    console.log(`No SQLite file at ${SQLITE_PATH} — nothing to migrate.`);
    await closePool();
    return;
  }
  const lite = new DatabaseSync(SQLITE_PATH);
  let totalIn = 0;
  let totalSkip = 0;
  const errors = [];
  for (const table of TABLES) {
    let exists = true;
    try {
      lite.prepare(`SELECT 1 FROM ${table} LIMIT 1`).get();
    } catch {
      exists = false;
    }
    if (!exists) {
      console.log(`skip  ${table} (absent in SQLite)`);
      continue;
    }
    const rows = lite.prepare(`SELECT * FROM ${table}`).all();
    let inserted = 0;
    let skipped = 0;
    for (const row of rows) {
      const cols = Object.keys(row);
      const vals = cols.map((c) => pgValue(c, row[c]));
      const placeholders = cols.map((_, i) => `$${i + 1}`).join(', ');
      const conflict = CONFLICT_COL[table] || 'id';
      try {
        const r = await pool.query(
          `INSERT INTO ${table} (${cols.join(', ')}) VALUES (${placeholders}) ON CONFLICT (${conflict}) DO NOTHING`,
          vals
        );
        if (r.rowCount > 0) inserted++;
        else skipped++;
      } catch (e) {
        errors.push(`${table}/${row.id}: ${e.message}`);
      }
    }
    totalIn += inserted;
    totalSkip += skipped;
    console.log(`table ${table}: ${rows.length} sqlite rows → ${inserted} inserted, ${skipped} already present`);
  }
  lite.close();
  console.log(`\nTOTAL: ${totalIn} inserted, ${totalSkip} skipped (already migrated).`);
  if (errors.length) {
    console.log(`ERRORS (${errors.length}):`);
    errors.slice(0, 20).forEach((e) => console.log(' -', e));
  }
  await closePool();
  if (errors.length) process.exit(1);
}

main().catch(async (e) => {
  console.error('SQLite migration failed:', e.message);
  await closePool();
  process.exit(1);
});
