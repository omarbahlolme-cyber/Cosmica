/* ==========================================================================
   HTML BASELINE APPLIER
   - Ensures accessibility and SEO baseline tags across all root HTML pages.
   - Adds explicit third-party integrity exemptions for dynamic upstream assets.
   ========================================================================== */
const fs = require("fs");
const path = require("path");

/* --------------------------------------------------------------------------
   CONFIG
   -------------------------------------------------------------------------- */
const ROOT = path.resolve(__dirname, "..");
const SITE_ORIGIN = "https://www.cosmicalearn.com";

/* --------------------------------------------------------------------------
   HELPERS
   -------------------------------------------------------------------------- */
const toHeadingFromTitle = (title) => {
  const trimmed = String(title || "").trim();
  return trimmed.replace(/^Cosmica\s*\|\s*/i, "").trim() || "Cosmica Page";
};

const toCanonicalPath = (canonicalUrl) => {
  try {
    const url = new URL(canonicalUrl);
    const pathname = url.pathname || "/";
    return pathname === "/" ? "/" : pathname;
  } catch {
    return "/";
  }
};

const escapeJson = (value) => JSON.stringify(String(value || ""));

const addAttributeToTag = (tag, attributeText) => {
  if (tag.endsWith("/>")) {
    return tag.replace(/\/>$/, ` ${attributeText} />`);
  }
  return tag.replace(/>$/, ` ${attributeText}>`);
};

const annotateThirdPartyTags = (html) => {
  let next = html.replace(/<link\b[^>]*>/gi, (tag) => {
    const isStylesheet = /\brel=["']stylesheet["']/i.test(tag);
    const isGoogleFontsStylesheet = /\bhref=["']https:\/\/fonts\.googleapis\.com\/css2/i.test(tag);
    if (!isStylesheet || !isGoogleFontsStylesheet || /\bdata-sri-exempt=/i.test(tag)) {
      return tag;
    }
    return addAttributeToTag(tag, 'data-sri-exempt="google-fonts-dynamic-css"');
  });

  next = next.replace(/<script\b[^>]*>/gi, (tag) => {
    const isCloudflareAnalytics = /\bsrc=["']https:\/\/static\.cloudflareinsights\.com\/beacon\.min\.js/i.test(tag);
    if (!isCloudflareAnalytics || /\bdata-sri-exempt=/i.test(tag)) {
      return tag;
    }
    let patched = addAttributeToTag(tag, 'data-sri-exempt="cloudflare-beacon-dynamic-script"');
    if (!/\bcrossorigin=/i.test(patched)) {
      patched = addAttributeToTag(patched, 'crossorigin="anonymous"');
    }
    return patched;
  });

  return next;
};

const buildWebPageSchemaBlock = ({ title, description, canonicalUrl }) => {
  const schema = [
    "    <script type=\"application/ld+json\">",
    "      {",
    "        \"@context\": \"https://schema.org\",",
    "        \"@type\": \"WebPage\",",
    `        \"name\": ${escapeJson(title)},`,
    `        \"description\": ${escapeJson(description)},`,
    `        \"url\": ${escapeJson(canonicalUrl)},`,
    "        \"isPartOf\": {",
    "          \"@type\": \"WebSite\",",
    `          \"name\": ${escapeJson("Cosmica")},`,
    `          \"url\": ${escapeJson(`${SITE_ORIGIN}/`)}`,
    "        }",
    "      }",
    "    </script>",
  ];
  return `${schema.join("\n")}\n`;
};

const applyPageBaseline = (fileName) => {
  const filePath = path.join(ROOT, fileName);
  let html = fs.readFileSync(filePath, "utf8");
  const original = html;

  html = annotateThirdPartyTags(html);

  html = html.replace(/<nav\b[^>]*\bclass=["'][^"']*\bnav-links\b[^"']*["'][^>]*>/gi, (tag) => {
    if (/\baria-label=["'][^"']+["']/i.test(tag)) {
      return tag;
    }
    return addAttributeToTag(tag, 'aria-label="Primary navigation"');
  });

  if (!/<h1[\s>]/i.test(html)) {
    const titleMatch = html.match(/<title>([^<]+)<\/title>/i);
    const headingText = toHeadingFromTitle(titleMatch ? titleMatch[1] : "Cosmica");
    html = html.replace(/<main[^>]*>/i, (tag) => `${tag}\n      <h1 class="visually-hidden">${headingText}</h1>`);
  }

  if (!/application\/ld\+json/i.test(html)) {
    const title = (html.match(/<title>([^<]+)<\/title>/i) || [null, "Cosmica"])[1];
    const description = (html.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']+)["']/i) || [
      null,
      "Cosmica language learning page",
    ])[1];
    const canonicalUrl = (html.match(/<link[^>]*rel=["']canonical["'][^>]*href=["']([^"']+)["']/i) || [
      null,
      `${SITE_ORIGIN}/${fileName === "index.html" ? "" : fileName}`,
    ])[1];
    const schemaBlock = buildWebPageSchemaBlock({
      title,
      description,
      canonicalUrl,
    });
    html = html.replace(/<\/head>/i, `${schemaBlock}  </head>`);
  }

  const canonicalMatch = html.match(/<link[^>]*rel=["']canonical["'][^>]*href=["']([^"']+)["']/i);
  if (canonicalMatch) {
    const canonicalPath = toCanonicalPath(canonicalMatch[1]);
    const ogUrlTag = `<meta property="og:url" content="${SITE_ORIGIN}${canonicalPath}" />`;
    if (!/\bproperty=["']og:url["']/i.test(html)) {
      html = html.replace(/<\/head>/i, `    ${ogUrlTag}\n  </head>`);
    }
  }

  if (html !== original) {
    fs.writeFileSync(filePath, html, "utf8");
    return true;
  }
  return false;
};

/* --------------------------------------------------------------------------
   MAIN
   -------------------------------------------------------------------------- */
const htmlFiles = fs
  .readdirSync(ROOT)
  .filter((fileName) => fileName.toLowerCase().endsWith(".html"))
  .filter((fileName) => !fileName.toLowerCase().startsWith("live_"))
  .sort();

let updatedCount = 0;
for (const fileName of htmlFiles) {
  if (applyPageBaseline(fileName)) {
    updatedCount += 1;
  }
}

console.log(`PASS [html-baseline] processed ${htmlFiles.length} pages, updated ${updatedCount}`);
