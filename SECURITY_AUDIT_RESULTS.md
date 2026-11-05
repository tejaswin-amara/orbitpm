# OrbitPM Security Audit Results

**Repository:** tejaswin-amara/orbitpm  
**PR:** #16 — `security: comprehensive audit and remediation`  
**Audit branch:** `security/comprehensive-audit-20261006`  
**Latest remediation head:** `ca93ad72ff67cb77bb657d6ee90597f77ab31dd0`

## Scope and engineering baseline

OrbitPM is governed by the uploaded Awesome Dev Pipeline as the default engineering operating model, with deviations recorded in ADRs/PRs. fileciteturn164file0L5-L8

The implementation also follows:

- **Ponytail:** inspect first, YAGNI, root-cause fixes, reuse before abstraction, minimal dependencies, and no simplification of security or validation.
- **Awesome Claude Code:** progressive agent context, repository-local review commands, explicit validation ladders, and agent governance.
- **Public APIs:** discovery catalog only; external providers remain optional server-side adapters and do not become a core runtime dependency.

## Baseline audit evidence

The successful baseline comprehensive audit run was GitHub Actions run **37504766666**.

| Tool | Baseline result |
| --- | --- |
| Trivy | 0 vulnerability findings |
| Semgrep | 5 MEDIUM supply-chain/configuration findings |
| CodeQL | 0 findings |
| Gitleaks | 2 historical secret findings |
| pnpm audit | 0 production dependency vulnerabilities |
| OpenSSF Scorecard | 7.8 / 11 checks |
| Prowler | Not applicable; no cloud/IaC repository configuration |
| Lynis | Audit-runner baseline collected |
| Lighthouse | Performance 0.62, Accessibility 1.00, Best Practices 0.96, SEO 1.00 |
| SBOM | 463 components |

Baseline tool versions included Trivy 0.75.0, CodeQL 2.27.1, Semgrep 1.179.0, Gitleaks 8.30.1, TruffleHog 3.98.1, Node 22.23.3 and pnpm 12.9.1.

## Confirmed findings and fixes

### ORB-SEC-001 — High — Broken project authorization

Project lifecycle mutation endpoints authenticated users but did not enforce project ownership/administrator authorization.

**Fix**
- Added `src/lib/authz.ts` as the shared server-side authorization guard.
- Project creators may manage their projects.
- `ADMIN` users may manage projects created by another user.
- Other authenticated users receive HTTP 403.
- Regression tests cover owner, non-owner and admin cases.
- The Prisma `User.role` model and migration make the authorization policy explicit.

### ORB-SEC-002 — High — Deterministic authentication/database defaults

Production configuration had deterministic fallback values for the PostgreSQL connection and Better Auth secret.

**Fix**
- Removed production defaults from `src/lib/env.ts`.
- Required runtime configuration is validated with Zod.
- CI uses process-local ephemeral secrets.
- `.env.example` contains placeholders only.

### ORB-SEC-003 — High — Development-origin trust in production

Localhost origins were trusted unconditionally by Better Auth.

**Fix**
- `localhost` and `127.0.0.1` are trusted only outside production.
- Production trusted origins come from the configured Better Auth URL.

### ORB-SEC-004 — Medium — Browser security headers

