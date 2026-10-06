# OrbitPM Agent Rules

## Inspect first

Read repository conventions, manifests, Prisma schema, architecture ADRs, and existing tests before changing code.

## Preserve the architecture

OrbitPM is a Vercel-hosted Next.js modular monolith with PostgreSQL. Do not introduce a second backend framework, microservices, Redis, Kubernetes, or a separate worker without a measured requirement and an ADR.

## Required gates

After logical changes, run targeted tests. Before merge, run `pnpm validate` and the CI security gates. Never disable a linter or security scan to make CI green.

## TypeScript rules

Use strict TypeScript. Do not use `any`. Validate external input at boundaries with Zod. Keep authorization on the server even when UI hides unauthorized actions.

## Database rules

All application data access goes through Prisma. Use migrations for schema changes. Keep indexes tied to actual query patterns. Do not write raw SQL unless Prisma cannot express the required operation.

## UI rules

Prefer accessible, source-owned components. Use Lucide for icons. Keep interaction state in client components and data access in server routes/services.

## Documentation

When behavior or architecture changes, update README/docs/ADR/runbooks in the same change.
