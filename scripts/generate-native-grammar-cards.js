/* ==========================================================================
   NATIVE GRAMMAR GENERATOR (PREMIUM PEDAGOGICAL QA)
   Generates language-native grammar cards with:
   1) creation pass
   2) native-linguist review pass
   3) validation gates (schema + anti-English-transfer checks)
   ========================================================================== */
const fs = require("fs");
const path = require("path");
const vm = require("vm");
const OpenAI = require("openai");
require("dotenv").config();

const WORLD_LANGUAGE_LABELS = {
  french: "French",
  german: "German",
  spanish: "Spanish",
  portuguese: "Portuguese",
  dutch: "Dutch",
  swedish: "Swedish",
  arabic: "Arabic",
  chinese: "Chinese (Mandarin)",
  japanese: "Japanese",
  korean: "Korean",
  hindi: "Hindi",
};
const ALL_WORLD_KEYS = Object.keys(WORLD_LANGUAGE_LABELS);

const parseWorldKeys = (rawValue) => {
  const raw = String(rawValue || "")
    .trim()
    .toLowerCase();
  if (!raw) {
    return [];
  }
  if (raw === "all") {
    return [...ALL_WORLD_KEYS];
  }
  return [...new Set(raw.split(",").map((item) => item.trim()).filter(Boolean))];
};

const REQUESTED_WORLD_KEYS = parseWorldKeys(process.env.WORLD_KEY || process.env.WORLD_LANGUAGE);
if (!REQUESTED_WORLD_KEYS.length) {
  console.error("Missing WORLD_KEY. Use WORLD_KEY=all or WORLD_KEY=japanese (or comma-separated).");
  process.exit(1);
}

const unknownWorlds = REQUESTED_WORLD_KEYS.filter((key) => !WORLD_LANGUAGE_LABELS[key]);
if (unknownWorlds.length) {
  console.error(`Unknown WORLD_KEY values: ${unknownWorlds.join(", ")}`);
  process.exit(1);
}

const ROOT = path.join(__dirname, "..");
const mapsPath = path.join(ROOT, "frontend", "maps", "app-maps.js");

const apiKey = process.env.OPENAI_TRANSLATE_KEY || process.env.OPENAI_API_KEY;
if (!apiKey) {
  console.error("Missing OPENAI_TRANSLATE_KEY or OPENAI_API_KEY");
  process.exit(1);
}

const MODEL = process.env.OPENAI_TRANSLATE_MODEL || process.env.OPENAI_MODEL || "gpt-4o-mini";
const REQUEST_DELAY_MS = Number(process.env.TRANSLATION_DELAY_MS || 100);
const MAX_RETRIES = Number(process.env.NATIVE_GRAMMAR_RETRIES || 4);
const FORCE_REWRITE = String(process.env.FORCE_REWRITE || "1") === "1";
const REVIEW_PASS = String(process.env.NATIVE_GRAMMAR_REVIEW_PASS || "1") !== "0";
const TEMPERATURE_CREATE = Number(process.env.NATIVE_GRAMMAR_TEMPERATURE || 0.28);
const TEMPERATURE_REVIEW = Number(process.env.NATIVE_GRAMMAR_REVIEW_TEMPERATURE || 0.18);

const client = new OpenAI({ apiKey });
const mapsSource = fs.readFileSync(mapsPath, "utf8");
const sectionMatch = mapsSource.match(/const GRAMMAR_SECTION_LISTS = ({[\s\S]*?});/);
if (!sectionMatch) {
  throw new Error("Unable to extract GRAMMAR_SECTION_LISTS from frontend/maps/app-maps.js");
}
const GRAMMAR_SECTION_LISTS = vm.runInNewContext(`(${sectionMatch[1]})`);
const GRAMMAR_SECTION_ORDER = Object.keys(GRAMMAR_SECTION_LISTS);

const parseTargetSections = (rawValue) => {
  const raw = String(rawValue || "").trim();
  if (!raw || raw.toLowerCase() === "all") {
    return [...GRAMMAR_SECTION_ORDER];
  }
  const requested = raw
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
  const resolved = requested.filter((section) => GRAMMAR_SECTION_ORDER.includes(section));
  return [...new Set(resolved)];
};

const TARGET_SECTIONS = parseTargetSections(process.env.TARGET_SECTIONS);
if (!TARGET_SECTIONS.length) {
  console.error(
    "No valid TARGET_SECTIONS resolved. Use exact names or omit TARGET_SECTIONS for all sections."
  );
  process.exit(1);
}

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const normalize = (value) => String(value || "").trim();
const normalizeKey = (value) =>
  String(value || "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ");

