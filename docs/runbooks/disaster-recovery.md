# Disaster Recovery

The application is stateless at the compute layer. Recovery focuses on restoring managed PostgreSQL and redeploying a known-good Vercel build.

Minimum recovery sequence:

1. Restore PostgreSQL using provider-managed backup/PITR.
2. Verify schema/migrations.
3. Set or confirm Vercel database environment variables.
4. Deploy the last known-good commit.
5. Run `/api/health` and browser smoke tests.
6. Record the recovery timeline and validate user-visible flows.
