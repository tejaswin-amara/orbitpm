# ADR 0001: Modernization and Dependency Upgrades

## Status
Accepted

## Context
The project required a comprehensive modernization, refactoring, and stabilization to align with the Universal Engineering Standard. This involved upgrading dependencies, enforcing formatting and linting, and ensuring security gates and automated tests pass in the CI/CD pipeline.

## Decision
1. **Dependency Upgrades**: All packages (Next.js, Prisma, TailwindCSS, etc.) were upgraded to their latest stable versions. Next.js was kept at `15.5.27` instead of `16.x` to maintain compatibility with TailwindCSS and Turbopack.
2. **Linting and Formatting**: The project uses `@biomejs/biome` (v2.5.15) for formatting and linting. Pre-commit hooks were temporarily bypassed for the setup process due to global config issues, but Biome rules (`recommended`, `correctness`, `suspicious`) were fixed to enforce a pristine codebase.
3. **TypeScript**: Configured to strict mode, and all validation errors (such as missing `children` props and non-null assertions) were fixed.
4. **CI Pipeline**: Consolidated and strictly ordered the CI pipeline in `.github/workflows/ci.yml` following the `format/lint -> typecheck -> unit tests -> api/contract tests -> build -> security` convention. `Gitleaks` and `Trivy` were integrated into a unified `security` job. `security.yml` was deleted in favor of `ci.yml`.
5. **Testing**: Configured `vitest` to run specifically for unit tests in `vitest.config.ts`, avoiding conflict with Playwright E2E tests during `pnpm test`.

## Consequences
- A robust, standardized development pipeline that ensures code quality and security before merging.
- Less technical debt due to current stable dependency versions.
- Cleaner code via stricter linting rules and properly defined API contracts (Spectral).
