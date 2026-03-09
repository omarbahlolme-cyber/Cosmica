const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const worldsDir = path.join(ROOT, "frontend", "worlds");

const normalizeKey = (value) => String(value || "").trim().toLowerCase();
const buildGrammarExplanation = (title) =>
  `This card explains ${title} and how to form it clearly in real sentences.`;

const syncPack = (pack) => {
  if (!pack || typeof pack !== "object") {
    return false;
  }
  if (!pack.worldSource || typeof pack.worldSource !== "object") {
    pack.worldSource = {};
  }
  const worldSource = pack.worldSource;
  const nextGrammarTitles = {};
  const nextGrammarExamples = {};
  const nextGrammarExplanations = {};
  const nextGrammarPoints = {};
  const nextGrammarMistakeWrong = {};
  const nextGrammarMistakeFix = {};

  Object.entries(pack?.grammar?.cards || {}).forEach(([section, worldCards]) => {
    if (!worldCards.length) {
      return;
    }

    nextGrammarTitles[section] = {};
    nextGrammarExamples[section] = {};
    nextGrammarExplanations[section] = {};
    nextGrammarPoints[section] = {};
    nextGrammarMistakeWrong[section] = {};
    nextGrammarMistakeFix[section] = {};

    worldCards.forEach((worldCard) => {
      if (!worldCard || typeof worldCard !== "object") {
        return;
      }

      const sourceTitle = String(worldCard?.sourceTitle || "").trim();
      const worldTitle = String(worldCard?.title || "").trim();
      if (sourceTitle && worldTitle) {
        const key = normalizeKey(sourceTitle);
        nextGrammarTitles[section][key] = worldTitle;
      }

      const sourceExample = String(worldCard?.sourceExample || "").trim();
      const worldExample = String(worldCard?.example || "").trim();
      if (sourceExample && worldExample) {
        const key = normalizeKey(sourceExample);
        nextGrammarExamples[section][key] = worldExample;
      }

      const sourceExplanation = buildGrammarExplanation(sourceTitle);
      const worldExplanation = String(worldCard?.explanation || "").trim();
      if (sourceExplanation && worldExplanation) {
        const key = normalizeKey(sourceExplanation);
        nextGrammarExplanations[section][key] = worldExplanation;
      }

      const sourcePoints = Array.isArray(worldCard?.sourcePoints) ? worldCard.sourcePoints : [];
      const worldPoints = Array.isArray(worldCard?.points) ? worldCard.points : [];
      sourcePoints.forEach((sourcePoint, pointIndex) => {
        const englishPoint = String(sourcePoint || "").trim();
        const worldPoint = String(worldPoints[pointIndex] || "").trim();
        if (!englishPoint || !worldPoint) {
          return;
        }
        const key = normalizeKey(englishPoint);
        nextGrammarPoints[section][key] = worldPoint;
      });

      const worldMistakes = Array.isArray(worldCard?.mistakes) ? worldCard.mistakes : [];
      worldMistakes.forEach((worldMistake) => {
        const sourceWrong = String(worldMistake?.sourceWrong || "").trim();
        const sourceFix = String(worldMistake?.sourceFix || "").trim();
        const wrong = String(worldMistake?.wrong || "").trim();
        const fix = String(worldMistake?.fix || "").trim();
        if (sourceWrong && wrong) {
          const key = normalizeKey(sourceWrong);
          nextGrammarMistakeWrong[section][key] = wrong;
        }
        if (sourceFix && fix) {
          const key = normalizeKey(sourceFix);
          nextGrammarMistakeFix[section][key] = fix;
        }
      });
    });
  });

  let changed = false;
  const nextWorldSourceGrammar = {
    grammarTitles: nextGrammarTitles,
    grammarExamples: nextGrammarExamples,
    grammarExplanations: nextGrammarExplanations,
    grammarPoints: nextGrammarPoints,
    grammarMistakeWrong: nextGrammarMistakeWrong,
    grammarMistakeFix: nextGrammarMistakeFix,
  };

  Object.entries(nextWorldSourceGrammar).forEach(([key, nextValue]) => {
    const currentValue = worldSource[key] || {};
    if (JSON.stringify(currentValue) !== JSON.stringify(nextValue)) {
      worldSource[key] = nextValue;
      changed = true;
    }
  });

  return changed;
};

let changedCount = 0;

for (const entry of fs.readdirSync(worldsDir, { withFileTypes: true })) {
  if (!entry.isDirectory()) {
    continue;
  }
  const filePath = path.join(worldsDir, entry.name, "translations.json");
  if (!fs.existsSync(filePath)) {
    continue;
  }
  const original = fs.readFileSync(filePath, "utf8");
  const pack = JSON.parse(original);
  if (!syncPack(pack)) {
    continue;
  }
  fs.writeFileSync(filePath, JSON.stringify(pack, null, 2), "utf8");
  changedCount += 1;
  console.log(`Synced worldSource grammar metadata: ${entry.name}`);
}

console.log(`World packs updated: ${changedCount}`);
