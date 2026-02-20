# Cosmica Website

Cosmica is a static language-learning site with a small Node/Express backend for chat and feedback APIs.

## Developer map

- Full file-by-file map: `docs/PROJECT_STRUCTURE.md`
- Frontend runtime guardrails: `docs/FRONTEND_RUNTIME_NOTES.md`
- Ops/security runbook: `docs/OPERATIONS_HARDENING.md`
- Policy enforcement runbook: `docs/ENFORCEMENT_RUNBOOK.md`
- Front-end entry points: `frontend/index.html`, `frontend/english-*.html`, and per-world pages in `frontend/world-*.html`, `frontend/letters-*.html`, `frontend/words-*.html`, `frontend/phrases-*.html`, `frontend/grammar-*.html`
- Base front-end logic: `frontend/app.js`
- Map-only front-end bundle: `frontend/maps/app-maps.js`
- Shared styling: `frontend/style.css`
- Map-only styling: `frontend/maps/style-maps.css`
- Backend/API: `backend/server.js` (root `server.js` is a compatibility bootstrap)
- Translation data:
  - Base shared pack: `frontend/maps/translations.json`
  - World-specific packs: `frontend/worlds/<world-key>/translations.json`
- World organization folder: `frontend/worlds/`
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

## Premium checkout (Stripe + Ko-fi fallback)

Premium purchase supports Stripe Checkout (preferred) with Ko-fi as fallback.

Quick local setup (Stripe):

1. Copy env template: `Copy-Item .env.example .env`
2. Fill Stripe values in `.env`: `STRIPE_SECRET_KEY`, `STRIPE_PREMIUM_PRICE_ID`, `STRIPE_WEBHOOK_SECRET`
3. Start app: `npm start`
4. In a second terminal, forward Stripe events locally:

```bash
stripe listen --forward-to http://127.0.0.1:3000/api/billing/webhooks/stripe
```

5. In Stripe Dashboard, ensure this endpoint subscribes to:
  - `checkout.session.completed`
  - `customer.subscription.updated`
  - `customer.subscription.deleted`

Optional environment variables:

Stripe (recommended):

- `STRIPE_SECRET_KEY` (required for Stripe mode)
- `STRIPE_PREMIUM_PRICE_ID` (required for Stripe mode; aliases supported: `STRIPE_PRICE_ID`, `PREMIUM_STRIPE_PRICE_ID`)
- `STRIPE_WEBHOOK_SECRET` (required for Stripe webhook signature verification)
- `STRIPE_PREMIUM_LABEL` (optional, checkout option label shown in app)
- `STRIPE_PREMIUM_DESCRIPTION` (optional, checkout option description shown in app)
- `STRIPE_PREMIUM_SUCCESS_PATH` (optional, default `/index.html?premium=success`)
- `STRIPE_PREMIUM_CANCEL_PATH` (optional, default `/index.html?premium=cancel`)
- `STRIPE_PREMIUM_TRIAL_DAYS` (optional, integer trial days)

Ko-fi fallback:

- `KOFI_PREMIUM_MONTHLY_URL`
- `KOFI_PREMIUM_BASE_URL` (backward compatibility only; accepted only if it is a Ko-fi subscription URL like `/s/...`, donate/support links are rejected)
- Additional accepted aliases for monthly URL (deployment compatibility): `KOFI_PREMIUM_URL`, `KOFI_MONTHLY_URL`, `PREMIUM_CHECKOUT_URL`, `PREMIUM_MONTHLY_URL`
- `KOFI_PREMIUM_OPTIONS_JSON` (array of option objects)
- Additional accepted alias for options JSON: `KOFI_PREMIUM_OPTIONS`
- `KOFI_WEBHOOK_VERIFICATION_TOKEN` (required for Ko-fi webhook verification)
- `ALLOW_SELF_PREMIUM_UPGRADE` (optional, default disabled; set `true` only for local/manual testing)

`KOFI_PREMIUM_OPTIONS_JSON` format example:

```json
[
  { "id": "monthly", "label": "Monthly", "description": "€9.99 per month", "url": "https://ko-fi.com/yourpage" }
]
```

Ko-fi webhook endpoint for automatic premium activation:

- `POST /api/billing/webhooks/kofi`
- Configure the same value in Ko-fi webhook settings and `KOFI_WEBHOOK_VERIFICATION_TOKEN`.
- The webhook upgrades the matching Cosmica account by payer email.

Stripe webhook endpoint for automatic premium activation/downgrade:

- `POST /api/billing/webhooks/stripe`
- Configure `STRIPE_WEBHOOK_SECRET` from the Stripe endpoint signing secret.
- Subscribe at minimum to: `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`.
- This route verifies `stripe-signature` using the raw request body and applies premium changes server-side.

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

Cross-device premium checkout smoke (desktop + mobile user agents):

```bash
SMOKE_BASE_URL=https://www.cosmicalearn.com \
SMOKE_AUTH_EMAIL=you@example.com \
SMOKE_AUTH_PASSWORD='your-password' \
SMOKE_EXPECTED_PREMIUM_URL='https://www.cosmicalearn.com/api/billing/premium/checkout/start?option=monthly' \
npm run smoke:checkout:cross-device
```

Ko-fi-only deployments can still set:

```bash
SMOKE_EXPECTED_PREMIUM_URL='https://ko-fi.com/s/your-monthly-tier'
```

This check:
1. Logs in using desktop and mobile user agents.
2. Calls `/api/billing/premium/options` with authenticated session cookies.
3. Verifies both devices return the same premium checkout options.
4. Accepts secure Stripe/internal checkout-start URLs or validated Ko-fi URLs.

Combined guard (syntax + route smoke + cross-device checkout smoke):

```bash
npm run verify:pc-mobile
```

One-command production integration check after deploy:

```bash
npm run verify:prod-integrations
```

Optional for full admin positive checks (`200`) in the same command:

```bash
VERIFY_ADMIN_BASIC_USER='your-basic-user' \
VERIFY_ADMIN_BASIC_PASS='your-basic-pass' \
VERIFY_ADMIN_TOKEN='your-admin-token' \
npm run verify:prod-integrations
```

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

Note: backup snapshots are created from committed `HEAD` content (tracked files). Local scratch files in `tmp/` are intentionally excluded.

Create a runtime auth-data backup (`backend/data/*.json`) with checksum verification:

```bash
npm run auth-backup:create
npm run auth-backup:verify
```

Restore auth data from latest snapshot:

```bash
npm run auth-backup:restore -- --yes
```

Dry-run restore validation (no files changed):

```bash
npm run auth-backup:restore -- --yes --dry-run
```

Optional offsite mirror for auth-data snapshots:
1. Set `AUTH_DATA_BACKUP_OFFSITE_DIR` to a mounted/synced path.
2. Run `npm run auth-backup:create`.

## Rollback routine

Preview latest release tags and safe rollback commands:

```bash
npm run rollback:info
```

Detailed incident procedure: `docs/ROLLBACK_RUNBOOK.md`

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
- Optional auth-specific alert webhook can be enabled with `AUTH_ALERT_WEBHOOK_URL`.
- Optional real-user performance webhook forwarding can be enabled with `RUM_WEBHOOK_URL`.

Auth runtime readiness check:

```bash
npm run auth:check:readiness
```

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

For exact step-by-step platform setup, use `docs/OPERATIONS_HARDENING.md`.

