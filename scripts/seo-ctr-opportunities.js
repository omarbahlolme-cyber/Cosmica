/* ==========================================================================
   SEO CTR OPPORTUNITY REPORT
   - Reads Search Console page/query export CSV.
   - Surfaces high-impression, low-CTR pages with title/meta suggestions.
   - Does not edit HTML automatically (safe advisory mode).
   ========================================================================== */
const fs = require("fs");
const path = require("path");

/* --------------------------------------------------------------------------
   PATHS + CONFIG
   -------------------------------------------------------------------------- */
const ROOT = path.resolve(__dirname, "..");
const FRONTEND_ROOT = path.join(ROOT, "frontend");
const DEFAULT_INPUT = path.join(ROOT, "perf", "search-console-page-query.csv");
const DEFAULT_OUTPUT = path.join(ROOT, "perf", "seo-ctr-opportunities.json");
const SITE_ORIGIN = "https://www.cosmicalearn.com";

const BRAND_TERMS = ["cosmica", "cosmicalearn"];

const args = process.argv.slice(2);
const parseArg = (name, fallback) => {
  const exact = args.find((arg) => arg.startsWith(`${name}=`));
  if (exact) {
    return exact.slice(name.length + 1);
  }
  const index = args.indexOf(name);
  if (index >= 0 && args[index + 1]) {
    return args[index + 1];
  }
  return fallback;
};

const INPUT_PATH = path.resolve(parseArg("--input", DEFAULT_INPUT));
const OUTPUT_PATH = path.resolve(parseArg("--output", DEFAULT_OUTPUT));
const MIN_IMPRESSIONS = Number(parseArg("--min-impressions", 120));
const MAX_CTR = Number(parseArg("--max-ctr", 0.03));
const MAX_POSITION = Number(parseArg("--max-position", 20));
const LIMIT = Number(parseArg("--limit", 30));

/* --------------------------------------------------------------------------
   HELPERS
   -------------------------------------------------------------------------- */
const normalizeHeader = (value) =>
  String(value || "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ")
    .replace(/[^\w ]+/g, "");

const parseCsv = (text) => {
  const rows = [];
  let row = [];
  let field = "";
  let inQuotes = false;
  const source = String(text || "");
  for (let index = 0; index < source.length; index += 1) {
    const char = source[index];
    const nextChar = source[index + 1];
    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        field += '"';
        index += 1;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }
    if (char === "," && !inQuotes) {
      row.push(field);
      field = "";
      continue;
    }
    if ((char === "\n" || char === "\r") && !inQuotes) {
      if (char === "\r" && nextChar === "\n") {
        index += 1;
      }
      row.push(field);
      if (row.some((cell) => String(cell || "").trim())) {
        rows.push(row);
      }
      row = [];
      field = "";
      continue;
    }
    field += char;
  }
  row.push(field);
  if (row.some((cell) => String(cell || "").trim())) {
    rows.push(row);
  }
  return rows;
};

const asNumber = (value) => {
  const cleaned = String(value || "")
    .replace(/[%,$]/g, "")
    .replace(/\s+/g, "")
    .replace(/,/g, "");
  if (!cleaned) {
    return 0;
  }
  const numeric = Number(cleaned);
  return Number.isFinite(numeric) ? numeric : 0;
};

const toPath = (rawPage) => {
  const value = String(rawPage || "").trim();
  if (!value) {
    return "";
  }
  if (/^https?:\/\//i.test(value)) {
    try {
      const parsed = new URL(value);
      if (parsed.origin !== SITE_ORIGIN) {
        return "";
      }
      const cleanPath = String(parsed.pathname || "/").trim();
      return cleanPath === "/index.html" ? "/" : cleanPath || "/";
    } catch (_error) {
      return "";
    }
  }
  if (!value.startsWith("/")) {
    return `/${value}`;
  }
  return value === "/index.html" ? "/" : value;
};

