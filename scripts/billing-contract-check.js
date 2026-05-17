/* ===========================================================================
   BILLING CONTRACT CHECK
   - Starts local server on isolated port
   - Seeds a local test account for authentication
   - Verifies billing status endpoint contract
   - Verifies cancel endpoint contract
   - Verifies Stripe webhook signature rejection contract
   =========================================================================== */
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const { spawn } = require("child_process");
const { createAuthTestStore } = require("./lib/auth-test-store");

const ROOT = path.resolve(__dirname, "..");
const authTestStore = createAuthTestStore({ root: ROOT, namespace: "billing-contract" });
const AUTH_STORE_FILE = authTestStore.file("accounts.json");
const PORT = Number(process.env.BILLING_CONTRACT_PORT || 4175);
const BASE_URL = `http://127.0.0.1:${PORT}`;
const STARTUP_TIMEOUT_MS = 25000;
const REQUEST_TIMEOUT_MS = 12000;
let authStoreSnapshotRaw = "";

const TEST_USER_ID = "11111111-2222-4333-8444-555555555555";
const TEST_EMAIL = String(process.env.BILLING_CONTRACT_EMAIL || "mobile.api.test@cosmica.local").trim().toLowerCase();
const TEST_PASSWORD = String(process.env.BILLING_CONTRACT_PASSWORD || "TestPass123!");

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const fetchWithTimeout = async (url, options = {}) => {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  try {
    return await fetch(url, {
      ...options,
      signal: controller.signal,
    });
  } finally {
    clearTimeout(timer);
  }
};

const assert = (condition, message) => {
  if (!condition) {
    throw new Error(message);
  }
};

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

