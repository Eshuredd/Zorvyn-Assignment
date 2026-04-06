# Finance Data Processing and Access Control API

Backend for an internship-style assignment: financial records with **role-based access control (RBAC)**, **Zod** validation, **JWT** authentication, **Prisma** + **SQLite**, and **dashboard analytics**.

## Project overview

This service exposes REST APIs for:

- Authenticating users and issuing JWTs
- Admin-only user lifecycle (create, list, update profile fields, activate/deactivate)
- Financial records (CRUD with filters, pagination, and search)
- Dashboard summaries (totals, category breakdown, monthly trends, recent activity)

Business rules live in **services**; **controllers/routes** stay thin; **authorization** uses reusable middleware plus small **policy helpers**; **errors** flow through a single middleware.

## Tech stack

| Layer        | Choice                          |
| ------------ | ------------------------------- |
| Runtime      | Node.js 18+                     |
| Framework    | Express                         |
| Language     | TypeScript                      |
| ORM          | Prisma                          |
| Database     | SQLite (`file:./dev.db` by default) |
| Validation   | Zod                             |
| Auth         | JWT (`jsonwebtoken`)            |
| Passwords    | `bcrypt`                        |
| Tests        | Vitest                          |

## Final folder structure

```text
backend/
├── prisma/
│   ├── schema.prisma
│   ├── seed.ts
│   └── migrations/
│       └── <timestamp>_init/
│           └── migration.sql
├── src/
│   ├── app.ts                 # Express app factory, routes, global middleware
│   ├── server.ts              # HTTP listen bootstrap
│   ├── config/
│   │   └── env.ts             # Zod-validated environment
│   ├── lib/
│   │   ├── prisma.ts          # Prisma client singleton
│   │   ├── jwt.ts             # Sign / verify access tokens
│   │   ├── password.ts        # bcrypt helpers
│   │   ├── apiResponse.ts     # { success, data | error } helpers
│   │   ├── errors.ts          # AppError hierarchy
│   │   ├── decimal.ts         # Prisma Decimal → number for JSON
│   │   └── dashboardMath.ts   # Pure aggregation helpers (tested)
│   ├── middleware/
│   │   ├── auth.ts            # JWT + active user lookup
│   │   ├── authorize.ts       # requireRole, requirePolicy
│   │   ├── validate.ts        # Zod body/query/params validation
│   │   └── errorHandler.ts    # Centralized HTTP error mapping
│   ├── modules/
│   │   ├── policies/
│   │   │   └── rbac.policy.ts # Role capability functions
│   │   ├── auth/
│   │   ├── users/
│   │   ├── records/
│   │   └── dashboard/
│   ├── test/
│   │   └── setup.ts           # Test env defaults
│   └── types/
│       └── express.d.ts       # req.user typing
├── .env.example
├── package.json
├── tsconfig.json
├── vitest.config.ts
└── README.md
```

Each feature module follows the same pattern: `*.schemas.ts` (Zod), `*.service.ts`, `*.controller.ts`, `*.routes.ts`.

## Setup

```bash
cd backend
cp .env.example .env   # Windows: Copy-Item .env.example .env
npm install
npx prisma migrate dev   # applies migrations; runs seed when configured
npm run dev
```

Production-style apply (no dev prompts): `npx prisma migrate deploy` then `npx prisma db seed`.

Build and run compiled output:

```bash
npm run build
npm start
```

## Environment variables

| Variable        | Description                                      |
| --------------- | ------------------------------------------------ |
| `DATABASE_URL`  | SQLite connection string, e.g. `file:./dev.db`   |
| `JWT_SECRET`    | **Min 16 characters**; used to sign/verify JWTs  |
| `JWT_EXPIRES_IN`| Token lifetime (e.g. `7d`, `1h`)               |
| `PORT`          | HTTP port (default `4000`)                       |
| `NODE_ENV`      | `development` \| `test` \| `production`        |

## Migrations and seed

- **Migrations**: `npx prisma migrate dev` (development) or `npx prisma migrate deploy` (CI/prod-like).
- **Seed**: `npm run db:seed` (runs `tsx prisma/seed.ts`).

Seeded accounts (password for all active users: **`Password123!`**):

| Email               | Role    | Status   |
| ------------------- | ------- | -------- |
| admin@example.com   | ADMIN   | ACTIVE   |
| analyst@example.com | ANALYST | ACTIVE   |
| viewer@example.com  | VIEWER  | ACTIVE   |
| inactive@example.com| VIEWER  | INACTIVE |

The seed also inserts sample `FinancialRecord` rows if the table is empty.

## API response format

**Success**

```json
{ "success": true, "data": { } }
```

**Error**

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

## API endpoints

Base URL: `http://localhost:4000` (unless `PORT` is changed).

All routes except `POST /auth/login` and `GET /health` require `Authorization: Bearer <token>`.

### Auth

| Method | Path          | Description        |
| ------ | ------------- | ------------------ |
| POST   | `/auth/login` | Issue JWT          |
| GET    | `/auth/me`    | Current user profile |

### Users (ADMIN only)

| Method | Path                 | Description                          |
| ------ | -------------------- | ------------------------------------ |
| POST   | `/users`             | Create user (hashed password)        |
| GET    | `/users`             | List users                           |
| PATCH  | `/users/:id`         | Update email, name, role             |
| PATCH  | `/users/:id/status`  | Set `ACTIVE` or `INACTIVE`           |

