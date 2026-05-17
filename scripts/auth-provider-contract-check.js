/* ===========================================================================
   AUTH PROVIDER CONTRACT CHECK
   - Ensures account provider ownership is enforced:
     1) Google-registered account cannot log in via email/password fields.
     2) Google-registered account cannot be re-registered via email/password signup.
     3) Email-registered account retains normal email/password login path.
   =========================================================================== */

const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const { spawn } = require("child_process");
const { createAuthTestStore } = require("./lib/auth-test-store");

const ROOT = path.resolve(__dirname, "..");
const authTestStore = createAuthTestStore({ root: ROOT, namespace: "auth-provider-contract" });
const AUTH_STORE_FILE = authTestStore.file("accounts.json");
const PORT = Number(process.env.AUTH_PROVIDER_CONTRACT_PORT || 4178);
const BASE_URL = `http://127.0.0.1:${PORT}`;
const STARTUP_TIMEOUT_MS = 25000;
const REQUEST_TIMEOUT_MS = 12000;

const EMAIL_USER = {
  id: "66666666-aaaa-4777-9bbb-111111111111",
  email: "contract.email@cosmica.local",
  password: "TestPass123!",
  displayName: "Contract Email User",
};

const GOOGLE_USER = {
  id: "77777777-bbbb-4888-9ccc-222222222222",
  email: "contract.google@cosmica.local",
  displayName: "Contract Google User",
};

let authStoreSnapshotRaw = "";

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

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
    await sleep(400);
  }
  throw new Error(`Server did not become healthy (${lastError})`);
};

const buildEmailUserRecord = async ({ id, email, password, displayName }) => {
  const nowIso = new Date().toISOString();
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = await deriveHash(password, salt, 210000, 64, "sha512");
  return {
    id,
    email,
    displayName,
    password: { salt, hash, iterations: 210000, keylen: 64, digest: "sha512" },
    createdAt: nowIso,
    updatedAt: nowIso,
    lastLoginAt: nowIso,
    emailVerified: true,
    emailVerification: { tokenHash: "", expiresAt: null, sentAt: null },
    passwordReset: { tokenHash: "", expiresAt: null, sentAt: null },
    data: {
      settings: { baseLanguage: "english" },
      profile: { authProvider: "email", isPremium: false, premium: false, plan: "free", tier: "free", membership: "free" },
    },
    progress: {
      totals: { xp: 0, completedSections: 0, lastActivityAt: null },
      worlds: {},
      recentEvents: [],
    },
  };
};

const buildGoogleUserRecord = async ({ id, email, displayName }) => {
  const nowIso = new Date().toISOString();
  const randomPassword = crypto.randomBytes(24).toString("base64url");
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = await deriveHash(randomPassword, salt, 210000, 64, "sha512");
  return {
    id,
    email,
    displayName,
    password: { salt, hash, iterations: 210000, keylen: 64, digest: "sha512" },
    createdAt: nowIso,
    updatedAt: nowIso,
    lastLoginAt: nowIso,
    emailVerified: true,
    emailVerification: { tokenHash: "", expiresAt: null, sentAt: null },
    passwordReset: { tokenHash: "", expiresAt: null, sentAt: null },
    data: {
      settings: { baseLanguage: "english" },
      profile: { authProvider: "google", picture: "" },
    },
    progress: {
      totals: { xp: 0, completedSections: 0, lastActivityAt: null },
      worlds: {},
      recentEvents: [],
    },
  };
};

const seedContractUsers = async () => {
  authTestStore.prepare();
  if (!authStoreSnapshotRaw) {
    authStoreSnapshotRaw = fs.readFileSync(AUTH_STORE_FILE, "utf8");
  }

  const store = JSON.parse(fs.readFileSync(AUTH_STORE_FILE, "utf8"));
  store.users = store.users && typeof store.users === "object" ? store.users : {};
  store.emailIndex = store.emailIndex && typeof store.emailIndex === "object" ? store.emailIndex : {};

  store.users[EMAIL_USER.id] = await buildEmailUserRecord(EMAIL_USER);
  store.users[GOOGLE_USER.id] = await buildGoogleUserRecord(GOOGLE_USER);
  store.emailIndex[EMAIL_USER.email] = EMAIL_USER.id;
  store.emailIndex[GOOGLE_USER.email] = GOOGLE_USER.id;
  store.updatedAt = new Date().toISOString();

  fs.writeFileSync(AUTH_STORE_FILE, JSON.stringify(store, null, 2), "utf8");
};

const restoreAuthStore = () => {
  if (!authStoreSnapshotRaw) {
    return;
  }
  fs.writeFileSync(AUTH_STORE_FILE, authStoreSnapshotRaw, "utf8");
};

const startServer = () => {
  const child = spawn(process.execPath, ["server.js"], {
    cwd: ROOT,
    env: {
      ...process.env,
      ...authTestStore.env(),
      PORT: String(PORT),
      STRIPE_WEBHOOK_SECRET: String(process.env.STRIPE_WEBHOOK_SECRET || "auth-provider-contract-secret"),
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

const parseJsonSafe = async (response) => {
  const text = await response.text();
  try {
    return text ? JSON.parse(text) : null;
  } catch {
    return null;
  }
};

const verifyGoogleAccountRejectsEmailLogin = async () => {
  const response = await fetchWithTimeout(`${BASE_URL}/api/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({
      email: GOOGLE_USER.email,
      password: "anyPassword123",
    }),
  });
  const payload = await parseJsonSafe(response);
  assert(response.status === 409, `google account email login should be 409, got ${response.status}`);
  assert(payload && payload.useGoogleSignIn === true, "google account email login should return useGoogleSignIn=true");
  assert(String(payload?.authProvider || "").toLowerCase() === "google", "google account email login should return authProvider=google");
};

const verifyGoogleAccountRejectsEmailSignup = async () => {
  const response = await fetchWithTimeout(`${BASE_URL}/api/auth/signup`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({
      displayName: "Attempt Signup",
      email: GOOGLE_USER.email,
      password: "TestPass123!",
      baseLanguage: "english",
    }),
  });
  const payload = await parseJsonSafe(response);
  assert(response.status === 409, `google account email signup should be 409, got ${response.status}`);
  const message = String(payload?.error || "").toLowerCase();
  assert(message.includes("google"), "google account signup rejection should mention google login");
};

const verifyEmailAccountStillSupportsEmailLogin = async () => {
  const response = await fetchWithTimeout(`${BASE_URL}/api/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({
      email: EMAIL_USER.email,
      password: EMAIL_USER.password,
    }),
  });
  const payload = await parseJsonSafe(response);
  assert(response.status === 200, `email account login should be 200, got ${response.status}`);
  assert(payload?.ok === true, "email account login should return ok=true");
  assert(payload?.user && typeof payload.user === "object", "email account login should return user object");
};

const main = async () => {
  let child = null;
  try {
    await seedContractUsers();
    const server = startServer();
    child = server.child;

    await waitForHealth();
    await verifyGoogleAccountRejectsEmailLogin();
    await verifyGoogleAccountRejectsEmailSignup();
    await verifyEmailAccountStillSupportsEmailLogin();

    console.log("PASS [auth-provider-contract] provider ownership enforced for signup/login");
  } catch (error) {
    console.error(`FAIL [auth-provider-contract] ${error?.message || error}`);
    process.exitCode = 1;
  } finally {
    await stopServer(child);
    restoreAuthStore();
    authTestStore.cleanup();
  }
};

void main();
