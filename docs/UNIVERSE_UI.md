# Cosmica homepage interface

**Latest cleanup, 7 November 2026:** all galaxy catalogs omit the subject
instruction, previous/next controls, availability checkbox and card badges,
numbered galaxy headings, and generated SYSTEM labels. Unlinked subjects remain
visible without invented destinations. Availability information remains inside
the galaxy menu. Signed-in activity/level metadata is hidden on the account
trigger; account-menu details remain. Older verification descriptions below refer
to the controls that existed at the time.

**Current local implementation, 6 November 2026:** shared borders, buttons, bars,
headers, footers, and panels use the existing language UI's dark surfaces, muted
violet accents, and rounded controls. The scoped
[language chrome](../frontend/ui/language-chrome.css) applies this styling to the
homepage, account surfaces, mathematics studio, and legal/offline pages. Language
interiors and the galaxy source, artwork, positions, lighting, animation, and map
controls remain unchanged. This supersedes the earlier separate amber/cyan chrome.
The universe remains the opening navigation; subject catalogs appear after
galaxy selection, with search and a complete list as alternatives. Names stay clear,
hover targets stay fixed, and essential controls remain outside the renderer.
The scope is UI only: existing subjects, routes, and tools demonstrate navigation;
no new lessons, curricula, or learning tools are created. The redesign retains
keyboard/touch access, reduced motion, optional sound, and operation without WebGL.
The [source review](./UI_REDESIGN_AUDIT.md) records the codebase inventory, overlap
causes, scope, and rollback boundary. Verification of the direct-selection
correction is recorded separately below the dated previous-design results.
This is a local implementation,
not a deployment claim.
Later subject pages will need ordered topics from beginner foundations to advanced
work, with prerequisites and clear next steps. That structure is recorded in the
[vision](./COSMICA_VISION.md) and [roadmap](./ROADMAP.md), not populated with invented
content in this UI release. Interface copy uses short, specific labels and instructions.

**Interface wording, 6 November 2026:** public catalog, search, About, metadata,
and mathematics labels no longer describe project progress or release stages.
Subjects without course links say **Unavailable**; the interactive tool is called
the mathematics studio. Its browser-local saving notice remains. Account and
install messages outside language pages use plain availability and action wording;
language pages retain their existing messages. Shared cache versions were synced.
The Chromium universe suite passed all 17 cases. A final rendered copy check also
passed all nine galaxies at desktop and phone widths, search, the studio, and
scoped service-error wording, including preservation of original error payloads.

Galaxy artwork previews with the previous chrome: [desktop galaxies](./design/cosmica-direct-galaxies-desktop.png)
and [phone galaxies](./design/cosmica-direct-galaxies-mobile.png).
[Subject symbol close-ups](./design/cosmica-subject-star-clusters.png) show the nine
particle designs at a larger inspection size.

Previous-design rendered previews: [desktop map](./design/cosmica-galaxy-home-desktop.png),
[phone map](./design/cosmica-galaxy-home-mobile.png), and
[galaxy switcher](./design/cosmica-galaxy-switcher.png). These are screenshots of
the isolated local app after the 1 November cleanup, not design mockups.
The [previous-design walkthrough](./design/cosmica-galaxy-home-walkthrough.webm) shows
motion, hover previews, galaxy switching, subject filtering, and global search.

The canonical domain model remains Universe → Galaxy → Star System → Planet.
The nine existing discovery category IDs are compatibility metadata, not the final
discipline taxonomy or an implemented knowledge graph. Existing language courses
retain their twelve public routes, progress identities, access, and content.

## Layout and interaction

- The header contains the home logo, Search, and account access. The logo returns
  to the map. The duplicate galaxy navigation, Saved, Recently opened, and the
  search prompt were removed at the user's request. This UI no longer records
  saved or recent courses; existing browser records are left untouched.
- The opening view shows all nine galaxy destinations. A complete list opens as a
  drawer instead of occupying a permanent sidebar. Phones keep two actions:
  Galaxies and Search. History retains filters, availability, and position.
- Selecting a galaxy reveals its subject catalog. Languages retains twelve courses;
  Science retains the mathematics studio. Other subjects are marked
  Unavailable and have no invented course link. Overview has no course grid.
