/* ==========================================================================
   SEO INTERNAL LINK CHECK
   - Builds an internal-link graph for indexable HTML pages.
   - Fails on orphan pages or missing core navigation between world/map pages.
   ========================================================================== */
const fs = require("fs");
const path = require("path");

/* --------------------------------------------------------------------------
   PATHS + CONFIG
   -------------------------------------------------------------------------- */
const ROOT = path.resolve(__dirname, "..");
const FRONTEND_ROOT = path.join(ROOT, "frontend");
const SITE_ORIGIN = "https://www.cosmicalearn.com";
const MIN_OUTBOUND_LINKS_PER_PAGE = 1;

const shouldSkipHtmlFile = (name) => {
  const lower = String(name || "").toLowerCase();
  return (
    lower === "admin-security.html" ||
    lower === "offline.html" ||
    lower.startsWith("live_") ||
    /^naver[a-z0-9]+\.html$/i.test(lower) ||
    /^google[a-z0-9]+\.html$/i.test(lower) ||
    /^bing[a-z0-9]+\.html$/i.test(lower) ||
    /^baidu_verify_[a-z0-9]+\.html$/i.test(lower)
  );
};

const htmlFiles = fs
  .readdirSync(FRONTEND_ROOT, { withFileTypes: true })
  .filter((entry) => entry.isFile())
  .map((entry) => entry.name)
  .filter((name) => name.toLowerCase().endsWith(".html"))
  .filter((name) => !shouldSkipHtmlFile(name))
  .sort();

const toPathFromFile = (fileName) => (fileName === "index.html" ? "/" : `/${fileName}`);
const toFileFromPath = (pathName) => {
  if (pathName === "/") {
    return "index.html";
  }
  const normalized = String(pathName || "").replace(/^\/+/, "");
  return normalized || "index.html";
};

const indexablePathSet = new Set(htmlFiles.map(toPathFromFile));

/* --------------------------------------------------------------------------
   HELPERS
   -------------------------------------------------------------------------- */
const readFile = (fileName) => fs.readFileSync(path.join(FRONTEND_ROOT, fileName), "utf8");

const normalizeHrefPath = (href, fromFileName) => {
  const raw = String(href || "").trim();
  if (!raw) {
    return null;
  }
  if (/^(mailto:|tel:|javascript:|data:)/i.test(raw)) {
    return null;
  }
  if (raw.startsWith("#")) {
    return null;
  }

  let pathName = "";
  if (/^https?:\/\//i.test(raw)) {
    try {
      const parsed = new URL(raw);
      if (parsed.origin !== SITE_ORIGIN) {
        return null;
      }
      pathName = parsed.pathname || "/";
    } catch (_error) {
      return null;
    }
  } else if (raw.startsWith("/")) {
    pathName = raw;
  } else {
    const basePath = `/${String(fromFileName || "index.html").replace(/\\/g, "/")}`;
    try {
      const parsed = new URL(raw, `${SITE_ORIGIN}${basePath}`);
      if (parsed.origin !== SITE_ORIGIN) {
        return null;
      }
      pathName = parsed.pathname || "/";
    } catch (_error) {
      return null;
    }
  }

  pathName = String(pathName || "").split("#")[0].split("?")[0].trim();
  if (!pathName) {
    pathName = "/";
  }
  if (pathName === "/index.html") {
    pathName = "/";
  }
  if (!pathName.startsWith("/")) {
    pathName = `/${pathName}`;
  }
  return pathName;
};

const extractInternalLinks = (html, fileName) => {
  const links = new Set();
  const anchorRegex = /<a\b[^>]*href=["']([^"']+)["'][^>]*>/gi;
  let match = null;
  while ((match = anchorRegex.exec(html)) !== null) {
    const href = String(match[1] || "").trim();
    const normalizedPath = normalizeHrefPath(href, fileName);
    if (!normalizedPath) {
      continue;
    }
    if (indexablePathSet.has(normalizedPath)) {
      links.add(normalizedPath);
    }
  }
  return links;
};

