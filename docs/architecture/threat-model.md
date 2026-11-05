# Threat Model

## Assets

- User sessions and credentials
- User data and isolation boundaries
- Project/task/comment data
- Database connection secrets
- OAuth provider credentials

## Main threats

1. Cross-user data access.
2. Unauthorized project mutation or deletion.
3. Injection through mutable input.
4. Account/session compromise.
5. Secret leakage through Git, CI logs, or committed local database files.
6. Malicious or accidental destructive task operations.
7. Dependency and software supply-chain vulnerabilities.
8. Clickjacking, MIME sniffing, and weak transport/referrer policy.
9. Abuse of public account creation in an internal application.

## Trust boundaries

```text
Browser
  │
  ├── Better Auth session/cookie boundary
  │
  ▼
Next.js route handlers / Server Components
  │
  ├── Zod validation
  ├── resource authorization
  │
  ▼
Prisma ORM + PostgreSQL
```

## Controls

- Better Auth manages password hashing and sessions.
- Better Auth trusted-origin checks remain enabled; development-only localhost origins are not trusted in production.
- Production signup is disabled by default unless `ALLOW_PUBLIC_SIGNUP=true` or `ALLOWED_EMAIL_DOMAINS` contains the user's domain.
- Every resource query is explicitly authorized through shared project ownership and role-based policy checks (creatorId, assigneeId).
- Project `PATCH` and `DELETE` operations require the authenticated user to be the project creator.
- Zod validates API payloads.
- Prisma parameterizes database access.
- Secrets live in environment variables and production has no deterministic secret fallback.
- HTTP response security headers provide MIME, framing, referrer, permissions, and production transport hardening.
- Local SQLite databases and TypeScript build artifacts are ignored and removed from the repository.
- Gitleaks, Trivy, Semgrep, CodeQL, TruffleHog, and OpenSSF Scorecard are used in the security audit workflow.
- Production deployment is blocked when relevant quality/security checks fail.