- The subject filter, Available now checkbox, plain breadcrumbs, and category heading
  keep the catalog understandable as it grows. Native scripts retain language and
  direction metadata. The catalog remains available while the scene animates.
- Hover and keyboard focus preview category/subject artwork. They do not select a
  category, change the route, or move a clickable target. Touch uses ordinary taps.
- Nine labeled HTML galaxy controls contain subject symbols formed from star
  clusters: translation bubbles, an atom, code brackets, a gear, an open book,
  a heart/pulse, a globe, a growth chart, and an artist's palette. All nine use the same
  responsive artwork size; Languages has no enlarged size. Their targets stay
  fixed while the star structures animate. Hover/focus pauses nearby motion; the
  full list and search remain available independently of the scene.
- Symbol contours consist of individual star particles rather than solid icon
  strokes, text, or bitmap overlays. Their foreground remains upright; diffuse
  stars rotate slowly and bright stars shimmer. Reduced motion freezes both.
- The background is a full-bleed deep-space field with three star depths, soft
  irregular nebula clouds, dark dust pockets, and a few bright nearby stars.
  Quiet shading behind the heading preserves contrast. Background motion updates
  at 15 Hz within the scene lifecycle; phone/coarse-pointer rendering starts with
  fewer stars. The previous framing rectangle and diagram lines are removed.
  The vector background is generated locally and cached as a CSS image, while
  nearby stars twinkle in separate non-interactive layers. No external image,
  raster artwork, canvas, or SVG filter is needed.
- The artwork uses distinct amber, cyan, blue, green, and violet destinations,
  luminous cores, uneven star clusters, dust veils, and field-specific structures.
  Direct galaxy selection opens its subject catalog. Short transitions respect
  reduced motion. These are illustrative navigation effects, not an
  astronomical simulation. Hover and focus highlight galaxy artwork without a
  separate text preview panel. Touch selection opens that galaxy's real subject list.
- Inside a galaxy, Switch galaxy opens all nine destinations. Named Previous
  galaxy and Next galaxy controls also move directly through the existing nine
  categories, wrapping at either end and sharing the same route/history state. The
  index supports arrows, Home/End, typeahead, and the G shortcut outside editors.
  Switching away and back restores that galaxy's filters, availability, and scroll
  in this visit; browser Back/Forward uses the corresponding exact history entry.
- The map supports directional arrow keys using the actual desktop or phone
  positions; Home/End focus the first/last destination. Focus previews a galaxy;
  Enter or Space opens its subjects. Hover/focus adds a colored glow,
  brighter artwork, and a View subjects cue without moving or resizing its target.
  Course counts and availability labels are omitted beneath galaxy names; only
  the View subjects cue remains. On devices without hover, this cue stays visible.
- Local and global search share accent-insensitive, multiword, and alias matching.
  The local field names its current category. An empty local result offers global
  search with the same query. Global search keeps only All and lists subjects,
  including unavailable subjects, without category results. It supports clear
  controls and keyboard result navigation.
- Cards use original vector-style planets and animated details. The hero
  uses SVG illustration, not generated images or third-party channel artwork.
- Motion respects the operating-system preference and can be controlled explicitly.
  Sound starts off; optional short tones are synthesized locally. Inactive tabs
  suspend sound and scene updates. Normal page scrolling remains available.
- Browsing state stays within the current visit and browser history. Denied browser
  storage does not prevent galaxy selection, filtering, search, or course entry.

Explore, Learn, Laboratory, and Research remain the product's four learning modes.
This homepage does not add cosmetic tabs or pretend their shared-state backend is
implemented. The mathematics preview and existing language experiences retain their
actual functionality.

## Implementation boundaries

