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

## Build progress (module by module)
- [x] Phase 0 — Scaffold (Docker, Prisma, seed)
- [x] Module 1 — Auth
- [x] Module 2 — Customers
- [ ] Module 3 — Chit Plans
- [ ] Module 4 — Collections
- [ ] Module 5 — Payments
- [ ] Module 6 — Reports
- [ ] Frontend
