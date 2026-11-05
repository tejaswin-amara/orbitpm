Review the current diff as an application-security engineer.

Check:
- authentication and authorization at server boundaries,
- input validation and injection paths,
- secret exposure,
- unsafe redirects and origin handling,
- cookie/session configuration,
- dependency and supply-chain impact,
- security headers,
- destructive operations,
- logging/data leakage.

Prefer root-cause fixes over duplicated guards. Report confirmed findings with file references and add a regression test for every non-trivial fix. Never weaken a security gate to make CI pass.