| Responsibility | Source |
| --- | --- |
| Landmarks, header/account hooks, dialogs, no-JavaScript course links | [index.html](../frontend/index.html) |
| Homepage foundations, header, dialogs, inherited-style isolation | [universe.css](../frontend/ui/universe.css) |
| Category sidebar, catalog, vector card artwork, responsive composition | [observatory.css](../frontend/ui/observatory.css) |
| Scene navigation, phone action bar, search scope controls, responsive input targets | [navigation.css](../frontend/ui/navigation.css) |
| Scoped account, sign-in, premium/gift, installation, cookie, and native-dialog presentation | [flight-overlays.css](../frontend/ui/flight-overlays.css) |
| Legal/offline presentation without shared language stylesheet edits | [flight-pages.css](../frontend/ui/flight-pages.css) |
| Mathematics instrument presentation; existing model and device-local saving retained | [maths-lab.css](../frontend/ui/maths-lab.css), [maths-lab.js](../frontend/ui/maths-lab.js) |
| Category registry, safe DOM rendering, selection, search, filters, history, optional audio | [universe.js](../frontend/ui/universe.js) |
| Procedural SVG illustration, hover previews, animation and lifecycle | [cosmic-scene.js](../frontend/ui/cosmic-scene.js) |
| Subject symbol geometry, palettes, deterministic star particles | [subject-star-clusters.js](../frontend/ui/subject-star-clusters.js) |
| Deep-space star layers, nebula/dust clouds, and subtle background motion | [space-backdrop.js](../frontend/ui/space-backdrop.js) |
| Deterministic renderer bundle and focused asset/page versions | [build-universe.js](../scripts/build-universe.js), [asset contract](../scripts/lib/universe-assets.js) |
| Real Express preview with fresh synthetic guest stores | [isolated-preview.js](../scripts/lib/isolated-preview.js) |
| Current browser journeys | [verify-universe-ui.js](../scripts/verify-universe-ui.js) |

The shared app runtime still supplies account, billing, course audio, Mimi chat,
and feedback. Installation behavior was removed on 6 November 2026; the site is
website-only. Scoped home styles isolate the new header from legacy fixed-position
rules. Saved controls, dialogs,
and card actions have been removed across desktop and phone layouts.

The focused asset manifest hashes nine scripts/styles, including the built SVG
renderer and the scoped overlay/auxiliary themes. Six public pages receive sixteen
versioned references. Historical bitmap artwork stays in the repository but is no longer
loaded by the homepage or included in its scene build contract. The scene bundle
requires esbuild at build time; it no longer bundles Three.js. No dependency install
or shared-asset synchronization is required when shared runtime assets are unchanged.

`window.cosmicaUniverse.getState()` exposes category, menu, renderer (`svg` or
`fallback`), motion, and relevant galaxy-scene diagnostics. The historical `view` values
`map`/`list` remain diagnostic compatibility fields; the subject catalog is shown
after galaxy selection. Legacy hashes such as `#galaxy-languages` remain valid. Native dialogs
contain focus, support Escape, and restore their opener. `/` and Ctrl/Cmd+K open search.

## Verification

Use the isolated preview; plain `npm start` may read local application configuration
and account data. The preview strips provider/database configuration, starts a fresh
owned loopback process, uses synthetic storage, and blocks external browser traffic.

```powershell
npm run build:universe
npm run build:universe -- --check
npm run check:universe-assets
npm run test:universe:contracts
npm run verify:universe
npm run verify:universe -- --browser=firefox --fallback-only
npm run verify:universe -- --browser=webkit --fallback-only
npm run verify:universe -- --browser=webkit --fallback-only --homepage-only
```

`verify:atlas` now aliases the current homepage verifier. The old
[atlas verification source](../scripts/verify-atlas-ui.js) is retained as historical
reference; its fullscreen travel and texture assertions do not describe this UI.
`--homepage-only` explicitly excludes existing course-interaction and mathematics
model checks. It does not change the default verifier's broader coverage.

The current verifier covers real course/asset/cache/auth routes, no-JavaScript
language links, the unchanged mathematics model, desktop/tablet/mobile layout,
keyboard selection, hover stability, filters, availability, search/dialog focus,
browser history, removed-control checks, denied browser storage, missing renderer bundle, and
operation with canvas contexts unavailable. Animation checks inspect real frame
updates and pause/resume behavior. Reports include loopback timings and local
browser frame/heap samples; they do not certify real-device or global performance.

