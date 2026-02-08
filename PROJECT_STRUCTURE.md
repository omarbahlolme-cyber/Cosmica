# Project Structure

## Root layout

```text
.
|-- index.html                  # Home/landing page
|-- world.html                  # English world entry page
|-- world-french.html           # French world entry page
|-- letters.html                # English letters map
|-- letters-french.html         # French letters map
|-- words.html                  # English words map
|-- words-french.html           # French words map
|-- phrases.html                # English phrases map
|-- phrases-french.html         # French phrases map
|-- grammar.html                # English grammar map
|-- grammar-french.html         # French grammar map
|-- style.css                   # Shared stylesheet for all pages
|-- style-maps.css              # Map-only stylesheet (letters/words/phrases/grammar)
|-- app.js                      # Base front-end behavior + lazy bundle loader
|-- app-maps.js                 # Maps bundle (datasets/renderers/translations)
|-- server.js                   # Express server + API routes
|-- translations.json           # Base translation pack
|-- translations.french.json    # French world translation pack
|-- robots.txt                  # Robots directives
|-- sitemap.xml                 # Sitemap for indexed pages
|-- package.json                # Node scripts/dependencies
|-- CHANGELOG.md                # Release/change history
|-- README.md                   # High-level setup + workflow
|-- PROJECT_STRUCTURE.md        # This file
|-- perf/
|   `-- baseline.json           # Performance baseline used by perf checks
|-- .github/
|   `-- workflows/
|       |-- quality.yml         # CI workflow for syntax/bloat/perf/release/smoke checks
|       |-- uptime-monitor.yml  # Scheduled production uptime checks + incident issue alerts
|       `-- release.yml         # Automated GitHub release publishing for v* tags
`-- scripts/
    |-- check-bloat.js                  # Orphan asset check + enforced selector allowlist
    |-- bloat-allowlist.json            # Baseline allowlist for known-unused selectors
    |-- perf-snapshot.js                # Captures current performance snapshot
    |-- perf-check.js                   # Compares current perf snapshot vs baseline
    |-- check-release.js                # Enforces changelog/version hygiene
    |-- smoke.js                        # Link + route smoke checks
    |-- generate-translations.js        # Builds translations.json
    `-- generate-world-translations.js  # Builds translations.<world>.json
```

## Organizational rules

1. Keep static page files in root unless URL routing is intentionally changed.
2. Keep shared/non-map front-end behavior in `app.js`; keep map-heavy code in `app-maps.js`.
3. Keep global styles in `style.css`; keep map-specific rules in `style-maps.css`.
4. Add new utility scripts under `scripts/` with top-level section comments.
5. Prefer non-functional cleanup (comments/formatting/docs) when the goal is readability.
6. Keep performance baseline updated intentionally (`npm run perf:baseline`) after verified optimizations.
7. Keep bloat allowlist intentional (`npm run check:bloat:refresh`) after verified selector cleanup.
