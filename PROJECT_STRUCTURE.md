# Project Structure

## Root layout

```text
.
|-- index.html                  # Home/landing page
|-- world.html                  # English world entry page
|-- letters.html                # English letters map
|-- words.html                  # English words map
|-- phrases.html                # English phrases map
|-- grammar.html                # English grammar map
|-- style.css                   # Shared stylesheet for all pages
|-- style-maps.css              # Map-only stylesheet (letters/words/phrases/grammar)
|-- app.js                      # Base front-end behavior + lazy bundle loader
|-- app-maps.js                 # Maps bundle (datasets/renderers/translations)
|-- server.js                   # Express server + API routes
|-- translations.json           # Base translation pack
|-- robots.txt                  # Robots directives
|-- sitemap.xml                 # Sitemap for indexed pages
|-- package.json                # Node scripts/dependencies
|-- LICENSE                     # Proprietary license (all rights reserved)
|-- SECURITY.md                 # Vulnerability reporting/security policy
|-- security.txt                # Security contact file served at /.well-known/security.txt
|-- CHANGELOG.md                # Release/change history
|-- README.md                   # High-level setup + workflow
|-- OPERATIONS_HARDENING.md     # Platform hardening + backup runbook
|-- PROJECT_STRUCTURE.md        # This file
|-- backups/                    # Local backup outputs (*.zip, *.bundle, *.json) [gitignored]
|-- perf/
|   `-- baseline.json           # Performance baseline used by perf checks
|-- .github/
|   |-- dependabot.yml          # Dependabot security/dependency update automation
|   `-- workflows/
|       |-- backup-restore-drill.yml # Monthly backup restore validation drill
|       |-- backup-weekly.yml   # Weekly backup artifact + optional offsite mirror push
|       |-- github-hardening.yml# Manual branch-protection/security automation
|       |-- live-security-check.yml # Scheduled production redirect/header/health checks
|       |-- quality.yml         # CI workflow for syntax/bloat/perf/release/smoke checks
|       |-- security-audit.yml  # Scheduled dependency security audit
|       |-- uptime-monitor.yml  # Scheduled production uptime checks + incident issue alerts
|       `-- release.yml         # Automated GitHub release publishing for v* tags
`-- scripts/
    |-- apply-html-baseline.js          # Applies shared HTML a11y/SEO/integrity baseline
    |-- apply-github-hardening.js      # Applies GitHub branch protection + security settings via API
    |-- check-accessibility-baseline.js # Validates accessibility structural baseline for HTML pages
    |-- create-backup.js               # Creates timestamped source and git-history backups
    |-- check-external-integrity.js     # Enforces SRI/exemption policy for third-party assets
    |-- verify-backup.js               # Verifies backup bundle integrity + paired source archive
    |-- check-seo-baseline.js           # Validates canonical metadata, JSON-LD, and sitemap coverage
    |-- check-asset-version-consistency.js # Enforces consistent cache-busting versions for shared CSS/JS links
    |-- check-security-txt.js           # Validates security.txt required fields and expiry freshness
    |-- live-security-check.js         # Checks production redirects, headers, and health endpoint
    |-- check-bloat.js                  # Orphan asset check + enforced selector allowlist
    |-- bloat-allowlist.json            # Baseline allowlist for known-unused selectors
    |-- perf-snapshot.js                # Captures current performance snapshot
    |-- perf-check.js                   # Compares current perf snapshot vs baseline
    |-- check-release.js                # Enforces changelog/version hygiene
    |-- smoke.js                        # Link + route smoke checks
    |-- generate-translations.js        # Builds translations.json
    `-- generate-world-translations.js  # Builds translations.<world>.json (optional future worlds)
```

## Organizational rules

1. Keep static page files in root unless URL routing is intentionally changed.
2. Keep shared/non-map front-end behavior in `app.js`; keep map-heavy code in `app-maps.js`.
3. Keep global styles in `style.css`; keep map-specific rules in `style-maps.css`.
4. Add new utility scripts under `scripts/` with top-level section comments.
5. Prefer non-functional cleanup (comments/formatting/docs) when the goal is readability.
6. Keep performance baseline updated intentionally (`npm run perf:baseline`) after verified optimizations.
7. Keep bloat allowlist intentional (`npm run check:bloat:refresh`) after verified selector cleanup.
8. Keep legal/security pages and security contact file updated with current policies/contact.
