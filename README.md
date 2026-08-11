# Ledgerly

**Production-ready freelancing finance OS** — clients, invoices, expenses, and cash-flow analytics.

| Layer | Stack |
| --- | --- |
| Frontend | **Angular 19** (standalone) + **Tailwind CSS** + Chart.js |
| Backend | **NestJS 11** REST API + JWT auth + class-validator |
| Database | **Neon Postgres** in production · **sql.js** local fallback |
| Monorepo | `apps/web` · `apps/api` |

## Why Ledgerly

Freelancers and small studios still juggle spreadsheets for billing. Ledgerly gives you:

- **Clients CRM** — search, notes, contact details  
- **Invoices** — line items, tax, status workflow (`draft → sent → paid / overdue / void`)  
- **Expenses** — categories, billable flag  
- **Dashboard** — paid revenue, outstanding AR, expenses, net, 6-month charts  

## Demo credentials

```
email:    demo@ledgerly.app
password: demo1234
```

Seed data (3 clients, 6 invoices, 8 expenses) is created automatically on first boot.

## Quick start

```bash
# API deps
cd apps/api && npm install && cd ../..

# Web deps
cd apps/web && npm install && cd ../..

# Terminal 1 — API (port 3001)
npm run dev:api

# Terminal 2 — Angular (port 8080, proxies /api → API)
npm run dev:web
```

Open http://localhost:8080 and sign in with the demo account.

### Production (single process)

```bash
npm run build
PORT=8080 DATABASE_URL=postgres://… JWT_SECRET=long-random npm run start:prod
```

Nest serves the Angular build and the `/api/*` routes on one port.

## Neon (Postgres)

Set `DATABASE_URL` to your Neon connection string (pooled or direct):

```bash
export DATABASE_URL="postgresql://user:pass@ep-xxx.region.aws.neon.tech/neondb?sslmode=require"
export JWT_SECRET="replace-me"
```

Without `DATABASE_URL`, the API uses an embedded **sql.js** database file (`ledgerly.sqlite`) so local demos work offline.

## Environment variables

| Variable | Required | Description |
| --- | --- | --- |
| `DATABASE_URL` | prod | Neon / Postgres connection string |
| `JWT_SECRET` | prod | JWT signing secret |
| `PORT` | no | API port (default `3001`, use `8080` when serving SPA) |
| `SEED` | no | Set `false` to skip demo seed |
| `SQLITE_PATH` | no | Local sql.js file path |

## Project structure

```
apps/
  api/          NestJS + TypeORM
  web/          Angular + Tailwind
scripts/
  ledgerly-smoke.mjs
```

## API surface

| Method | Path | Auth |
| --- | --- | --- |
| POST | `/api/auth/register` | public |
| POST | `/api/auth/login` | public |
| GET | `/api/auth/me` | JWT |
| GET/POST/PATCH/DELETE | `/api/clients` | JWT |
| GET/POST/PATCH/DELETE | `/api/invoices` | JWT |
| GET/POST/PATCH/DELETE | `/api/expenses` | JWT |
| GET | `/api/dashboard` | JWT |
| GET | `/api/health` | public |

## Tests

```bash
# API unit/e2e (Nest)
cd apps/api && npm test

# End-to-end HTTP smoke (API + web up)
node scripts/ledgerly-smoke.mjs
```

## Deploy

### Vercel (frontend) + Neon + API host

1. Create a Neon project and copy `DATABASE_URL`.
2. Deploy `apps/api` to any Node host (Railway, Render, Fly, or a VPS):
   - Build: `cd apps/api && npm ci && npm run build`
   - Start: `PORT=3001 node dist/main.js`
   - Env: `DATABASE_URL`, `JWT_SECRET`
3. Deploy `apps/web` to Vercel with build command `npm run build` and output `dist/web/browser` (or `dist/web`).
4. Set Angular `environment.prod.ts` `apiUrl` to your API origin if not same-host.

### Single Docker image

```bash
docker build -t ledgerly .
docker run -p 8080:8080 -e DATABASE_URL=… -e JWT_SECRET=… ledgerly
```

## License

MIT
