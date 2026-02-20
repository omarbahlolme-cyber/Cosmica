/* ==========================================================================
   CROSS-DEVICE CHECKOUT SMOKE
   - Authenticates with a real account.
   - Calls premium options API with desktop + mobile user agents.
  - Verifies both return valid premium checkout URLs
    (Stripe start endpoint, Stripe hosted checkout, or Ko-fi fallback).
   ========================================================================== */

const REQUEST_TIMEOUT_MS = Math.max(3000, Number(process.env.SMOKE_REQUEST_TIMEOUT_MS || 12000));
const BASE_URL = String(
  process.env.SMOKE_BASE_URL || process.env.BASE_URL || "https://www.cosmicalearn.com"
)
  .trim()
  .replace(/\/+$/, "");
const AUTH_EMAIL = String(process.env.SMOKE_AUTH_EMAIL || process.env.AUTH_EMAIL || "")
  .trim()
  .toLowerCase();
const AUTH_PASSWORD = String(process.env.SMOKE_AUTH_PASSWORD || process.env.AUTH_PASSWORD || "");
const EXPECTED_PREMIUM_URL = String(
  process.env.SMOKE_EXPECTED_PREMIUM_URL || process.env.EXPECTED_PREMIUM_URL || ""
).trim();

const UAS = {
  desktop:
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
  mobile:
    "Mozilla/5.0 (iPhone; CPU iPhone OS 18_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.1 Mobile/15E148 Safari/604.1",
};

const normalizeUrl = (value, baseUrl = "") => {
  const raw = String(value || "").trim();
  if (!raw) {
    return "";
  }
  try {
    if (baseUrl) {
      return new URL(raw, baseUrl).toString();
    }
    return new URL(raw).toString();
  } catch {
    return "";
  }
};

const getBaseOrigin = () => {
  try {
    return new URL(BASE_URL).origin;
  } catch {
    return "";
  }
};

const BASE_ORIGIN = getBaseOrigin();

const toCookieHeader = (setCookieValues = []) =>
  setCookieValues
    .map((cookie) => String(cookie || "").split(";")[0].trim())
    .filter(Boolean)
    .join("; ");

const getSetCookieValues = (headers) => {
  if (!headers) {
    return [];
  }
  if (typeof headers.getSetCookie === "function") {
    return headers.getSetCookie().filter(Boolean);
  }
  const raw = headers.get("set-cookie");
  if (!raw) {
    return [];
  }
  return [raw];
};

const fetchJson = async ({ url, method = "GET", body = null, headers = {} } = {}) => {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  try {
    const response = await fetch(url, {
      method,
      headers,
      body,
      signal: controller.signal,
    });
    const text = await response.text();
    let payload = null;
    try {
      payload = text ? JSON.parse(text) : null;
    } catch {}
    return { response, payload, text };
  } finally {
    clearTimeout(timer);
  }
};

const assert = (condition, message) => {
  if (!condition) {
    throw new Error(message);
  }
};

const isAllowedKoFiCheckoutUrl = (value) => {
  const normalized = normalizeUrl(value, BASE_URL);
  if (!normalized) {
    return false;
  }
  try {
    const parsed = new URL(normalized);
    const host = String(parsed.hostname || "").trim().toLowerCase();
    if (parsed.protocol !== "https:") {
      return false;
    }
    if (host !== "ko-fi.com" && host !== "www.ko-fi.com") {
      return false;
    }
    if (/\/supportcosmica(?:\/)?$/i.test(parsed.pathname)) {
      return false;
    }
    return true;
  } catch {
    return false;
  }
};

const isAllowedStripeHostedCheckoutUrl = (value) => {
  const normalized = normalizeUrl(value, BASE_URL);
  if (!normalized) {
    return false;
  }
  try {
    const parsed = new URL(normalized);
    const host = String(parsed.hostname || "").trim().toLowerCase();
    if (parsed.protocol !== "https:") {
      return false;
    }
    return host === "checkout.stripe.com";
  } catch {
    return false;
  }
};

