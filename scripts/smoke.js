/* ==========================================================================
   SMOKE TESTS
   - Validates local HTML file references (href/src) resolve to real files.
   - Boots the local server on an isolated port and checks core routes.
   ========================================================================== */
const fs = require("fs");
const path = require("path");
const { spawn } = require("child_process");

const ROOT = path.resolve(__dirname, "..");
const PORT = Number(process.env.SMOKE_PORT || 4173);
const BASE_URL = `http://127.0.0.1:${PORT}`;
const STARTUP_TIMEOUT_MS = 20000;
const REQUEST_TIMEOUT_MS = 10000;

const ROUTES = [
  "/",
  "/index.html",
  "/world.html",
  "/letters.html",
  "/words.html",
  "/phrases.html",
  "/grammar.html",
  "/privacy.html",
  "/terms.html",
  "/license.html",
  "/style.css",
  "/style-maps.css",
  "/app.js",
  "/app-maps.js",
  "/translations.json",
  "/.well-known/security.txt",
  "/api/health",
];

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

const getHtmlFiles = () =>
  fs
    .readdirSync(ROOT)
    .filter((file) => file.endsWith(".html"))
    .sort();

const normalizeLocalRef = (ref, htmlFile) => {
  if (!ref) {
    return null;
  }
  const clean = ref.split("#")[0].split("?")[0].trim();
  if (!clean) {
    return null;
  }
  if (clean.startsWith("//")) {
    return null;
  }
  if (/^[a-zA-Z][a-zA-Z\d+\-.]*:/.test(clean)) {
    return null;
  }
  if (clean.startsWith("#")) {
    return null;
  }

  if (clean.startsWith("/")) {
    const rel = clean === "/" ? "index.html" : clean.slice(1);
    return path.resolve(ROOT, rel);
  }

  return path.resolve(ROOT, path.dirname(htmlFile), clean);
};

const checkHtmlLocalReferences = () => {
  const failures = [];
  const htmlFiles = getHtmlFiles();

  for (const htmlFile of htmlFiles) {
    const absolute = path.join(ROOT, htmlFile);
    const content = fs.readFileSync(absolute, "utf8");
    const regex = /\b(?:href|src)\s*=\s*["']([^"']+)["']/gi;
    let match;

    while ((match = regex.exec(content)) !== null) {
      const ref = match[1];
      const target = normalizeLocalRef(ref, htmlFile);
      if (!target) {
        continue;
      }

      if (!target.startsWith(ROOT)) {
        failures.push(
          `${htmlFile}: reference "${ref}" resolves outside project root (${target})`
        );
        continue;
      }

      if (!fs.existsSync(target)) {
        failures.push(
          `${htmlFile}: missing local target for "${ref}" -> ${path.relative(ROOT, target)}`
        );
      }
    }
  }

  return failures;
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
    await sleep(500);
  }

  throw new Error(`Server did not become healthy in time (${lastError})`);
};

const checkRoutes = async () => {
  const failures = [];
  for (const route of ROUTES) {
    const url = `${BASE_URL}${route}`;
    try {
      const response = await fetchWithTimeout(url);
      if (!response.ok) {
        failures.push(`${route}: expected 200, received ${response.status}`);
      }
    } catch (error) {
      failures.push(`${route}: request failed (${error.message || error})`);
    }
  }
  return failures;
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

const main = async () => {
  const allFailures = [];

  const linkFailures = checkHtmlLocalReferences();
  if (linkFailures.length) {
    allFailures.push(...linkFailures.map((line) => `[links] ${line}`));
  } else {
    console.log("PASS [links] local HTML references");
  }

  const { child, getStderr } = startServer();
  try {
    await waitForServerHealth();
    console.log(`PASS [server] started on ${BASE_URL}`);

    const routeFailures = await checkRoutes();
    if (routeFailures.length) {
      allFailures.push(...routeFailures.map((line) => `[routes] ${line}`));
    } else {
      console.log("PASS [routes] core routes responded 200");
    }
  } catch (error) {
    allFailures.push(`[server] ${error.message || error}`);
    const stderr = getStderr();
    if (stderr) {
      allFailures.push(`[server] stderr: ${stderr}`);
    }
  } finally {
    await stopServer(child);
  }

  if (allFailures.length) {
    console.error("SMOKE CHECK FAILED");
    allFailures.forEach((failure) => console.error(`- ${failure}`));
    process.exit(1);
  }

  console.log("SMOKE CHECK PASSED");
};

main().catch((error) => {
  console.error("SMOKE CHECK FAILED");
  console.error(`- ${error.message || error}`);
  process.exit(1);
});
