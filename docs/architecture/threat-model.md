# Threat Model

## Assets

- User sessions and credentials
- Project/task/comment data
- Database connection secrets
- OAuth provider credentials

## Main threats

1. Unauthorized project mutation or deletion.
2. Injection through mutable input.
3. Account/session compromise.
4. Secret leakage through Git, CI logs, or committed local database files.
5. Malicious or accidental destructive task operations.
6. Dependency and software supply-chain vulnerabilities.
7. Clickjacking, MIME sniffing, and weak transport/referrer policy.
8. Abuse of public account creation in an internal application.

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
- Better Auth production rate limiting is retained. citeturn140506search0
- Production signup is disabled by default unless `ALLOW_PUBLIC_SIGNUP=true` or `ALLOWED_EMAIL_DOMAINS` contains the user's domain.
- Project `PATCH` and `DELETE` operations require the authenticated user to be the project creator.
- Zod validates API payloads.
- Prisma parameterizes database access.
- Secrets live in environment variables and production has no deterministic secret fallback.
- HTTP response security headers provide MIME, framing, referrer, permissions, and production transport hardening.
- Local SQLite databases and TypeScript build artifacts are ignored and removed from the repository.
- Gitleaks, Trivy, Semgrep, CodeQL, TruffleHog, and OpenSSF Scorecard are used in the security audit workflow.
- Prowler is run only when repository cloud/IaC configuration exists; the current repository has no such configuration.
- Lynis audits the disposable audit runner rather than production infrastructure.
- Cloudflare's security-audit-skill is used as source-first audit guidance rather than treated as an executable scanner.
