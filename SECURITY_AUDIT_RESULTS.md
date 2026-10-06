# OrbitPM Security Audit Results

**Repository:** tejaswin-amara/orbitpm  
**Pull Request:** #16 — security: comprehensive audit and remediation  
**Audit branch:** security/comprehensive-audit-20261006  
**Audit date:** 2026-10-06  
**Dependency remediation commit:** 5a64312aae53b661c796c3719bf5506385cd4a7d

## Executive summary

OrbitPM was audited as a Next.js 16 / React / TypeScript / Prisma / PostgreSQL / Better Auth application with a Vercel deployment model.

The audit identified and remediated:

- Broken server-side authorization on project lifecycle mutations.
- Deterministic authentication and database credential fallbacks.
- Production trust of local development origins.
- Missing baseline security response headers.
- Transitive dependency vulnerabilities in `deepmerge-ts`, `mysql2`, and `source-map-js`.
- CI supply-chain weaknesses from mutable GitHub Action references and excessive workflow permissions.
- Missing minimum-release-age policy (3 days) in the dependency pipeline.
- Missing dedicated CodeQL workflow.
- Secret-scanning false-positive amplification caused by scanning generated dependencies and persisted checkout credentials.
- Inconsistent agent/developer governance and incomplete security documentation.
- Temporary committed local database/build artifacts.

The repository now has a centralized pnpm 12 security policy in `pnpm-workspace.yaml`, including explicit build approvals, release-age controls, and audited transitive overrides.

## Confirmed findings

| ID | Severity | CWE / advisory | Finding | Remediation |
|---|---|---|---|---|
| ORB-SEC-001 | High | CWE-862 / CWE-639 | Project PATCH/DELETE endpoints authenticated the caller but did not authorize the caller against project ownership. | Added server-side creator checks with HTTP 403 responses and regression tests. |
| ORB-SEC-002 | High | CWE-798 / secret management | `BETTER_AUTH_SECRET` and PostgreSQL defaults were deterministic and embedded in application defaults/CI. | Removed production defaults; CI now uses ephemeral process-local secrets; environment validation is mandatory. |
| ORB-SEC-003 | High | CWE-346 | Local development origins were always trusted by Better Auth configuration. | Localhost/127.0.0.1 are trusted only outside production. |
| ORB-SEC-004 | Medium | CWE-693 | Baseline browser security headers were incomplete. | Added nosniff, frame denial, referrer, permissions, and production HSTS headers. |
| ORB-SEC-005 | High | CVE-2026-40345 | `deepmerge-ts` vulnerable release in the dependency graph. | pnpm override to `>=8.0.0`; production dependency audit now passes. |
| ORB-SEC-006 | High | GHSA-3f6p-5ww8-9rcr | `mysql2` authentication downgrade vulnerability. | Override to `>=3.23.1`; production dependency audit now passes. |
| ORB-SEC-007 | Medium | GHSA-rgwj-5xj2-c3m3 | `mysql2` zlib resource exhaustion exposure. | Same `mysql2 >=3.23.1` override. |
| ORB-SEC-008 | High | CVE-2026-93749 / GHSA-68fv-2mgg-jv7q | `source-map-js` vulnerable release. | Lockfile remediation moved the graph to `1.2.2`; production audit passes. |
| ORB-SEC-009 | Medium | supply-chain | Semgrep identified missing dependency release-age controls. | Added npm/pnpm release-age policy and Renovate minimum release age (3 days). |
| ORB-SEC-010 | Medium | supply-chain | CI workflows used mutable action tags and broader permissions than required. | Pinned security-sensitive Actions to immutable SHAs and narrowed job permissions. |
| ORB-SEC-011 | High | secret exposure | Gitleaks identified two historical CI credential/fallback values. | Current tree no longer contains them. Git history was not rewritten because the requested destructive history rewrite condition was not explicitly invoked. Rotate any value if it was ever real. |
| ORB-SEC-012 | High, residual | CVE-2026-93687 / GHSA-vfj7-8cjw-p6xm | `braces@3.0.3` remains through `@stoplight/spectral-cli -> fast-glob -> micromatch -> braces`. | No patched `braces` release exists in the advisory at audit time; the finding remains confined to the development-only Spectral toolchain. The dependency is dev-only and not in the production graph. Monitor upstream; do not replace it with an unreviewed Git dependency. |

## Initial scanner evidence

### Trivy

Initial filesystem/SCA scan reported 4 vulnerability findings:

- 3 High
- 1 Medium

The findings were the vulnerable `deepmerge-ts`, `mysql2`, and `source-map-js` versions described above.

The remediation lockfile was generated with pnpm's native audit fixer and then verified with `pnpm audit --prod` successfully.

### Semgrep

Initial scan reported 3 Medium supply-chain configuration findings:

- Missing minimum-release-age policy in npm configuration.
- Missing release-age policy in two Renovate package groups.

These were addressed with the repository pnpm policy and Renovate configuration.

### CodeQL

The first comprehensive-audit implementation generated an empty/missing SARIF artifact despite the CLI completing. The workflow was corrected to explicitly download the JavaScript/TypeScript query pack and fail when analysis cannot produce SARIF.

A dedicated pinned CodeQL GitHub Actions workflow was also added for recurring pull-request/main analysis.

### Gitleaks

