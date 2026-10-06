# OrbitPM

A Vercel-native project management application for teams that need projects, tasks, Kanban workflow, comments, activity history, and lightweight operational visibility without maintaining a separate backend server.

## Architecture

```text
Browser
   │
   ▼
Next.js App Router (Vercel)
   ├── Server Components / Server-side authorization
   ├── Route Handlers (/api/*)
   └── Client Components (Kanban, forms, query cache)
   │
   ├──────────────► Better Auth
   │                  │
   │                  ▼
   └──────────────► PostgreSQL
                      ▲
                      │ Prisma ORM 7 + pg adapter
                      │
                Prisma Postgres
                (Vercel Marketplace)
```

The architecture intentionally starts as a modular monolith. The engineering standard requires escalation to additional services only when measured operational or domain requirements justify it.

## Core capabilities

- Email/password authentication with Better Auth.
- Per-user workspace membership and role-aware access.
- Project lifecycle: planning, active, on hold, completed, archived.
- Task workflow: todo, in progress, review, done.
- Priorities, due dates, descriptions, and optional assignees.
- Comments and immutable activity history.
- Dashboard metrics for projects, open work, overdue work, and completion.
- OpenAPI contract for JSON endpoints.
- Vitest unit tests, Playwright E2E tests, accessibility checks, and CI security gates.
- Vercel Analytics and Speed Insights hooks.

## Stack

- Next.js App Router + React + TypeScript
- pnpm + Biome + Lefthook + Conventional Commits
- Tailwind CSS + source-owned accessible UI components
- TanStack Query + React Hook Form + Zod
- Better Auth
- PostgreSQL + Prisma ORM 7 + `@prisma/adapter-pg`
- Vitest + Playwright + axe-core
- OpenAPI + Spectral
- GitHub Actions + CodeQL + Gitleaks + Semgrep + Trivy
- Vercel + Prisma Postgres

## Local setup

Requirements: Node 20.19+ (or a current Node 22/24 runtime), pnpm 10+, and a PostgreSQL connection string.

```bash
pnpm install
cp .env.example .env
pnpm db:generate
pnpm db:migrate
pnpm dev
```

Open `http://localhost:3000` and create an account.

### First production database migration

Use a direct PostgreSQL connection for Prisma migrations, then deploy the app. Do not run destructive migrations as part of every Vercel build.

```bash
pnpm db:migrate:deploy
```

## Vercel deployment

1. Push this repository to GitHub.
2. Import the repository into Vercel.
3. Add a PostgreSQL provider through the Vercel Marketplace. Prisma Postgres is the reference setup for this repository.
4. Set `BETTER_AUTH_SECRET` and `BETTER_AUTH_URL` in Vercel environment variables. `DATABASE_URL` is supplied by the database integration.
5. Use separate Preview and Production database credentials/branches. Keep production migrations controlled and auditable.
6. Deploy. The build runs `prisma generate` followed by `next build`.

Prisma's current Vercel guidance documents connection pooling for serverless deployments; Prisma Postgres provides built-in pooling. The repository keeps database access inside server-side Next.js code.

## Engineering pipeline

Inner loop:

```text
spec → code → focused tests → pre-commit/pre-push
```

CI loop:

```text
format → lint → typecheck → unit → integration/contract → build → security → E2E
```

Operational loop:

```text
preview → production → health verification → telemetry → rollback/runbook
```

## Useful commands

```bash
pnpm dev
pnpm validate
pnpm test
pnpm test:e2e
pnpm api:lint
pnpm db:studio
```

## Documentation

- `docs/requirements.md` — product requirements and acceptance criteria.
- `docs/architecture/` — context, container, data flow, deployment, threat model, ADRs.
- `docs/runbooks/` — incident response, rollback, restore, dependency outage, credentials, DR.
- `docs/api/openapi.yaml` — API contract.

## Deliberate Vercel deviations

Some pipeline tools are not deployed because doing so would violate the platform constraint or add infrastructure without benefit:

- No Kubernetes/GitOps stack.
- No self-hosted Prometheus/Grafana/Loki/Tempo.
- No pgBackRest server.
- No Redis/BullMQ worker in v0.1 because all core work is request/transaction bounded.
- No container image as a production deployment artifact; Vercel deploys the Next.js application directly.

These are documented as architectural choices rather than accidental omissions.
