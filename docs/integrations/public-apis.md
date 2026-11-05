# External Integration Selection

OrbitPM uses the public-apis catalog as a discovery reference, not as a runtime dependency. Before introducing an external integration, record the provider, authentication model, HTTPS support, and operational risk.

## Candidate integrations

| Integration | Use case | Auth model | Initial decision |
|---|---|---|---|
| GitHub | Link repositories, issues, and pull requests to projects/tasks | OAuth | Candidate for a future first-class integration |
| Slack | Project notifications and delivery updates | OAuth | Candidate for optional notifications |
| Notion | Link or export project documentation | OAuth | Candidate for optional documentation sync |

The catalog is useful for discovery, but a public listing is not evidence that a production integration is safe, stable, or free.

## Integration rules

- Keep external calls server-side.
- Store provider credentials only in environment or secret storage.
- Use explicit timeouts and bounded retries.
- Validate provider responses with schemas.
- Keep integrations optional; the core project-management path must not depend on an external API.
- Record new providers and trade-offs in an ADR before implementation.
- Prefer a small adapter over leaking provider-specific types into the domain model.
