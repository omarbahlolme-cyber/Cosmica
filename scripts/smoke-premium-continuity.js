/* ==========================================================================
   PREMIUM CONTINUITY SMOKE
   - Seeds a deterministic local user with Stripe-linked premium metadata where:
     - legacy flags are free (stale risk simulation)
     - premium period end is in the future
     - subscription status is active
   - Verifies premium continuity across logout and second-session login.
   ========================================================================== */

const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const { spawn } = require("child_process");

const REQUEST_TIMEOUT_MS = Math.max(3000, Number(process.env.SMOKE_REQUEST_TIMEOUT_MS || 12000));
const ROOT = path.resolve(__dirname, "..");
const AUTH_STORE_FILE = path.join(ROOT, "backend", "data", "accounts.json");
const LOCAL_PORT = Number(process.env.SMOKE_LOCAL_PORT || 4176);
const BASE_URL = `http://127.0.0.1:${LOCAL_PORT}`;
const STARTUP_TIMEOUT_MS = 25000;

const SMOKE_USER_ID = String(
  process.env.SMOKE_PREMIUM_USER_ID || "11111111-2222-4333-9444-555555555555"
)
  .trim()
  .slice(0, 120);
const SMOKE_EMAIL = String(
  process.env.SMOKE_PREMIUM_EMAIL || "premium.continuity.test@cosmica.local"
)
  .trim()
  .toLowerCase();
const SMOKE_PASSWORD = String(process.env.SMOKE_PREMIUM_PASSWORD || "TestPass123!");

let authStoreSnapshotRaw = "";

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

const seedLocalPremiumContinuityUser = async () => {
  if (!authStoreSnapshotRaw) {
    authStoreSnapshotRaw = fs.readFileSync(AUTH_STORE_FILE, "utf8");
  }

  const raw = fs.readFileSync(AUTH_STORE_FILE, "utf8");
  const store = JSON.parse(raw);
  store.users = store.users && typeof store.users === "object" ? store.users : {};
  store.emailIndex = store.emailIndex && typeof store.emailIndex === "object" ? store.emailIndex : {};

  const now = new Date();
  const nowIso = now.toISOString();
  const in20DaysIso = new Date(now.getTime() + 20 * 24 * 60 * 60 * 1000).toISOString();

  const salt = crypto.randomBytes(16).toString("hex");
  const hash = await deriveHash(SMOKE_PASSWORD, salt, 210000, 64, "sha512");

  store.users[SMOKE_USER_ID] = {
    id: SMOKE_USER_ID,
    email: SMOKE_EMAIL,
    displayName: "Premium Continuity Smoke",
    password: {
      salt,
      hash,
      iterations: 210000,
      keylen: 64,
      digest: "sha512",
    },
    createdAt: nowIso,
    updatedAt: nowIso,
    lastLoginAt: null,
    emailVerified: true,
    emailVerification: { tokenHash: "", expiresAt: null, sentAt: null },
    passwordReset: { tokenHash: "", expiresAt: null, sentAt: null },
    data: {
      settings: { baseLanguage: "english" },
      profile: {
        authProvider: "email",
        isPremium: false,
        premium: false,
        plan: "free",
        tier: "free",
        membership: "free",
        premiumProvider: "stripe",
        premiumLastSource: "stripe-webhook",
        premiumStripeSubscriptionStatus: "active",
        premiumCurrentPeriodEnd: in20DaysIso,
        premiumCancelAtPeriodEnd: true,
        premiumActivatedAt: nowIso,
      },
    },
    progress: {
      totals: { xp: 0, completedSections: 0, lastActivityAt: null },
      worlds: {},
      recentEvents: [],
    },
  };

  store.emailIndex[SMOKE_EMAIL] = SMOKE_USER_ID;
  store.updatedAt = nowIso;
  fs.writeFileSync(AUTH_STORE_FILE, JSON.stringify(store, null, 2), "utf8");
};

const restoreAuthStore = () => {
  if (!authStoreSnapshotRaw) {
    return;
  }
  fs.writeFileSync(AUTH_STORE_FILE, authStoreSnapshotRaw, "utf8");
};

