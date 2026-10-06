# Product Requirements

## Goal

Provide a focused project-management product that a small team can deploy on Vercel without maintaining a separate API server or worker fleet.

## Users

- Workspace owners: manage projects and membership-sensitive operations.
- Workspace admins: manage project lifecycle.
- Members: create and move tasks, comment, and inspect work in their workspace.

## Core user stories

1. A new user signs up and receives a default workspace.
2. A user creates a project with a target date and description.
3. A user creates tasks with a priority and due date.
4. A user moves tasks through Todo → In progress → Review → Done.
5. A user comments on a project.
6. A user sees completion and overdue metrics without manual reporting.
7. Unauthorized users cannot access another workspace's project data.

## Non-functional requirements

- All persistent access is authenticated.
- All mutable input is schema-validated.
- Server-side authorization is mandatory.
- App can run on Vercel with a managed PostgreSQL database.
- Production changes are gated by automated CI.
- Health endpoint provides a deploy smoke-test target.
- Documentation and runbooks stay synchronized with architecture changes.

## Acceptance criteria

A feature is complete when its acceptance criteria, unit/component coverage where applicable, API contract updates, security considerations, documentation, and rollback behavior are present.
