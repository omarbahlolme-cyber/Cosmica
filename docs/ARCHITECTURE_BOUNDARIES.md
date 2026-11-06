# Architecture boundaries

Cosmica currently ships four large browser/server runtime files. They remain supported legacy entry
points, but new features should be implemented behind a small, named module or helper and wired into
the entry point. Do not add another unrelated feature block directly to a large runtime file without
first checking whether an existing domain boundary can own it.

Preferred extraction order:

1. Account, billing, and premium UI from `frontend/app.js`.
2. Audio and speech runtime from `frontend/app.js`.
3. Words, phrases, and grammar renderers from `frontend/maps/app-maps.js`.
4. Header, account, modal, and map component styles from `frontend/style.css`.
5. Auth store, billing, learning APIs, and operations routes from `backend/server.js`.

`npm run check:source-budgets` caps the current entry points so the debt cannot grow silently. An
extraction must preserve the content-derived asset fingerprint, browser cache headers, static SEO
fallbacks, and the existing contract/smoke tests.
