#!/usr/bin/env node

const https = require("https");
require("dotenv").config();

const baseUrl = String(process.env.VERIFY_BASE_URL || "https://www.cosmicalearn.com").trim().replace(/\/+$/, "");
const REQUEST_TIMEOUT_MS = Math.max(
  2000,
  Number(process.env.VERIFY_REQUEST_TIMEOUT_MS || 15000)
);
const adminBasicUser = String(
  process.env.VERIFY_ADMIN_BASIC_USER || process.env.ADMIN_SECURITY_BASIC_USER || ""
);
const adminBasicPass = String(
  process.env.VERIFY_ADMIN_BASIC_PASS || process.env.ADMIN_SECURITY_BASIC_PASS || ""
);
const adminToken = String(
  process.env.VERIFY_ADMIN_TOKEN || process.env.ADMIN_SECURITY_TOKEN || process.env.ADMIN_API_TOKEN || ""
);
const authEmail = String(
  process.env.VERIFY_AUTH_EMAIL || process.env.MONITOR_AUTH_EMAIL || process.env.E2E_AUTH_EMAIL || ""
)
  .trim()
  .toLowerCase();
const authPassword = String(
  process.env.VERIFY_AUTH_PASSWORD || process.env.MONITOR_AUTH_PASSWORD || process.env.E2E_AUTH_PASSWORD || ""
);
const baseOrigin = (() => {
  try {
    return new URL(baseUrl).origin;
  } catch {
    return baseUrl;
  }
})();

const checks = [];
let hasFailure = false;
let hasCoverageSkips = false;

const safeJsonParse = (value) => {
  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
};

const request = (pathname, options = {}) =>
  new Promise((resolve) => {
    const startedAtMs = Date.now();
    const req = https.request(
      `${baseUrl}${pathname}`,
      {
        method: options.method || "GET",
        headers: options.headers || {},
      },
      (res) => {
        const chunks = [];
        res.on("data", (chunk) => chunks.push(Buffer.from(chunk)));
        res.on("end", () => {
          const body = Buffer.concat(chunks).toString("utf8");
          resolve({
            status: res.statusCode || 0,
            body,
            headers: res.headers || {},
            durationMs: Date.now() - startedAtMs,
          });
        });
      }
    );
    req.setTimeout(REQUEST_TIMEOUT_MS, () => {
      req.destroy(new Error(`Request timed out after ${REQUEST_TIMEOUT_MS}ms`));
    });
    req.on("error", (error) =>
      resolve({
        status: 0,
        body: String(error.message || error),
        headers: {},
        durationMs: Date.now() - startedAtMs,
      })
    );
    if (options.body) {
      req.write(options.body);
    }
    req.end();
  });

const addResult = (name, ok, details) => {
  const check = { name, ok, details };
  checks.push(check);
  if (!ok) {
    hasFailure = true;
  }
  const mark = ok ? "PASS" : "FAIL";
  console.log(`[${mark}] ${check.name} :: ${check.details}`);
};

const extractCookieHeader = (headers) => {
  if (!headers) {
    return "";
  }
  const setCookie = headers["set-cookie"];
  if (Array.isArray(setCookie)) {
    return setCookie
      .map((cookie) => String(cookie || "").split(";")[0].trim())
      .filter(Boolean)
      .join("; ");
  }
  return String(setCookie || "")
    .split(";")[0]
    .trim();
};

const verifyAuthContractShape = (payload) => {
  if (!payload || typeof payload !== "object") {
    return false;
  }
  if (payload.ok !== true || !payload.user || typeof payload.user !== "object") {
    return false;
  }
  if (!payload.data || typeof payload.data !== "object") {
    return false;
  }
  if (!payload.data.profile || typeof payload.data.profile !== "object") {
    return false;
  }
  const profile = payload.data.profile;
  const tier = String(profile.plan || profile.tier || profile.membership || "")
    .trim()
    .toLowerCase();
  if (!tier) {
    return false;
  }
  return true;
};

