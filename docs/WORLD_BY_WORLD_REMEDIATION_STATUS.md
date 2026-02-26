# World-by-World Remediation Status

## Current Override (2026-02-26)

This section overrides earlier "completed" statements until native-linguist review is finished.

### Current reality

1. Technical structure checks are still passing:
- `npm run check:worlds:deep`
- `npm run quality`

2. Pedagogical quality is not stable across all worlds yet.
- Main issue pattern: grammar card topic mismatch (title/rule/example/mistake not tightly aligned).
- Main UI symptom: middle "rule/highlight boxes" can be linguistically weak or segmented unnaturally for some cards.

### Deep audit status (latest)

1. High risk worlds (temporary grammar lock active):
- Arabic
- Chinese
- Hindi
- Japanese
- Korean

2. Medium risk worlds (fix queue after high-risk batch):
- Dutch
- Portuguese

3. Low to medium risk worlds (keep open, review later):
- French
- German
- Spanish
- Swedish

### Evidence snapshots (examples)

1. Arabic question/modality slot-label quality:
- `frontend/worlds/arabic/translations.json:9408`
- `frontend/worlds/arabic/translations.json:10410`

2. Japanese question highlight segmentation issue:
- `frontend/worlds/japanese/translations.json:9802`
- `frontend/worlds/japanese/translations.json:9821`
- `frontend/worlds/japanese/translations.json:9825`

3. Chinese connections wrong-example truncation:
- `frontend/worlds/chinese/translations.json:10269`
- `frontend/worlds/chinese/translations.json:10313`
- `frontend/worlds/chinese/translations.json:10352`

4. Hindi repeated sentence overuse across sections:
- `frontend/worlds/hindi/translations.json:7977`
- `frontend/worlds/hindi/translations.json:10036`
- `frontend/worlds/hindi/translations.json:10477`
- `frontend/worlds/hindi/translations.json:11364`

### Operating decision (until remediation is complete)

1. Keep grammar map locked for high-risk worlds listed above.
2. Keep letters/words/phrases open.
3. Apply fixes in small native-review batches (5-10 cards), world by world.
4. After each batch:
- run `npm run check:worlds:deep`
- run `npm run quality`
- do manual UI review in map modal.
