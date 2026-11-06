# Paused runtime-validation milestone

**Paused by the user:** 25 October 2026. **Resume word:** `huh`.
The user switched to homepage UI work. Preserve the implemented fixes, but do not
continue this browser-triage task until the user resumes it.

## Implemented

- Capability-aware universe/galaxy lists, Back/Escape/history/hash behavior,
  context-loss state/focus recovery, and stable diagnostics in both rendering modes.
- Guarded shared base-language storage with current-page fallback on write failure;
  optional course audio tolerates unavailable/failed engines. Normal readable
  storage remains authoritative after successful writes.
- Focused hashed assets/texture URLs, checked-in manifest, non-writing esbuild
  comparison, production checker, CI gates, and owned isolated Express previews.
- Software graphics use pixel ratio 0.65; hardware profiles and DOM layout are
  unchanged. Renderer diagnostics include framebuffer dimensions/rendered frames.

## Actual verification before pause

- Chromium full suite: **15 cases passed**, including four viewports, real course
  entry, graphics/storage failures, animated travel, and live context loss.
- Contract tests: **13 passed** (asset integrity and preview isolation/lifecycle).
- Syntax, shared/focused asset checks, accessibility baseline, source budgets,
  and bloat checks passed at the recorded revision.
- WebKit's eight functional cases passed, but the verifier hung during shutdown;
  the process was stopped rather than reported as a clean passing run.
- Firefox repeatedly timed out during reload in the full suite. Last diagnostics:
  required document/script/style requests finished 200, pending requests empty,
  but DOMContentLoaded did not arrive. Firefox cleanup also reported
  `Browser.removeBrowserContext: _windows[aWindow.__SSi] is undefined`.
- Nine isolated Firefox reload probes passed. The full-suite issue remains open;
  do not replace reload assertions or mark Firefox green without evidence.

The last complete Chromium report is in the owned temporary output directory
`cosmica-isolated-preview-XU7nSE/output`. It measured a 936×650 framebuffer on a
1440×1000 software-rendered viewport, with 16.7 ms median animation-frame callback
interval. This is not measured render FPS; a real rendered-frame counter was added
after that run and still needs its motion measurement. Hardware FPS is unverified.
The final one-line shared preference compatibility adjustment and any later UI work
also need relevant verification; earlier passes are not a claim about future edits.

## Resume steps

1. Read the latest source and working tree; homepage UI work may have progressed.
   Rebuild focused assets after any spatial/studio changes and run both checkers.
2. Finish browser cleanup in the verifier. Installed Playwright's Windows
   `browserServer.kill()` uses an unbounded synchronous `taskkill`. A separate owned
   WebKit probe confirmed that asynchronous absolute `taskkill.exe /PID <owned PID>
   /T /F` with a five-second timeout terminates its tree promptly. Await confirmed
   child exit/close, retain reports, stop the preview, and surface cleanup errors.
   No `scripts/lib/isolated-browser.js` existed at the pause checkpoint.
3. Resolve Firefox full-suite reload/lifecycle failure using opt-in `--diagnostics`.
   Keep real route/history/reload assertions. Tests must use synthetic stores and
   the owned exact-origin network policy.
4. The restricted-course test's Spanish pill pointer click was intermittently
   obstructed during legacy smooth scrolling. A legitimate keyboard focus/Enter
   check was proposed but **not yet applied**. Keep selection and bilingual-title
   assertions; do not use forced clicks.
5. Re-run the appropriate browser suites, record rendered-frame measurements, and
   update architecture/interface documentation with actual results and limitations.

Production data, live integrations, dependency upgrades, account durability, and
database restoration are outside this completed runtime slice and remain roadmap
work. No production data was read or modified by these tests.
