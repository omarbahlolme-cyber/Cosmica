const isObject = (value) => Boolean(value) && typeof value === "object" && !Array.isArray(value);

const ensureSection = (pack, sectionName) => {
  pack.words = pack.words || {};
  pack.worldSource = pack.worldSource || {};
  pack.worldSource.words = pack.worldSource.words || {};
  if (!isObject(pack.words[sectionName])) {
    pack.words[sectionName] = {};
  }
  if (!isObject(pack.worldSource.words[sectionName])) {
    pack.worldSource.words[sectionName] = {};
  }
  return {
    section: pack.words[sectionName],
    worldSource: pack.worldSource.words[sectionName],
  };
};

const setEntrySource = (pack, sectionName, key, source) => {
  const { section } = ensureSection(pack, sectionName);
  if (!isObject(section[key])) {
    return 0;
  }
  const entry = section[key];
  let changed = 0;
  if (entry.source !== source) {
    entry.source = source;
    changed += 1;
  }
  entry.translations = entry.translations || {};
  if (entry.translations.english !== source) {
    entry.translations.english = source;
    changed += 1;
  }
  return changed ? 1 : 0;
};

const upsertEntry = (pack, sectionName, key, source) => {
  const { section } = ensureSection(pack, sectionName);
  if (!isObject(section[key])) {
    section[key] = {
      source,
      translations: {
        english: source,
      },
    };
    return 1;
  }
  return setEntrySource(pack, sectionName, key, source);
};

const renameEntry = (pack, sectionName, oldKey, newKey, sourceOverride) => {
  const { section, worldSource } = ensureSection(pack, sectionName);
  if (!isObject(section[oldKey]) || !newKey || oldKey === newKey) {
    return sourceOverride ? setEntrySource(pack, sectionName, oldKey, sourceOverride) : 0;
  }

  const entry = { ...section[oldKey] };
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
  pack.words[sectionName] = rebuilt;

  Object.entries(worldSource).forEach(([sourceKey, worldWord]) => {
    if (worldWord === oldKey) {
      worldSource[sourceKey] = newKey;
    }
  });

  return 1;
};

const setWorldSource = (pack, sectionName, sourceKey, targetKey) => {
  const { worldSource } = ensureSection(pack, sectionName);
  if (worldSource[sourceKey] === targetKey) {
    return 0;
  }
  worldSource[sourceKey] = targetKey;
  return 1;
};

const removeWorldSource = (pack, sectionName, sourceKey) => {
  const { worldSource } = ensureSection(pack, sectionName);
  if (!Object.prototype.hasOwnProperty.call(worldSource, sourceKey)) {
    return 0;
  }
  delete worldSource[sourceKey];
  return 1;
};

const removeEntry = (pack, sectionName, key) => {
  const { section, worldSource } = ensureSection(pack, sectionName);
  if (!isObject(section[key])) {
    return 0;
  }
  delete section[key];
  Object.entries(worldSource).forEach(([sourceKey, worldWord]) => {
    if (worldWord === key) {
      delete worldSource[sourceKey];
    }
  });
  return 1;
};

const applyOperations = (pack, operations) => {
  let changed = 0;
  operations.forEach((operation) => {
    if (operation.type === "setEntrySource") {
      changed += setEntrySource(pack, operation.section, operation.key, operation.source);
      return;
    }
    if (operation.type === "renameEntry") {
      changed += renameEntry(
        pack,
        operation.section,
        operation.oldKey,
        operation.newKey,
        operation.source
      );
      return;
    }
    if (operation.type === "upsertEntry") {
      changed += upsertEntry(pack, operation.section, operation.key, operation.source);
      return;
    }
    if (operation.type === "setWorldSource") {
      changed += setWorldSource(pack, operation.section, operation.sourceKey, operation.targetKey);
      return;
    }
    if (operation.type === "removeWorldSource") {
      changed += removeWorldSource(pack, operation.section, operation.sourceKey);
      return;
    }
    if (operation.type === "removeEntry") {
      changed += removeEntry(pack, operation.section, operation.key);
    }
  });
  return changed;
};

