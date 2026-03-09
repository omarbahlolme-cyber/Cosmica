/* ==========================================================================
   GRAMMAR CARD CONTENT REPAIR
   - Fixes malformed exampleHighlights in world translations.
   - Normalizes ruleOrder labels like "a+b" -> "a + b".
   - Repairs first common-mistake entries when wrong === fix.
   ========================================================================== */
const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const WORLDS_DIR = path.join(ROOT, "frontend", "worlds");

const hasLetterOrNumber = (value) => /[\p{L}\p{N}]/u.test(String(value || ""));

const trimHighlightEdges = (value) =>
  String(value || "")
    .trim()
    .replace(/^[\s\p{P}\p{S}]+|[\s\p{P}\p{S}]+$/gu, "")
    .trim();

const normalize = (value) =>
  String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();

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
  for (const start of starts) {
    let at = sourceLower.indexOf(targetLower, start);
    while (at >= 0) {
      return { start: at, end: at + target.length };
    }
  }
  return null;
};

const buildFallbackHighlights = (ruleOrder, sentence) => {
  const slots = (Array.isArray(ruleOrder) ? ruleOrder : [])
    .map((item) => String(item || "").trim())
    .filter(Boolean);
  const source = String(sentence || "").trim();
  if (slots.length < 2 || !source || !/\s/u.test(source)) {
    return [];
  }
  const cleaned = source.replace(/[\s\p{P}\p{S}]+$/gu, "").trim();
  const words = cleaned.split(/\s+/).filter((part) => hasLetterOrNumber(part));
  if (words.length < 2) {
    return [];
  }
  const highlights = [];
  if (words.length >= slots.length) {
    for (let i = 0; i < slots.length - 1; i += 1) {
      highlights.push({ label: slots[i], text: words[i] });
    }
    highlights.push({
      label: slots[slots.length - 1],
      text: words.slice(slots.length - 1).join(" "),
    });
    return highlights;
  }
  for (let i = 0; i < words.length - 1 && i < slots.length; i += 1) {
    highlights.push({ label: slots[i], text: words[i] });
  }
  highlights.push({
    label: slots[Math.min(slots.length - 1, words.length - 1)],
    text: words[words.length - 1],
  });
  return highlights;
};

