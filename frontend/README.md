# Chit App — Frontend

Web UI for the Chit Collection Management System.

**Stack:** Vite · React 18 · TypeScript · Tailwind CSS · shadcn/ui · React Router · TanStack Query · Axios

It consumes the backend API at `http://localhost:4000/api`.

## Getting started

```bash
cd frontend
npm install
cp .env.example .env   # adjust VITE_API_URL if your backend runs elsewhere
npm run dev            # http://localhost:5173
```

The backend (`../backend`) must be running and seeded. Default logins:

| Role  | Email            | Password   |
| ----- | ---------------- | ---------- |
| Admin | admin@chit.com   | Admin@123  |
| Agent | agent@chit.com   | Agent@123  |

## Scripts

| Command           | Description                                  |
| ----------------- | -------------------------------------------- |
| `npm run dev`     | Start the Vite dev server (port 5173)        |
| `npm run build`   | Type-check and build for production (`dist/`) |
| `npm run preview` | Preview the production build locally          |
| `npm run lint`    | Type-check only (`tsc --noEmit`)             |

## Structure

```
src/
  api/         Axios client (JWT interceptor, 401 auto-logout) + response types
  components/  Reusable UI (components/ui = shadcn/ui primitives)
  config/      Typed env access (VITE_API_URL)
  lib/         cn() util, React Query client, token storage
  pages/       Route-level screens
  routes/      Router definition
```

## Build phases

| Phase | Delivers                                                          |
| ----- | ---------------------------------------------------------------- |
| F0    | Scaffold & foundation (this commit)                              |
| F1    | Auth + app shell (login, auth store, protected/role-guarded routes) |
| F2    | Customers                                                        |
| F3    | Chit Plans                                                       |
| F4    | Collections & Collect Payment                                    |
| F5    | Dashboard & Reports                                              |
| F6    | Polish                                                           |
