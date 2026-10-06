# Data Flow

```mermaid
sequenceDiagram
  participant U as Browser
  participant N as Next.js
  participant A as Better Auth
  participant P as Prisma
  participant D as PostgreSQL

  U->>N: POST /api/projects
  N->>A: validate session
  A-->>N: authenticated user
  N->>N: check workspace membership
  N->>P: create project
  P->>D: INSERT
  D-->>P: row
  P-->>N: project
  N-->>U: 201 JSON
```

Authorization is evaluated before every project/task/comment mutation. IDs are scoped through workspace ownership queries so a client cannot select another workspace by changing a route parameter.
