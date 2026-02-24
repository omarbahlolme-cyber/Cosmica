# Change Impact Guide

Use this file before editing so you know what else must be checked.

## 1) Quick rule

If you change:
1. endpoint names,
2. response fields,
3. auth/session behavior,
4. progress/billing data shape,

then you must check both frontend callers and backend contract checks before merge.

## 2) Change matrix (what to touch together)

| If you change | Also check | Why |
|---|---|---|
| Auth UI labels or auth dropdown flow | `frontend/app.js`, `frontend/style.css` | UI state is tightly coupled to auth panel mode and notice placement. |
| Auth API contract (`/api/auth/*` response fields/status codes) | `frontend/app.js`, `scripts/smoke.js`, `scripts/user-state-contract-check.js` | Frontend expects exact fields like `verificationRequired`, `authPanel`, `useGoogleSignIn`. |
| Session cookie rules (`AUTH_COOKIE_NAME`, cookie flags, secure/sameSite) | `backend/server.js`, login/logout/me flows in `frontend/app.js` | Small cookie changes can silently break login persistence. |
| Email verification or reset flow | `backend/server.js` routes, auth notices in `frontend/app.js`, `.env.example` mail settings | Signup/login UX depends on redirect query flags and mail delivery availability. |
| `normalizeUserData` shape or profile fields | `frontend/app.js`, admin security routes, billing routes | Many routes read profile flags (`authProvider`, premium status, avatars). |
| Progress schema (`normalizeProgress`, track payload keys) | `frontend/app.js`, `frontend/maps/app-maps.js`, `/api/progress*` routes | Map completion, XP, streak, and stars rely on stable key names. |
| World/map translation handling | `frontend/maps/app-maps.js`, `frontend/maps/translations.json`, `frontend/worlds/<world-key>/translations.json` | Missing keys create mixed-language UI regressions. |
| Premium checkout config logic | `backend/server.js` billing routes, `.env.example`, billing scripts in `scripts/` | Stripe/Ko-fi fallback depends on env and route contract consistency. |
| Webhook handlers (`/api/billing/webhooks/*`) | Signature/token validation, security events, restore/manage routes | Webhook logic drives premium activation and cancellation state. |
| Admin security endpoints | `frontend/admin-security.html`, `backend/server.js`, `docs/OPERATIONS_HARDENING.md` | Ops team depends on these routes for incident response. |
| SEO/legal files | `frontend/sitemap.xml`, `frontend/robots.txt`, legal pages in `frontend/*.html` | Deployment/compliance and discoverability can break without obvious runtime errors. |

## 3) API-safe edit checklist

When editing backend routes:

1. Keep route path stable unless migration is intentional.
2. Preserve existing response fields used by frontend.
3. Prefer additive changes over breaking renames.
4. If you rename/remove a field, update frontend in the same PR.
5. Update docs when behavior changes (`README.md`, handoff docs, this guide).

## 4) Minimum verification by change type

### Visual-only frontend changes

```bash
npm run check:syntax
npm run smoke
```

### Auth/progress/billing/backend contract changes

```bash
npm run check:syntax
npm run smoke
npm run billing:user-state:contract
```

### Release-ready gate

```bash
npm run quality
```

## 5) High-risk areas (extra caution)

1. `backend/server.js` auth routes (`/api/auth/*`): user login/signup/reset can break quickly.
2. `backend/server.js` billing webhooks: payment state and premium access continuity.
3. `frontend/app.js` account hub logic: many auth notices and panel states share one runtime.
4. Progress persistence contract (`/api/progress`, `/api/progress/track`): affects gamification data integrity.

## 6) New endpoint checklist

Before adding a new endpoint:

1. Add rate limiter and auth requirement if needed.
2. Add input validation and size limits.
3. Ensure no sensitive data leaks in errors.
4. Reuse existing security/audit helpers where possible.
5. Add a short purpose comment above the route in `backend/server.js`.
6. Run `npm run quality` before merge.
