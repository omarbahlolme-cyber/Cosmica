/* ==========================================================================
   PERFORMANCE SNAPSHOT
   - Starts local server, probes core pages/assets, and records response timing.
   - Use --write to refresh perf/baseline.json.
   ========================================================================== */
const fs = require("fs");
const path = require("path");
const { spawn } = require("child_process");

/* --------------------------------------------------------------------------
   CONFIG
   -------------------------------------------------------------------------- */
const ROOT = path.resolve(__dirname, "..");
const PERF_DIR = path.join(ROOT, "perf");
const BASELINE_PATH = path.join(PERF_DIR, "baseline.json");
const PORT = Number(process.env.PERF_PORT || 4174);
const BASE_URL = `http://127.0.0.1:${PORT}`;
const STARTUP_TIMEOUT_MS = 20000;
const REQUEST_TIMEOUT_MS = 10000;

const ROUTES = [
  "/index.html",
  "/world.html",
  "/letters.html",
  "/words.html",
  "/phrases.html",
  "/grammar.html",
  "/style.css",
  "/style-maps.css",
  "/app.js",
  "/app-maps.js",
  "/translations.json",
];

/* --------------------------------------------------------------------------
   HELPERS
   -------------------------------------------------------------------------- */
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const fetchWithTimeout = async (url, timeoutMs = REQUEST_TIMEOUT_MS) => {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, { signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
};

const startServer = () => {
  const child = spawn(process.execPath, ["server.js"], {
    cwd: ROOT,
    env: { ...process.env, PORT: String(PORT) },
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
      const response = await fetchWithTimeout(`${BASE_URL}/api/health`, 2000);
      if (response.ok) {
        return;
      }
      lastError = `health returned ${response.status}`;
    } catch (error) {
      lastError = error.message || String(error);
    }
    await sleep(400);
  }

  throw new Error(`Server did not become healthy in time (${lastError})`);
};

const captureRoute = async (route) => {
  const url = `${BASE_URL}${route}`;
  const started = process.hrtime.bigint();
  const response = await fetchWithTimeout(url);
  const body = await response.arrayBuffer();
  const elapsedNs = process.hrtime.bigint() - started;

  return {
    status: response.status,
    durationMs: Number(elapsedNs / 1000000n),
    bytes: body.byteLength,
    cacheControl: response.headers.get("cache-control") || "",
  };
};

const buildSnapshot = async () => {
  const { child, getStderr } = startServer();
  try {
    await waitForServerHealth();
    const routes = {};
    for (const route of ROUTES) {
      routes[route] = await captureRoute(route);
    }
    return {
      generatedAt: new Date().toISOString(),
      baseUrl: BASE_URL,
      routes,
    };
  } catch (error) {
    const stderr = getStderr();
    const message = stderr
      ? `${error.message || error} | stderr: ${stderr}`
      : error.message || String(error);
    throw new Error(message);
  } finally {
    await stopServer(child);
  }
};

/* --------------------------------------------------------------------------
   MAIN
   -------------------------------------------------------------------------- */
const writeMode = process.argv.includes("--write");

buildSnapshot()
  .then((snapshot) => {
    const non200 = Object.entries(snapshot.routes)
      .filter(([, data]) => data.status !== 200)
      .map(([route, data]) => `${route} => ${data.status}`);

    if (non200.length) {
      throw new Error(`Performance snapshot failed due to non-200 routes: ${non200.join(", ")}`);
    }

    if (writeMode) {
      fs.mkdirSync(PERF_DIR, { recursive: true });
      fs.writeFileSync(BASELINE_PATH, JSON.stringify(snapshot, null, 2), "utf8");
      console.log(`PASS [perf] baseline written: ${path.relative(ROOT, BASELINE_PATH)}`);
      return;
    }

    console.log(JSON.stringify(snapshot, null, 2));
  })
  .catch((error) => {
    console.error("PERF SNAPSHOT FAILED");
    console.error(`- ${error.message || error}`);
    process.exit(1);
  });