Reports and screenshots are retained only in the owned temporary output directory
printed by the command. Historical 25 October runtime investigation remains in the
[runtime checkpoint](./RUNTIME_CHECKPOINT.md); it is not silently resumed by this
homepage redesign. Backend durability, broader security review, editorial workflow,
account-synced projects, and the knowledge graph remain separate roadmap work.

### Previous-design observed results — 1 November 2026

- Chromium: all 14 homepage cases passed with unchanged source hashes, including
  320, 390, 768, and 1440px layouts, all nine galaxies, removed controls, search,
  fixed hover/focus targets, keyboard switching, per-galaxy browsing restoration,
  history, denied storage, missing scene bundle, and real course entry. Motion
  checks exercised actual animation frames and pause/resume behavior.
- WebKit: all six homepage fallback cases passed with unchanged source hashes.
  This explicit subset does not include legacy course interactions or the
  mathematics model. Firefox was not rerun; its earlier limit remains below.
- All 13 asset/isolation contracts, focused build/check, asset integrity,
  accessibility baseline, shared versions, source budgets, bloat, internal SEO
  links, and local document links passed. HTML cache assertions used fresh
  synthetic stores through the isolated preview rather than the older helper
  that copies existing local account files.
- Desktop, tablet, and phone renders were inspected. The recorded walkthrough
  exercised default motion, hover previews, entry, switching, filtering, and
  search without page errors. No new subject content or account data was created.

Two initial broader Chromium runs stopped in the existing English course test:
the verifier attempted a second optional click while the cookie notice was fading
out and being removed. The course runtime removes that notice after 200ms. The
verifier now waits for actual detachment after its first dismissal; its second
optional check, course assertions, and timeouts are unchanged. This is a test
lifecycle correction, not a change to the course runtime or paused investigation.
The final default Chromium run then passed all 16 cases, including the existing
course and mathematics journeys, with no drift in the nine checked source/build
and verifier files. No application code changed during that run.

Final local Chromium 148 diagnostics used a 1440×1000 headless Windows viewport,
loopback HTTP, and blocked external requests: DOMContentLoaded 260ms, category
selection 530ms, filter event to next frame 10.3ms, median/p95 frame intervals
16.7/16.7ms, and approximately 61.7 SVG updates/s. Heap samples changed from
5.05MB to 5.79MB over five navigation rounds without forced GC. These observations
do not establish real-device, slow-network, production, or memory-leak performance.
Manual screen-reader testing remains outside this verification.

### Observed results — 30 October 2026

- Chromium 148.0.7778.96: all 15 current cases passed after the search/copy refinements,
  including 1440, 768, 390, and 320px layouts. Accent-insensitive, multiword, alias,
  and keyboard search checks passed. Rendered desktop/mobile pages were inspected.
- WebKit: all six homepage-only fallback cases passed during integration. A broader
  run failed when an existing English-page account dropdown intercepted its lesson
  link; that course runtime was not changed by this UI task.
- Firefox: category/filter/bookmark/history interactions worked, but the verifier's
  same-page reload of `/#galaxy-languages` stalled. Firefox verification remains
  incomplete; no timeout or expectation was relaxed to claim a pass.
- Focused build/check, public asset integrity, asset/preview isolation contracts,
  accessibility baseline, source budgets, shared cache/version checks, bloat guard,
  internal SEO links, and updated document links passed. The bloat scanner now
  recognizes literal HTML/SVG factory classes; its unused-selector allowlist was
  not expanded. Unused styles were removed.

The final local Chromium sample used a 1440×1000 headless viewport on Windows with
loopback HTTP and external requests blocked: DOMContentLoaded 251.5ms, category
selection 667ms, filter event to next frame 16.2ms, frame median/p95 16.7/16.8ms,
and about 60.6 SVG update frames/s. Heap samples changed from 4.61MB to 4.81MB over
five Science→Languages rounds without forced GC. These are local diagnostics,
not hardware-device, memory-leak, slow-network, or production performance evidence.
Manual screen-reader testing remains outside this verification.

### Interaction refinement — 31 October 2026

The scene now has four labeled category controls with fixed targets. Hover/focus
previews the category and temporarily pauses orbital movement without changing
the user's motion preference. Category changes use short, cancellable transitions.
Phones have persistent Subjects, Search, and Saved controls; the Subjects menu
shows the current category and closes through its opener, close button, Escape,
or backdrop. Local/global search use the same matching rules, clear controls, and
query-preserving fallback. Global scopes distinguish categories from available
courses. Browser Back/Forward restores filters, availability, and scroll.