const swapTwoPhrases = (sentence, phraseA, phraseB) => {
  const source = String(sentence || "");
  const a = String(phraseA || "").trim();
  const b = String(phraseB || "").trim();
  if (!source || !a || !b || normalize(a) === normalize(b)) {
    return "";
  }
  const spanA = findPhraseSpan(source, a, 0);
  if (!spanA) {
    return "";
  }
  const spanB = findPhraseSpan(source, b, spanA.end);
  if (!spanB) {
    return "";
  }
  if (spanB.start < spanA.end) {
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

const sameHighlights = (a, b) => {
  if (!Array.isArray(a) || !Array.isArray(b) || a.length !== b.length) {
    return false;
  }
  for (let i = 0; i < a.length; i += 1) {
    if (String(a[i]?.label || "") !== String(b[i]?.label || "")) {
      return false;
    }
    if (String(a[i]?.text || "") !== String(b[i]?.text || "")) {
      return false;
    }
  }
  return true;
};

const worldDirs = fs
  .readdirSync(WORLDS_DIR, { withFileTypes: true })
  .filter((entry) => entry.isDirectory())
  .map((entry) => entry.name)
  .filter((name) => name !== "english");

let totalCards = 0;
let changedCards = 0;
let fixedRuleOrderCount = 0;
let fixedHighlightCards = 0;
let fixedMistakeCards = 0;
const perWorld = {};

for (const worldKey of worldDirs) {
  const filePath = path.join(WORLDS_DIR, worldKey, "translations.json");
  if (!fs.existsSync(filePath)) {
    continue;
  }
  const raw = fs.readFileSync(filePath, "utf8");
  const data = JSON.parse(raw);
  const cardsBySection = data?.grammar?.cards;
  if (!cardsBySection || typeof cardsBySection !== "object") {
    continue;
  }
  let worldChanged = false;
  let worldChangedCards = 0;
  let worldRuleOrder = 0;
  let worldHighlights = 0;
  let worldMistakes = 0;

  for (const sectionName of Object.keys(cardsBySection)) {
    const cards = Array.isArray(cardsBySection[sectionName]) ? cardsBySection[sectionName] : [];
    cards.forEach((card) => {
      totalCards += 1;
      if (!card || typeof card !== "object") {
        return;
      }
      let cardChanged = false;
      const sentence = String(card.example || "").trim();
      const originalRuleOrder = Array.isArray(card.ruleOrder) ? card.ruleOrder : [];
      const normalizedRuleOrder = originalRuleOrder.map((slot) =>
        String(slot || "")
          .replace(/\s*\+\s*/g, " + ")
          .replace(/\s{2,}/g, " ")
          .trim()
      );
      if (JSON.stringify(originalRuleOrder) !== JSON.stringify(normalizedRuleOrder)) {
        card.ruleOrder = normalizedRuleOrder;
        fixedRuleOrderCount += 1;
        worldRuleOrder += 1;
        cardChanged = true;
      }

      const ruleOrder = Array.isArray(card.ruleOrder) ? card.ruleOrder : [];
      const sourceHighlights = Array.isArray(card.exampleHighlights) ? card.exampleHighlights : [];
      let rebuiltHighlights = [];

      if (ruleOrder.length >= 2 && sentence) {
        let cursor = 0;
        for (let i = 0; i < ruleOrder.length; i += 1) {
          const rawText = sourceHighlights[i]?.text;
          const text = trimHighlightEdges(rawText);
          if (!text || !hasLetterOrNumber(text)) {
            continue;
          }
          let span = findPhraseSpan(sentence, text, cursor);
          if (!span) {
            span = findPhraseSpan(sentence, text, 0);
          }
          if (!span) {
            continue;
          }
          const phrase = sentence.slice(span.start, span.end);
          const duplicate = rebuiltHighlights.some(
            (entry) => normalize(entry.text) === normalize(phrase)
          );
          if (!duplicate) {
            rebuiltHighlights.push({
              label: String(ruleOrder[i] || sourceHighlights[i]?.label || "").trim(),
              text: phrase,
            });
          }
          cursor = span.end;
        }
        if (rebuiltHighlights.length < 2) {
          rebuiltHighlights = buildFallbackHighlights(ruleOrder, sentence);
        }
      }

      if (rebuiltHighlights.length >= 2 && !sameHighlights(sourceHighlights, rebuiltHighlights)) {
        card.exampleHighlights = rebuiltHighlights;
        fixedHighlightCards += 1;
        worldHighlights += 1;
        cardChanged = true;
      }

      if (Array.isArray(card.mistakes) && card.mistakes.length > 0) {
        const firstMistake = card.mistakes[0];
        const wrong = String(firstMistake?.wrong || "").trim();
        const fix = String(firstMistake?.fix || "").trim();
        if (wrong && fix && wrong === fix) {
          const sourceForRepair =
            rebuiltHighlights.length >= 2
              ? rebuiltHighlights
              : Array.isArray(card.exampleHighlights)
                ? card.exampleHighlights
                : [];
          const phraseA = String(sourceForRepair[0]?.text || "").trim();
          const phraseB = String(sourceForRepair[1]?.text || "").trim();
          let repairedWrong = swapTwoPhrases(fix, phraseA, phraseB);
          if (!repairedWrong && /\s/u.test(fix)) {
            const words = fix.split(/\s+/).filter(Boolean);
            if (words.length >= 2) {
              const copy = [...words];
              const temp = copy[0];
              copy[0] = copy[1];
              copy[1] = temp;
              repairedWrong = copy.join(" ");
            }
          }
          if (repairedWrong && repairedWrong !== fix) {
            firstMistake.wrong = repairedWrong;
            fixedMistakeCards += 1;
            worldMistakes += 1;
            cardChanged = true;
          }
        }
      }

      if (cardChanged) {
        changedCards += 1;
        worldChangedCards += 1;
        worldChanged = true;
      }
    });
  }

  if (worldChanged) {
    fs.writeFileSync(filePath, `${JSON.stringify(data, null, 2)}\n`, "utf8");
  }
  perWorld[worldKey] = {
    changedCards: worldChangedCards,
    ruleOrderFixed: worldRuleOrder,
    highlightsFixed: worldHighlights,
    mistakesFixed: worldMistakes,
  };
}

console.log(
  JSON.stringify(
    {
      totalCards,
      changedCards,
      fixedRuleOrderCount,
      fixedHighlightCards,
      fixedMistakeCards,
      perWorld,
    },
    null,
    2
  )
);
