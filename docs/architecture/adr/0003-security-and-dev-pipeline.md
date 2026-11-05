# ADR 0003 — Security and Development Pipeline Baseline

## Status

Accepted

## Decision

OrbitPM uses a stack-appropriate engineering baseline derived from the repository's Awesome Dev Pipeline:

- pnpm + Node 22 + mise
- Biome
- Conventional Commits + commitlint + Lefthook
- Next.js / React / source-owned accessible UI
- TanStack Query + React Hook Form + Zod
- PostgreSQL + Prisma
- Better Auth
- Vitest + Playwright + axe-core
- OpenAPI + Spectral
- Gitleaks + TruffleHog + Semgrep + CodeQL + Trivy
- OpenSSF Scorecard + SBOM + OWASP ZAP
- GitHub Actions + Dependabot
- AGENTS.md + CLAUDE.md with Ponytail-style minimality and repository inspection rules

The application remains a Vercel-hosted modular monolith.

## Deliberate exclusions

The following are not part of the current deployment because no measured requirement justifies them:

- Redis / Valkey
- BullMQ
- Kubernetes
- Prometheus / Grafana / Loki
- a second backend service
- a standalone integration worker

These remain documented escalation paths. Adding one requires an ADR, operational ownership, tests, telemetry, backup/recovery implications, and rollback behavior.

## External APIs

The public-apis repository is used as a discovery catalog only. External providers are implemented through small, server-side adapters with explicit authentication, timeouts, retries, schema validation, and failure isolation.

## Agent governance

Claude Code and other coding agents must inspect the repository before editing, preserve conventions, run targeted checks after each logical change, run the full gate before merge, never weaken security checks, and document deliberate architecture deviations.
