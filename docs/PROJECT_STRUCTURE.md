# Project Structure

## Root layout

```text
.
|-- backend/
|   `-- server.js                     # API server (Express): chat, translate, feedback, health, tts
|-- frontend/
|   |-- index.html                    # Home/landing page
|   |-- world.html                    # English world entry page
|   |-- letters.html                  # English letters map
|   |-- words.html                    # English words map
|   |-- phrases.html                  # English phrases map
|   |-- grammar.html                  # English grammar map
|   |-- privacy.html                  # Privacy policy
|   |-- terms.html                    # Terms of use
|   |-- license.html                  # License page
|   |-- app.js                        # Base front-end behavior + lazy map bundle loader
|   |-- style.css                     # Shared stylesheet
|   |-- robots.txt                    # Robots directives
|   |-- sitemap.xml                   # Sitemap for indexed pages
|   |-- security.txt                  # Served at /.well-known/security.txt
|   |-- favicon.svg                   # Site icon
|   |-- maps/
|   |   |-- app-maps.js               # Map bundle (datasets/renderers/translations)
|   |   |-- style-maps.css            # Map-only stylesheet
|   |   `-- translations.json         # Base translation pack
|   `-- naverc3bcca6a08043c716e45b0c95a298a16.html  # Naver ownership verification
|-- docs/
|   |-- PROJECT_STRUCTURE.md          # This file
|   |-- OPERATIONS_HARDENING.md       # Platform hardening + backup runbook
|   |-- ROLLBACK_RUNBOOK.md           # Rollback procedures and recovery commands
|   `-- SECURITY.md                   # Vulnerability reporting/security policy
|-- scripts/
|   |-- apply-html-baseline.js
|   |-- apply-github-hardening.js
|   |-- bloat-allowlist.json
|   |-- check-accessibility-baseline.js
|   |-- check-asset-version-consistency.js
|   |-- check-bloat.js
|   |-- check-external-integrity.js
|   |-- check-release.js
|   |-- check-security-txt.js
|   |-- check-seo-baseline.js
|   |-- create-backup.js
|   |-- generate-translations.js
|   |-- generate-world-translations.js
|   |-- indexing-followup.js
|   |-- live-security-check.js
|   |-- perf-check.js
|   |-- perf-snapshot.js
|   |-- rollback-info.js
|   |-- smoke.js
|   `-- verify-backup.js
|-- perf/
|   `-- baseline.json                 # Performance baseline used by perf checks
|-- backups/                          # Local backup outputs (*.zip, *.bundle, *.json) [gitignored]
|-- .github/
|   |-- dependabot.yml
|   `-- workflows/
|-- server.js                         # Bootstrap entry point (loads backend/server.js)
|-- package.json
|-- package-lock.json
|-- README.md
|-- CHANGELOG.md
|-- LICENSE
|-- .editorconfig
|-- .gitignore
`-- .prettierrc.json
```

## Organization rules

1. Keep URL-facing HTML files under `frontend/` unless route behavior is intentionally changed.
2. Keep shared behavior in `frontend/app.js`; keep map-heavy code in `frontend/maps/app-maps.js`.
3. Keep global styles in `frontend/style.css`; keep map styles in `frontend/maps/style-maps.css`.
4. Keep operational/reference docs in `docs/`.
5. Keep utility scripts under `scripts/` with clear section headers and scoped purpose.
6. Update `perf/baseline.json` intentionally (`npm run perf:baseline`) after verified performance changes.
7. Update bloat allowlist intentionally (`npm run check:bloat:refresh`) only after verified cleanup.
