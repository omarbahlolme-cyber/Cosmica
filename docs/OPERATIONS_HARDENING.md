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

## 5) Policy Enforcement Process

For privacy/terms/license violations and response steps, use:

- `ENFORCEMENT_RUNBOOK.md`