const SECTION_ADAPTATION_HINTS = {
  "Sentence Structure":
    "Teach native sentence architecture, canonical order, and major deviations used in real speech.",
  Verbs:
    "Teach core conjugation/predicate behavior that truly exists in this language (including agreement, endings, particles, or auxiliaries as appropriate).",
  "Tenses & Aspect":
    "If this language does not inflect tense heavily, focus on native time/aspect tools (particles, adverbs, periphrasis, context).",
  "Nouns & Articles":
    "If true article systems are absent, replace article-focused content with native noun-phrase systems (classifiers, determiners, particles, case, possession).",
  "Pronouns & Reference":
    "Cover natural reference, omission/pro-drop behavior, deixis, and politeness distinctions where relevant.",
  Modifiers:
    "Teach native modifier position, ordering constraints, and comparative/intensity structures that are actually used.",
  Questions:
    "Teach authentic question strategies (word order, particles, intonation, interrogatives, formal/informal variants).",
  Negation:
    "Teach productive negation patterns with realistic constraints and common learner errors.",
  Connections:
    "Teach linking devices and clause-combining structures native speakers rely on.",
  Conditions:
    "Teach conditional systems that actually exist in this language (forms, particles, moods, plausibility).",
  "Voice & Focus":
    "Teach native mechanisms for focus/prominence and voice; avoid forcing passive/voice distinctions if not central in the language.",
  Modality:
    "Teach obligation, possibility, ability, certainty, and speaker stance through native modal systems.",
  "Reported Speech":
    "Teach direct/indirect reporting the way this language naturally does it (quotatives, complementizers, backshift only if relevant).",
  "Formality & Style":
    "Teach register, politeness, honorifics, and formality shifts based on real usage.",
  "Discourse & Flow":
    "Teach cohesive devices, discourse markers, and information flow across sentences.",
};

const LANGUAGE_RULES = {
  japanese: {
    focus: [
      "Respect SOV structure and particle-driven grammar.",
      "Honorifics/register are core grammar domains.",
    ],
    avoid: [
      "Do not teach definite/indefinite article paradigms as active grammar.",
      "Do not teach subject-verb agreement as a central rule.",
    ],
    forbiddenPatterns: [/定冠詞と不定冠詞/u],
  },
  korean: {
    focus: [
      "Respect SOV structure, particles, and sentence-ending systems.",
      "Speech levels and politeness endings are core grammar.",
    ],
    avoid: [
      "Do not teach definite/indefinite article paradigms as active grammar.",
      "Do not teach noun gender as a core grammatical category.",
    ],
    forbiddenPatterns: [/명사의 성/u],
  },
  chinese: {
    focus: [
      "Teach aspect particles and time adverbs instead of tense inflection paradigms.",
      "Teach classifier/measure-word logic and topic-prominent patterns.",
    ],
    avoid: [
      "Do not claim that Mandarin has verb conjugation by tense/person.",
      "Do not teach a true article paradigm as if it exists.",
    ],
    forbiddenPatterns: [/动词变位/u, /主谓一致/u],
  },
  arabic: {
    focus: [
      "Teach VSO/SVO behavior and nominal vs verbal sentence logic.",
      "Teach perfect/imperfect and mood behavior accurately.",
    ],
    avoid: ["Do not describe Arabic as having a full definite/indefinite article pair."],
    forbiddenPatterns: [/المقالات التعريفية/u],
  },
  hindi: {
    focus: [
      "Teach SOV order, postpositions, and agreement-sensitive structures naturally.",
      "Respect tense-aspect-agreement logic in examples.",
    ],
    avoid: ["Do not force a true article system as core Hindi grammar."],
    forbiddenPatterns: [/आर्टिकल/u],
  },
};

