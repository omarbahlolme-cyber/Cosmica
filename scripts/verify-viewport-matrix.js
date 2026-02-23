/* ==========================================================================
   VIEWPORT / BROWSER COMPATIBILITY MATRIX
   - Runs core pages across key viewport sizes and browser engines.
   - Fails on horizontal overflow or clipped-content risk in critical containers.
   - Captures failure screenshots and a JSON report in perf/.
   ========================================================================== */
const fs = require("fs");
const path = require("path");
const { spawn } = require("child_process");

const ROOT = path.resolve(__dirname, "..");
const PORT = Number(process.env.VIEWPORT_PORT || 4175);
const STARTUP_TIMEOUT_MS = Number(process.env.VIEWPORT_STARTUP_TIMEOUT_MS || 25000);
const NAVIGATION_TIMEOUT_MS = Number(process.env.VIEWPORT_NAVIGATION_TIMEOUT_MS || 60000);
const BASE_URL = String(process.env.VIEWPORT_BASE_URL || `http://127.0.0.1:${PORT}`)
  .trim()
  .replace(/\/$/, "");
const OUTPUT_DIR = path.join(ROOT, "perf");
const REPORT_PATH = path.join(OUTPUT_DIR, "viewport-matrix-report.json");
const FAIL_SCREENSHOT_DIR = path.join(OUTPUT_DIR, "viewport-failures");

const ROUTES = [
  "/",
  "/english-world.html",
  "/world-french.html",
  "/english-letters.html",
  "/english-words.html",
  "/english-phrases.html",
  "/english-grammar.html",
  "/privacy.html",
  "/terms.html",
];

const VIEWPORTS = [
  { id: "280x653", width: 280, height: 653 },
  { id: "320x568", width: 320, height: 568 },
  { id: "344x882", width: 344, height: 882 },
  { id: "360x640", width: 360, height: 640 },
  { id: "360x800", width: 360, height: 800 },
  { id: "375x667", width: 375, height: 667 },
  { id: "375x812", width: 375, height: 812 },
  { id: "390x844", width: 390, height: 844 },
  { id: "412x915", width: 412, height: 915 },
  { id: "430x932", width: 430, height: 932 },
  { id: "540x720", width: 540, height: 720 },
  { id: "600x960", width: 600, height: 960 },
  { id: "768x1024", width: 768, height: 1024 },
  { id: "810x1080", width: 810, height: 1080 },
  { id: "820x1180", width: 820, height: 1180 },
  { id: "912x1368", width: 912, height: 1368 },
  { id: "1024x768", width: 1024, height: 768 },
  { id: "1024x1366", width: 1024, height: 1366 },
  { id: "1280x720", width: 1280, height: 720 },
  { id: "1366x768", width: 1366, height: 768 },
  { id: "1440x900", width: 1440, height: 900 },
  { id: "1536x864", width: 1536, height: 864 },
  { id: "1600x900", width: 1600, height: 900 },
  { id: "1920x1080", width: 1920, height: 1080 },
  { id: "2560x1440", width: 2560, height: 1440 },
];

