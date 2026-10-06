# ADR 0003 — Vercel-Native Observability

## Status
Accepted

## Decision

Use Vercel Analytics and Speed Insights for product/performance telemetry and structured server logs plus `/api/health` for basic runtime health. Add Sentry as an optional external error sink when the deployment requires application-level alerting.

## Rationale

Self-hosting Prometheus/Grafana/Loki/Tempo would contradict the all-Vercel constraint for v0.1 and would add infrastructure before there is an operational need.

## Consequence

The system intentionally does not ship a self-hosted telemetry platform. When SLO complexity or multi-service tracing becomes material, evaluate OpenTelemetry export to an external managed backend.
