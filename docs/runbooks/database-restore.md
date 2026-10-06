# Database Restore

This application relies on managed PostgreSQL backup/point-in-time recovery rather than self-hosted pgBackRest because production hosting is intentionally Vercel-only.

Before a restore:

- freeze destructive application changes;
- identify the latest known-good timestamp;
- capture current deployment/version information;
- restore into an isolated database or branch when supported;
- verify migrations and health checks;
- run smoke tests before reconnecting production traffic.

RPO/RTO targets must be set to the actual database provider plan rather than assumed in code.
