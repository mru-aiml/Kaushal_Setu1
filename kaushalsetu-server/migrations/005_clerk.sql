-- 005_clerk.sql — Clerk identity linkage (additive; existing auth untouched).
ALTER TABLE users ADD COLUMN IF NOT EXISTS clerk_id TEXT UNIQUE;