const LANGUAGE_PROFILES = {
  swedish: {
    sentence: "SVO with V2 behavior in main clauses",
    tenseAspect: "morphological past/present; aspect mostly periphrastic",
    articles: "definite and indefinite articles; definite suffix",
    formality: "weakly grammaticalized (mostly lexical/pragmatic)",
  },
  spanish: {
    sentence: "SVO with flexible order and pro-drop",
    tenseAspect: "rich tense morphology with aspect contrasts",
    articles: "definite and indefinite articles",
    formality: "weakly grammaticalized (usted/tú distinction in usage)",
  },
  portuguese: {
    sentence: "SVO with flexible order and pro-drop",
    tenseAspect: "morphological tense with aspect contrasts",
    articles: "definite and indefinite articles",
    formality: "weakly grammaticalized (register mostly lexical/pragmatic)",
  },
  french: {
    sentence: "SVO with fixed subject presence",
    tenseAspect: "morphological tense and compound forms",
    articles: "definite and indefinite articles",
    formality: "weakly grammaticalized (tu/vous distinction)",
  },
  german: {
    sentence: "V2 in main clauses; verb-final tendency in subordinate clauses",
    tenseAspect: "morphological tense with periphrastic aspect usage",
    articles: "definite and indefinite articles; case/gender interaction",
    formality: "weakly grammaticalized (Sie/du distinction)",
  },
  dutch: {
    sentence: "V2 in main clauses; verb-final tendency in subordinate clauses",
    tenseAspect: "morphological tense with periphrastic aspect usage",
    articles: "definite and indefinite articles",
    formality: "weakly grammaticalized (U/je distinction)",
  },
  arabic: {
    sentence: "VSO or SVO depending on style and emphasis",
    tenseAspect: "perfect vs imperfect with mood distinctions",
    articles: "definite article only",
    formality: "moderately grammaticalized",
  },
  korean: {
    sentence: "SOV, verb-final, topic-prominent tendencies",
    tenseAspect: "suffix-based tense/aspect with endings",
    articles: "no true article system; particles/case markers instead",
    formality: "highly grammaticalized",
  },
  japanese: {
    sentence: "SOV, verb-final, topic-prominent tendencies",
    tenseAspect: "past/non-past with aspect auxiliaries",
    articles: "no true article system; particles and context instead",
    formality: "highly grammaticalized",
  },
  hindi: {
    sentence: "SOV with postpositions and flexible topicalization",
    tenseAspect: "tense + aspect + agreement interactions",
    articles: "no true article system; demonstrative-like determiners instead",
    formality: "moderately grammaticalized",
  },
  chinese: {
    sentence: "SVO with topic-prominent discourse patterns",
    tenseAspect: "no tense inflection; aspect particles and time adverbs",
    articles: "no true article system; classifiers/measure words instead",
    formality: "weakly grammaticalized (mostly lexical/pragmatic)",
  },
};

const NON_LATIN_SCRIPT_REGEX = {
  arabic: /[\u0600-\u06FF]/u,
  chinese: /[\u4E00-\u9FFF]/u,
  japanese: /[\u3040-\u30FF\u4E00-\u9FFF]/u,
  korean: /[\uAC00-\uD7AF]/u,
  hindi: /[\u0900-\u097F]/u,
};

const SECTION_FORBIDDEN_PATTERNS = {
  chinese: {
    "Formality & Style": [/时间副词/u, /完成体/u, /量词/u, /主谓宾/u],
  },
  hindi: {
    "Formality & Style": [/वाक्य संरचना/u, /संज्ञा की/u],
  },
};

const hasEnglishSourceMarkers = (card) =>
  !!normalize(card?.sourceTitle) ||
  !!normalize(card?.sourceExample) ||
  (Array.isArray(card?.sourcePoints) && card.sourcePoints.length > 0) ||
  (Array.isArray(card?.mistakes) &&
    card.mistakes.some(
      (mistake) => !!normalize(mistake?.sourceWrong) || !!normalize(mistake?.sourceFix)
    ));

const normalizeRuleOrder = (value) => {
  if (Array.isArray(value)) {
    return value
      .map((item) => normalize(item))
      .filter(Boolean)
      .slice(0, 6);
  }
  const raw = normalize(value);
  if (!raw) {
    return [];
  }
  return raw
    .split(/\s*(?:\+|→|->|>|\/|\|)\s*/g)
    .map((item) => normalize(item))
    .filter(Boolean)
    .slice(0, 6);
};

const sanitizeExampleHighlights = (highlights, exampleText = "") => {
  if (!Array.isArray(highlights)) {
    return [];
  }
  const normalizedExample = normalize(exampleText);
  return highlights
    .map((entry) => ({
      label: normalize(entry?.label || entry?.slot || ""),
      text: normalize(entry?.text || ""),
    }))
    .filter((entry) => entry.label && entry.text)
    .filter((entry) =>
      normalizedExample ? normalizedExample.includes(entry.text) : true
    )
    .slice(0, 6);
};

const uniqueNonEmpty = (list) => {
  const seen = new Set();
  const output = [];
  for (const raw of list) {
    const value = normalize(raw);
    if (!value) {
      continue;
    }
    const key = normalizeKey(value);
    if (seen.has(key)) {
      continue;
    }
    seen.add(key);
    output.push(value);
  }
  return output;
};

const deriveSlotLabel = (text) => {
  const raw = normalize(text);
  if (!raw) {
    return "";
  }
  const compact = raw
    .split(/[,:;()]/)[0]
    .split(/\s+/)
    .slice(0, 4)
    .join(" ")
    .trim();
  return compact || raw.slice(0, 24).trim();
};

