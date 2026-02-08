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
