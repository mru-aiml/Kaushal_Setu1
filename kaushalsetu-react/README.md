# KAUSHALSETU (React + Vite) — Phase 3

**KAUSHALSETU — Labour-Market Intelligence & Curriculum Alignment Platform.**

> PostgreSQL is the source of truth. Backend: `../kaushalsetu-server` (see its README for DB setup, migrations, seed, AI/Google config).

## Product flow

```
Public website (/) → Login / Signup → Onboarding (role, once) → Role workspace
```

## Two modes

| | Backend mode | Local mode |
|---|---|---|
| Trigger | `VITE_API_BASE_URL` set + server reachable | No backend |
| Accounts | Real DB accounts (scrypt passwords, token sessions) | Browser-only demo accounts (labeled in UI) |
| Google | Real OAuth code flow (needs server Google credentials) | Disabled with explanation |
| Profiles/Data/AI/Reports | Fully functional | Unavailable states with guidance |

Auth mode is probed at startup (`/api/health`) and shown in the UI — nothing is faked.

## Running the full stack

```bash
# Database (PostgreSQL 16+)
cd ../kaushalsetu-server
docker compose up -d postgres   # if Docker is available; otherwise use a local Postgres on :5432

# Backend
npm install
npm run db:migrate               # schema
npm run db:seed                  # demo dataset (all four roles)
npm start                        # :4000

# Frontend (VITE_API_BASE_URL=http://localhost:4000 in .env)
npm install
npm run dev      # http://localhost:5173
npm run build
```

## What's real (Phase 3)
- **Auth**: email/password accounts in PostgreSQL; Google OAuth code flow (env-gated); role stored on the user row, locked server-side; new Google users → onboarding, existing → straight to dashboard.
- **Profiles** (all four `/profile` routes): role-specific schemas from the backend, edit/save/cancel, server validation, photo/logo + resume upload, completion %, persisted in PostgreSQL.
- **Data** (`*/data`): per-role datasets with add/edit/delete, search, pagination, CSV+XLSX import (preview → column mapping → confirm → valid/invalid counts with error rows), real CSV/XLSX export of stored rows.
- **Resume import**: backend PDF text extraction + rules-based field suggestions (labeled as such) that pre-fill the candidate profile.
- **AI**: backend gateway (OpenAI-compatible). Structured JSON only; 503 with a clear message when unconfigured — never fake output. Curricula editable, saved, listed, deleted, exported as PDF.
- **Reports**: role catalogs, filters, real PDF/CSV/XLSX downloads of stored rows, history with re-download. "Demonstration data" stamped only when rows are actually seed rows.
- **Dashboards + dedicated pages**: every sidebar item is a real route serving PostgreSQL data (KPIs, filters, tables, charts, actions). Dashboards stay overviews.

## Workspace routes (every sidebar item = a real page)

- Government: `/government`, `/districts`, `/signals`, `/skill-gaps`, `/curriculum`, `/training-capacity`, `/employer-validation`, `/training-centres`, `/employment-outcomes`, `/programme-impact`, `/training-plans`, `/reports`, `/data`, `/profile` (all under `/government/*`, legacy aliases kept)
- Training Centre: `/training-centre`, `/demand`, `/course-alignment`, `/capacity`, `/trainer-readiness`, `/infrastructure`, `/skill-gaps`, `/training-plans`, `/data`, `/profile`
- Employer: `/employer`, `/industry-demand`, `/requirements`, `/skill-validation`, `/emerging-skills`, `/submit-requirement`, `/hiring-signals`, `/data`, `/profile`
- Candidate: `/candidate`, `/profile`, `/skills`, `/skill-gap`, `/career-navigator`, `/recommended-courses`, `/career-path`, `/opportunities`, `/data`

Demo accounts (password `Demo@1234`): `demo.govt@`, `demo.tc@`, `demo.emp@`, `demo.cand@kaushalsetu.in`.

## Environment variables (frontend `.env`)

| Variable | Purpose |
|---|---|
| `VITE_API_BASE_URL` | Backend API, e.g. `http://localhost:4000` |
| `VITE_AUTH_PROVIDER` | `local` (Phase 2A) / `clerk` (future) |
| `VITE_CLERK_PUBLISHABLE_KEY` | Future Clerk mode only |

Backend secrets (`AI_API_KEY`, `GOOGLE_CLIENT_SECRET`, …) live in the server `.env` — never in `VITE_*`.

## Deploying to Vercel (production)

1. Push the repo; in Vercel import `kaushalsetu-react/` as the project (framework preset **Vite**, build `npm run build`, output `dist/`).
2. `vercel.json` (in this folder) rewrites every route to `/index.html` so React Router deep-links work.
3. Set exactly one environment variable: `VITE_API_BASE_URL=https://<your-service>.onrender.com` — then **redeploy** (Vite inlines it at build time).
4. In the backend's Render env, set `FRONTEND_URL` + `CORS_ORIGINS` to the Vercel URL or the app will be blocked by CORS.

All API calls, report downloads, profiles, data management, AI screens and dashboards go through `VITE_API_BASE_URL` — nothing is hardcoded.

## Backend endpoints (summary)

AUTH `POST /api/auth/signup|signin|logout`, `GET /api/auth/google/url`, `GET /api/auth/google/callback`, `POST /api/auth/google/consume`, `POST /api/demo/session` · ME `GET|PUT /api/me`, `GET|PUT /api/me/profile`, `GET /api/me/resume`, `GET /api/profile-schema` · DATA `GET /api/entities`, `GET|POST /api/data/:entity`, `PUT|DELETE /api/data/:entity/:id`, `GET /api/data/:entity/export` · IMPORT `POST /api/import/parse|commit|resume` · AI `POST /api/ai/career-recommendations|curriculum`, `GET .../latest`, `GET /api/ai/status` · CURRICULA `GET|POST /api/curricula`, `PUT|DELETE /api/curricula/:id` · REPORTS `GET /api/reports/catalog`, `GET /api/reports`, `POST /api/reports/generate`, `GET /api/reports/:id/download` · STATS `GET /api/stats/:role`.

Every protected endpoint enforces authentication + role + ownership server-side (`npm test` in `kaushalsetu-server` covers 14 scenarios incl. RBAC denials and demo isolation).

## Current limitations

- In-DB photo/resume blobs (fine for pilot; move to object storage for scale).
- No rate limiting / audit log yet.
- Google OAuth + AI need real credentials (documented in server `.env.example`).

