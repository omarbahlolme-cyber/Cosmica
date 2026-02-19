# Security Policy

## Supported Versions

The actively deployed production branch is `main`.

## Reporting a Vulnerability

If you discover a security vulnerability:

1. Do not disclose it publicly.
2. Email details to `admin@cosmicalearn.com`.
3. Include reproduction steps, impact, and affected endpoints/pages.

We aim to acknowledge reports quickly and prioritize remediation based on severity.

## Hardening Controls in Place

- HTTPS enforcement in production.
- Strict security headers (Helmet/CSP/HSTS).
- API rate limiting and request IDs.
- Structured error monitoring and optional webhook alerting.
- Scheduled uptime monitoring workflow.
- Scheduled live security checks for redirects/headers/health.
- Scheduled dependency security audit workflow.
- Weekly backup workflow with optional offsite repository mirror.

## Platform Controls (Account/Provider Side)

Additional controls that are required outside source code are documented in:

- `OPERATIONS_HARDENING.md`

## Temporary Accepted Dependency Risk

As of 2026-02-19, `npm audit` reports a high-severity advisory on transitive `minimatch` (`GHSA-3ppc-4f35-3m26`) through:

- `@google-cloud/text-to-speech` -> `google-gax` -> `gaxios` / `rimraf` -> `glob` -> `minimatch`

Current project dependency versions are already at latest available for this chain, and `npm audit fix` / `npm audit fix --force` do not apply a remediation.

Risk posture for production stability: accepted temporarily with no forced overrides, no manual transitive pinning, and no runtime behavior changes.

Re-evaluation trigger:

- Re-run `npm audit` after any dependency update and at least weekly.
- Apply upstream-supported remediation as soon as a compatible fix is published.
