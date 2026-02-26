# Cosmica Zero-to-Hero Handoff Guide

This is the beginner handoff guide for the full Cosmica project.

Use this guide to understand:
1. what runs where,
2. where to edit each feature,
3. what checks to run before deploy,
4. how to avoid breaking production.

Docs usage rule:
1. Use this file for onboarding flow and release checklist.
2. Use runbooks for deep operational procedures (do not duplicate full procedures here).

---

## 0) Notes Map Roles

1. `docs/HANDOFF_ZERO_TO_HERO.md`
- Entry flow for new developers and release checklist.

2. `docs/BEGINNER_EDIT_MAP.md`
- "I need to change X, where is the file?" quick locator.

3. `docs/PROJECT_STRUCTURE.md`
- High-level repo map and ownership boundaries.

4. `docs/CHANGE_GUIDE.md`
- Impact matrix: if you change X, what else must be validated.

5. `docs/OPERATIONS_HARDENING.md`
- Canonical operations/security runbook.

6. `docs/BILLING_OPS_QUICK_COMMANDS.md`
- Canonical billing and premium incident commands.

7. `docs/ROLLBACK_RUNBOOK.md`
- Canonical rollback procedure.

8. `docs/THIRD_PARTY_SERVICES_MAP.md`
- Canonical external platform ownership map.

9. `docs/TEST_USERS_REGISTRY.md`
- Canonical QA/test-user registry.

---

## 1) Project at a glance

Cosmica has two runtime layers:

1. Frontend (static pages + JS/CSS):
- User-facing pages in `frontend/`.
- Shared runtime in `frontend/app.js`.
- Map runtime in `frontend/maps/app-maps.js`.

2. Backend (Node + Express):
- API routes and static hosting in `backend/server.js`.
- Root `server.js` only bootstraps `backend/server.js`.

---

## 2) First-time local setup

Requirements:
1. Node.js 18+ (LTS recommended)
2. npm

Install and run:

```bash
npm install
npm start
```

Local URL:
- `http://127.0.0.1:3000`

---

## 3) Where to edit what (quick ownership map)

1. Auth dropdown/login/signup/reset UI:
- `frontend/app.js`
- `frontend/style.css`
- Gift-link premium modal and custom URL parameters (`gift=1`, `giftTitle`, etc.) also live in `frontend/app.js`.
- One-time gift-token redeem APIs (`/api/admin/security/gifts/*`, `/api/gifts/redeem/*`) live in `backend/server.js`.

2. Words/Phrases/Grammar rendering and filters:
- `frontend/maps/app-maps.js`
- `frontend/maps/style-maps.css`

3. API behavior, auth/session/security headers/cookies:
- `backend/server.js`

4. Billing and premium backend flow:
- `backend/server.js`
- `scripts/billing-*.js` and related scripts in `scripts/`

5. Legal and indexing:
- `frontend/privacy.html`
- `frontend/terms.html`
- `frontend/license.html`
- `frontend/robots.txt`
- `frontend/sitemap.xml`

6. Operations and incident procedures:
- `docs/OPERATIONS_HARDENING.md`
- `docs/ROLLBACK_RUNBOOK.md`
- `docs/BILLING_OPS_QUICK_COMMANDS.md`

7. Test users and QA account roles:
- `docs/TEST_USERS_REGISTRY.md`

8. Third-party platform ownership and operations map:
- `docs/THIRD_PARTY_SERVICES_MAP.md`

---

## 4) New developer first hour

1. Read in order:
- `README.md`
- `docs/PROJECT_STRUCTURE.md`
- `docs/CHANGE_GUIDE.md`
- `docs/FRONTEND_RUNTIME_NOTES.md`
- `docs/OPERATIONS_HARDENING.md`
- `docs/THIRD_PARTY_SERVICES_MAP.md`

2. Start app and verify baseline:

```bash
npm run check:syntax
npm run smoke
```

3. Make one small change and run:

```bash
npm run quality
```

If `quality` fails, do not deploy.

---

## 5) Daily safe workflow

1. Pull latest code.
2. Make a minimal scoped change.
3. Run targeted checks.
4. Run full quality gate before merge/deploy.

Recommended command order:

```bash
npm run check:syntax
npm run smoke
npm run quality
```

---

## 6) Command map by scenario

A) JS/CSS behavior change:

```bash
npm run check:syntax
npm run smoke
npm run quality
```

B) SEO/legal/indexing changes:

```bash
npm run generate:sitemap
npm run check:seo
npm run indexing:check
npm run quality
```

C) Layout/responsive changes:

```bash
npm run verify:viewport:browsers
npm run verify:viewport
```

D) Auth/billing logic changes:

```bash
npm run billing:user-state:contract
npm run billing:contract
npm run verify:prod-integrations
```

E) Backup tasks:

