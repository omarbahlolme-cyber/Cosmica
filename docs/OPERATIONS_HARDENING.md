# Operations Hardening Runbook

This runbook covers the remaining account/platform controls that cannot be set from source code alone.

## 1) Cloudflare and Domain Lock (manual in account UI)

Apply these settings on your production domain:

1. SSL/TLS:
   - Encryption mode: `Full (strict)`
   - `Always Use HTTPS`: ON
   - `Automatic HTTPS Rewrites`: ON
2. Edge certificates:
   - `HTTP Strict Transport Security (HSTS)`: ON
   - Max age: at least `6 months` (recommended `12 months`)
   - Include subdomains: ON (only if all subdomains are HTTPS-ready)
3. WAF:
   - Cloudflare Managed Rules: ON
   - OWASP ruleset: ON
4. Bot and abuse controls:
   - Bot Fight Mode (or Super Bot Fight Mode): ON
   - Add rate limit rule for `/api/*` (example: block/challenge if a single IP exceeds 60 requests/minute)
5. DNS and registrar safety:
   - `DNSSEC`: ON
   - Registrar lock / transfer lock: ON
   - WHOIS privacy: ON

## 2) GitHub Account and Repository Hardening

### 2.1 Required account controls

1. Enable 2FA for your GitHub account.
2. In repository settings, limit admin access to trusted maintainers only.

### 2.2 Configure secrets

In GitHub repo `Settings -> Secrets and variables -> Actions`, add:

1. `GH_ADMIN_TOKEN`:
   - Personal access token from an admin account with repository administration permissions.
   - Used by `GitHub Hardening` workflow to apply branch protection and security settings.
2. Optional offsite mirror secrets:
   - `BACKUP_PAT`: token with push access to backup repo.
   - `BACKUP_REPO`: `owner/repo` for backup mirror target.

### 2.3 Run the hardening workflow

1. Open `Actions -> GitHub Hardening`.
2. Run workflow with defaults:
   - `protected_branch=main`
   - `required_checks=quality`
   - `min_reviewers=1`
3. Confirm protection is active in `Settings -> Branches`.

## 3) Backup and Recovery

### 3.1 Local backup

```bash
npm run backup:create
npm run backup:verify
```

Artifacts are written to `backups/`:
- `*.zip` source snapshot
- `*.bundle` full git-history bundle
- `*.json` backup manifest

Backup scope note:
1. Archive contents come from `HEAD` (tracked/committed files).
2. Local scratch folders such as `tmp/` are excluded unless tracked.

### 3.2 Automated weekly backup

The workflow `.github/workflows/backup-weekly.yml` runs weekly and:
1. Creates snapshot artifacts.
2. Verifies backup integrity.
3. Uploads backup artifact for retention.
4. Optionally pushes a full mirror to `BACKUP_REPO` if secrets are configured.

### 3.3 Automated monthly restore drill

The workflow `.github/workflows/backup-restore-drill.yml` runs monthly and:
1. Creates and verifies a fresh backup.
2. Clones a test repository directly from the generated `.bundle`.
3. Runs syntax + bloat checks in the restored clone to prove recoverability.

### 3.4 Manual recovery drill (recommended)

1. Download latest backup artifact from Actions.
2. Restore in a temp folder:
   - `git clone <backup.bundle> restored-site`
   - unzip archive for raw-file verification.
3. Run quick checks in restored repo:
   - `npm install`
   - `npm run quality`

### 3.5 Production rollback routine

1. Print latest release tags and rollback helper commands:
   - `npm run rollback:info`
2. Follow exact rollback procedure in:
   - `ROLLBACK_RUNBOOK.md`
3. Always rollback via PR (do not force-push/rewrite `main` history).

### 3.6 Auth data backups (runtime user store)

Source backups above protect repository history, but real user accounts live in `backend/data/`.

1. Create auth-data snapshot:
   - `npm run auth-backup:create`
2. Verify snapshot integrity:
   - `npm run auth-backup:verify`
