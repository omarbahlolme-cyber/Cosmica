# Test Users Registry

Use this file as the single notes map for QA/test accounts, their roles, and intended usage.

## Scope and source of truth

1. Local development (file-backed auth):
- Accounts are in `backend/data/accounts.json`.

2. Production on Render (Postgres auth backend):
- Accounts are in Postgres, not in local `backend/data/accounts.json`.
- If production uses `AUTH_STORE_BACKEND=postgres`, local file snapshots will not show live users.

## Current known test users (local snapshot)

Snapshot source: `backend/data/accounts.json`
Snapshot timestamp: 2026-02-24/25 (latest local inspection)

| Email | Role | Provider | Premium | Email Verified | Main purpose | Password handling |
|---|---|---|---|---|---|---|
| `qa.test@cosmica.local` | QA Free User | Email/password | No (`plan=free`) | Yes | Baseline auth, free-plan gating, non-premium progress behavior | Not stored in repo. Use secure password manager or "Forgot password". |

## Recommended role set (maintain these)

1. `QA Free User`:
- Must stay non-premium.
- Used to validate free-plan restrictions and upgrade prompts.

2. `QA Premium User`:
- Must have active premium.
- Used to validate premium-only progress, quests, achievements, and billing UX.

3. `QA Google User`:
- Google-auth account (no local password flow).
- Used to validate Google sign-in/up and reset-password restrictions.

4. `QA Email User (Unverified)`:
- New email/password account before verification.
- Used to validate verify-link and resend-verification flows.

## Update rules

1. Update this file whenever test users are created, deleted, or role/premium status changes.
2. Never store plain-text passwords in git-tracked files.
3. If a password must be shared with maintainers, use a secure password manager only.
4. If unsure about an account state, run lifecycle checks:

```bash
npm run auth:user:lifecycle -- --email=user@example.com
```

## Quick local account listing command

```powershell
$json = Get-Content backend/data/accounts.json -Raw | ConvertFrom-Json
$json.users.PSObject.Properties | ForEach-Object {
  $u = $_.Value
  $p = $u.data.profile
  [PSCustomObject]@{
    email = $u.email
    provider = $p.authProvider
    premium = ($p.isPremium -or $p.premium)
    plan = $p.plan
    emailVerified = $u.emailVerified
  }
}
```
