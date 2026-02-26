# Cosmica Grammar Review Packet (12-Professor Program)

## Purpose

Use this packet to run a structured expert review of grammar-map modal content across 12 language worlds.

Target worlds:
1. English
2. French
3. German
4. Spanish
5. Portuguese
6. Dutch
7. Swedish
8. Arabic
9. Chinese
10. Japanese
11. Korean
12. Hindi

## Review Scope (Per World)

Review all grammar modal cards for:
1. Rule correctness.
2. Example naturalness and topic fit.
3. "Common mistake" validity and educational usefulness.
4. Register/politeness accuracy.
5. Terminology and segment-label clarity.
6. Pedagogical progression order.
7. Translation quality (when visible in mapped flows).
8. Romanization/transliteration quality (if present).

## Rating Rubric (0-3)

Score each criterion per card:
- `0`: incorrect / misleading
- `1`: partially correct, needs major revision
- `2`: mostly correct, minor revision needed
- `3`: correct and publish-ready

Required fields:
1. Card ID or title.
2. Issue type.
3. Severity (`critical`, `major`, `minor`).
4. Suggested correction.
5. Optional learner-impact note.

## Severity Definitions

1. Critical: teaches incorrect structure likely to fossilize error.
2. Major: awkward/non-native usage or misleading explanation.
3. Minor: style/clarity improvement without core correctness risk.

## Professor Assignment Plan

1. One lead professor per world language.
2. One cross-review pass by a second reviewer for consistency.
3. One central editor merges accepted corrections.

## Per-World Worksheet Template

Use this format for each world:

World: `[Language]`  
Reviewer: `[Professor Name]`  
Date: `[YYYY-MM-DD]`

1. Card:
- Title:
- Section:
- Current rule summary:
- Verdict (0-3):
- Severity:
- Correction:
- Replacement example:
- Replacement common mistake:
- Notes:

2. Aggregate world verdict:
- Cards reviewed:
- Critical issues:
- Major issues:
- Minor issues:
- Priority patch batch size recommendation:

## 12-World Task List

1. English: baseline quality and consistency control world.
2. French: register and modality nuance checks.
3. German: word-order and clause-link integrity checks.
4. Spanish: mood/modality and natural collocation checks.
5. Portuguese: regional-neutral phrasing and formality checks.
6. Dutch: natural phrase ordering and register checks.
7. Swedish: pragmatic naturalness and question form checks.
8. Arabic: case/register clarity and example naturalness.
9. Chinese: aspect markers, connectors, and concise natural phrasing.
10. Japanese: politeness level and particle function clarity.
11. Korean: sentence slot labels, honorific level, and question tone.
12. Hindi: postpositions, aspect/modality, and natural colloquial usage.

## Deliverable Pack (Per Professor)

Each professor should submit:
1. Completed worksheet file.
2. Top 10 high-impact corrections.
3. "Do not ship" blockers list.
4. Optional pedagogical notes for sequence improvement.

## QA Sign-Off Gate

A world can be unlocked only when:
1. Critical issues = 0.
2. Major issues resolved or accepted with written rationale.
3. Two-pass review completed.
4. Technical checks pass:
- `npm run check:worlds:deep`
- `npm run quality`

## Suggested Workflow

1. Lock high-risk grammar world.
2. Review 5-10 cards per batch.
3. Apply corrections.
4. Re-run checks.
5. Re-review corrected batch.
6. Repeat until sign-off.

