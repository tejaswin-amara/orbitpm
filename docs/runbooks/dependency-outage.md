# Dependency Outage

If authentication or the managed database is unavailable, avoid repeated destructive retries. Use read-only behavior where safe, surface a neutral error to the user, and monitor the provider status page. Restore normal writes only after the dependency health check recovers.
