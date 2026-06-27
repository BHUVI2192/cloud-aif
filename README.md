# Cloud AIF — Shivamogga Local Services Marketplace

A web-first, request-first marketplace connecting Shivamogga homeowners with **verified** local service providers across five categories. Built with Next.js (App Router), TypeScript, Tailwind, Prisma, and Supabase Postgres.

> v1 scope: offline fulfilment, no in-app payments, no chat, no AI matching, single city — but the schema supports each of those without structural rewrites.

## Quick start (Supabase)

### 1. Install
```bash
npm install
```

### 2. Create a Supabase project
At supabase.com, create a project. Then go to **Project Settings → Database → Connection string** and copy two URLs.

### 3. Configure `.env`
```bash
cp .env.example .env
```
Fill in:
```
DATABASE_URL="postgresql://postgres.xxxx:[PASSWORD]@aws-0-<region>.pooler.supabase.com:6543/postgres?pgbouncer=true"
DIRECT_URL="postgresql://postgres.xxxx:[PASSWORD]@aws-0-<region>.pooler.supabase.com:5432/postgres"
NEXTAUTH_SECRET="<run: openssl rand -base64 32>"
NEXTAUTH_URL="http://localhost:3000"
```
- `DATABASE_URL` = the **Transaction pooler** URL (port 6543) — used by the app.
- `DIRECT_URL` = the **direct/session** URL (port 5432) — used for migrations.

### 4. Create tables + seed
```bash
npm run setup
```
This runs `prisma generate`, `prisma db push` (creates all tables in Supabase), and seeds the taxonomy, localities, settings, FAQs, and demo accounts.

### 5. Run
```bash
npm run dev
```
Open http://localhost:3000.

## Signing in (zero setup)
The app ships with a **dev credential login** so you don't need Google OAuth to try it. On `/login`, click a demo account:

| Role | Email |
|------|-------|
| Super admin | `admin@cloudaif.in` |
| Provider (approved) | `provider@example.com` |
| Customer | `customer@example.com` |

To enable real Google sign-in, set `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` in `.env` — the Google button activates automatically.

## What you can do end to end
- **Customer:** browse services → submit a request → track status timeline → review after completion.
- **Provider:** see the dashboard, accept/decline matched leads, view profile, services, availability, portfolio, reviews, verification status. (The seed assigns a sample lead to `provider@example.com`.)
- **Admin:** review the provider verification queue, approve/reject/suspend providers (writes an audit log + verification record), and monitor requests, reviews, complaints, users, categories, and settings.

## Scripts
| Command | Does |
|---------|------|
| `npm run setup` | generate + push schema + seed |
| `npm run dev` | start dev server |
| `npm run build` | production build |
| `npm run db:seed` | re-seed |
| `npm run db:reset` | drop + recreate + seed (destructive) |

## Project structure
```
prisma/
  schema.prisma        35 models, 25 enums, relation-verified
  seed.ts              taxonomy, localities, demo data
src/
  app/                 all public, provider, and admin routes + API handlers
  components/           SiteHeader, dashboards, forms, action widgets
  lib/
    db.ts              Prisma singleton
    auth.ts            NextAuth (credentials + optional Google)
    session.ts         getSession / requireRole helpers
    permissions.ts     role checks, isProviderPublic, canReviewRequest
    constants.ts       brand, palette, categories, localities, routes
    nav.ts             dashboard navigation
  middleware.ts        edge role enforcement for /admin and /provider
```

## Security model
- `/admin/*` requires ADMIN/SUPER_ADMIN; `/provider/*` requires PROVIDER (onboarding open to any signed-in user). Enforced in `middleware.ts` **and** re-checked in every page via `requireRoleOrRedirect`.
- Providers are public only when `APPROVED && isActive && !deletedAt`.
- Reviews allowed only on `COMPLETED` requests the user owns.
- Provider document URLs are stored privately and never rendered on public routes.

## Notes
- A few dashboard edit forms (provider settings, admin categories/settings) are read + stubbed-save in this build; their data loads live from the DB and the save handlers are the clear next wiring step (connect to a PATCH route). Everything in the customer→provider→admin core loop is fully functional.
- This was generated in a sandbox without access to Prisma's binary host, so `prisma generate` runs on **your** machine during `npm run setup`. All application code typechecks clean against the generated client.
