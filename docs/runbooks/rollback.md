# Rollback

Application rollback: use the Vercel deployment history to promote the last known-good deployment.

Database rollback: prefer a forward fix for additive migrations. For destructive migrations, follow the database provider's restore procedure and verify the application against the restored schema before reopening traffic.
