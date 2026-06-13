# Deployment — chitapp.snagarajan.me

CI/CD deploys to a VPS over SSH via [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml)
on every push to `main` (or manually via **Actions → Deploy to VPS → Run workflow**).

The stack is four Docker containers ([`docker-compose.prod.yml`](docker-compose.prod.yml)):

| Service    | What it does                                                                  |
| ---------- | ----------------------------------------------------------------------------- |
| `traefik`  | Edge router on **80/443** — routes by host/path, redirects http→https, and issues **Let's Encrypt** TLS certs automatically |
| `frontend` | Serves the built SPA (`serve -s`, single-page fallback). No host port — Traefik routes to it |
| `backend`  | Express API + Prisma. Runs `prisma migrate deploy` on start, then serves       |
| `postgres` | Postgres 16, data in the `chit_pgdata` volume                                  |

Traefik routes `Host(chitapp.snagarajan.me)` → frontend and `… && PathPrefix(/api)` → backend,
so the app and API share one origin (no CORS in production).

## 1. One-time setup

### GitHub repository secrets
**Settings → Secrets and variables → Actions → New repository secret**

| Secret     | Value                                                          |
| ---------- | ------------------------------------------------------------- |
| `ENV`      | The **entire contents** of [`production.env`](production.env) |
| `VPS_HOST` | VPS IP / hostname                                            |
| `VPS_USER` | SSH user                                                     |
| `VPS_PASS` | SSH password                                                 |

> Edit `production.env` first: set a strong `JWT_SECRET` (`openssl rand -base64 48`) and a real
> `ACME_EMAIL`. `production.env` is gitignored — it only lives in the `ENV` secret.

### DNS
Point an **A record** for `chitapp.snagarajan.me` → your VPS IP. Let's Encrypt validates over
HTTP on port 80, so the domain must resolve to the VPS **before** the first deploy.

### VPS prerequisites
- Docker Engine + Docker Compose v2 (`docker compose version`)
- Ports **80 and 443** open and free (Traefik binds both)

## 2. Deploy
Push to `main`. Two jobs run in order:

1. **deploy-backend** — copies the project to the VPS, brings up `postgres` + `backend`,
   applies migrations, and verifies `prisma migrate status` + `/api/health`.
2. **deploy-frontend** (after backend succeeds) — brings up `traefik` + `frontend`, then confirms
   the site serves **and** that a request reaches the API through Traefik (`https://…/api/health`).

## 3. First deploy — create the login users
The production database starts empty. Seed the admin/agent accounts once:

```bash
ssh <VPS_USER>@<VPS_HOST>
cd ~/chit-app
docker compose -f docker-compose.prod.yml --env-file production.env exec backend npm run seed
```

Default logins (change the passwords): `admin@chit.com / Admin@123`, `agent@chit.com / Agent@123`.
The seed also inserts demo plans/customers — skip it for a clean database and create an admin yourself.

## 4. HTTPS
**Automatic** — Traefik obtains and renews a Let's Encrypt certificate for `DOMAIN` (stored in the
`chit_letsencrypt` volume). No extra steps.

If you front the VPS with **Cloudflare**, use **DNS-only (grey cloud)** for the first deploy so the
HTTP-01 challenge reaches Traefik; you can switch to proxied + **Full (strict)** SSL afterwards.

## 5. Test the production build locally
Use the Let's Encrypt **staging** CA so you don't spend real-cert quota, and resolve the domain to
localhost (the cert will be untrusted → `-k`):

```bash
ACME_CASERVER=https://acme-staging-v02.api.letsencrypt.org/directory \
  docker compose -f docker-compose.prod.yml --env-file production.env up -d --build --wait

curl -k --resolve chitapp.snagarajan.me:443:127.0.0.1 https://chitapp.snagarajan.me/
curl -k --resolve chitapp.snagarajan.me:443:127.0.0.1 https://chitapp.snagarajan.me/api/health

docker compose -f docker-compose.prod.yml --env-file production.env down -v   # tear down
```

> Note: Traefik's Docker-label discovery may log `Error response from daemon` on **Docker Desktop
> for macOS** with very new Docker builds — a host quirk only; it works on a standard Linux VPS.
