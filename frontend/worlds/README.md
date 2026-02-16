# World Folders

This folder keeps world-specific assets/data organized by language.

## Why this exists

1. Keep shared engine code in one place (`frontend/app.js`, `frontend/maps/app-maps.js`).
2. Keep world content and world config separated by language.
3. Scale cleanly when adding new worlds.

## Current worlds

1. `frontend/worlds/english/`
2. `frontend/worlds/french/`
3. `frontend/worlds/german/`

## Routing rule (important)

Public URL pages stay in `frontend/` root (for stable indexed URLs).  
Example: `english-world.html`, `english-letters.html`, `english-words.html`, `english-phrases.html`, `english-grammar.html`.

World folders are for world-specific data/config, not for changing public route URLs.

## Letters Policy (All non-English worlds)

1. Show the core alphabet in the heading (for example `A-Z`).
2. Present language-specific accented letters, ligatures, or extra letters as supplemental forms.
3. Keep pronunciation cards for supplemental forms when they are used in real writing.
4. Do not present supplemental forms as if they replace the core alphabet order.
