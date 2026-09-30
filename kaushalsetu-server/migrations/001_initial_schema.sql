-- 001_initial_schema.sql — KaushalSetu core schema (PostgreSQL 16+).
-- Preserves every SQLite concept: users/sessions/grants, profiles, all entity
-- tables, recommendations, curricula, reports. Ownership + demo flags keep
-- the exact RBAC/isolation semantics. IDs stay TEXT (existing API contracts).

CREATE TABLE IF NOT EXISTS users (
  id            TEXT PRIMARY KEY,
  email         TEXT NOT NULL UNIQUE,
  name          TEXT NOT NULL,
  password_hash TEXT,
  provider      TEXT NOT NULL DEFAULT 'email',
  google_sub    TEXT UNIQUE,
  role          TEXT CHECK (role IS NULL OR role IN ('government','trainingCentre','employer','candidate')),
  onboarded     BOOLEAN NOT NULL DEFAULT FALSE,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS sessions (
  token      TEXT PRIMARY KEY,
  user_id    TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL
);

CREATE TABLE IF NOT EXISTS oauth_grants (
  code       TEXT PRIMARY KEY,
  user_id    TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL,
  consumed   BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE TABLE IF NOT EXISTS profiles (
  user_id     TEXT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  role        TEXT NOT NULL,
  data        JSONB NOT NULL DEFAULT '{}',
  photo       TEXT,
  resume_name TEXT,
  resume      TEXT,
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Generic entity tables: owner = users.id ('seed' for demo seed rows,
-- 'demo_*' for sandboxed demo sessions). is_demo flags seed rows.
CREATE TABLE IF NOT EXISTS skill_demand (
  id TEXT PRIMARY KEY, owner TEXT NOT NULL,
  skill TEXT, sector TEXT, district TEXT, state TEXT,
  demand_index INTEGER, supply INTEGER, gap TEXT, trend TEXT, source TEXT,
  is_demo BOOLEAN NOT NULL DEFAULT FALSE, created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS district_stats (
  id TEXT PRIMARY KEY, owner TEXT NOT NULL,
  district TEXT, state TEXT, metric TEXT, value DOUBLE PRECISION, year INTEGER,
  is_demo BOOLEAN NOT NULL DEFAULT FALSE, created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS training_centres (
  id TEXT PRIMARY KEY, owner TEXT NOT NULL,
  name TEXT, centre_id TEXT, state TEXT, district TEXT,
  domains TEXT, capacity INTEGER, accreditation TEXT,
  is_demo BOOLEAN NOT NULL DEFAULT FALSE, created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS programmes (
  id TEXT PRIMARY KEY, owner TEXT NOT NULL,
  name TEXT, sector TEXT, seats INTEGER, status TEXT, start_year INTEGER,
  is_demo BOOLEAN NOT NULL DEFAULT FALSE, created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS employment_outcomes (
  id TEXT PRIMARY KEY, owner TEXT NOT NULL,
  district TEXT, trade TEXT, placed INTEGER, total INTEGER, year INTEGER,
  is_demo BOOLEAN NOT NULL DEFAULT FALSE, created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS employer_demands (
  id TEXT PRIMARY KEY, owner TEXT NOT NULL,
  company TEXT, role TEXT, skills TEXT, openings INTEGER, location TEXT, status TEXT,
  is_demo BOOLEAN NOT NULL DEFAULT FALSE, created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS courses (
  id TEXT PRIMARY KEY, owner TEXT NOT NULL,
  title TEXT, code TEXT, sector TEXT, duration_hours INTEGER, level TEXT,
  alignment INTEGER, status TEXT,
  is_demo BOOLEAN NOT NULL DEFAULT FALSE, created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS batches (
  id TEXT PRIMARY KEY, owner TEXT NOT NULL,
  course TEXT, batch_code TEXT, seats INTEGER, enrolled INTEGER, start_date TEXT, status TEXT,
  is_demo BOOLEAN NOT NULL DEFAULT FALSE, created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS trainers (
  id TEXT PRIMARY KEY, owner TEXT NOT NULL,
  name TEXT, trade TEXT, certification TEXT, score INTEGER, status TEXT,
  is_demo BOOLEAN NOT NULL DEFAULT FALSE, created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS enrolments (
  id TEXT PRIMARY KEY, owner TEXT NOT NULL,
  student TEXT, course TEXT, batch_code TEXT, status TEXT, enrolled_on TEXT,
  is_demo BOOLEAN NOT NULL DEFAULT FALSE, created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS placements (
  id TEXT PRIMARY KEY, owner TEXT NOT NULL,
  student TEXT, course TEXT, employer TEXT, salary INTEGER, placed_on TEXT,
  is_demo BOOLEAN NOT NULL DEFAULT FALSE, created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS jobs (
  id TEXT PRIMARY KEY, owner TEXT NOT NULL,
  title TEXT, role TEXT, industry TEXT, skills TEXT, experience TEXT, location TEXT,
  salary_min INTEGER, salary_max INTEGER, openings INTEGER, status TEXT,
  is_demo BOOLEAN NOT NULL DEFAULT FALSE, created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS candidate_skills (
  id TEXT PRIMARY KEY, owner TEXT NOT NULL,
  skill TEXT, proficiency TEXT, years DOUBLE PRECISION,
  is_demo BOOLEAN NOT NULL DEFAULT FALSE, created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS education (
  id TEXT PRIMARY KEY, owner TEXT NOT NULL,
  level TEXT, degree TEXT, institute TEXT, year INTEGER,
  is_demo BOOLEAN NOT NULL DEFAULT FALSE, created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS certifications (
  id TEXT PRIMARY KEY, owner TEXT NOT NULL,
  name TEXT, issuer TEXT, year INTEGER,
  is_demo BOOLEAN NOT NULL DEFAULT FALSE, created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS experience (
  id TEXT PRIMARY KEY, owner TEXT NOT NULL,
  title TEXT, company TEXT, years DOUBLE PRECISION, description TEXT,
  is_demo BOOLEAN NOT NULL DEFAULT FALSE, created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS applications (
  id TEXT PRIMARY KEY, owner TEXT NOT NULL,
  job_title TEXT, company TEXT, status TEXT, applied_on TEXT,
  is_demo BOOLEAN NOT NULL DEFAULT FALSE, created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS training_history (
  id TEXT PRIMARY KEY, owner TEXT NOT NULL,
  course TEXT, provider TEXT, hours INTEGER, status TEXT, completed_on TEXT,
  is_demo BOOLEAN NOT NULL DEFAULT FALSE, created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS career_recommendations (
  id TEXT PRIMARY KEY, owner TEXT NOT NULL,
  input JSONB NOT NULL, result JSONB NOT NULL,
  is_demo BOOLEAN NOT NULL DEFAULT FALSE, created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS curricula (
  id TEXT PRIMARY KEY, owner TEXT NOT NULL,
  title TEXT NOT NULL, target_role TEXT, duration TEXT,
  data JSONB NOT NULL, status TEXT NOT NULL DEFAULT 'draft',
  is_demo BOOLEAN NOT NULL DEFAULT FALSE, created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS reports (
  id TEXT PRIMARY KEY, owner TEXT NOT NULL, role TEXT NOT NULL, type TEXT NOT NULL,
  title TEXT NOT NULL, filters JSONB NOT NULL DEFAULT '{}', format TEXT NOT NULL,
  filename TEXT NOT NULL, size INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Schema-migrations ledger (runner records applied files here).
CREATE TABLE IF NOT EXISTS schema_migrations (
  filename   TEXT PRIMARY KEY,
  applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
