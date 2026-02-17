# Changelog

All notable changes to this project are documented in this file.

## [Unreleased]

### Added
- Scheduled uptime monitoring workflow with automatic incident issue handling.
- Automated release workflow for `v*` tags plus manual backfill trigger.
- Enforced bloat allowlist baseline (`scripts/bloat-allowlist.json`).
- Security dependency audit workflow.
- Legal/security pages (`privacy.html`, `terms.html`, `license.html`), `LICENSE`, and `docs/SECURITY.md`.
- Security contact file served at `/.well-known/security.txt`.
- Weekly backup workflow and backup scripts (`create-backup`, `verify-backup`).
- Live production security monitoring workflow (redirect/header/health checks).
- Manual GitHub hardening workflow + API automation script for branch protection/security features.
- Dependabot configuration for weekly dependency/security update PRs.
- Operations hardening runbook (`docs/OPERATIONS_HARDENING.md`).
- Monthly backup restore drill workflow.
- Accessibility/SEO/integrity/security.txt baseline check scripts added to quality pipeline.
- HTML baseline updater script for consistent skip links, main landmarks, semantic h1, and JSON-LD.
- Real-user performance telemetry endpoint (`/api/web-vitals`) and client-side Core Web Vitals reporting.
- Frontend runtime notes document (`docs/FRONTEND_RUNTIME_NOTES.md`) with guardrails for prefetch, map hydration, and analytics mode.

### Changed
- Server error monitoring with request IDs, structured error reporting, and optional webhook alerts.
- Health endpoint now returns status + version + uptime metadata for monitoring integrations.
- Server transport hardening with production HTTPS enforcement, Helmet headers/CSP/HSTS, and API rate limiting.
- Repository ignores generated local backups under `backups/`.
- All HTML pages now include explicit main landmark IDs, structured data, and third-party integrity exemptions.
- Performance baseline refreshed after intentional metadata/accessibility additions.
- Background navigation prefetch was disabled in `frontend/app.js` to prevent burst prefetch `503` noise and partial-load regressions.
- Map pages now include loading/fallback rendering states during translation hydration to avoid blank sections.
- Mobile letter-card tuning was adjusted for romanization-heavy worlds, and related dynamic classes were allowlisted for bloat checks.
- Cache-busted `app.js` reference advanced to `v=20260303` across HTML pages to force stale-client recovery after runtime fixes.

## [1.1.0] - 2026-02-08

### Added
- CI quality workflow with syntax, bloat, perf, release, and smoke checks.
- Dedicated map bundle (`frontend/maps/app-maps.js`) and map stylesheet (`frontend/maps/style-maps.css`).
- Performance baseline and regression scripts under `scripts/`.
- Release hygiene check script and changelog policy.

### Changed
- Global static caching strategy in `server.js` for smoother loading across all pages.
- Translation generators now read datasets from `frontend/maps/app-maps.js`.

## [1.0.0] - 2026-02-08

### Added
- Initial public Cosmica site structure and API server.
