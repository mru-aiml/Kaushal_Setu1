-- 004_equipment_validations.sql — centre equipment + employer skill validations.

CREATE TABLE IF NOT EXISTS equipment (
  id TEXT PRIMARY KEY, owner TEXT NOT NULL,
  name TEXT, category TEXT, required INTEGER, available INTEGER,
  utilization INTEGER, condition TEXT, priority TEXT,
  is_demo BOOLEAN NOT NULL DEFAULT FALSE, created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS skill_validations (
  id TEXT PRIMARY KEY, owner TEXT NOT NULL,
  skill TEXT, job_title TEXT, status TEXT, validated_on TEXT, notes TEXT,
  is_demo BOOLEAN NOT NULL DEFAULT FALSE, created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_equipment_owner ON equipment(owner);
CREATE INDEX IF NOT EXISTS idx_skill_validations_owner ON skill_validations(owner);
