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

### 4.1 Auth readiness checks

Run before production deploys:

1. `npm run auth:check:readiness`
2. Fix all `FAIL` items before go-live.
3. Review `WARN` items and explicitly accept or remediate.

### 4.2 Billing webhook + Google auth recovery checks

Run these after billing/auth incidents, token rotation, or production redeploys.

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

5. Confirm Google auth works on mobile browser:
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
