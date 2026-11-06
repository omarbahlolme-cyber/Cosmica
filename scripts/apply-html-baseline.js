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
const FRONTEND_ROOT = path.join(ROOT, "frontend");
const SITE_ORIGIN = "https://www.cosmicalearn.com";
const DEFAULT_SOCIAL_IMAGE_URL = `${SITE_ORIGIN}/og-image.svg`;
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
const escapeRegex = (value) => String(value || "").replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const addAttributeToTag = (tag, attributeText) => {
  if (tag.endsWith("/>")) {
    return tag.replace(/\/>$/, ` ${attributeText} />`);
  }
  return tag.replace(/>$/, ` ${attributeText}>`);
};

const upsertMetaTag = (html, { attribute, key, content }) => {
  const normalizedAttribute = String(attribute || "").trim();
  const normalizedKey = String(key || "").trim();
  const normalizedContent = String(content || "").trim();
  if (!normalizedAttribute || !normalizedKey || !normalizedContent) {
    return html;
  }
  const tagPattern = new RegExp(
    `<meta[^>]*${escapeRegex(normalizedAttribute)}=["']${escapeRegex(normalizedKey)}["'][^>]*>`,
    "i"
  );
  const normalizedTag = `<meta ${normalizedAttribute}="${normalizedKey}" content="${normalizedContent}" />`;
  if (tagPattern.test(html)) {
    return html.replace(tagPattern, normalizedTag);
  }
  return html.replace(/<\/head>/i, `    ${normalizedTag}\n  </head>`);
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
  const filePath = path.join(FRONTEND_ROOT, fileName);
  let html = fs.readFileSync(filePath, "utf8");
  const original = html;

  html = annotateThirdPartyTags(html);

  if (!/class=["'][^"']*\bskip-link\b/i.test(html)) {
    html = html.replace(
      /(<body\b[^>]*>)/i,
      '$1\n    <a class="skip-link" href="#main-content">Skip to main content</a>'
    );
  }

  html = html.replace(/<main\b[^>]*>/i, (tag) => {
    if (/\bid=["'][^"']+["']/i.test(tag)) {
      return tag;
    }
    return addAttributeToTag(tag, 'id="main-content"');
  });

  html = html.replace(/<button\b[^>]*\bid=["']soundToggle["'][^>]*>/gi, (tag) => {
    if (/\baria-pressed=["'][^"']+["']/i.test(tag)) {
      return tag;
    }
    return addAttributeToTag(tag, 'aria-pressed="false"');
  });
  html = html.replace(
    /(<span\b[^>]*class=["'][^"']*\bsound-label\b[^"']*["'][^>]*>)Sound:\s*On(<\/span>)/gi,
    "$1Sound: Off$2"
  );

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

  html = upsertMetaTag(html, {
    attribute: "property",
    key: "og:image",
    content: DEFAULT_SOCIAL_IMAGE_URL,
  });
  html = upsertMetaTag(html, {
    attribute: "name",
    key: "twitter:image",
    content: DEFAULT_SOCIAL_IMAGE_URL,
  });

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
  .readdirSync(FRONTEND_ROOT)
  .filter((fileName) => fileName.toLowerCase().endsWith(".html"))
  .filter((fileName) => !shouldSkipHtmlFile(fileName))
  .sort();

let updatedCount = 0;
for (const fileName of htmlFiles) {
  if (applyPageBaseline(fileName)) {
    updatedCount += 1;
  }
}

console.log(`PASS [html-baseline] processed ${htmlFiles.length} pages, updated ${updatedCount}`);




