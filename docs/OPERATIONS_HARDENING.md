# Operations Hardening Runbook

This runbook covers the remaining account/platform controls that cannot be set from source code alone.
For platform ownership (Render/Cloudflare/Stripe/Google/Slack/etc.), see `docs/THIRD_PARTY_SERVICES_MAP.md`.

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

### 3.7 Auth-store corruption recovery + user lifecycle triage

Recent hardening added a safer startup path for `backend/data/accounts.json`:

1. The backend now maintains a rolling last-known-good snapshot:
   - `backend/data/accounts.last-known-good.json`
2. If `accounts.json` is unreadable/corrupted at startup:
   - the current broken file is copied to `backend/data/accounts.corrupt-<timestamp>.json`
   - the server attempts restore from `accounts.last-known-good.json`
   - this avoids destructive auto-reset-to-empty behavior on parse failures

Operator checklist when users report "Account does not exist":

1. Run per-email lifecycle diagnosis:
   - `npm run auth:user:lifecycle -- --email=user@example.com`
2. Interpret `likelyState` quickly:
   - `active-account` -> account exists now (likely wrong env/email/client confusion)
   - `previously-deleted` -> user self-deleted in past (re-signup path expected)
   - `registered-but-missing-from-current-store` -> investigate store drift/reset/recovery incident
   - `never-registered-or-different-email` -> user likely used another email/provider
3. If corruption snapshot files exist, archive and inspect before cleanup:
   - `backend/data/accounts.corrupt-*.json`
4. If last-known-good recovery was used, verify with:
   - `npm run auth:user:lifecycle -- --email=<affected-user-email>`
   - plus normal readiness/quality checks before redeploy

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
7. Optional signup event forwarding:
   - Configure `SIGNUP_WEBHOOK_URL` to receive `user_signup` notifications.

### 4.5 Signup webhook setup (Slack example)

Use this when you want a channel alert every time a new user signs up.

1. Create Slack incoming webhook:
   - Slack -> `api.slack.com/apps` -> create/select app.
   - Enable `Incoming Webhooks`.
   - Add webhook to target channel.
   - Copy webhook URL (`https://hooks.slack.com/services/...`).

2. Set runtime env key (production host, e.g., Render):
   - `SIGNUP_WEBHOOK_URL=<your_slack_webhook_url>`

3. Optional local parity in `.env`:
   - `SIGNUP_WEBHOOK_URL=<your_slack_webhook_url>`

4. Redeploy/restart backend after env update.

5. Verify delivery:
   - Trigger a test signup (email or Google).
   - Confirm webhook message appears in Slack channel.
   - Check backend logs for `signup-webhook` errors if delivery fails.

Notes:
1. Keep webhook URLs secret (never commit to git).
2. Signup webhook payload currently includes:
   - `event` (`user_signup`)
   - `email`, `displayName`, `source`, `userId`, `requestId`, `createdAt`

### 4.6 Auth store backend mode (file vs Postgres)

Use this to control where account/session state is stored.

1. Default mode is file-backed:
   - `AUTH_STORE_BACKEND=file`
   - Uses `backend/data/accounts.json` (+ last-known-good snapshot).
2. Optional Postgres mode:
   - `AUTH_STORE_BACKEND=postgres`
   - Set `AUTH_POSTGRES_URL` (or fallback `DATABASE_URL`).
3. Production behavior:
   - If Postgres mode is enabled without URL, startup fails fast.
   - If file mode is used in production, readiness emits a warning (acceptable only with persistent disk + single instance).
4. Recommended migration flow:
   - Deploy once with Postgres env keys configured.
   - Server auto-bootstraps Postgres store from current in-memory/file state if DB row is empty.
   - Run `npm run auth:check:readiness` and verify no `FAIL`.

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

Manual premium grant/revoke commands are canonical in:
- section `7` (local/live manual premium operations).
- `docs/BILLING_OPS_QUICK_COMMANDS.md` for billing-oriented incident command flow.

