# ADR 0002: Pivot to Single-Tenant Architecture

## Context
OrbitPM was initially designed with multi-tenant SaaS logic, including Workspaces and Memberships. A strategic decision was made to pivot the tool to serve a single company strictly, acting as an internal project management tool.

## Decision
We removed all multi-tenant architecture components:
- Dropped the `Workspace` and `Membership` models from the database schema.
- Removed `workspaceId` relations across all remaining models.
- Updated API routes and UI components (e.g., Sidebar, Auth Forms) to operate in a flattened, single-organization context.
- Stripped UI texts related to organization creation and workspaces.

## Consequences
- **Positive:** Simpler data model, faster queries, easier operational maintenance.
- **Negative:** OrbitPM can no longer support multiple isolated teams or companies out-of-the-box in a SaaS model.
