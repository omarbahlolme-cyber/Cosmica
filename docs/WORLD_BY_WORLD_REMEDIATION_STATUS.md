# World-by-World Remediation Status

## Completed (Phase 1: Safe Mechanical Fixes)

Applied across all non-English worlds:

1. `grammarDisplayModes` normalized:
- non-English: `["english","base"]`
- English: `["english"]`

2. Grammar card alignment fixed:
- `ruleOrder` and `exampleHighlights` are now aligned on all cards.
- `Modality` mismatches: `0`
- Global grammar mismatches: `0`

3. Encoding repairs:
- French meta native name and phrase intent forms corrected to proper accents.
- Corrupted noun/article rule lines corrected in:
  - Dutch
  - French
  - Portuguese
  - Spanish
  - Swedish

4. CI guardrails strengthened:
- Deep world check now fails if any grammar card has rule/highlight mismatch.
- Deep world check validates required metadata and core translation fields.

## Verification

All checks pass after remediation:

1. `npm run check:worlds:deep`
2. `npm run quality`

## Remaining Work (Phase 2: Native-Linguist Pedagogy Pass)

These are not safe to auto-fix; they require per-world linguistic judgment:

1. Common-mistake quality (ensure wrong examples are truly wrong, not just style alternatives).
2. Register normalization policy (`formal/informal` coverage consistency).
3. Romanization policy and coverage for non-Latin scripts.
4. Duplicate pruning policy (remove accidental duplicates, keep intentional pedagogical variants).

## Phase 2 Progress

1. Arabic: completed (safe pass)
- Disambiguated polysemous source glosses in words map:
  - `open (verb)` vs `open (adjective)`
  - `second (ordinal)` vs `second (time unit)`
  - `square (shape)` vs `square (plaza)`
  - `cloud (weather)` vs `cloud (computing)`
- Corrected a grammar-card issue in `Verbs` (transitive verb card):
  - fixed highlight slot semantics (subject/verb/object mapping)
  - improved mistake pair to a clearer agreement correction
- Improved `Pronouns & Reference` first card mistake pair to a clear person-agreement error/fix.
- Validation: full `npm run quality` passed after changes.

2. Chinese: completed (safe pass)
- Disambiguated polysemous source glosses in words map:
  - `open (verb)` vs `open (adjective)`
  - `second (ordinal)` vs `second (time unit)`
  - `square (shape)` vs `square (plaza)`
  - `cloud (weather)` vs `cloud (computing)`
- Fixed two modality highlight text defects (slot text now matches intended phrase tokens).
- Reworked modality mistake pairs to clear grammatical errors/fixes (avoids meaning-only swaps).
- Validation: full `npm run quality` passed after changes.

3. Japanese: completed (safe pass)
- Disambiguated polysemous source glosses in words map:
  - `open (verb)` vs `open (adjective)`
  - `second (ordinal)` vs `second (time unit)`
  - `square (shape)` vs `square (plaza)`
  - `cloud (weather)` vs `cloud (computing)`
- Repaired high-impact broken `Problems` phrase forms (placeholder/object handling and natural Japanese phrasing).
  - examples fixed: `i lost my`, `i missed my`, `i forgot my`, `my phone is dead`, `i ran out of`, `i do not know`
- Corrected modality highlight slot text in key cards so highlighted chunks match intended token spans.
  - examples fixed: `義務を表す`, `可能性を表す`, `意志を表す`, `推測を表す`
- Validation: full `npm run quality` passed after changes.

4. Korean: completed (safe pass)
- Disambiguated polysemous source glosses in words map:
  - `open (verb)` vs `open (adjective)`
  - `second (ordinal)` vs `second (time unit)`
  - `square (shape)` vs `square (plaza)`
  - `cloud (weather)` vs `cloud (computing)`
- Repaired high-impact broken `Problems` placeholder phrases.
  - examples fixed: `i lost my`, `i missed my`, `i forgot my`, `i ran out of`