Admin endpoint error guide:

- `404 Not Found`: route not deployed to live backend yet; deploy latest `main`.
- `401/403`: missing/invalid `x-admin-token`.
- PowerShell `curl` parsing/`unmatched close brace` errors: use `Invoke-WebRequest` + `ConvertTo-Json`.

If `404` appears, use this order:

1. Confirm your host is correct (`https://www.cosmicalearn.com`).
2. Deploy latest `main` so admin routes are live.
3. Retry endpoint call.
4. Only if live is intentionally file-backed (not Postgres), use the file-based fallback in section `7.5`.

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

1. Keep production auth store on Postgres:
   - `AUTH_STORE_BACKEND=postgres`
   - `AUTH_POSTGRES_URL=<internal-db-url>` (or `DATABASE_URL`)
2. Keep self-upgrade endpoint disabled in production:
   - leave `ALLOW_SELF_PREMIUM_UPGRADE` unset, or set it to `false`
   - only `true` enables `/api/account/premium/upgrade`
3. Set `PREMIUM_CONTINUITY_CANARY_INTERVAL_MS` per environment:
   - Production: `900000` (15 minutes) to catch regressions quickly.
   - Staging: `3600000` (60 minutes) to reduce noise while still exercising the path.
4. Ensure the premium continuity smoke runs in CI (see `quality` workflow) so failures block merges.
5. If you create a staging service later, copy all required env keys from prod, then set:
   - `AUTH_STORE_BACKEND=postgres`
   - `PREMIUM_CONTINUITY_CANARY_INTERVAL_MS=3600000` (or `600000` if you want staging to match prod cadence).

## 5) Policy Enforcement Process

For privacy/terms/license violations and response steps, use:

- `ENFORCEMENT_RUNBOOK.md`

## 6) Admin: Premium (local/dev)

Use local script commands for local testing only.

1. Backup local auth data:
- Stop local server, then run `npm run auth-backup:create`.

2. Grant local premium:
- Unlimited: `npm run admin:grant:premium -- --email user@example.com`
- 30-day trial: `npm run admin:grant:premium -- --email user@example.com --days 30`
- Until date: `npm run admin:grant:premium -- --email user@example.com --until YYYY-MM-DD`

3. Revoke local premium:
- Quick revoke: `npm run admin:grant:premium -- --email user@example.com --until 2000-01-01`

4. Verify locally:
- Restart server: `npm start`
- Login with that account on localhost and confirm Premium state.

## 7) Admin: Premium (production/live, no Render Shell)

Use the admin security API. This is the easiest and safest live method when Shell is unavailable.

Prerequisites:
1. `ADMIN_SECURITY_TOKEN` is set in Render Environment.
2. Live is deployed with current backend (contains `/api/admin/security/users/grant-premium`).
3. User already exists on live.

### 7.0 Step-by-step (copy/paste)

Follow these exact steps in order.

1. Open Render Dashboard -> your Web Service -> `Environment`.
2. Confirm key `ADMIN_SECURITY_TOKEN` exists.
3. Pick the user email you want to grant, for example `user@example.com`.
4. Open Windows PowerShell on your computer.
5. Paste this block and replace token/email values:

```powershell
$BaseUrl = "https://www.cosmicalearn.com"
$Token = "PASTE_YOUR_ADMIN_SECURITY_TOKEN_HERE".Trim()
$Email = "user@example.com".Trim().ToLower()
"TokenLen=$($Token.Length)"
```

6. Verify token + user state first:

```powershell
$VerifyUri = $BaseUrl + "/api/admin/security/users?email=" + [uri]::EscapeDataString($Email)
Invoke-RestMethod -Uri $VerifyUri -Method GET -Headers @{ "x-admin-token" = $Token } | ConvertTo-Json -Depth 8
```

