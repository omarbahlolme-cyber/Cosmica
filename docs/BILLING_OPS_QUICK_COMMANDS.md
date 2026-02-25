# Billing Ops Quick Commands

This runbook is for fast premium entitlement diagnostics and repair.

## Prerequisites

- `ADMIN_SECURITY_TOKEN` configured in backend runtime.
- `STRIPE_SECRET_KEY` configured for Stripe-backed checks/resync.
- Backend reachable (local or production).
- On Windows PowerShell, prefer `Invoke-WebRequest` or `curl.exe` (not PowerShell `curl` alias with `-H/-d`).

## 1) Stripe health snapshot

Read webhook health state and Stripe config presence.

```bash
curl -sS "https://YOUR_HOST/api/admin/security/billing/stripe-health" \
  -H "x-admin-token: YOUR_ADMIN_SECURITY_TOKEN"
```

Use this to confirm:
- webhook `lastReceivedAt`, `lastProcessedAt`, `lastRejectedAt`, `lastErrorAt`
- latest event metadata
- daily reconcile summary

## 1.1) Verify live registered users

Check whether a newly registered live account exists in runtime auth store:

```bash
curl -sS "https://YOUR_HOST/api/admin/security/users?limit=50" \
  -H "x-admin-token: YOUR_ADMIN_SECURITY_TOKEN"
```

Filter by exact email:

```bash
curl -sS "https://YOUR_HOST/api/admin/security/users?email=user@example.com" \
  -H "x-admin-token: YOUR_ADMIN_SECURITY_TOKEN"
```

Filter to recent registrations only (example: last 24 hours):

```bash
curl -sS "https://YOUR_HOST/api/admin/security/users?lastHours=24&limit=200" \
  -H "x-admin-token: YOUR_ADMIN_SECURITY_TOKEN"
```

Filter from an exact timestamp (`since` takes precedence over `lastHours`):

```bash
curl -sS "https://YOUR_HOST/api/admin/security/users?since=2026-02-22T00:00:00Z&limit=200" \
  -H "x-admin-token: YOUR_ADMIN_SECURITY_TOKEN"
```

PowerShell equivalent (copy/paste safe):

```powershell
$Token = "YOUR_ADMIN_SECURITY_TOKEN"
$Headers = @{ "x-admin-token" = $Token }
Invoke-WebRequest -Uri "https://YOUR_HOST/api/admin/security/users?since=2026-02-22T00:00:00Z&limit=200" -Method GET -Headers $Headers
```

Code map pointers for this live check:
- Admin users endpoint handler: `backend/server.js` (`/api/admin/security/users`).
- Auth store file constant: `AUTH_STORE_FILE` -> `backend/data/accounts.json`.
- Registered audit file constant: `REGISTERED_ACCOUNTS_AUDIT_FILE` -> `backend/data/registered-accounts.json`.
- Signup insertion path: `/api/auth/signup` writes to `authStore.users` and `authStore.emailIndex`.

### 1.1.1) Exact live URL + query (today signups)

Production domain examples (`www.cosmicalearn.com`):

```bash
curl -sS "https://www.cosmicalearn.com/api/admin/security/users?since=2026-02-22T00:00:00Z&limit=200" \
  -H "x-admin-token: YOUR_ADMIN_SECURITY_TOKEN"
```

Or rolling last 24 hours:

```bash
curl -sS "https://www.cosmicalearn.com/api/admin/security/users?lastHours=24&limit=200" \
  -H "x-admin-token: YOUR_ADMIN_SECURITY_TOKEN"
```

PowerShell (build "today UTC" timestamp automatically):

```powershell
$Token = "YOUR_ADMIN_SECURITY_TOKEN"
$Headers = @{ "x-admin-token" = $Token }
$SinceUtc = (Get-Date).ToUniversalTime().ToString("yyyy-MM-dd") + "T00:00:00Z"
$Uri = "https://www.cosmicalearn.com/api/admin/security/users?since=$SinceUtc&limit=200"
Invoke-WebRequest -Uri $Uri -Method GET -Headers $Headers
```

## 1.2) Manually grant Premium on live (no shell)

Canonical manual premium procedure now lives in:
- `docs/OPERATIONS_HARDENING.md` section `7` (live) and section `6` (local).

Use this billing runbook for Stripe/Ko-fi diagnostics and premium reconciliation, not as the primary manual-grant guide.

## 2) Troubleshooting admin endpoint errors

- `404 Not Found`: live backend does not include `/api/admin/security/users*` routes yet. Deploy latest `main` first.
- `401/403`: admin token missing or incorrect in request/runtime.
- `curl: unmatched close brace/bracket`: JSON quoting issue; use `Invoke-WebRequest` with `ConvertTo-Json`.
- `{"error":"Internal server error","requestId":null}` while using curl-style flags in PowerShell usually indicates malformed body parsing.

If live endpoint is missing:
1. Deploy latest `main` first.
2. Follow fallback guidance in `docs/OPERATIONS_HARDENING.md` section `7.5`.

## 3) Dry-run one-user resync

See what would happen without changing account state.

```bash
curl -sS -X POST "https://YOUR_HOST/api/admin/security/billing/stripe/resync-user" \
  -H "Content-Type: application/json" \
  -H "x-admin-token: YOUR_ADMIN_SECURITY_TOKEN" \
  -d '{"email":"user@example.com","dryRun":true}'
```

## 4) Apply one-user resync

Synchronize one account with Stripe truth.

```bash
curl -sS -X POST "https://YOUR_HOST/api/admin/security/billing/stripe/resync-user" \
  -H "Content-Type: application/json" \
  -H "x-admin-token: YOUR_ADMIN_SECURITY_TOKEN" \
  -d '{"email":"user@example.com"}'
```

Optional guardrail:
- `"keepPremiumIfNoStripeActive": true` avoids forced downgrade when Stripe has no active subscription.

## 5) Local dry-run full reconciliation

```bash
npm run premium:reconcile:stripe
```

Scope to one account:

```bash
npm run premium:reconcile:stripe -- --email=user@example.com
npm run premium:reconcile:stripe -- --userId=UUID_VALUE
```

## 6) Local apply full reconciliation

```bash
npm run premium:reconcile:stripe -- --apply
```

Safety notes:
- Script writes backup before modifying `backend/data/accounts.json`.
- Review dry-run output first.

## 7) User self-service restore endpoint

Authenticated users can trigger restore from their account panel or API:

```bash
POST /api/billing/subscription/restore
```

This endpoint does **not** force downgrade when Stripe has no active subscription.

Expected responses:
- `200` with status `restored` or `already_active` when an active premium entitlement exists.
- `409` with error `No active premium plan found.` when no active premium entitlement is detected.

## 8) Verify billing contracts locally

```bash
npm run billing:contract
```

Checks:
- `GET /api/billing/subscription/status`
- `POST /api/billing/subscription/cancel`
- `POST /api/billing/webhooks/stripe` signature rejection path

## 9) Verify checkout parity (desktop vs mobile)

Deterministic local mode (recommended for CI/local):

```bash
npm run smoke:checkout:cross-device
```

External-mode check (manual release validation against a running host):

```bash
SMOKE_BASE_URL="https://YOUR_HOST" \
SMOKE_AUTH_EMAIL="your-test-user@example.com" \
SMOKE_AUTH_PASSWORD="YOUR_TEST_PASSWORD" \
npm run smoke:checkout:cross-device
```

Notes:
- Local mode is isolated: it seeds/restores auth data and boots a local server.
- External mode is explicit and should be used only for controlled release checks.