Two historical findings were reported in previous versions of `.github/workflows/ci.yml`.

The current source no longer contains deterministic test credential fallbacks. The repository history was deliberately not rewritten because that is destructive and the audit request only called for history rewriting when explicitly instructed.

### TruffleHog

The initial filesystem scan produced 88 events, but none were verified secrets. Many events originated from generated dependency content and GitHub Actions checkout metadata.

The scanner was corrected to isolate `node_modules` and generated audit output and the checkout now disables persisted Git credentials.

### OpenSSF Scorecard

The initial Scorecard result was **6.6/10 across 11 checks**.

The remediation addressed the highest-value repository controls:

- Immutable GitHub Action references.
- Narrower workflow token permissions.
- Dedicated SAST coverage with CodeQL.
- Security policy and governance documentation.
- Dependency update automation.

Remaining scorecard observations such as packaging/binary-artifact heuristics should be treated separately from application runtime security; they do not justify introducing an unnecessary packaging or container pipeline.

### Prowler

**Not applicable.**

The repository does not contain AWS, Terraform, Kubernetes, CloudFormation, Pulumi, or Docker infrastructure requiring a cloud-context scan.

### Lynis

Lynis was run against the disposable GitHub-hosted audit runner. Its results are not represented as production host findings because OrbitPM's production runtime is Vercel-managed.

### Lighthouse

The first Lighthouse attempt was invalid because the local Next.js process was missing required environment variables. The audit workflow was corrected to start the production server with ephemeral audit-only credentials.

A fresh post-remediation Lighthouse run is currently waiting on GitHub Actions approval for the bot-pushed PR commit; the earlier score is therefore not used as a final production-security claim.

### OWASP ZAP

A baseline ZAP scan was added against the local production build. Findings are retained as workflow artifacts rather than silently discarded.

### SBOM

Trivy CycloneDX SBOM generation was added to the audit workflow. The initial production graph contained 466 components.

## Dev pipeline hardening

The repository now follows a deliberately small, stack-appropriate engineering pipeline:

- Conventional Commits + commitlint.
- Lefthook pre-commit/pre-push hooks.
- mise runtime/task definitions.
- Biome + TypeScript strictness.
- Vitest + Playwright + axe-core.
- OpenAPI + Spectral.
- Gitleaks, TruffleHog, Trivy, Semgrep, CodeQL, Scorecard, ZAP, and SBOM checks.
- Dependabot and Renovate release-age controls.
- Immutable Action references and least-privilege workflow permissions.
- AGENTS.md and CLAUDE.md with repository-inspection and minimality rules.
- Local `.claude/commands/` for validation, security review, and Ponytail-style minimality checks.
- SECURITY.md, security runbooks, ADRs, CODEOWNERS, and integration-selection guidance.

## Reference-project alignment

### Public APIs

The public-apis catalog is used as an integration discovery reference only. OrbitPM does not add a runtime dependency on the catalog. Candidate future providers are isolated behind server-side adapters with explicit authentication, timeouts, bounded retries, response validation, and an ADR before implementation.

### Awesome Claude Code

The repository now has agent governance that centralizes:

- progressive context loading,
- inspection before editing,
- reuse over reinvention,
- explicit verification ladders,
- security-gate preservation,
- repository-local commands,
- documentation updates for behavioral/architectural changes.

### Ponytail

The repository adopts the core Ponytail principle:

> Does this need to exist?

Before adding an abstraction, code path, dependency, service, or configuration layer, the workflow now evaluates existing repository capabilities, standard-library/browser capabilities, and installed dependencies before introducing new complexity.

## Verification

A full pre-remediation CI run succeeded across:

- dependency installation,
- Prisma client generation,
- formatting,
- linting,
- TypeScript typecheck,
- unit tests with coverage,
- commit message policy,
- OpenAPI contract linting,
- production build,
- Gitleaks,
- Trivy,
- Playwright E2E.

The dependency-remediation workflow subsequently succeeded in generating the audited pnpm graph and passed `pnpm audit --prod`.

The current PR head was generated by a GitHub Actions remediation commit. GitHub has placed the post-remediation PR checks in an **action_required** state, so the final post-lockfile CI/CodeQL/Lighthouse execution needs repository-level approval before it can run. This is a GitHub workflow-governance state, not an application test failure.

## History-rewrite decision

No destructive Git history rewrite was performed.

The current tree has no deterministic production authentication/database defaults and no current hardcoded credential fallback. The two historical Gitleaks findings should be treated as credential-rotation candidates if those values were ever used outside isolated CI testing.

## Residual risk

The only confirmed dependency finding that could not be eliminated is `braces@3.0.3` in the development-only Spectral dependency chain. The current GitHub Advisory Database lists affected versions through 3.0.3 and currently reports no patched release. The risk is limited to the dev/API-lint toolchain and is not present in the production dependency graph. https://github.com/advisories/GHSA-vfj7-8cjw-p6xm

Do not replace this package with an unreviewed Git commit merely to make scanners green. Prefer an upstream patched release or a maintained parent-package update when available.

## Recommended next action

Approve the GitHub Actions checks for PR #16, then rerun the post-remediation CI, CodeQL, and comprehensive audit workflows. No production deployment should be promoted until those checks report success on commit `5a64312aae53b661c796c3719bf5506385cd4a7d`.
