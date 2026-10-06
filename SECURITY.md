# Security Policy

## Reporting

Do not disclose exploitable vulnerabilities in public issues. Report security problems privately to the repository maintainers.

## Baseline controls

OrbitPM uses server-side authorization checks, Zod validation, parameterized ORM queries, secret scanning, static analysis, dependency scanning, and browser-level security testing.

## Secrets

Never commit `.env` files, tokens, credentials, private keys, or production database URLs.