const isAllowedInternalCheckoutStartUrl = (value) => {
  const normalized = normalizeUrl(value, BASE_URL);
  if (!normalized || !BASE_ORIGIN) {
    return false;
  }
  try {
    const parsed = new URL(normalized);
    if (parsed.origin !== BASE_ORIGIN) {
      return false;
    }
    return parsed.pathname === "/api/billing/premium/checkout/start";
  } catch {
    return false;
  }
};

const isAllowedPremiumCheckoutUrl = (value) =>
  isAllowedInternalCheckoutStartUrl(value) ||
  isAllowedStripeHostedCheckoutUrl(value) ||
  isAllowedKoFiCheckoutUrl(value);

const extractOptionUrls = (payload) => {
  const options = Array.isArray(payload?.options) ? payload.options : [];
  return options
    .map((item) => normalizeUrl(item?.url, BASE_URL))
    .filter(Boolean);
};

const authAndFetchOptions = async ({ label, userAgent }) => {
  const loginUrl = `${BASE_URL}/api/auth/login`;
  const loginBody = JSON.stringify({ email: AUTH_EMAIL, password: AUTH_PASSWORD });
  const loginResult = await fetchJson({
    url: loginUrl,
    method: "POST",
    body: loginBody,
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      "User-Agent": userAgent,
    },
  });

  assert(
    loginResult.response.status === 200,
    `${label}: login failed (${loginResult.response.status}) ${loginResult.payload?.error || ""}`
  );

  const cookieHeader = toCookieHeader(getSetCookieValues(loginResult.response.headers));
  assert(cookieHeader, `${label}: login did not return auth cookie`);

  const optionsUrl = `${BASE_URL}/api/billing/premium/options`;
  const optionsResult = await fetchJson({
    url: optionsUrl,
    method: "GET",
    headers: {
      Accept: "application/json",
      "User-Agent": userAgent,
      Cookie: cookieHeader,
    },
  });

  assert(
    optionsResult.response.status === 200,
    `${label}: premium options failed (${optionsResult.response.status}) ${optionsResult.payload?.error || ""}`
  );

  const optionUrls = extractOptionUrls(optionsResult.payload);
  assert(optionUrls.length > 0, `${label}: no premium options were returned`);

  optionUrls.forEach((url) => {
    assert(isAllowedPremiumCheckoutUrl(url), `${label}: invalid checkout URL returned (${url})`);
  });

  if (EXPECTED_PREMIUM_URL) {
    const expected = normalizeUrl(EXPECTED_PREMIUM_URL, BASE_URL);
    assert(expected, `Invalid SMOKE_EXPECTED_PREMIUM_URL value: ${EXPECTED_PREMIUM_URL}`);
    assert(
      optionUrls.includes(expected),
      `${label}: expected monthly URL missing (${expected})`
    );
  }

  return {
    label,
    optionUrls,
  };
};

const main = async () => {
  try {
    assert(AUTH_EMAIL, "Missing SMOKE_AUTH_EMAIL (or AUTH_EMAIL)");
    assert(AUTH_PASSWORD, "Missing SMOKE_AUTH_PASSWORD (or AUTH_PASSWORD)");

    const desktop = await authAndFetchOptions({ label: "desktop", userAgent: UAS.desktop });
    const mobile = await authAndFetchOptions({ label: "mobile", userAgent: UAS.mobile });

    const desktopSet = [...new Set(desktop.optionUrls)].sort();
    const mobileSet = [...new Set(mobile.optionUrls)].sort();

    assert(
      JSON.stringify(desktopSet) === JSON.stringify(mobileSet),
      `desktop/mobile option mismatch\ndesktop=${JSON.stringify(desktopSet)}\nmobile=${JSON.stringify(mobileSet)}`
    );

    console.log(`PASS [checkout-cross-device] base=${BASE_URL}`);
    console.log(`PASS [checkout-cross-device] desktop=${JSON.stringify(desktopSet)}`);
    console.log(`PASS [checkout-cross-device] mobile=${JSON.stringify(mobileSet)}`);
  } catch (error) {
    console.error(`FAIL [checkout-cross-device] ${error?.message || error}`);
    process.exitCode = 1;
  }
};

void main();
