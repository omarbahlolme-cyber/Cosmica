/* ==========================================================================
   HTML CACHE POLICY CHECK
   Ensures HTML responses stay prefetch/speculation-eligible and do not
   regress to no-store headers that trigger Cloudflare speculation refusals.
   ========================================================================== */
const path = require("path");
const { spawn } = require("child_process");
const { createAuthTestStore } = require("./lib/auth-test-store");

const ROOT = path.resolve(__dirname, "..");
const PORT = Number(process.env.CACHE_POLICY_PORT || 4174);
const BASE_URL = `http://127.0.0.1:${PORT}`;
const STARTUP_TIMEOUT_MS = 20000;
const REQUEST_TIMEOUT_MS = 10000;
const ROUTES = ["/index.html", "/world-german.html"];
const authTestStore = createAuthTestStore({
  root: ROOT,
  namespace: "html-cache",
  envKey: "CACHE_POLICY_AUTH_DATA_ROOT",
});

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const fetchWithTimeout = async (url, options = {}, timeoutMs = REQUEST_TIMEOUT_MS) => {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, { ...options, signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
};

const isSpawnRestriction = (value) =>
  /eperm|eacces|operation not permitted/i.test(String(value || ""));

const startServer = () => {
  try {
    authTestStore.prepare();
    const child = spawn(process.execPath, ["server.js"], {
      cwd: ROOT,
      env: {
        ...process.env,
        ...authTestStore.env(),
        PORT: String(PORT),
        AUTH_STORE_BACKEND: "file",
        AUTH_POSTGRES_URL: "",
        DATABASE_URL: "",
        AUTH_POSTGRES_FALLBACK_TO_FILE: "false",
      },
      stdio: ["ignore", "pipe", "pipe"],
    });

    let stderr = "";
    child.stderr.on("data", (chunk) => {
      stderr += chunk.toString();
    });

    child.on("error", (error) => {
      stderr += error.message;
    });

    return { child, getStderr: () => stderr.trim() };
  } catch (error) {
    const message = String(error?.message || error || "").trim();
    return { child: null, getStderr: () => message };
  }
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

const waitForServerHealth = async () => {
  const startedAt = Date.now();
  let lastError = "";
  while (Date.now() - startedAt < STARTUP_TIMEOUT_MS) {
    try {
      const response = await fetchWithTimeout(`${BASE_URL}/api/health`, {}, 2000);
      if (response.ok) {
        return;
      }
      lastError = `health returned ${response.status}`;
    } catch (error) {
      lastError = error.message || String(error);
    }
    await sleep(500);
  }
  throw new Error(`Server did not become healthy in time (${lastError})`);
};

const assertHtmlCachePolicy = async (route, requestOptions = {}) => {
  const response = await fetchWithTimeout(`${BASE_URL}${route}`, requestOptions);
  if (!response.ok) {
    throw new Error(`${route} returned ${response.status}`);
  }
  const cacheControl = String(response.headers.get("cache-control") || "").toLowerCase();
  if (!cacheControl.includes("public")) {
    throw new Error(`${route} cache-control missing public: "${cacheControl}"`);
  }
  if (!cacheControl.includes("max-age=0")) {
    throw new Error(`${route} cache-control missing max-age=0: "${cacheControl}"`);
  }
  if (!cacheControl.includes("must-revalidate")) {
    throw new Error(`${route} cache-control missing must-revalidate: "${cacheControl}"`);
  }
  if (cacheControl.includes("no-store")) {
    throw new Error(`${route} cache-control must not include no-store: "${cacheControl}"`);
  }
};

const main = async () => {
  const { child, getStderr } = startServer();
  if (!child) {
    const stderr = getStderr();
    authTestStore.cleanup();
    if (isSpawnRestriction(stderr)) {
      console.warn("SKIP [html-cache] blocked by environment restrictions");
      if (stderr) {
        console.warn(`- ${stderr}`);
      }
      return;
    }
    throw new Error(stderr || "failed to start server process");
  }

  try {
    await waitForServerHealth();
    for (const route of ROUTES) {
      await assertHtmlCachePolicy(route);
      await assertHtmlCachePolicy(route, {
        headers: {
          Purpose: "prefetch",
          "Sec-Purpose": "prefetch",
          "Sec-Fetch-Dest": "document",
          "Sec-Fetch-Mode": "no-cors",
          "Sec-Fetch-Site": "same-origin",
        },
      });
    }
    console.log("PASS [html-cache] HTML responses are prefetch-eligible");
  } finally {
    await stopServer(child);
    authTestStore.cleanup();
  }
};

main().catch((error) => {
  authTestStore.cleanup();
  console.error(`FAIL [html-cache] ${error.message || error}`);
  process.exit(1);
});
