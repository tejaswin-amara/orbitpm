# Contributing

## Workflow

Use short-lived branches and Conventional Commits. Every pull request should explain the problem, the approach, the tests run, and any architecture/security implications.

## Definition of done

A production feature requires acceptance criteria, tests, security considerations, telemetry where appropriate, documentation/release notes, and rollback behavior.

Run `pnpm validate` before requesting review.

## Branch naming

Use prefixes such as `feat/`, `fix/`, `docs/`, `refactor/`, and `chore/`.

## Review

Prefer small, reviewable changes. Do not weaken validation, authentication, authorization, or security checks to make CI pass.
