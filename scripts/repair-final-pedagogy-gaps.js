const buildHighlights = (labels, texts) =>
  labels
    .map((label, index) => ({
      label: String(label || "").trim(),
      text: String(texts[index] || "").trim(),
    }))
    .filter((entry) => entry.label && entry.text);

const sameJson = (a, b) => JSON.stringify(a) === JSON.stringify(b);

const FINAL_CARD_PATCHES = {
  arabic: {
    Verbs: {
      4: {
        ruleOrder: ["الفعل", "الفاعل", "مفعول به"],
        highlightTexts: ["أكل", "الطالب", "التفاحة"],
      },
    },
    "Reported Speech": {
      2: {
        highlightTexts: ["سألته", "هل", "سيأتي"],
      },
      3: {
        highlightTexts: ["قالت فاطمة", "إنها", "متعبة"],
      },
    },
    "Discourse & Flow": {
      0: {
        highlightTexts: ["أحب القراءة", "لكنني", "متعب"],
      },
      2: {
        highlightTexts: ["أولًا أراجع الدرس", "ثم أكتب الملاحظات", "وأخيرًا أتدرّب"],
      },
      4: {
        highlightTexts: ["يمكنك الدراسة بطرق مختلفة", "مثلًا، بالقراءة أو الاستماع"],
      },
    },
  },
  chinese: {
    "Nouns & Articles": {
      5: {
        firstMistake: {
          wrong: "苹果们都是水果。",
          fix: "苹果都是水果。",
        },
      },
    },
    Negation: {
      5: {
        ruleOrder: ["主语", "动词 + 得", "否定词", "补语"],
      },
    },
    "Discourse & Flow": {
      1: {
        highlightTexts: ["因为下雨", "所以我没出去"],
      },
      4: {
        highlightTexts: ["可以用很多方法练习", "比如跟读"],
      },
    },
  },
  dutch: {
    "Formality & Style": {
      0: {
        ruleOrder: ["vraag", "aanhef"],
        highlightTexts: ["Hoe gaat het met", "u"],
      },
    },
  },
  french: {
    Modality: {
      3: {
        firstMistake: {
          wrong: "Je dois apprendre plus vite.",
          fix: "Je veux apprendre plus vite.",
        },
      },
    },
    "Reported Speech": {
      1: {
        highlightTexts: ["Il dit", "qu", "il vient demain"],
      },
      2: {
        highlightTexts: ["Il a dit", "qu", "il viendrait le lendemain"],
      },
    },
  },
  german: {
    "Reported Speech": {
      2: {
        highlightTexts: ["Die Sprecherin sagte", "sie", "sei bereit"],
      },
    },
  },
  hindi: {
    "Pronouns & Reference": {
      3: {
        highlightTexts: ["जो लड़का खड़ा है", "वह मेरा भाई है"],
      },
    },
    Modality: {
      0: {
        ruleOrder: ["क्रिया", "मजबूरी"],
        highlightTexts: ["मुझे आज देर तक काम करना", "पड़ेगा"],
      },
      1: {
        ruleOrder: ["क्रिया", "सलाह"],
        highlightTexts: ["तुम्हें जल्दी सोना", "चाहिए"],
      },
      2: {
        ruleOrder: ["कर्ता", "क्रिया", "क्षमता"],
        highlightTexts: ["मैं", "यह काम कर", "सकता हूँ"],
      },
      3: {
        example: "शायद वह देर से आए।",
        highlightTexts: ["शायद", "वह देर से आए"],
      },
      4: {
        ruleOrder: ["क्रिया", "मनाही"],
        highlightTexts: ["यहाँ फोटो लेना", "मना है"],
      },
    },
    "Discourse & Flow": {
      4: {
        highlightTexts: ["अभ्यास कई तरह से हो सकता है", "उदाहरण के लिए, सुनकर दोहराना"],
      },
    },
  },
  japanese: {
    Modality: {
      0: {
        ruleOrder: ["動作", "義務"],
        highlightTexts: ["宿題をし", "なければならない"],
      },
      1: {
        ruleOrder: ["内容", "助言"],
        highlightTexts: ["早く寝た", "ほうがいいです"],
      },
      2: {
        ruleOrder: ["内容", "能力"],
        highlightTexts: ["日本語を話す", "ことができます"],
      },
      3: {
        ruleOrder: ["出来事", "可能性"],
        highlightTexts: ["明日は雨", "かもしれない"],
      },
      4: {
        ruleOrder: ["行為", "禁止"],
        highlightTexts: ["ここで写真を撮っ", "てはいけません"],
      },
    },
    "Discourse & Flow": {
      1: {
        highlightTexts: ["雨が降っている", "ので、出かけません"],
      },
      4: {
        highlightTexts: ["勉強法はいろいろあります", "例えば、音読です"],
      },
    },
  },
  korean: {
    Modality: {
      0: {
        ruleOrder: ["행동", "의무"],
        highlightTexts: ["오늘 숙제를", "해야 해요"],
      },
      1: {
        ruleOrder: ["내용", "조언"],
        highlightTexts: ["일찍 자는", "게 좋아요"],
      },
      2: {
        highlightTexts: ["저는", "수영할 수 있어요"],
      },
      3: {
        ruleOrder: ["사건", "가능성"],
        highlightTexts: ["그가 늦을", "지도 몰라요"],
      },
      4: {
        ruleOrder: ["행동", "금지"],
        highlightTexts: ["여기서 사진을 찍으면", "안 돼요"],
      },
    },
    "Reported Speech": {
      3: {
        highlightTexts: ["그는", "나에게", "기다려 달라고 했다"],
      },
    },
    "Discourse & Flow": {
      4: {
        highlightTexts: ["연습 방법은 많아요", "예를 들어, 따라 읽기예요"],
      },
    },
  },
};

