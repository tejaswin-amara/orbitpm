# OrbitPM Agent Rules

## Ponytail operating principle

Lazy means efficient, not careless. Before writing code:

1. Does this need to exist?
2. Does it already exist in OrbitPM?
3. Can the standard library or browser do it?
4. Can an installed dependency do it?
5. Only then write the minimum correct implementation.

Deletion over addition. Reuse over duplication. One abstraction only when the problem actually needs one.

This rule never overrides security, trust-boundary validation, authorization, data-loss prevention, accessibility, required tests, or explicit product requirements.

## Inspect first

Read repository conventions, manifests, Prisma schema, architecture ADRs, and existing tests before changing code. Trace the actual request/data flow end to end.

## Preserve the architecture

OrbitPM is a Vercel-hosted Next.js modular monolith with PostgreSQL. Do not introduce a second backend framework, microservices, Redis, Kubernetes, or a separate worker without a measured requirement and an ADR.

## Required gates

After logical changes, run targeted tests. Before merge, run pnpm validate and the CI security gates. Never disable a linter or security scan to make CI green.

## TypeScript rules

Use strict TypeScript. Do not use any. Validate external input at boundaries with Zod. Keep authorization on the server even when UI hides unauthorized actions.

## Database rules

All application data access goes through Prisma. Use migrations for schema changes. Keep indexes tied to actual query patterns. Do not write raw SQL unless Prisma cannot express the required operation.

## UI rules

Prefer accessible, source-owned components. Use Lucide for icons. Keep interaction state in client components and data access in server routes/services.

## External integrations

Use the public-apis catalog for discovery only. Every actual provider integration requires explicit auth/scopes, timeout/retry policy, response validation, and an ADR.

## AI-agent workflow

Inspect the repository before editing, preserve project conventions, never silently replace frameworks, run targeted tests after each logical change, run the full gate before merge, never bypass security checks to make CI green, and document deliberate architecture deviations.

## Documentation

When behavior or architecture changes, update README, docs, ADRs, and runbooks in the same change.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in node_modules/next/dist/docs/ before writing code. Heed deprecation notices.

<!-- END:nextjs-agent-rules -->
