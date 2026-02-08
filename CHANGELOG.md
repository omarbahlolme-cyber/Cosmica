# Changelog

All notable changes to this project are documented in this file.

## [Unreleased]

### Added
- Scheduled uptime monitoring workflow with automatic incident issue handling.
- Automated release workflow for `v*` tags plus manual backfill trigger.
- Enforced bloat allowlist baseline (`scripts/bloat-allowlist.json`).

### Changed
- Server error monitoring with request IDs, structured error reporting, and optional webhook alerts.
- Health endpoint now returns status + version + uptime metadata for monitoring integrations.

## [1.1.0] - 2026-02-08

### Added
- CI quality workflow with syntax, bloat, perf, release, and smoke checks.
- Dedicated map bundle (`app-maps.js`) and map stylesheet (`style-maps.css`).
- Performance baseline and regression scripts under `scripts/`.
- Release hygiene check script and changelog policy.

### Changed
- Global static caching strategy in `server.js` for smoother loading across all pages.
- Translation generators now read datasets from `app-maps.js`.

## [1.0.0] - 2026-02-08

### Added
- Initial public Cosmica site structure and API server.
