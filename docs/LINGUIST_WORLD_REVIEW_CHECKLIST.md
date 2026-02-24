# Linguist World Review Checklist (All 4 Maps)

Purpose: fast human QA pass for pedagogical quality across all worlds and all map types:
- Letters
- Words
- Phrases
- Grammar

Use this after automated checks pass (`npm run quality`, `node scripts/audit-learning-maps.js`, `npm run check:intents`).

Spreadsheet tracker template (one row per world × map):
- `docs/LINGUIST_WORLD_REVIEW_TEMPLATE.csv`

## Review order (highest risk first)

1. Grammar (rule meaning, wrong/fix quality, explanation clarity)
2. Phrases (naturalness, intent fidelity, register)
3. Words (semantic precision, duplicates/conflicts, register tags)
4. Letters (script correctness, transliteration/audio alignment, ordering)

## Severity rubric

- `P0` Critical pedagogy error (teaches wrong rule/meaning) → block release.
- `P1` High confusion risk (unnatural/wrong usage in common flow) → fix before release.
- `P2` Quality issue (style/register inconsistency, minor wording) → batch-fix soon.

## Global checklist (run once)

- [ ] Confirm `npm run quality` passes.
- [ ] Confirm `node scripts/audit-learning-maps.js` reports `0` findings.
- [ ] Confirm `npm run check:intents` passes.
- [ ] Confirm no mojibake/encoding artifacts (e.g., `?` replacing accents/characters).
- [ ] Confirm no conflicting source→native mappings in phrase intent lines.

---

## Per-world run sheet (all 4 maps)

For each world, complete all four sections and sign off.

### English

- [ ] Grammar reviewed
- [ ] Phrases reviewed
- [ ] Words reviewed
- [ ] Letters reviewed
- [ ] Top-risk spot checks done
  - Grammar: wrong/fix pair teaches target rule.
  - Phrases: beginner intents are natural in real speech.
  - Words: no duplicate/conflicting synonyms for core beginner items.
  - Letters: symbol + pronunciation + order are coherent.
- Reviewer: __________  Date: __________  Status: Pass / Pass with notes / Fail

### French

- [ ] Grammar reviewed
- [ ] Phrases reviewed
- [ ] Words reviewed
- [ ] Letters reviewed
- [ ] Top-risk spot checks done
  - Accent integrity (`é`, `è`, `ç`, etc.) and no encoding corruption.
  - Formal/informal consistency (`tu` vs `vous`) per lesson context.
  - Beginner phrase intents are canonical and unique.
  - Letter/audio examples match modern standard usage.
- Reviewer: __________  Date: __________  Status: Pass / Pass with notes / Fail

### German

- [ ] Grammar reviewed
- [ ] Phrases reviewed
- [ ] Words reviewed
- [ ] Letters reviewed
- [ ] Top-risk spot checks done
  - Case/governed forms in beginner examples.
  - Verb position in statements/questions/subordinate patterns.
  - Register consistency (`du`/`Sie`) in common phrases.
  - Umlaut/ß representation and pronunciation cues.
- Reviewer: __________  Date: __________  Status: Pass / Pass with notes / Fail

### Spanish

- [ ] Grammar reviewed
- [ ] Phrases reviewed
- [ ] Words reviewed
- [ ] Letters reviewed
- [ ] Top-risk spot checks done
  - Ser/estar and tense choice in beginner examples.
  - Regional-neutral wording for core intents.
  - Accent marks preserved in high-frequency words.
  - Letter names/audio align with standard teaching sequence.
- Reviewer: __________  Date: __________  Status: Pass / Pass with notes / Fail

### Portuguese

- [ ] Grammar reviewed
- [ ] Phrases reviewed
- [ ] Words reviewed
- [ ] Letters reviewed
- [ ] Top-risk spot checks done
  - PT-BR/PT-PT neutrality or explicit consistency.
  - Pronoun/verb agreement in beginner phrases.
  - Diacritics and nasal forms preserved.
  - Letter/audio examples use consistent standard variant.
