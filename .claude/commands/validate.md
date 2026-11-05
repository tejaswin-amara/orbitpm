Run the smallest useful verification ladder for the current OrbitPM change.

1. Inspect the diff.
2. Run the targeted test(s).
3. Run pnpm format:check, pnpm lint, and pnpm typecheck.
4. Run pnpm test and pnpm api:lint.
5. Run pnpm build only when the changed surface can affect the production bundle.

Do not fix unrelated pre-existing failures unless they block the requested change.
