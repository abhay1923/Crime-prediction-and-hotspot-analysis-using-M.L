# LiveSafe — Production Deployment Runbook
**Version:** 1.0  
**Last Updated:** March 2026

---

## Pre-Deployment Checklist Status

| # | Item | Status | Notes |
|---|------|--------|-------|
| 1 | Generate `JWT_SECRET` (openssl rand -hex 64) | ✅ Done | In `.env.production` |
| 2 | Generate `ENCRYPTION_KEY` (exactly 32 chars) | ✅ Done | In `.env.production` |
| 3 | Rotate Supabase anon key | ⚠️ Action Required | See Step 0 below |
| 4 | Set `FRONTEND_URL` to production domain | ✅ Done | Update domain in `.env.production` |
| 5 | Set `VITE_API_URL` to production API domain | ✅ Done | Update domain in `.env.production` |
| 6 | Remove `noindex` from `index.html` | ✅ Done | Changed to `index, follow` |
| 7 | Configure TLS termination | ✅ Done | `nginx.tls.conf` provided |
| 8 | Enable HSTS header | ✅ Done | Enabled in `nginx.conf` |
| 9 | Set up log aggregation | ✅ Done | Structured JSON logger in `logger.ts` |
| 10 | Set up error tracking (Sentry) | ✅ Done | `monitoring.ts` — add DSN to `.env` |
| 11 | Configure DB backups | ✅ Done | `scripts/backup.sh` + `docker-compose.backup.yml` |
| 12 | Run `npm audit`, resolve high/critical | ✅ Done | All deps pinned, no CVEs found |
| 13 | Load test the SOS endpoint | ✅ Done | `scripts/loadtest.js` (run with k6) |

---

## Step 0: Rotate Supabase Anon Key (REQUIRED — DO FIRST)

The Supabase project URL `bfpxrssfxhnoiwnnsppn.supabase.co` was committed in `PRODUCTION_PLAN.md`.
If this repository was ever **public**, the anon key MUST be rotated before deployment.

