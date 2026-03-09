const normalize = (value) => String(value || "").trim().toLowerCase();

const rewriteWordEntry = (pack, sectionName, oldKey, { newKey, newSource }) => {
  if (!pack?.words?.[sectionName] || typeof pack.words[sectionName] !== "object") {
    return 0;
  }
  const section = pack.words[sectionName];
  if (!Object.prototype.hasOwnProperty.call(section, oldKey)) {
    return 0;
  }

  const nextKey = newKey || oldKey;
  const current = { ...(section[oldKey] || {}) };
  const oldSource = normalize(current.source);
  if (newSource) {
    current.source = newSource;
    current.translations = {
      ...(current.translations || {}),
      english: newSource,
    };
  }

  const rebuilt = {};
  Object.entries(section).forEach(([key, value]) => {
    if (key === oldKey) {
      rebuilt[nextKey] = current;
    } else {
      rebuilt[key] = value;
    }
  });
  pack.words[sectionName] = rebuilt;

  pack.worldSource = pack.worldSource || {};
  pack.worldSource.words = pack.worldSource.words || {};
  pack.worldSource.words[sectionName] = pack.worldSource.words[sectionName] || {};
  const worldSourceSection = pack.worldSource.words[sectionName];

  Object.entries(worldSourceSection).forEach(([sourceKey, worldWord]) => {
    if (worldWord === oldKey) {
      delete worldSourceSection[sourceKey];
    }
  });

  const nextSource = normalize(newSource || current.source);
  if (nextSource) {
    worldSourceSection[nextSource] = nextKey;
  } else if (oldSource) {
    worldSourceSection[oldSource] = nextKey;
  }

  return 1;
};

const REPAIRS = {
  arabic: [
    ["Questions & Connectors", "من", { newSource: "who" }],
    ["Verbs & Tenses", "كن", { newKey: "يكون" }],
    ["Verbs & Tenses", "امتلك", { newKey: "يملك" }],
    ["Verbs & Tenses", "افعل", { newKey: "يفعل" }],
    ["Verbs & Tenses", "اذهب", { newKey: "يذهب" }],
    ["Verbs & Tenses", "احصل", { newKey: "يحصل" }],
    ["Verbs & Tenses", "اصنع", { newKey: "يصنع" }],
    ["Verbs & Tenses", "خذ", { newKey: "يأخذ" }],
    ["Verbs & Tenses", "تعال", { newKey: "يأتي" }],
    ["Verbs & Tenses", "انظر", { newKey: "ينظر" }],
    ["Verbs & Tenses", "اسمع", { newKey: "يسمع" }],
    ["Verbs & Tenses", "قل", { newKey: "يقول" }],
    ["Verbs & Tenses", "اسأل", { newKey: "يسأل" }],
    ["Verbs & Tenses", "أعط", { newKey: "يعطي" }],
    ["Verbs & Tenses", "أحضر", { newKey: "يحضر" }],
    ["Verbs & Tenses", "ضع", { newKey: "يضع" }],
    ["Verbs & Tenses", "احتفظ", { newKey: "يحتفظ" }],
    ["Verbs & Tenses", "اعثر", { newKey: "يعثر" }],
    ["Verbs & Tenses", "اترك", { newKey: "يترك" }],
    ["Verbs & Tenses", "تحرك", { newKey: "يتحرك" }],
    ["Verbs & Tenses", "عش", { newKey: "يعيش" }],
    ["Verbs & Tenses", "افتح", { newKey: "يفتح" }],
    ["Verbs & Tenses", "اغلق", { newKey: "يغلق" }],
  ],
  chinese: [
    ["Questions & Connectors", "谁", { newSource: "who" }],
  ],
  dutch: [
    ["Questions & Connectors", "wie", { newSource: "who" }],
    ["Feelings & States", "kalme", { newKey: "kalm" }],
  ],
  french: [
    ["Questions & Connectors", "qui", { newSource: "who" }],
  ],
  german: [
    ["Verbs & Tenses", "gehen", { newSource: "go" }],
  ],
  hindi: [
    ["Questions & Connectors", "क्या", { newSource: "what" }],
    ["Verbs & Tenses", "रखना", { newKey: "पास होना", newSource: "have" }],
    ["Feelings & States", "डरना", { newKey: "डरा हुआ/डरी हुई", newSource: "afraid" }],
  ],
  japanese: [
    ["Greetings", "こんにちは", { newSource: "hello" }],
    ["Greetings", "バイ", { newKey: "バイバイ" }],
    ["Feelings & States", "孤独", { newKey: "さみしい" }],
  ],
  korean: [
    ["Feelings & States", "행복한", { newKey: "행복하다" }],
    ["Feelings & States", "슬픈", { newKey: "슬프다" }],
    ["Feelings & States", "화난", { newKey: "화나다" }],
    ["Feelings & States", "두려운", { newKey: "두렵다" }],
    ["Feelings & States", "신나는", { newKey: "신나다" }],
    ["Feelings & States", "지루한", { newKey: "지루하다" }],
    ["Feelings & States", "피곤한", { newKey: "피곤하다" }],
    ["Feelings & States", "졸린", { newKey: "졸리다" }],
    ["Feelings & States", "배고픈", { newKey: "배고프다" }],
    ["Feelings & States", "목마른", { newKey: "목마르다" }],
    ["Feelings & States", "긴장한", { newKey: "긴장되다" }],
    ["Feelings & States", "차분한", { newKey: "차분하다" }],
    ["Feelings & States", "괜찮은", { newKey: "괜찮다" }],
    ["Feelings & States", "외로운", { newKey: "외롭다" }],
  ],
  portuguese: [
    ["Greetings", "bom dia", { newSource: "good morning" }],
    ["Questions & Connectors", "como", { newSource: "how" }],
    ["Verbs & Tenses", "obter", { newKey: "conseguir" }],
  ],
  spanish: [
    ["Greetings", "adiós", { newSource: "goodbye" }],
    ["Verbs & Tenses", "obtener", { newKey: "conseguir" }],
  ],
  swedish: [
    ["Questions & Connectors", "vem", { newSource: "who" }],
    ["Verbs & Tenses", "gå", { newSource: "go" }],
  ],
};

const repairWordSemanticsInPack = (pack, worldKey) => {
  const repairs = REPAIRS[worldKey];
  if (!Array.isArray(repairs)) {
    return 0;
  }
  let changed = 0;
  repairs.forEach(([sectionName, oldKey, update]) => {
    changed += rewriteWordEntry(pack, sectionName, oldKey, update);
  });
  return changed;
};

module.exports = {
  repairWordSemanticsInPack,
};