const toFilePath = (pathName) => {
  if (!pathName) {
    return "";
  }
  const fileName = pathName === "/" ? "index.html" : pathName.replace(/^\/+/, "");
  if (!fileName.toLowerCase().endsWith(".html")) {
    return "";
  }
  const absolute = path.join(FRONTEND_ROOT, fileName);
  return fs.existsSync(absolute) ? absolute : "";
};

const readPageMeta = (pathName) => {
  const filePath = toFilePath(pathName);
  if (!filePath) {
    return { title: "", description: "" };
  }
  const html = fs.readFileSync(filePath, "utf8");
  const title = (html.match(/<title>([^<]+)<\/title>/i) || [null, ""])[1].trim();
  const description = (
    html.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']*)["'][^>]*>/i) || [null, ""]
  )[1].trim();
  return { title, description };
};

const titleCase = (value) =>
  String(value || "")
    .trim()
    .toLowerCase()
    .replace(/\b[a-z]/g, (match) => match.toUpperCase());

const isBrandQuery = (query) => {
  const normalized = String(query || "").toLowerCase();
  return BRAND_TERMS.some((term) => normalized.includes(term));
};

const pickPrimaryQuery = (rows) => {
  const sorted = [...rows].sort((a, b) => b.impressions - a.impressions);
  const preferred = sorted.find((row) => !isBrandQuery(row.query));
  return preferred || sorted[0] || null;
};

const clamp = (value, maxChars) => {
  const source = String(value || "").trim();
  if (source.length <= maxChars) {
    return source;
  }
  return `${source.slice(0, Math.max(0, maxChars - 1)).trimEnd()}...`;
};

const buildSuggestedTitle = (query, fallbackTitle) => {
  const queryTitle = titleCase(String(query || "").replace(/\s+/g, " "));
  if (!queryTitle) {
    return fallbackTitle || "";
  }
  return clamp(`${queryTitle} | Cosmica`, 60);
};

const buildSuggestedDescription = (queries) => {
  const topTerms = queries
    .filter((item) => !isBrandQuery(item.query))
    .sort((a, b) => b.impressions - a.impressions)
    .slice(0, 2)
    .map((item) => String(item.query || "").trim())
    .filter(Boolean);
  const joined = topTerms.length ? topTerms.join(" and ") : "language lessons";
  const text = `Learn ${joined} with structured lessons, audio, and guided practice on Cosmica.`;
  return clamp(text, 155);
};

/* --------------------------------------------------------------------------
   MAIN
   -------------------------------------------------------------------------- */
if (!fs.existsSync(INPUT_PATH)) {
  console.log("SKIP [seo-ctr] no Search Console CSV found");
  console.log(`- expected input: ${INPUT_PATH}`);
  console.log("- export a Search Console page/query report and rerun this script");
  process.exit(0);
}

const csvRaw = fs.readFileSync(INPUT_PATH, "utf8").replace(/^\uFEFF/, "");
const rows = parseCsv(csvRaw);
if (rows.length < 2) {
  console.error("SEO CTR REPORT FAILED");
  console.error("- input CSV has no data rows");
  process.exit(1);
}

const header = rows[0].map(normalizeHeader);
const dataRows = rows.slice(1);

const queryIndex = header.findIndex((name) => /(^query$|top query|queries)/.test(name));
const pageIndex = header.findIndex((name) => /(^page$|top page|landing page|url)/.test(name));
const clicksIndex = header.findIndex((name) => name === "clicks");
const impressionsIndex = header.findIndex((name) => /impressions/.test(name));
const ctrIndex = header.findIndex((name) => /ctr/.test(name));
const positionIndex = header.findIndex((name) => /position/.test(name));

if (queryIndex < 0 || pageIndex < 0 || impressionsIndex < 0) {
  console.error("SEO CTR REPORT FAILED");
  console.error("- required CSV columns missing (need query, page, impressions)");
  process.exit(1);
}

