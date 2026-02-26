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
