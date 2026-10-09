# ADR 0004: Authorization Model

## Context
OrbitPM transitioned to a single-tenant architecture (see ADR 0002). This introduced a need for a streamlined yet robust authorization model that handles users, projects, tasks, and comments without the complexity of a full multi-tenant Role-Based Access Control (RBAC) system or tools like OpenFGA. We needed a model that fits the product while guaranteeing data isolation between different authenticated users in this shared environment.

## Decision
We chose a direct, centralized, relational authorization model using custom policies built into \`src/lib/authz.ts\`.

- **Subject Identity**: Provided by Better Auth through a session user ID.
- **Roles**: Better Auth provides the foundational user roles (e.g., \`user\`, \`admin\`).
- **Project Ownership**: Users who create a project are recorded as the \`creatorId\`. Users who are assigned to tasks within a project also gain view access to the project context.
- **Task Ownership**: Task access is derived from project visibility. Task management is permitted for the task's specific assignee or the project's creator/manager.
- **Administrator Privileges**: The \`admin\` role bypasses resource constraints, granting full system access for administrative overrides.
- **Forbidden Operations**: Unauthorized access to any API or page route immediately returns a \`404 Not Found\` (or \`403 Forbidden\` where appropriate) to avoid resource enumeration and data leakage.
- **Consistency**: Both Server Components and API Route Handlers share the exact same authorization policy queries.

## Consequences
- **Positive:** Authorization is easy to read, test, and implement. It avoids the overhead of distributed authorization servers or complex graph evaluations for a single-company tool.
- **Negative:** If OrbitPM ever pivots back to complex multi-tenant SaaS, this model will need to be rewritten to accommodate workspace boundaries.
