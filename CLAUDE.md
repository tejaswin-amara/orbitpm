# OrbitPM — Agent Operating Rules

Read AGENTS.md first. It is the canonical repository policy; this file adds Claude Code-specific entry points.

## Before editing

1. Inspect the files and runtime flow you will actually change.
2. Reuse existing components, helpers, dependencies, and patterns.
3. Prefer the smallest correct change. Do not introduce new frameworks or infrastructure without an ADR.
4. Preserve public API contracts unless the task explicitly changes them.
5. Never weaken validation, authorization, security checks, or accessibility to make a test pass.

## Definition of done

Every non-trivial change leaves behind:
- a focused test,
- security consideration,
- documentation/ADR update when behavior or architecture changes,
- a rollback path for operationally meaningful changes.

## Verification ladder

targeted test
→ format/lint/typecheck
→ contract checks
→ full test suite
→ build
→ security scans
→ E2E

## Claude Code extensions

Use repository-local commands under .claude/commands/ for repeatable reviews. Keep agent instructions progressive: load the smallest amount of context needed for the current task.

## Safety

Do not paste secrets into source, tests, fixtures, issues, PRs, or logs. Use environment variables and ephemeral CI values. Never bypass a security gate.
