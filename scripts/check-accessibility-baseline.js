/* ==========================================================================
   ACCESSIBILITY BASELINE CHECK
   - Enforces foundational accessibility structure across static HTML pages.
   ========================================================================== */
const fs = require("fs");
const path = require("path");

/* --------------------------------------------------------------------------
   PATHS
   -------------------------------------------------------------------------- */
const ROOT = path.resolve(__dirname, "..");
const FRONTEND_ROOT = path.join(ROOT, "frontend");
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
const countMatches = (content, regex) => {
  const matches = content.match(regex);
  return matches ? matches.length : 0;
};

/* --------------------------------------------------------------------------
   MAIN
   -------------------------------------------------------------------------- */
const failures = [];

for (const fileName of htmlFiles) {
  const content = fs.readFileSync(path.join(FRONTEND_ROOT, fileName), "utf8");

  if (!/<html[^>]*\blang=["'][^"']+["']/i.test(content)) {
    failures.push(`${fileName}: missing <html lang="...">`);
  }

  if (!/<main[\s>]/i.test(content)) {
    failures.push(`${fileName}: missing <main> landmark`);
  }

  const h1Count = countMatches(content, /<h1[\s>]/gi);
  if (h1Count !== 1) {
    failures.push(`${fileName}: expected exactly one <h1>, found ${h1Count}`);
  }

  const navTags = content.match(/<nav\b[^>]*class=["'][^"']*\bnav-links\b[^"']*["'][^>]*>/gi) || [];
  if (!navTags.length) {
    failures.push(`${fileName}: missing .nav-links navigation`);
  } else {
    navTags.forEach((tag) => {
      if (!/\baria-label=["'][^"']+["']/i.test(tag)) {
        failures.push(`${fileName}: .nav-links is missing aria-label`);
      }
    });
  }
}

if (failures.length) {
  console.error("ACCESSIBILITY CHECK FAILED");
  failures.forEach((failure) => console.error(`- ${failure}`));
  process.exit(1);
}

console.log(`PASS [a11y] baseline checks across ${htmlFiles.length} pages`);

