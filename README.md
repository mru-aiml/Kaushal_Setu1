# KaushalSetu
### Labour-Market Intelligence & Curriculum Alignment Platform

KaushalSetu is a role-based labour-market intelligence and skill-development platform designed to connect government stakeholders, training centres, employers, and candidates through a common skill intelligence ecosystem.

The platform helps identify industry demand, analyse skill gaps, align training programmes with market requirements, support employer hiring needs, and provide candidates with career and learning recommendations.

---

## 🚀 Core Idea

KaushalSetu connects the complete skill-development lifecycle:

```text
Industry Demand
      ↓
Emerging Skills
      ↓
Skill Gap Analysis
      ↓
Curriculum Alignment
      ↓
Training Delivery
      ↓
Skill Validation
      ↓
Employment / Hiring
      ↓
Outcome Tracking
      ↓
Programme Impact
```

---

## 📁 Project Structure

| Directory | Description |
|---|---|
| `kaushalsetu-react/` | React + Vite frontend (role workspaces, dashboards, reports UI). Deployed on Vercel. See its README for setup and environment variables. |
| `kaushalsetu-server/` | Node.js backend API + PostgreSQL (auth/RBAC, profiles, data, AI gateway, reports). Deployed on Render. See its README for setup, migrations, seed, and deployment. |

## ▶️ Quick Start

```bash
# 1. Database (PostgreSQL 16+)
cd kaushalsetu-server
docker compose up -d postgres   # or use a local Postgres on :5432

# 2. Backend
npm install
npm run db:migrate
npm run db:seed
npm start                        # http://localhost:4000

# 3. Frontend (new terminal, VITE_API_BASE_URL=http://localhost:4000 in .env)
cd ../kaushalsetu-react
npm install
npm run dev                      # http://localhost:5173
```

Demo logins (password `Demo@1234`): `demo.govt@`, `demo.tc@`, `demo.emp@`, `demo.cand@kaushalsetu.in`.

---

## 👥 Roles & Workspaces

| Role | Workspace | What it does |
|---|---|---|
| Government | `/government/*` | District skill intelligence, labour-market signals, skill gaps, curriculum alignment, training capacity, employer validation, employment outcomes, programme impact, reports |
| Training Centre | `/training-centre/*` | Demand, course alignment, capacity, trainer readiness, infrastructure, skill gaps, training plans |
| Employer | `/employer/*` | Industry demand, requirements, skill validation, emerging skills, hiring signals |
| Candidate | `/candidate/*` | Profile, skills, skill gaps, AI career navigator, courses, career path, live opportunities |

Role isolation is enforced on every page (frontend guards) and every API call (backend RBAC + ownership). Demo Mode (`/demo`) is a clearly labeled sandbox that never mixes with real accounts.

---

## 🔄 How Data Flows

```text
User
  → Frontend role workspace (Vercel)
  → API with auth + RBAC (Render)
  → PostgreSQL (source of truth)
  → Analytics / AI gateway / report engine
  → Dashboards, dedicated pages, PDF/CSV/XLSX downloads
```

---

## 🛠️ Tech Stack

- **Frontend:** React 18 + Vite + Tailwind + React Router + Chart.js
- **Backend:** Node.js (`node:http`, zero framework) + `pg` connection pool + `xlsx`
- **Database:** PostgreSQL 16+ (migrations in `kaushalsetu-server/migrations/`, seed via `npm run db:seed`)
- **AI:** backend-only gateway (OpenAI-compatible providers); honest 503 when unconfigured — keys never touch the frontend
- **Deploy:** Vercel (frontend) + Render Web Service + Render PostgreSQL (see `kaushalsetu-server/render.yaml`)

---

## 📚 Further Documentation

- `kaushalsetu-react/README.md` — frontend setup, env vars, workspace routes, Vercel deploy
- `kaushalsetu-server/README.md` — backend setup, DB migrations/seed/reset, API list, AI/Google config, Render deploy, demo credentials

---

## ⚠️ Data Notice

Figures in demo workspaces are **demonstration data** (clearly labeled in the UI) — illustrative, not official government statistics.
