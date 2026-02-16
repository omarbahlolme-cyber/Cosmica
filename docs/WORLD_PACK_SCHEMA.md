# World Pack Schema

Use this guide to build new language worlds with the same UI/logic/behavior as English, while changing only content.

## Goal

1. Keep renderer/layout/behavior shared.
2. Move world-specific content into data packs.
3. Keep grammar quality high with explicit per-card rules/examples/mistakes.

## Pack Files

Each world should have these files:

1. `meta.json`
2. `words.json`
3. `phrases.json`
4. `grammar.json`

Recommended folder:

```text
frontend/worlds/<world-key>/
|-- meta.json
|-- words.json
|-- phrases.json
`-- grammar.json
```

## Schemas

Exact schemas are in:

1. `docs/schemas/world.meta.schema.json`
2. `docs/schemas/world.words.schema.json`
3. `docs/schemas/world.phrases.schema.json`
4. `docs/schemas/world.grammar.schema.json`

## Base Language Rule

For all non-English worlds:
1. Include `english` in `meta.baseLanguages`.
2. Keep source content in world language.
3. Show translation to selected base language.

## Letters Modeling Rule (All non-English worlds)

1. Keep the page title focused on the core alphabet for that language (for many Latin-script worlds this is `A-Z`).
2. If the language uses accented forms, ligatures, or additional letters, list them as supplemental forms.
3. Include pronunciation cards for supplemental forms that are pedagogically useful.
4. Apply the same policy consistently across every new world to avoid alphabet-logic confusion.

## Grammar Display Rule (Non-English Worlds)

Enable both display modes:
1. `english`
2. `base`

Configured by:
1. `meta.grammarDisplayModes`

## TTS Rule

Define world voice in `meta.tts`:
1. `languageCode`
2. `voice`
3. optional `speakingRate`
4. optional `pitch`

## Templates

Copy starter files from:

1. `docs/templates/world-pack/meta.example.json`
2. `docs/templates/world-pack/words.example.json`
3. `docs/templates/world-pack/phrases.example.json`
4. `docs/templates/world-pack/grammar.example.json`

## Quality Contract

Before release, validate against:

1. `docs/WORLD_PARITY_CHECKLIST.md`

Each card must be internally consistent:
1. title/topic
2. rules
3. examples
4. mistakes/fixes

No off-topic card content.