const splitExampleIntoSegments = (exampleText, segmentCount) => {
  const example = normalize(exampleText);
  if (!example || !Number.isFinite(segmentCount) || segmentCount < 1) {
    return [];
  }
  const segments = [];
  let start = 0;
  for (let i = 0; i < segmentCount; i += 1) {
    let end =
      i === segmentCount - 1
        ? example.length
        : Math.round(((i + 1) * example.length) / segmentCount);
    if (/\s/.test(example) && end < example.length) {
      const prevSpace = example.lastIndexOf(" ", end);
      const nextSpace = example.indexOf(" ", end);
      const prevDistance = prevSpace > start ? Math.abs(end - prevSpace) : Number.POSITIVE_INFINITY;
      const nextDistance = nextSpace > end ? Math.abs(nextSpace - end) : Number.POSITIVE_INFINITY;
      if (prevDistance <= nextDistance && Number.isFinite(prevDistance)) {
        end = prevSpace;
      } else if (Number.isFinite(nextDistance)) {
        end = nextSpace;
      }
    }
    if (end <= start) {
      end = Math.min(example.length, start + 1);
    }
    let part = example.slice(start, end).trim();
    if (!part) {
      part = example.slice(start, Math.min(example.length, start + 1)).trim();
    }
    if (!part && start < example.length) {
      part = example.slice(start).trim();
    }
    if (part) {
      segments.push(part);
      const nextIndex = example.indexOf(part, start);
      start = nextIndex >= 0 ? nextIndex + part.length : end;
    } else {
      segments.push(example);
      start = example.length;
    }
  }
  return segments.slice(0, segmentCount);
};

const alignExampleHighlights = (ruleOrder, rawHighlights, exampleText) => {
  const example = normalize(exampleText);
  if (!ruleOrder.length || !example) {
    return [];
  }
  const pool = [...rawHighlights];
  const usedIndexes = new Set();
  const matchedTexts = ruleOrder.map((slot) => {
    const slotKey = normalizeKey(slot);
    let pickedIndex = pool.findIndex((entry, idx) => {
      if (usedIndexes.has(idx)) {
        return false;
      }
      const entryKey = normalizeKey(entry.label);
      return entryKey === slotKey || entryKey.includes(slotKey) || slotKey.includes(entryKey);
    });
    if (pickedIndex < 0) {
      pickedIndex = pool.findIndex((_, idx) => !usedIndexes.has(idx));
    }
    if (pickedIndex < 0) {
      return "";
    }
    usedIndexes.add(pickedIndex);
    return normalize(pool[pickedIndex].text);
  });

  const fallbackSegments = splitExampleIntoSegments(example, ruleOrder.length);
  const finalHighlights = [];
  let fromIndex = 0;
  for (let i = 0; i < ruleOrder.length; i += 1) {
    const slotLabel = ruleOrder[i];
    const minTailChars = ruleOrder.length - i - 1;
    const candidate = normalize(matchedTexts[i]);
    let text = "";
    if (candidate) {
      const candidateIndex = example.indexOf(candidate, fromIndex);
      if (
        candidateIndex >= 0 &&
        example.length - (candidateIndex + candidate.length) >= minTailChars
      ) {
        text = candidate;
        fromIndex = candidateIndex + candidate.length;
      }
    }
    if (!text) {
      const fallback = normalize(fallbackSegments[i]);
      let fallbackIndex = fallback ? example.indexOf(fallback, fromIndex) : -1;
      if (
        fallback &&
        fallbackIndex >= 0 &&
        example.length - (fallbackIndex + fallback.length) >= minTailChars
      ) {
        text = fallback;
        fromIndex = fallbackIndex + fallback.length;
      } else {
        const maxEnd = Math.max(fromIndex + 1, example.length - minTailChars);
        let snippet = example.slice(fromIndex, maxEnd).trim();
        if (!snippet) {
          snippet = example.slice(fromIndex, Math.min(example.length, fromIndex + 1)).trim();
        }
        if (!snippet) {
          const safeStart = Math.max(0, example.length - (minTailChars + 1));
          const safeEnd = Math.max(safeStart + 1, example.length - minTailChars);
          snippet = example.slice(safeStart, safeEnd).trim();
          fromIndex = safeStart;
        }
        text = snippet || example.slice(0, 1);
        const snippetIndex = example.indexOf(text, fromIndex);
        fromIndex = (snippetIndex >= 0 ? snippetIndex : fromIndex) + text.length;
      }
    }
    finalHighlights.push({ label: slotLabel, text });
  }
  return finalHighlights;
};

