# TODO Map

Central checklist for whole-site priorities.

## Priority Model

- `P0`: Production safety, user trust, revenue, or data-risk work.
- `P1`: High-impact growth, UX clarity, and performance work.
- `P2`: Strategic improvements and long-term expansion.

## P0 - Reliability, Security, Accounts, Billing

- [ ] Keep `npm run test:user-matrix` green before deploys.
- [ ] Keep `npm run check:syntax` and `npm run smoke` green before deploys.
- [ ] Verify account deletion fully wipes progress, streaks, achievements, and billing state.
- [ ] Validate cross-device streak logic cannot increment more than once per day.
- [ ] Run `npm run auth:user:lifecycle` for account incident triage cases.
- [ ] Run `npm run billing:user-state:contract` before billing/auth releases.
- [ ] Review Stripe webhook health and premium reconciliation logs weekly.
- [ ] Run `npm run security:audit` and `npm run security:live` on schedule.
- [ ] Confirm backup create/verify jobs are passing (`npm run backup:create`, `npm run backup:verify`).

## P1 - SEO, Indexing, and Discoverability

- [ ] Keep `npm run check:seo`, `npm run check:seo:links`, and `npm run indexing:check` green weekly.
- [ ] Export Google Search Console `Pages + Queries` CSV weekly.
- [ ] Run `npm run seo:phase6 -- --input perf/search-console-page-query.csv`.
- [ ] Apply top CTR improvements in small batches (5-10 pages).
- [ ] Re-measure CTR after 2-4 weeks before next metadata batch.
- [ ] Keep sitemap submission current in Google and Bing after URL/indexability changes.
- [ ] Expand high-intent pages only where query demand is proven by Search Console data.

## P1 - Product UX and Learning Flow

- [ ] Review onboarding friction for guest users (entry to world, map click, auth prompt timing).
- [ ] Validate map clarity for beginner and advanced users in each world.
- [ ] Ensure base-language selection behavior is consistent across maps and resets correctly when returning home.
- [ ] Keep premium/free/guest gating clear and predictable in UI copy.
- [ ] Remove or simplify any section that adds reading load without learning value.

## P1 - Mobile App Store Rollout (Capacitor)

- [ ] Run `npm run native:check` and fix any blocking mismatch (appId, bundle IDs, versions).
- [ ] Keep `com.cosmicalearn.app` aligned across `capacitor.config.json`, Android, and iOS.
- [ ] Set production app versions:
- [ ] Android `versionCode` + `versionName`.
- [ ] iOS `MARKETING_VERSION` + `CURRENT_PROJECT_VERSION`.
- [ ] Run `npm run native:sync` before every Android/iOS build.
- [ ] Build signed Android `AAB` in Android Studio and upload to Play Console Internal Testing.
- [ ] Complete Play Console metadata: description, screenshots, icon, privacy policy URL, support URL, content rating, data safety.
- [ ] Validate Android internal test flows on real devices: login/signup, world/map loading, audio playback, install/open behavior, premium state restore.
- [ ] Use macOS + Xcode for iOS build, signing, archive, and TestFlight upload.
- [ ] Complete App Store Connect metadata: screenshots, app privacy, age rating, support URL, terms/privacy links.
- [ ] Validate iOS TestFlight flows on real iPhone/iPad: login/signup, world/map loading, audio playback, install/open behavior, premium state restore.
- [ ] Decide native premium billing strategy before public release:
- [ ] Keep purchase web-only in native runtime (current safe fallback), or
- [ ] Implement Apple IAP + Google Play Billing for in-app premium purchase.
- [ ] After listings are live, set real store links in `frontend/index.html` (`window.COSMICA_STORE_LINKS.appStoreUrl` and `.playStoreUrl`).
- [ ] Re-run `npm run smoke` and `npm run native:check` before each store submission.

## P1 - Performance and Runtime Health

- [ ] Keep `npm run perf:check` passing after every SEO/content batch.
- [ ] Track map hydration time after base-language selection and reduce spikes.
- [ ] Keep JS-rendered map payloads under bloat thresholds (`npm run check:bloat`).
- [ ] Ensure static pre-render fallback path remains healthy (`npm run check:map-prerender`).
- [ ] Keep asset versioning/caching checks green (`npm run check:assets`, `npm run check:html-cache`).

## P1 - Content Quality and Localization

- [ ] Keep grammar gates green:
- [ ] `npm run check:grammar:zero`
- [ ] `npm run check:grammar:peer`
- [ ] `npm run check:grammar:lock`
- [ ] Run `npm run check:worlds:deep` after translation/content edits.
- [ ] Run `npm run check:intents` when phrase/intent content changes.
- [ ] Keep world map titles, section labels, and preview examples consistent across base-language rendering.
- [ ] Remove duplicated examples and off-topic copy during language updates.

## P2 - Authority, Growth, and Expansion

- [ ] Build backlinks from relevant language-learning communities and directories.
- [ ] Publish periodic content updates to improve freshness signals.
- [ ] Expand partnership/outreach pages and citation links for brand authority.
- [ ] Add monthly keyword cluster reviews by world/language intent.
- [ ] Evaluate new language launches only after quality and indexing readiness checks.

## P2 - Documentation and Operations

- [ ] Keep runbooks aligned with current architecture (`docs/OPERATIONS_HARDENING.md`, `docs/HANDOFF_ZERO_TO_HERO.md`).
- [ ] Update README commands when scripts are added/renamed.
- [ ] Keep incident playbooks current for auth, billing, SEO, and rollback flows.

## Recurring Cadence

- [ ] Weekly: SEO checks, indexing checks, security live checks, Search Console export.
- [ ] Bi-weekly: CTR metadata batch + result review.
- [ ] Monthly: auth/billing lifecycle audit, backup restore drill, performance baseline review.
- [ ] Every release: run release checklist below.

## Release Checklist

- [ ] `npm run check:syntax`
- [ ] `npm run smoke`
- [ ] `npm run check:seo`
- [ ] `npm run check:seo:links`
- [ ] `npm run indexing:check`
- [ ] `npm run check:bloat`
- [ ] `npm run perf:check`
- [ ] `npm run billing:user-state:contract`
- [ ] `node scripts/e2e-user-matrix.js`

## Notes

- Keep tasks concrete and verifiable.
- Move completed high-impact work to changelog/release notes.
