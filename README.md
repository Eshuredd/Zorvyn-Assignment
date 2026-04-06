# Finance dashboard — backend + UI

Express/TypeScript API with JWT auth, Prisma, and SQLite. There’s a Vite/React app in the same repo that talks to it. Assignment was basically: financial records, roles, dashboard aggregates, and real access control—not a toy CRUD demo.

What you get:

- Users with roles (viewer / analyst / admin), active vs inactive, admin-only user management.
- Financial records (amount, income/expense, category, date, notes) with filters, pagination, and search.
- Dashboard endpoints: totals, category breakdown, monthly trends, recent activity (exact rules vary by role—see below).
- Zod on inputs, one error handler, JWT on protected routes.
- OpenAPI 3 + Swagger UI on the API (`/api-docs`, `/openapi.json` — see [`backend/README.md`](backend/README.md)).

Stack: Node 18+, Express, Prisma, SQLite, Zod. Frontend: React, Tailwind, shadcn-style components.

Anything gnarly (who sees which dashboard chart, void records, UTC month bucketing, why SQLite) is spelled out in [`backend/README.md`](backend/README.md) under assumptions and tradeoffs.

## Run it

Backend (defaults to port 4000):

```bash
cd backend
cp .env.example .env
npm install
npx prisma migrate dev
npm run dev
```

Frontend from repo root:

```bash
npm install
npm run dev
```

Set `VITE_API_BASE_URL` if your API isn’t on the default the app expects. Full route list, Swagger/OpenAPI URLs, env table, seeded logins, and curl examples live in [`backend/README.md`](backend/README.md).
