# Chit Collection Management System

A chit-fund collection management system — Auth (JWT, Admin/Agent), Customers, Chit plans & collections, Payments with receipts, and Dashboard reports.

## Stack
- **Backend:** Node + Express, Prisma ORM, PostgreSQL (Docker), JWT, Zod, bcrypt
- **Frontend:** React + Vite, Tailwind CSS, shadcn/ui, React Query, Axios

## Getting started (backend)

```bash
# 1. Start PostgreSQL (Docker)
docker compose up -d

# 2. Install backend deps
cd backend
npm install

# 3. Run migrations + seed
npx prisma migrate dev --name init
npm run seed

# 4. Start the API (http://localhost:4000)
npm run dev
```

### Seeded login accounts
| Role  | Email               | Password   |
|-------|---------------------|------------|
| Admin | admin@chit.com      | Admin@123  |
| Agent | agent@chit.com      | Agent@123  |

### View the database in pgAdmin
pgAdmin runs as part of `docker compose up -d`.

1. Open **http://localhost:5050**
2. Log in: **admin@chit.com** / **admin**
3. The **Chit DB** server is pre-registered — expand it and enter the DB password **`chit_pass`** when prompted.

Connection details (if you ever add it manually): from pgAdmin use host **`postgres`** / port **`5432`** (Docker network); from a tool on your host machine use **`localhost`** / port **`5433`**. DB `chit_db`, user `chit_user`, password `chit_pass`.

## Build progress (module by module)
- [x] Phase 0 — Scaffold (Docker, Prisma, seed)
- [x] Module 1 — Auth
- [x] Module 2 — Customers
- [x] Module 3 — Chit Plans
- [x] Module 4 — Collections
- [x] Module 5 — Payments
- [x] Module 6 — Reports
- [ ] Frontend