const getWorldKeyFromWorldFile = (fileName) => {
  if (fileName === "english-world.html") {
    return "english";
  }
  const match = String(fileName).match(/^world-([a-z]+)\.html$/i);
  return match ? String(match[1]).toLowerCase() : "";
};

const getMapTypeAndWorldFromFile = (fileName) => {
  const lower = String(fileName || "").toLowerCase();
  const englishMatch = lower.match(/^english-(letters|words|phrases|grammar)\.html$/);
  if (englishMatch) {
    return { mapType: englishMatch[1], worldKey: "english" };
  }
  const worldMatch = lower.match(/^(letters|words|phrases|grammar)-([a-z]+)\.html$/);
  if (worldMatch) {
    return { mapType: worldMatch[1], worldKey: worldMatch[2] };
  }
  return null;
};

const worldPathForKey = (worldKey) => (worldKey === "english" ? "/english-world.html" : `/world-${worldKey}.html`);
const mapPathForKey = (worldKey, mapType) =>
  worldKey === "english" ? `/english-${mapType}.html` : `/${mapType}-${worldKey}.html`;

/* --------------------------------------------------------------------------
   MAIN
   -------------------------------------------------------------------------- */
const failures = [];
const outLinkGraph = new Map();
const inLinkCounts = new Map();

htmlFiles.forEach((fileName) => {
  const fromPath = toPathFromFile(fileName);
  outLinkGraph.set(fromPath, new Set());
  inLinkCounts.set(fromPath, 0);
});

for (const fileName of htmlFiles) {
  const fromPath = toPathFromFile(fileName);
  const html = readFile(fileName);
  const links = extractInternalLinks(html, fileName);
  outLinkGraph.set(fromPath, links);

  links.forEach((toPath) => {
    if (!inLinkCounts.has(toPath)) {
      return;
    }
    inLinkCounts.set(toPath, Number(inLinkCounts.get(toPath) || 0) + 1);
  });
}

for (const fileName of htmlFiles) {
  const pagePath = toPathFromFile(fileName);
  const outLinks = outLinkGraph.get(pagePath) || new Set();
  const inLinks = Number(inLinkCounts.get(pagePath) || 0);

  if (outLinks.size < MIN_OUTBOUND_LINKS_PER_PAGE) {
    failures.push(`${fileName}: has no crawlable internal <a href> links`);
  }
  if (pagePath !== "/" && inLinks < 1) {
    failures.push(`${fileName}: has no inbound internal links (orphan risk)`);
  }

  const worldKey = getWorldKeyFromWorldFile(fileName);
  if (worldKey) {
    ["letters", "words", "phrases", "grammar"].forEach((mapType) => {
      const expectedMapPath = mapPathForKey(worldKey, mapType);
      if (!outLinks.has(expectedMapPath)) {
        failures.push(`${fileName}: missing internal link to ${expectedMapPath}`);
      }
    });
    continue;
  }

  const mapInfo = getMapTypeAndWorldFromFile(fileName);
  if (mapInfo) {
    const expectedWorldPath = worldPathForKey(mapInfo.worldKey);
    if (!outLinks.has(expectedWorldPath)) {
      failures.push(`${fileName}: missing return link to ${expectedWorldPath}`);
    }
  }
}

if (failures.length) {
  console.error("SEO INTERNAL LINK CHECK FAILED");
  failures.forEach((failure) => console.error(`- ${failure}`));
  process.exit(1);
}

const pageCount = htmlFiles.length;
const edgeCount = Array.from(outLinkGraph.values()).reduce((sum, links) => sum + links.size, 0);
const orphanCount = Array.from(inLinkCounts.entries()).filter(
  ([pagePath, count]) => pagePath !== "/" && Number(count || 0) < 1
).length;
console.log(`PASS [seo-links] ${pageCount} pages, ${edgeCount} internal links, orphan pages=${orphanCount}`);