const startLocalServer = () => {
  const child = spawn(process.execPath, ["server.js"], {
    cwd: ROOT,
    env: {
      ...process.env,
      PORT: String(LOCAL_PORT),
      STRIPE_WEBHOOK_SECRET: String(process.env.STRIPE_WEBHOOK_SECRET || "smoke-premium-local-secret"),
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
      const result = await fetchJson({ url: `${BASE_URL}/api/health`, method: "GET" });
      if (result.response.ok) {
        return;
      }
      lastError = `health=${result.response.status}`;
    } catch (error) {
      lastError = String(error?.message || error);
    }
    await sleep(350);
  }
  throw new Error(`Server did not become healthy (${lastError})`);
};

const loginAndGetCookie = async () => {
  const loginBody = JSON.stringify({
    email: SMOKE_EMAIL,
    password: SMOKE_PASSWORD,
  });
  const loginResult = await fetchJson({
    url: `${BASE_URL}/api/auth/login`,
    method: "POST",
    body: loginBody,
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
  });

  assert(
    loginResult.response.status === 200,
    `login failed (${loginResult.response.status}) ${loginResult.payload?.error || loginResult.text || ""}`
  );

  const cookieHeader = toCookieHeader(getSetCookieValues(loginResult.response.headers));
  assert(cookieHeader, "login did not return auth cookie");
  return cookieHeader;
};

const getAuthMe = async (cookieHeader) => {
  const result = await fetchJson({
    url: `${BASE_URL}/api/auth/me`,
    method: "GET",
    headers: {
      Accept: "application/json",
      Cookie: cookieHeader,
    },
  });
  assert(result.response.status === 200, `/api/auth/me failed (${result.response.status})`);
  return result.payload;
};

const logout = async (cookieHeader) => {
  const result = await fetchJson({
    url: `${BASE_URL}/api/auth/logout`,
    method: "POST",
    headers: {
      Accept: "application/json",
      Cookie: cookieHeader,
    },
  });
  assert(result.response.status === 200, `/api/auth/logout failed (${result.response.status})`);
};

const getSubscriptionStatus = async (cookieHeader) => {
  const result = await fetchJson({
    url: `${BASE_URL}/api/billing/subscription/status`,
    method: "GET",
    headers: {
      Accept: "application/json",
      Cookie: cookieHeader,
    },
  });
  assert(
    result.response.status === 200,
    `/api/billing/subscription/status failed (${result.response.status})`
  );
  return result.payload;
};

const assertPremiumState = ({ source, payload }) => {
  const user = payload?.user || {};
  assert(payload?.authenticated === true, `${source}: expected authenticated=true`);
  assert(user?.isPremium === true, `${source}: expected user.isPremium=true`);
  assert(String(user?.planTier || "").toLowerCase() === "premium", `${source}: expected planTier=premium`);
  assert(Boolean(user?.premiumAccessUntil), `${source}: expected premiumAccessUntil to be present`);
};

const main = async () => {
  let localServer = null;
  try {
    assert(SMOKE_EMAIL, "Missing SMOKE_PREMIUM_EMAIL");
    assert(SMOKE_PASSWORD, "Missing SMOKE_PREMIUM_PASSWORD");

    await seedLocalPremiumContinuityUser();
    localServer = startLocalServer();
    await waitForHealth();

    const sessionA = await loginAndGetCookie();
    const meA = await getAuthMe(sessionA);
    assertPremiumState({ source: "sessionA", payload: meA });

    await logout(sessionA);

    const sessionB = await loginAndGetCookie();
    const meB = await getAuthMe(sessionB);
    assertPremiumState({ source: "sessionB", payload: meB });

    const subscription = await getSubscriptionStatus(sessionB);
    assert(subscription?.subscription?.isPremium === true, "subscription: expected isPremium=true");
    assert(
      ["active", "canceling"].includes(
        String(subscription?.subscription?.billingStatus || "")
          .trim()
          .toLowerCase()
      ),
      `subscription: unexpected billingStatus=${subscription?.subscription?.billingStatus || ""}`
    );
    assert(
      Boolean(subscription?.subscription?.premiumAccessUntil),
      "subscription: expected premiumAccessUntil to be present"
    );

    console.log(`PASS [premium-continuity] base=${BASE_URL}`);
    console.log(
      `PASS [premium-continuity] premium persists across logout + second-session login until period end`
    );
    console.log(
      `PASS [premium-continuity] subscription=${JSON.stringify({
        billingStatus: subscription?.subscription?.billingStatus || null,
        cancelAtPeriodEnd: subscription?.subscription?.cancelAtPeriodEnd === true,
        premiumAccessUntil: subscription?.subscription?.premiumAccessUntil || null,
      })}`
    );
  } catch (error) {
    console.error(`FAIL [premium-continuity] ${error?.message || error}`);
    process.exitCode = 1;
  } finally {
    await stopLocalServer(localServer);
    restoreAuthStore();
  }
};

void main();
