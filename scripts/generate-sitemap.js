/* ==========================================================================
   SITEMAP GENERATOR
   - Rebuilds frontend/sitemap.xml from indexable root HTML files.
   - Keeps "/" canonical for index.html and excludes admin/verification files.
   ========================================================================== */
const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const FRONTEND_ROOT = path.join(ROOT, "frontend");
const SITEMAP_PATH = path.join(FRONTEND_ROOT, "sitemap.xml");
const SITE_ORIGIN = "https://www.cosmicalearn.com";

const shouldSkipHtmlFile = (name) => {
  const lower = String(name || "").toLowerCase();
  return (
    lower === "admin-security.html" ||
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

const urls = [
  `${SITE_ORIGIN}/`,
  ...htmlFiles
    .filter((fileName) => fileName !== "index.html")
    .map((fileName) => `${SITE_ORIGIN}/${fileName}`),
];

const lines = ['<?xml version="1.0" encoding="UTF-8"?>', '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">'];
for (const url of urls) {
  lines.push("  <url>");
  lines.push(`    <loc>${url}</loc>`);
  lines.push("  </url>");
}
lines.push("</urlset>", "");
const nextSitemap = lines.join("\n");

const currentSitemap = fs.existsSync(SITEMAP_PATH) ? fs.readFileSync(SITEMAP_PATH, "utf8") : "";
const changed = currentSitemap !== nextSitemap;
if (changed) {
  fs.writeFileSync(SITEMAP_PATH, nextSitemap, "utf8");
}

console.log(`PASS [sitemap] generated ${urls.length} URLs${changed ? " (updated file)" : " (no changes)"}`);
