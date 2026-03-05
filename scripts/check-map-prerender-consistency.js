/* ==========================================================================
   MAP PRERENDER CONSISTENCY CHECK
   - Validates static prerendered map sections on non-English map pages.
   - Guards against duplicate section keys and empty static sections.
   ========================================================================== */
const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const FRONTEND_ROOT = path.join(ROOT, "frontend");

const NON_ENGLISH_KEYS = [
  "arabic",
  "chinese",
  "dutch",
  "french",
  "german",
  "hindi",
  "japanese",
  "korean",
  "portuguese",
  "spanish",
  "swedish",
];

const MAP_CONFIG = [
  {
    mapKey: "words",
    fileForKey: (key) => `words-${key}.html`,
    sectionsContainerId: "wordsSections",
    sectionClass: "words-group",
    itemClass: "word-card",
  },
  {
    mapKey: "phrases",
    fileForKey: (key) => `phrases-${key}.html`,
    sectionsContainerId: "phrasesSections",
    sectionClass: "phrases-group",
    itemClass: "phrase-card",
  },
  {
    mapKey: "grammar",
    fileForKey: (key) => `grammar-${key}.html`,
    sectionsContainerId: "grammarSections",
    sectionClass: "grammar-group",
    itemClass: "grammar-card",
  },
];

const readFile = (fileName) => fs.readFileSync(path.join(FRONTEND_ROOT, fileName), "utf8");

const extractContainer = (html, containerId) => {
  const openTagRegex = new RegExp(`<div[^>]*id=["']${containerId}["'][^>]*>`, "i");
  const openMatch = html.match(openTagRegex);
  if (!openMatch || openMatch.index < 0) {
    return null;
  }
  const start = openMatch.index;
  const openTag = openMatch[0];
  const openEnd = start + openTag.length;
  let cursor = openEnd;
  let depth = 1;
  while (cursor < html.length && depth > 0) {
    const nextOpen = html.indexOf("<div", cursor);
    const nextClose = html.indexOf("</div>", cursor);
    if (nextClose < 0) {
      return null;
    }
    if (nextOpen >= 0 && nextOpen < nextClose) {
      depth += 1;
      cursor = nextOpen + 4;
      continue;
    }
    depth -= 1;
    cursor = nextClose + 6;
  }
  if (depth !== 0) {
    return null;
  }
  return {
    openTag,
    innerHtml: html.slice(openEnd, cursor - 6),
  };
};

const extractSectionBlocks = (innerHtml, sectionClass) => {
  const openRegex = new RegExp(
    `<section[^>]*class=["'][^"']*${sectionClass}[^"']*["'][^>]*data-section=["']([^"']+)["'][^>]*>`,
    "gi"
  );
  const blocks = [];
  let match = null;
  while ((match = openRegex.exec(innerHtml))) {
    const sectionKey = String(match[1] || "").trim();
    if (!sectionKey) {
      continue;
    }
    const openTag = match[0];
    const blockStart = match.index + openTag.length;
    const closeIndex = innerHtml.indexOf("</section>", blockStart);
    if (closeIndex < 0) {
      continue;
    }
    blocks.push({
      key: sectionKey,
      openTag,
      innerHtml: innerHtml.slice(blockStart, closeIndex),
    });
  }
  return blocks;
};

const countMatches = (value, regex) => {
  const matches = String(value || "").match(regex);
  return matches ? matches.length : 0;
};

const failures = [];
let checkedPages = 0;

for (const languageKey of NON_ENGLISH_KEYS) {
  for (const map of MAP_CONFIG) {
    const fileName = map.fileForKey(languageKey);
    const html = readFile(fileName);
    checkedPages += 1;

    const container = extractContainer(html, map.sectionsContainerId);
    if (!container) {
      failures.push(`${fileName}: missing #${map.sectionsContainerId} container`);
      continue;
    }
    if (!/data-static-prerender=["']true["']/i.test(container.openTag)) {
      failures.push(`${fileName}: #${map.sectionsContainerId} missing data-static-prerender="true"`);
    }
    if (!new RegExp(`data-prerender-map=["']${map.mapKey}["']`, "i").test(container.openTag)) {
      failures.push(`${fileName}: #${map.sectionsContainerId} missing data-prerender-map="${map.mapKey}"`);
    }

    const sectionBlocks = extractSectionBlocks(container.innerHtml, map.sectionClass);
    if (!sectionBlocks.length) {
      failures.push(`${fileName}: no static ${map.mapKey} sections found`);
      continue;
    }
    const sectionKeys = sectionBlocks.map((entry) => entry.key);

    const uniqueKeys = new Set(sectionKeys);
    if (uniqueKeys.size !== sectionKeys.length) {
      failures.push(`${fileName}: duplicate section keys in ${map.mapKey} static sections`);
    }

    for (const section of sectionBlocks) {
      if (!/data-prerendered=["']true["']/i.test(section.openTag)) {
        failures.push(`${fileName}: section "${section.key}" missing data-prerendered="true"`);
      }
      const sectionCardCount = countMatches(
        section.innerHtml,
        new RegExp(`class=["'][^"']*${map.itemClass}[^"']*["']`, "gi")
      );
      if (sectionCardCount < 1) {
        failures.push(
          `${fileName}: section "${section.key}" has no ${map.itemClass} cards in static prerender`
        );
      }
    }
  }
}

if (failures.length) {
  console.error("MAP PRERENDER CHECK FAILED");
  failures.forEach((failure) => console.error(`- ${failure}`));
  process.exit(1);
}

console.log(`PASS [map-prerender] validated ${checkedPages} non-English map pages`);
