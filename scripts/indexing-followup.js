/* ==========================================================================
   INDEXING FOLLOW-UP CHECK
   - Verifies production crawl/indexing prerequisites remain healthy.
   - Intended for weekly Search Console/Bing follow-up automation support.
   ========================================================================== */

/* --------------------------------------------------------------------------
   CONFIG
   -------------------------------------------------------------------------- */
const SITE_ORIGIN = String(process.env.SITE_ORIGIN || "https://www.cosmicalearn.com")
  .trim()
  .replace(/\/+$/, "");
const ROBOTS_URL = `${SITE_ORIGIN}/robots.txt`;
const SITEMAP_URL = `${SITE_ORIGIN}/sitemap.xml`;
const REQUEST_TIMEOUT_MS = Number(process.env.INDEXING_CHECK_TIMEOUT_MS || 12000);

const REQUIRED_PATHS = [
  "/",
  "/world.html",
  "/letters.html",
  "/words.html",
  "/phrases.html",
  "/grammar.html",
  "/privacy.html",
  "/terms.html",
  "/license.html",
];

/* --------------------------------------------------------------------------
   HELPERS
   -------------------------------------------------------------------------- */
const withTimeout = async (url, options = {}) => {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  try {
    return await fetch(url, { ...options, signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
};

const expectedUrlForPath = (pathName) => (pathName === "/" ? `${SITE_ORIGIN}/` : `${SITE_ORIGIN}${pathName}`);

const readText = async (url) => {
  const response = await withTimeout(url, { redirect: "follow" });
  if (!response.ok) {
    throw new Error(`${url} returned HTTP ${response.status}`);
  }
  return await response.text();
};

const extractCanonical = (html) => {
  const match = html.match(
    /<link[^>]*rel=["']canonical["'][^>]*href=["']([^"']+)["'][^>]*>/i
  );
  return match ? String(match[1] || "").trim() : "";
};

const extractSitemapLocations = (xml) => {
  const results = new Set();
  const regex = /<loc>([^<]+)<\/loc>/gi;
  let match = null;
  while ((match = regex.exec(xml)) !== null) {
    const value = String(match[1] || "").trim();
    if (value) {
      results.add(value);
    }
  }
  return results;
};

/* --------------------------------------------------------------------------
   MAIN
   -------------------------------------------------------------------------- */
Promise.resolve()
  .then(async () => {
    const failures = [];

    const robots = await readText(ROBOTS_URL);
    if (!/User-agent:\s*\*/i.test(robots)) {
      failures.push("robots.txt missing `User-agent: *` block");
    }
    if (!new RegExp(`Sitemap:\\s*${SITEMAP_URL.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}`, "i").test(robots)) {
      failures.push(`robots.txt missing sitemap pointer to ${SITEMAP_URL}`);
    }

    const sitemapXml = await readText(SITEMAP_URL);
    const sitemapUrls = extractSitemapLocations(sitemapXml);
    if (!sitemapUrls.size) {
      failures.push("sitemap.xml contains no <loc> URLs");
    }

    for (const pathName of REQUIRED_PATHS) {
      const expectedUrl = expectedUrlForPath(pathName);
      if (!sitemapUrls.has(expectedUrl)) {
        failures.push(`sitemap.xml missing ${expectedUrl}`);
      }
    }

    for (const pathName of REQUIRED_PATHS) {
      const expectedUrl = expectedUrlForPath(pathName);
      const response = await withTimeout(expectedUrl, { redirect: "follow" });
      if (!response.ok) {
        failures.push(`${expectedUrl} returned HTTP ${response.status}`);
        continue;
      }
      const html = await response.text();
      const canonical = extractCanonical(html);
      if (!canonical) {
        failures.push(`${expectedUrl} missing canonical tag`);
      } else if (canonical !== expectedUrl) {
        failures.push(`${expectedUrl} canonical mismatch (${canonical})`);
      }
      if (!/application\/ld\+json/i.test(html)) {
        failures.push(`${expectedUrl} missing JSON-LD`);
      }
    }

    if (failures.length) {
      console.error("INDEXING FOLLOW-UP CHECK FAILED");
      failures.forEach((failure) => console.error(`- ${failure}`));
      process.exit(1);
    }

    console.log("PASS [indexing] robots + sitemap + canonical + JSON-LD checks");
    console.log(`- site: ${SITE_ORIGIN}`);
    console.log(`- required URLs checked: ${REQUIRED_PATHS.length}`);
    console.log("Next manual follow-up:");
    console.log(`- Google Search Console: inspect key URLs and click Validate Fix if needed`);
    console.log(`- Bing Webmaster Tools: resubmit sitemap and inspect crawl/index status`);
  })
  .catch((error) => {
    console.error("INDEXING FOLLOW-UP CHECK FAILED");
    console.error(`- ${error.message || error}`);
    process.exit(1);
  });
