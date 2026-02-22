/* ===========================================================================
   USER-STATE CONTRACT CHECK
   - Starts local server on isolated port.
   - Seeds deterministic free + premium test users.
   - Verifies guest restrictions and authenticated contracts.
   - Validates plan tier and billing status invariants for free/premium users.
   =========================================================================== */
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const { spawn } = require("child_process");

const ROOT = path.resolve(__dirname, "..");
const AUTH_STORE_FILE = path.join(ROOT, "backend", "data", "accounts.json");
const PORT = Number(process.env.USER_STATE_CONTRACT_PORT || 4176);
const BASE_URL = `http://127.0.0.1:${PORT}`;
const STARTUP_TIMEOUT_MS = 25000;
const REQUEST_TIMEOUT_MS = 12000;
let authStoreSnapshotRaw = "";

const FREE_USER = {
  id: "33333333-4444-4555-8666-777777777777",
  email: String(process.env.USER_STATE_FREE_EMAIL || "contract.free@cosmica.local").trim().toLowerCase(),
  password: String(process.env.USER_STATE_FREE_PASSWORD || "TestPass123!"),
  displayName: "Contract Free User",
};

const PREMIUM_USER = {
  id: "44444444-5555-4666-8777-888888888888",
  email: String(process.env.USER_STATE_PREMIUM_EMAIL || "contract.premium@cosmica.local")
    .trim()
    .toLowerCase(),
  password: String(process.env.USER_STATE_PREMIUM_PASSWORD || "TestPass123!"),
  displayName: "Contract Premium User",
};

const CANCELING_USER = {
  id: "55555555-6666-4777-8888-999999999999",
  email: String(process.env.USER_STATE_CANCELING_EMAIL || "contract.canceling@cosmica.local")
    .trim()
    .toLowerCase(),
  password: String(process.env.USER_STATE_CANCELING_PASSWORD || "TestPass123!"),
  displayName: "Contract Canceling User",
};

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

const buildUserRecord = async ({
  id,
  email,
  password,
  displayName,
  premium = false,
  cancelAtPeriodEnd = false,
} = {}) => {
  const now = new Date().toISOString();
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = await deriveHash(password, salt, 210000, 64, "sha512");
  const profile = premium
    ? {
        authProvider: "email",
        isPremium: true,
        premium: true,
        plan: "premium",
        tier: "premium",
        membership: "premium",
        premiumProvider: "stripe",
        premiumActivatedAt: now,
        premiumCurrentPeriodEnd: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(),
        premiumCancelAtPeriodEnd: cancelAtPeriodEnd === true,
        premiumStripeSubscriptionStatus: "active",
      }
    : {
        authProvider: "email",
        isPremium: false,
        premium: false,
        plan: "free",
        tier: "free",
        membership: "free",
      };

  return {
    id,
    email,
    displayName,
    password: { salt, hash, iterations: 210000, keylen: 64, digest: "sha512" },
    createdAt: now,
    updatedAt: now,
    lastLoginAt: now,
    emailVerified: true,
    emailVerification: { tokenHash: "", expiresAt: null, sentAt: null },
    passwordReset: { tokenHash: "", expiresAt: null, sentAt: null },
    data: {
      settings: { baseLanguage: "english" },
      profile,
    },
    progress: {
      totals: { xp: 0, completedSections: 0, lastActivityAt: null },
      worlds: {},
      recentEvents: [],
    },
  };
};

