# Backend

REST API for the finance dashboard assignment—users, roles, money records, and a few aggregate endpoints so the UI isn’t doing all the math. Built with Express and TypeScript on top of Prisma + SQLite. JWT auth, bcrypt for passwords, Zod for request validation. Authorization is middleware plus a bit of policy code under `src/modules/policies/`.

Node 18+ assumed. Default DB URL points at `file:./dev.db`.

## Where stuff lives

Prisma schema, migrations, and seed live in `prisma/`. The app boots from `src/server.ts` and `src/app.ts`; env parsing is `src/config/env.ts`.

Most of the code is under `src/modules/`—`auth`, `users`, `records`, `dashboard`, plus `policies` for RBAC. Typical module has schemas, service, controller, routes. Shared bits go in `src/lib/`, request plumbing in `src/middleware/`. Tests use `src/test/setup.ts`.

## Run it

```bash
cd backend
cp .env.example .env
# Windows: Copy-Item .env.example .env
npm install
npx prisma migrate dev
npm run dev
```

`migrate dev` applies migrations and will run the seed when Prisma is configured for that. If you’re not in dev: `npx prisma migrate deploy` then `npx prisma db seed`.

Build + start the compiled JS:

```bash
npm run build
npm start
```

## Environment

You need `DATABASE_URL` (SQLite is `file:./dev.db` or similar), `JWT_SECRET` (at least 16 characters), and optionally `JWT_EXPIRES_IN` (e.g. `7d`), `PORT` (defaults to 4000), and `NODE_ENV` (`development`, `test`, or `production`).

## Seed data

`npm run db:seed` runs `prisma/seed.ts`.

Password for the active accounts below: **`Password123!`**

- `admin@example.com` — ADMIN, active  
- `analyst@example.com` — ANALYST, active  
- `viewer@example.com` — VIEWER, active  
- `inactive@example.com` — VIEWER, inactive (can’t log in)

If there are no financial records yet, the seed adds a handful so you aren’t staring at an empty DB.

## JSON shape

Success:

```json
{ "success": true, "data": { } }
```

Failure:

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Validation failed",
    "details": { }
  }
}
```

## Routes

Base URL is `http://localhost:4000` unless you changed `PORT`.

Almost everything needs `Authorization: Bearer <token>`. Exceptions: `POST /auth/login` and `GET /health`.

**Auth:** `POST /auth/login` issues a token. `GET /auth/me` returns the current user.

**Users (admin only):** `POST /users` create, `GET /users` list, `PATCH /users/:id` update email/name/role, `PATCH /users/:id/status` flip `ACTIVE` / `INACTIVE`.

**Records:** anyone logged in can `GET /records` and `GET /records/:id`. Only admins can `POST`, `PATCH`, or `DELETE`. On create, `createdBy` is whoever called the API.

`GET /records` query params (all optional): `page` (default 1), `pageSize` (default 20, max 100), `type` (`INCOME` / `EXPENSE`), `category` (substring), `dateFrom` / `dateTo` (ISO datetimes, inclusive on `date`), `search` (matches `notes` or `category`).

**Dashboard:** `GET /dashboard/summary` and `GET /dashboard/recent-activity` are open to viewer, analyst, and admin. `GET /dashboard/category-breakdown` and `GET /dashboard/trends` are analyst + admin only. Optional `from` / `to` on all four to bound by `FinancialRecord.date`. Recent activity also takes `limit` (default 10, max 50).

**Health:** `GET /health`, no token.

### Permissions in one place

Admins can do everything including user management and record writes. Analysts and viewers can read records; only admins mutate them. Viewers only get the lighter dashboard endpoints (summary + recent activity)—category breakdown and trends need analyst or admin so “insights” aren’t exposed to pure read-only users.

Inactive users don’t get past login. If you deactivate someone, their old JWT stops working on protected routes because auth re-checks the user record.

## Curl examples

Replace `TOKEN` with whatever `/auth/login` returned.

```bash
curl -s -X POST http://localhost:4000/auth/login \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"admin@example.com\",\"password\":\"Password123!\"}"

curl -s http://localhost:4000/auth/me -H "Authorization: Bearer TOKEN"

curl -s "http://localhost:4000/records?page=1&pageSize=10" \
  -H "Authorization: Bearer TOKEN"

curl -s "http://localhost:4000/dashboard/summary" \
  -H "Authorization: Bearer TOKEN"

curl -s -X POST http://localhost:4000/records \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"amount\":120.5,\"type\":\"EXPENSE\",\"category\":\"Food\",\"date\":\"2025-04-01T12:00:00.000Z\",\"notes\":\"Lunch\"}"
```

## Tests

```bash
npm test
```

Mostly RBAC policy helpers and the aggregation helpers in `src/lib/dashboardMath.ts`.

## Assumptions & rough edges

Viewer vs analyst split on the dashboard is intentional—viewers aren’t supposed to see category breakdown or trend charts. Dashboard totals ignore `VOID` records (seed includes one so that’s visible). Money is `Decimal` in Prisma but serialized as numbers in JSON; fine here, questionable for real money. Dates are stored in UTC; monthly buckets use UTC months via `dashboardMath.monthKey`. New passwords only need 8 characters. No refresh tokens or password reset.

SQLite is fine for local dev and awkward for serious concurrency or big reporting. JWT in a header is simple; no cookie CSRF discussion. Trends fetch rows and aggregate in application code—works until the dataset gets huge, then you’d lean on SQL or pre-aggregates. Every authenticated request loads the user from the DB so deactivated accounts lose access immediately; that’s an extra query each time.

Stuff that didn’t get built: refresh tokens, password flows, audit trail, Supertest E2E, generated OpenAPI, rate limiting, structured logging, Postgres for a real deploy.
