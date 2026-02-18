/* ==========================================================================
   LEARNING MAPS AUDIT
   Deep static audit for:
   - letters/words/phrases/grammar map pages
   - world translation packs
   - grammar pedagogy consistency
   ========================================================================== */
const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const FRONTEND_ROOT = path.join(ROOT, "frontend");
const WORLDS_ROOT = path.join(FRONTEND_ROOT, "worlds");

const WORD_SECTION_ORDER = [
  "Greetings",
  "Pronouns",
  "Verbs & Tenses",
  "Questions & Connectors",
  "Numbers & Counting",
  "Time, Date & Frequency",
  "Descriptions & Adjectives",
  "Opinions & Preferences",
  "Weather & Seasons",
  "Places & Directions",
  "countries",
  "Feelings & States",
  "Family & Relationships",
  "Food & Eating",
  "Health & Body",
  "Technology & Communication",
  "Work & School",
];

const PHRASE_SECTION_ORDER = [
  "Greetings",
  "Politeness",
  "Introductions",
  "Conversation",
  "Questions",
  "Requests",
  "Time & Plans",
  "Directions",
  "Food",
  "Shopping",
  "Health",
  "Feelings",
  "Opinions",
  "Work & Study",
  "Problems",
  "Everyday Expressions",
];

const GRAMMAR_SECTION_ORDER = [
  "Sentence Structure",
  "Verbs",
  "Tenses & Aspect",
  "Nouns & Articles",
  "Pronouns & Reference",
  "Modifiers",
  "Questions",
  "Negation",
  "Connections",
  "Conditions",
  "Voice & Focus",
  "Modality",
  "Reported Speech",
  "Formality & Style",
  "Discourse & Flow",
];

const LEGACY_ENGLISH_SOURCES = new Set([
  "i am learning english",
  "i speak english",
  "i do not speak english",
  "do you speak english",
]);

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
  const setA = new Set(tokenize(a));
  const setB = new Set(tokenize(b));
  if (!setA.size || !setB.size) {
    return 0;
  }
  let intersection = 0;
  setA.forEach((value) => {
    if (setB.has(value)) {
      intersection += 1;
    }
  });
  const union = setA.size + setB.size - intersection;
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

const findings = [];

const pushFinding = (severity, file, message) => {
  findings.push({ severity, file, message });
};

