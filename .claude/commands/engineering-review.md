# OrbitPM engineering review

Review the current diff using the repository operating model.

- Start with YAGNI/Ponytail: identify deletions before additions.
- Inspect request/data flow end to end and fix shared root causes rather than sibling symptoms.
- Check public API compatibility, Prisma migrations, authz, input validation, error handling, accessibility, and operational rollback.
- Verify the public-apis integration rule: external providers stay optional, server-side, time-bounded, schema-validated, and isolated.
- Verify agent changes remain progressive: small command/skill entry points, no unnecessary global automation.
- Finish with: targeted tests → format/lint/typecheck → full tests → API contract → build → security scan.