- Normalized two high-frequency health phrases to polite natural forms.
  - `it hurts here`, `my stomach hurts`
- Corrected modality certainty-card pedagogy alignment.
  - `확신 표현` now uses `-(으)ㄹ 것이다` framing consistent with example/highlights.
- Validation: full `npm run quality` passed after changes.

5. Hindi: completed (safe pass)
- Disambiguated polysemous source glosses in words map:
  - `open (verb)` vs `open (adjective)`
  - `second (ordinal)` vs `second (time unit)`
  - `square (shape)` vs `square (plaza)`
  - `cloud (weather)` vs `cloud (computing)`
- Repaired broken placeholder phrases in `Work & Study` and `Problems`.
  - examples fixed: `i need help with`, `i work in`, `i lost my`, `i missed my`, `i forgot my`, `i ran out of`
- Corrected modality-card pedagogical consistency on high-risk cards.
  - examples fixed: `क्षमता`, `अनिवार्यता (नकारात्मक)`, `संभावना (नकारात्मक)` (rule/highlight/mistake coherence)
- Validation: full `npm run quality` passed after changes.

6. French: completed (safe pass)
- Disambiguated polysemous source glosses in words map:
  - `open (verb)` vs `open (adjective)`
  - `second (ordinal)` vs `second (time unit)`
  - `square (shape)` vs `square (plaza)`
  - `cloud (weather)` vs `cloud (computing)`
- Repaired incomplete placeholder phrases in `Work & Study` and `Problems`.
  - examples fixed: `i need help with`, `i work in`, `i lost my`, `i missed my`, `i forgot my`, `i ran out of`
- Corrected one agreement/form issue in introductions and polished formal apology phrase.
- Corrected modality mistake-pair validity on high-risk cards.
  - examples fixed: `Capacité avec 'savoir'`, `Certitude avec 'être sûr'`
- Validation: full `npm run quality` passed after changes.

7. German: completed (safe pass)
- Disambiguated polysemous source glosses in words map:
  - `open (verb)` vs `open (adjective)`
  - `second (ordinal)` vs `second (time unit)`
  - `square (shape)` vs `square (plaza)`
  - `cloud (weather)` vs `cloud (computing)`
- Repaired incomplete placeholder phrases in `Work & Study` and `Problems`.
  - examples fixed: `i need help with`, `i work in`, `i lost my`, `i missed my`, `i forgot my`, `i ran out of`
- Improved two high-frequency problem forms:
  - `i am lost` -> natural German (`ich habe mich verlaufen`)
  - `i cannot find` -> explicit object form (`ich kann es nicht finden`)
- Pruned accidental case-variant duplicate phrase entries to reduce redundancy/noise.
- Corrected modality mistake validity in `Dürfen (Erlaubnis)` (now genuinely incorrect -> corrected pair).
- Validation: full `npm run quality` passed after changes.

8. Spanish: completed (safe pass)
- Disambiguated polysemous source glosses in words map:
  - `open (verb)` vs `open (adjective)`
  - `second (ordinal)` vs `second (time unit)`
  - `square (shape)` vs `square (plaza)`
  - `cloud (weather)` vs `cloud (computing)`
- Repaired incomplete placeholder phrases in `Work & Study` and `Problems`.
  - examples fixed: `i need help with`, `i work in`, `i lost my`, `i missed my`, `i forgot my`, `i ran out of`
- Split lost-vs-missed mapping into distinct Spanish phrase targets for pedagogical clarity:
  - `perdí mi ...` -> `i lost my`
  - `perdí mi ... (cita/autobús)` -> `i missed my`
- Corrected modality mistake validity in `Consejo con 'deberías'` (now genuinely incorrect -> corrected pair).
- Validation: full `npm run quality` passed after changes.

