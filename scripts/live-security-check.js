/* ==========================================================================
   LIVE SECURITY CHECK
   - Validates production redirect/canonical behavior and security headers.
   - Intended for scheduled monitoring from GitHub Actions.
   ========================================================================== */

/* --------------------------------------------------------------------------
   CONFIG
   -------------------------------------------------------------------------- */
const CANONICAL_URL = process.env.SITE_URL || "https://www.cosmicalearn.com/";
const ROOT_HTTPS_URL = process.env.ROOT_HTTPS_URL || "https://cosmicalearn.com/";
const ROOT_HTTP_URL = process.env.ROOT_HTTP_URL || "http://cosmicalearn.com/";
const HEALTH_URL = process.env.HEALTH_URL || "https://www.cosmicalearn.com/api/health";
const REQUEST_TIMEOUT_MS = Number(process.env.SECURITY_CHECK_TIMEOUT_MS || 12000);

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

const expectRedirectToCanonical = async (url) => {
  const response = await withTimeout(url, { redirect: "manual" });
  if (![301, 302, 307, 308].includes(response.status)) {
    throw new Error(`${url} expected redirect but returned HTTP ${response.status}`);
  }

  const location = response.headers.get("location") || "";
  if (!location.startsWith("https://www.cosmicalearn.com")) {
    throw new Error(`${url} redirected to unexpected location: ${location || "(empty)"}`);
  }
};

const expectSecurityHeaders = async (url) => {
  const response = await withTimeout(url, { redirect: "follow" });
  if (!response.ok) {
    throw new Error(`${url} expected HTTP 200 but returned ${response.status}`);
  }

  const requiredHeaders = [
    "strict-transport-security",
    "content-security-policy",
    "x-content-type-options",
    "x-frame-options",
    "referrer-policy",
  ];

  for (const headerName of requiredHeaders) {
    if (!(response.headers.get(headerName) || "").trim()) {
      throw new Error(`${url} missing security header: ${headerName}`);
    }
  }
};

const expectHealthOk = async (url) => {
  const response = await withTimeout(url, { redirect: "follow" });
  if (!response.ok) {
    throw new Error(`${url} expected HTTP 200 but returned ${response.status}`);
  }

  const data = await response.json();
  if (data.status !== "ok") {
    throw new Error(`${url} health status expected "ok" but got "${data.status}"`);
  }
};

/* --------------------------------------------------------------------------
   MAIN
   -------------------------------------------------------------------------- */
Promise.resolve()
  .then(async () => {
    await expectRedirectToCanonical(ROOT_HTTP_URL);
    await expectRedirectToCanonical(ROOT_HTTPS_URL);
    await expectSecurityHeaders(CANONICAL_URL);
    await expectHealthOk(HEALTH_URL);
    console.log("PASS [security-live] production redirects/headers/health checks");
  })
  .catch((error) => {
    console.error("LIVE SECURITY CHECK FAILED");
    console.error(`- ${error.message || error}`);
    process.exit(1);
  });
