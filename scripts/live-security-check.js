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
const CHAT_URL = process.env.CHAT_URL || "https://www.cosmicalearn.com/api/chat";
const TRANSLATE_URL = process.env.TRANSLATE_URL || "https://www.cosmicalearn.com/api/translate";
const TTS_URL = process.env.TTS_URL || "https://www.cosmicalearn.com/api/tts";
const FEEDBACK_URL = process.env.FEEDBACK_URL || "https://www.cosmicalearn.com/api/feedback";
const REQUEST_TIMEOUT_MS = Number(process.env.SECURITY_CHECK_TIMEOUT_MS || 12000);
const DEEP_API_CHECK = ["1", "true", "yes", "on"].includes(
  String(process.env.DEEP_API_CHECK || "true").trim().toLowerCase()
);

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

const postJson = async (url, payload, headers = {}) => {
  const response = await withTimeout(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...headers,
    },
    body: JSON.stringify(payload),
  });
  return response;
};

const expectChatOk = async (url) => {
  const response = await postJson(url, {
    messages: [{ role: "user", content: "Reply with one short greeting." }],
  });
  if (!response.ok) {
    throw new Error(`${url} expected HTTP 200 but returned ${response.status}`);
  }
  const data = await response.json();
  const content = String(data?.content || "").trim();
  if (!content) {
    throw new Error(`${url} returned empty chat content`);
  }
};

const expectTranslateOk = async (url) => {
  const response = await postJson(url, {
    text: "Hello",
    targetLanguage: "French",
  });
  if (!response.ok) {
    throw new Error(`${url} expected HTTP 200 but returned ${response.status}`);
  }
  const data = await response.json();
  const translation = String(data?.translation || "").trim();
  if (!translation) {
    throw new Error(`${url} returned empty translation`);
  }
};

const expectTtsOk = async (url) => {
  const response = await postJson(url, {
    text: "A",
    languageCode: "en-GB",
    voice: "en-GB-Neural2-F",
  });
  if (!response.ok) {
    throw new Error(`${url} expected HTTP 200 but returned ${response.status}`);
  }
  const contentType = String(response.headers.get("content-type") || "").toLowerCase();
  if (!contentType.includes("audio")) {
    throw new Error(`${url} expected audio content-type but got "${contentType || "empty"}"`);
  }
  const payload = await response.arrayBuffer();
  if (!payload || payload.byteLength < 512) {
    throw new Error(`${url} returned unexpectedly small audio payload`);
  }
};

const expectFeedbackMonitorOk = async (url) => {
  const response = await postJson(
    url,
    {
      name: "Cosmica Monitor",
      email: "monitor@cosmicalearn.com",
      message: "Synthetic monitor check",
    },
    { "x-monitor-check": "1" }
  );
  if (!response.ok) {
    throw new Error(`${url} expected HTTP 200 but returned ${response.status}`);
  }
  const data = await response.json();
  if (!data?.ok) {
    throw new Error(`${url} monitor response missing ok=true`);
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
    if (DEEP_API_CHECK) {
      await expectChatOk(CHAT_URL);
      await expectTranslateOk(TRANSLATE_URL);
      await expectTtsOk(TTS_URL);
      await expectFeedbackMonitorOk(FEEDBACK_URL);
    }
    console.log("PASS [security-live] production redirects/headers/health checks");
  })
  .catch((error) => {
    console.error("LIVE SECURITY CHECK FAILED");
    console.error(`- ${error.message || error}`);
    process.exit(1);
  });
