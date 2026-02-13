/* ==========================================================================
   SEO BASELINE CHECK
   - Enforces canonical metadata and structured-data baseline.
   - Ensures sitemap covers all root HTML pages.
   ========================================================================== */
const fs = require("fs");
const path = require("path");

/* --------------------------------------------------------------------------
   PATHS + CONFIG
   -------------------------------------------------------------------------- */
const ROOT = path.resolve(__dirname, "..");
const FRONTEND_ROOT = path.join(ROOT, "frontend");
const SITE_ORIGIN = "https://www.cosmicalearn.com";
const SITEMAP_PATH = path.join(FRONTEND_ROOT, "sitemap.xml");
const shouldSkipHtmlFile = (name) => {
  const lower = String(name || "").toLowerCase();
  return (
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

/* --------------------------------------------------------------------------
   HELPERS
   -------------------------------------------------------------------------- */
const readFile = (fileName) => fs.readFileSync(path.join(FRONTEND_ROOT, fileName), "utf8");

const expectedCanonicalForFile = (fileName) =>
  fileName === "index.html" ? `${SITE_ORIGIN}/` : `${SITE_ORIGIN}/${fileName}`;

/* --------------------------------------------------------------------------
   MAIN
   -------------------------------------------------------------------------- */
const failures = [];

for (const fileName of htmlFiles) {
  const content = readFile(fileName);
  const titleMatch = content.match(/<title>([^<]+)<\/title>/i);
  const descriptionMatch = content.match(
    /<meta[^>]*name=["']description["'][^>]*content=["']([^"']+)["'][^>]*>/i
  );
  const canonicalTags = content.match(/<link[^>]*rel=["']canonical["'][^>]*>/gi) || [];
  const canonicalHrefMatch = content.match(
    /<link[^>]*rel=["']canonical["'][^>]*href=["']([^"']+)["'][^>]*>/i
  );
  const ogUrlMatch = content.match(
    /<meta[^>]*property=["']og:url["'][^>]*content=["']([^"']+)["'][^>]*>/i
  );

  if (!titleMatch || !titleMatch[1].trim()) {
    failures.push(`${fileName}: missing non-empty <title>`);
  }

  if (!descriptionMatch || !descriptionMatch[1].trim()) {
    failures.push(`${fileName}: missing meta description`);
  }

  if (canonicalTags.length !== 1) {
    failures.push(`${fileName}: expected exactly one canonical tag, found ${canonicalTags.length}`);
  }

  const expectedCanonical = expectedCanonicalForFile(fileName);
  const actualCanonical = canonicalHrefMatch ? canonicalHrefMatch[1].trim() : "";
  if (!actualCanonical) {
    failures.push(`${fileName}: canonical href missing`);
  } else if (actualCanonical !== expectedCanonical) {
    failures.push(`${fileName}: canonical mismatch (expected ${expectedCanonical}, got ${actualCanonical})`);
  }

  if (!ogUrlMatch || ogUrlMatch[1].trim() !== expectedCanonical) {
    failures.push(`${fileName}: missing/invalid og:url (expected ${expectedCanonical})`);
  }

  if (!/application\/ld\+json/i.test(content)) {
    failures.push(`${fileName}: missing JSON-LD structured data`);
  }
}

if (!fs.existsSync(SITEMAP_PATH)) {
  failures.push("sitemap.xml is missing");
} else {
  const sitemap = fs.readFileSync(SITEMAP_PATH, "utf8");
  const missingFromSitemap = [];

  for (const fileName of htmlFiles) {
    const expectedUrl = fileName === "index.html" ? `${SITE_ORIGIN}/` : `${SITE_ORIGIN}/${fileName}`;
    if (!sitemap.includes(`<loc>${expectedUrl}</loc>`)) {
      missingFromSitemap.push(expectedUrl);
    }
  }

  if (missingFromSitemap.length) {
    failures.push(`sitemap.xml missing URLs: ${missingFromSitemap.join(", ")}`);
  }
}

if (failures.length) {
  console.error("SEO CHECK FAILED");
  failures.forEach((failure) => console.error(`- ${failure}`));
  process.exit(1);
}

console.log(`PASS [seo] metadata + structured-data baseline across ${htmlFiles.length} pages`);