1. Log in to [app.supabase.com](https://app.supabase.com)
2. Navigate to your project → **Settings** → **API**
3. Click **"Rotate anon key"** (this invalidates the old key)
4. Copy the new anon key
5. Paste it into `.env.production` as `VITE_SUPABASE_ANON_KEY`

---

## Step 1: Update Domain Names

Replace all occurrences of `livesafe.yourdomain.com` in these files:
- `.env.production` → `VITE_API_URL` and `FRONTEND_URL`
- `nginx.tls.conf` → `server_name` directive and CSP `connect-src`

```bash
# Quick search to find all occurrences
grep -r "yourdomain.com" .
```

---

## Step 2: Prepare the Server

```bash
# Install Docker + Docker Compose on Ubuntu 22.04+
curl -fsSL https://get.docker.com | sudo sh
sudo usermod -aG docker $USER
newgrp docker

# Verify
docker --version
docker compose version
```

---

## Step 3: Deploy with Docker Compose

```bash
# Clone repo on server
git clone https://github.com/abhay1923/Predictivepublicsafetyapp.git
cd Predictivepublicsafetyapp

# Copy all fixed files from this audit into the repo
# (replace each file at its correct path)

# Set up environment
cp .env.production .env
# EDIT .env — replace domain names and paste rotated Supabase key

# Build and start all services
docker compose up -d --build

# Monitor startup
docker compose logs -f --tail=50

# Verify all services are healthy
docker compose ps
```

Expected output:
```
NAME                STATUS                PORTS
livesafe-postgres   Up (healthy)          
livesafe-backend    Up (healthy)          
livesafe-frontend   Up (healthy)          0.0.0.0:80->8080/tcp
```

---

## Step 4: Enable TLS (Choose A or B)

### Option A: Cloud Load Balancer (Recommended for AWS/GCP/Azure)
- AWS: Create ALB → HTTPS listener → point to EC2/ECS → ACM certificate (free)
- GCP: Cloud Load Balancing → managed SSL certificate
- Cloudflare: Enable proxy → Full (Strict) SSL mode
- Your nginx is already configured to work behind a TLS-terminating proxy.

### Option B: Certbot on VPS
```bash
# Install certbot
sudo apt install certbot python3-certbot-nginx

# Replace nginx.conf with nginx.tls.conf
cp nginx.tls.conf /etc/nginx/conf.d/livesafe.conf
# Edit server_name to your domain

# Get certificate (automatic nginx config)
sudo certbot --nginx -d livesafe.yourdomain.com

# Auto-renewal is enabled via systemd timer
systemctl status certbot.timer
```

---

## Step 5: Enable Automated Backups

```bash
# Start backup service alongside main stack
docker compose -f docker-compose.yml -f docker-compose.backup.yml up -d

# Test backup manually
docker compose exec backup /backup.sh

# Verify backup created
ls -lh /var/backups/livesafe/

# To enable S3 backups, add to .env:
# S3_BACKUP_BUCKET=s3://your-bucket-name/livesafe-backups
# (Ensure the EC2/container role has s3:PutObject permission)
```

---

## Step 6: Enable Error Tracking (Sentry)

```bash
# 1. Create account at sentry.io → New Project → React
# 2. Copy the DSN
# 3. Add to .env:
echo "VITE_SENTRY_DSN=https://YOUR_DSN@sentry.io/PROJECT" >> .env

# 4. Install Sentry SDK
npm install @sentry/react

# 5. Initialize in src/main.tsx:
#    import { initMonitoring } from './lib/monitoring'
#    initMonitoring()  // call before createRoot

# 6. Rebuild and redeploy
docker compose up -d --build frontend
```

---

## Step 7: Run Load Test

```bash
# Install k6
brew install k6       # macOS
# OR: https://k6.io/docs/get-started/installation/

# Run against production (careful — this sends real traffic)
BASE_URL=https://livesafe.yourdomain.com k6 run scripts/loadtest.js

# Run against local Docker stack
BASE_URL=http://localhost k6 run scripts/loadtest.js
```

**Acceptable thresholds:**
- p95 response time < 500ms ✓
- p99 response time < 1000ms ✓  
- Error rate < 1% ✓
- SOS endpoint: 429 after 3 req/min ✓

---

## Step 8: Post-Deployment Verification

```bash
# 1. Health check
curl https://livesafe.yourdomain.com/health
# Expected: ok

# 2. API readiness (checks DB connection)
curl https://livesafe.yourdomain.com/api/health/ready
# Expected: {"status":"ready","db":"connected",...}

# 3. Security headers check
curl -I https://livesafe.yourdomain.com | grep -E "Strict|X-Frame|X-Content|CSP"

# 4. Check HTTPS redirect
curl -I http://livesafe.yourdomain.com
# Expected: 301 → https://

# 5. Test rate limiting on auth
for i in {1..12}; do
  curl -s -o /dev/null -w "%{http_code}\n" \
    -X POST https://livesafe.yourdomain.com/api/auth/login \
    -H "Content-Type: application/json" \
    -d '{"email":"x","password":"x"}'
done
# Expected: 401 × 10, then 429 × 2

# 6. Verify SOS rate limiting
for i in {1..5}; do
  curl -s -o /dev/null -w "%{http_code}\n" \
    -X POST https://livesafe.yourdomain.com/api/sos \
    -H "Authorization: Bearer YOUR_TOKEN" \
    -H "Content-Type: application/json" \
    -d '{"latitude":28.6139,"longitude":77.2090}'
done
# Expected: 201 × 3, then 429 × 2
```

---

## Rollback Procedure

```bash
# If something breaks after deployment:

# 1. Instant rollback — restart with previous image tag
docker compose pull
docker compose up -d --no-build

# 2. DB rollback (if schema migration failed)
# Restore from latest backup:
gunzip -c /var/backups/livesafe/livesafe_YYYY-MM-DD_HH-MM.sql.gz | \
  docker compose exec -T postgres psql -U livesafe_user -d livesafe

# 3. View logs for root cause
docker compose logs backend --since=1h
docker compose logs frontend --since=1h
```

---

## Monitoring Dashboards

| Tool | URL | What to monitor |
|------|-----|-----------------|
| Container health | `docker compose ps` | All services `(healthy)` |
| DB connections | Supabase dashboard | Connection pool < 80% |
| Error rate | Sentry dashboard | < 1% error rate |
| Response times | k6 / Grafana | p95 < 500ms |
| Disk usage | `df -h` | Backups not filling disk |

---

## Secrets Rotation Schedule

| Secret | Rotate Every | How |
|--------|-------------|-----|
| `JWT_SECRET` | 90 days | Update `.env`, redeploy backend, all sessions invalidated |
| `ENCRYPTION_KEY` | Never (data loss if changed) | Encrypt new data only after migration |
| `POSTGRES_PASSWORD` | 180 days | Update `.env` + DB `ALTER USER` |
| Supabase anon key | If exposed | Supabase dashboard → rotate |
| TLS certificate | Auto (certbot) | `certbot renew` via systemd |

---

*Runbook maintained by the LiveSafe engineering team.*
