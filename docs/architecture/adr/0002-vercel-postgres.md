# ADR 0002 — Managed PostgreSQL for Vercel

## Status
Accepted

## Decision

Use a managed PostgreSQL provider integrated through Vercel Marketplace, with Prisma ORM 7 and the PostgreSQL driver adapter.

## Rationale

The application is relational, authorization-heavy, and serverless. Managed connection pooling removes the need to operate a separate pooler while retaining normal PostgreSQL semantics.

## Consequence

Database backups, restore tooling, and connection limits follow the selected managed provider. The runbooks must describe provider-specific restoration procedures.
