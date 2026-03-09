const fs = require("fs");
const path = require("path");

const overrides = require("./pedagogy-section-overrides");
const { repairConditionsInPack } = require("./repair-conditions-section");
const { repairDiscourseModalityMistakesInPack } = require("./repair-discourse-modality-mistakes");
const { repairNegationInPack } = require("./repair-negation-section");
const { repairPronounsReportedMistakesInPack } = require("./repair-pronouns-reported-mistakes");
const { repairTensesAspectInPack } = require("./repair-tenses-aspect-section");
const { repairVoiceFormalityMistakesInPack } = require("./repair-voice-formality-mistakes");
const { repairGrammarHighlightsInPack } = require("./grammar-highlight-repairs");

const root = path.join(__dirname, "..", "frontend", "worlds");
let updated = 0;

for (const [world, sectionOverrides] of Object.entries(overrides)) {
  const file = path.join(root, world, "translations.json");
  const pack = JSON.parse(fs.readFileSync(file, "utf8"));

  Object.entries(sectionOverrides).forEach(([sectionName, cards]) => {
    pack.grammar = pack.grammar || {};
    pack.grammar.cards = pack.grammar.cards || {};
    pack.grammar.cards[sectionName] = cards;
  });

  const repairedTensesAspect = repairTensesAspectInPack(pack, world);
  const repairedConditions = repairConditionsInPack(pack, world);
  const repairedNegation = repairNegationInPack(pack, world);
  const repairedPronounsReportedMistakes = repairPronounsReportedMistakesInPack(pack, world);
  const repairedDiscourseModalityMistakes = repairDiscourseModalityMistakesInPack(pack, world);
  const repairedVoiceFormalityMistakes = repairVoiceFormalityMistakesInPack(pack, world);
  const repairedCards = repairGrammarHighlightsInPack(pack, world);

  fs.writeFileSync(file, `${JSON.stringify(pack, null, 2)}\n`, "utf8");
  updated += 1;
  console.log(
    `Applied pedagogy overrides: ${world} (tenses: ${repairedTensesAspect}, conditions: ${repairedConditions}, negation: ${repairedNegation}, pronouns/reported mistakes: ${repairedPronounsReportedMistakes}, discourse/modality mistakes: ${repairedDiscourseModalityMistakes}, voice/formality mistakes: ${repairedVoiceFormalityMistakes}, highlight repairs: ${repairedCards})`
  );
}

console.log(`World packs updated: ${updated}`);