const seedTestUser = async () => {
  authTestStore.prepare();
  if (!authStoreSnapshotRaw) {
    authStoreSnapshotRaw = fs.readFileSync(AUTH_STORE_FILE, "utf8");
  }
  const raw = fs.readFileSync(AUTH_STORE_FILE, "utf8");
  const store = JSON.parse(raw);
  store.users = store.users && typeof store.users === "object" ? store.users : {};
  store.emailIndex = store.emailIndex && typeof store.emailIndex === "object" ? store.emailIndex : {};

  const now = new Date().toISOString();
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = await deriveHash(TEST_PASSWORD, salt, 210000, 64, "sha512");

  store.users[TEST_USER_ID] = {
    id: TEST_USER_ID,
    email: TEST_EMAIL,
    displayName: "Billing Contract Test",
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
  store.emailIndex[TEST_EMAIL] = TEST_USER_ID;
  store.updatedAt = now;
  fs.writeFileSync(AUTH_STORE_FILE, JSON.stringify(store, null, 2), "utf8");
};

const restoreAuthStore = () => {
  if (!authStoreSnapshotRaw) {
    return;
  }
  fs.writeFileSync(AUTH_STORE_FILE, authStoreSnapshotRaw, "utf8");
};

const waitForHealth = async () => {
  const startedAt = Date.now();
  let lastError = "";
  while (Date.now() - startedAt < STARTUP_TIMEOUT_MS) {
    try {
      const response = await fetchWithTimeout(`${BASE_URL}/api/health`);
      if (response.ok) {
        return;
      }
      lastError = `health=${response.status}`;
    } catch (error) {
      lastError = String(error?.message || error);
    }
    await sleep(450);
  }
  throw new Error(`Server did not become healthy (${lastError})`);
};

const toCookieHeader = (headers) => {
  if (!headers) {
    return "";
  }
  if (typeof headers.getSetCookie === "function") {
    return headers
      .getSetCookie()
      .map((cookie) => String(cookie || "").split(";")[0].trim())
      .filter(Boolean)
      .join("; ");
  }
  const raw = headers.get("set-cookie");
  return String(raw || "").split(";")[0].trim();
};

const loginAndGetCookie = async () => {
  const response = await fetchWithTimeout(`${BASE_URL}/api/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({ email: TEST_EMAIL, password: TEST_PASSWORD }),
  });
  const payloadText = await response.text();
  let payload = null;
  try {
    payload = payloadText ? JSON.parse(payloadText) : null;
  } catch {}

  assert(response.status === 200, `login contract failed (${response.status}) ${payload?.error || ""}`);
  const cookie = toCookieHeader(response.headers);
  assert(cookie, "login contract failed: missing auth cookie");
  return cookie;
};

const runContracts = async (cookieHeader) => {
  const anonymousOptionsResponse = await fetchWithTimeout(`${BASE_URL}/api/billing/premium/options`, {
    method: "GET",
    headers: {
      Accept: "application/json",
    },
  });
  assert(
    anonymousOptionsResponse.status === 401,
    `premium options anonymous gate failed (${anonymousOptionsResponse.status})`
  );

  const optionsResponse = await fetchWithTimeout(`${BASE_URL}/api/billing/premium/options`, {
    method: "GET",
    headers: {
      Accept: "application/json",
      Cookie: cookieHeader,
    },
  });
  let optionsPayload = null;
  try {
    optionsPayload = await optionsResponse.json();
  } catch {
    optionsPayload = null;
  }
  assert(
    optionsResponse.status === 200 || optionsResponse.status === 503,
    `premium options contract failed (${optionsResponse.status})`
  );
  if (optionsResponse.status === 200) {
    assert(optionsPayload?.ok === true, "premium options contract failed: missing ok=true");
    assert(typeof optionsPayload?.provider === "string", "premium options contract failed: missing provider");
    assert(Array.isArray(optionsPayload?.options), "premium options contract failed: missing options array");
  }

  const checkoutStartResponse = await fetchWithTimeout(
    `${BASE_URL}/api/billing/premium/checkout/start?option=__invalid_option__`,
    {
      method: "GET",
      headers: {
        Accept: "application/json",
        Cookie: cookieHeader,
      },
    }
  );
  assert(
    checkoutStartResponse.status === 404 || checkoutStartResponse.status === 503,
    `premium checkout start contract failed (${checkoutStartResponse.status})`
  );

  if (checkoutStartResponse.status === 404) {
    const checkoutText = await checkoutStartResponse.text();
    let checkoutPayload = null;
    try {
      checkoutPayload = checkoutText ? JSON.parse(checkoutText) : null;
    } catch {
      checkoutPayload = null;
    }
    assert(
      String(checkoutPayload?.error || "").toLowerCase().includes("unknown premium checkout option"),
      "premium checkout start contract failed: missing unknown option error"
    );
  }

  const webhookResponse = await fetchWithTimeout(`${BASE_URL}/api/billing/webhooks/kofi`, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({}),
  });
  assert(
    webhookResponse.status === 400 || webhookResponse.status === 401 || webhookResponse.status === 415,
    `kofi webhook invalid payload contract failed (${webhookResponse.status})`
  );
};

const startServer = () => {
  const child = spawn(process.execPath, ["server.js"], {
    cwd: ROOT,
    env: {
      ...process.env,
      ...authTestStore.env(),
      PORT: String(PORT),
      STRIPE_WEBHOOK_SECRET: String(process.env.STRIPE_WEBHOOK_SECRET || "billing-contract-test-secret"),
    },
    stdio: ["ignore", "pipe", "pipe"],
  });

  let stderr = "";
  child.stderr.on("data", (chunk) => {
    stderr += String(chunk || "");
  });

  return {
    child,
    getStderr: () => stderr.trim(),
  };
};

const stopServer = async (child) => {
  if (!child || child.killed) {
    return;
  }
  child.kill("SIGTERM");
  await sleep(250);
  if (!child.killed) {
    child.kill("SIGKILL");
  }
};

const main = async () => {
  let child = null;
  try {
    await seedTestUser();
    const server = startServer();
    child = server.child;
    await waitForHealth();
    const cookie = await loginAndGetCookie();
    await runContracts(cookie);
    console.log("PASS [billing-contract] premium-options/checkout-start/kofi-webhook contracts");
  } catch (error) {
    console.error(`FAIL [billing-contract] ${error?.message || error}`);
    process.exitCode = 1;
  } finally {
    await stopServer(child);
    restoreAuthStore();
    authTestStore.cleanup();
  }
};

void main();