const parsedRows = dataRows
  .map((row) => {
    const query = String(row[queryIndex] || "").trim();
    const pagePath = toPath(row[pageIndex]);
    const impressions = asNumber(row[impressionsIndex]);
    const clicks = clicksIndex >= 0 ? asNumber(row[clicksIndex]) : 0;
    const ctrRaw = ctrIndex >= 0 ? asNumber(row[ctrIndex]) : 0;
    const ctr = ctrRaw > 1 ? ctrRaw / 100 : ctrRaw || (impressions > 0 ? clicks / impressions : 0);
    const position = positionIndex >= 0 ? asNumber(row[positionIndex]) : 999;
    return { query, pagePath, impressions, clicks, ctr, position };
  })
  .filter((row) => row.query && row.pagePath && row.impressions > 0);

const byPage = new Map();
parsedRows.forEach((row) => {
  const key = row.pagePath;
  if (!byPage.has(key)) {
    byPage.set(key, []);
  }
  byPage.get(key).push(row);
});

const opportunities = Array.from(byPage.entries())
  .map(([pagePath, pageRows]) => {
    const totals = pageRows.reduce(
      (acc, row) => {
        acc.impressions += row.impressions;
        acc.clicks += row.clicks;
        acc.positionWeighted += row.position * row.impressions;
        return acc;
      },
      { impressions: 0, clicks: 0, positionWeighted: 0 }
    );
    const pageCtr = totals.impressions > 0 ? totals.clicks / totals.impressions : 0;
    const avgPosition = totals.impressions > 0 ? totals.positionWeighted / totals.impressions : 999;
    const primaryQueryRow = pickPrimaryQuery(pageRows);
    const meta = readPageMeta(pagePath);
    const priorityScore =
      totals.impressions * Math.max(0, MAX_CTR - pageCtr + 0.005) * Math.max(0.4, (MAX_POSITION + 1 - avgPosition) / MAX_POSITION);

    return {
      pagePath,
      impressions: totals.impressions,
      clicks: totals.clicks,
      ctr: pageCtr,
      avgPosition,
      primaryQuery: primaryQueryRow ? primaryQueryRow.query : "",
      topQueries: pageRows
        .sort((a, b) => b.impressions - a.impressions)
        .slice(0, 5)
        .map((row) => ({
          query: row.query,
          impressions: row.impressions,
          clicks: row.clicks,
          ctr: row.ctr,
          position: row.position,
        })),
      currentTitle: meta.title,
      currentDescription: meta.description,
      suggestedTitle: buildSuggestedTitle(primaryQueryRow ? primaryQueryRow.query : "", meta.title),
      suggestedDescription: buildSuggestedDescription(pageRows),
      priorityScore,
    };
  })
  .filter((entry) => entry.impressions >= MIN_IMPRESSIONS)
  .filter((entry) => entry.ctr <= MAX_CTR)
  .filter((entry) => entry.avgPosition <= MAX_POSITION)
  .sort((a, b) => b.priorityScore - a.priorityScore)
  .slice(0, LIMIT);

const report = {
  generatedAt: new Date().toISOString(),
  config: {
    input: INPUT_PATH,
    output: OUTPUT_PATH,
    minImpressions: MIN_IMPRESSIONS,
    maxCtr: MAX_CTR,
    maxPosition: MAX_POSITION,
    limit: LIMIT,
  },
  analyzedRows: parsedRows.length,
  pagesWithData: byPage.size,
  opportunities,
};

fs.mkdirSync(path.dirname(OUTPUT_PATH), { recursive: true });
fs.writeFileSync(OUTPUT_PATH, `${JSON.stringify(report, null, 2)}\n`, "utf8");

console.log(`PASS [seo-ctr] analyzed rows=${parsedRows.length}, pages=${byPage.size}`);
console.log(`- opportunities found: ${opportunities.length}`);
console.log(`- report: ${OUTPUT_PATH}`);
opportunities.slice(0, 5).forEach((item, index) => {
  console.log(
    `${index + 1}. ${item.pagePath} | impressions=${item.impressions} ctr=${(item.ctr * 100).toFixed(
      2
    )}% pos=${item.avgPosition.toFixed(1)} | query="${item.primaryQuery}"`
  );
});

