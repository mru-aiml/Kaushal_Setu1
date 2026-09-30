-- 002_indexes.sql — indexes for ownership scoping, lookups, and dashboards.

CREATE INDEX IF NOT EXISTS idx_sessions_user      ON sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_expires   ON sessions(expires_at);
CREATE INDEX IF NOT EXISTS idx_users_email        ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role         ON users(role);

CREATE INDEX IF NOT EXISTS idx_skill_demand_owner    ON skill_demand(owner);
CREATE INDEX IF NOT EXISTS idx_skill_demand_district ON skill_demand(district);
CREATE INDEX IF NOT EXISTS idx_skill_demand_sector   ON skill_demand(sector);

CREATE INDEX IF NOT EXISTS idx_district_stats_owner    ON district_stats(owner);
CREATE INDEX IF NOT EXISTS idx_district_stats_district ON district_stats(district);

CREATE INDEX IF NOT EXISTS idx_training_centres_owner   ON training_centres(owner);
CREATE INDEX IF NOT EXISTS idx_training_centres_district ON training_centres(district);

CREATE INDEX IF NOT EXISTS idx_programmes_owner ON programmes(owner);
CREATE INDEX IF NOT EXISTS idx_employment_outcomes_owner   ON employment_outcomes(owner);
CREATE INDEX IF NOT EXISTS idx_employment_outcomes_district ON employment_outcomes(district);
CREATE INDEX IF NOT EXISTS idx_employer_demands_owner ON employer_demands(owner);

CREATE INDEX IF NOT EXISTS idx_courses_owner  ON courses(owner);
CREATE INDEX IF NOT EXISTS idx_courses_status ON courses(status);
CREATE INDEX IF NOT EXISTS idx_batches_owner  ON batches(owner);
CREATE INDEX IF NOT EXISTS idx_trainers_owner ON trainers(owner);
CREATE INDEX IF NOT EXISTS idx_enrolments_owner ON enrolments(owner);
CREATE INDEX IF NOT EXISTS idx_enrolments_status ON enrolments(status);
CREATE INDEX IF NOT EXISTS idx_placements_owner ON placements(owner);

CREATE INDEX IF NOT EXISTS idx_jobs_owner  ON jobs(owner);
CREATE INDEX IF NOT EXISTS idx_jobs_status ON jobs(status);
CREATE INDEX IF NOT EXISTS idx_jobs_role   ON jobs(role);

CREATE INDEX IF NOT EXISTS idx_candidate_skills_owner ON candidate_skills(owner);
CREATE INDEX IF NOT EXISTS idx_education_owner        ON education(owner);
CREATE INDEX IF NOT EXISTS idx_certifications_owner   ON certifications(owner);
CREATE INDEX IF NOT EXISTS idx_experience_owner       ON experience(owner);
CREATE INDEX IF NOT EXISTS idx_applications_owner     ON applications(owner);
CREATE INDEX IF NOT EXISTS idx_training_history_owner ON training_history(owner);

CREATE INDEX IF NOT EXISTS idx_career_recs_owner ON career_recommendations(owner);
CREATE INDEX IF NOT EXISTS idx_curricula_owner   ON curricula(owner);
CREATE INDEX IF NOT EXISTS idx_reports_owner     ON reports(owner);
CREATE INDEX IF NOT EXISTS idx_reports_type      ON reports(type);