3. Test restore workflow safely (no file changes):
   - `npm run auth-backup:restore -- --yes --dry-run`
4. Real restore (writes `backend/data/`):
   - `npm run auth-backup:restore -- --yes`
5. Optional offsite auth snapshot mirror:
   - set `AUTH_DATA_BACKUP_OFFSITE_DIR` to a mounted/synced path before running create.

## 4) Ongoing Security Monitoring

1. `Live Security Check` workflow validates:
   - canonical redirects
   - production security headers
   - API health
   - deep API checks (`/api/chat`, `/api/translate`, `/api/tts`, monitor-safe `/api/feedback`)
2. `Security Audit` workflow checks dependency vulnerabilities.
3. `Uptime Monitor` workflow creates incident issues on failures and validates core API contracts.
4. `Indexing Follow-up` workflow checks robots/sitemap/canonical/JSON-LD and raises SEO incident issues.
5. Optional real-user performance forwarding:
   - Configure `RUM_WEBHOOK_URL` to receive sampled `/api/web-vitals` metrics (LCP, INP, CLS, FCP, TTFB).
6. Optional auth alert forwarding:
   - Configure `AUTH_ALERT_WEBHOOK_URL` (or fallback `ERROR_WEBHOOK_URL`) for:
     - login failure spikes
     - verification email delivery failures
     - startup auth config audit warnings/errors

### 4.4 Security audit allowlist (temporary upstream exception)

The quality gate now runs `npm run security:audit` via `scripts/security-audit-check.js`.

Current behavior:
1. Fails on any new/unexpected vulnerability with severity `moderate` or higher.
2. Temporarily allows only the known upstream transitive chain tied to:
   - `google-gax`
   - `rimraf`
   - `glob`
   - `minimatch`
   - Advisory: `GHSA-3ppc-4f35-3m26`

Why this exists:
- The vulnerability is currently inherited via upstream package constraints and cannot be fully removed without upstream releases.

Removal rule:
1. Periodically run `npm audit --json` and check whether the advisory is still present.
2. When upstream updates remove this chain, delete the allowlist entries in `scripts/security-audit-check.js`.
3. Keep the strict fail-on-moderate-or-higher rule for everything else.

### 4.1 Auth readiness checks

Run before production deploys:

1. `npm run auth:check:readiness`
2. Fix all `FAIL` items before go-live.
3. Review `WARN` items and explicitly accept or remediate.

### 4.2 Billing webhook + Google auth recovery checks

Run these after billing/auth incidents, token rotation, or production redeploys.

Live signup verification (admin token required):

```bash
curl -sS "https://YOUR_HOST/api/admin/security/users?since=2026-02-22T00:00:00Z&limit=200" \
   -H "x-admin-token: YOUR_ADMIN_SECURITY_TOKEN"
```

PowerShell equivalent:

```powershell
$Token = "YOUR_ADMIN_SECURITY_TOKEN"
$Headers = @{ "x-admin-token" = $Token }
Invoke-WebRequest -Uri "https://YOUR_HOST/api/admin/security/users?since=2026-02-22T00:00:00Z&limit=200" -Method GET -Headers $Headers
```

Use `email=user@example.com` for an exact user lookup.

Manual premium grant on live (no shell):

```bash
curl -sS -X POST "https://YOUR_HOST/api/admin/security/users/grant-premium" \
   -H "Content-Type: application/json" \
   -H "x-admin-token: YOUR_ADMIN_SECURITY_TOKEN" \
   -d '{"email":"user@example.com","days":365}'
```

Manual premium lifetime grant (until revoked):

```bash
curl -sS -X POST "https://YOUR_HOST/api/admin/security/users/grant-premium" \
   -H "Content-Type: application/json" \
   -H "x-admin-token: YOUR_ADMIN_SECURITY_TOKEN" \
   -d '{"email":"user@example.com"}'
```

Manual premium revoke on live (no shell):

