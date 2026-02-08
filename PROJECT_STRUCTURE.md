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
|-- app.js                      # Shared front-end behavior and map rendering
|-- server.js                   # Express server + API routes
|-- translations.json           # Base translation pack
|-- translations.french.json    # French world translation pack
|-- robots.txt                  # Robots directives
|-- sitemap.xml                 # Sitemap for indexed pages
|-- package.json                # Node scripts/dependencies
|-- README.md                   # High-level setup + workflow
|-- PROJECT_STRUCTURE.md        # This file
`-- scripts/
    |-- smoke.js                        # Link + route smoke checks
    |-- generate-translations.js        # Builds translations.json
    `-- generate-world-translations.js  # Builds translations.<world>.json
```

## Organizational rules

1. Keep static page files in root unless URL routing is intentionally changed.
2. Keep all shared front-end behavior in `app.js` (organized by section headers).
3. Keep global styles in `style.css` (organized by section headers).
4. Add new utility scripts under `scripts/` with top-level section comments.
5. Prefer non-functional cleanup (comments/formatting/docs) when the goal is readability.
