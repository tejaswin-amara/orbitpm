# OrbitPM comprehensive audit

Run the security pipeline against the repository and classify findings before changing code.

1. Inspect package manifests, Prisma schema, API routes, CI workflows, auth configuration, and current tests.
2. Run dependency and filesystem scanning, Semgrep, CodeQL, Gitleaks, TruffleHog, Scorecard, OpenAPI validation, ZAP/Lighthouse where applicable, and SBOM generation.
3. Deduplicate findings. Prioritize secrets/RCE/injection, then high-confidence web vulnerabilities, dependency risk, supply-chain policy, and quality findings.
4. Trace each finding to its real source and fix the root cause with the smallest safe diff.
5. Add one focused regression test for each non-trivial code fix.
6. Run the full validation gate before claiming completion.
7. Update SECURITY_AUDIT_RESULTS.md, ADRs/runbooks, and the PR summary with evidence.

Do not downgrade scanner failures or suppress findings without a documented false-positive rationale.
