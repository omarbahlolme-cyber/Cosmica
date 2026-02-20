/* ==========================================================================
   CROSS-DEVICE CHECKOUT SMOKE
   - Authenticates with a test account.
   - Calls premium options API with desktop + mobile user agents.
   - Verifies both return valid premium checkout URLs
    (Stripe start endpoint, Stripe hosted checkout, or Ko-fi fallback).
   - Deterministic local mode by default (isolated server + seeded user).
   ========================================================================== */

const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const { spawn } = require("child_process");

const REQUEST_TIMEOUT_MS = Math.max(3000, Number(process.env.SMOKE_REQUEST_TIMEOUT_MS || 12000));
const ROOT = path.resolve(__dirname, "..");
const AUTH_STORE_FILE = path.join(ROOT, "backend", "data", "accounts.json");
const LOCAL_PORT = Number(process.env.SMOKE_LOCAL_PORT || 4174);
const smokeExternalBaseUrl = String(process.env.SMOKE_BASE_URL || "")
  .trim()
  .replace(/\/+$/, "");
const optInExternalBase = /^(1|true|yes)$/i.test(String(process.env.SMOKE_USE_EXTERNAL_BASE || "").trim());
const externalBaseUrl = smokeExternalBaseUrl || String(process.env.BASE_URL || "").trim().replace(/\/+$/, "");
const USE_EXTERNAL_BASE = Boolean(smokeExternalBaseUrl) || (optInExternalBase && Boolean(externalBaseUrl));
const BASE_URL = USE_EXTERNAL_BASE && externalBaseUrl ? externalBaseUrl : `http://127.0.0.1:${LOCAL_PORT}`;
const AUTH_EMAIL = String(process.env.SMOKE_AUTH_EMAIL || process.env.AUTH_EMAIL || "mobile.api.test@cosmica.local")
  .trim()
  .toLowerCase();
const AUTH_PASSWORD = String(process.env.SMOKE_AUTH_PASSWORD || process.env.AUTH_PASSWORD || "TestPass123!");
const EXPECTED_PREMIUM_URL = String(
  process.env.SMOKE_EXPECTED_PREMIUM_URL || process.env.EXPECTED_PREMIUM_URL || ""
).trim();
const STARTUP_TIMEOUT_MS = 25000;
const SMOKE_USER_ID = String(process.env.SMOKE_AUTH_USER_ID || "11111111-2222-4333-8444-555555555555")
  .trim()
  .slice(0, 120);

let authStoreSnapshotRaw = "";

const UAS = {
  desktop:
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
  mobile:
    "Mozilla/5.0 (iPhone; CPU iPhone OS 18_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.1 Mobile/15E148 Safari/604.1",
};

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const deriveHash = (password, salt, iterations, keylen, digest) =>
  new Promise((resolve, reject) => {
    crypto.pbkdf2(password, salt, iterations, keylen, digest, (error, derived) => {
      if (error) {
        reject(error);
        return;
      }
      resolve(derived.toString("hex"));
    });
  });

const seedLocalSmokeUser = async () => {
  if (USE_EXTERNAL_BASE) {
    return;
  }
  if (!authStoreSnapshotRaw) {
    authStoreSnapshotRaw = fs.readFileSync(AUTH_STORE_FILE, "utf8");
  }
  const raw = fs.readFileSync(AUTH_STORE_FILE, "utf8");
  const store = JSON.parse(raw);
  store.users = store.users && typeof store.users === "object" ? store.users : {};
  store.emailIndex = store.emailIndex && typeof store.emailIndex === "object" ? store.emailIndex : {};

  const now = new Date().toISOString();
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = await deriveHash(AUTH_PASSWORD, salt, 210000, 64, "sha512");

  store.users[SMOKE_USER_ID] = {
    id: SMOKE_USER_ID,
    email: AUTH_EMAIL,
    displayName: "Smoke Checkout Test",
    password: { salt, hash, iterations: 210000, keylen: 64, digest: "sha512" },
    createdAt: now,
    updatedAt: now,
    lastLoginAt: now,
    emailVerified: true,
    emailVerification: { tokenHash: "", expiresAt: null, sentAt: null },
    passwordReset: { tokenHash: "", expiresAt: null, sentAt: null },
    data: {
      settings: { baseLanguage: "english" },
      profile: { authProvider: "email", isPremium: false, premium: false, plan: "free", tier: "free" },
    },
    progress: {
      totals: { xp: 0, completedSections: 0, lastActivityAt: null },
      worlds: {},
      recentEvents: [],
    },
  };
  store.emailIndex[AUTH_EMAIL] = SMOKE_USER_ID;
  store.updatedAt = now;
  fs.writeFileSync(AUTH_STORE_FILE, JSON.stringify(store, null, 2), "utf8");
};

const restoreAuthStore = () => {
  if (USE_EXTERNAL_BASE || !authStoreSnapshotRaw) {
    return;
  }
  fs.writeFileSync(AUTH_STORE_FILE, authStoreSnapshotRaw, "utf8");
};

const startLocalServer = () => {
  if (USE_EXTERNAL_BASE) {
    return null;
  }
  const child = spawn(process.execPath, ["server.js"], {
    cwd: ROOT,
    env: {
      ...process.env,
      PORT: String(LOCAL_PORT),
      STRIPE_WEBHOOK_SECRET: String(process.env.STRIPE_WEBHOOK_SECRET || "smoke-checkout-local-secret"),
    },
    stdio: ["ignore", "pipe", "pipe"],
  });
  return child;
};

const stopLocalServer = async (child) => {
  if (!child || child.killed) {
    return;
  }
  child.kill("SIGTERM");
  await sleep(250);
  if (!child.killed) {
    child.kill("SIGKILL");
  }
};

const waitForHealth = async () => {
  const startedAt = Date.now();
  let lastError = "";
  while (Date.now() - startedAt < STARTUP_TIMEOUT_MS) {
    try {
      const response = await fetchJson({ url: `${BASE_URL}/api/health`, method: "GET" });
      if (response.response.ok) {
        return;
      }
      lastError = `health=${response.response.status}`;
    } catch (error) {
      lastError = String(error?.message || error);
    }
    await sleep(450);
  }
  throw new Error(`Server did not become healthy (${lastError})`);
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

  assert(
    optionsResult.payload?.canPurchase !== false,
    `${label}: premium options returned canPurchase=false (${optionsResult.payload?.reasonCode || "unknown"})`
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
  let localServer = null;
  try {
    assert(AUTH_EMAIL, "Missing SMOKE_AUTH_EMAIL (or AUTH_EMAIL)");
    assert(AUTH_PASSWORD, "Missing SMOKE_AUTH_PASSWORD (or AUTH_PASSWORD)");

    await seedLocalSmokeUser();
    localServer = startLocalServer();
    await waitForHealth();

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
  } finally {
    await stopLocalServer(localServer);
    restoreAuthStore();
  }
};

void main();