const seedContractUsers = async () => {
  if (!authStoreSnapshotRaw) {
    authStoreSnapshotRaw = fs.readFileSync(AUTH_STORE_FILE, "utf8");
  }
  const raw = fs.readFileSync(AUTH_STORE_FILE, "utf8");
  const store = JSON.parse(raw);
  store.users = store.users && typeof store.users === "object" ? store.users : {};
  store.emailIndex = store.emailIndex && typeof store.emailIndex === "object" ? store.emailIndex : {};

  store.users[FREE_USER.id] = await buildUserRecord({ ...FREE_USER, premium: false });
  store.users[PREMIUM_USER.id] = await buildUserRecord({ ...PREMIUM_USER, premium: true });
  store.users[CANCELING_USER.id] = await buildUserRecord({
    ...CANCELING_USER,
    premium: true,
    cancelAtPeriodEnd: true,
  });
  store.emailIndex[FREE_USER.email] = FREE_USER.id;
  store.emailIndex[PREMIUM_USER.email] = PREMIUM_USER.id;
  store.emailIndex[CANCELING_USER.email] = CANCELING_USER.id;
  store.updatedAt = new Date().toISOString();

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

const loginAndGetCookie = async ({ email, password, label }) => {
  const response = await fetchWithTimeout(`${BASE_URL}/api/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({ email, password }),
  });

  let payload = null;
  try {
    payload = await response.json();
  } catch {
    payload = null;
  }

  assert(response.status === 200, `${label}: login failed (${response.status}) ${payload?.error || ""}`);
  const cookie = toCookieHeader(response.headers);
  assert(cookie, `${label}: login missing auth cookie`);
  return cookie;
};

const getJson = async ({ path, cookie = "", method = "GET", body = null } = {}) => {
  const response = await fetchWithTimeout(`${BASE_URL}${path}`, {
    method,
    headers: {
      Accept: "application/json",
      ...(body ? { "Content-Type": "application/json" } : {}),
      ...(cookie ? { Cookie: cookie } : {}),
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });

  let payload = null;
  try {
    payload = await response.json();
  } catch {
    payload = null;
  }

  return { response, payload };
};

const verifyGuestGuards = async () => {
  const guestAuthMe = await getJson({ path: "/api/auth/me" });
  assert(guestAuthMe.response.status === 401, `guest /api/auth/me should be 401, got ${guestAuthMe.response.status}`);

  const guestAccountData = await getJson({ path: "/api/account/data" });
  assert(
    guestAccountData.response.status === 401,
    `guest /api/account/data should be 401, got ${guestAccountData.response.status}`
  );

  const guestPremiumOptions = await getJson({ path: "/api/billing/premium/options" });
  assert(
    guestPremiumOptions.response.status === 401,
    `guest /api/billing/premium/options should be 401, got ${guestPremiumOptions.response.status}`
  );
};

const deriveExpectedBillingStatusFromProfile = (profile) => {
  const premiumRaw = profile?.isPremium ?? profile?.premium;
  const premiumText = String(premiumRaw ?? "")
    .trim()
    .toLowerCase();
  const hasPremium =
    premiumRaw === true ||
    premiumText === "1" ||
    premiumText === "true" ||
    premiumText === "yes" ||
    premiumText === "premium" ||
    premiumText === "pro" ||
    premiumText === "plus";
  if (!hasPremium) {
    return "expired";
  }
  const stripeStatus = String(profile?.premiumStripeSubscriptionStatus || "")
    .trim()
    .toLowerCase();
  if (
    profile?.premiumCancelAtPeriodEnd === true ||
    stripeStatus === "canceling" ||
    stripeStatus === "canceled"
  ) {
    return "canceling";
  }
  return "active";
};

const resolvePlanTierFromProfile = (profile) =>
  String(profile?.plan || profile?.tier || profile?.membership || "")
    .trim()
    .toLowerCase();

const verifyUserState = async ({ label, cookie, expectedPlanTier, expectedPremium, expectedBillingStatus }) => {
  const me = await getJson({ path: "/api/auth/me", cookie });
  assert(me.response.status === 200, `${label}: /api/auth/me failed (${me.response.status})`);
  assert(me.payload?.ok === true, `${label}: /api/auth/me missing ok=true`);
  assert(me.payload?.user && typeof me.payload.user === "object", `${label}: /api/auth/me missing user object`);
  const profile = me.payload?.data?.profile;
  assert(profile && typeof profile === "object", `${label}: /api/auth/me missing data.profile object`);

  const resolvedPlanTier = resolvePlanTierFromProfile(profile);
  const premiumRaw = profile?.isPremium ?? profile?.premium;
  const resolvedPremium = premiumRaw === true;
  const resolvedBillingStatus = deriveExpectedBillingStatusFromProfile(profile);

  assert(resolvedPlanTier === expectedPlanTier, `${label}: planTier mismatch expected=${expectedPlanTier} actual=${resolvedPlanTier}`);
  assert(resolvedPremium === expectedPremium, `${label}: isPremium mismatch expected=${expectedPremium} actual=${resolvedPremium}`);
  assert(
    resolvedBillingStatus === expectedBillingStatus,
    `${label}: billingStatus mismatch expected=${expectedBillingStatus} actual=${resolvedBillingStatus}`
  );

  const options = await getJson({ path: "/api/billing/premium/options", cookie });
  assert(
    options.response.status === 200 || options.response.status === 503,
    `${label}: /api/billing/premium/options expected 200/503 got ${options.response.status}`
  );
  if (options.response.status === 200) {
    assert(options.payload?.ok === true, `${label}: premium options missing ok=true`);
    assert(typeof options.payload?.provider === "string", `${label}: premium options missing provider`);
    assert(Array.isArray(options.payload?.options), `${label}: premium options should be an array when configured`);
  }
};

const startServer = () => {
  const child = spawn(process.execPath, ["server.js"], {
    cwd: ROOT,
    env: {
      ...process.env,
      PORT: String(PORT),
      STRIPE_WEBHOOK_SECRET: String(process.env.STRIPE_WEBHOOK_SECRET || "user-state-contract-test-secret"),
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
  await sleep(300);
  if (!child.killed) {
    child.kill("SIGKILL");
  }
};

const main = async () => {
  let child = null;
  try {
    await seedContractUsers();

    const server = startServer();
    child = server.child;

    await waitForHealth();
    await verifyGuestGuards();

    const freeCookie = await loginAndGetCookie({
      email: FREE_USER.email,
      password: FREE_USER.password,
      label: "free-user",
    });
    await verifyUserState({
      label: "free-user",
      cookie: freeCookie,
      expectedPlanTier: "free",
      expectedPremium: false,
      expectedBillingStatus: "expired",
    });

    const premiumCookie = await loginAndGetCookie({
      email: PREMIUM_USER.email,
      password: PREMIUM_USER.password,
      label: "premium-user",
    });
    await verifyUserState({
      label: "premium-user",
      cookie: premiumCookie,
      expectedPlanTier: "premium",
      expectedPremium: true,
      expectedBillingStatus: "active",
    });

    const cancelingCookie = await loginAndGetCookie({
      email: CANCELING_USER.email,
      password: CANCELING_USER.password,
      label: "canceling-user",
    });
    await verifyUserState({
      label: "canceling-user",
      cookie: cancelingCookie,
      expectedPlanTier: "premium",
      expectedPremium: true,
      expectedBillingStatus: "canceling",
    });

    console.log("PASS [user-state-contract] guest/free/premium/canceling invariants");
  } catch (error) {
    console.error(`FAIL [user-state-contract] ${error?.message || error}`);
    process.exitCode = 1;
  } finally {
    await stopServer(child);
    restoreAuthStore();
  }
};

void main();
