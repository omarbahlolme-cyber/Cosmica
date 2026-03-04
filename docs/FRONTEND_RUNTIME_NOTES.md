# Frontend Runtime Notes

This file tracks important runtime decisions and guardrails for `frontend/app.js` and `frontend/maps/app-maps.js`.

## Navigation Prefetch

1. General navigation prefetch is intentionally disabled in `frontend/app.js`.
2. Broad link/document prefetch previously caused noisy production bursts when many pages were warmed at once.
3. Current flags:
   - `ENABLE_NAVIGATION_PREFETCH = false`
   - `ENABLE_BACKGROUND_ROUTE_PREFETCH = false`
4. World-page map warming is still allowed on capable devices:
   - world pages warm likely next map documents
   - after base-language selection, map documents are also background-fetched directly to improve map-entry speed
5. If broader prefetch is re-enabled later, keep it behind strict caps + staged rollout.

## Map Loading UX

1. Map pages now ship pre-rendered lesson sections in the HTML source.
2. Those pre-rendered sections are the initial UI and should stay visible while runtime translation/data hydration catches up.
3. Skeleton states are now a fallback path, not the preferred first paint, and should only appear when no usable pre-rendered sections are present.
4. Skeleton classes are dynamic (generated in JS), so they are allowlisted in `scripts/bloat-allowlist.json`.
5. If map content is genuinely unavailable, `app-maps.js` renders a visible fallback message instead of empty sections.

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
5. Base-language selection should prefer immediate UI refresh first, then let translation/network hydration enhance already-visible content.

## Base-Language Rules (2026-02)

1. If user selects no base language, no base-language translation text should render across world maps and map pages.
2. Sentinel values are treated as empty (no base language):
   - `none`, `no-base`, `nobase`, `skip`, `null`, `undefined`
3. Frontend normalization is centralized and reused in:
   - world map title bilingual text,
   - letters helper/title translation,
   - words/phrases/grammar translation surfaces.
4. On world-page leave (`pagehide`, `beforeunload`, hidden visibility), selected language state is committed and map translation visibility is refreshed immediately.
5. The selected base language is session-like for the world flow and is cleared when returning to the homepage.

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

1. Recommended live flow uses one-time token links:
   - `/gift/redeem?token=...` (server redirects to homepage runtime with `giftToken` query).
2. Frontend token runtime:
   - reads/stages `giftToken`,
   - stores pending token in `sessionStorage` to survive auth redirects (including Google OAuth),
   - loads preview via `GET /api/gifts/redeem/preview`,
   - clears URL query after consume.
3. Guest behavior:
   - auth panel auto-opens for logged-out users,
   - after login/signup, frontend auto-claims via `POST /api/gifts/redeem/claim`.
4. Claim behavior:
   - valid + unused token activates premium and opens premium success modal,
   - used/expired/revoked/mismatch states surface user-facing warning feedback and stop auto-claim loops.
5. Legacy/manual UI mode still supported:
   - `?gift=1&giftTitle=...&giftMessage=...` for custom popup copy.
6. Programmatic entry point:
   - `window.cosmicaAccountHub.openGift({...})` opens custom gift modal without URL params.

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
5. If runtime warmup/loading behavior changes, also update this file so it stays aligned with the current map-entry path.
