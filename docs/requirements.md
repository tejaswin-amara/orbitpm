# Product Requirements

## Goal

Provide a focused project-management product that a small team can deploy on Vercel without maintaining a separate API server or worker fleet.

## Users

- Project creators: own the projects they create and control project lifecycle mutations.
- Members: create projects, create and move tasks, comment, and inspect work in the single company.
- The current data model does not implement separate workspace membership or an application-wide admin role.

## Core user stories

1. A new user can sign up locally; production signup is restricted unless explicitly enabled or an approved email domain is configured.
2. A user creates a project with a target date and description.
3. A project creator can update or delete their project.
4. A user creates tasks with a priority and due date.
5. A user moves tasks through Todo → In progress → Review → Done.
6. A user comments on a project.
7. A user sees completion and overdue metrics without manual reporting.
8. Unauthenticated users cannot access authenticated project data.
9. Authenticated users cannot mutate or delete another user's project.

## Non-functional requirements

- All persistent access is authenticated.
- All mutable input is schema-validated.
- Server-side authorization is mandatory.
- Production project lifecycle mutations are owner-controlled.
- Better Auth origin validation remains enabled.
- Production authentication requires an explicitly configured secret; no deterministic secret is accepted as a fallback.
- App can run on Vercel with a managed PostgreSQL database.
- Production changes are gated by automated CI.
- Health endpoint provides a deploy smoke-test target.
- Documentation and runbooks stay synchronized with architecture changes.

## Acceptance criteria

A feature is complete when its acceptance criteria, unit/component coverage where applicable, API contract updates, security considerations, documentation, and rollback behavior are present.