const REPAIRS = {
  arabic: [
    { type: "renameEntry", section: "Pronouns", oldKey: "لي", newKey: "إياي", source: "me" },
    { type: "renameEntry", section: "Pronouns", oldKey: "له", newKey: "إياه", source: "him" },
    { type: "renameEntry", section: "Pronouns", oldKey: "لها", newKey: "إياها", source: "her" },
    { type: "renameEntry", section: "Pronouns", oldKey: "لنا", newKey: "إيانا", source: "us" },
    { type: "renameEntry", section: "Pronouns", oldKey: "لهم", newKey: "إياهم", source: "them" },
    { type: "renameEntry", section: "Pronouns", oldKey: "خاصتي", newKey: "لي", source: "mine" },
    {
      type: "renameEntry",
      section: "Pronouns",
      oldKey: "خاصتك",
      newKey: "لك / لكِ",
      source: "yours",
    },
    { type: "renameEntry", section: "Pronouns", oldKey: "خاصته", newKey: "ـه", source: "his" },
    {
      type: "renameEntry",
      section: "Pronouns",
      oldKey: "خاصته/خاصتها",
      newKey: "ـه / ـها",
      source: "its",
    },
    { type: "renameEntry", section: "Pronouns", oldKey: "خاصتنا", newKey: "لنا", source: "ours" },
    { type: "renameEntry", section: "Pronouns", oldKey: "خاصتهم", newKey: "لهم", source: "theirs" },
    { type: "renameEntry", section: "Pronouns", oldKey: "خاصتها", newKey: "لها", source: "hers" },
    { type: "upsertEntry", section: "Pronouns", key: "ـي", source: "my" },
    { type: "upsertEntry", section: "Pronouns", key: "ـكَ / ـكِ", source: "your" },
    { type: "upsertEntry", section: "Pronouns", key: "ـنا", source: "our" },
    { type: "upsertEntry", section: "Pronouns", key: "ـهم", source: "their" },
    { type: "setWorldSource", section: "Pronouns", sourceKey: "my", targetKey: "ـي" },
    { type: "setWorldSource", section: "Pronouns", sourceKey: "your", targetKey: "ـكَ / ـكِ" },
    { type: "setWorldSource", section: "Pronouns", sourceKey: "our", targetKey: "ـنا" },
    { type: "setWorldSource", section: "Pronouns", sourceKey: "their", targetKey: "ـهم" },
  ],
  dutch: [
    { type: "setEntrySource", section: "Pronouns", key: "zij", source: "she / they" },
    { type: "setEntrySource", section: "Pronouns", key: "zijn", source: "his / its" },
    {
      type: "setEntrySource",
      section: "Pronouns",
      key: "iedereen",
      source: "everyone / everybody",
    },
    { type: "setEntrySource", section: "Pronouns", key: "iemand", source: "someone / anyone" },
    { type: "setEntrySource", section: "Pronouns", key: "iets", source: "something / anything" },
    { type: "setWorldSource", section: "Pronouns", sourceKey: "anyone", targetKey: "iemand" },
    { type: "setWorldSource", section: "Pronouns", sourceKey: "anybody", targetKey: "iemand" },
    {
      type: "setWorldSource",
      section: "Pronouns",
      sourceKey: "everyone",
      targetKey: "iedereen",
    },
    {
      type: "setWorldSource",
      section: "Pronouns",
      sourceKey: "everybody",
      targetKey: "iedereen",
    },
  ],
  french: [
    { type: "setEntrySource", section: "Pronouns", key: "lui", source: "him / her" },
    { type: "setEntrySource", section: "Pronouns", key: "son", source: "his / her / its" },
    { type: "setEntrySource", section: "Pronouns", key: "ces", source: "these / those" },
  ],
  german: [
    { type: "setEntrySource", section: "Pronouns", key: "sie", source: "she / they" },
    { type: "setEntrySource", section: "Pronouns", key: "sein", source: "his / its" },
    {
      type: "setWorldSource",
      section: "Pronouns",
      sourceKey: "anyone",
      targetKey: "irgendjemand",
    },
    {
      type: "setWorldSource",
      section: "Pronouns",
      sourceKey: "anybody",
      targetKey: "irgendjemand",
    },
  ],
  hindi: [
    { type: "setEntrySource", section: "Pronouns", key: "वह", source: "he / she / that" },
    { type: "setEntrySource", section: "Pronouns", key: "यह", source: "this / it" },
    { type: "setEntrySource", section: "Pronouns", key: "वे", source: "they / those" },
    { type: "setEntrySource", section: "Pronouns", key: "उसे", source: "him / her" },
    { type: "setEntrySource", section: "Pronouns", key: "मेरा", source: "my / mine" },
    { type: "setEntrySource", section: "Pronouns", key: "तुम्हारा", source: "your / yours" },
    { type: "setEntrySource", section: "Pronouns", key: "उसका", source: "his / her / hers" },
    { type: "setEntrySource", section: "Pronouns", key: "हमारा", source: "our / ours" },
    { type: "setEntrySource", section: "Pronouns", key: "उनका", source: "their / theirs" },
    {
      type: "setEntrySource",
      section: "Pronouns",
      key: "वह खुद",
      source: "himself / herself",
    },
  ],
  korean: [
    { type: "renameEntry", section: "Greetings", oldKey: "미안해", newKey: "죄송합니다" },
    { type: "renameEntry", section: "Greetings", oldKey: "고마워", newKey: "고마워요" },
    {
      type: "renameEntry",
      section: "Greetings",
      oldKey: "천만에요",
      newKey: "별말씀을요",
    },
    {
      type: "renameEntry",
      section: "Greetings",
      oldKey: "만나서 기쁩니다",
      newKey: "만나 뵙게 되어 기쁩니다",
    },
    { type: "removeEntry", section: "Greetings", key: "좋은 아침" },
    { type: "removeEntry", section: "Greetings", key: "좋은 오후" },
    { type: "removeEntry", section: "Greetings", key: "좋은 저녁" },
    { type: "setWorldSource", section: "Greetings", sourceKey: "good morning", targetKey: "안녕하세요" },
    { type: "setWorldSource", section: "Greetings", sourceKey: "good afternoon", targetKey: "안녕하세요" },
    { type: "setWorldSource", section: "Greetings", sourceKey: "good evening", targetKey: "안녕하세요" },
    { type: "setEntrySource", section: "Pronouns", key: "이", source: "this / this one" },
    { type: "setEntrySource", section: "Pronouns", key: "저", source: "that / that one" },
    {
      type: "setEntrySource",
      section: "Pronouns",
      key: "누군가",
      source: "someone / somebody",
    },
    { type: "setEntrySource", section: "Pronouns", key: "아무나", source: "anyone / anybody" },
    {
      type: "setEntrySource",
      section: "Pronouns",
      key: "모두",
      source: "everyone / everybody / all",
    },
    { type: "setEntrySource", section: "Pronouns", key: "아무도", source: "nobody / no one" },
    { type: "setEntrySource", section: "Pronouns", key: "아무것도", source: "nothing" },
    {
      type: "setWorldSource",
      section: "Pronouns",
      sourceKey: "anyone",
      targetKey: "아무나",
    },
    {
      type: "setWorldSource",
      section: "Pronouns",
      sourceKey: "anybody",
      targetKey: "아무나",
    },
    {
      type: "setWorldSource",
      section: "Pronouns",
      sourceKey: "everyone",
      targetKey: "모두",
    },
    {
      type: "setWorldSource",
      section: "Pronouns",
      sourceKey: "everybody",
      targetKey: "모두",
    },
  ],
  portuguese: [
    { type: "setEntrySource", section: "Pronouns", key: "isso", source: "it / that" },
    { type: "setEntrySource", section: "Pronouns", key: "meu", source: "my / mine" },
    { type: "setEntrySource", section: "Pronouns", key: "nosso", source: "our / ours" },
  ],
  spanish: [
    { type: "setEntrySource", section: "Pronouns", key: "eso", source: "it / that" },
    { type: "setEntrySource", section: "Pronouns", key: "nuestro", source: "our / ours" },
    { type: "setEntrySource", section: "Pronouns", key: "suyo", source: "his / hers / its / theirs" },
  ],
  swedish: [
    { type: "setEntrySource", section: "Pronouns", key: "det", source: "it / that" },
    { type: "setEntrySource", section: "Pronouns", key: "min", source: "my / mine" },
    { type: "setEntrySource", section: "Pronouns", key: "din", source: "your / yours" },
    { type: "setEntrySource", section: "Pronouns", key: "vår", source: "our / ours" },
    {
      type: "setEntrySource",
      section: "Pronouns",
      key: "sig själv",
      source: "himself / herself / itself",
    },
  ],
};

const repairWordReferencePragmaticsInPack = (pack, worldKey) => {
  const operations = REPAIRS[worldKey];
  if (!Array.isArray(operations)) {
    return 0;
  }
  return applyOperations(pack, operations);
};

module.exports = {
  repairWordReferencePragmaticsInPack,
};