### Records

| Method | Path            | Roles allowed | Description                |
| ------ | --------------- | ------------- | -------------------------- |
| GET    | `/records`      | All authenticated | List + filters (below) |
| GET    | `/records/:id`  | All authenticated | Get one                  |
| POST   | `/records`      | ADMIN         | Create (`createdBy` = caller) |
| PATCH  | `/records/:id`  | ADMIN         | Update                     |
| DELETE | `/records/:id`  | ADMIN         | Delete                     |

**`GET /records` query parameters** (all optional except defaults):

- `page` (default `1`), `pageSize` (default `20`, max `100`)
- `type`: `INCOME` \| `EXPENSE`
- `category`: substring match
- `dateFrom`, `dateTo`: ISO-8601 datetimes (inclusive range on `date`)
- `search`: substring match on `notes` or `category`

### Dashboard

| Method | Path                           | Who may call                                      |
| ------ | ------------------------------ | ------------------------------------------------- |
| GET    | `/dashboard/summary`           | VIEWER, ANALYST, ADMIN                            |
| GET    | `/dashboard/recent-activity`   | VIEWER, ANALYST, ADMIN                            |
| GET    | `/dashboard/category-breakdown`| ANALYST, ADMIN                                    |
| GET    | `/dashboard/trends`            | ANALYST, ADMIN                                    |

Optional query on all dashboard endpoints: `from`, `to` (ISO datetimes) to constrain `FinancialRecord.date`.

`GET /dashboard/recent-activity` also accepts `limit` (default `10`, max `50`).

### Health

| Method | Path       | Auth |
| ------ | ---------- | ---- |
| GET    | `/health`  | No   |

## Role permission matrix

| Capability | VIEWER | ANALYST | ADMIN |
| ---------- | :----: | :-----: | :---: |
| Log in (must be `ACTIVE`) | Yes | Yes | Yes |
| `GET /auth/me` | Yes | Yes | Yes |
| `GET /records`, `GET /records/:id` | Yes | Yes | Yes |
| `POST/PATCH/DELETE /records` | No | No | Yes |
| `GET /dashboard/summary` | Yes | Yes | Yes |
| `GET /dashboard/recent-activity` | Yes | Yes | Yes |
| `GET /dashboard/category-breakdown` | No | Yes | Yes |
| `GET /dashboard/trends` | No | Yes | Yes |
| All `/users` routes | No | No | Yes |

**Inactive users** cannot log in and are rejected by the auth middleware on every protected request, even with an old token.

## Sample requests (curl)

Replace `TOKEN` with a JWT from login.

```bash
# Login
curl -s -X POST http://localhost:4000/auth/login \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"admin@example.com\",\"password\":\"Password123!\"}"

# Me
curl -s http://localhost:4000/auth/me -H "Authorization: Bearer TOKEN"

# List records (first page)
curl -s "http://localhost:4000/records?page=1&pageSize=10" \
  -H "Authorization: Bearer TOKEN"

# Dashboard summary
curl -s "http://localhost:4000/dashboard/summary" \
  -H "Authorization: Bearer TOKEN"

# Create record (ADMIN)
curl -s -X POST http://localhost:4000/records \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"amount\":120.5,\"type\":\"EXPENSE\",\"category\":\"Food\",\"date\":\"2025-04-01T12:00:00.000Z\",\"notes\":\"Lunch\"}"
```

## Testing

```bash
npm test
```

Includes unit tests for **RBAC policy helpers** and **dashboard aggregation math** (`src/lib/dashboardMath.ts`).

## Assumptions

1. **Viewer vs analyst dashboard split**: Viewers see **summary** and **recent activity** only; **category breakdown** and **monthly trends** are treated as “analytics” for **ANALYST** and **ADMIN** (documented above).
2. **Dashboard totals** exclude records with `status = VOID` (sample void row exists in the seed to demonstrate this).
3. **Amounts** are stored as `Decimal` in the database but returned as **numbers** in JSON for readability (acceptable for a demo; production systems often use fixed-point strings).
4. **Time zones**: record `date` is stored as UTC; monthly trends group by **UTC** month (`dashboardMath.monthKey`).
5. **Password policy**: minimum length **8** on user creation; no complexity rules beyond that.
6. **No refresh tokens** or password reset flows (out of scope for the assignment).

## Tradeoffs

- **SQLite** keeps setup friction low; concurrent writes and advanced analytics are limited compared to Postgres.
- **JWT in Authorization header** is simple; no cookie-based CSRF story (not required here).
- **Trends** load matching rows into memory before aggregating by month—fine for internship scale; at higher volume, SQL `GROUP BY` or materialized views would be preferable.
- **Per-request DB lookup** in `authenticate` ensures inactive users lose access immediately, at the cost of one query per request.

## Future improvements

- Refresh tokens, password reset, and email verification
- Audit log for admin actions and record mutations
- E2E tests with Supertest + test database
- OpenAPI document generated from Zod schemas
- Rate limiting and structured logging (pino)
- Move to Postgres for real deployments and richer SQL analytics

## Prisma schema location

The canonical data model is defined in `prisma/schema.prisma` (`User`, `FinancialRecord`, enums `Role`, `UserStatus`, `RecordType`, `RecordStatus`).
