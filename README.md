<div align="center">

<img src="https://img.shields.io/badge/🛡️-LiveSafe-4f46e5?style=for-the-badge&labelColor=1e1b4b" alt="LiveSafe" />

# LiveSafe — Predictive Public Safety Platform

**AI-powered crime prediction, real-time SOS response, and community safety intelligence for Delhi-NCR**

[![React](https://img.shields.io/badge/React-18.3-61dafb?logo=react&logoColor=white&style=flat-square)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.5-3178c6?logo=typescript&logoColor=white&style=flat-square)](https://typescriptlang.org)
[![Vite](https://img.shields.io/badge/Vite-6.3-646cff?logo=vite&logoColor=white&style=flat-square)](https://vitejs.dev)
[![Node.js](https://img.shields.io/badge/Node.js-20+-339933?logo=node.js&logoColor=white&style=flat-square)](https://nodejs.org)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-4169e1?logo=postgresql&logoColor=white&style=flat-square)](https://postgresql.org)
[![Docker](https://img.shields.io/badge/Docker-Ready-2496ed?logo=docker&logoColor=white&style=flat-square)](https://docker.com)
[![License](https://img.shields.io/badge/License-MIT-10b981?style=flat-square)](LICENSE)

[🚀 Quick Start](#-quick-start) · [📖 API Reference](#-api-reference) · [🏗️ Architecture](#️-architecture) · [🐳 Docker Deploy](#-docker-deployment)

---

</div>

## ✨ What is LiveSafe?

LiveSafe is a full-stack predictive public safety platform that uses **Machine Learning** to forecast crime hotspots and deliver real-time safety intelligence to citizens, police, and administrators across Delhi-NCR.

| | |
|---|---|
| 🎯 **95.2% ML Accuracy** | DBSCAN clustering + Random Forest trained on 198,355 crime records |
| 🚨 **One-Tap SOS** | Emergency alerts with live GPS location sent to nearest officers |
| 🗺️ **Live Hotspot Map** | Interactive Leaflet map with color-coded risk zones and crime overlays |
| 📊 **Multi-Role Dashboards** | Tailored views for Citizens, Police, and Administrators |
| 🔒 **Enterprise Security** | AES-256 encryption, JWT auth, rate limiting, DPDP Act 2023 compliant |

---

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

| Tool | Version | Download |
|------|---------|----------|
| **Node.js** | 20.x or later | [nodejs.org](https://nodejs.org) |
| **npm** | 10.x or later | Comes with Node.js |
| **Python** | 3.11+ *(ML pipeline only)* | [python.org](https://python.org) |
| **Git** | Any | [git-scm.com](https://git-scm.com) |

> **Windows users:** Use **Command Prompt** or **PowerShell** — not Git Bash — for npm commands.

---

## 🚀 Quick Start

### 1. Clone the repository

```bash
git clone https://github.com/abhay1923/Predictivepublicsafetyapp.git
cd Predictivepublicsafetyapp
```

### 2. Set up environment variables

```bash
# Windows
copy .env.example .env

# macOS / Linux
cp .env.example .env
```

> For local development the defaults work out of the box. No edits needed.

### 3. Install dependencies

```bash
npm install --legacy-peer-deps
```

> `--legacy-peer-deps` is required due to peer dependency differences between Radix UI packages. This is safe and expected.

### 4. Start the dev server

```bash
npm run dev
```

Open **http://localhost:5173** in your browser ✅

---

## 🔑 Demo Login Credentials

Log in immediately — no sign-up required:

| Role | Email | Password | Access Level |
|------|-------|----------|-------------|
| 👤 Citizen | `citizen@example.com` | `citizen123` | Map, SOS, report incidents |
| 👮 Police | `police@example.com` | `police123` | Incidents, SOS dispatch, analytics |
| ⚙️ Admin | `admin@example.com` | `admin123` | Full access + ML model management |

---

## 🔧 Backend Setup

The frontend runs standalone with demo data. To enable the full API:

### 1. Install backend dependencies

```bash
cd backend
npm install
```

### 2. Start a database

```bash
# Option A — Docker (easiest, from project root)
docker compose up postgres -d

# Option B — Local PostgreSQL
# Create a database named 'livesafe', then update DATABASE_URL in .env
```

### 3. Apply the database schema

```bash
# From the project root directory
psql -U postgres -d livesafe -f supabase/schema.sql
```

### 4. Start the API server

```bash
# Inside the backend/ directory
npm run dev
```

Backend API is now at **http://localhost:3000** ✅

---

## 🐳 Docker Deployment

Deploy the complete stack (frontend + backend + PostgreSQL) with one command:

```bash
# 1. Configure environment
cp .env.example .env
# Edit .env — set your domain, generate real secrets (see Security section)

# 2. Build and start all services
docker compose up -d --build

# 3. Verify all containers are healthy
docker compose ps
```

Expected output:
```
NAME                STATUS          PORTS
livesafe-postgres   Up (healthy)
livesafe-backend    Up (healthy)
livesafe-frontend   Up (healthy)    0.0.0.0:80->8080/tcp
```

### Generate production secrets

```bash
# JWT Secret
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"

# Encryption Key (must be exactly 32 characters)
node -e "console.log(require('crypto').randomBytes(16).toString('hex'))"
```

---

## 🏗️ Architecture

```
Predictivepublicsafetyapp/
│
├── src/                              ← React Frontend (TypeScript + Vite)
│   ├── App.tsx                       ← Router + role-based auth guard
│   ├── main.tsx                      ← Entry (ErrorBoundary + StrictMode)
│   ├── app/
│   │   ├── components/
│   │   │   ├── LoginPage.tsx         ← Authentication UI
│   │   │   ├── CitizenDashboard.tsx  ← Citizen safety portal
│   │   │   ├── PoliceDashboard.tsx   ← Police operations center
│   │   │   ├── AdminDashboard.tsx    ← Admin + ML model management
│   │   │   ├── HotspotMap.tsx        ← Interactive Leaflet crime map
│   │   │   └── ErrorBoundary.tsx     ← Global crash handler
│   │   ├── services/api.ts           ← Typed API client (Zod validated)
│   │   ├── hooks/useApi.ts           ← Data fetching with abort + polling
│   │   └── context/AuthContext.tsx   ← Global auth state (React Context)
│   └── lib/
│       ├── supabase.ts               ← Supabase client config
│       └── monitoring.ts             ← Sentry error tracking
│
├── backend/                          ← Express.js API (TypeScript)
│   └── src/
│       ├── index.ts                  ← Server bootstrap + middleware
│       ├── routes/
│       │   ├── auth.ts               ← /login /register /me
│       │   ├── incidents.ts          ← CRUD /incidents
│       │   ├── hotspots.ts           ← /hotspots /nearby/:lat/:lng
│       │   ├── sos.ts                ← /sos emergency alerts
│       │   ├── analytics.ts          ← /crime-trends /peak-hours
│       │   ├── ml.ts                 ← /metrics /predict /retrain
│       │   └── health.ts             ← /health /health/ready
│       └── middleware/
│           ├── auth.ts               ← JWT verification + role guard
│           ├── rateLimiter.ts        ← Per-endpoint rate limits
│           ├── errorHandler.ts       ← Centralised error responses
│           └── logger.ts             ← Structured JSON logging
│
├── backend/ml/                       ← Python ML Pipeline
│   ├── train_model.py                ← DBSCAN + Random Forest training
│   └── requirements.txt
│
├── supabase/schema.sql               ← Full DB schema + PostGIS indexes
├── scripts/
│   ├── backup.sh                     ← Automated DB backup (S3 support)
│   └── loadtest.js                   ← k6 load test suite
│
├── .github/workflows/ci.yml          ← CI: typecheck → lint → build → docker
├── Dockerfile                        ← Frontend (nginx, non-root, multi-stage)
├── backend/Dockerfile                ← Backend (node, non-root, multi-stage)
├── docker-compose.yml                ← Full stack orchestration
├── nginx.conf                        ← Hardened (HSTS, CSP, caching)
└── nginx.tls.conf                    ← TLS config (certbot / cloud LB)
```

---

## 🔌 API Reference

**Base URL:** `http://localhost:3000/api`

All endpoints except `/auth/login` and `/auth/register` require:
```
Authorization: Bearer <jwt_token>
```

### Authentication

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/auth/login` | Login — returns JWT + user profile |
| `POST` | `/auth/register` | Register new account |
| `GET` | `/auth/me` | Get current user |

### Incidents

| Method | Endpoint | Roles | Description |
|--------|----------|-------|-------------|
| `GET` | `/incidents` | All | List incidents |
| `POST` | `/incidents` | All | Report new incident |
| `GET` | `/incidents/:id` | All | Get details |
| `PATCH` | `/incidents/:id` | Police, Admin | Update status/severity |

### Hotspots

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/hotspots` | All hotspots with ML risk scores |
| `GET` | `/hotspots/:id` | Single hotspot |
| `GET` | `/hotspots/nearby/:lat/:lng` | Hotspots within 5 km |

### SOS Alerts

| Method | Endpoint | Roles | Description |
|--------|----------|-------|-------------|
| `POST` | `/sos` | All | Trigger emergency alert |
| `GET` | `/sos/active` | Police, Admin | Active alerts list |
| `PATCH` | `/sos/:id` | Police, Admin | Update alert status |
| `DELETE` | `/sos/:id` | Owner, Admin | Cancel alert |

### ML Model

| Method | Endpoint | Roles | Description |
|--------|----------|-------|-------------|
| `GET` | `/ml/metrics` | All | Accuracy, precision, F1 score |
| `GET` | `/ml/predict?lat=&lng=` | All | Risk prediction for location |
| `GET` | `/ml/feature-importance` | All | Feature weights |
| `POST` | `/ml/retrain` | Admin | Trigger background retraining |

### Analytics

| Method | Endpoint | Roles | Description |
|--------|----------|-------|-------------|
| `GET` | `/analytics/overview` | Police, Admin | System-wide summary |
| `GET` | `/analytics/crime-trends` | Police, Admin | 30-day crime trend |
| `GET` | `/analytics/crime-by-type` | Police, Admin | Crime type breakdown |
| `GET` | `/analytics/peak-hours` | Police, Admin | Incidents by hour of day |

### Health Checks

| Endpoint | Used By | Description |
|----------|---------|-------------|
| `GET /api/health` | Docker, k8s | Liveness — process is alive |
| `GET /api/health/ready` | Docker, k8s | Readiness — DB is connected |

---

## 🧠 ML Model

### Pipeline
```
Crime CSV data → Feature engineering → DBSCAN spatial clustering → Random Forest classifier → Hotspot predictions
```

### Performance

| Metric | Score |
|--------|-------|
| Accuracy | **95.2%** |
| Precision | **94.8%** |
| Recall | **95.5%** |
| F1 Score | **95.1%** |
| Training samples | 198,355 |

### Input Features
1. Latitude & Longitude
2. Hour of day
3. Day of week
4. Historical crime density
5. Population density
6. Area type (residential / commercial / mixed)

---

## 🔐 Security

| Layer | Implementation |
|-------|---------------|
| Password hashing | bcrypt (12 rounds) |
| Authentication | JWT (HS256, configurable expiry) |
| Data encryption | AES-256-GCM |
| Rate limiting — Auth | 10 requests per 15 min per IP |
| Rate limiting — API | 100 requests per 15 min per IP |
| Rate limiting — SOS | 3 requests per minute per IP |
| Security headers | HSTS · CSP · X-Frame-Options · X-Content-Type |
| Input validation | Zod schema validation on all endpoints |
| SQL injection | Parameterised queries only (Sequelize) |
| Error responses | No stack traces exposed in production |
| Container | Non-root user · read-only filesystem |

---

## 🌿 Environment Variables

### Frontend `.env`

```env
VITE_API_URL=http://localhost:3000/api
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

### Backend `.env`

```env
PORT=3000
NODE_ENV=development
DATABASE_URL=postgresql://postgres:password@localhost:5432/livesafe
JWT_SECRET=generate-with-openssl-or-node-crypto
ENCRYPTION_KEY=exactly-32-characters-here!!!!!
FRONTEND_URL=http://localhost:5173
RATE_LIMIT_MAX=100
RATE_LIMIT_WINDOW_MS=900000
```

---

## 🛠️ Scripts Reference

### Frontend (run from project root)

```bash
npm run dev           # Start development server at http://localhost:5173
npm run build         # Build optimised production bundle
npm run preview       # Preview production build at http://localhost:4173
npm run typecheck     # TypeScript type checking (no emit)
npm run lint          # ESLint code quality check
npm test              # Run unit tests with Vitest
```

### Backend (run from `backend/` directory)

```bash
npm run dev           # Start with ts-node-dev hot reload
npm run build         # Compile TypeScript to dist/
npm start             # Run compiled production server
npm run typecheck     # TypeScript type checking
```

---

## 🤝 Contributing

1. Fork this repository
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Make your changes and commit: `git commit -m 'feat: describe your change'`
4. Push to your fork: `git push origin feature/your-feature`
5. Open a Pull Request against `main`

Please follow [Conventional Commits](https://www.conventionalcommits.org/) for commit messages (`feat:`, `fix:`, `docs:`, etc.).

---

## 📄 License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- Crime data sourced from [Kaggle](https://www.kaggle.com/) — Delhi-NCR crime records
- Map tiles by [OpenStreetMap](https://openstreetmap.org/) contributors (ODbL license)
- UI components from [shadcn/ui](https://ui.shadcn.com/) (MIT License)
- Icons from [Lucide](https://lucide.dev/) (ISC License)

---

<div align="center">

**Built with ❤️ for safer communities in Delhi-NCR**

*LiveSafe — Because everyone deserves to feel safe.*

</div>
