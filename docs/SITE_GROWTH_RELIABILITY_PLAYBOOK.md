# Cosmica Growth, Reliability, Brand, and Go-To-Market Playbook

## 1) Core Positioning

Primary position: "Structured multilingual learning worlds with clear map-based progression and expert-reviewed pedagogy."

Messaging pillars:
1. Clarity: simple progression and visible learning path.
2. Accuracy: expert-reviewed language content.
3. Continuity: progress that persists and supports daily learning habits.
4. Trust: transparent privacy, billing, and account behavior.

## 2) Product Reliability Baseline (Must-Have)

1. Zero-regression release gate:
- Run before deploy: `npm run quality`
- Run pre-release smoke: `npm run verify:pc-mobile`

2. Operational safety:
- Keep `AUTH_STORE_BACKEND=postgres` in production.
- Keep admin token secret and rotate if exposure is suspected.
- Maintain alerting webhooks for auth/security events.

3. UX reliability:
- Ensure login/signup/reset flows behave consistently on desktop and mobile.
- Keep locked/under-review maps explicit to avoid learner confusion.

## 3) SEO and Discoverability

1. Keep canonical + sitemap + robots consistent.
2. Re-run and submit sitemap after meaningful URL/indexability changes.
3. Keep metadata concise and language-appropriate per page.
4. Treat premium-gated content with index strategy intentionally (teaser/indexable pages vs full gated content).

## 4) Brand and Design System

1. Define one visual system document:
- typography tokens,
- color tokens,
- spacing and motion principles,
- button states and premium states.

2. Build consistency rules:
- one CTA hierarchy,
- one premium upsell style system,
- one alert style system (success/info/warning/error).

3. Portfolio readiness:
- before/after pedagogy remediation snapshots,
- UX case studies,
- measured KPI deltas (retention, completion, conversion).

## 5) Growth Loops (Practical)

1. Content loop:
- Publish world-specific micro-lessons and correction reels.
- Link each post to one clear map entry point.

2. Referral loop:
- Gift premium campaigns (token-based redeem flow).
- Shareable achievement moments.

3. Partnership loop:
- University validation + educator testimonials.
- Language communities and school pilots.

## 6) Sales and Monetization

1. Offer tiers:
- Free plan: meaningful value (letters/words/phrases + selected previews).
- Premium plan: interactive grammar explanations, tracked practice, advanced guidance, and continuity.

2. Checkout quality:
- clear success/cancel return paths,
- clear entitlement update feedback,
- clear account-state confirmation post-purchase.

3. Trust conversion:
- transparent pricing,
- simple cancellation,
- visible legal and privacy links.

## 7) 90-Day Execution Plan

1. Days 1-30:
- stabilize pedagogy review workflow,
- lock high-risk grammar maps until corrected,
- finish professor review packet cycles.

2. Days 31-60:
- relaunch corrected worlds in batches,
- publish correction transparency notes,
- run acquisition experiments by channel.

3. Days 61-90:
- partner outreach to universities,
- improve conversion surfaces with tested messaging,
- finalize one public evidence-based quality report.

## 8) KPI Dashboard (Track Weekly)

1. Activation: signup-to-first-map rate.
2. Learning: 7-day retention and section completion rate.
3. Quality: reported content issue rate per 1,000 sessions.
4. Revenue: free-to-premium conversion and premium retention.
5. Reliability: auth errors, payment errors, and page speed stability.

## 9) Risk Controls

1. Do not ship broad content rewrites without staged review.
2. Keep feature flags/locks for unstable pedagogy segments.
3. Keep rollback and backup workflows tested (`npm run backup:create`, `npm run backup:verify`).
