# ADR 0001 — Modular Monolith

## Status
Accepted

## Decision

Deploy one Next.js application containing the UI, route handlers, authentication integration, and application services.

## Rationale

The first release has straightforward request/transaction workloads and no measured reason to split services. A modular monolith preserves deployment simplicity and keeps security boundaries explicit.

## Consequence

When a workload requires independently scaling a worker, real-time transport, or domain service, introduce the smallest separate component justified by measurements and document it in a new ADR.
