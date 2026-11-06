# Cinematic universe interface: source review and change boundary

**Reviewed:** 1 November 2026. This records the source inventory and the UI
boundaries reviewed for the requested cyberpunk universe redesign and the latest
direct-selection correction.
It is not an audit of every authored lesson, a backend security audit, or a
claim about the deployed site. Earlier uncommitted work is preserved.

## What the source establishes

- The frontend has 137 root HTML pages. Of these, 129 belong to the existing
  language experience: world navigation, letters, words, phrases, grammar, and
  language guides/landing pages. These remain outside the redesign.
- Public surrounding screens are the homepage, mathematics preview, privacy,
  terms, license, and offline fallback. The admin security screen and search
  verification document are operational surfaces, not learning destinations.
- The review inventory includes 107 JavaScript files and eight stylesheets
  across frontend/backend/scripts at the inventory checkpoint, including the
  initial auxiliary theme. Generated bundles and content
  files are distinguished from the source that owns behavior.
- [app.js](../frontend/app.js) supplies account/sign-in, premium, gifts,
  installation, cookie notices, feedback, audio, and progress. The account and
  premium interfaces are generated dynamically; they are not separate HTML pages.
- The large shared files remain coupled: app.js is approximately 527 KB and
  style.css 417 KB. A global presentation rewrite would affect language interiors.
  [The domain boundaries](./ARCHITECTURE_BOUNDARIES.md) remain appropriate.

## What must change

| Area | Finding | Change required |
| --- | --- | --- |
| Universe composition | JS destination positions, CSS overrides, duplicate selected-view heights, and repeated phone rules compete for space. | Replace the home layout styles coherently; reserve clear regions for navigation, destinations, subject previews, and scene settings. |
| Visual identity | Muted repeated colors and small introductory copy do not provide the requested cinematic direction. | Near-black surfaces, warm amber light, cold cyan instruments, distinct galaxy forms, stronger typography, angular panels. |
| Navigation | Selection already has routing/history, hover previews, and a renderer transition API. | Keep direct galaxy selection, subject previews, and clear transitions using those contracts. |
| Catalog and search | Working DOM navigation and filtering already exist. | Rebuild presentation while retaining real course URLs, availability labels, language scripts, filter state, and search behavior. |
| Account and overlays | The live account uses `.account-dropdown`; sign-in, premium, gift, and install layers are created by app.js. | Theme their actual classes with explicit surrounding-page scope; preserve positioning, focus, keyboard viewport handling, and API behavior. |
| Mathematics | A standalone browser-local instrument already works. | Match the new visual system while preserving equations, graph/table linkage, prediction feedback, and honest device-local saving. |
| Legal/offline | These use different styling paths. | Add a dedicated scoped theme and preserve legal text, links, and retry behavior. |
| Assets | Focused UI hashes originally cover only homepage and mathematics. | Register the new scoped styles and auxiliary pages in the focused manifest; rebuild the renderer and fingerprinted URLs. |

## What remains intact

The Universe → Galaxy → Star System → Planet hierarchy, nine discovery IDs,
twelve language routes, content/progress IDs, entitlements, authentication,
billing, and account progress remain compatible. Do not modify language HTML,
[learning.css](../frontend/ui/learning.css), map code, or the global shared
stylesheet to achieve this redesign.

No backend, database, curriculum, or 3D-engine replacement is required for the
requested presentation change. SVG supports the galaxy artwork while ordinary
HTML retains essential navigation. A missing renderer must still expose the
complete list. WebGL is not required. Sound remains optional, and motion can be
paused or reduced.

The service worker caches navigation and fetched assets but does not precache a
complete universe bundle. The native wrapper loads the production URL; local
source changes do not establish a deployed/native update.

## Verification and rollback

Use the [isolated real-server preview](../scripts/lib/isolated-preview.js), with
fresh temporary guest data and blocked external traffic. Inspect desktop, tablet,
and phone rendering; exercise route/history/filter/search, keyboard targets,
missing renderer/canvas/storage, optional sound, motion pause, and actual course
entry. Verify mathematics and overlay interactions independently.

Run the focused build and check, asset/isolation contracts, accessibility,
cache/version, unused-selector, and source-budget checks. Retain historical
performance results as historical; record new measurements with their environment.

Rollback is the focused presentation files, associated non-language HTML, and
their generated manifest/bundle/version references. No data migration is involved.
See [current implementation and verification](./UNIVERSE_UI.md) for delivered
facts and remaining limits.