```bash
npm run backup:create
npm run backup:verify
npm run auth-backup:create
npm run auth-backup:verify
```

F) Auth provider/email flow changes:

```bash
npm run auth:check:readiness
npm run auth:provider:contract
npm run verify:prod-integrations
```

G) Accessibility + cross-device confidence:

```bash
npm run check:a11y
npm run verify:pc-mobile
npm run verify:viewport:browsers
```

H) End-to-end user-flow confidence (high impact changes):

```bash
npm run test:user-matrix
npm run smoke:premium:continuity
```

---

## 7) Production safety checklist

Before deploy, require PASS on:

```bash
npm run quality
npm run verify:prod-integrations
```

If auth/billing changed, also run:

```bash
npm run billing:user-state:contract
npm run billing:contract
```

---

## 8) Common incidents and where to look

1. Login/session/account issues:
- `backend/server.js` auth/session routes
- `backend/data/accounts.json`
- `backend/data/security-events.json`
- Run per-user lifecycle triage:

```bash
npm run auth:user:lifecycle -- --email=user@example.com
```

- See recovery + triage details in `docs/OPERATIONS_HARDENING.md` (section `3.7 Auth-store corruption recovery + user lifecycle triage`)

2. Premium/billing issues:
- `docs/BILLING_OPS_QUICK_COMMANDS.md`
- `npm run billing:contract`
- `npm run premium:reconcile:stripe`

3. Map rendering/translation issues:
- `frontend/maps/app-maps.js`
- `frontend/maps/style-maps.css`
- `frontend/maps/translations.json`
- `frontend/worlds/<world>/translations.json`

4. SEO/indexing issues:
- `frontend/robots.txt`
- `frontend/sitemap.xml`
- Canonical tags in page `<head>`

Then run:

```bash
npm run indexing:check
```

5. Security/compliance issues:
- `docs/SECURITY.md`
- `docs/ENFORCEMENT_RUNBOOK.md`
- `docs/OPERATIONS_HARDENING.md`

---

## 9) Rules to avoid breaking production

1. Avoid mass-editing all HTML files unless you run `npm run quality` immediately after.
2. Keep cache-busting version params consistent for `app.js` and CSS references.
3. Do not change auth/billing payload contracts without contract checks.
4. Prefer minimal scoped edits over broad refactors.
5. Never deploy on failing quality checks unless an emergency is explicitly approved.

---

## 10) Release handoff checklist (copy/paste)

1. Confirm clean understanding of current branch and latest pull.
2. Run full quality gate:

```bash
npm run quality
```

3. Run production integration checks:

```bash
npm run verify:prod-integrations
```

4. If legal/SEO files changed:

```bash
npm run indexing:check
```

5. If auth or billing changed:

```bash
npm run billing:user-state:contract
npm run billing:contract
```

6. Create backups before deploy:

```bash
npm run backup:create
npm run backup:verify
npm run auth-backup:create
npm run auth-backup:verify
```

7. Deploy.
8. Post-deploy smoke:

```bash
npm run smoke
npm run verify:prod-integrations
```

9. If critical failure appears, follow `docs/ROLLBACK_RUNBOOK.md` immediately.

---

## 11) Practical go-live checklist (auth + UX)

Run local health checks:

```bash
npm run quality
npm run auth:check:readiness
```

Manual test matrix:
1. Desktop Chrome + Safari/Firefox
2. One real phone
3. Email sign up -> verify link -> login
4. Forgot password -> reset -> login
5. Google sign in/sign up
6. Delete account
7. Open worlds/maps, switch base language, open grammar modal, play audio

Look for:
1. No overlapping/clipped text
2. No broken dropdowns/buttons
3. No browser console errors
4. No server errors in terminal

---

## 12) Maintainer notes

1. Keep this file updated when command names, deploy criteria, or critical routes change.
2. Keep checkpoint/history notes in a separate section or dedicated changelog to avoid breaking checklist flow.
3. If this file moves, update links in `README.md`.
4. Keep detailed operational procedures in runbooks, then link from here instead of duplicating.

---

## 13) Operational Sources of Truth

Use these files directly for detailed procedures:

1. No-shell Render/Postgres auth verification:
- `docs/OPERATIONS_HARDENING.md` section `4.6` and section `4.1`.

2. Manual premium (local and live):
- `docs/OPERATIONS_HARDENING.md` section `6` and section `7`.
- `docs/BILLING_OPS_QUICK_COMMANDS.md` for billing diagnostics/resync.

3. Billing incident response and Stripe/Ko-fi checks:
- `docs/BILLING_OPS_QUICK_COMMANDS.md`.

4. Rollback process:
- `docs/ROLLBACK_RUNBOOK.md`.

5. Platform ownership and external dashboards:
- `docs/THIRD_PARTY_SERVICES_MAP.md`.
