#!/usr/bin/env node

const https = require("https");

const baseUrl = String(process.env.VERIFY_BASE_URL || "https://www.cosmicalearn.com").trim().replace(/\/+$/, "");
const adminBasicUser = String(process.env.VERIFY_ADMIN_BASIC_USER || "");
const adminBasicPass = String(process.env.VERIFY_ADMIN_BASIC_PASS || "");
const adminToken = String(process.env.VERIFY_ADMIN_TOKEN || "");

const checks = [];
let hasFailure = false;

const safeJsonParse = (value) => {
  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
};

const request = (pathname, options = {}) =>
  new Promise((resolve) => {
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
          resolve({ status: res.statusCode || 0, body, headers: res.headers || {} });
        });
      }
    );
    req.on("error", (error) => resolve({ status: 0, body: String(error.message || error) }));
    if (options.body) {
      req.write(options.body);
    }
    req.end();
  });

const addResult = (name, ok, details) => {
  checks.push({ name, ok, details });
  if (!ok) {
    hasFailure = true;
  }
};

const run = async () => {
  const health = await request("/api/health", { headers: { Accept: "application/json" } });
  const healthJson = safeJsonParse(health.body);
  addResult(
    "health",
    health.status === 200 && healthJson && healthJson.status === "ok",
    `status=${health.status} premiumConfigured=${Boolean(healthJson && healthJson.premiumCheckoutConfigured)}`
  );

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

  if (adminBasicUser && adminBasicPass) {
    const basic = Buffer.from(`${adminBasicUser}:${adminBasicPass}`, "utf8").toString("base64");
    const adminPageAuth = await request("/admin-security.html", {
      headers: { Accept: "text/html", Authorization: `Basic ${basic}` },
    });
    addResult("admin-page-auth", adminPageAuth.status === 200, `status=${adminPageAuth.status}`);
  } else {
    addResult("admin-page-auth", true, "skipped (set VERIFY_ADMIN_BASIC_USER/PASS to test)");
  }

  if (adminToken) {
    const adminApiAuth = await request("/api/admin/security/events?limit=1", {
      headers: { Accept: "application/json", "x-admin-token": adminToken },
    });
    addResult("admin-api-auth", adminApiAuth.status === 200, `status=${adminApiAuth.status}`);
  } else {
    addResult("admin-api-auth", true, "skipped (set VERIFY_ADMIN_TOKEN to test)");
  }

  console.log(`VERIFY_BASE_URL=${baseUrl}`);
  for (const check of checks) {
    const mark = check.ok ? "PASS" : "FAIL";
    console.log(`[${mark}] ${check.name} :: ${check.details}`);
  }

  if (hasFailure) {
    process.exitCode = 1;
    return;
  }
  console.log("All integration checks passed.");
};

void run();