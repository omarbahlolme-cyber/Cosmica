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
4. `frontend/worlds/spanish/`
5. `frontend/worlds/portuguese/`
6. `frontend/worlds/dutch/`
7. `frontend/worlds/swedish/`
8. `frontend/worlds/arabic/`
9. `frontend/worlds/chinese/`
10. `frontend/worlds/japanese/`
11. `frontend/worlds/korean/`
12. `frontend/worlds/hindi/`

## Routing rule (important)

Public URL pages stay in `frontend/` root (for stable indexed URLs).  
Example: `english-world.html`, `english-letters.html`, `english-words.html`, `english-phrases.html`, `english-grammar.html`.

World folders are for world-specific data/config, not for changing public route URLs.

## Letters Policy (All non-English worlds)

1. Show the core alphabet in the heading (for example `A-Z`).
2. Present language-specific accented letters, ligatures, or extra letters as supplemental forms.
3. Keep pronunciation cards for supplemental forms when they are used in real writing.
4. Do not present supplemental forms as if they replace the core alphabet order.

## Phrase Intent Policy (All non-English worlds)

1. The 4 self-reference intents must target the world language, never English:
   `learn_world_language`, `speak_world_language`, `not_speak_world_language`, `ask_speak_world_language`.
2. These intents live under `Introductions` (first 3) and `Questions` (last one).
3. Store intent metadata in each world pack entry (`intent` + world-native phrase + world-native English source meaning).
4. `npm run check:intents` must pass before deploying.

## Grammar Availability Policy (Non-English worlds)

1. Grammar map cards are currently marked `Coming soon` on non-English world pages.
2. Keep grammar page routes present for compatibility, but do not expose grammar as active learning content until the world grammar is fully validated.
