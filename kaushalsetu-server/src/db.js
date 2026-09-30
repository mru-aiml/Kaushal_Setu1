// SQLite persistence (node:sqlite, zero extra dependencies).
// One row = one record. Relationships via owner user id. `is_demo` flags seed rows.
import fs from 'node:fs';
import path from 'node:path';
import { DatabaseSync } from 'node:sqlite';
import { config } from './config.js';

fs.mkdirSync(config.dataDir, { recursive: true });
fs.mkdirSync(path.join(config.dataDir, 'reports'), { recursive: true });

export const db = new DatabaseSync(path.join(config.dataDir, 'kaushalsetu.sqlite'));

const ENTITY_TABLES = {
  skill_demand: `skill TEXT, sector TEXT, district TEXT, state TEXT, demand_index INTEGER, supply INTEGER, gap TEXT, trend TEXT, source TEXT`,
  district_stats: `district TEXT, state TEXT, metric TEXT, value REAL, year INTEGER`,
  training_centres: `name TEXT, centre_id TEXT, state TEXT, district TEXT, domains TEXT, capacity INTEGER, accreditation TEXT`,
  programmes: `name TEXT, sector TEXT, seats INTEGER, status TEXT, start_year INTEGER`,
  employment_outcomes: `district TEXT, trade TEXT, placed INTEGER, total INTEGER, year INTEGER`,
  employer_demands: `company TEXT, role TEXT, skills TEXT, openings INTEGER, location TEXT, status TEXT`,
  courses: `title TEXT, code TEXT, sector TEXT, duration_hours INTEGER, level TEXT, alignment INTEGER, status TEXT`,
  batches: `course TEXT, batch_code TEXT, seats INTEGER, enrolled INTEGER, start_date TEXT, status TEXT`,
  trainers: `name TEXT, trade TEXT, certification TEXT, score INTEGER, status TEXT`,
  enrolments: `student TEXT, course TEXT, batch_code TEXT, status TEXT, enrolled_on TEXT`,
  placements: `student TEXT, course TEXT, employer TEXT, salary INTEGER, placed_on TEXT`,
  jobs: `title TEXT, role TEXT, industry TEXT, skills TEXT, experience TEXT, location TEXT, salary_min INTEGER, salary_max INTEGER, openings INTEGER, status TEXT`,
  candidate_skills: `skill TEXT, proficiency TEXT, years REAL`,
  education: `level TEXT, degree TEXT, institute TEXT, year INTEGER`,
  certifications: `name TEXT, issuer TEXT, year INTEGER`,
  experience: `title TEXT, company TEXT, years REAL, description TEXT`,
  applications: `job_title TEXT, company TEXT, status TEXT, applied_on TEXT`,
  training_history: `course TEXT, provider TEXT, hours INTEGER, status TEXT, completed_on TEXT`,
};

export const ENTITY_NAMES = Object.keys(ENTITY_TABLES);

export function migrate() {
  db.exec(`CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY, email TEXT UNIQUE NOT NULL, name TEXT NOT NULL,
    password_hash TEXT, provider TEXT NOT NULL DEFAULT 'email',
    google_sub TEXT UNIQUE, role TEXT, onboarded INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL
  )`);
  db.exec(`CREATE TABLE IF NOT EXISTS sessions (
    token TEXT PRIMARY KEY, user_id TEXT NOT NULL, created_at TEXT NOT NULL, expires_at TEXT NOT NULL
  )`);
  db.exec(`CREATE TABLE IF NOT EXISTS oauth_grants (
    code TEXT PRIMARY KEY, user_id TEXT NOT NULL, created_at TEXT NOT NULL, expires_at TEXT NOT NULL, consumed INTEGER NOT NULL DEFAULT 0
  )`);
  db.exec(`CREATE TABLE IF NOT EXISTS profiles (
    user_id TEXT PRIMARY KEY, role TEXT NOT NULL, data TEXT NOT NULL DEFAULT '{}',
    photo TEXT, resume_name TEXT, resume TEXT, updated_at TEXT NOT NULL
  )`);
  for (const [name, cols] of Object.entries(ENTITY_TABLES)) {
    db.exec(`CREATE TABLE IF NOT EXISTS ${name} (
      id TEXT PRIMARY KEY, owner TEXT NOT NULL, ${cols},
      is_demo INTEGER NOT NULL DEFAULT 0, created_at TEXT NOT NULL
    )`);
  }
  db.exec(`CREATE TABLE IF NOT EXISTS career_recommendations (
    id TEXT PRIMARY KEY, owner TEXT NOT NULL, input TEXT NOT NULL, result TEXT NOT NULL,
    is_demo INTEGER NOT NULL DEFAULT 0, created_at TEXT NOT NULL
  )`);
  db.exec(`CREATE TABLE IF NOT EXISTS curricula (
    id TEXT PRIMARY KEY, owner TEXT NOT NULL, title TEXT NOT NULL, target_role TEXT,
    duration TEXT, data TEXT NOT NULL, status TEXT NOT NULL DEFAULT 'draft',
    is_demo INTEGER NOT NULL DEFAULT 0, created_at TEXT NOT NULL
  )`);
  db.exec(`CREATE TABLE IF NOT EXISTS reports (
    id TEXT PRIMARY KEY, owner TEXT NOT NULL, role TEXT NOT NULL, type TEXT NOT NULL,
    title TEXT NOT NULL, filters TEXT NOT NULL DEFAULT '{}', format TEXT NOT NULL,
    filename TEXT NOT NULL, size INTEGER NOT NULL DEFAULT 0, created_at TEXT NOT NULL
  )`);
}

export const now = () => new Date().toISOString();
export const uid = (p = 'id') => `${p}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`;
