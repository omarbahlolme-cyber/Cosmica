# Cosmica Zero-to-Hero Handoff Guide

This guide is the beginner handoff map for the full Cosmica project.

Use it to understand:
1. what runs where,
2. which file controls which behavior,
3. what commands to run for common tasks,
4. how to avoid breaking production.

---

## 1) Project at a glance

Cosmica has two main parts:

1. Frontend (static pages + JavaScript):
   - User-facing learning pages (world/letters/words/phrases/grammar).
   - Shared app logic in `frontend/app.js`.
   - Map-specific runtime in `frontend/maps/app-maps.js`.

2. Backend (Node + Express):
   - API routes for auth, progress, billing, feedback, chat, translate, tts.
   - Main server in `backend/server.js`.
   - Root `server.js` only bootstraps `backend/server.js`.

---

## 2) First-time setup (local)

### Requirements

1. Node.js 18+ (recommended current LTS).
2. npm (comes with Node).

### Install and run

```bash
npm install
npm start
```

Local app usually runs at:
- `http://127.0.0.1:3000`

---

## 3) Repository map (what each area is responsible for)

### Core runtime

1. `backend/server.js`
   - API server, security headers, auth/billing/session/progress logic, static hosting.

2. `frontend/app.js`
   - Shared UI logic, auth dropdown flow, home/world behavior, Mimi chat client flow, URL param handling.

3. `frontend/maps/app-maps.js`
   - Words/Phrases/Grammar/Letters map rendering and filters.

4. `frontend/style.css`
   - Global styles for all pages.

5. `frontend/maps/style-maps.css`
   - Map-only visual styles and map layout behavior.

### Important content and SEO/legal

1. `frontend/robots.txt` - crawl directives.
2. `frontend/sitemap.xml` - indexable URL inventory.
3. `frontend/privacy.html`, `frontend/terms.html`, `frontend/license.html` - legal pages.
4. `frontend/security.txt` - served at `/.well-known/security.txt` by backend route.

### Docs and operations

1. `README.md` - quick start + main commands.
2. `docs/PROJECT_STRUCTURE.md` - file/folder architecture.
3. `docs/FRONTEND_RUNTIME_NOTES.md` - runtime guardrails.
4. `docs/OPERATIONS_HARDENING.md` - hardening + backup + incident routines.
5. `docs/BILLING_OPS_QUICK_COMMANDS.md` - billing diagnostics and recovery commands.
6. `docs/ENFORCEMENT_RUNBOOK.md` - policy enforcement process.
7. `docs/ROLLBACK_RUNBOOK.md` - rollback procedure.
9. `docs/LINGUIST_WORLD_REVIEW_CHECKLIST.md` - per-world linguist QA checklist (letters/words/phrases/grammar).
10. `docs/LINGUIST_WORLD_REVIEW_TEMPLATE.csv` - spreadsheet-style tracker (one row per world x map).

---

## 4) Daily developer workflow (safe path)

1. Pull latest code.
2. Make minimal scoped change.
3. Run targeted checks.
4. Run full quality check before merge/deploy.

Recommended command order:

```bash
npm run check:syntax
npm run smoke
npm run quality
```

If `npm run quality` fails, do not deploy until all failing checks are understood and resolved.

---

## 5) Command map by scenario

### A) "I changed JS/CSS and want to make sure site still works"

```bash
npm run check:syntax
npm run smoke
npm run quality
```

### B) "I changed SEO/legal/indexing related files"

```bash
npm run check:seo
npm run indexing:check
npm run quality
```

### C) "I changed layout responsiveness"

```bash
npm run verify:viewport:browsers
npm run verify:viewport
```

### D) "I changed billing/auth behavior"

```bash
npm run billing:user-state:contract
npm run billing:contract
npm run verify:prod-integrations
```

### E) "I need to create backups"

Repository/source backup:

```bash
npm run backup:create
npm run backup:verify
```

Runtime auth-data backup:

```bash
npm run auth-backup:create
npm run auth-backup:verify
```

Restore auth-data (dry run):

```bash
npm run auth-backup:restore -- --yes --dry-run
```

---

## 6) Production safety checklist (before deploy)

Run and require PASS:

```bash
npm run quality
```

Then verify production integrations:

```bash
npm run verify:prod-integrations
```

For release confidence on auth user states and premium continuity:

```bash
npm run billing:user-state:contract
npm run smoke:premium:continuity
```

---

## 7) Common incidents and exactly where to look

### 1) Login/account/session issues

Check:
1. `backend/server.js` auth routes and session cookie handling.
2. `backend/data/accounts.json` (runtime auth store).
3. `backend/data/security-events.json` for auth/security event context.

### 2) Premium/billing issues

Use:
1. `docs/BILLING_OPS_QUICK_COMMANDS.md` (admin endpoints and scripts).
2. `npm run billing:contract` and `npm run premium:reconcile:stripe`.

### 3) Map rendering/translation issues

Check:
1. `frontend/maps/app-maps.js` render paths.
2. `frontend/maps/style-maps.css` map layout styles.
3. `frontend/worlds/<world>/translations.json` and `frontend/maps/translations.json`.

### 4) SEO/indexing complaints

Check:
1. `frontend/robots.txt`
2. `frontend/sitemap.xml`
3. canonical tags in page `<head>`

Then run:

```bash
npm run indexing:check
```

### 5) Security/compliance concern

