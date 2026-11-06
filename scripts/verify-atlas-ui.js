/* UI-only Chromium atlas/voyage probe. Paused runtime validation stays separate. */
const assert = require("node:assert/strict");
const fs = require("node:fs/promises");
const path = require("node:path");
const { chromium } = require("playwright");
const { startIsolatedPreview } = require("./lib/isolated-preview");

const VIEWPORTS = [
  { width: 1440, height: 1000 },
  { width: 768, height: 1024 },
  { width: 390, height: 844 },
  { width: 360, height: 800 },
  { width: 320, height: 800 },
];
const GALAXIES = ["languages", "science", "computing", "engineering", "humanities", "health", "earth", "business", "arts"];
const LANGUAGE_ROUTES = [
  "english-world.html",
  ...["french", "german", "spanish", "portuguese", "dutch", "swedish", "arabic", "chinese", "japanese", "korean", "hindi"].map((name) => `world-${name}.html`),
];
const report = {
  scope: "Chromium UI-only atlas and voyage inspection; no paused runtime or cross-browser triage",
  startedAt: new Date().toISOString(),
  viewports: VIEWPORTS,
  results: [],
  screenshots: [],
  blockedRemoteRequests: [],
};
let preview;
let browser;

const state = (page) => page.evaluate(() => window.cosmicaUniverse?.getState());
const waitState = (page, expected, timeout = 15000) => page.waitForFunction((wanted) => {
  const current = window.cosmicaUniverse?.getState();
  return current && Object.entries(wanted).every(([key, value]) => current[key] === value);
}, expected, { timeout });
const distance = (left, right) => Math.hypot(...left.map((value, index) => value - right[index]));

async function freshPage(viewport, reducedMotion = "reduce") {
  const context = await browser.newContext({ viewport, reducedMotion, serviceWorkers: "block" });
  await context.route("**/*", (route) => {
    const url = new URL(route.request().url());
    if (url.origin === preview.origin || ["data:", "blob:"].includes(url.protocol)) return route.continue();
    report.blockedRemoteRequests.push({ url: url.origin + url.pathname, resource: route.request().resourceType() });
    if (route.request().resourceType() === "stylesheet") {
      return route.fulfill({ status: 200, contentType: "text/css", body: "" });
    }
    return route.abort();
  });
  const page = await context.newPage();
  page.setDefaultTimeout(20000);
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.stack || error.message));
  page.on("console", (message) => {
    if (message.type() === "error" && /THREE\.|Shader Error|VALIDATE_STATUS|WebGL.*INVALID/i.test(message.text())) errors.push(message.text());
  });
  return { page, context, errors };
}

async function openAtlas(page) {
  await page.goto(preview.origin, { waitUntil: "domcontentloaded" });
  await waitState(page, { renderer: "three", transitioning: false });
  await page.waitForFunction(() => window.cosmicaUniverse.getState().renderedFrames > 0);
  await page.waitForFunction(() => window.cosmicaUniverse.getState().texturesReady);
  const consent = page.locator(".cookie-notice button").first();
  if (await consent.isVisible()) {
    await consent.click();
    await page.locator(".cookie-notice").waitFor({ state: "detached" });
  }
}

async function capture(page, name) {
  const filename = `atlas-${name}.png`;
  await page.screenshot({ path: path.join(preview.outputPath, filename), fullPage: true });
  report.screenshots.push(filename);
}

