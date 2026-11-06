# Cosmica project instructions

## Read before working

- Read [the product vision](docs/COSMICA_VISION.md) before major design,
  educational, content-model, or architectural work. Read
  [the actual architecture](docs/ARCHITECTURE.md) and
  [the roadmap](docs/ROADMAP.md) before choosing implementation scope.
- Inspect the current source and working tree. Preserve unrelated edits. Documents
  describe intent or a dated inspection; source and relevant checks establish what
  actually works. Never present planned systems as implemented.
- The vision is the canonical product direction. Historical brainstorms are
  context, especially where they recommend points, streaks, unlocks, or excess UI.
  Follow the user's latest instructions when they change the direction or scope.

## Product and teaching

- Model **Universe → Galaxy → Star System → Planet**; laboratories provide
  practical work, and constellations connect disciplines. The four learning modes
  are **Explore, Learn, Laboratory, Research**, sharing relevant state.
- Preserve all 12 existing language worlds, their content, stable URLs, identifiers,
  functionality, entitlements, and user progress. Treat “world” as a legacy course
  label during the terminology migration; changing the metaphor must not erase data.
- Teach accurately: explicit outcomes, prerequisites, first-principles explanations,
  useful representations, meaningful interaction, diagnostic feedback, independent
  application, and delayed revision. Completion, XP, and confidence are not mastery.
- Give subjects appropriate tools and navigation. Learning activities must aid
  understanding, investigation, or creation. Restrained expressive interactions
  can add warmth; avoid decorative learning tasks and new default gamification.

## Design and performance

- Latest visual direction, 6 November 2026: use the existing language UI universally
  for borders, buttons, bars, headers, footers, and shared panels: dark surfaces,
  muted violet accents, and rounded controls. Preserve the language interiors.
  Keep the cinematic galaxies, original lighting, artwork, positions, animation,
  and direct selection unchanged. This supersedes the separate cyberpunk chrome.
- The homepage opens into a full universe of visible, distinct animated 2D galaxies.
  Each galaxy's star clusters form a recognizable subject symbol, surrounded by
  galactic dust and scattered stars. Keep the symbols readable and equally sized.
  Use a full-bleed space background with layered stars and subtle nebula clouds;
  background effects must keep subject symbols and labels clear.
  Galaxies are the primary navigation, with search and a complete list as alternatives.
  Reveal a galaxy's subject catalog after selection; do not reduce space to a small
  illustration beside a dashboard. Keep labels clear and hover targets stable.
  Do not show a separate galaxy text panel on hover.
  Beneath galaxy names, keep only the View subjects action; omit course counts and
  availability labels from the map.
  Subject search keeps only All and lists every subject, including unavailable
  subjects; do not include galaxy categories as search results.
- Keep the homepage header to the home logo, Search, and account access. Do not
  restore Saved, Recently opened, duplicate header galaxy actions, or the old search
  prompt. Phone navigation has Galaxies and Search; selected galaxies have one switcher.
- Preserve usability: readable type, keyboard and screen-reader access, touch targets,
  responsive layouts, reduced motion, optional sound, adaptive graphics, and a useful
  route to learning without WebGL. Keep essential navigation outside the renderer.
- Measure loading, input latency, frame time, and memory on stated devices and
  networks. Do not “fix” failures by weakening tests, refreshing baselines blindly,
  or expanding unused-selector exceptions without evidence.

## Engineering and data

- Cosmica is website-only. Do not restore installation prompts, PWA manifests,
  native wrappers, store distribution, or app-version reporting. Preserve website
  asset fingerprints and package/dependency versions. The old service-worker URL
  exists only to retire previous registrations without deleting visitor work.

- Prefer small, explicit domain modules over enlarging shared runtime files. Consult
  [the extraction boundaries](docs/ARCHITECTURE_BOUNDARIES.md). Architecture changes
  must have a concrete benefit and a migration/rollback plan; avoid premature platforms.
- Keep authentication, authorization, entitlements, account progress, and shared or
  account-owned durable records server-authoritative. Label browser-local guest work
  honestly. Validate inputs and ownership. Never execute untrusted learner code in the
  application server or describe a client-only check as a security boundary.
- Preserve stable content/progress IDs. Make schema changes versioned, recoverable,
  and tested against representative fixtures. Use isolated test stores; verify test
  scripts cannot target real accounts or production databases before running them.
- Never expose credentials, personal data, recovery codes, tokens, or private stores
  in output, documentation, fixtures, or client assets. Use `.env.example` for config
  discovery. Do not modify production data or external services without authorization.
- AI tutoring must be grounded in reviewed material, with traceable sources and
  honest limits. Scientific tools need stated assumptions, units, validation cases,
  and reproducible configurations. Mock endpoints are not a working backend.

## Delivery and verification

- Current redesign scope is UI only outside language course interiors: use existing
  subjects and course links to demonstrate navigation; preserve existing tools and
  defer new subject content, curricula, and learning tools.
- Future subjects need ordered topic paths from basics to advanced application,
  with prerequisites and clear next steps. Do not substitute random topic lists.
  Keep interface copy short and specific; avoid slogans and generic filler.
- Keep public interface copy free of project-development and release-stage wording.
  Outside galaxy menus, omit availability badges, numbered system labels,
  previous/next galaxy controls, and redundant subject instructions. Keep unlinked
  subjects non-interactive. Hide signed-in activity/level metadata on the account
  trigger while retaining details inside its menu. Preserve
  accurate tool limits and browser-local save notices.
- Deliver working changes within the authorized task. For documentation-only work,
  change the requested documents and check their consistency and links; do not use
  that task to rewrite the app, rebuild generated assets, or install dependencies.
- For application work, run relevant checks and inspect the rendered result. Existing
  commands and their limits are listed in [the architecture](docs/ARCHITECTURE.md).
  Check new modules explicitly: the legacy syntax command does not cover all UI code.
- Preserve static SEO, caching, and asset-version contracts. Run `npm run build:universe`
  after spatial/studio source or artwork changes, then `npm run build:universe -- --check`.
  Coordinate shared asset changes with `npm run assets:sync`. Use `verify:universe` for
  its isolated real-server preview; plain `npm start` can load local account data/config.
  Do not run broad generators or
  repository-wide formatting for a small change without reviewing their scope.
- Report what changed, why, what was actually verified, and remaining failures or
  limits. Keep user-facing writing concise and professional; avoid hype and claims
  of scientific, pedagogical, security, or production readiness without evidence.
- Update these instructions and the linked documents when accepted product or
  architectural decisions change. Keep current facts, proposals, and open decisions
  visibly separate.