```bash
curl -sS -X POST "https://YOUR_HOST/api/admin/security/users/revoke-premium" \
   -H "Content-Type: application/json" \
   -H "x-admin-token: YOUR_ADMIN_SECURITY_TOKEN" \
   -d '{"email":"user@example.com"}'
```

PowerShell equivalent for grant + verify + revoke:

```powershell
$Token = "YOUR_ADMIN_SECURITY_TOKEN"
$Email = "user@example.com"
$Headers = @{ "x-admin-token" = $Token }

$GrantBody = @{ email = $Email; days = 365 } | ConvertTo-Json -Compress
Invoke-WebRequest -Uri "https://YOUR_HOST/api/admin/security/users/grant-premium" -Method POST -Headers $Headers -ContentType "application/json" -Body $GrantBody

Invoke-WebRequest -Uri ("https://YOUR_HOST/api/admin/security/users?email=" + [uri]::EscapeDataString($Email)) -Method GET -Headers $Headers

$RevokeBody = @{ email = $Email } | ConvertTo-Json -Compress
Invoke-WebRequest -Uri "https://YOUR_HOST/api/admin/security/users/revoke-premium" -Method POST -Headers $Headers -ContentType "application/json" -Body $RevokeBody
```

Admin endpoint error guide:

- `404 Not Found`: route not deployed to live backend yet; deploy latest `main`.
- `401/403`: missing/invalid `x-admin-token`.
- PowerShell `curl` parsing/`unmatched close brace` errors: use `Invoke-WebRequest` + `ConvertTo-Json`.

Fallback when `404` blocks urgent live grant:

```bash
npm run admin:grant:premium -- --email user@example.com --days 365
git add backend/data/accounts.json
git commit -m "Grant premium for user@example.com"
git push origin main
```

Optional cleanup after verification:

```bash
git revert HEAD --no-edit
git push origin main
```

1. Rotate webhook token if exposed:
   - Regenerate in Ko-fi Webhooks UI.
   - Update `KOFI_WEBHOOK_VERIFICATION_TOKEN` in production env.
   - Redeploy/restart backend.

2. Confirm paid event upgrades premium (`upgraded:true`):

```powershell
$token="YOUR_KOFI_WEBHOOK_TOKEN"; $email="target-user@example.com"; $url="https://www.cosmicalearn.com/api/billing/webhooks/kofi"; $data=(@{verification_token=$token; email=$email; type="subscription"; payment_status="completed"; message_id=("ops-paid-"+[guid]::NewGuid().ToString()); amount="9.99"; currency="EUR"} | ConvertTo-Json -Compress); $r=Invoke-WebRequest -Uri $url -Method POST -ContentType "application/x-www-form-urlencoded" -Body @{data=$data}; $j=$r.Content|ConvertFrom-Json; "STATUS=$($r.StatusCode) ok=$($j.ok) matched=$($j.matched) upgraded=$($j.upgraded)"
```

3. Confirm cancellation/refund downgrades premium (`downgraded:true` or `alreadyFree:true`):

```powershell
$token="YOUR_KOFI_WEBHOOK_TOKEN"; $email="target-user@example.com"; $url="https://www.cosmicalearn.com/api/billing/webhooks/kofi"; $data=(@{verification_token=$token; email=$email; type="subscription.cancelled"; payment_status="cancelled"; message_id=("ops-cancel-"+[guid]::NewGuid().ToString()); amount="0"; currency="EUR"} | ConvertTo-Json -Compress); $r=Invoke-WebRequest -Uri $url -Method POST -ContentType "application/x-www-form-urlencoded" -Body @{data=$data}; $j=$r.Content|ConvertFrom-Json; "STATUS=$($r.StatusCode) ok=$($j.ok) matched=$($j.matched) downgraded=$($j.downgraded) alreadyFree=$($j.alreadyFree)"
```

4. Confirm failed/unconfirmed events are ignored (`ignored:true`):

