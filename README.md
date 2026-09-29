# KAUSHALSETU (React + Vite) — Phase 2A

**KAUSHALSETU — Labour-Market Intelligence & Curriculum Alignment Platform.**

> Backend API + database are live in Phase 2A. **Production hardening (hosted DB, object storage, rate limiting) is planned for Phase 2B.**

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
# Backend
cd ../kaushalsetu-server && npm install && npm start   # :4000

# Frontend (VITE_API_BASE_URL=http://localhost:4000 in .env)
npm install
npm run dev      # http://localhost:5173
npm run build
```

## What's real in Phase 2A

- **Auth**: email/password accounts in SQLite; Google OAuth code flow (env-gated); role stored on the user row, locked server-side; new Google users → onboarding, existing → straight to dashboard.
- **Profiles** (`/government|/training-centre|/employer|/candidate/profile`): role-specific schemas from the backend, edit/save/cancel, server validation, photo/logo + resume upload, completion %, persisted in DB.
- **Data** (`*/data`): per-role datasets with add/edit/delete, search, pagination, CSV+XLSX import (preview → column mapping → confirm → valid/invalid counts with error rows), real CSV/XLSX export of stored rows.
- **Resume import**: backend PDF text extraction + rules-based field suggestions (labeled as such) that pre-fill the candidate profile.
- **AI**: `POST /api/ai/career-recommendations` and `/api/ai/curriculum` go through the backend AI gateway (OpenAI-compatible: Groq/NVIDIA/OpenRouter/Ollama). Structured JSON only; 503 with a clear message when unconfigured — never fake output. Curricula can be edited, saved, listed, deleted, and exported as PDF.
- **Reports**: role catalogs, filters, real PDF (built-in writer) / CSV / XLSX downloads of stored rows, history with re-download. "Demonstration data" stamped only when rows are actually seed rows.
- **Dashboards**: KPIs switch to live aggregates with LIVE/DEMONSTRATION-DATA chips and explicit empty states ("No data available yet").

## Environment variables (frontend `.env`)

| Variable | Purpose |
|---|---|
| `VITE_API_BASE_URL` | Backend API, e.g. `http://localhost:4000` |
| `VITE_AUTH_PROVIDER` | `local` (Phase 2A) / `clerk` (future) |
| `VITE_CLERK_PUBLISHABLE_KEY` | Future Clerk mode only |

Backend secrets (`AI_API_KEY`, `GOOGLE_CLIENT_SECRET`, …) live in the server `.env` — never in `VITE_*`.

## Backend endpoints (summary)

AUTH `POST /api/auth/signup|signin|logout`, `GET /api/auth/google/url`, `GET /api/auth/google/callback`, `POST /api/auth/google/consume`, `POST /api/demo/session` · ME `GET|PUT /api/me`, `GET|PUT /api/me/profile`, `GET /api/me/resume`, `GET /api/profile-schema` · DATA `GET /api/entities`, `GET|POST /api/data/:entity`, `PUT|DELETE /api/data/:entity/:id`, `GET /api/data/:entity/export` · IMPORT `POST /api/import/parse|commit|resume` · AI `POST /api/ai/career-recommendations|curriculum`, `GET .../latest`, `GET /api/ai/status` · CURRICULA `GET|POST /api/curricula`, `PUT|DELETE /api/curricula/:id` · REPORTS `GET /api/reports/catalog`, `GET /api/reports`, `POST /api/reports/generate`, `GET /api/reports/:id/download` · STATS `GET /api/stats/:role`.

Every protected endpoint enforces authentication + role + ownership server-side (`npm test` in `kaushalsetu-server` covers 13 scenarios incl. RBAC denials and demo isolation).

## Current limitations (Phase 2A → 2B)

- SQLite file DB + in-DB photo/resume blobs (fine for pilot; move to hosted DB + object storage for scale).
- No rate limiting / audit log yet.
- Google OAuth needs a Google Cloud client (documented in server `.env.example`).

