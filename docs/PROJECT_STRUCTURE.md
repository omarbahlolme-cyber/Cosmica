# Project Structure

## Root layout

```text
.
|-- backend/
|   `-- server.js                     # Main API server (auth/progress/billing/chat/tts/static hosting)
|-- frontend/
|   |-- index.html                    # Home page
|   |-- english-world.html            # English world landing page
|   |-- english-letters.html          # English letters map
|   |-- english-words.html            # English words map
|   |-- english-phrases.html          # English phrases map
|   |-- english-grammar.html          # English grammar map
|   |-- world-<language>.html         # Non-English world landing pages
|   |-- letters-<language>.html       # Non-English letters maps
|   |-- words-<language>.html         # Non-English words maps
|   |-- phrases-<language>.html       # Non-English phrases maps
|   |-- grammar-<language>.html       # Non-English grammar maps
|   |-- app.js                        # Shared frontend runtime
|   |-- style.css                     # Shared styles
|   |-- maps/
|   |   |-- app-maps.js               # Map runtime bundle
|   |   |-- style-maps.css            # Map-only styles
|   |   `-- translations.json         # Base translation pack
|   |-- worlds/
|   |   `-- <world-key>/
|   |       |-- <world>.map-routes.json
|   |       |-- <world>.world.meta.json
|   |       |-- translations.json     # World-specific translation pack
|   |       `-- README.md
|   |-- robots.txt
|   |-- sitemap.xml
|   |-- privacy.html
|   |-- terms.html
|   |-- license.html
|   `-- security.txt
|-- docs/
|   |-- HANDOFF_ZERO_TO_HERO.md       # Beginner handoff and release flow
|   |-- CHANGE_GUIDE.md               # Change impact matrix (what else to update/check)
|   |-- FRONTEND_RUNTIME_NOTES.md      # Runtime guardrails and decisions
|   |-- OPERATIONS_HARDENING.md
|   |-- BILLING_OPS_QUICK_COMMANDS.md
|   |-- TEST_USERS_REGISTRY.md        # QA/test accounts, roles, and usage notes
|   |-- THIRD_PARTY_SERVICES_MAP.md   # External platforms, ownership, and ops checks
|   |-- ENFORCEMENT_RUNBOOK.md
|   |-- PEDAGOGY_REMEDIATION_TOP10.md # Pedagogy quality priorities + release gate
|   |-- WORLD_BY_WORLD_REMEDIATION_STATUS.md # Current remediation phase and world review order
|   |-- ROLLBACK_RUNBOOK.md
|   `-- SECURITY.md
|-- scripts/                          # Checks, backups, generators, repair tools
|-- perf/                             # Performance baseline and reports
|-- backups/                          # Generated backups (gitignored)
|-- server.js                         # Bootstrap entry point (loads backend/server.js)
|-- package.json
`-- README.md
```

## Ownership map (edit intent -> file)

1. Auth dropdown, world shell, shared UI logic:
- `frontend/app.js`
- `frontend/style.css`

2. Words/Phrases/Grammar rendering and map interactions:
- `frontend/maps/app-maps.js`
- `frontend/maps/style-maps.css`

3. API behavior and data contracts (auth/progress/billing/security):
- `backend/server.js`

4. SEO/indexing/legal content:
- `frontend/robots.txt`
- `frontend/sitemap.xml`
- `frontend/privacy.html`
- `frontend/terms.html`
- `frontend/license.html`

5. Operational procedures:
- `docs/OPERATIONS_HARDENING.md`
- `docs/BILLING_OPS_QUICK_COMMANDS.md`
- `docs/ROLLBACK_RUNBOOK.md`

6. Test-user roles and QA account notes:
- `docs/TEST_USERS_REGISTRY.md`

7. Third-party platform ownership and operations:
- `docs/THIRD_PARTY_SERVICES_MAP.md`

## Organization rules

1. Keep URL-facing HTML files under `frontend/` unless route behavior is intentionally changed.
2. Keep shared behavior in `frontend/app.js`; keep map-heavy logic in `frontend/maps/app-maps.js`.
3. Keep global styles in `frontend/style.css`; keep map styles in `frontend/maps/style-maps.css`.
4. Keep world-specific route/meta/translation files in `frontend/worlds/<world-key>/`.
5. Keep operational docs in `docs/`.
6. Keep utility and verification scripts in `scripts/`.
7. Update `perf/baseline.json` intentionally (`npm run perf:baseline`) after verified performance changes.
8. Update bloat allowlist intentionally (`npm run check:bloat:refresh`) only after verified cleanup.

## Git workflow quick reference

1. Default branch is `main`; prefer branch + PR for non-trivial work.
2. Safe branch flow:
- `git checkout -b <topic-branch>`
- `git add <paths>`
- `git commit -m "<scope>: <summary>"`
- `git push origin <topic-branch>` and open PR to `main`
3. Direct-to-main should be limited to very small low-risk fixes:
- `git add <paths>` -> `git commit -m "<scope>: <summary>"` -> `git push origin main`
4. Use descriptive commit messages; avoid generic `update` commits.
5. Keep commits scoped by concern (runtime, docs, data, ops).

## Beginner orientation

1. Start with `docs/HANDOFF_ZERO_TO_HERO.md`.
2. Use section headers in large files as your primary navigation.
3. Run `npm run check:syntax` and `npm run smoke` before and after your first change.
4. Do not deploy without `npm run quality` passing.