const verifyProgressContractShape = (payload) => {
  if (!payload || typeof payload !== "object") {
    return false;
  }
  if (payload.ok !== true || !payload.progress || typeof payload.progress !== "object") {
    return false;
  }
  if (!payload.progress.totals || typeof payload.progress.totals !== "object") {
    return false;
  }
  if (!payload.progress.worlds || typeof payload.progress.worlds !== "object") {
    return false;
  }
  return true;
};

const containsIgnoreCase = (text, needle) =>
  String(text || "").toLowerCase().includes(String(needle || "").toLowerCase());

console.log(`VERIFY_BASE_URL=${baseUrl}`);

const run = async () => {
  const health = await request("/api/health", { headers: { Accept: "application/json" } });
  const healthJson = safeJsonParse(health.body);
  const runtimeStatus = String(healthJson?.runtimeStatus || "ok").trim().toLowerCase();
  addResult(
    "health",
    health.status === 200 &&
      healthJson &&
      healthJson.status === "ok" &&
      runtimeStatus !== "failing" &&
      !Object.prototype.hasOwnProperty.call(healthJson, "dependencies") &&
      !Object.prototype.hasOwnProperty.call(healthJson, "apiFailures"),
    `status=${health.status} runtimeStatus=${runtimeStatus} minimalPayload=${Boolean(healthJson && !healthJson.dependencies && !healthJson.apiFailures)} durationMs=${health.durationMs}`
  );

  const home = await request("/", { headers: { Accept: "text/html" } });
  const homeHeaders = home.headers || {};
  const hasHsts = typeof homeHeaders["strict-transport-security"] === "string";
  const hasNoSniff = String(homeHeaders["x-content-type-options"] || "").toLowerCase() === "nosniff";
  const hasReferrerPolicy = typeof homeHeaders["referrer-policy"] === "string";
  addResult(
    "security-headers",
    home.status === 200 && hasHsts && hasNoSniff && hasReferrerPolicy,
    `status=${home.status} hsts=${hasHsts} nosniff=${hasNoSniff} referrerPolicy=${hasReferrerPolicy}`
  );

  const hasCanonicalTag =
    containsIgnoreCase(home.body, "rel=\"canonical\"") || containsIgnoreCase(home.body, "rel='canonical'");
  const canonicalPointsToSite = containsIgnoreCase(home.body, baseOrigin);
  addResult(
    "seo-canonical-home",
    home.status === 200 && hasCanonicalTag && canonicalPointsToSite,
    `status=${home.status} canonicalTag=${hasCanonicalTag} canonicalHasOrigin=${canonicalPointsToSite}`
  );

  const robots = await request("/robots.txt", { headers: { Accept: "text/plain,text/*" } });
  const robotsHasSitemap = containsIgnoreCase(robots.body, "sitemap:");
  const robotsBlocksAll = /Disallow:\s*\/\s*$/im.test(String(robots.body || ""));
  addResult(
    "robots",
    robots.status === 200 && robotsHasSitemap && !robotsBlocksAll,
    `status=${robots.status} hasSitemap=${robotsHasSitemap} blocksAll=${robotsBlocksAll}`
  );

  const sitemap = await request("/sitemap.xml", { headers: { Accept: "application/xml,text/xml,*/*" } });
  const sitemapContentType = String(sitemap.headers?.["content-type"] || "").toLowerCase();
  const sitemapLooksXml = containsIgnoreCase(sitemap.body, "<urlset") || containsIgnoreCase(sitemap.body, "<sitemapindex");
  const sitemapContentTypeOk =
    sitemapContentType.includes("xml") || sitemapContentType.includes("application/octet-stream");
  addResult(
    "sitemap",
    sitemap.status === 200 && sitemapLooksXml && sitemapContentTypeOk,
    `status=${sitemap.status} xmlBody=${sitemapLooksXml} contentType=${sitemapContentType || "none"}`
  );

  const securityTxt = await request("/.well-known/security.txt", {
    headers: { Accept: "text/plain,text/*" },
  });
  const securityTxtHasContact = containsIgnoreCase(securityTxt.body, "contact:");
  const securityTxtHasExpires = containsIgnoreCase(securityTxt.body, "expires:");
  addResult(
    "security-txt",
    securityTxt.status === 200 && securityTxtHasContact && securityTxtHasExpires,
    `status=${securityTxt.status} contact=${securityTxtHasContact} expires=${securityTxtHasExpires}`
  );

  for (const legalPath of ["/privacy.html", "/terms.html", "/license.html"]) {
    const legal = await request(legalPath, { headers: { Accept: "text/html" } });
    addResult(`legal${legalPath}`, legal.status === 200, `status=${legal.status}`);
  }

  for (const learningPath of ["/index.html", "/english-world.html", "/english-words.html", "/english-grammar.html"]) {
    const learning = await request(learningPath, { headers: { Accept: "text/html" } });
    const hasMain = containsIgnoreCase(learning.body, "<main");
    if (learningPath === "/index.html") {
      const redirectLocation = String(learning.headers?.location || "");
      const redirectOk =
        [301, 302, 307, 308].includes(learning.status) &&
        (redirectLocation === "/" || redirectLocation.endsWith("/"));
      addResult(
        `learning${learningPath}`,
        (learning.status === 200 && hasMain) || redirectOk,
        `status=${learning.status} hasMain=${hasMain} location=${redirectLocation || "(none)"}`
      );
    } else {
      addResult(
        `learning${learningPath}`,
        learning.status === 200 && hasMain,
        `status=${learning.status} hasMain=${hasMain}`
      );
    }
  }

  const chatBody = JSON.stringify({ messages: [{ role: "user", content: "ping" }] });
  const chat = await request("/api/chat", {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      "Content-Length": Buffer.byteLength(chatBody),
    },
    body: chatBody,
  });
  const chatJson = safeJsonParse(chat.body);
  addResult(
    "chat",
    chat.status === 200 && chatJson && typeof chatJson.content === "string" && chatJson.content.length > 0,
    `status=${chat.status}`
  );

  const google = await request("/api/auth/google/start/login?returnTo=%2F", {
    headers: { Accept: "application/json" },
  });
  const googleJson = safeJsonParse(google.body);
  addResult(
    "google-oauth",
    google.status === 200 && googleJson && typeof googleJson.redirectUrl === "string" && googleJson.redirectUrl.includes("accounts.google.com"),
    `status=${google.status}`
  );

  const resendBody = JSON.stringify({ email: "nonexistent-check@cosmica.local", returnTo: "/" });
  const verification = await request("/api/auth/verification/resend", {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      "Content-Length": Buffer.byteLength(resendBody),
    },
    body: resendBody,
  });
  const verificationJson = safeJsonParse(verification.body);
  addResult(
    "email-verification",
    verification.status === 200 && verificationJson && verificationJson.ok === true,
    `status=${verification.status}`
  );

  const anonymousAdminPage = await request("/admin-security.html", { headers: { Accept: "text/html" } });
  addResult(
    "admin-page-anon-gate",
    anonymousAdminPage.status === 401,
    `status=${anonymousAdminPage.status} (expected 401)`
  );

  const anonymousAdminApi = await request("/api/admin/security/events?limit=1", {
    headers: { Accept: "application/json" },
  });
  addResult(
    "admin-api-anon-gate",
    anonymousAdminApi.status === 401,
    `status=${anonymousAdminApi.status} (expected 401)`
  );

  const anonymousUpgrade = await request("/api/account/premium/upgrade", {
    method: "POST",
    headers: { Accept: "application/json" },
  });
  addResult(
    "premium-upgrade-anon-gate",
    anonymousUpgrade.status === 401,
    `status=${anonymousUpgrade.status} (expected 401)`
  );

  const anonymousPremiumOptions = await request("/api/billing/premium/options", {
    headers: { Accept: "application/json" },
  });
  addResult(
    "premium-options-anon-gate",
    anonymousPremiumOptions.status === 401,
    `status=${anonymousPremiumOptions.status} (expected 401)`
  );

  const anonymousProgress = await request("/api/progress", {
    headers: { Accept: "application/json" },
  });
  addResult(
    "progress-anon-gate",
    anonymousProgress.status === 401,
    `status=${anonymousProgress.status} (expected 401)`
  );

  if (authEmail && authPassword) {
    const loginBody = JSON.stringify({ email: authEmail, password: authPassword });
    const login = await request("/api/auth/login", {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        "Content-Length": Buffer.byteLength(loginBody),
      },
      body: loginBody,
    });
    const loginJson = safeJsonParse(login.body);
    const authCookie = extractCookieHeader(login.headers);
    const loginOk = login.status === 200 && Boolean(authCookie);
    addResult("auth-login", loginOk, `status=${login.status} cookie=${Boolean(authCookie)} error=${String(loginJson?.error || "")}`);

    if (loginOk) {
      const authMe = await request("/api/auth/me", {
        headers: {
          Accept: "application/json",
          Cookie: authCookie,
        },
      });
      const authMeJson = safeJsonParse(authMe.body);
      addResult(
        "auth-me",
        authMe.status === 200 && verifyAuthContractShape(authMeJson),
        `status=${authMe.status}`
      );

      const accountData = await request("/api/account/data", {
        headers: {
          Accept: "application/json",
          Cookie: authCookie,
        },
      });
      const accountDataJson = safeJsonParse(accountData.body);
      addResult(
        "account-data-auth",
        accountData.status === 200 && accountDataJson && accountDataJson.ok === true && accountDataJson.data && typeof accountDataJson.data === "object",
        `status=${accountData.status}`
      );

      const premiumOptions = await request("/api/billing/premium/options", {
        headers: {
          Accept: "application/json",
          Cookie: authCookie,
        },
      });
      const premiumOptionsJson = safeJsonParse(premiumOptions.body);
      const optionsOk =
        premiumOptions.status === 200
          ? premiumOptionsJson && Array.isArray(premiumOptionsJson.options)
          : premiumOptions.status === 503;
      addResult("premium-options-auth", Boolean(optionsOk), `status=${premiumOptions.status}`);

      const progress = await request("/api/progress", {
        headers: {
          Accept: "application/json",
          Cookie: authCookie,
        },
      });
      const progressJson = safeJsonParse(progress.body);
      addResult("progress-auth", progress.status === 200 && verifyProgressContractShape(progressJson), `status=${progress.status}`);
    }
  } else {
    hasCoverageSkips = true;
    addResult("auth-login", true, "skipped (set VERIFY_AUTH_EMAIL/PASSWORD to test)");
    addResult("auth-me", true, "skipped (set VERIFY_AUTH_EMAIL/PASSWORD to test)");
    addResult("account-data-auth", true, "skipped (set VERIFY_AUTH_EMAIL/PASSWORD to test)");
    addResult("premium-options-auth", true, "skipped (set VERIFY_AUTH_EMAIL/PASSWORD to test)");
    addResult("progress-auth", true, "skipped (set VERIFY_AUTH_EMAIL/PASSWORD to test)");
  }

  if (adminBasicUser && adminBasicPass) {
    const basic = Buffer.from(`${adminBasicUser}:${adminBasicPass}`, "utf8").toString("base64");
    const adminPageAuth = await request("/admin-security.html", {
      headers: { Accept: "text/html", Authorization: `Basic ${basic}` },
    });
    addResult("admin-page-auth", adminPageAuth.status === 200, `status=${adminPageAuth.status}`);
  } else {
    hasCoverageSkips = true;
    addResult("admin-page-auth", true, "skipped (set VERIFY_ADMIN_BASIC_USER/PASS to test)");
  }

  if (adminToken) {
    const adminApiAuth = await request("/api/admin/security/events?limit=1", {
      headers: { Accept: "application/json", "x-admin-token": adminToken },
    });
    addResult("admin-api-auth", adminApiAuth.status === 200, `status=${adminApiAuth.status}`);
  } else {
    hasCoverageSkips = true;
    addResult("admin-api-auth", true, "skipped (set VERIFY_ADMIN_TOKEN to test)");
  }

  if (hasCoverageSkips) {
    console.warn(
      "WARN [coverage] some authenticated/admin live checks were skipped; set VERIFY_AUTH_EMAIL/PASSWORD and VERIFY_ADMIN_* to cover all paths."
    );
  }

  if (hasFailure) {
    process.exitCode = 1;
    return;
  }
  console.log("All integration checks passed.");
};

void run();
