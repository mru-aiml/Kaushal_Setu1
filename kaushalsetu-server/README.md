# KAUSHALSETU backend API (Phase 3)

Zero-dependency Node.js HTTP server (`node:http`) + **PostgreSQL** (`pg` pool, parameterized queries) + `xlsx` for spreadsheet import/export.

## 1. Requirements

- Node.js 20+
- PostgreSQL 16+ — via Docker (recommended) or a local install
- npm

## 2. PostgreSQL / Docker setup

`docker-compose.yml` ships a Postgres 16 service with a healthcheck:

```bash
docker compose up -d postgres   # start
docker compose down             # stop
```

This environment runs a local PostgreSQL service on `localhost:5432` with superuser `postgres` / `postgres` (development only). Ensure a `kaushalsetu` database exists:

```sql
CREATE DATABASE kaushalsetu;
```

## 3. Environment variables

Copy `.env.example` to `.env` (never commit `.env`):

| Variable | Purpose |
|---|---|
| `DATABASE_URL` | Full connection string (preferred), e.g. `postgresql://postgres:postgres@localhost:5432/kaushalsetu` |
| `DB_HOST/DB_PORT/DB_NAME/DB_USER/DB_PASSWORD` | Used only when `DATABASE_URL` is unset |
| `SQLITE_PATH` | Legacy SQLite file — read-only source for `db:migrate:sqlite` |
| `PORT`, `BACKEND_URL`, `FRONTEND_URL`, `CORS_ORIGINS` | Server + CORS |
| `GOOGLE_CLIENT_ID/SECRET` | Google OAuth (optional; sign-in disabled with a clear 503 when unset) |
| `AI_PROVIDER/BASE_URL/API_KEY/MODEL` | Backend-only LLM gateway (`none` = honest 503) |
| `DATA_DIR`, `MAX_UPLOAD_BYTES`, `SESSION_DAYS` | Storage, uploads, sessions |

## 4. Database migration

```bash
npm run db:migrate          # apply migrations/ in order (tracked, idempotent)
```

## 5. Database seed

```bash
npm run db:seed              # full interconnected demo dataset (idempotent)
npm run db:seed -- --force   # clear seed rows and reseed
```

Seed: 24 skills, 10 districts, 16 job postings, 18 courses, 18 trainers, 8 centres, 24 candidates with outcomes, equipment, validations, 4 demo accounts — all `owner='seed'`, `is_demo=TRUE`.

## 6. Starting backend

```bash
npm start        # node src/index.js → http://localhost:4000
npm run dev      # watch mode
```

## 7. Starting frontend

```bash
cd ../kaushalsetu-react
npm install
npm run dev      # http://localhost:5173 (needs VITE_API_BASE_URL=http://localhost:4000 in .env)
```

## 8. Running tests

```bash
npm test   # 14 end-to-end tests vs isolated kaushalsetu_test database
```

Covers: connection, migrations, seed, signup/login, role locking, RBAC denials, profile CRUD, entity CRUD (incl. equipment/validations), cross-role reads, import + error rows, resume extraction, PDF/CSV/XLSX downloads, AI 503 + stubbed provider round-trip, demo isolation, report generation, unauthorized access.

## 9. Resetting development database

```bash
CONFIRM=RESET npm run db:reset   # DESTRUCTIVE, dev-only: drops everything, re-migrates
npm run db:seed                  # repopulate demo data
```

## 10. Migrating legacy SQLite data

```bash
npm run db:migrate:sqlite        # idempotent (ON CONFLICT DO NOTHING), reports inserted/skipped/errors
```

The SQLite file is preserved as the migration source; PostgreSQL is the source of truth.

## 11. AI configuration

`AI_PROVIDER=none` (default) → 503 `"AI recommendations are currently unavailable..."`.
`AI_PROVIDER=openai-compatible` + `AI_BASE_URL` + `AI_API_KEY` + `AI_MODEL` → real LLM calls (Groq, NVIDIA NIM, OpenRouter, Ollama). Strict JSON extraction + shape validation; malformed/timeout → 502, never fake output.

## 12. Google OAuth configuration

Create a Web OAuth client at https://console.cloud.google.com/apis/credentials, set authorized redirect URI to `${BACKEND_URL}/api/auth/google/callback`, put ID + secret in `.env`. New Google users → onboarding; existing → straight to dashboard.

## 13. Demo login credentials

Password for all: `Demo@1234`

| Email | Role |
|---|---|
| `demo.govt@kaushalsetu.in` | Government |
| `demo.tc@kaushalsetu.in` | Training Centre |
| `demo.emp@kaushalsetu.in` | Employer |
| `demo.cand@kaushalsetu.in` | Candidate |

Demo sessions from `/demo` are ephemeral and sandboxed (`demo_*` owners excluded from shared aggregates).

## 14. Route list (API)

AUTH `POST /api/auth/signup|signin|logout`, `GET /api/auth/google/url`, `GET /api/auth/google/callback`, `POST /api/auth/google/consume`, `POST /api/demo/session` · ME `GET|PUT /api/me`, `GET /api/profile-schema`, `GET|PUT /api/me/profile`, `GET /api/me/resume` · DATA `GET /api/entities`, `GET|POST /api/data/:entity`, `PUT|DELETE /api/data/:entity/:id`, `GET /api/data/:entity/export` · IMPORT `POST /api/import/parse|commit|resume` · AI `POST /api/ai/career-recommendations|curriculum`, `GET .../latest`, `GET /api/ai/status` · CURRICULA `GET|POST /api/curricula`, `PUT|DELETE /api/curricula/:id` · REPORTS `GET /api/reports/catalog`, `GET /api/reports`, `POST /api/reports/generate`, `GET /api/reports/:id/download` · STATS `GET /api/stats/:role` · HEALTH `GET /api/health` (server + database status, engine, timestamp).

## 15. Architecture summary

`src/index.js` (router) → `rbac.js` (auth + role, server-side) → `entities.js` (ownership rules) → `src/db/pg.js` (pool, parameterized) → PostgreSQL. AI via `ai.js` gateway; files via `reports.js` + `pdf.js`; seed via `scripts/seed.js`; schema via `migrations/`.

## How data flows through KaushalSetu

```
User
  → Frontend (role workspace, guards)
  → API (auth + RBAC + validation)
  → PostgreSQL (source of truth)
  → Analytics / AI gateway / report engine
  → Dashboard / dedicated pages / downloads
```
