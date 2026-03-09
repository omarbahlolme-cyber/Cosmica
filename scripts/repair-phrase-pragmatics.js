const normalize = (value) => String(value || "").trim().toLowerCase();

const renamePhrase = (pack, sectionName, oldKey, newKey, sourceOverride) => {
  if (!pack?.phrases?.[sectionName] || typeof pack.phrases[sectionName] !== "object") {
    return 0;
  }
  const section = pack.phrases[sectionName];
  if (!Object.prototype.hasOwnProperty.call(section, oldKey) || !newKey || oldKey === newKey) {
    return 0;
  }

  const entry = { ...(section[oldKey] || {}) };
  if (sourceOverride) {
    entry.source = sourceOverride;
    entry.translations = {
      ...(entry.translations || {}),
      english: sourceOverride,
    };
  }

  const rebuilt = {};
  Object.entries(section).forEach(([key, value]) => {
    if (key === oldKey) {
      rebuilt[newKey] = entry;
    } else {
      rebuilt[key] = value;
    }
  });
  pack.phrases[sectionName] = rebuilt;

  pack.worldSource = pack.worldSource || {};
  pack.worldSource.phrases = pack.worldSource.phrases || {};
  pack.worldSource.phrases[sectionName] = pack.worldSource.phrases[sectionName] || {};
  const worldSourceSection = pack.worldSource.phrases[sectionName];

  Object.entries(worldSourceSection).forEach(([sourceKey, worldPhrase]) => {
    if (worldPhrase === oldKey) {
      worldSourceSection[sourceKey] = newKey;
    }
  });

  const sourceKey = normalize(sourceOverride || entry.source);
  if (sourceKey) {
    worldSourceSection[sourceKey] = newKey;
  }

  return 1;
};

const removeLegacyQuestionSource = (pack) => {
  if (!pack?.worldSource?.phrases?.Questions || typeof pack.worldSource.phrases.Questions !== "object") {
    return 0;
  }
  const section = pack.worldSource.phrases.Questions;
  if (!Object.prototype.hasOwnProperty.call(section, "do you speak english")) {
    return 0;
  }
  delete section["do you speak english"];
  return 1;
};

const REPAIRS = {
  german: [
    ["Introductions", "lassen Sie mich mich vorstellen", "Darf ich mich vorstellen?"],
    ["Questions", "was ist jenes", "was ist das da"],
    ["Politeness", "Ich schätze es", "Ich weiß das zu schätzen"],
  ],
  hindi: [
    ["Introductions", "यह मेरा दोस्त/दोस्ती है", "यह मेरा दोस्त है / यह मेरी दोस्त है"],
    ["Politeness", "मेरी क्षमा", "मैं क्षमा चाहता/चाहती हूँ"],
    ["Requests", "क्या आप मेरी मदद कर सकते थे", "क्या आप मेरी मदद कर सकेंगे?"],
    ["Requests", "क्या आप मुझे दिखा सकते थे", "क्या आप मुझे दिखा सकेंगे?"],
    ["Requests", "क्या आप मुझे बता सकते थे", "क्या आप मुझे बता सकेंगे?"],
    ["Requests", "क्या आप समझा सकते थे", "क्या आप समझा सकेंगे?"],
    ["Requests", "क्या मुझे मिल सकता है", "क्या मैं ... ले सकता/सकती हूँ?"],
    ["Requests", "क्या मुझे मिल सकता था", "क्या मुझे ... मिल सकता है?"],
    ["Requests", "मुझे पसंद है", "मैं ... चाहूँगा/चाहूँगी"],
  ],
  japanese: [
    ["Introductions", "こちらは私の兄弟です", "こちらは私の兄 / 弟です"],
    ["Politeness", "失礼しました", "失礼します"],
    ["Politeness", "本当にありがとう", "本当にありがとうございます"],
    ["Questions", "あなたはどこですか", "どこにいますか"],
  ],
  korean: [
    ["Introductions", "내 이름은", "제 이름은"],
    ["Introductions", "나는", "저는"],
    ["Introductions", "나는 ~에서 왔습니다", "저는 ~에서 왔어요"],
    ["Introductions", "나는 ~에 살고 있습니다", "저는 ~에 살고 있어요"],
    ["Introductions", "나는 ~에서 일합니다", "저는 ~에서 일해요"],
    ["Introductions", "나는 ~에서 공부합니다", "저는 ~에서 공부해요"],
    ["Introductions", "나는 학생입니다", "저는 학생이에요"],
    ["Introductions", "나는 교사입니다", "저는 교사예요"],
    ["Introductions", "나는 여기 새로 왔습니다", "저는 여기 처음이에요"],
    ["Introductions", "이 사람은 내 친구입니다", "이분은 제 친구예요"],
    ["Politeness", "미안해", "그건 죄송해요"],
    ["Politeness", "감사합니다", "정말 감사드립니다", "i appreciate it"],
    ["Politeness", "정말 고마워", "정말 감사합니다"],
    ["Politeness", "괜찮아", "문제없어요"],
    ["Questions", "어디에요", "어디에 계세요?"],
    ["Requests", "저는 원합니다.", "...을/를 원해요"],
  ],
};

const repairPhrasePragmaticsInPack = (pack, worldKey) => {
  const repairs = REPAIRS[worldKey];
  let changed = removeLegacyQuestionSource(pack);
  if (!Array.isArray(repairs)) {
    return changed;
  }
  repairs.forEach(([sectionName, oldKey, newKey, sourceOverride]) => {
    changed += renamePhrase(pack, sectionName, oldKey, newKey, sourceOverride);
  });
  return changed;
};

module.exports = {
  repairPhrasePragmaticsInPack,
};
