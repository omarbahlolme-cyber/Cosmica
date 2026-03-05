const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const { spawn } = require("child_process");
const { chromium } = require("playwright");

const ROOT = path.resolve(__dirname, "..");
const AUTH_STORE_FILE = path.join(ROOT, "backend", "data", "accounts.json");
const PORT = Number(process.env.MATRIX_PORT || 4183);
const BASE_URL = `http://127.0.0.1:${PORT}`;
const STARTUP_TIMEOUT_MS = 30000;

const FREE_USER = {
  id: "b2b2b2b2-1111-4222-8333-111111111111",
  email: "matrix.free@cosmica.local",
  password: "TestPass123!",
  displayName: "Matrix Free",
};

const PREMIUM_USER = {
  id: "c3c3c3c3-1111-4222-8333-222222222222",
  email: "matrix.premium@cosmica.local",
  password: "TestPass123!",
  displayName: "Matrix Premium",
};

let authSnapshotRaw = "";
const results = [];

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const assert = (condition, message) => {
  if (!condition) {
    throw new Error(message);
  }
};

const addResult = (name, pass, details = "") => {
  results.push({ name, pass, details });
  const status = pass ? "PASS" : "FAIL";
  console.log(`${status} [${name}] ${details}`.trim());
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

const buildUserRecord = async ({ id, email, password, displayName, premium }) => {
  const nowIso = new Date().toISOString();
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
        premiumStripeSubscriptionStatus: "active",
        premiumCurrentPeriodEnd: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        premiumActivatedAt: nowIso,
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
    createdAt: nowIso,
    updatedAt: nowIso,
    lastLoginAt: nowIso,
    emailVerified: true,
    emailVerification: { tokenHash: "", expiresAt: null, sentAt: null },
    passwordReset: { tokenHash: "", expiresAt: null, sentAt: null },
    data: {
      settings: { baseLanguage: "english" },
      profile,
    },
    progress: {
      totals: { xp: premium ? 320 : 120, completedSections: premium ? 6 : 2, lastActivityAt: nowIso },
      worlds: {},
      recentEvents: [],
      gamification: {
        currentStreak: premium ? 6 : 2,
        bestStreak: premium ? 11 : 3,
      },
    },
  };
};

const seedUsers = async () => {
  if (!authSnapshotRaw) {
    authSnapshotRaw = fs.readFileSync(AUTH_STORE_FILE, "utf8");
  }
  const store = JSON.parse(fs.readFileSync(AUTH_STORE_FILE, "utf8"));
  store.users = store.users && typeof store.users === "object" ? store.users : {};
  store.emailIndex = store.emailIndex && typeof store.emailIndex === "object" ? store.emailIndex : {};

  store.users[FREE_USER.id] = await buildUserRecord({ ...FREE_USER, premium: false });
  store.users[PREMIUM_USER.id] = await buildUserRecord({ ...PREMIUM_USER, premium: true });
  store.emailIndex[FREE_USER.email] = FREE_USER.id;
  store.emailIndex[PREMIUM_USER.email] = PREMIUM_USER.id;
  store.updatedAt = new Date().toISOString();

  fs.writeFileSync(AUTH_STORE_FILE, JSON.stringify(store, null, 2), "utf8");
};

const restoreStore = () => {
  if (authSnapshotRaw) {
    fs.writeFileSync(AUTH_STORE_FILE, authSnapshotRaw, "utf8");
  }
};