```powershell
$token="YOUR_KOFI_WEBHOOK_TOKEN"; $email="target-user@example.com"; $url="https://www.cosmicalearn.com/api/billing/webhooks/kofi"; $data=(@{verification_token=$token; email=$email; type="subscription"; payment_status="pending"; message_id=("ops-pending-"+[guid]::NewGuid().ToString()); amount="9.99"; currency="EUR"} | ConvertTo-Json -Compress); $r=Invoke-WebRequest -Uri $url -Method POST -ContentType "application/x-www-form-urlencoded" -Body @{data=$data}; $j=$r.Content|ConvertFrom-Json; "STATUS=$($r.StatusCode) ok=$($j.ok) ignored=$($j.ignored) reason=$($j.reason)"
```

5. Configure Stripe webhook delivery (production):
   - Endpoint URL: `https://www.cosmicalearn.com/api/billing/webhooks/stripe`
   - Listen to events:
     - `checkout.session.completed`
     - `customer.subscription.created`
     - `customer.subscription.updated`
     - `customer.subscription.deleted`
     - `invoice.payment_failed`
     - `invoice.payment_succeeded`
     - `invoice.paid`
   - Set `STRIPE_WEBHOOK_SECRET` in production from the endpoint signing secret (`whsec_...`).
   - Keep `STRIPE_SECRET_KEY` configured and redeploy/restart backend after env updates.

6. Verify Stripe signature path is active:
   - In Stripe Dashboard -> Webhooks -> your endpoint -> `Send test webhook` for `customer.subscription.updated`.
   - Expect HTTP `200` with JSON including `ok:true`.
   - If you receive HTTP `400` (`signature verification failed`), re-check `STRIPE_WEBHOOK_SECRET`, then redeploy.

7. Verify failed rebill and downgrade behavior:
   - Send `invoice.payment_failed` for a test subscription.
   - Expected result: user remains premium only if `premiumCurrentPeriodEnd` is still in the future; downgrades to free after period end/terminal state.
   - Confirm via account menu (`Manage subscription`) or `GET /api/billing/subscription/status`.

8. Verify cancel-at-period-end behavior:
   - Trigger cancellation from app (`POST /api/billing/subscription/cancel`) so Stripe sets `cancel_at_period_end=true`.
   - Expected result before period end: premium remains active, auto-renew is off.
   - After period end (or terminal status webhook), account downgrades to free automatically.

9. Confirm Google auth works on mobile browser:
   - Open `https://www.cosmicalearn.com` on a phone.
   - Run Google Login and Google Signup once.
   - Ensure no `authError=google_*` appears in the URL.
   - If errors appear, capture exact `authError` code and backend request ID (`X-Request-Id`) for triage.

### 4.3 Premium continuity guardrails

1. Keep `AUTH_STORE_FAIL_FAST_ON_LOAD_ERROR=true` in every environment (staging and production) so startup halts on corrupt auth-store loads.
2. Set `PREMIUM_CONTINUITY_CANARY_INTERVAL_MS` per environment:
   - Production: `900000` (15 minutes) to catch regressions quickly.
   - Staging: `3600000` (60 minutes) to reduce noise while still exercising the path.
3. Ensure the premium continuity smoke runs in CI (see `quality` workflow) so failures block merges.
4. If you create a staging service later, copy all required env keys from prod, then set:
   - `AUTH_STORE_FAIL_FAST_ON_LOAD_ERROR=true`
   - `PREMIUM_CONTINUITY_CANARY_INTERVAL_MS=3600000` (or `600000` if you want staging to match prod cadence).

## 5) Policy Enforcement Process

For privacy/terms/license violations and response steps, use:

- `ENFORCEMENT_RUNBOOK.md`

## 6) Admin: Premium (local/dev)

Use the helper script; avoid hand-editing unless you need a manual revoke. Applies only to your local server.

- Backup first: stop local server CTRL+C; run `npm run auth-backup:create`.
- Grant local premium:
   - Unlimited: `npm run admin:grant:premium -- --email user@example.com`
   - Timed trial: `npm run admin:grant:premium -- --email user@example.com --days 30`
   - Custom date: `npm run admin:grant:premium -- --email user@example.com --until YYYY-MM-DD`
