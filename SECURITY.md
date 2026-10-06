# Security Policy

## Supported versions

The current main branch is the supported security baseline.

## Reporting a vulnerability

Do not disclose suspected vulnerabilities in a public issue. Contact the repository owner privately with:

- affected version or commit,
- exact reproduction steps,
- impact,
- proof of concept when it is safe to share.

## Security baseline

OrbitPM uses:

- Better Auth with server-side authorization,
- Zod input validation,
- Prisma parameterized database access,
- security response headers,
- Gitleaks and TruffleHog secret scanning,
- Semgrep and CodeQL static analysis,
- Trivy dependency and filesystem scanning,
- OpenSSF Scorecard,
- OWASP ZAP baseline testing,
- SBOM generation.

Security controls are CI gates. Do not suppress or weaken a scanner to make a workflow green.
