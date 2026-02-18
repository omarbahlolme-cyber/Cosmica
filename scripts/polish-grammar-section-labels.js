/* ==========================================================================
   GRAMMAR SECTION LABEL POLISHER
   Localizes grammar section labels so non-English worlds do not keep
   English headings in the map UI.
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
  if (!raw || raw === "all") {
    return [...ALL_WORLD_KEYS];
  }
  return [...new Set(raw.split(",").map((item) => item.trim()).filter(Boolean))];
};

const REQUESTED_WORLD_KEYS = parseWorldKeys(process.env.WORLD_KEY || process.env.WORLD_LANGUAGE);
const unknownWorlds = REQUESTED_WORLD_KEYS.filter((key) => !WORLD_LANGUAGE_LABELS[key]);
if (unknownWorlds.length) {
  console.error(`Unknown WORLD_KEY values: ${unknownWorlds.join(", ")}`);
  process.exit(1);
}

const apiKey = process.env.OPENAI_TRANSLATE_KEY || process.env.OPENAI_API_KEY;
if (!apiKey) {
  console.error("Missing OPENAI_TRANSLATE_KEY or OPENAI_API_KEY");
  process.exit(1);
}

const MODEL = process.env.OPENAI_TRANSLATE_MODEL || process.env.OPENAI_MODEL || "gpt-4o-mini";
const MAX_RETRIES = Number(process.env.NATIVE_LABEL_RETRIES || 4);
const APPLY_FALLBACK_ONLY = String(process.env.NATIVE_LABEL_FALLBACK_ONLY || "1") === "1";
const APPLY_ALL_SECTIONS = String(process.env.NATIVE_LABEL_APPLY_ALL || "1") === "1";
const ROOT = path.join(__dirname, "..");
const mapsPath = path.join(ROOT, "frontend", "maps", "app-maps.js");
const mapsSource = fs.readFileSync(mapsPath, "utf8");
const sectionMatch = mapsSource.match(/const GRAMMAR_SECTION_LISTS = ({[\s\S]*?});/);
if (!sectionMatch) {
  throw new Error("Unable to extract GRAMMAR_SECTION_LISTS from frontend/maps/app-maps.js");
}
const GRAMMAR_SECTION_ORDER = Object.keys(vm.runInNewContext(`(${sectionMatch[1]})`));

const client = new OpenAI({ apiKey });
const normalize = (value) => String(value || "").trim();

const SECTION_LABEL_FALLBACKS = {
  french: {
    "Sentence Structure": "Structure de phrase",
    Verbs: "Verbes",
    "Tenses & Aspect": "Temps et aspect",
    "Nouns & Articles": "Noms et articles",
    "Pronouns & Reference": "Pronoms et référence",
    Modifiers: "Modificateurs",
    Questions: "Interrogation",
    Negation: "Négation",
    Connections: "Connecteurs",
    Conditions: "Phrases conditionnelles",
    "Voice & Focus": "Voix et focalisation",
    Modality: "Modalité",
    "Reported Speech": "Discours rapporté",
    "Formality & Style": "Registre et style",
    "Discourse & Flow": "Cohérence du discours",
  },
  german: {
    "Sentence Structure": "Satzbau",
    Verbs: "Verben",
    "Tenses & Aspect": "Tempus und Aspekt",
    "Nouns & Articles": "Nomen und Artikel",
    "Pronouns & Reference": "Pronomen und Referenz",
    Modifiers: "Modifikatoren",
    Questions: "Fragesätze",
    Negation: "Verneinung",
    Connections: "Konnektoren",
    Conditions: "Konditionalsätze",
    "Voice & Focus": "Diathese und Fokus",
    Modality: "Modalität",
    "Reported Speech": "Indirekte Rede",
    "Formality & Style": "Register und Stil",
    "Discourse & Flow": "Diskurs und Kohärenz",
  },
  spanish: {
    "Sentence Structure": "Estructura oracional",
    Verbs: "Verbos",
    "Tenses & Aspect": "Tiempos y aspecto",
    "Nouns & Articles": "Sustantivos y artículos",
    "Pronouns & Reference": "Pronombres y referencia",
    Modifiers: "Modificadores",
    Questions: "Interrogación",
    Negation: "Negación",
    Connections: "Conectores",
    Conditions: "Condicionales",
    "Voice & Focus": "Voz y foco",
    Modality: "Modalidad",
    "Reported Speech": "Estilo indirecto",
    "Formality & Style": "Registro y estilo",
    "Discourse & Flow": "Discurso y fluidez",
  },
  portuguese: {
    "Sentence Structure": "Estrutura frasal",
    Verbs: "Verbos",
    "Tenses & Aspect": "Tempos e aspecto",
    "Nouns & Articles": "Substantivos e artigos",
    "Pronouns & Reference": "Pronomes e referência",
    Modifiers: "Modificadores",
    Questions: "Interrogação",
    Negation: "Negação",
    Connections: "Conectores",
    Conditions: "Condicionais",
    "Voice & Focus": "Voz e foco",
    Modality: "Modalidade",
    "Reported Speech": "Discurso indireto",
    "Formality & Style": "Registro e estilo",
    "Discourse & Flow": "Discurso e fluidez",
  },
  dutch: {
    "Sentence Structure": "Zinsstructuur",
    Verbs: "Werkwoorden",
    "Tenses & Aspect": "Tijden en aspect",
    "Nouns & Articles": "Zelfstandige naamwoorden en lidwoorden",
    "Pronouns & Reference": "Voornaamwoorden en verwijzing",
    Modifiers: "Modificatie",
    Questions: "Vraagzinnen",
    Negation: "Ontkenning",
    Connections: "Verbindingswoorden",
    Conditions: "Voorwaardelijke zinnen",
    "Voice & Focus": "Stem en focus",
    Modality: "Modaliteit",
    "Reported Speech": "Indirecte rede",
    "Formality & Style": "Register en stijl",
    "Discourse & Flow": "Tekstverband en samenhang",
  },
  swedish: {
    "Sentence Structure": "Meningsbyggnad",
    Verbs: "Verb",
    "Tenses & Aspect": "Tempus och aspekt",
    "Nouns & Articles": "Substantiv och artiklar",
    "Pronouns & Reference": "Pronomen och referens",
    Modifiers: "Modifikation",
    Questions: "Frågor",
    Negation: "Nekande former",
    Connections: "Sambandsord",
    Conditions: "Villkorssatser",
    "Voice & Focus": "Diates och fokus",
    Modality: "Modalitet",
    "Reported Speech": "Indirekt tal",
    "Formality & Style": "Register och stil",
    "Discourse & Flow": "Diskurs och flyt",
  },
  arabic: {
    "Sentence Structure": "بنية الجملة",
    Verbs: "الأفعال",
    "Tenses & Aspect": "الزمن والجانب",
    "Nouns & Articles": "الأسماء وأدوات التعريف",
    "Pronouns & Reference": "الضمائر والإحالة",
    Modifiers: "النعت والتعديل",
    Questions: "الاستفهام",
    Negation: "النفي",
    Connections: "أدوات الربط",
    Conditions: "الشرط",
    "Voice & Focus": "الصيغة والتركيز",
    Modality: "الدلالة والاحتمال",
    "Reported Speech": "الكلام المنقول",
    "Formality & Style": "الرسمية والأسلوب",
    "Discourse & Flow": "ترابط الخطاب",
  },
  chinese: {
    "Sentence Structure": "句法结构",
    Verbs: "动词系统",
    "Tenses & Aspect": "体貌表达",
    "Nouns & Articles": "名词与量词",
    "Pronouns & Reference": "代词与指代",
    Modifiers: "修饰成分",
    Questions: "疑问表达",
    Negation: "否定表达",
    Connections: "连接关系",
    Conditions: "条件表达",
    "Voice & Focus": "语态与焦点",
    Modality: "情态表达",
    "Reported Speech": "转述表达",
    "Formality & Style": "语体与风格",
    "Discourse & Flow": "语篇衔接",
  },
  japanese: {
    "Sentence Structure": "文の構造",
    Verbs: "動詞",
    "Tenses & Aspect": "時制とアスペクト",
    "Nouns & Articles": "名詞と助詞",
    "Pronouns & Reference": "代名詞と指示",
    Modifiers: "修飾表現",
    Questions: "疑問表現",
    Negation: "否定表現",
    Connections: "接続表現",
    Conditions: "条件表現",
    "Voice & Focus": "態と焦点",
    Modality: "モダリティ",
    "Reported Speech": "引用と間接話法",
    "Formality & Style": "敬体と文体",
    "Discourse & Flow": "談話と流れ",
  },
  korean: {
    "Sentence Structure": "문장 구조",
    Verbs: "동사",
    "Tenses & Aspect": "시제와 상",
    "Nouns & Articles": "명사와 조사",
    "Pronouns & Reference": "대명사와 지시",
    Modifiers: "수식 표현",
    Questions: "의문 표현",
    Negation: "부정 표현",
    Connections: "연결 표현",
    Conditions: "조건 표현",
    "Voice & Focus": "태와 초점",
    Modality: "양태 표현",
    "Reported Speech": "간접 인용",
    "Formality & Style": "격식과 문체",
    "Discourse & Flow": "담화와 흐름",
  },
  hindi: {
    "Sentence Structure": "वाक्य संरचना",
    Verbs: "क्रियाएँ",
    "Tenses & Aspect": "काल और पक्ष",
    "Nouns & Articles": "संज्ञा और निर्धारक",
    "Pronouns & Reference": "सर्वनाम और संदर्भ",
    Modifiers: "विशेषण और क्रिया विशेषण",
    Questions: "प्रश्न संरचना",
    Negation: "निषेध",
    Connections: "संयोजक",
    Conditions: "शर्तें",
    "Voice & Focus": "वाच्य और फोकस",
    Modality: "भाव और संभावना",
    "Reported Speech": "परोक्ष कथन",
    "Formality & Style": "औपचारिकता और शैली",
    "Discourse & Flow": "विमर्श और प्रवाह",
  },
};

const isUnlocalized = (label, englishSection) =>
  !normalize(label) || normalize(label).toLowerCase() === normalize(englishSection).toLowerCase();

const buildRequest = ({ worldLanguage, englishSection, sampleTitles }) => ({
  model: MODEL,
  temperature: 0.2,
  max_tokens: 220,
  response_format: { type: "json_object" },
  messages: [
    {
      role: "system",
      content:
        "You are a native linguist UI copywriter for language-learning products. Return JSON only.",
    },
    {
      role: "user",
      content: JSON.stringify({
        targetLanguage: worldLanguage,
        task:
          "Create one localized grammar section heading in the target language for a map UI.",
        constraints: [
          "Output must be in target language only.",
          "Do not leave the heading in English.",
          "Keep it concise and professional (2-6 words).",
          "Align the heading with the section topic and sample card titles.",
        ],
        englishSection,
        sampleCardTitles: sampleTitles,
        outputSchema: { label: "string" },
      }),
    },
  ],
});

const generateLabel = async ({ worldLanguage, englishSection, sampleTitles }) => {
  for (let attempt = 1; attempt <= MAX_RETRIES; attempt += 1) {
    try {
      const response = await client.chat.completions.create(
        buildRequest({ worldLanguage, englishSection, sampleTitles })
      );
      const content = normalize(response?.choices?.[0]?.message?.content);
      if (!content) {
        throw new Error("Empty response");
      }
      const parsed = JSON.parse(content);
      const label = normalize(parsed?.label);
      if (!label) {
        throw new Error("Missing label");
      }
      if (label.toLowerCase() === englishSection.toLowerCase()) {
        throw new Error("Label remained in English");
      }
      return label;
    } catch (error) {
      if (attempt >= MAX_RETRIES) {
        throw error;
      }
    }
  }
  throw new Error(`Failed to generate label for ${englishSection}`);
};

const runForWorld = async (worldKey) => {
  const worldLanguage = WORLD_LANGUAGE_LABELS[worldKey] || worldKey;
  const worldFile = path.join(ROOT, "frontend", "worlds", worldKey, "translations.json");
  const data = JSON.parse(fs.readFileSync(worldFile, "utf8"));
  if (!data.grammar || typeof data.grammar !== "object") {
    data.grammar = {};
  }
  if (!data.grammar.sectionLabels || typeof data.grammar.sectionLabels !== "object") {
    data.grammar.sectionLabels = {};
  }
  if (!data.grammar.cards || typeof data.grammar.cards !== "object") {
    data.grammar.cards = {};
  }

  const fallbackMap = SECTION_LABEL_FALLBACKS[worldKey] || {};
  let updated = 0;
  for (const sectionName of GRAMMAR_SECTION_ORDER) {
    const currentLabel = data.grammar.sectionLabels[sectionName];
    const shouldPatch =
      APPLY_ALL_SECTIONS || isUnlocalized(currentLabel, sectionName);
    if (!shouldPatch) {
      continue;
    }

    if (APPLY_FALLBACK_ONLY) {
      const fallbackLabel = normalize(fallbackMap[sectionName]);
      if (!fallbackLabel) {
        continue;
      }
      if (normalize(currentLabel) === fallbackLabel) {
        continue;
      }
      data.grammar.sectionLabels[sectionName] = fallbackLabel;
      updated += 1;
      console.log(`[${worldKey}] ${sectionName} -> ${fallbackLabel}`);
      continue;
    }

    const sampleCards = Array.isArray(data.grammar.cards[sectionName]) ? data.grammar.cards[sectionName] : [];
    const sampleTitles = sampleCards
      .slice(0, 3)
      .map((card) => normalize(card?.title))
      .filter(Boolean);
    let localizedLabel = "";
    try {
      localizedLabel = await generateLabel({
        worldLanguage,
        englishSection: sectionName,
        sampleTitles,
      });
    } catch (_) {
      localizedLabel = normalize(SECTION_LABEL_FALLBACKS?.[worldKey]?.[sectionName]);
    }
    if (!localizedLabel || localizedLabel.toLowerCase() === sectionName.toLowerCase()) {
      localizedLabel = normalize(fallbackMap[sectionName]);
    }
    if (!localizedLabel || localizedLabel.toLowerCase() === sectionName.toLowerCase()) {
      throw new Error(`[${worldKey}] Unable to localize section label for '${sectionName}'`);
    }
    data.grammar.sectionLabels[sectionName] = localizedLabel;
    updated += 1;
    console.log(`[${worldKey}] ${sectionName} -> ${localizedLabel}`);
  }

  if (updated > 0) {
    data.generatedAt = new Date().toISOString();
    fs.writeFileSync(worldFile, JSON.stringify(data, null, 2), "utf8");
    console.log(`[${worldKey}] Updated ${updated} section labels.`);
  } else {
    console.log(`[${worldKey}] No section label updates needed.`);
  }
};

const run = async () => {
  console.log(
    `Label polish start | model=${MODEL} | fallbackOnly=${APPLY_FALLBACK_ONLY} | applyAll=${APPLY_ALL_SECTIONS}`
  );
  for (const worldKey of REQUESTED_WORLD_KEYS) {
    await runForWorld(worldKey);
  }
  console.log("Label polish completed.");
};

run().catch((error) => {
  console.error("Label polish failed:", error.message || error);
  process.exit(1);
});
