# Frontend Runtime Notes

This file tracks important runtime decisions and guardrails for `frontend/app.js` and `frontend/maps/app-maps.js`.

## Navigation Prefetch

1. Background route prefetch is intentionally disabled in `frontend/app.js`.
2. Link/document prefetch was causing repeated `503 Service Unavailable` noise on production when many pages were prefetched in bursts.
3. Current flags:
   - `ENABLE_NAVIGATION_PREFETCH = false`
   - `ENABLE_BACKGROUND_ROUTE_PREFETCH = false`
4. If prefetch is re-enabled later, do it behind strict caps + staged rollout.

## Map Loading UX

1. Non-English map pages can render skeleton states while world translation packs hydrate.
2. Skeleton classes are dynamic (generated in JS), so they are allowlisted in `scripts/bloat-allowlist.json`.
3. If map content is unavailable, `app-maps.js` renders a visible fallback message instead of empty sections.

## Section Title Behavior

1. For non-English worlds, Words/Phrases section titles show world-language labels when available.
2. When a base language is selected, meaning translation appears next to section titles in parentheses.
3. English world behavior remains unchanged unless explicitly requested.

## Translation Warmup/Caching

1. World pages warm translation caches for faster entry to Words/Phrases/Grammar maps.
2. Cache keys:
   - Base maps: `cosmicaMapTranslationsCache:v3`
   - World packs: `cosmicaWorldTranslationsCache:v1:<world>`
3. Keep cache formats stable unless coordinated with migration logic.

## Cloudflare Analytics

1. Manual analytics snippet injection was removed from frontend code.
2. Preferred mode is Cloudflare automatic injection (`Web Analytics -> Enable`).
3. Do not run automatic and manual snippet modes simultaneously.

## Safety Checklist For Future Frontend Changes

1. Keep edits minimal and scoped.
2. Run:
   - `npm run check:syntax`
   - `npm run smoke`
   - `npm run quality`
3. For JS/CSS runtime class additions, update `scripts/bloat-allowlist.json` if classes are created dynamically.
4. Bump `app.js` version query string in HTML only when cache invalidation is required.