const DEFAULT_BROWSERS = ["chromium", "firefox", "webkit"];
const REQUEST_SELECTORS = [
  "main",
  ".nav",
  ".hero",
  ".world-hero",
  ".section",
  ".section-title",
  ".steps",
  ".world-grid",
  ".world-maps .steps",
  ".letters-grid",
  ".words-grid",
  ".letter-card",
  ".word-card",
  ".phrase-card",
  ".grammar-card",
  "footer",
  ".account-dropdown:not([hidden])",
  ".premium-setup-card",
  ".premium-checkout-card",
  ".premium-success-card",
  ".grammar-modal",
];

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const fetchWithTimeout = async (url, timeoutMs = 3000) => {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, { signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
};

const isSpawnRestriction = (value) =>
  /eperm|eacces|operation not permitted/i.test(String(value || ""));

const sanitizeForFile = (value) =>
  String(value || "")
    .replace(/^\/+/, "")
    .replace(/[^a-z0-9._-]+/gi, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "") || "root";

const ensureDir = (dirPath) => {
  fs.mkdirSync(dirPath, { recursive: true });
};

const loadPlaywright = () => {
  try {
    return require("playwright");
  } catch {
    return null;
  }
};

const startServer = () => {
  try {
    const child = spawn(process.execPath, ["server.js"], {
      cwd: ROOT,
      env: {
        ...process.env,
        PORT: String(PORT),
      },
      stdio: ["ignore", "pipe", "pipe"],
    });

    let stderr = "";
    child.stderr.on("data", (chunk) => {
      stderr += chunk.toString();
    });

    child.on("error", (error) => {
      stderr += String(error?.message || error || "");
    });

    return { child, getStderr: () => stderr.trim() };
  } catch (error) {
    return { child: null, getStderr: () => String(error?.message || error || "").trim() };
  }
};

const stopServer = async (child) => {
  if (!child || child.killed) {
    return;
  }
  child.kill("SIGTERM");
  await sleep(350);
  if (!child.killed) {
    child.kill("SIGKILL");
  }
};

const waitForServerHealth = async (baseUrl) => {
  const startedAt = Date.now();
  let lastError = "";

  while (Date.now() - startedAt < STARTUP_TIMEOUT_MS) {
    try {
      const response = await fetchWithTimeout(`${baseUrl}/api/health`);
      if (response.ok) {
        return;
      }
      lastError = `health returned ${response.status}`;
    } catch (error) {
      lastError = String(error?.message || error || "");
    }
    await sleep(500);
  }

  throw new Error(`Server did not become healthy in time (${lastError || "unknown error"})`);
};

const gotoWithRetry = async (page, url) => {
  const attempts = [
    { waitUntil: "domcontentloaded", timeout: NAVIGATION_TIMEOUT_MS },
    { waitUntil: "load", timeout: NAVIGATION_TIMEOUT_MS },
  ];
  let lastError = null;

  for (let i = 0; i < attempts.length; i += 1) {
    const attempt = attempts[i];
    try {
      await page.goto(url, attempt);
      return;
    } catch (error) {
      lastError = error;
      if (i < attempts.length - 1) {
        try {
          await page.goto("about:blank", { waitUntil: "load", timeout: 10000 });
        } catch {}
      }
    }
  }

  throw lastError;
};

const checkRouteInViewport = async ({ page, route, selectors }) => {
  const url = `${BASE_URL}${route}`;
  await gotoWithRetry(page, url);
  await page.waitForTimeout(220);

  return page.evaluate(({ targetSelectors }) => {
    const html = document.documentElement;
    const body = document.body;
    const viewportWidth = window.innerWidth || html.clientWidth || 0;

    const htmlOverflow = Math.max(0, Math.round((html.scrollWidth || 0) - viewportWidth));
    const bodyOverflow = Math.max(0, Math.round(((body && body.scrollWidth) || 0) - viewportWidth));

    const clippedRisk = [];
    targetSelectors.forEach((selector) => {
      const nodeList = Array.from(document.querySelectorAll(selector));
      nodeList.forEach((node, index) => {
        const element = node;
        const style = window.getComputedStyle(element);
        if (style.display === "none" || style.visibility === "hidden") {
          return;
        }
        const rect = element.getBoundingClientRect();
        if (rect.width <= 0 || rect.height <= 0) {
          return;
        }
        const overflowX = String(style.overflowX || "").toLowerCase();
        const hasLocalClip = (overflowX === "hidden" || overflowX === "clip") && element.scrollWidth - element.clientWidth > 8;
        const exceedsViewport = rect.left < -3 || rect.right > viewportWidth + 3;
        if (hasLocalClip || exceedsViewport) {
          clippedRisk.push({
            selector,
            index,
            overflowX,
            localOverflowPx: Math.max(0, Math.round(element.scrollWidth - element.clientWidth)),
            rectLeft: Math.round(rect.left),
            rectRight: Math.round(rect.right),
            viewportWidth,
          });
        }
      });
    });

    return {
      title: document.title || "",
      htmlOverflow,
      bodyOverflow,
      clippedRisk,
    };
  }, { targetSelectors: selectors });
};

const main = async () => {
  ensureDir(OUTPUT_DIR);
  ensureDir(FAIL_SCREENSHOT_DIR);

  const playwright = loadPlaywright();
  if (!playwright) {
    console.error("VIEWPORT MATRIX FAILED");
    console.error("- Missing dev dependency: playwright");
    console.error("- Run: npm install");
    console.error("- Then install browsers: npm run verify:viewport:browsers");
    process.exit(1);
  }

  const browserNames = String(process.env.VIEWPORT_BROWSERS || DEFAULT_BROWSERS.join(","))
    .split(",")
    .map((value) => value.trim().toLowerCase())
    .filter(Boolean);

  const report = {
    generatedAt: new Date().toISOString(),
    baseUrl: BASE_URL,
    routes: ROUTES,
    browsers: browserNames,
    viewports: VIEWPORTS,
    failures: [],
    checks: 0,
    passed: 0,
  };

  const useExternalBase = Boolean(process.env.VIEWPORT_BASE_URL);
  let serverChild = null;
  let serverStderr = () => "";

  try {
    if (!useExternalBase) {
      const server = startServer();
      if (!server.child) {
        const stderr = server.getStderr();
        if (isSpawnRestriction(stderr)) {
          throw new Error(`Local server start blocked by environment restrictions (${stderr})`);
        }
        throw new Error(stderr || "Failed to spawn local server for viewport verification");
      }
      serverChild = server.child;
      serverStderr = server.getStderr;
      await waitForServerHealth(BASE_URL);
    }

    for (const browserName of browserNames) {
      const browserType = playwright[browserName];
      if (!browserType) {
        report.failures.push({
          browser: browserName,
          route: "*",
          viewport: "*",
          reason: "unsupported_browser_name",
          message: `Unsupported browser engine: ${browserName}`,
        });
        continue;
      }

      const browser = await browserType.launch({ headless: true });
      try {
        for (const viewport of VIEWPORTS) {
          const context = await browser.newContext({
            viewport: { width: viewport.width, height: viewport.height },
          });
          try {
            for (const route of ROUTES) {
              report.checks += 1;
              const page = await context.newPage();
              try {
                const result = await checkRouteInViewport({
                  page,
                  route,
                  selectors: REQUEST_SELECTORS,
                });

                const hasOverflow = result.htmlOverflow > 2 || result.bodyOverflow > 2;
                const hasClipRisk = result.clippedRisk.length > 0;

                if (!hasOverflow && !hasClipRisk) {
                  report.passed += 1;
                  continue;
                }

                const screenshotName = `${browserName}-${viewport.id}-${sanitizeForFile(route)}.png`;
                const screenshotPath = path.join(FAIL_SCREENSHOT_DIR, screenshotName);
                await page.screenshot({ path: screenshotPath, fullPage: true });

                report.failures.push({
                  browser: browserName,
                  viewport: viewport.id,
                  route,
                  title: result.title,
                  htmlOverflow: result.htmlOverflow,
                  bodyOverflow: result.bodyOverflow,
                  clippedRisk: result.clippedRisk.slice(0, 12),
                  screenshot: path.relative(ROOT, screenshotPath).replace(/\\/g, "/"),
                });
              } catch (error) {
                report.failures.push({
                  browser: browserName,
                  viewport: viewport.id,
                  route,
                  reason: "navigation_or_eval_error",
                  message: String(error?.message || error || "unknown error"),
                });
              } finally {
                await page.close().catch(() => {});
              }
            }
          } finally {
            await context.close().catch(() => {});
          }
        }
      } finally {
        await browser.close().catch(() => {});
      }
    }
  } catch (error) {
    report.failures.push({
      browser: "*",
      viewport: "*",
      route: "*",
      reason: "matrix_runtime_error",
      message: String(error?.message || error || "unknown error"),
      serverStderr: serverStderr(),
    });
  } finally {
    if (serverChild) {
      await stopServer(serverChild);
    }
  }

  fs.writeFileSync(REPORT_PATH, JSON.stringify(report, null, 2));

  if (report.failures.length) {
    console.error("VIEWPORT MATRIX FAILED");
    console.error(`- Checks run: ${report.checks}`);
    console.error(`- Passed: ${report.passed}`);
    console.error(`- Failures: ${report.failures.length}`);
    console.error(`- Report: ${path.relative(ROOT, REPORT_PATH)}`);
    process.exit(1);
  }

  console.log("PASS [viewport] matrix compatibility checks");
  console.log(`- Checks run: ${report.checks}`);
  console.log(`- Report: ${path.relative(ROOT, REPORT_PATH)}`);
};

main().catch((error) => {
  console.error("VIEWPORT MATRIX FAILED");
  console.error(`- ${error?.message || error}`);
  process.exit(1);
});