All 15 updated Chromium cases passed on the same 320–1440px viewport matrix.
All six current WebKit homepage-only fallback cases also passed, including the new
search and history checks; this does not include the unchanged legacy course tests.
The five versioned homepage entry assets were checked against actual served bytes
and immutable cache headers. All 13 asset/isolation contracts passed, along with
build provenance, accessibility baseline, cache versions, source budgets, bloat,
internal SEO links, and local documentation links. Desktop, tablet, and phone
renders were inspected. No teaching content, account records, or backend services
were added or changed by this refinement.

Local Chromium 148 diagnostics at 1440×1000 on Windows/loopback: DOMContentLoaded
578.5ms, category selection 536ms, filter response 18.2ms, median/p95 frame intervals
16.7/16.8ms, and approximately 60 SVG updates/s. Heap samples were 5.42→4.58MB over
five navigation rounds without forced GC. These samples are diagnostics, with the
same device/network and memory-interpretation limits stated above. The earlier
Firefox reload limit and broader WebKit legacy-course failure remain recorded;
this UI work does not resume that separate investigation.

### Galaxy navigation and hover refinement - 1 November 2026

The map now highlights a hovered or keyboard-focused galaxy with a halo, orbit
outline, brighter stars, and a View subjects cue. Arrow keys move focus according
to the rendered layout; Home/End reach the first/last galaxy. Named Previous/Next
buttons switch between galaxies and preserve their existing filters and history.
Non-hover devices keep availability labels visible. Dismissing the cookie notice
also preserves an open fallback index; this was reproduced during verification.

Rendered previews: [desktop hover](./design/cosmica-galaxy-hover-navigation.png)
and [phone galaxy navigation](./design/cosmica-galaxy-navigation-mobile.png).

All 14 Chromium homepage cases and all six WebKit homepage fallback cases passed.
Coverage includes 320, 390, 768, and 1440px widths, stable hover target dimensions,
directional focus, direct galaxy switching, filter/history restoration, denied
storage, missing renderer, and motion controls. A separate Chromium touch-emulation
journey passed single-tap selection, visible availability, previous/next switching,
wraparound, and existing course links. Focused build/check, asset/cache checks,
13 asset/isolation contracts, syntax, accessibility baseline, source budgets, bloat,
and changed documentation links passed. The default legacy course/model suite was
not rerun for this UI change; earlier Firefox and legacy WebKit limits remain above.

Sequential local measurement: Windows, Intel i7-12650H, about 16 GB RAM, headless
Chromium 148.0.7778.96 at 1440 by 1000, loopback HTTP, external requests blocked.
DOMContentLoaded was 269.4ms; category selection 613ms; filter event to next frame
11.9ms; median/p95 frame intervals 16.7/16.7ms; about 62 SVG updates/s. Heap samples
were 5.04 to 4.37 MB across five navigation rounds without forced GC. A preceding
sample with Chromium and WebKit checks running concurrently recorded about 19
updates/s and a frame p95 of 83.3ms; it is not a comparable isolated baseline.
These are local diagnostics, not real-phone, slow-network, production, or
memory-leak evidence. Manual screen-reader testing remains outstanding.

### Direct galaxy selection correction - 1 November 2026

Removed the vehicle artwork, engine effects, animated route/destination layer,
vessel status, launch bar, related UI copy, and scene diagnostics. Galaxy artwork,
hover/focus previews, keyboard/touch selection, direct course links, motion controls,
and the amber/cyan theme remain. The selected-galaxy transition uses its existing
short scale/depth effect. Product guidance now describes direct galaxy selection.

All 15 Chromium homepage cases passed against isolated Express, including 320,
390, 768, and 1440px layouts, missing-renderer and denied-storage paths, hover target
stability, keyboard navigation, filters/history, and motion controls. The verifier
now asserts that removed navigation artwork, controls, and diagnostics stay absent.
Desktop and phone renders were inspected. Focused build/check, asset/cache checks,
13 asset/isolation contracts, changed-module syntax, accessibility baseline, source
budgets, bloat, and local documentation links passed. This correction did not rerun
WebKit, Firefox, the legacy course/model suite, or manual screen-reader testing.