async function layoutMeasurements(page) {
  const measurement = await page.evaluate(() => {
    const visible = (element) => {
      const rect = element.getBoundingClientRect();
      const style = getComputedStyle(element);
      return rect.width > 0 && rect.height > 0 && style.visibility !== "hidden" && style.display !== "none";
    };
    const box = (element) => {
      const { x, y, width, height } = element.getBoundingClientRect();
      return { x, y, width, height };
    };
    const header = document.querySelector("header");
    const heading = document.querySelector("h1");
    const headingBox = heading ? box(heading) : null;
    const headerBox = header ? box(header) : null;
    const overlaps = (left, right) => left && right &&
      left.x < right.x + right.width && left.x + left.width > right.x &&
      left.y < right.y + right.height && left.y + left.height > right.y;
    return {
      viewport: { width: innerWidth, height: innerHeight },
      documentWidth: document.documentElement.scrollWidth,
      heading: headingBox,
      header: headerBox,
      targets: [...document.querySelectorAll("header a, header button")]
        .filter((element) => visible(element) && !element.closest('[hidden], [aria-hidden="true"]'))
        .map((element) => ({ label: element.getAttribute("aria-label") || element.textContent.trim(), ...box(element) })),
      headerOverlapsHero: Boolean(overlaps(headingBox, headerBox)),
      heroObstructions: [...document.querySelectorAll("button, a, dialog[open]")]
        .filter((element) => visible(element) && Number(getComputedStyle(element).opacity) > 0 && overlaps(headingBox, box(element)))
        .map((element) => element.getAttribute("aria-label") || element.textContent.trim()),
    };
  });
  assert.ok(measurement.documentWidth <= measurement.viewport.width + 1, "Page overflows horizontally");
  assert.ok(measurement.heading?.width > 0 && measurement.heading.height > 0, "Main hero heading is visible");
  assert.ok(measurement.heading.y >= 0 && measurement.heading.y + measurement.heading.height <= measurement.viewport.height, "Hero heading fits the initial viewport");
  assert.ok(measurement.heading.x >= 0 && measurement.heading.x + measurement.heading.width <= measurement.viewport.width, "Hero heading is not clipped horizontally");
  assert.equal(measurement.headerOverlapsHero, false, "Header must not obscure the main hero");
  assert.deepEqual(measurement.heroObstructions, [], "Navigation targets must not obscure the main hero");
  for (const target of measurement.targets) {
    assert.ok(target.width >= 43.5 && target.height >= 43.5, `Header target is smaller than 44px: ${target.label} (${target.width} x ${target.height})`);
    assert.ok(target.x >= -1 && target.x + target.width <= measurement.viewport.width + 1, `Header target is clipped: ${target.label}`);
  }
  return measurement;
}

async function verifyOrdinaryLanguageLinks(page) {
  await page.locator("#uxListButton").click();
  await waitState(page, { galaxyId: "languages", view: "list" });
  for (const route of LANGUAGE_ROUTES) {
    const link = page.locator(`#uxWorldGrid a[href="${route}"]`);
    assert.equal(await link.count(), 1, `Ordinary course link exists: ${route}`);
    assert.ok(await link.isVisible(), `Course link is visible: ${route}`);
  }
  assert.equal(await page.locator("#uxWorldGrid a[href$='.html']").count(), 12);
}

async function verifyViewport(viewport) {
  const { page, context, errors } = await freshPage(viewport);
  try {
    await openAtlas(page);
    const measurements = await layoutMeasurements(page);
    assert.equal(await page.locator(".cs-galaxy-label[data-galaxy-id]").count(), 9);
    for (const galaxy of GALAXIES) {
      assert.ok(await page.locator(`.cs-galaxy-label[data-galaxy-id="${galaxy}"]`).isVisible(), `Galaxy is discoverable: ${galaxy}`);
    }
    await capture(page, `${viewport.width}-home`);
    await page.locator('.cs-galaxy-label[data-galaxy-id="languages"]').click();
    await waitState(page, { galaxyId: "languages", transitioning: false, motionEnabled: false });
    await verifyOrdinaryLanguageLinks(page);
    await capture(page, `${viewport.width}-languages`);
    await page.locator('#uxWorldGrid a[href="english-world.html"]').click();
    await page.waitForURL("**/english-world.html");
    assert.ok(await page.locator("main").isVisible(), "English course opens from the ordinary link");

    await openAtlas(page);
    await page.locator('[data-open-dialog="uxSearchDialog"]').click();
    await page.locator("#uxSearchInput").fill("French");
    const french = page.locator('#uxSearchResults a[href="world-french.html"]');
    assert.equal(await french.count(), 1);
    await french.click();
    await page.waitForURL("**/world-french.html");
    assert.ok(await page.locator("main").isVisible(), "Search opens the real French course");
    assert.deepEqual(errors, [], "UI navigation has no uncaught browser errors");
    return { measurements, reducedMotionState: "Languages reached with motion disabled", frenchRoute: new URL(page.url()).pathname };
  } catch (error) {
    await capture(page, `${viewport.width}-failure`).catch(() => {});
    throw error;
  } finally {
    await context.close();
  }
}

async function verifyVoyage() {
  const { page, context, errors } = await freshPage(VIEWPORTS[0], "no-preference");
  try {
    await openAtlas(page);
    const before = await state(page);
    assert.equal(before.motionEnabled, true);
    await page.locator('.cs-galaxy-label[data-galaxy-id="languages"]').click();
    await waitState(page, { galaxyId: "languages", transitioning: true });
    await page.waitForFunction(() => {
      const current = window.cosmicaUniverse.getState();
      return current.transitioning && current.travelProgress > 0 && current.travelProgress < 1;
    });
    const during = await state(page);
    await waitState(page, { mode: "galaxy", galaxyId: "languages", transitioning: false });
    const arrived = await state(page);
    assert.ok(distance(before.camera, arrived.camera) > 1, "Voyage actually moves the camera");
    await page.getByRole("button", { name: "Explore English", exact: true }).focus();
    await page.keyboard.press("Enter");
    await waitState(page, { selectedWorld: 0, transitioning: false });
    assert.equal(await page.locator("#uxWorldSelectionName").innerText(), "English");
    await capture(page, "english-arrival");
    const entry = page.locator("#uxWorldEnter");
    assert.equal(await entry.getAttribute("href"), "english-world.html");
    await entry.click();
    await page.waitForURL("**/english-world.html");
    assert.ok(await page.locator("main").isVisible());
    assert.deepEqual(errors, []);
    return { cameraBefore: before.camera, cameraDuring: during.camera, cameraAfter: arrived.camera };
  } catch (error) {
    await capture(page, "voyage-failure").catch(() => {});
    throw error;
  } finally {
    await context.close();
  }
}