Expected result:
1. Response shows `"ok": true`
2. `"matchedUsers"` is `1`

7. Grant Premium for 30 days:

```powershell
$GrantBody = @{ email = $Email; days = 30 } | ConvertTo-Json -Compress
Invoke-RestMethod -Uri "$BaseUrl/api/admin/security/users/grant-premium" -Method POST -Headers @{ "x-admin-token" = $Token } -ContentType "application/json" -Body $GrantBody | ConvertTo-Json -Depth 8
```

Expected result:
1. Response shows `"ok": true`
2. Response shows `"user"` object with premium status active

8. Verify user state after grant:

```powershell
$VerifyUri = $BaseUrl + "/api/admin/security/users?email=" + [uri]::EscapeDataString($Email)
Invoke-RestMethod -Uri $VerifyUri -Method GET -Headers @{ "x-admin-token" = $Token } | ConvertTo-Json -Depth 8
```

Expected result:
1. Returned user has `isPremium: true`
2. `premiumStatus` is `"active"`

9. Revoke later (if needed):

```powershell
$RevokeBody = @{ email = $Email } | ConvertTo-Json -Compress
Invoke-RestMethod -Uri "$BaseUrl/api/admin/security/users/revoke-premium" -Method POST -Headers @{ "x-admin-token" = $Token } -ContentType "application/json" -Body $RevokeBody | ConvertTo-Json -Depth 8
```

Expected result:
1. Response shows `"ok": true`
2. Returned user becomes free

### 7.0.1 Terminal curl copy/paste (alternative)

Use this if you prefer terminal `curl` style.

Grant 30 days:

```bash
curl -sS -X POST "https://www.cosmicalearn.com/api/admin/security/users/grant-premium" \
  -H "Content-Type: application/json" \
  -H "x-admin-token: YOUR_ADMIN_SECURITY_TOKEN" \
  -d '{"email":"user@example.com","days":30}'
```

Verify:

```bash
curl -sS "https://www.cosmicalearn.com/api/admin/security/users?email=user@example.com" \
  -H "x-admin-token: YOUR_ADMIN_SECURITY_TOKEN"
```

Revoke:

```bash
curl -sS -X POST "https://www.cosmicalearn.com/api/admin/security/users/revoke-premium" \
  -H "Content-Type: application/json" \
  -H "x-admin-token: YOUR_ADMIN_SECURITY_TOKEN" \
  -d '{"email":"user@example.com"}'
```

### 7.1 Grant live premium (PowerShell examples)

```powershell
$BaseUrl = "https://www.cosmicalearn.com"
$Token = "YOUR_ADMIN_SECURITY_TOKEN".Trim()
$Email = "user@example.com".Trim().ToLower()
```

Grant for 30 days:

```powershell
$GrantBody = @{ email = $Email; days = 30 } | ConvertTo-Json -Compress
Invoke-RestMethod -Uri "$BaseUrl/api/admin/security/users/grant-premium" -Method POST -Headers @{ "x-admin-token" = $Token } -ContentType "application/json" -Body $GrantBody | ConvertTo-Json -Depth 8
```

Grant for 1 month (same as 30 days):

```powershell
$GrantBody = @{ email = $Email; days = 30 } | ConvertTo-Json -Compress
Invoke-RestMethod -Uri "$BaseUrl/api/admin/security/users/grant-premium" -Method POST -Headers @{ "x-admin-token" = $Token } -ContentType "application/json" -Body $GrantBody | ConvertTo-Json -Depth 8
```

Grant for 1 year (365 days):

```powershell
$GrantBody = @{ email = $Email; days = 365 } | ConvertTo-Json -Compress
Invoke-RestMethod -Uri "$BaseUrl/api/admin/security/users/grant-premium" -Method POST -Headers @{ "x-admin-token" = $Token } -ContentType "application/json" -Body $GrantBody | ConvertTo-Json -Depth 8
```

Grant until a fixed date/time:

```powershell
$GrantBody = @{ email = $Email; until = "2026-12-31T23:59:59Z" } | ConvertTo-Json -Compress
Invoke-RestMethod -Uri "$BaseUrl/api/admin/security/users/grant-premium" -Method POST -Headers @{ "x-admin-token" = $Token } -ContentType "application/json" -Body $GrantBody | ConvertTo-Json -Depth 8
```

Permanent grant (until manually revoked):

```powershell
$GrantBody = @{ email = $Email } | ConvertTo-Json -Compress
Invoke-RestMethod -Uri "$BaseUrl/api/admin/security/users/grant-premium" -Method POST -Headers @{ "x-admin-token" = $Token } -ContentType "application/json" -Body $GrantBody | ConvertTo-Json -Depth 8
```

Verify after any grant:

```powershell
$VerifyUri = $BaseUrl + "/api/admin/security/users?email=" + [uri]::EscapeDataString($Email)
Invoke-RestMethod -Uri $VerifyUri -Method GET -Headers @{ "x-admin-token" = $Token } | ConvertTo-Json -Depth 8
```

### 7.2 Revoke live premium (PowerShell)

```powershell
$RevokeBody = @{ email = $Email } | ConvertTo-Json -Compress
Invoke-RestMethod -Uri "$BaseUrl/api/admin/security/users/revoke-premium" -Method POST -Headers @{ "x-admin-token" = $Token } -ContentType "application/json" -Body $RevokeBody | ConvertTo-Json -Depth 8
```

### 7.3 Error guide (live admin API)

1. `404 Not Found` on endpoint:
- Route not deployed to live yet or wrong host/path.
- Deploy latest `main` and retry.

2. `401/403`:
- Missing/invalid `x-admin-token`.
- Check `ADMIN_SECURITY_TOKEN` in Render Environment.

3. `404 User not found`:
- That email is not registered on live.
- Ask user to sign up first, then run grant again.

### 7.4 Critical note for Postgres live

If production uses `AUTH_STORE_BACKEND=postgres`, do not use repo `backend/data/accounts.json` edits for live premium grants. Those file edits do not control Postgres live data.

### 7.5 Legacy fallback (file backend only)

Use this only if live is intentionally file-backed (not Postgres):
1. Run local script to update `backend/data/accounts.json`.
2. Commit/push.
3. Redeploy.
4. Optionally revert the data commit afterward.

### 7.6 Gift-link flow (manual premium + custom message)

Use this when you want to gift premium manually and send a branded link message.

Important:
1. Gift link UI does not grant premium by itself.
2. Grant premium first (section `7.0` / `7.1`), then send gift link.

Recommended order:
1. Grant premium to recipient email via admin API.
2. Verify premium is active.
3. Send gift link with your custom text.

Gift URL template:

```text
https://www.cosmicalearn.com/?gift=1&giftTitle=...&giftMessage=...&giftFrom=...&giftOpenText=...&giftCheckText=...&giftLaterText=...
```

Supported query params:
1. Required:
   - `gift=1`
2. Optional:
   - `giftTitle`
   - `giftMessage`
   - `giftFrom`
   - `giftOpenText`
   - `giftCheckText`
   - `giftLaterText`

Behavior:
1. If recipient is logged out:
   - auth panel auto-opens first (signup/login),
   - then gift flow continues after login.
2. If recipient is logged in:
   - gift modal opens directly.
3. Recipient can tap `Check activation` to refresh account state.

Example ready link:

```text
https://www.cosmicalearn.com/?gift=1&giftTitle=A%20Premium%20Gift%20For%20You&giftMessage=Here%E2%80%99s%20your%20free%20Cosmica%20Premium%20gift.%20Enjoy%20full%20learning%20access%20and%20have%20the%20most%20joyful%20language%20exploration%20across%20every%20world.&giftFrom=Andy%20%EC%95%A4%EB%94%94
```
