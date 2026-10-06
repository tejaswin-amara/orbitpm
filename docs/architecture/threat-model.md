# Threat Model

## Assets

- User sessions and credentials
- Workspace membership boundaries
- Project/task/comment data
- Database connection secrets

## Main threats

1. Cross-workspace data access.
2. Injection through mutable input.
3. Account/session compromise.
4. Secret leakage through Git or logs.
5. Malicious or accidental destructive project operations.
6. Dependency/supply-chain vulnerabilities.

## Controls

- Better Auth manages password hashing and sessions.
- Every resource query includes workspace scope.
- Zod validates API payloads.
- Prisma parameterizes database access.
- Secrets live in environment variables and are scanned by Gitleaks.
- CodeQL/Semgrep and dependency scanning are CI gates.
- Destructive project actions require an admin/owner role.
- Production deployment is blocked when relevant quality/security checks fail.
