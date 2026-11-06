# UI consistency review

**Date:** 7 November 2026. Local website review, using isolated synthetic browser
state and blocked external requests. This is not a production audit.

## Delivered improvements

- Account forms have dialog semantics, a visible 44px close button, and matching
  trigger semantics. Closing returns keyboard focus to the account button.
- The automatic account promotion no longer covers navigation. Account error and
  success notifications remain available. The login action now says **Log in**.
- Compact language headers separate the brand, sound control, and account button.
  These are shared navigation changes; lesson content and activity layouts remain
  intact.
- Dialog close buttons and footer actions have at least 44px touch targets. The
  homepage skip link keeps dark text on its light background when focused.
- Delayed dialog-close events no longer steal focus from a control the visitor
  has just selected. Search/filter keyboard input keeps its intended destination.
- Feedback fields retain visible labels, required states, and name/email
  autocomplete. Custom validation names the missing or invalid field, exposes its
  invalid state and message to assistive technology, and focuses it. Editing one
  field does not immediately mark untouched fields as invalid.
- The mathematics studio opens with **Linear functions**, a concrete explanation
  of its controls, and **Save on this device**. Browser-local saving and its limits
  are unchanged.

The review changes preserve galaxy renderer/artwork, positions, subject routes,
all twelve language destinations, learning content, entitlements, and stored progress.
No installation prompts, manifests, native wrappers, or app-version UI were added.
Shared asset fingerprints were synchronized, and focused UI assets were rebuilt.

## Review scope

The responsive inspection covered 320, 390, 768, and 1440px widths on nine routes:
the universe, Languages catalog, English course, English letters, Arabic course,
French vocabulary, mathematics studio, privacy page, and offline page. These 36
route/viewport combinations had no horizontal overflow. Representative desktop
and phone screenshots were inspected.

Focused interaction checks exercised account dismissal and focus restoration,
invalid feedback without sending it, and mathematics prediction plus browser-local
save/reload. These checks did not create accounts or send messages to a service.

The browser suite includes regression checks for visible account dismissal,
dialog semantics, keyboard focus, feedback labels/errors, compact navigation,
skip-link contrast, and footer touch targets.

## Verification results

- Chromium homepage suite: **16 passed**. WebKit homepage/fallback suite:
  **7 passed**. Asset/isolation contracts: **15 passed**.
- Final focused checks passed for build provenance, asset fingerprints/cache
  policy, changed JavaScript syntax, source budgets, and bloat. The accessibility
  baseline passed across 135 pages. No baselines or selector exceptions were
  expanded.
- The final isolated responsive/interaction check passed all 36 route/viewport
  combinations, account dismissal/focus, invalid feedback, and mathematics
  prediction plus browser-local save/reload, without browser exceptions.
- A Windows/headless Chromium 148 sample before concurrent homepage navigation
  edits, at 1440 by 1000 over loopback, with
  external requests blocked, recorded DOMContentLoaded 462.7ms, galaxy selection
  587ms, filter-to-next-frame 11.6ms, median/p95 frame intervals 16.7/16.8ms,
  and about 60.9 scene updates/s. Heap changed from 4.76 to 4.82 MB over five
  navigation rounds without forced GC. Other checks ran concurrently, and these
  figures are local diagnostics rather than performance guarantees.

## Limits

This is a representative UI review, not an exhaustive audit of every lesson,
account state, browser, screen reader, or physical device. Course activity layouts
were inspected but not redesigned. Authentication, billing, and provider behavior
were not changed or verified against external services. Local browser timing and
heap measurements do not establish public-network performance or memory safety.
