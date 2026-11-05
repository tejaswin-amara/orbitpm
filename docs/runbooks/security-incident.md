# Security Incident Runbook

## 1. Contain

- Stop the affected deployment or disable the vulnerable path.
- Preserve relevant CI logs, Vercel deployment identifiers, and database timestamps.
- Do not delete evidence before the incident record is created.

## 2. Credentials

For any suspected secret exposure:

1. Rotate the affected provider credential immediately.
2. Review recent auth and deployment activity.
3. Run Gitleaks and TruffleHog against the full Git history.
4. Replace source references with environment variables.
5. Re-run the complete security pipeline.

Use the credential rotation runbook for provider-specific steps.

## 3. Code vulnerabilities

- Reproduce the issue with the smallest safe test.
- Fix the root cause at the shared trust boundary.
- Add a regression test.
- Run targeted tests, full validation, then security scans.
- Record the CVE/CWE or internal finding identifier in the security audit report.

## 4. Recovery

Rollback the Vercel deployment when the current build cannot be trusted. Restore the database only when data integrity is affected; do not treat application rollback as a substitute for database recovery.

## 5. Close

Close the incident only after:

- exploitability is addressed,
- credentials are rotated where needed,
- monitoring/alerts are restored,
- regression coverage exists,
- documentation and the security report are updated.