9. Portuguese: completed (safe pass)
- Disambiguated polysemous source glosses in words map:
  - `open (verb)` vs `open (adjective)`
  - `second (ordinal)` vs `second (time unit)`
  - `square (shape)` vs `square (plaza)`
  - `cloud (weather)` vs `cloud (computing)`
- Repaired incomplete placeholder phrases in `Work & Study` and `Problems`.
  - examples fixed: `i need help with`, `i work in`, `i lost my`, `i missed my`, `i forgot my`, `i ran out of`
- Split lost-vs-missed mapping into distinct Portuguese phrase targets for pedagogical clarity:
  - `eu perdi meu ...` -> `i lost my`
  - `perdi meu ... (compromisso/transporte)` -> `i missed my`
- Corrected modality mistake validity in `Certeza com 'deve'` (now genuinely incorrect -> corrected pair).
- Validation: full `npm run quality` passed after changes.

10. Dutch: completed (safe pass)
- Disambiguated polysemous source glosses in words map:
  - `open (verb)` vs `open (adjective)`
  - `second (ordinal)` vs `second (time unit)`
  - `square (shape)` vs `square (plaza)`
  - `cloud (weather)` vs `cloud (computing)`
- Repaired incomplete placeholder phrases in `Work & Study` and `Problems`.
  - examples fixed: `i need help with`, `i work in`, `i lost my`, `i missed my`, `i forgot my`, `i ran out of`
- Corrected modality card alignment/validity in `Sprekerhouding (Speaker Stance)`:
  - fixed highlight segmentation (`verb`/`object`) to match the actual example
  - replaced acceptable-alt “wrong” sentence with a genuinely incorrect word-order example
- Validation: full `npm run quality` passed after changes.

11. Swedish: completed (safe pass)
- Disambiguated polysemous source glosses in words map:
  - `open (verb)` vs `open (adjective)`
  - `second (ordinal)` vs `second (time unit)`
  - `square (shape)` vs `square (plaza)`
  - `cloud (weather)` vs `cloud (computing)`
- Repaired incomplete placeholder phrases in `Work & Study` and `Problems`.
  - examples fixed: `i need help with`, `i work in`, `i lost my`, `i missed my`, `i forgot my`, `i ran out of`
- Corrected modality mistake validity in `Förmåga med 'kan'` (now genuinely incorrect -> corrected pair).
- Validation: full `npm run quality` passed after changes.

12. English: completed (baseline pass)
- Verified English world routing/meta contract:
  - `frontend/worlds/english/english.world.meta.json`
  - `frontend/worlds/english/english.map-routes.json`
- Ran deep map audit (`node scripts/audit-learning-maps.js`) with zero findings.
- No English content-pack rewrites were required in this pass.
- Validation: `npm run check:worlds:deep` and `npm run quality` pass in the current baseline.

## Post-Pass Phrase Naturalness Patch

Applied safely after the world-by-world pass:

1. Arabic and Chinese placeholder normalization in `Work & Study` and `Problems`:
- completed object-required patterns for:
  - `i need help with`
  - `i lost my`
  - `i cannot find`
  - `i missed my`
  - `i forgot my`
  - `i ran out of`
- Arabic `my phone is dead` was replaced with a battery-native phrasing.

2. Battery-native wording for `my phone is dead` in additional worlds:
- Dutch
- French
- German
- Spanish
- Swedish

3. Validation after patch:
- `npm run check:intents` passed
- `npm run check:worlds:deep` passed
- `npm run quality` passed

## Execution Order (Recommended)

1. Arabic
2. Chinese
3. Japanese
4. Korean
5. Hindi
6. French
7. German
8. Spanish
9. Portuguese
10. Dutch
11. Swedish
12. English (final baseline sanity pass)

## Per-World Sign-off Rule

A world is marked complete only when:

1. Native-linguist review checklist is completed.
2. Common mistakes are topic-correct and pedagogically valid.
3. Register/romanization decisions are consistent.
4. `npm run quality` still passes.