const checkMapPages = () => {
  const files = fs
    .readdirSync(FRONTEND_ROOT)
    .filter((name) => name.endsWith(".html"))
    .sort();

  const lettersPages = files.filter((name) => /^letters-(english|[a-z]+)\.html$/i.test(name));
  const wordsPages = files.filter((name) => /^words-(english|[a-z]+)\.html$/i.test(name));
  const phrasesPages = files.filter((name) => /^phrases-(english|[a-z]+)\.html$/i.test(name));
  const grammarPages = files.filter((name) => /^grammar-(english|[a-z]+)\.html$/i.test(name));

  const checkViewportMeta = (fileName, content) => {
    if (!/name=["']viewport["'][^>]*viewport-fit=cover/i.test(content)) {
      pushFinding("medium", fileName, "Missing viewport-fit=cover meta (mobile safe-area risk).");
    }
  };

  files.forEach((fileName) => {
    const content = fs.readFileSync(path.join(FRONTEND_ROOT, fileName), "utf8");
    if (/-(english|french|german|spanish|portuguese|dutch|swedish|arabic|chinese|japanese|korean|hindi)\.html$/i.test(fileName)) {
      checkViewportMeta(fileName, content);
    }
  });

  lettersPages.forEach((fileName) => {
    const content = fs.readFileSync(path.join(FRONTEND_ROOT, fileName), "utf8");
    if (!/class=["'][^"']*\bletters-page\b/i.test(content)) {
      pushFinding("high", fileName, "Missing letters-page body class.");
    }
    if (!/id=["']letters["']/i.test(content)) {
      pushFinding("high", fileName, "Missing #letters section anchor.");
    }
    const letters = [...content.matchAll(/<div class=["']letter["']>([^<]+)<\/div>/gi)].map((m) =>
      String(m[1] || "").trim()
    );
    const buttonLetters = [
      ...content.matchAll(/class=["'][^"']*\bletter-audio\b[^"']*["'][^>]*\bdata-letter=["']([^"']+)["']/gi),
    ].map((m) => String(m[1] || "").trim());
    if (!letters.length) {
      pushFinding("high", fileName, "No letter cards found.");
    }
    if (letters.length !== buttonLetters.length) {
      pushFinding(
        "high",
        fileName,
        `Letter/button count mismatch: letters=${letters.length}, buttons=${buttonLetters.length}.`
      );
    }
    const pairCount = Math.min(letters.length, buttonLetters.length);
    for (let i = 0; i < pairCount; i += 1) {
      if (normalize(letters[i]) !== normalize(buttonLetters[i])) {
        pushFinding(
          "high",
          fileName,
          `Letter mismatch at index ${i}: card="${letters[i]}" button="${buttonLetters[i]}".`
        );
      }
    }
    const duplicates = letters.filter(
      (value, idx) => letters.findIndex((other) => normalize(other) === normalize(value)) !== idx
    );
    if (duplicates.length) {
      pushFinding(
        "medium",
        fileName,
        `Duplicate letters detected: ${[...new Set(duplicates)].join(", ")}.`
      );
    }
  });

  const checkMapShell = (fileName, content, pageClass, sectionId, controlsId) => {
    if (!new RegExp(`\\b${pageClass}\\b`, "i").test(content)) {
      pushFinding("high", fileName, `Missing ${pageClass} body class.`);
    }
    if (!new RegExp(`id=["']${sectionId}["']`, "i").test(content)) {
      pushFinding("high", fileName, `Missing #${sectionId} container.`);
    }
    if (!new RegExp(`id=["']${controlsId}["']`, "i").test(content)) {
      pushFinding("high", fileName, `Missing #${controlsId} controls container.`);
    }
  };

  wordsPages.forEach((fileName) => {
    const content = fs.readFileSync(path.join(FRONTEND_ROOT, fileName), "utf8");
    checkMapShell(fileName, content, "words-page", "wordsSections", "wordsControls");
  });

  phrasesPages.forEach((fileName) => {
    const content = fs.readFileSync(path.join(FRONTEND_ROOT, fileName), "utf8");
    checkMapShell(fileName, content, "phrases-page", "phrasesSections", "phrasesControls");
  });

  grammarPages.forEach((fileName) => {
    const content = fs.readFileSync(path.join(FRONTEND_ROOT, fileName), "utf8");
    checkMapShell(fileName, content, "grammar-page", "grammarSections", "grammarControls");
  });
};

const checkWorldPacks = () => {
  const worldDirs = fs
    .readdirSync(WORLDS_ROOT, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .sort();

  worldDirs.forEach((worldKey) => {
    if (worldKey === "english") {
      return;
    }
    const packPath = path.join(WORLDS_ROOT, worldKey, "translations.json");
    if (!fs.existsSync(packPath)) {
      pushFinding("high", `worlds/${worldKey}`, "Missing translations.json");
      return;
    }
    const pack = JSON.parse(fs.readFileSync(packPath, "utf8"));

    if (!pack.words || typeof pack.words !== "object") {
      pushFinding("high", `worlds/${worldKey}/translations.json`, "Missing words payload.");
    } else {
      WORD_SECTION_ORDER.forEach((section) => {
        if (!pack.words[section] || typeof pack.words[section] !== "object") {
          pushFinding(
            "high",
            `worlds/${worldKey}/translations.json`,
            `Missing words section: "${section}".`
          );
          return;
        }
        const entries = Object.entries(pack.words[section]).filter(
          ([key]) => !["sectionLabels", "ui"].includes(key)
        );
        if (!entries.length) {
          pushFinding(
            "high",
            `worlds/${worldKey}/translations.json`,
            `Empty words section: "${section}".`
          );
        }
        entries.forEach(([entryKey, payload]) => {
          if (!payload || typeof payload !== "object") {
            pushFinding(
              "high",
              `worlds/${worldKey}/translations.json`,
              `Invalid word payload for "${entryKey}" in section "${section}".`
            );
            return;
          }
          if (!String(payload.source || "").trim()) {
            pushFinding(
              "medium",
              `worlds/${worldKey}/translations.json`,
              `Missing word source for "${entryKey}" in "${section}".`
            );
          }
        });
      });
      if (!pack.words.sectionLabels || typeof pack.words.sectionLabels !== "object") {
        pushFinding(
          "medium",
          `worlds/${worldKey}/translations.json`,
          "Missing words.sectionLabels (section headings may fall back to English)."
        );
      }
    }

    if (!pack.phrases || typeof pack.phrases !== "object") {
      pushFinding("high", `worlds/${worldKey}/translations.json`, "Missing phrases payload.");
    } else {
      PHRASE_SECTION_ORDER.forEach((section) => {
        if (!pack.phrases[section] || typeof pack.phrases[section] !== "object") {
          pushFinding(
            "high",
            `worlds/${worldKey}/translations.json`,
            `Missing phrases section: "${section}".`
          );
          return;
        }
        const entries = Object.entries(pack.phrases[section]).filter(
          ([key]) => !["sectionLabels", "ui"].includes(key)
        );
        if (!entries.length) {
          pushFinding(
            "high",
            `worlds/${worldKey}/translations.json`,
            `Empty phrases section: "${section}".`
          );
        }
        entries.forEach(([entryKey, payload]) => {
          if (!payload || typeof payload !== "object") {
            pushFinding(
              "high",
              `worlds/${worldKey}/translations.json`,
              `Invalid phrase payload for "${entryKey}" in section "${section}".`
            );
            return;
          }
          const source = String(payload.source || "").trim();
          if (!source) {
            pushFinding(
              "medium",
              `worlds/${worldKey}/translations.json`,
              `Missing phrase source for "${entryKey}" in "${section}".`
            );
          }
          if (LEGACY_ENGLISH_SOURCES.has(normalize(source))) {
            pushFinding(
              "high",
              `worlds/${worldKey}/translations.json`,
              `Legacy English intent phrase still present in "${section}": "${source}".`
            );
          }
        });
      });
      if (!pack.phrases.sectionLabels || typeof pack.phrases.sectionLabels !== "object") {
        pushFinding(
          "medium",
          `worlds/${worldKey}/translations.json`,
          "Missing phrases.sectionLabels (phrase section headings may fall back to English)."
        );
      }
    }

    if (!pack.grammar || typeof pack.grammar !== "object") {
      pushFinding("high", `worlds/${worldKey}/translations.json`, "Missing grammar payload.");
    } else {
      const cards = pack.grammar.cards;
      if (!cards || typeof cards !== "object") {
        pushFinding("high", `worlds/${worldKey}/translations.json`, "Missing grammar.cards");
      } else {
        GRAMMAR_SECTION_ORDER.forEach((section) => {
          const sectionCards = cards[section];
          if (!Array.isArray(sectionCards)) {
            pushFinding(
              "high",
              `worlds/${worldKey}/translations.json`,
              `Missing grammar section cards: "${section}".`
            );
            return;
          }
          if (!sectionCards.length) {
            pushFinding(
              "high",
              `worlds/${worldKey}/translations.json`,
              `Empty grammar cards array: "${section}".`
            );
            return;
          }
          sectionCards.forEach((card, index) => {
            const cardTag = `${section}[${index}]`;
            if (!String(card?.title || "").trim()) {
              pushFinding(
                "high",
                `worlds/${worldKey}/translations.json`,
                `Missing grammar card title at ${cardTag}.`
              );
            }
            const points = Array.isArray(card?.points) ? card.points : [];
            if (points.length < 2) {
              pushFinding(
                "medium",
                `worlds/${worldKey}/translations.json`,
                `Too few rule points at ${cardTag} (found ${points.length}).`
              );
            }
            const example = String(card?.example || "").trim();
            if (!example) {
              pushFinding(
                "high",
                `worlds/${worldKey}/translations.json`,
                `Missing example at ${cardTag}.`
              );
            }
            const ruleOrder = Array.isArray(card?.ruleOrder) ? card.ruleOrder : [];
            if (ruleOrder.length < 2) {
              pushFinding(
                "high",
                `worlds/${worldKey}/translations.json`,
                `Invalid ruleOrder at ${cardTag} (len=${ruleOrder.length}).`
              );
            }
            if (ruleOrder.some((slot) => String(slot || "").includes("+") && !/\s\+\s/.test(String(slot)))) {
              pushFinding(
                "medium",
                `worlds/${worldKey}/translations.json`,
                `Unspaced '+' in ruleOrder at ${cardTag}.`
              );
            }

            const highlights = Array.isArray(card?.exampleHighlights) ? card.exampleHighlights : [];
            if (highlights.length < 2) {
              pushFinding(
                "high",
                `worlds/${worldKey}/translations.json`,
                `Too few exampleHighlights at ${cardTag} (len=${highlights.length}).`
              );
            }
            let cursor = 0;
            highlights.forEach((entry, highlightIndex) => {
              const text = String(entry?.text || "").trim();
              if (!text) {
                pushFinding(
                  "high",
                  `worlds/${worldKey}/translations.json`,
                  `Empty highlight text at ${cardTag}.exampleHighlights[${highlightIndex}].`
                );
                return;
              }
              if (!hasLetterOrNumber(text)) {
                pushFinding(
                  "high",
                  `worlds/${worldKey}/translations.json`,
                  `Punctuation-only highlight at ${cardTag}: "${text}".`
                );
                return;
              }
              const span = findPhraseSpan(example, text, cursor) || findPhraseSpan(example, text, 0);
              if (!span) {
                pushFinding(
                  "high",
                  `worlds/${worldKey}/translations.json`,
                  `Highlight text not found in example at ${cardTag}: "${text}".`
                );
                return;
              }
              cursor = span.end;
            });

            const mistakes = Array.isArray(card?.mistakes) ? card.mistakes : [];
            if (!mistakes.length) {
              pushFinding(
                "high",
                `worlds/${worldKey}/translations.json`,
                `Missing mistakes at ${cardTag}.`
              );
            } else {
              const first = mistakes[0] || {};
              const wrong = String(first.wrong || "").trim();
              const fix = String(first.fix || "").trim();
              if (!wrong || !fix) {
                pushFinding(
                  "high",
                  `worlds/${worldKey}/translations.json`,
                  `Incomplete first mistake at ${cardTag}.`
                );
              } else if (wrong === fix) {
                pushFinding(
                  "high",
                  `worlds/${worldKey}/translations.json`,
                  `First mistake wrong===fix at ${cardTag}.`
                );
              } else {
                const relation = Math.max(jaccard(fix, example), jaccard(wrong, example));
                if (relation < 0.15) {
                  pushFinding(
                    "medium",
                    `worlds/${worldKey}/translations.json`,
                    `First mistake may be off-topic at ${cardTag} (similarity=${relation.toFixed(2)}).`
                  );
                }
              }
            }
          });
        });
      }
      if (!pack.grammar.sectionLabels || typeof pack.grammar.sectionLabels !== "object") {
        pushFinding(
          "medium",
          `worlds/${worldKey}/translations.json`,
          "Missing grammar.sectionLabels (section headings may fall back to English)."
        );
      }
    }
  });
};

const checkMobileCssPrerequisites = () => {
  const stylePath = path.join(FRONTEND_ROOT, "style.css");
  const mapsStylePath = path.join(FRONTEND_ROOT, "maps", "style-maps.css");
  const appJsPath = path.join(FRONTEND_ROOT, "app.js");

  const style = fs.readFileSync(stylePath, "utf8");
  const mapsStyle = fs.readFileSync(mapsStylePath, "utf8");
  const appJs = fs.readFileSync(appJsPath, "utf8");

  if (!/--vh\s*:\s*1vh/i.test(style)) {
    pushFinding("high", "frontend/style.css", "Missing --vh fallback variable.");
  }
  if (!/env\(safe-area-inset-bottom\)/i.test(style + mapsStyle)) {
    pushFinding("high", "frontend/style.css", "Missing safe-area inset handling.");
  }
  if (!/setupDynamicViewportHeight/i.test(appJs)) {
    pushFinding("high", "frontend/app.js", "Missing dynamic viewport stabilizer.");
  }
  if (!/@media\s*\(max-width:\s*600px\)/i.test(style + mapsStyle)) {
    pushFinding("medium", "frontend/style.css", "Missing narrow-screen media query at <=600px.");
  }
};

const main = () => {
  checkMapPages();
  checkWorldPacks();
  checkMobileCssPrerequisites();

  const summary = {
    total: findings.length,
    high: findings.filter((f) => f.severity === "high").length,
    medium: findings.filter((f) => f.severity === "medium").length,
  };
  console.log(JSON.stringify({ summary, findings }, null, 2));
  if (summary.high > 0) {
    process.exitCode = 1;
  }
};

main();