const cleanCard = (card) => {
  const points = (Array.isArray(card?.points) ? card.points : [])
    .map((point) => normalize(point))
    .filter(Boolean)
    .slice(0, 3);
  const mistakes = (Array.isArray(card?.mistakes) ? card.mistakes : [])
    .map((mistake) => ({
      wrong: normalize(mistake?.wrong),
      fix: normalize(mistake?.fix),
    }))
    .filter((mistake) => mistake.wrong && mistake.fix)
    .slice(0, 1);
  const example = normalize(card?.example);
  let ruleOrder = normalizeRuleOrder(card?.ruleOrder);
  const sanitizedHighlights = sanitizeExampleHighlights(card?.exampleHighlights, example);
  if (ruleOrder.length < 2) {
    ruleOrder = uniqueNonEmpty(sanitizedHighlights.map((entry) => entry.label)).slice(0, 6);
  }
  if (ruleOrder.length < 2) {
    ruleOrder = uniqueNonEmpty(points.map((point) => deriveSlotLabel(point))).slice(0, 6);
  }
  if (ruleOrder.length < 2 && example) {
    ruleOrder = splitExampleIntoSegments(example, 2).map((segment) => deriveSlotLabel(segment));
  }
  ruleOrder = uniqueNonEmpty(ruleOrder).slice(0, 6);
  const exampleHighlights = alignExampleHighlights(ruleOrder, sanitizedHighlights, example);
  return {
    title: normalize(card?.title),
    points,
    example,
    ruleOrder,
    exampleHighlights,
    mistakes,
  };
};

const flattenCardText = (card) => {
  const parts = [card.title, card.example];
  card.ruleOrder.forEach((item) => parts.push(item));
  card.exampleHighlights.forEach((entry) => {
    parts.push(entry.label);
    parts.push(entry.text);
  });
  card.points.forEach((point) => parts.push(point));
  card.mistakes.forEach((mistake) => {
    parts.push(mistake.wrong);
    parts.push(mistake.fix);
  });
  return parts.join(" ");
};

const hasSubstantiveText = (value) =>
  /[A-Za-z0-9\u00C0-\u024F\u0370-\u03FF\u0400-\u04FF\u0590-\u05FF\u0600-\u06FF\u0900-\u097F\u3040-\u30FF\u3400-\u9FFF\uAC00-\uD7AF]/u.test(
    normalize(value)
  );

const validateSectionPayload = (payload, expectedCount, worldKey, sectionName = "") => {
  if (!payload || typeof payload !== "object") {
    return "Payload is not an object";
  }
  if (!normalize(payload.sectionLabel)) {
    return "Missing sectionLabel";
  }
  if (!Array.isArray(payload.cards)) {
    return "Missing cards array";
  }
  if (payload.cards.length !== expectedCount) {
    return `Expected ${expectedCount} cards, received ${payload.cards.length}`;
  }

  const seenTitles = new Set();
  for (let index = 0; index < payload.cards.length; index += 1) {
    const card = cleanCard(payload.cards[index]);
    if (!card.title) {
      return `Card ${index + 1}: missing title`;
    }
    const normalizedTitle = normalizeKey(card.title);
    if (seenTitles.has(normalizedTitle)) {
      return `Card ${index + 1}: duplicate title`;
    }
    seenTitles.add(normalizedTitle);

    if (!Array.isArray(card.points) || card.points.length < 2) {
      return `Card ${index + 1}: invalid points`;
    }
    if (!card.example) {
      return `Card ${index + 1}: missing example`;
    }
    if (!Array.isArray(card.ruleOrder) || card.ruleOrder.length < 2) {
      return `Card ${index + 1}: missing ruleOrder`;
    }
    if (!Array.isArray(card.exampleHighlights) || card.exampleHighlights.length < 2) {
      return `Card ${index + 1}: missing exampleHighlights`;
    }
    if (card.exampleHighlights.length !== card.ruleOrder.length) {
      return `Card ${index + 1}: ruleOrder and exampleHighlights length mismatch`;
    }
    for (const highlight of card.exampleHighlights) {
      if (!hasSubstantiveText(highlight.text)) {
        return `Card ${index + 1}: highlight '${highlight.text}' is not substantive`;
      }
    }
    let fromIndex = 0;
    for (const highlight of card.exampleHighlights) {
      const nextIndex = card.example.indexOf(highlight.text, fromIndex);
      if (nextIndex < 0) {
        return `Card ${index + 1}: highlight '${highlight.text}' not found in example`;
      }
      fromIndex = nextIndex + highlight.text.length;
    }
    if (!Array.isArray(card.mistakes) || card.mistakes.length < 1) {
      return `Card ${index + 1}: missing mistakes`;
    }

    const text = flattenCardText(card);
    if (sectionName === "Formality & Style") {
      if (/\b(SVO|SOV|VSO|V2)\b/.test(text)) {
        return `Card ${index + 1}: formality section contains sentence-order marker`;
      }
    }
    const sectionForbidden =
      SECTION_FORBIDDEN_PATTERNS?.[worldKey]?.[sectionName] || [];
    for (const pattern of sectionForbidden) {
      if (pattern.test(text)) {
        return `Card ${index + 1}: contains section-forbidden pattern '${pattern}'`;
      }
    }
    if (NON_LATIN_SCRIPT_REGEX[worldKey]) {
      const latinChunks = text.match(/[A-Za-z]{4,}/g) || [];
      const disallowedLatin = latinChunks.filter(
        (token) => !["SVO", "SOV", "V2", "VSO"].includes(token)
      );
      if (disallowedLatin.length) {
        return `Card ${index + 1}: contains non-allowed Latin token '${disallowedLatin[0]}'`;
      }
    }
    const forbidden = LANGUAGE_RULES[worldKey]?.forbiddenPatterns || [];
    for (const pattern of forbidden) {
      if (pattern.test(text)) {
        return `Card ${index + 1}: contains forbidden pattern '${pattern}'`;
      }
    }
  }

  const scriptPattern = NON_LATIN_SCRIPT_REGEX[worldKey];
  if (scriptPattern) {
    const merged = payload.cards.map((card) => flattenCardText(cleanCard(card))).join(" ");
    if (!scriptPattern.test(merged)) {
      return "Output does not appear to use expected native script";
    }
  }
  return "";
};

