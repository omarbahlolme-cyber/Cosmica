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
4. Runtime now deduplicates warm calls and skips near-fresh cache rewrites to reduce redundant network bursts.

## Base-Language Rules (2026-02)

1. If user selects no base language, no base-language translation text should render across world maps and map pages.
2. Sentinel values are treated as empty (no base language):
   - `none`, `no-base`, `nobase`, `skip`, `null`, `undefined`
3. Frontend normalization is centralized and reused in:
   - world map title bilingual text,
   - letters helper/title translation,
   - words/phrases/grammar translation surfaces.
4. On world-page leave (`pagehide`, `beforeunload`, hidden visibility), selected language state is committed and map translation visibility is refreshed immediately.

## Runtime Performance Guardrails (2026-02)

1. Scroll-driven top-state updates on Words/Phrases/Grammar maps are RAF-deduplicated to avoid callback backlog under fast scroll.
2. Resize-driven scrollbar width updates are RAF-throttled to avoid repeated layout writes.
3. Safe non-visual media hints are applied at idle time:
   - images default to `decoding="async"` when unset,
   - below-the-fold images/iframes default to `loading="lazy"` when unset,
   - below-the-fold image fetch priority is lowered when unset.
4. These updates are performance-only and must not alter layout/visual design.

## Premium Success Modal (2026-02)

1. Stripe success redirect trigger is query param `premium=success`.
2. Temporary QA trigger URL:
   - `/index.html?premium=test`
3. Cancel notice trigger is query param `premium=cancel`.
4. The frontend consumes these params, shows the corresponding UI, then cleans the URL via `history.replaceState`.

## Premium Gift Link Flow (2026-02)

1. Gift links are URL-driven and start with `?gift=1`.
2. Supported optional params:
   - `giftTitle`
   - `giftMessage`
   - `giftFrom`
   - `giftOpenText`
   - `giftCheckText`
   - `giftLaterText`
3. Runtime parsing lives in `setupAccountHub()` in `frontend/app.js`:
   - params are sanitized/capped,
   - modal state is staged,
   - URL params are removed via `history.replaceState`.
4. Guest behavior:
   - when a gift link is opened while logged out, auth panel auto-opens first,
   - after login/signup, gift flow resumes.
5. Activation behavior:
   - gift UI does not grant premium by itself,
   - premium must already be granted (Stripe/admin),
   - `Check activation` re-fetches auth/user state and opens premium success modal when active.
6. Programmatic entry point:
   - `window.cosmicaAccountHub.openGift({...})` for opening a custom gift modal without URL params.

## Mimi Speech Bubble Follow (2026-02)

1. When a user sends a Mimi chat message, the page reveals the speech bubble area automatically so users can see Mimi's response start immediately.
2. While Mimi types and the speech bubble grows vertically, the viewport follow logic keeps the bubble visible.
3. Auto-follow is intentionally cancellable:
   - wheel/touch scroll or scroll keys cancel follow for that reply cycle,
   - users can scroll away freely (no scroll locking).
4. Follow behavior is routed through `speakLine(..., { followBubble: true })` in `frontend/app.js` and should stay scoped to live Mimi replies only.

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