- Reviewer: __________  Date: __________  Status: Pass / Pass with notes / Fail

### Dutch

- [ ] Grammar reviewed
- [ ] Phrases reviewed
- [ ] Words reviewed
- [ ] Letters reviewed
- [ ] Top-risk spot checks done
  - Word order in clauses/questions.
  - Article/gender defaults in beginner nouns.
  - Phrase naturalness for real beginner conversation.
  - Spelling/diacritics and audio mapping integrity.
- Reviewer: __________  Date: __________  Status: Pass / Pass with notes / Fail

### Swedish

- [ ] Grammar reviewed
- [ ] Phrases reviewed
- [ ] Words reviewed
- [ ] Letters reviewed
- [ ] Top-risk spot checks done
  - En/ett consistency in noun examples.
  - Verb-second behavior in core sentence patterns.
  - Naturalness of common polite/request forms.
  - `å/ä/ö` handling and audio correctness.
- Reviewer: __________  Date: __________  Status: Pass / Pass with notes / Fail

### Arabic

- [ ] Grammar reviewed
- [ ] Phrases reviewed
- [ ] Words reviewed
- [ ] Letters reviewed
- [ ] Top-risk spot checks done
  - MSA consistency vs dialect mixing.
  - Gender/number agreement in beginner sentences.
  - RTL rendering + punctuation directionality sanity.
  - Letter forms/sounds and positional variants are pedagogically clear.
- Reviewer: __________  Date: __________  Status: Pass / Pass with notes / Fail

### Chinese

- [ ] Grammar reviewed
- [ ] Phrases reviewed
- [ ] Words reviewed
- [ ] Letters reviewed
- [ ] Top-risk spot checks done
  - Simplified/traditional consistency (choose one standard).
  - Classifier and word-order correctness in beginner examples.
  - Phrase naturalness in everyday contexts.
  - Pinyin/tone/audio alignment for starter content.
- Reviewer: __________  Date: __________  Status: Pass / Pass with notes / Fail

### Japanese

- [ ] Grammar reviewed
- [ ] Phrases reviewed
- [ ] Words reviewed
- [ ] Letters reviewed
- [ ] Top-risk spot checks done
  - Politeness level consistency (`です/ます` vs plain).
  - Particle choice in core beginner examples.
  - Phrase naturalness (not literal/translated-sounding).
  - Kana/kanji balance and reading/audio alignment.
- Reviewer: __________  Date: __________  Status: Pass / Pass with notes / Fail

### Korean

- [ ] Grammar reviewed
- [ ] Phrases reviewed
- [ ] Words reviewed
- [ ] Letters reviewed
- [ ] Top-risk spot checks done
  - Speech level consistency (해요/합니다 etc.).
  - Particle and tense/aspect correctness in examples.
  - Beginner phrase naturalness for daily interaction.
  - Hangeul sequencing and audio/transliteration coherence.
- Reviewer: __________  Date: __________  Status: Pass / Pass with notes / Fail

### Hindi

- [ ] Grammar reviewed
- [ ] Phrases reviewed
- [ ] Words reviewed
- [ ] Letters reviewed
- [ ] Top-risk spot checks done
  - Gender agreement + postposition usage.
  - Tense/aspect helper patterns in beginner rules.
  - Formal/informal pronoun consistency (`आप/तुम/तू`).
  - Devanagari spelling + transliteration/audio coherence.
- Reviewer: __________  Date: __________  Status: Pass / Pass with notes / Fail

---

## Notes log template

Use one line per issue:

`[World] [Map] [Severity] [Source phrase/card] [Issue] [Proposed fix] [Reviewer] [Date]`

Example:

`French | Phrases | P1 | "i speak french" | duplicate/encoding variant | keep "je parle français" only | AB | 2026-02-24`
