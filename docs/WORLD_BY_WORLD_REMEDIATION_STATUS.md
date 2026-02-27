# World-by-World Remediation Status

## Global Override (2026-02-27)

This override replaces all prior implied or explicit "PASS/completed" claims for grammar remediation.

### Mandatory global decision

1. Effective immediately, grammar PASS is revoked for all supported languages until strict re-validation is completed.
2. No section may be marked PASS unless it clears the stricter pedagogical gate below.
3. Technical checks passing does not imply pedagogical PASS.

### Scope (all worlds)

- English
- French
- German
- Spanish
- Portuguese
- Dutch
- Swedish
- Arabic
- Chinese
- Japanese
- Korean
- Hindi

### Stricter gate required before PASS

1. Card-level alignment must be exact:
- title, rules, example, and common mistake must match the same concept.
2. Wrong/fix pair quality:
- exactly one wrong/fix pair per card.
- wrong must be wrong for the card topic itself (not a random or weak error).
- wrong must fail for one clear reason only.
- fix must minimally and fully correct that same reason.
3. Language-specific correctness:
- no cross-language transfer logic.
- grammar must be teacher-acceptable for the target language.
4. Highlight consistency:
- same grammatical function must keep the same color role within the card.
- no uncolored/mismatched highlighted element.
5. No stale leftovers:
- no duplicate or outdated wrong/fix variants remaining in source data.
6. Double recheck required:
- first pass: fix.
- second pass: verify no residual issues before PASS.

### Execution policy

1. Recheck is done card-by-card within each section.
2. Section can be marked PASS only after all cards in that section pass the stricter gate and post-fix recheck.
3. World can be marked PASS only after all sections in that world pass.

### Validation commands (supporting checks)

- `npm run check:worlds:deep`
- `npm run quality`
- `node scripts/check-grammar-zero-tolerance.js`
- `node scripts/check-grammar-peer-review.js`

Note: passing the commands above is necessary but not sufficient without strict card-by-card pedagogical verification.

### Current status

1. Global grammar PASS state: `REVOKED` (all worlds).
2. Re-validation mode: `STRICT CARD-BY-CARD`.
