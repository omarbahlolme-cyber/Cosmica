# Changelog

All notable changes to this project are documented in this file.

## [Unreleased]

### Changed
- Mimi chat UX now auto-reveals Mimi's speech bubble when a user sends a message, and follows bubble growth during live reply typing.
- Mimi bubble follow behavior is user-controlled: manual wheel/touch/keyboard scrolling cancels auto-follow for the current reply (no scroll lock).
- Added premium gift-link modal flow on homepage with customizable URL text fields (`gift=1`, `giftTitle`, `giftMessage`, `giftFrom`, button labels).
- Gift links now auto-open auth panel for logged-out users, then continue gift activation flow after login/signup.
- Added one-time gift-token backend flow:
  - admin create/list/revoke (`/api/admin/security/gifts/*`)
  - public preview + authenticated claim (`/api/gifts/redeem/*`)
  - homepage auto-claim after auth when a valid gift token is present.

## [1.2.0] - 2026-02-25

### SEO and Discoverability
- Added automated sitemap generator (`scripts/generate-sitemap.js`) and npm command `generate:sitemap`.
- Updated `check:seo` to regenerate sitemap before baseline checks.
- Made `frontend/sitemap.xml` generator-driven and aligned to current indexable pages.
- Added social preview metadata support (`og:image`, `twitter:image`) across indexable pages.
- Added shared social preview image asset (`frontend/og-image.svg`).
- Updated canonical navigation targets from `/index.html` to `/` where applicable.

### Auth and Premium
- Normalized auth-related return paths and redirects to root canonical path (`/`).
- Updated Stripe premium success/cancel default paths to root-based query routes.
- Updated environment guidance for premium/auth posture:
  - `AUTH_STORE_BACKEND`
  - `AUTH_POSTGRES_URL`
  - `ALLOW_SELF_PREMIUM_UPGRADE`
- Improved no-shell live premium operational guidance and source-of-truth references in runbooks.

### Frontend UX and Runtime
- Improved auth dropdown behavior for mobile virtual keyboards (notably iOS/Safari):
  - visual viewport-aware sizing
  - keyboard inset handling
  - focused-field reveal and scroll behavior
- Kept translation hydration fallback behavior and map loading resilience updates in runtime flows.
- Kept prefetch safety posture to avoid burst-loading regressions.

### Security and Operations
- Added/maintained scheduled uptime monitoring workflow and incident issue handling.
- Added/maintained live production security monitoring workflow.
- Added/maintained security dependency audit workflow.
- Added/maintained backup automation:
  - weekly backups
  - monthly restore drill
- Added/maintained GitHub hardening automation and Dependabot update flow.
- Retained accepted transitive audit-risk documentation (`minimatch` via Google SDK chain) without forced dependency overrides.

### Quality and Tooling
- Added/maintained quality pipeline checks for accessibility, SEO, integrity, and security.txt.
- Added/maintained HTML baseline updater behavior (landmarks/structured-data consistency plus social metadata upsert support).
- Added/maintained real-user performance telemetry endpoint (`/api/web-vitals`) and client reporting.
- Kept repository hygiene for generated backup artifacts.

### Documentation
- Added/updated operations and runtime docs:
  - `docs/OPERATIONS_HARDENING.md`
  - `docs/FRONTEND_RUNTIME_NOTES.md`
  - `docs/SECURITY.md`
- Added clear ownership docs:
  - `docs/THIRD_PARTY_SERVICES_MAP.md`
  - `docs/TEST_USERS_REGISTRY.md`
- Clarified notes-map structure and removed duplicated procedure text in non-canonical docs.

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
