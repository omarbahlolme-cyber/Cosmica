# Cosmica Website

Cosmica is a static language-learning site with a small Node/Express backend for chat and feedback APIs.

## Developer map

- Full file-by-file map: `PROJECT_STRUCTURE.md`
- Ops/security runbook: `OPERATIONS_HARDENING.md`
- Front-end entry points: `frontend/index.html`, `frontend/world.html`, `frontend/letters.html`, `frontend/words.html`, `frontend/phrases.html`, `frontend/grammar.html`
- Base front-end logic: `frontend/app.js`
- Map-only front-end bundle: `frontend/app-maps.js`
- Shared styling: `frontend/style.css`
- Map-only styling: `frontend/style-maps.css`
- Backend/API: `backend/server.js` (root `server.js` is a compatibility bootstrap)
- Translation data: `frontend/translations.json`
- Translation generators: `scripts/`

## Organization standards

1. Keep URL-facing HTML files in root unless route changes are intentional.
2. Keep non-functional cleanups focused on comments, structure, and formatting.
3. Add section headers for every major block in JS/CSS/server/script files.
4. Preserve behavior for readability-only refactors.

## Local run

```bash
npm install
npm start
```

## Formatting

```bash
npm run format
```

## Smoke checks

```bash
npm run smoke
```

Runs two quick safeguards:
1. Verifies local HTML `href/src` references point to real files.
2. Starts the local server on an isolated port and checks core routes return `200`.

## Quality checks (CI + local)

```bash
npm run quality
```

Runs:
1. Syntax checks for key server/client bundles.
2. Accessibility baseline checks (`<main>`, `<h1>`, nav labels).
3. SEO baseline checks (canonical metadata, JSON-LD, sitemap coverage).
4. Asset version consistency checks for cache-busted `style.css`/`app.js` references.
5. External third-party integrity policy checks (SRI or explicit exemption).
6. `security.txt` freshness and policy checks.
7. Bloat checks (orphan root assets + enforced selector allowlist).
8. Performance regression check against `perf/baseline.json`.
9. Security dependency audit.
10. Release hygiene checks (`CHANGELOG.md` + semver).
11. Smoke checks for links and core routes.

To refresh the perf baseline after intentional optimizations:

```bash
npm run perf:baseline
```

To intentionally refresh the bloat allowlist after verified cleanup/refactors:

```bash
npm run check:bloat:refresh
```

## Backups

Create a local source + history backup:

```bash
npm run backup:create
npm run backup:verify
```

## Rollback routine

Preview latest release tags and safe rollback commands:

```bash
npm run rollback:info
```

Detailed incident procedure: `ROLLBACK_RUNBOOK.md`

## Indexing follow-up checks

Run production indexing prerequisite checks locally/on CI:

```bash
npm run indexing:check
```

This verifies `robots.txt`, `sitemap.xml`, canonical tags, and JSON-LD on key pages.

## Monitoring + releases

- Uptime monitor runs every 15 minutes via `.github/workflows/uptime-monitor.yml`.
- Release publishing is automated for `v*` tags via `.github/workflows/release.yml`.
- Security dependency audit runs on schedule via `.github/workflows/security-audit.yml`.
- Live production security checks run every 6 hours via `.github/workflows/live-security-check.yml`.
- Weekly indexing follow-up checks run via `.github/workflows/indexing-followup.yml`.
- Weekly backup snapshots run via `.github/workflows/backup-weekly.yml`.
- Monthly backup restore drill runs via `.github/workflows/backup-restore-drill.yml`.
- Manual GitHub protection automation is available via `.github/workflows/github-hardening.yml`.
- Dependabot dependency update PRs are enabled via `.github/dependabot.yml`.
- Optional server error webhook alerts can be enabled with `ERROR_WEBHOOK_URL`.
- Optional real-user performance webhook forwarding can be enabled with `RUM_WEBHOOK_URL`.

## Security hardening

Implemented in app/server:
- HTTPS enforcement in production.
- Helmet headers including CSP/HSTS/frame protections.
- API rate limiting (`/api`, `/api/chat`, `/api/feedback`, `/api/health`).
- Field performance telemetry endpoint (`/api/web-vitals`) with rate limiting.
- Request IDs on responses (`X-Request-Id`) for incident tracing.
- Security contact endpoint: `/.well-known/security.txt`.
- Legal protection pages: `privacy.html`, `terms.html`, `license.html`.

Recommended external platform settings:
1. Cloudflare WAF with managed rules enabled.
2. Bot protection and rate limiting at edge.
3. SSL/TLS mode: `Full (strict)`.
4. Always Use HTTPS + automatic HTTP->HTTPS redirect.
5. DNSSEC enabled for domain integrity.

For exact step-by-step platform setup, use `OPERATIONS_HARDENING.md`.

