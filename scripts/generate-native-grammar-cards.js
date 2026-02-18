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
      "Honorifics and register shifts are core grammar, not optional style notes.",
      "Aspect should use native constructions such as te-iru where relevant.",
    ],
    avoid: [
      "Do not teach article systems as if they exist.",
      "Do not frame grammar around mandatory singular/plural noun inflection.",
      "Do not teach subject-verb agreement as a central rule.",
    ],
    forbiddenPatterns: [/冠詞/u, /単数/u, /複数/u, /主語と動詞の一致/u],
  },
  korean: {
    focus: [
      "Respect SOV structure, particles, and sentence-ending systems.",
      "Speech level and politeness endings are core grammar.",
      "Teach tense/aspect through native endings and constructions.",
    ],
    avoid: [
      "Do not teach article systems as if they exist.",
      "Do not teach noun gender as a core grammatical category.",
      "Do not teach subject-verb agreement as a central rule.",
    ],
    forbiddenPatterns: [/관사/u, /명사의 성/u, /주어와 동사의 일치/u],
  },
  chinese: {
    focus: [
      "Teach aspect particles and time adverbs instead of tense inflection systems.",
      "Teach classifiers/measure words and topic-comment behavior where useful.",
      "Keep examples natural for spoken and standard written Mandarin.",
    ],
    avoid: [
      "Do not teach article systems as if they exist.",
      "Do not teach tense conjugation paradigms as if they exist.",
      "Do not force countable/uncountable English noun framing as core.",
    ],
    forbiddenPatterns: [/冠词/u, /时态/u, /可数名词/u, /不可数名词/u, /主谓一致/u],
  },
  arabic: {
    focus: [
      "Teach natural MSA-compatible grammar with clear, correct sentence patterns.",
      "Handle nominal vs verbal sentence logic accurately.",
      "Respect agreement, gender, and number in native Arabic terms.",
    ],
    avoid: [
      "Avoid importing English article logic directly.",
      "Avoid unnatural literal calques from English grammar labels.",
    ],
    forbiddenPatterns: [/المقالات التعريفية/u, /زمن المضارع المستمر/u],
  },
  hindi: {
    focus: [
      "Use natural Hindi grammar framing, including postpositions and ergativity where needed.",
      "Respect honorific and register-sensitive usage.",
    ],
    avoid: ["Do not force English article systems as active Hindi grammar."],
    forbiddenPatterns: [/आर्टिकल/u],
  },
};

const NON_LATIN_SCRIPT_REGEX = {
  arabic: /[\u0600-\u06FF]/u,
  chinese: /[\u4E00-\u9FFF]/u,
  japanese: /[\u3040-\u30FF\u4E00-\u9FFF]/u,
  korean: /[\uAC00-\uD7AF]/u,
  hindi: /[\u0900-\u097F]/u,
};

const hasEnglishSourceMarkers = (card) =>
  !!normalize(card?.sourceTitle) ||
  !!normalize(card?.sourceExample) ||
  (Array.isArray(card?.sourcePoints) && card.sourcePoints.length > 0) ||
  (Array.isArray(card?.mistakes) &&
    card.mistakes.some(
      (mistake) => !!normalize(mistake?.sourceWrong) || !!normalize(mistake?.sourceFix)
    ));

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
  return {
    title: normalize(card?.title),
    points,
    example: normalize(card?.example),
    mistakes,
  };
};

const flattenCardText = (card) => {
  const parts = [card.title, card.example];
  card.points.forEach((point) => parts.push(point));
  card.mistakes.forEach((mistake) => {
    parts.push(mistake.wrong);
    parts.push(mistake.fix);
  });
  return parts.join(" ");
};

const validateSectionPayload = (payload, expectedCount, worldKey) => {
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
    if (!Array.isArray(card.mistakes) || card.mistakes.length < 1) {
      return `Card ${index + 1}: missing mistakes`;
    }

    const text = flattenCardText(card);
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
  if (!cleaned.title || cleaned.points.length < 2 || !cleaned.example || cleaned.mistakes.length < 1) {
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

const createPromptPayload = ({ worldKey, worldLanguage, sectionName, cardCount, draftCards = null }) => {
  const languageRules = LANGUAGE_RULES[worldKey] || { focus: [], avoid: [] };
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
    languageSpecificFocus: languageRules.focus,
    languageSpecificAvoid: languageRules.avoid,
    constraints: [
      "All text must be in target language only.",
      "Never rely on English-only grammar logic that does not naturally belong to the target language.",
      "Each card title must be concise, professional, and specific.",
      "Each card must include practical teaching points usable in real communication.",
      "Each card must include one realistic example sentence and one common mistake with corrected version.",
      "Do not output sourceTitle, sourceExample, sourcePoints, sourceWrong, or sourceFix.",
      "Avoid repetitive cards and avoid duplicate titles.",
    ],
    outputSchema: {
      sectionLabel: "string",
      cards: [
        {
          title: "string",
          points: ["string", "string", "string"],
          example: "string",
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
  const validationError = validateSectionPayload(parsed, cardCount, worldKey);
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

  for (const sectionName of GRAMMAR_SECTION_ORDER) {
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
    `Native grammar generation start | model=${MODEL} | reviewPass=${REVIEW_PASS} | forceRewrite=${FORCE_REWRITE}`
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