const isNativeCardShape = (card, worldKey) => {
  if (!card || typeof card !== "object" || hasEnglishSourceMarkers(card)) {
    return false;
  }
  const cleaned = cleanCard(card);
  if (
    !cleaned.title ||
    cleaned.points.length < 2 ||
    !cleaned.example ||
    cleaned.ruleOrder.length < 2 ||
    cleaned.exampleHighlights.length !== cleaned.ruleOrder.length ||
    cleaned.mistakes.length < 1
  ) {
    return false;
  }
  const forbidden = LANGUAGE_RULES[worldKey]?.forbiddenPatterns || [];
  const text = flattenCardText(cleaned);
  return !forbidden.some((pattern) => pattern.test(text));
};

const tryParseJsonObject = (rawContent) => {
  const content = normalize(rawContent);
  if (!content) {
    return null;
  }
  try {
    return JSON.parse(content);
  } catch (_) {
    const start = content.indexOf("{");
    const end = content.lastIndexOf("}");
    if (start >= 0 && end > start) {
      const candidate = content.slice(start, end + 1);
      try {
        return JSON.parse(candidate);
      } catch (_) {
        return null;
      }
    }
    return null;
  }
};

const buildSectionLogicNotes = (worldKey, sectionName) => {
  const profile = LANGUAGE_PROFILES[worldKey];
  if (!profile) {
    return [];
  }
  if (sectionName === "Sentence Structure") {
    return [
      `Respect this language profile for sentence order: ${profile.sentence}.`,
      "Do not import another language's canonical order as the default rule.",
    ];
  }
  if (sectionName === "Tenses & Aspect") {
    return [
      `Respect this language profile for tense/aspect: ${profile.tenseAspect}.`,
      "If tense inflection is weak or absent, explain native alternatives clearly.",
    ];
  }
  if (sectionName === "Nouns & Articles") {
    return [
      `Respect this language profile for noun/article system: ${profile.articles}.`,
      "If there is no true article system, teach native determiners/classifiers/particles instead of forcing articles.",
    ];
  }
  if (sectionName === "Formality & Style") {
    return [
      `Respect this language profile for formality: ${profile.formality}.`,
      "Do not overstate politeness morphology in languages where it is mostly lexical/pragmatic.",
    ];
  }
  return [];
};

const buildSectionConstraints = (worldKey, sectionName) => {
  const profile = LANGUAGE_PROFILES[worldKey];
  const constraints = [];
  if (!profile) {
    return constraints;
  }
  if (sectionName === "Sentence Structure") {
    constraints.push(`Use this as baseline order logic: ${profile.sentence}.`);
    if (/V2/i.test(profile.sentence)) {
      constraints.push("Explicitly teach V2 in main clauses and verb-final tendency in subordinate clauses.");
    }
    if (/SOV/i.test(profile.sentence)) {
      constraints.push("Explicitly teach verb-final clause structure in core examples.");
    }
    if (/VSO/i.test(profile.sentence)) {
      constraints.push("Show how VSO and SVO differ in emphasis/register where relevant.");
    }
  }
  if (sectionName === "Tenses & Aspect") {
    constraints.push(`Use this tense/aspect logic: ${profile.tenseAspect}.`);
    if (/no tense inflection/i.test(profile.tenseAspect)) {
      constraints.push("Do not teach tense conjugation paradigms; teach aspect particles/adverbs instead.");
    }
    if (/perfect vs imperfect/i.test(profile.tenseAspect)) {
      constraints.push("Teach perfect vs imperfect distinction explicitly in at least one card.");
    }
  }
  if (sectionName === "Nouns & Articles") {
    constraints.push(`Use this noun/article logic: ${profile.articles}.`);
    if (/no true article system/i.test(profile.articles)) {
      constraints.push("Never present this language as having a full definite/indefinite article paradigm.");
      constraints.push("Teach the actual native system (particles, classifiers, determiners, or postpositions).");
    }
    if (/definite article only/i.test(profile.articles)) {
      constraints.push("State that only definiteness marking is grammaticalized, not an indefinite article pair.");
    }
  }
  if (sectionName === "Formality & Style") {
    constraints.push(`Use this formality logic: ${profile.formality}.`);
    constraints.push(
      "This section must stay about politeness/register/style. Do not teach sentence order, tense morphology, or article systems here."
    );
    if (/highly grammaticalized/i.test(profile.formality)) {
      constraints.push("Teach grammatical politeness mechanisms (speech levels, honorific forms, endings).");
    } else if (/moderately grammaticalized/i.test(profile.formality)) {
      constraints.push("Teach both grammatical and lexical politeness strategies without exaggeration.");
    } else {
      constraints.push("Teach register mostly through lexical/pragmatic choices; avoid inventing obligatory honorific morphology.");
    }
  }
  return constraints;
};