const getFinalPedagogyCardPatch = (worldKey, sectionName, cardIndex) =>
  FINAL_CARD_PATCHES?.[worldKey]?.[sectionName]?.[cardIndex] || null;

const patchCard = (pack, section, index, patch) => {
  const card = pack?.grammar?.cards?.[section]?.[index];
  if (!card || typeof card !== "object" || !patch) {
    return 0;
  }

  let changed = false;

  if (typeof patch.example === "string" && card.example !== patch.example) {
    card.example = patch.example;
    changed = true;
  }

  if (Array.isArray(patch.ruleOrder) && !sameJson(card.ruleOrder || [], patch.ruleOrder)) {
    card.ruleOrder = [...patch.ruleOrder];
    changed = true;
  }

  if (Array.isArray(patch.highlightTexts)) {
    const labels = Array.isArray(card.ruleOrder) ? card.ruleOrder : [];
    const nextHighlights = buildHighlights(labels, patch.highlightTexts);
    if (!sameJson(card.exampleHighlights || [], nextHighlights)) {
      card.exampleHighlights = nextHighlights;
      changed = true;
    }
  }

  if (patch.firstMistake && typeof patch.firstMistake === "object") {
    const nextMistake = {
      wrong: String(patch.firstMistake.wrong || "").trim(),
      fix: String(patch.firstMistake.fix || "").trim(),
    };
    const currentFirst = card.mistakes?.[0] || {};
    if (!sameJson(currentFirst, nextMistake)) {
      const rest = Array.isArray(card.mistakes) ? card.mistakes.slice(1) : [];
      card.mistakes = [nextMistake, ...rest];
      changed = true;
    }
  }

  return changed ? 1 : 0;
};

const repairFinalPedagogyGapsInPack = (pack, worldKey) => {
  const worldPatches = FINAL_CARD_PATCHES?.[worldKey];
  if (!worldPatches) {
    return 0;
  }

  let changed = 0;
  Object.entries(worldPatches).forEach(([sectionName, entries]) => {
    Object.entries(entries).forEach(([index, patch]) => {
      changed += patchCard(pack, sectionName, Number(index), patch);
    });
  });
  return changed;
};

module.exports = {
  getFinalPedagogyCardPatch,
  repairFinalPedagogyGapsInPack,
};