async function clearCanvasPoint(page) {
  return page.locator(".cs-webgl-canvas").evaluate((canvas) => {
    const rect = canvas.getBoundingClientRect();
    for (const yFraction of [0.6, 0.72, 0.48]) {
      for (const xFraction of [0.76, 0.62, 0.85, 0.4]) {
        const x = rect.x + rect.width * xFraction;
        const y = rect.y + rect.height * yFraction;
        if (document.elementFromPoint(x, y) === canvas) return { x, y };
      }
    }
    return null;
  });
}

async function verifyInterruption(gesture) {
  const { page, context, errors } = await freshPage(VIEWPORTS[0], "no-preference");
  try {
    await openAtlas(page);
    await page.locator('.cs-galaxy-label[data-galaxy-id="languages"]').click();
    await waitState(page, { galaxyId: "languages", transitioning: true });
    const before = await state(page);
    const point = await clearCanvasPoint(page);
    assert.ok(point, "There is usable unobstructed space to manipulate the camera");
    await page.mouse.move(point.x, point.y);
    if (gesture === "drag") {
      await page.mouse.down();
      await page.mouse.move(point.x - 90, point.y + 25, { steps: 5 });
      await page.mouse.up();
    } else {
      await page.mouse.wheel(0, 180);
    }
    await waitState(page, { transitioning: false }, 1500);
    const interrupted = await state(page);
    // The scene exposes an interruption counter; this distinguishes cancellation
    // from a journey that merely completed while automation was delivering input.
    assert.ok(interrupted.interruptedFlights > (before.interruptedFlights || 0), `${gesture} cancels the active flight`);
    await page.keyboard.press("/");
    await page.locator("#uxSearchInput").fill("French");
    assert.equal(await page.locator('#uxSearchResults a[href="world-french.html"]').count(), 1, "Input remains responsive after cancellation");
    await page.keyboard.press("Escape");
    await capture(page, `interrupted-${gesture}`);
    assert.deepEqual(errors, []);
    return { before, interrupted };
  } catch (error) {
    await capture(page, `interrupted-${gesture}-failure`).catch(() => {});
    throw error;
  } finally {
    await context.close();
  }
}

async function runCase(name, operation) {
  const started = Date.now();
  try {
    const details = await operation();
    report.results.push({ name, status: "passed", durationMs: Date.now() - started, details });
    console.log(`PASS [atlas-ui] ${name}`);
  } catch (error) {
    report.results.push({ name, status: "failed", durationMs: Date.now() - started, error: error.stack || error.message });
    process.exitCode = 1;
    console.error(`FAIL [atlas-ui] ${name}: ${error.message}`);
  }
}

async function main() {
  assert.equal(process.argv.length, 2, "Usage: node scripts/verify-atlas-ui.js");
  preview = await startIsolatedPreview({ root: path.resolve(__dirname, ".."), keepArtifacts: true });
  try {
    browser = await chromium.launch({
      headless: true,
      args: ["--use-gl=angle", "--use-angle=swiftshader", "--enable-unsafe-swiftshader"],
    });
    report.browserVersion = browser.version();
    for (const viewport of VIEWPORTS) {
      await runCase(`${viewport.width}x${viewport.height}: layout, Languages, search and reduced motion`, () => verifyViewport(viewport));
    }
    await runCase("animated galaxy and English arrival", verifyVoyage);
    for (const gesture of ["drag", "wheel"]) await runCase(`${gesture} interrupts an active camera flight`, () => verifyInterruption(gesture));
  } finally {
    try {
      if (browser) await browser.close();
    } finally {
      report.finishedAt = new Date().toISOString();
      try {
        await fs.writeFile(path.join(preview.outputPath, "atlas-ui-report.json"), JSON.stringify(report, null, 2) + "\n");
        console.log(`UI screenshots and report: ${preview.outputPath}`);
      } finally {
        await preview.stop();
      }
    }
  }
}

main().catch((error) => {
  console.error(error.stack || error);
  process.exitCode = 1;
});