- Restart local server "npm start"; verify on localhost.
- Revoke locally:
   - Fast: `npm run admin:grant:premium -- --email user@example.com --until 2000-01-01`
   - Manual edit: stop server; edit `backend/data/accounts.json` for that user; clear premium flags/end dates (`isPremium/premium/plan/tier/membership=false/""`; clear `premiumProvider/premiumLastSource`, `premiumStripeSubscriptionStatus`, end-date fields, `premiumCancelAtPeriodEnd`); save; restart.
- Local recovery/QA:
   - Wrong user: revert flags in `backend/data/accounts.json` or restore the latest `backups/auth-data/` snapshot, then restart.
   - Wrong duration: re-run the grant with correct `--days` or `--until`.
   - Corrupted store: restore the latest `backups/auth-data/` snapshot locally, then re-apply intended grants.
   - Backups: one before edits is enough; fix/restore using it, then optionally take a fresh one after.

## 7) Admin: Premium (production/live, Render free has no shell)

- Private repo (simple path):
   - Backup first: stop live server/service if you control it; locally run `npm run auth-backup:create` (keeps a copy if you need to revert).
   - Grant: edit `backend/data/accounts.json` locally to mark your email as premium (same fields as local flow: isPremium/premium true, plan/tier/membership "premium", provider/manual, premiumCurrentPeriodEnd future date, etc.).
   - Deploy: commit and push to `main`; Render redeploys and picks it up.
   - Verify: log in on the live site; confirm Premium.
   - Optional cleanup: after verifying live, make a follow-up commit reverting `backend/data/accounts.json`. The live instance keeps the premium state it already loaded.

- Public repo (avoid committing auth data):
   - Option 1: temporarily upgrade to a plan with Shell, run `npm run admin:grant:premium -- --email you@example.com --days 30` on the live box, then downgrade.
   - Option 2: have a dev add a temporary protected grant endpoint, deploy, call it once, then remove and redeploy.

- Revoke live (if needed):
   - Fast: `npm run admin:grant:premium -- --email user@example.com --until 2000-01-01` (requires shell-capable plan).
   - File edit path (private repo): edit `backend/data/accounts.json` to clear premium flags/end dates, commit/push, let Render redeploy.

- Live recovery/QA scenarios:
   - Wrong user: clear that user’s premium fields in `backend/data/accounts.json`, commit/push, redeploy; or restore the latest `backups/auth-data/` snapshot and redeploy.
   - Wrong duration: adjust fields in `backend/data/accounts.json` (or rerun grant via shell if available), then commit/push and redeploy.
   - Corrupted store: restore the latest `backups/auth-data/` snapshot locally, commit/push, redeploy.
   - Backups: one before edits is enough; fix/restore using it, then optionally take a fresh one after things look correct.

- Reminder: local changes don’t reach live unless you push them; only what’s in git (or executed on the live box) goes to production.

- Runtime note: the manual premium congrats message appears once per session/login for manual grants; it resets on page reload or logout/login and does not show for Stripe users.

### 7.1 Cleanup: remove accounts.json change from git (after live is verified)

- If the grant was your latest commit (simplest):
   1) In a terminal at the repo root: `git revert HEAD --no-edit`
   2) Push: `git push origin main`
   Done. Live keeps the premium state it already loaded.

- If the grant was not the latest commit:
   1) Target the grant commit directly and revert it: `git revert <grant-commit-sha> --no-edit`
       - If you prefer a file reset: `git checkout <pre-grant-commit> -- backend/data/accounts.json` (if it’s one back, use `HEAD~1`).
   2) Commit (if you used checkout): `git commit -am "Revert accounts.json"`
   3) Push: `git push origin main`
   Live keeps the premium state it already loaded.

- You can do this cleanup anytime later (even weeks/months later); it only cleans the repo. The live server keeps the premium state it already loaded.
