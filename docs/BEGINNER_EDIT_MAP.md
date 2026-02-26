# Beginner Edit Map

Use this when you know what you want to change, but not where.

## Feature -> primary files

1. Header/nav behavior, sign-in dropdown, account menu:
- `frontend/app.js`
- `frontend/style.css`
- Gift-link premium popup customization (`gift=1`, `giftTitle`, `giftMessage`, `giftFrom`, button labels) is in `frontend/app.js`.
- One-time gift-token redeem flow (`giftToken`, preview/claim integration) is in `frontend/app.js` + `backend/server.js`.

2. Login/signup/reset/delete API behavior:
- `backend/server.js`

3. Progress, XP, streak, quests, badges:
- `backend/server.js`
- `frontend/app.js`

4. Words/Phrases/Grammar map cards and filters:
- `frontend/maps/app-maps.js`
- `frontend/maps/style-maps.css`

5. Translation loading and map title/section translation:
- `frontend/app.js`
- `frontend/maps/app-maps.js`
- `frontend/maps/translations.json`
- `frontend/worlds/<world-key>/translations.json`

6. Audio (sound toggle / card pronunciation):
- `frontend/app.js`

7. Billing and premium state:
- `backend/server.js`
- `scripts/billing-*.js`

8. SEO/crawling/legal:
- `frontend/robots.txt`
- `frontend/sitemap.xml`
- `frontend/privacy.html`
- `frontend/terms.html`
- `frontend/license.html`

9. Test users, QA account roles, and usage:
- `docs/TEST_USERS_REGISTRY.md`

10. Third-party services and who manages what:
- `docs/THIRD_PARTY_SERVICES_MAP.md`

## Fast decision rules

1. If it is visual only, start with CSS.
2. If it is interaction but no server data, start with frontend JS.
3. If it changes auth/progress/billing data or contracts, edit backend first.
4. If endpoint contract changes, run contract checks before merge.

## Minimum checks before commit

```bash
npm run check:syntax
npm run smoke
```

For merge/deploy readiness:

```bash
npm run quality
```