**Fix**
- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY`
- strict referrer policy
- restrictive permissions policy
- production HSTS
- framework power-header disabled

### ORB-SEC-005 — High — Historical hardcoded secret material

Gitleaks identified two historical CI fallback/secret patterns.

**Fix**
- Current source no longer contains deterministic credential fallbacks.
- CI uses environment variables or process-local secrets.
- `.gitleaks.toml` only allowlists GitHub Actions secret *references*, not secret values.

**Residual**
The Git history was not rewritten. A destructive history rewrite should only be performed as a separate coordinated operation after real credential rotation/revocation.

### ORB-SEC-006 — Medium — Supply-chain policy gaps

Semgrep identified missing dependency release-age, exotic-subdependency and trust-policy controls.

**Fix**
`pnpm-workspace.yaml` now enforces:

```yaml
ignoreScripts: true
blockExoticSubdeps: true
trustPolicy: no-downgrade
minimumReleaseAge: 1440
```

That keeps the one-day pnpm release-age floor while Renovate uses a stronger seven-day minimum release age.

Six exact-version trust-policy exceptions are documented for currently locked packages whose upstream ownership/repository provenance was verified:

- `@vercel/cli-config@0.3.1`
- `@vercel/cli-exec@1.0.1`
- `@vercel/functions@3.9.11`
- `@vercel/oidc@4.0.0`
- `prisma@7.10.0`
- `rollup@2.80.0`

No wildcard trust exclusion was added.

### ORB-SEC-007 — Medium — Mutable CI action references

**Fix**
Security-sensitive GitHub Actions are pinned to immutable commit SHAs and checkout uses `persist-credentials: false`.

### ORB-SEC-008 — Medium — Deployment migration failure mode

**Fix**
Production migration workflow now fails when database credentials are missing rather than printing a warning and continuing.

### ORB-SEC-009 — Medium — Test and agent governance gaps

**Fix**
- `AGENTS.md` and `CLAUDE.md` align to the dev-pipeline inner/middle/outer loops.
- Added repository-local comprehensive audit and engineering review commands.
- Added `.claude/commands/comprehensive-audit.md` and `.claude/commands/engineering-review.md`.
- Added Vitest compatibility for Next's `server-only` marker without weakening production behavior.
- Commitlint explicitly recognizes the project-specific `security` Conventional Commit type.

### ORB-SEC-010 — Medium — Generated/local artifacts committed to source

**Fix**
- Removed committed local database/build artifacts.
- Expanded `.gitignore` for database and TypeScript build-state files.

## Security pipeline

The repository now runs a comprehensive audit pipeline covering:

```text
dependency install policy
→ Scorecard
→ Trivy
→ Semgrep
→ CodeQL
→ Gitleaks
→ pnpm audit
→ TruffleHog
→ Prowler (when IaC/cloud config exists)
→ Lynis
→ build
→ OWASP ZAP
→ SBOM
→ Lighthouse
→ evidence summary + artifact upload
```

The regular CI path is:

```text
format
→ lint
→ typecheck
→ unit tests
→ commit policy
→ OpenAPI contract
→ build
→ security
→ E2E
```

## Public APIs integration policy

`public-apis/public-apis` is treated as a discovery catalog only.

Future providers must remain:

- server-side;
- explicitly authenticated/scoped;
- timeout and retry bounded;
- response-schema validated;
- isolated behind a small adapter;
- documented in an ADR.

No new external provider was made a mandatory OrbitPM runtime dependency.

## Claude Code / agent governance

The repository incorporates the useful parts of `awesome-claude-code` without copying a large agent framework:

- progressive context loading;
- local commands for repeatable reviews;
- explicit verification ladders;
- no security-gate bypasses;
- repository inspection before editing.

This is intentionally small and project-specific.

## Ponytail application

The system was not expanded into Redis, queues, Kubernetes, separate services, or a second backend.

The architecture remains a Vercel-hosted Next.js modular monolith because the repository has no measured requirement for those escalation paths.

## Residual risk

1. **Historical secret exposure:** current tree is clean, but Git history still contains the historical Gitleaks hits. Rotate/revoke any credential if those values were ever real.
2. **Development-only advisory monitoring:** continue monitoring transitive development tooling findings separately from the production graph.
3. **Operational tooling:** Prowler and production-host Lynis are contextual controls; Vercel-managed infrastructure cannot be represented accurately by scanning the GitHub-hosted runner.

## Verification status

Latest CI on the current remediation line has reached green dependency installation, Prisma generation, formatting, linting, typecheck and the full 107-test unit suite. The current branch is additionally running the OpenAPI, build, security and audit gates.

Do not merge the PR until the newest CI and comprehensive-audit workflows report success on the same head commit.

## Final repository artifacts

- `AGENTS.md`
- `CLAUDE.md`
- `.claude/commands/comprehensive-audit.md`
- `.claude/commands/engineering-review.md`
- `.github/workflows/ci.yml`
- `.github/workflows/codeql.yml`
- `.github/workflows/comprehensive-security-audit.yml`
- `SECURITY.md`
- `SECURITY_AUDIT_RESULTS.md`
- `docs/architecture/adr/0003-security-and-dev-pipeline.md`
- `docs/integrations/public-apis.md`
- `pnpm-workspace.yaml`
- `renovate.json`
- `.gitleaks.toml`

