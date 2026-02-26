# Pedagogy Remediation Top 10 (Research-Grade)

Goal: reduce pedagogy risk before release and make quality enforceable in CI, not subjective.

## 1) Grammar Card Structural Integrity (P0)
- Scope: all worlds, all grammar cards.
- Rule: each card must have `title`, `points`, `example`, `ruleOrder`, `exampleHighlights`, `mistakes`.
- Exit: zero missing fields; CI fails on any violation.

## 2) Rule-Highlight Alignment (P0)
- Scope: all grammar cards, especially `Modality`.
- Rule: `ruleOrder` and `exampleHighlights` must be coherent and renderable.
- Exit: no non-renderable cards; no highlight/class mapping drift.

## 3) Common-Mistake Validity (P0)
- Scope: grammar `mistakes`.
- Rule: `wrong` must be genuinely wrong for the topic, `fix` must be the corrected form, not a topic/meaning swap.
- Exit: modality and high-frequency cards manually reviewed by linguist.

## 4) Encoding and Script Fidelity (P0)
- Scope: all meta + world packs.
- Rule: no mojibake/corrupted glyphs in `nativeName`, examples, labels.
- Exit: zero known corruption artifacts.

## 5) Register Policy Consistency (P1)
- Scope: words + phrases.
- Rule: register tagging policy is explicit and consistently applied (`formal`, `informal`, etc.).
- Exit: every section follows the same tagging policy.

## 6) Romanization Strategy (P1)
- Scope: Arabic/Chinese/Hindi/Japanese/Korean.
- Rule: define when romanization appears (always, beginner-only, toggle-only) and apply consistently.
- Exit: policy documented and enforced by check.

## 7) Translation Coverage Policy (P1)
- Scope: non-English worlds.
- Rule: all entries must include at least `english`; optional base-language expansion follows product policy.
- Exit: no missing mandatory translation keys.

## 8) Duplicate-Entry Hygiene (P1)
- Scope: words + phrases.
- Rule: remove accidental duplicates; keep only intentional pedagogical variants.
- Exit: duplicate report triaged and intentional exceptions documented.

## 9) TTS/Voice Consistency (P1)
- Scope: world voice configs and playback pipeline.
- Rule: each world has valid voice config and graceful fallback behavior.
- Exit: speech works consistently across desktop/mobile with no silent failure.

## 10) Human Linguist Gate Before Publish (P0/P1)
- Scope: all worlds; priority on grammar + modality + high-frequency phrases.
- Rule: release blocked unless checklist rows are signed off.
- Exit: completed `docs/LINGUIST_WORLD_REVIEW_TEMPLATE.csv` rows for release scope.

## Recommended Release Gate
1. `npm run check:worlds:deep`
2. `node scripts/audit-learning-maps.js`
3. `npm run check:intents`
4. New pedagogy guard checks (added in this remediation cycle)
5. Human linguist sign-off on sampled critical cards
