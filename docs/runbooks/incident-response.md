# Incident Response

1. Confirm impact using Vercel logs, `/api/health`, and the current deployment state.
2. Identify whether the issue is application, authentication, or database related.
3. Stop rollout by promoting the last known good deployment if required.
4. Preserve relevant logs and request IDs before changing production.
5. Record the incident, timeline, root cause, and corrective actions.