The local Windows/headless Chromium 148 sample at 1440 by 1000 over loopback HTTP
(external requests blocked) recorded DOMContentLoaded 498.1ms, category selection
548ms, filter-to-next-frame 37.6ms, median/p95 frame intervals 50/83.2ms, and about
20 SVG updates/s. Heap samples changed from 3.85 to 5.08 MB over five navigation
rounds without forced GC. Animation performance remains below the 60 FPS target
on this local profile; this removal does not establish a performance improvement
or real-device readiness. Earlier measurements belong to their dated designs.

### Subject symbols formed from stars - 2 November 2026

Each of the nine galaxies now has its own recognizable subject symbol made from
hundreds of individual stars, with diffuse star fields and dust around the symbol.
The foreground stays upright while ambient stars rotate and bright stars shimmer.
Shared responsive sizes, labels, hover previews, course links, and motion controls
remain. The previous central black-hole decoration and generic galaxy silhouettes
have been replaced by this subject-symbol artwork.

The artwork moved into `subject-star-clusters.js`, reducing the scene controller
and keeping geometry and palette changes separate from navigation/lifecycle code.
Its source is now an explicit hashed build input. A regression fixture verifies
that changing this module without rebuilding is detected without rewriting files.

All 15 Chromium homepage cases, six WebKit homepage fallback cases, and 14
asset/isolation contracts passed. Browser coverage checks all nine distinct star
symbols, at least 500 particles per symbol, five batched foreground paths per
cluster, equal image dimensions, keyboard/touch-sized controls, and existing
navigation, filters, history, reduced motion, storage denial, and renderer fallback.
Symbols use neither text nor bitmap overlays. Desktop, tablet, and phone layouts
and the nine-symbol inspection sheet were visually inspected. Focused build/check,
module syntax, asset/cache checks, accessibility baseline, source budgets, bloat,
and changed document links passed. No selector exceptions or baselines were relaxed.

An isolated Windows/headless Chromium 148 sample at 1440 by 1000 over loopback HTTP
with external requests blocked recorded DOMContentLoaded 599.6ms, selection 673ms,
filter-to-next-frame 12.2ms, median/p95 frame intervals 16.7/16.8ms, and about 61 SVG
updates/s. Heap samples changed from 4.36 to 4.29 MB over five navigation rounds
without forced GC. The earlier full-suite sample, taken with other checks running,
recorded about 51 updates/s and a 33.4ms frame p95. These are local diagnostics;
they do not establish real-device, slow-network, memory-leak, or production results.
Manual screen-reader and physical phone testing remain outside this verification.

### Space backdrop and Business symbol polish - 6 November 2026

The homepage now has a full-bleed deep-space backdrop with layered stars, faint
blue/violet nebula clouds, and nearby shimmering glints. A cached, locally generated
SVG background keeps the nebula static; a small HTML star layer handles shimmer.
The background adapts its star count on compact/touch layouts and respects the
existing motion controls. Subject symbols and labels remain in the foreground.
The Business growth arrow now has a clearer rising shaft and balanced arrowhead,
with more clearance above the chart bars. The decorative Sector / Knowledge Atlas
label and its unused styles have been removed.

The backdrop passed all 15 Chromium homepage cases, six WebKit homepage fallback
cases, and 15 asset/isolation contracts. Coverage includes decoded background assets
under the real server's CSP, three star depths, all nine subject symbols, responsive
navigation, reduced motion, denied storage, and renderer fallback. Build/check,
asset/cache checks, module syntax, accessibility baseline, source budgets, and bloat
passed without relaxing baselines or selector exceptions.

After the final arrow/label polish, all 15 Chromium homepage cases passed again.
Desktop, phone, the enlarged Business selection, and the nine-symbol inspection
sheet were visually reviewed and saved. A focused browser check confirmed that
hover keeps the Business target fixed and clicking still selects its catalog.
The final polish also passed focused build/check, module syntax, asset/cache,
accessibility baseline, source-budget, and bloat checks. WebKit and the contract
suite were not repeated for this final geometry and decorative-label change.

