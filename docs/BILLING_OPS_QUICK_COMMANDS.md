# Billing Ops Quick Commands

This runbook is for fast premium entitlement diagnostics and repair.

## Prerequisites

- `ADMIN_SECURITY_TOKEN` configured in backend runtime.
- `STRIPE_SECRET_KEY` configured for Stripe-backed checks/resync.
- Backend reachable (local or production).

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

## 2) Dry-run one-user resync

See what would happen without changing account state.

```bash
curl -sS -X POST "https://YOUR_HOST/api/admin/security/billing/stripe/resync-user" \
  -H "Content-Type: application/json" \
  -H "x-admin-token: YOUR_ADMIN_SECURITY_TOKEN" \
  -d '{"email":"user@example.com","dryRun":true}'
```

## 3) Apply one-user resync

Synchronize one account with Stripe truth.

```bash
curl -sS -X POST "https://YOUR_HOST/api/admin/security/billing/stripe/resync-user" \
  -H "Content-Type: application/json" \
  -H "x-admin-token: YOUR_ADMIN_SECURITY_TOKEN" \
  -d '{"email":"user@example.com"}'
```

Optional guardrail:
- `"keepPremiumIfNoStripeActive": true` avoids forced downgrade when Stripe has no active subscription.

## 4) Local dry-run full reconciliation

```bash
npm run premium:reconcile:stripe
```

Scope to one account:

```bash
npm run premium:reconcile:stripe -- --email=user@example.com
npm run premium:reconcile:stripe -- --userId=UUID_VALUE
```

## 5) Local apply full reconciliation

```bash
npm run premium:reconcile:stripe -- --apply
```

Safety notes:
- Script writes backup before modifying `backend/data/accounts.json`.
- Review dry-run output first.

## 6) User self-service restore endpoint

Authenticated users can trigger restore from their account panel or API:

```bash
POST /api/billing/subscription/restore
```

This endpoint does **not** force downgrade when Stripe has no active subscription.

## 7) Verify billing contracts locally

```bash
npm run billing:contract
```

Checks:
- `GET /api/billing/subscription/status`
- `POST /api/billing/subscription/cancel`
- `POST /api/billing/webhooks/stripe` signature rejection path

## 8) Verify checkout parity (desktop vs mobile)

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