const startServer = () => {
  const child = spawn(process.execPath, ["server.js"], {
    cwd: ROOT,
    env: {
      ...process.env,
      PORT: String(PORT),
      ALLOW_SELF_PREMIUM_UPGRADE: "true",
      STRIPE_WEBHOOK_SECRET: String(process.env.STRIPE_WEBHOOK_SECRET || "matrix-local-secret"),
    },
    stdio: ["ignore", "pipe", "pipe"],
  });

  let stderr = "";
  child.stderr.on("data", (chunk) => {
    stderr += String(chunk || "");
  });

  return {
    child,
    getStderr: () => stderr,
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

const waitForHealth = async () => {
  const start = Date.now();
  let lastErr = "";
  while (Date.now() - start < STARTUP_TIMEOUT_MS) {
    try {
      const response = await fetch(`${BASE_URL}/api/health`);
      if (response.ok) {
        return;
      }
      lastErr = `status=${response.status}`;
    } catch (error) {
      lastErr = String(error?.message || error);
    }
    await sleep(300);
  }
  throw new Error(`Health check failed: ${lastErr}`);
};

const extractSessionCookieValue = (headers) => {
  const setCookie = typeof headers.getSetCookie === "function" ? headers.getSetCookie() : [];
  for (const cookie of setCookie) {
    const match = String(cookie || "").match(/cosmica_session=([^;]+)/i);
    if (match && match[1]) {
      return match[1];
    }
  }
  const fallback = String(headers.get("set-cookie") || "");
  const fallbackMatch = fallback.match(/cosmica_session=([^;]+)/i);
  return fallbackMatch ? fallbackMatch[1] : "";
};

const loginAndGetSessionCookieValue = async ({ email, password }) => {
  const response = await fetch(`${BASE_URL}/api/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({ email, password }),
  });
  assert(response.status === 200, `Login failed (${response.status}) for ${email}`);
  const cookieValue = extractSessionCookieValue(response.headers);
  assert(cookieValue, `Missing session cookie for ${email}`);
  return cookieValue;
};

const upgradeToPremiumByCookie = async (cookieValue) => {
  const response = await fetch(`${BASE_URL}/api/account/premium/upgrade`, {
    method: "POST",
    headers: {
      Accept: "application/json",
      Cookie: `cosmica_session=${cookieValue}`,
    },
  });
  return response.status;
};

const restorePremiumByCookie = async (cookieValue) => {
  const response = await fetch(`${BASE_URL}/api/billing/subscription/restore`, {
    method: "POST",
    headers: {
      Accept: "application/json",
      Cookie: `cosmica_session=${cookieValue}`,
    },
  });
  let payload = null;
  try {
    payload = await response.json();
  } catch {}
  return {
    status: response.status,
    payload,
  };
};

const applySessionCookieToBrowser = async (context, cookieValue) => {
  await context.clearCookies();
  if (!cookieValue) {
    return;
  }
  await context.addCookies([
    {
      name: "cosmica_session",
      value: cookieValue,
      domain: "127.0.0.1",
      path: "/",
      httpOnly: true,
      secure: false,
      sameSite: "Lax",
    },
  ]);
};

const gotoAndInit = async (page, route) => {
  await page.goto(`${BASE_URL}${route}`, { waitUntil: "domcontentloaded" });
  await page.waitForFunction(
    () => Boolean(window.cosmicaGamification && typeof window.cosmicaGamification.init === "function"),
    { timeout: 20000 }
  );
  await page.evaluate(async () => {
    try {
      await window.cosmicaGamification.init(true);
    } catch {}
  });
  await page.waitForTimeout(350);
};

const getAccountTriggerMeta = async (page) => {
  return page.evaluate(() => {
    const metaNode = document.querySelector(".nav-controls .account-slot .account-trigger-meta");
    return String(metaNode?.textContent || "").trim();
  });
};

const checkPremiumUpsellPresent = async (page) => {
  return page.locator(".chat-message.mimi.premium-upsell").count();
};

const checkAuthDropdownOpen = async (page) => {
  return page.evaluate(() => {
    const dropdown = document.querySelector(".account-dropdown");
    return Boolean(dropdown && !dropdown.hidden);
  });
};

const submitChat = async (page, text) => {
  await page.waitForSelector("#chatForm", { timeout: 15000 });
  const chatInput = page.locator("#chatInput");
  await chatInput.scrollIntoViewIfNeeded();
  await chatInput.fill(text);
  await chatInput.press("Enter").catch(async () => {
    await page.evaluate(() => {
      const form = document.querySelector("#chatForm");
      if (form instanceof HTMLFormElement) {
        form.requestSubmit();
      }
    });
  });
  await page.waitForTimeout(700);
};

const waitForGrammarLockState = async (page, expectedLocked) => {
  await page.waitForFunction(() => {
    const card = document.querySelector(".map-card.map-grammar");
    if (!card) {
      return false;
    }
    return card.dataset.premiumLocked === "true" || card.dataset.premiumLocked === "false";
  }, { timeout: 15000 });

  await page.waitForFunction((shouldBeLocked) => {
    const card = document.querySelector(".map-card.map-grammar");
    if (!card) {
      return false;
    }
    const locked = card.classList.contains("premium-locked") || card.classList.contains("coming-soon");
    return shouldBeLocked ? locked : !locked;
  }, expectedLocked, { timeout: 15000 });
};

const checkLettersCheckmarkExists = async (page) => {
  return page.evaluate(() => {
    const btn = document.querySelector(".letters-grid-section .map-section-complete-btn");
    return Boolean(btn);
  });
};

const checkLettersCheckmarkVisible = async (page) => {
  return page.evaluate(() => {
    const btn = document.querySelector(".letters-grid-section .map-section-complete-btn");
    if (!(btn instanceof HTMLElement)) {
      return false;
    }
    return !btn.hidden;
  });
};

const openAccountManagePanel = async (page) => {
  await page.waitForSelector(".account-trigger", { timeout: 15000 });
  await page.click(".account-trigger");
  await page.waitForSelector(".account-dropdown", { timeout: 15000 });
  await page.waitForSelector('.account-menu-links button[data-menu="manage"]', { timeout: 15000 });
  await page.click('.account-menu-links button[data-menu="manage"]');
  await page.waitForSelector(".account-manage-panel", { timeout: 15000 });
};

const clickRestoreAndGetFeedback = async (page) => {
  await page.waitForSelector(".account-manage-restore-premium", { timeout: 15000 });
  await page.click(".account-manage-restore-premium");
  await page.waitForFunction(() => {
    const feedback = document.querySelector(".account-feedback");
    const text = String(feedback?.textContent || "").trim().toLowerCase();
    return (
      text.includes("no active premium plan found") ||
      text.includes("premium restored successfully") ||
      text.includes("premium is already active")
    );
  }, { timeout: 20000 });
  return page.evaluate(() => {
    const feedback = document.querySelector(".account-feedback");
    return String(feedback?.textContent || "").trim();
  });
};

const runMatrix = async () => {
  await seedUsers();
  const server = startServer();
  let browser = null;

  try {
    await waitForHealth();
    browser = await chromium.launch({ headless: true });
    const context = await browser.newContext({ baseURL: BASE_URL });
    const page = await context.newPage();
    page.on("pageerror", (error) => {
      console.log(`PAGEERROR: ${error?.message || error}`);
    });
    page.on("console", (msg) => {
      if (msg.type() === "error") {
        console.log(`CONSOLE-ERROR: ${msg.text()}`);
      }
    });

    // Guest
    await applySessionCookieToBrowser(context, "");
    await gotoAndInit(page, "/index.html");
    const guestAuth = await page.evaluate(() => Boolean(window.cosmicaGamification.getState()?.isAuthenticated));
    addResult("guest-auth-state", guestAuth === false);

    const guestMeta = await getAccountTriggerMeta(page);
    addResult("guest-streak-hidden", /^sign in$/i.test(guestMeta), `meta=${guestMeta}`);

    await submitChat(page, "hello guest");
    addResult("guest-chat-auth-prompt", await checkAuthDropdownOpen(page));

    await gotoAndInit(page, "/world-french.html");
    await waitForGrammarLockState(page, true);
    const guestGrammarLocked = await page.evaluate(() => {
      const card = document.querySelector(".map-card.map-grammar");
      return Boolean(card && (card.classList.contains("premium-locked") || card.classList.contains("coming-soon")));
    });
    addResult("guest-grammar-locked", guestGrammarLocked === true);

    await gotoAndInit(page, "/letters-french.html");
    await page.waitForSelector(".letters-grid-section .map-section-complete-btn", {
      timeout: 15000,
      state: "attached",
    });
    addResult("guest-checkmark-present", (await checkLettersCheckmarkExists(page)) === true);
    addResult("guest-checkmark-hidden", (await checkLettersCheckmarkVisible(page)) === false);

    // Free
    const freeCookie = await loginAndGetSessionCookieValue(FREE_USER);
    await applySessionCookieToBrowser(context, freeCookie);
    await gotoAndInit(page, "/index.html");

    const freeAuth = await page.evaluate(() => Boolean(window.cosmicaGamification.getState()?.isAuthenticated));
    addResult("free-auth-state", freeAuth === true);

    const freeMeta = await getAccountTriggerMeta(page);
    addResult("free-streak-visible", /^(streak|active)\s+\d+d$/i.test(freeMeta), `meta=${freeMeta}`);

    await submitChat(page, "hello free");
    addResult("free-chat-upsell", (await checkPremiumUpsellPresent(page)) > 0);

    const freeRestoreApi = await restorePremiumByCookie(freeCookie);
    addResult(
      "free-restore-api-guard",
      freeRestoreApi.status === 409 &&
        String(freeRestoreApi.payload?.code || "").trim().toLowerCase() ===
          "no_active_premium_plan_found",
      `status=${freeRestoreApi.status}`
    );

    await openAccountManagePanel(page);
    const freeRestoreFeedback = await clickRestoreAndGetFeedback(page);
    addResult(
      "free-restore-ui-error",
      /no active premium plan found/i.test(freeRestoreFeedback),
      freeRestoreFeedback
    );

    const freePlanLabel = await page.evaluate(() => {
      const node = document.querySelector(".account-menu-plan-status");
      return String(node?.textContent || "").trim();
    });
    addResult("free-plan-stays-free-after-restore", /free plan/i.test(freePlanLabel), freePlanLabel);

    const upgradeStatus = await upgradeToPremiumByCookie(freeCookie);
    addResult("free-upgrade-api", upgradeStatus === 200, `status=${upgradeStatus}`);

    await page.evaluate(async () => {
      await window.cosmicaGamification.init(true);
    });
    await page.waitForTimeout(350);
    addResult("upsell-clears-after-upgrade", (await checkPremiumUpsellPresent(page)) === 0);

    await gotoAndInit(page, "/world-french.html");
    await waitForGrammarLockState(page, false);
    const upgradedGrammarUnlocked = await page.evaluate(() => {
      const card = document.querySelector(".map-card.map-grammar");
      return Boolean(card && !card.classList.contains("premium-locked") && !card.classList.contains("coming-soon"));
    });
    addResult("upgraded-grammar-unlocked", upgradedGrammarUnlocked === true);

    await gotoAndInit(page, "/letters-french.html");
    await page.waitForSelector(".letters-grid-section .map-section-complete-btn", { timeout: 15000 });
    addResult("upgraded-checkmark-present", (await checkLettersCheckmarkExists(page)) === true);

    // Premium
    const premiumCookie = await loginAndGetSessionCookieValue(PREMIUM_USER);
    await applySessionCookieToBrowser(context, premiumCookie);
    await gotoAndInit(page, "/index.html");

    const premiumRestoreApi = await restorePremiumByCookie(premiumCookie);
    addResult(
      "premium-restore-api-active",
      premiumRestoreApi.status === 200 &&
        String(premiumRestoreApi.payload?.status || "").trim().toLowerCase() === "already_active",
      `status=${premiumRestoreApi.status}`
    );

    await openAccountManagePanel(page);
    const premiumRestoreHidden = await page.evaluate(() => {
      const btn = document.querySelector(".account-manage-restore-premium");
      return Boolean(btn && btn.hidden === true);
    });
    addResult("premium-restore-ui-hidden-when-active", premiumRestoreHidden === true);

    const premiumMeta = await getAccountTriggerMeta(page);
    addResult("premium-streak-visible", /^level\s+\d+/i.test(premiumMeta), `meta=${premiumMeta}`);

    await submitChat(page, "hello premium");
    const premiumUpsellCount = await checkPremiumUpsellPresent(page);
    const premiumUserMessages = await page.locator(".chat-message.user").count();
    addResult("premium-no-upsell", premiumUpsellCount === 0, `upsell=${premiumUpsellCount}`);
    addResult("premium-chat-send", premiumUserMessages > 0, `userMessages=${premiumUserMessages}`);

    await gotoAndInit(page, "/world-french.html");
    await waitForGrammarLockState(page, false);
    const premiumGrammarUnlocked = await page.evaluate(() => {
      const card = document.querySelector(".map-card.map-grammar");
      return Boolean(card && !card.classList.contains("premium-locked") && !card.classList.contains("coming-soon"));
    });
    addResult("premium-grammar-unlocked", premiumGrammarUnlocked === true);

    await gotoAndInit(page, "/letters-french.html");
    await page.waitForSelector(".letters-grid-section .map-section-complete-btn", { timeout: 15000 });
    addResult("premium-checkmark-present", (await checkLettersCheckmarkExists(page)) === true);

    const failed = results.filter((r) => !r.pass);
    console.log(`\nSUMMARY: ${results.length - failed.length}/${results.length} passed`);
    if (failed.length > 0) {
      console.log("FAILED CASES:");
      failed.forEach((item) => {
        console.log(`- ${item.name}${item.details ? ` (${item.details})` : ""}`);
      });
      process.exitCode = 1;
    }
  } finally {
    if (browser) {
      await browser.close().catch(() => {});
    }
    await stopServer(server.child);
    restoreStore();
  }
};

runMatrix().catch((error) => {
  console.error(`MATRIX ERROR: ${error?.stack || error?.message || error}`);
  process.exitCode = 1;
  restoreStore();
});