The local Windows/headless Chromium 148 sample at 1440 by 1000 over loopback HTTP
with external requests blocked recorded DOMContentLoaded 1116.6ms, selection 729ms,
filter-to-next-frame 44.2ms, median/p95 frame intervals 16.8/66.7ms, and about 33.2
scene updates/s. Heap samples changed from 3.80 to 4.66 MB over five navigation
rounds without forced GC. These measurements precede the final arrow/label polish.
Animation results varied across local samples and do not establish a stable 60 FPS
result. Physical phones, slow networks, manual screen-reader use, and production
performance remain unverified.

### Shared language UI - 6 November 2026

The shared shell now follows the existing language UI through
[language-chrome.css](../frontend/ui/language-chrome.css): dark surfaces, muted
violet accents, rounded controls, and matching header/footer treatments. The
stylesheet covers homepage controls, subject cards, search, account surfaces,
the mathematics studio, and legal/offline pages. Account overlay styling uses the
same palette. Offline has scoped notice layout because it does not load the main
stylesheet. The focused asset manifest versions this stylesheet on all six pages.
No galaxy artwork, scene source, map positions, language interiors, learning
content, account behavior, or progress records were changed by this styling pass.

All 15 Chromium homepage cases and 15 asset/isolation contracts passed. Focused
build/check, asset integrity, shared asset/cache checks, accessibility baseline,
changed JavaScript syntax, and source budgets passed. An isolated browser check at
1440 and 390px compared header, primary button, account trigger, and footer styles
against the English course. Disabling/re-enabling the new stylesheet left all nine
galaxy targets' geometry, fonts, and label colors identical. Search, account panels,
mathematics, and all four legal/offline pages had no horizontal overflow or browser
exceptions. Desktop/phone screenshots were inspected in the isolated OS-temp output.

Historical result from the theme-only pass: the bloat check failed because `service-worker.js` had no
HTML/JavaScript reference. No unused selectors remain from this change, and no
allowlist or baseline was relaxed. This pass does not repair service-worker
registration or verify physical phones, manual screen readers, or production.
The document link check also found existing architecture links to missing
`frontend/app.webmanifest` and `capacitor.config.json`; the new stylesheet links
resolve. Those legacy references were not changed by this UI task.

Subsequent website-only cleanup on 6 November removed those manifest/configuration
references and installation UI. The worker URL now only retires old registrations.
The bloat guard recognizes explicit server file routes; no selector exceptions
were added. Website-only browser tests and the bloat check pass.

The final Windows/headless Chromium 148 loopback sample at 1440 by 1000, with
external requests blocked, recorded DOMContentLoaded 329.9ms, galaxy selection
513ms, filter-to-next-frame 14.7ms, median/p95 frame intervals 16.7/16.8ms, and
about 60.8 scene updates/s. Heap samples changed from 4.70 to 5.67 MB over five
navigation rounds without forced GC. These are local diagnostics, not device,
public-network, or memory-leak guarantees.

## Migration and rollback

The [7 November UI consistency review](./UI_CONSISTENCY_REVIEW.md) records the
subsequent navigation, dialog, feedback, and touch-target improvements. These
shared account/style changes also require matching `app.js`/`style.css` asset
fingerprints when reverting; retain language content and visitor records.

Presentation, the focused build contract, and associated verification change.
No content, account schema, entitlement, or progress migration is introduced.
To roll back the shared language UI alone, remove its six page links and studio
body marker, restore the previous account overlay styling and asset declarations,
and rebuild the focused manifest/page versions together. Galaxy and language
interior files need no rollback for this styling pass.
For rollback, restore the home HTML, scoped styles, controller, scene source, build
helper/contract, and matching generated manifest/bundle as one reviewed change; run
the focused build and checks. Never mix the old renderer with the new controller or
restore stale cache versions independently. Historical artwork remains available.
The subject-star artwork extraction also requires its module, scene import, and
hashed build-input entry to be restored together with the matching artifacts.
The space backdrop similarly requires its module, scene integration, scoped CSS,
and hashed build-input entry to stay aligned with the generated artifacts.
