/* ==========================================================================
   ALIGN GRAMMAR MISTAKES
   - Ensures first common mistake stays on-topic with the card example.
   - Rebuilds weak/identical mistakes from exampleHighlights when needed.
   ========================================================================== */
const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const WORLDS_DIR = path.join(ROOT, "frontend", "worlds");

const normalize = (value) =>
  String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLowerCase();

const tokenize = (value) =>
  normalize(value)
    .split(/[^a-z0-9\u0600-\u06ff\u0900-\u097f\u3040-\u30ff\u4e00-\u9fff\u1100-\u11ff\u3130-\u318f\uac00-\ud7af]+/i)
    .filter(Boolean);

const jaccard = (a, b) => {
  const aSet = new Set(tokenize(a));
  const bSet = new Set(tokenize(b));
  if (!aSet.size || !bSet.size) {
    return 0;
  }
  let intersection = 0;
  aSet.forEach((token) => {
    if (bSet.has(token)) {
      intersection += 1;
    }
  });
  const union = aSet.size + bSet.size - intersection;
  return union > 0 ? intersection / union : 0;
};

const hasLetterOrNumber = (value) => /[\p{L}\p{N}]/u.test(String(value || ""));
const isBoundaryChar = (char) => !char || !/[\p{L}\p{N}]/u.test(char);

const findPhraseSpan = (sentence, phrase, fromIndex = 0) => {
  const source = String(sentence || "");
  const target = String(phrase || "").trim();
  if (!source || !target) {
    return null;
  }
  const sourceLower = source.toLocaleLowerCase();
  const targetLower = target.toLocaleLowerCase();
  const starts = [Math.max(0, Number(fromIndex) || 0)];
  if (starts[0] > 0) {
    starts.push(0);
  }
  const checkBoundary = /\s/u.test(source) && hasLetterOrNumber(target);
  for (const start of starts) {
    let at = sourceLower.indexOf(targetLower, start);
    while (at >= 0) {
      const before = source[at - 1] || "";
      const after = source[at + target.length] || "";
      const boundaryOk = !checkBoundary || (isBoundaryChar(before) && isBoundaryChar(after));
      if (boundaryOk) {
        return { start: at, end: at + target.length };
      }
      at = sourceLower.indexOf(targetLower, at + 1);
    }
  }
  return null;
};

const swapPhrasesInSentence = (sentence, first, second) => {
  const source = String(sentence || "");
  const a = String(first || "").trim();
  const b = String(second || "").trim();
  if (!source || !a || !b || normalize(a) === normalize(b)) {
    return "";
  }
  const spanA = findPhraseSpan(source, a, 0);
  if (!spanA) {
    return "";
  }
  const spanB = findPhraseSpan(source, b, spanA.end);
  if (!spanB || spanB.start < spanA.end) {
    return "";
  }
  return (
    source.slice(0, spanA.start) +
    source.slice(spanB.start, spanB.end) +
    source.slice(spanA.end, spanB.start) +
    source.slice(spanA.start, spanA.end) +
    source.slice(spanB.end)
  );
};

const buildFallbackWrong = (sentence) => {
  const source = String(sentence || "").trim();
  if (!source) {
    return "";
  }
  const trailingPunctuation = source.match(/[.!?。！？،؛]+$/u)?.[0] || "";
  const core = trailingPunctuation ? source.slice(0, -trailingPunctuation.length).trim() : source;
  const words = core.split(/\s+/).filter(Boolean);
  if (words.length < 2) {
    return "";
  }
  const swapped = [...words];
  const temp = swapped[0];
  swapped[0] = swapped[1];
  swapped[1] = temp;
  return `${swapped.join(" ")}${trailingPunctuation}`;
};

const THRESHOLD = 0.15;

let touchedWorlds = 0;
let touchedCards = 0;

const worldDirs = fs
  .readdirSync(WORLDS_DIR, { withFileTypes: true })
  .filter((entry) => entry.isDirectory())
  .map((entry) => entry.name)
  .filter((name) => name !== "english");

for (const worldKey of worldDirs) {
  const filePath = path.join(WORLDS_DIR, worldKey, "translations.json");
  if (!fs.existsSync(filePath)) {
    continue;
  }
  const data = JSON.parse(fs.readFileSync(filePath, "utf8"));
  const cards = data?.grammar?.cards;
  if (!cards || typeof cards !== "object") {
    continue;
  }
  let worldChanged = false;
  for (const sectionCards of Object.values(cards)) {
    if (!Array.isArray(sectionCards)) {
      continue;
    }
    sectionCards.forEach((card) => {
      const example = String(card?.example || "").trim();
      if (!example) {
        return;
      }
      if (!Array.isArray(card.mistakes) || !card.mistakes.length) {
        card.mistakes = [{ wrong: buildFallbackWrong(example) || example, fix: example }];
        worldChanged = true;
        touchedCards += 1;
        return;
      }
      const first = card.mistakes[0] || {};
      const wrong = String(first.wrong || "").trim();
      const fix = String(first.fix || "").trim();
      const similarity = Math.max(jaccard(wrong, example), jaccard(fix, example));
      const needsRepair =
        !wrong ||
        !fix ||
        wrong === fix ||
        normalize(wrong) === normalize(fix) ||
        similarity < THRESHOLD;
      if (!needsRepair) {
        return;
      }
      const highlights = Array.isArray(card.exampleHighlights) ? card.exampleHighlights : [];
      const firstPhrase = String(highlights[0]?.text || "").trim();
      const secondPhrase = String(highlights[1]?.text || "").trim();
      let rebuiltWrong = swapPhrasesInSentence(example, firstPhrase, secondPhrase);
      if (!rebuiltWrong) {
        rebuiltWrong = buildFallbackWrong(example);
      }
      if (!rebuiltWrong || rebuiltWrong === example) {
        return;
      }
      first.wrong = rebuiltWrong;
      first.fix = example;
      card.mistakes[0] = first;
      worldChanged = true;
      touchedCards += 1;
    });
  }
  if (worldChanged) {
    data.generatedAt = new Date().toISOString();
    fs.writeFileSync(filePath, `${JSON.stringify(data, null, 2)}\n`, "utf8");
    touchedWorlds += 1;
  }
}

console.log(
  JSON.stringify(
    {
      touchedWorlds,
      touchedCards,
      threshold: THRESHOLD,
    },
    null,
    2
  )
);