const createPromptPayload = ({ worldKey, worldLanguage, sectionName, cardCount, draftCards = null }) => {
  const languageRules = LANGUAGE_RULES[worldKey] || { focus: [], avoid: [] };
  const sectionLogicNotes = buildSectionLogicNotes(worldKey, sectionName);
  const sectionConstraints = buildSectionConstraints(worldKey, sectionName);
  return {
    targetLanguage: worldLanguage,
    sectionName,
    cardCount,
    mission:
      "Create premium, pedagogically accurate grammar cards that sound like they were designed by expert native linguists for this language.",
    progression:
      "Cards must progress from beginner-friendly use to more advanced nuance inside the section.",
    sectionAdaptationHint:
      SECTION_ADAPTATION_HINTS[sectionName] ||
      "Adapt this section to native grammar logic instead of copying English categories.",
    structuralProfile: LANGUAGE_PROFILES[worldKey] || null,
    sectionLogicMustRespect: sectionLogicNotes,
    languageSpecificFocus: languageRules.focus,
    languageSpecificAvoid: languageRules.avoid,
    constraints: [
      "All text must be in target language only.",
      "Never rely on English-only grammar logic that does not naturally belong to the target language.",
      "Do not include English glosses or parenthetical English translations. Allowed abbreviations: SVO, SOV, V2, VSO.",
      "Each card title must be concise, professional, and specific.",
      "Each card must include practical teaching points usable in real communication.",
      "Each card must define ruleOrder as 2-6 ordered slots (e.g., subject + verb + object in target-language terms).",
      "Each card must define exampleHighlights with the exact same number and order as ruleOrder.",
      "Each exampleHighlights.text must be an exact substring of example, in left-to-right order.",
      "Each exampleHighlights.text must contain real lexical content (letters/numbers), not only punctuation.",
      "Each card must include one realistic example sentence and one common mistake with corrected version.",
      "Do not output sourceTitle, sourceExample, sourcePoints, sourceWrong, or sourceFix.",
      "Avoid repetitive cards and avoid duplicate titles.",
      ...sectionConstraints,
    ],
    outputSchema: {
      sectionLabel: "string",
      cards: [
        {
          title: "string",
          points: ["string", "string", "string"],
          example: "string",
          ruleOrder: ["string", "string", "string"],
          exampleHighlights: [
            { label: "string", text: "string" },
            { label: "string", text: "string" },
            { label: "string", text: "string" },
          ],
          mistakes: [{ wrong: "string", fix: "string" }],
        },
      ],
    },
    draftCards,
  };
};

const buildGenerationRequest = ({ worldKey, worldLanguage, sectionName, cardCount }) => ({
  model: MODEL,
  temperature: TEMPERATURE_CREATE,
  max_tokens: 4200,
  response_format: { type: "json_object" },
  messages: [
    {
      role: "system",
      content:
        "You are a senior native linguist and grammar curriculum architect. Return JSON only.",
    },
    {
      role: "user",
      content: JSON.stringify(
        createPromptPayload({ worldKey, worldLanguage, sectionName, cardCount, draftCards: null })
      ),
    },
  ],
});

const buildReviewRequest = ({ worldKey, worldLanguage, sectionName, cardCount, draftCards }) => ({
  model: MODEL,
  temperature: TEMPERATURE_REVIEW,
  max_tokens: 4200,
  response_format: { type: "json_object" },
  messages: [
    {
      role: "system",
      content:
        "You are the lead native linguist reviewer. Audit and polish curriculum quality. Return JSON only.",
    },
    {
      role: "user",
      content: JSON.stringify({
        ...createPromptPayload({ worldKey, worldLanguage, sectionName, cardCount, draftCards }),
        reviewTask:
          "Rewrite any card that feels translated, unnatural, non-native, or based on English-only grammar assumptions.",
      }),
    },
  ],
});

