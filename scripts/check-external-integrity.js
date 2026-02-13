/* ==========================================================================
   EXTERNAL RESOURCE INTEGRITY POLICY CHECK
   - Requires integrity+crossorigin on external scripts/styles OR an explicit
     data-sri-exempt reason for approved dynamic providers.
   ========================================================================== */
const fs = require("fs");
const path = require("path");

/* --------------------------------------------------------------------------
   PATHS + POLICY
   -------------------------------------------------------------------------- */
const ROOT = path.resolve(__dirname, "..");
const FRONTEND_ROOT = path.join(ROOT, "frontend");
const htmlFiles = fs
  .readdirSync(FRONTEND_ROOT, { withFileTypes: true })
  .filter((entry) => entry.isFile())
  .map((entry) => entry.name)
  .filter((name) => name.toLowerCase().endsWith(".html"))
  .filter((name) => !name.toLowerCase().startsWith("live_"))
  .sort();

const EXEMPT_HOST_ALLOWLIST = new Set(["fonts.googleapis.com", "static.cloudflareinsights.com"]);

/* --------------------------------------------------------------------------
   HELPERS
   -------------------------------------------------------------------------- */
const getAttr = (tag, attrName) => {
  const regex = new RegExp(`\\b${attrName}=["']([^"']+)["']`, "i");
  const match = tag.match(regex);
  return match ? match[1].trim() : "";
};

const getHost = (urlValue) => {
  try {
    return new URL(urlValue).hostname.toLowerCase();
  } catch {
    return "";
  }
};

const isExternalUrl = (value) => /^https?:\/\//i.test(value || "");

/* --------------------------------------------------------------------------
   MAIN
   -------------------------------------------------------------------------- */
const failures = [];

for (const fileName of htmlFiles) {
  const content = fs.readFileSync(path.join(FRONTEND_ROOT, fileName), "utf8");

  const scriptTags = content.match(/<script\b[^>]*\bsrc=["'][^"']+["'][^>]*>/gi) || [];
  const stylesheetTags =
    content.match(/<link\b[^>]*\brel=["']stylesheet["'][^>]*\bhref=["'][^"']+["'][^>]*>/gi) || [];
  const tags = [...scriptTags, ...stylesheetTags];

  for (const tag of tags) {
    const srcOrHref = getAttr(tag, "src") || getAttr(tag, "href");
    if (!isExternalUrl(srcOrHref)) {
      continue;
    }

    const hasIntegrity = Boolean(getAttr(tag, "integrity"));
    const hasCrossorigin = /\bcrossorigin(?:=["'][^"']*["'])?/i.test(tag);
    const exemptReason = getAttr(tag, "data-sri-exempt");
    const host = getHost(srcOrHref);

    if (hasIntegrity) {
      if (!hasCrossorigin) {
        failures.push(`${fileName}: external tag has integrity but missing crossorigin (${srcOrHref})`);
      }
      continue;
    }

    if (!exemptReason) {
      failures.push(`${fileName}: external tag missing integrity and data-sri-exempt (${srcOrHref})`);
      continue;
    }

    if (!EXEMPT_HOST_ALLOWLIST.has(host)) {
      failures.push(`${fileName}: unapproved data-sri-exempt host ${host} (${srcOrHref})`);
    }
  }
}

if (failures.length) {
  console.error("INTEGRITY CHECK FAILED");
  failures.forEach((failure) => console.error(`- ${failure}`));
  process.exit(1);
}

console.log(`PASS [integrity] external script/style policy across ${htmlFiles.length} pages`);

