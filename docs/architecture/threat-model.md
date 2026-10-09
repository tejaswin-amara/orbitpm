# Threat Model

## Assets

- User sessions and credentials
- User data and isolation boundaries
- Project/task/comment data
- Database connection secrets

## Main threats

1. Cross-user data access.
2. Injection through mutable input.
3. Account/session compromise.
4. Secret leakage through Git or logs.
5. Malicious or accidental destructive project operations.
6. Dependency/supply-chain vulnerabilities.

## Controls

- Better Auth manages password hashing and sessions.
- Every resource query is explicitly authorized through shared project ownership and role-based policy checks (creatorId, assigneeId).
- Zod validates API payloads.
- Prisma parameterizes database access.
- Secrets live in environment variables and are scanned by Gitleaks.
- CodeQL and dependency scanning are CI gates.
- Destructive project actions strictly require an admin or creator role evaluated through central authorization policies.
- Production deployment is blocked when relevant quality/security checks fail.