const requestSection = async ({ worldKey, worldLanguage, sectionName, cardCount, draftCards }) => {
  const request =
    draftCards && REVIEW_PASS
      ? buildReviewRequest({ worldKey, worldLanguage, sectionName, cardCount, draftCards })
      : buildGenerationRequest({ worldKey, worldLanguage, sectionName, cardCount });
  const response = await client.chat.completions.create(request);
  const content = normalize(response?.choices?.[0]?.message?.content);
  if (!content) {
    throw new Error("Empty model response");
  }
  const parsed = tryParseJsonObject(content);
  if (!parsed) {
    throw new Error("Failed to parse JSON response");
  }
  const validationError = validateSectionPayload(parsed, cardCount, worldKey, sectionName);
  if (validationError) {
    throw new Error(validationError);
  }
  return {
    sectionLabel: normalize(parsed.sectionLabel),
    cards: parsed.cards.map(cleanCard),
  };
};

const generateNativeSection = async ({ worldKey, worldLanguage, sectionName, cardCount }) => {
  for (let attempt = 1; attempt <= MAX_RETRIES; attempt += 1) {
    try {
      const draft = await requestSection({
        worldKey,
        worldLanguage,
        sectionName,
        cardCount,
        draftCards: null,
      });
      if (!REVIEW_PASS) {
        return draft;
      }
      const reviewed = await requestSection({
        worldKey,
        worldLanguage,
        sectionName,
        cardCount,
        draftCards: draft.cards,
      });
      return reviewed;
    } catch (error) {
      if (attempt >= MAX_RETRIES) {
        throw error;
      }
      await sleep(260 + attempt * 220);
    }
  }
  throw new Error(`Failed to generate section ${sectionName}`);
};

const runForWorld = async (worldKey) => {
  const worldLanguage = WORLD_LANGUAGE_LABELS[worldKey] || worldKey;
  const worldFile = path.join(ROOT, "frontend", "worlds", worldKey, "translations.json");
  if (!fs.existsSync(worldFile)) {
    throw new Error(`Missing world pack: ${worldFile}`);
  }
  const raw = fs.readFileSync(worldFile, "utf8");
  const data = JSON.parse(raw);

  if (!data.grammar || typeof data.grammar !== "object") {
    data.grammar = {};
  }
  if (!data.grammar.cards || typeof data.grammar.cards !== "object") {
    data.grammar.cards = {};
  }
  if (!data.grammar.sectionLabels || typeof data.grammar.sectionLabels !== "object") {
    data.grammar.sectionLabels = {};
  }
  data.grammar.titles = {};
  data.grammar.examples = {};
  data.grammar.explanations = {};

  for (const sectionName of TARGET_SECTIONS) {
    const targetCount = Array.isArray(GRAMMAR_SECTION_LISTS[sectionName])
      ? GRAMMAR_SECTION_LISTS[sectionName].length
      : 0;
    if (!targetCount) {
      continue;
    }

    const existingCards = Array.isArray(data.grammar.cards[sectionName])
      ? data.grammar.cards[sectionName]
      : [];
    const nativeReady =
      existingCards.length === targetCount &&
      existingCards.every((card) => isNativeCardShape(card, worldKey));
    if (!FORCE_REWRITE && nativeReady) {
      console.log(`[${worldKey}] Skipping ${sectionName}: already native-ready`);
      continue;
    }

    console.log(
      `[${worldKey}] Generating ${sectionName} (${targetCount} cards) with premium QA`
    );
    const generated = await generateNativeSection({
      worldKey,
      worldLanguage,
      sectionName,
      cardCount: targetCount,
    });
    data.grammar.sectionLabels[sectionName] = generated.sectionLabel;
    data.grammar.cards[sectionName] = generated.cards;
    fs.writeFileSync(worldFile, JSON.stringify(data, null, 2), "utf8");
    await sleep(REQUEST_DELAY_MS);
  }

  data.generatedAt = new Date().toISOString();
  fs.writeFileSync(worldFile, JSON.stringify(data, null, 2), "utf8");
  console.log(`[${worldKey}] Saved native grammar pack: ${worldFile}`);
};

const run = async () => {
  console.log(
    `Native grammar generation start | model=${MODEL} | reviewPass=${REVIEW_PASS} | forceRewrite=${FORCE_REWRITE} | sections=${TARGET_SECTIONS.join(" | ")}`
  );
  for (const worldKey of REQUESTED_WORLD_KEYS) {
    await runForWorld(worldKey);
  }
  console.log("Native grammar generation completed for all requested worlds.");
};

run().catch((error) => {
  console.error("Native grammar generation failed:", error.message || error);
  process.exit(1);
});