Use:
1. `docs/SECURITY.md`
2. `docs/ENFORCEMENT_RUNBOOK.md`
3. `docs/OPERATIONS_HARDENING.md`

---

## 8) File ownership map (quick reference)

1. "Global navigation, account menu, home interactions" -> `frontend/app.js` + `frontend/style.css`
2. "Words/Phrases/Grammar cards and filters" -> `frontend/maps/app-maps.js` + `frontend/maps/style-maps.css`
3. "Backend APIs/security headers/cookies/rate limits" -> `backend/server.js`
4. "Legal wording" -> `frontend/privacy.html`, `frontend/terms.html`, `frontend/license.html`
5. "Indexing controls" -> `frontend/robots.txt`, `frontend/sitemap.xml`
6. "Incident operations" -> `docs/OPERATIONS_HARDENING.md`, `docs/ROLLBACK_RUNBOOK.md`, `docs/BILLING_OPS_QUICK_COMMANDS.md`

---

## 9) Rules to avoid breaking production

1. Do not mass-edit all HTML files unless you run `npm run quality` immediately after.
2. Keep cache-busting version params consistent across pages when touching `app.js`/CSS references.
3. Do not change auth/billing payload contracts without running contract scripts.
4. Prefer minimal, scoped edits over broad refactors.
5. Never deploy on failing `quality` checks unless it is an emergency and explicitly approved.

---

## 10) "Where do I start?" (new developer first hour)

1. Read in this order:
   1. `README.md`
   2. `docs/PROJECT_STRUCTURE.md`
   3. `docs/FRONTEND_RUNTIME_NOTES.md`
   4. `docs/OPERATIONS_HARDENING.md`
2. Run local app:

```bash
npm install
npm start
```

3. Run baseline checks:

```bash
npm run check:syntax
npm run smoke
```

4. Make one small change and validate with:

```bash
npm run quality
```

---

## 11) Handoff notes for maintainers

1. Keep this guide updated whenever:
   - command names change,
   - release criteria changes,
   - new critical routes/services are added.
2. Update links in `README.md` if this file moves.

---

## 12) Release handoff checklist (copy/paste for beginner dev)

Use this exact sequence before a production handoff or deploy:

1. Confirm working tree status and latest pull.
2. Run full quality gate:

```bash
npm run quality
```

3. Run production integration checks:

```bash
npm run verify:prod-integrations
```

4. If legal/SEO files changed, run indexing checks:

```bash
npm run indexing:check
```

5. If auth or billing changed, run:

```bash
npm run billing:user-state:contract
npm run billing:contract
```

6. Create fresh backups before deploy:

---

## 13) Latest checkpoint (2026-02-24)

Use this as the resume point for the next maintainer.

### Completed since previous checkpoint

1. Fixed duplicate "Choose a section" controls regression on map pages.
   - Root cause: overlapping progressive render passes could append stale controls.
   - Fix: render-run guards/run IDs added in `frontend/maps/app-maps.js` to cancel stale async batches.

2. Ran full world content audit and pedagogical consistency checks.
   - `node scripts/audit-learning-maps.js` now reports zero findings.
   - `npm run check:intents` passes.

3. Fixed real French content conflict in `frontend/worlds/french/translations.json`.
   - Removed mojibake duplicate variants (`fran?ais`).
   - Kept canonical accented forms (`français`) with intent tags.

4. Improved audit robustness for CJK/no-space scripts.
   - Updated `scripts/audit-learning-maps.js` with character n-gram similarity fallback to reduce false positives.

5. Added linguist handoff artifacts for all 4 maps per world.
   - `docs/LINGUIST_WORLD_REVIEW_CHECKLIST.md`
   - `docs/LINGUIST_WORLD_REVIEW_TEMPLATE.csv`

### Validation at checkpoint

1. `npm run quality` -> PASS
2. `node scripts/audit-learning-maps.js` -> PASS (0 findings)
3. `npm run check:intents` -> PASS

### If you continue work next

1. Start with linguist review tracker completion (all worlds x letters/words/phrases/grammar).
2. Keep edits scoped to world packs unless runtime behavior is explicitly targeted.
3. Re-run `npm run quality` before handoff/deploy.

```bash
npm run backup:create
npm run backup:verify
npm run auth-backup:create
npm run auth-backup:verify
```

7. Verify all commands above are PASS.
8. Deploy.
9. Post-deploy smoke:

```bash
npm run smoke
npm run verify:prod-integrations
```

10. If any critical failure appears, follow `docs/ROLLBACK_RUNBOOK.md` immediately.

---

## 14) Practical go-live checklist (auth + UX)

Run local health checks:

```bash
npm run quality
npm run auth:check:readiness
```

Test manually on real browsers/devices:

1. Chrome + Safari (or Firefox) on desktop.
2. 1 real phone.

Test critical user flows end-to-end:

1. Email sign up -> verify link -> login.
2. Forgot password -> reset link -> new password login.
3. Google sign in/sign up.
4. Delete account.
5. Open worlds/maps, switch base language, open grammar modal, play audio.

Check for visible issues:

1. No overlapping text.
2. No broken buttons/dropdowns.
3. No console errors in browser devtools.
4. No server errors in terminal.

If all pass:

1. You are good. No immediate fix needed.

Optional hardening (not urgent):

1. Add an alert webhook for auth/security events.
2. Remove `shell: true` from `scripts/security-audit-check.js`.
