/*
 * Real Express + browser checks with synthetic, isolated guest state.
 * The homepage starts with nine explorable galaxies. Subject catalogs open
 * after selection; routes, search, history, storage and motion remain tested.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const { chromium, firefox, webkit } = require("playwright");
const { startIsolatedPreview } = require("./lib/isolated-preview");

const browserName = process.argv.find((arg) => arg.startsWith("--browser="))?.split("=")[1] || "chromium";
const browserType = { chromium, firefox, webkit }[browserName];
assert.ok(browserType, "Use --browser=chromium, firefox, or webkit");
const fallbackOnly = process.argv.includes("--fallback-only");
const motionOnly = process.argv.includes("--motion-only");
// Scope only: the default suite still runs the unchanged mathematics and
// restricted legacy-course journeys. Their failures must be reported separately.
const homepageOnly = process.argv.includes("--homepage-only");
const root = path.resolve(__dirname, "..");
const languageRoutes = [
  "english-world.html",
  ...["french", "german", "spanish", "portuguese", "dutch", "swedish", "arabic", "chinese", "japanese", "korean", "hindi"].map((language) => "world-" + language + ".html"),
];
const galaxyIds = ["languages", "science", "computing", "engineering", "humanities", "health", "earth", "business", "arts"];
const results = [];
let preview;
let browser;
let browserServer;

const readState = (page) => page.evaluate(() => window.cosmicaUniverse?.getState());
async function waitState(page, expected) {
  try {
    await page.waitForFunction((wanted) => {
      const state = window.cosmicaUniverse?.getState();
      return state && Object.entries(wanted).every(([key, value]) => state[key] === value);
    }, expected);
  } catch (cause) {
    const actual = await readState(page).catch(() => null);
    throw new Error("Expected homepage state " + JSON.stringify(expected) + "; actual " + JSON.stringify(actual) + "; URL " + page.url(), { cause });
  }
}

async function newPage({ width = 390, height = 844, noWebGL = false, noCanvas = false, noStorage = false, noBundle = false, noJavaScript = false, noAudio = false, reducedMotion = "reduce" } = {}) {
  const context = await browser.newContext({
    viewport: { width, height }, reducedMotion, serviceWorkers: "block", javaScriptEnabled: !noJavaScript,
  });
  await context.route("**/*", (route) => {
    const url = new URL(route.request().url());
    if (url.origin !== preview.origin && !["data:", "blob:"].includes(url.protocol)) {
      // Never send preview traffic to an external service. Satisfy optional
      // remote styles locally, avoiding browser-specific aborted-load stalls.
      if (route.request().resourceType() === "stylesheet") return route.fulfill({ status: 200, contentType: "text/css", body: "" });
      return route.abort();
    }
    if (noBundle && url.pathname.endsWith("/cosmic-scene.bundle.js")) return route.abort();
    return route.continue();
  });
  await context.addInitScript(({ noWebGL, noCanvas, noStorage, noAudio }) => {
    if (noAudio) {
      Object.defineProperty(window, "AudioContext", { value: undefined, configurable: true });
      Object.defineProperty(window, "webkitAudioContext", { value: undefined, configurable: true });
    }
    if (noStorage) Object.defineProperty(window, "localStorage", {
      get() { throw new DOMException("Storage disabled", "SecurityError"); },
    });
    if (noWebGL || noCanvas) {
      const getContext = HTMLCanvasElement.prototype.getContext;
      HTMLCanvasElement.prototype.getContext = function (type, ...args) {
        return noCanvas || String(type).startsWith("webgl") ? null : getContext.call(this, type, ...args);
      };
    }
  }, { noWebGL, noCanvas, noStorage, noAudio });
  const page = await context.newPage();
  page.setDefaultTimeout(20000);
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.stack || error.message));
  page.on("console", (message) => {
    if (message.type() === "error" && /Shader Error|VALIDATE_STATUS|WebGL.*INVALID/i.test(message.text())) errors.push(message.text());
  });
  if (process.argv.includes("--diagnostics")) {
    page.on("requestfailed", (request) => console.log("TRACE " + JSON.stringify({ event: "requestfailed", resource: request.resourceType(), url: request.url(), error: request.failure()?.errorText })));
    page.on("framenavigated", (frame) => { if (frame === page.mainFrame()) console.log("TRACE navigated " + page.url()); });
  }
  return { page, context, errors };
}

async function open(page, route = "/") {
  await page.goto(preview.origin + route, { waitUntil: "domcontentloaded" });
  await page.waitForFunction(() => ["svg", "fallback"].includes(window.cosmicaUniverse?.getState().renderer));
  const consent = page.locator(".cookie-notice button").first();
  if (await consent.isVisible()) {
    const menuWasOpen = (await readState(page)).menuOpen;
    await consent.click();
    if (menuWasOpen) assert.equal((await readState(page)).menuOpen, true, "Dismissing cookies keeps the fallback galaxy index open");
  }
}

async function assertFits(page, label) {
  const dimensions = await page.evaluate(() => ({ width: innerWidth, documentWidth: document.documentElement.scrollWidth }));
  assert.ok(dimensions.documentWidth <= dimensions.width + 1, label + ": horizontal overflow " + JSON.stringify(dimensions));
}

async function assertHeaderLayout(page) {
  const layout = await page.evaluate(() => {
    const box = (element) => {
      const { x, y, width, height } = element.getBoundingClientRect();
      return { x, y, width, height };
    };
    const visible = (element) => {
      const bounds = element.getBoundingClientRect();
      const style = getComputedStyle(element);
      return bounds.width > 0 && bounds.height > 0 && style.display !== "none" && style.visibility !== "hidden" && !element.closest('[hidden], [aria-hidden="true"]');
    };
    return {
      viewportWidth: innerWidth,
      header: box(document.querySelector("header.nav")),
      heading: box(document.querySelector("h1")),
      targets: [...document.querySelectorAll("header.nav a, header.nav button")].filter(visible).map((element) => ({
        label: element.getAttribute("aria-label") || element.textContent.trim(), ...box(element),
      })),
    };
  });
  assert.ok(layout.heading.y >= layout.header.y + layout.header.height - 1, "Header must not obscure the main heading");
  for (const target of layout.targets) {
    assert.ok(target.width >= 43.5 && target.height >= 43.5, "Header target below 44px: " + target.label + " " + JSON.stringify(target));
    assert.ok(target.x >= -1 && target.x + target.width <= layout.viewportWidth + 1, "Header target is clipped: " + target.label);
  }
}

async function screenshot(page, name) {
  await page.screenshot({ path: path.join(preview.outputPath, browserName + "-" + name + ".png"), fullPage: true });
}

async function runCase(name, fn) {
  const started = Date.now();
  try {
    await fn();
    results.push({ name, status: "passed", durationMs: Date.now() - started });
    console.log("PASS [universe] " + name);
  } catch (error) {
    results.push({ name, status: "failed", durationMs: Date.now() - started, error: error.message });
    throw error;
  }
}

async function visibleControl(page, selector) {
  const controls = page.locator(selector);
  let displayed;
  for (let index = 0; index < await controls.count(); index++) {
    const control = controls.nth(index);
    if (!(await control.isVisible())) continue;
    displayed ||= control;
    const bounds = await control.boundingBox();
    const viewport = page.viewportSize();
    if (bounds && bounds.x >= 0 && bounds.y >= 0 && bounds.x + bounds.width <= viewport.width + 1 && bounds.y + bounds.height <= viewport.height + 1) return control;
  }
  if (displayed) return displayed;
  throw new Error("No visible navigation control matches " + selector);
}

async function verifyMobileNavigation(page) {
  const mobile = page.viewportSize().width <= 640;
  const navigation = page.locator("#homeMobileNav");
  assert.equal(await navigation.isVisible(), mobile, "The compact navigation follows the phone breakpoint");
  if (!mobile) return;
  assert.equal(await navigation.locator("button").count(), 2, "Phone navigation keeps only Galaxies and Search");
  for (const label of ["Galaxies", "Search"]) {
    assert.equal(await navigation.getByRole("button", { name: new RegExp(label) }).count(), 1, "Mobile navigation has a named " + label + " action");
  }
  const targets = await navigation.locator("button").evaluateAll((buttons) => buttons.map((button) => {
    const { x, y, width, height } = button.getBoundingClientRect();
    return { label: button.textContent.trim(), x, y, width, height, viewportWidth: innerWidth, viewportHeight: innerHeight };
  }));
  for (const target of targets) {
    assert.ok(target.width >= 43.5 && target.height >= 43.5, "Mobile action needs a 44px target: " + target.label);
    assert.ok(target.x >= -1 && target.y >= -1 && target.x + target.width <= target.viewportWidth + 1 && target.y + target.height <= target.viewportHeight + 1, "Mobile action stays on screen: " + target.label);
  }
  assert.ok(Math.abs(targets[0].width - targets[1].width) <= 1, "The two phone actions have balanced targets");
  assert.ok(targets[0].x <= targets[0].viewportWidth * 0.1 && targets[1].x + targets[1].width >= targets[1].viewportWidth * 0.9, "The phone bar uses its width after removing Saved");
}

async function verifyServing() {
  for (const route of ["/", "/index.html", "/maths-lab.html", ...languageRoutes.map((route) => "/" + route)]) {
    const response = await fetch(preview.origin + route, { signal: AbortSignal.timeout(10000) });
    assert.equal(response.status, 200, "Existing destination " + route);
    assert.match(response.headers.get("cache-control"), /max-age=0.*must-revalidate/, route);
    if (route !== "/index.html") { await response.arrayBuffer(); continue; }
    const html = await response.text();
    const assets = [...html.matchAll(/(?:href|src)="(ui\/[^"?]+\?v=[^"]+)"/g)].map((match) => match[1]);
    assert.deepEqual(assets.map((asset) => asset.split("?")[0]).sort(), [
      "ui/universe.css", "ui/observatory.css", "ui/navigation.css", "ui/flight-overlays.css", "ui/language-chrome.css", "ui/cosmic-scene.bundle.js", "ui/universe.js",
    ].sort(), "Home must serve its seven explicit versioned UI entry assets");
    for (const asset of assets) {
      const served = await fetch(preview.origin + "/" + asset);
      assert.equal(served.status, 200, asset);
      assert.match(served.headers.get("cache-control"), /max-age=31536000.*immutable/, asset);
      assert.deepEqual(Buffer.from(await served.arrayBuffer()), fs.readFileSync(path.join(root, "frontend", asset.split("?")[0])), "Actual served bytes: " + asset);
    }
  }
  for (const route of ["/api/auth/me", "/api/progress"]) {
    const response = await fetch(preview.origin + route);
    assert.equal(response.status, 401, "Guest authorization remains enforced: " + route);
    assert.match(response.headers.get("cache-control"), /no-store/);
  }
}

async function showCategories(page) {
  if (!(await page.locator("#uxListView").isVisible())) {
    const switcher = page.locator("#homeGalaxySwitch");
    const opener = await switcher.isVisible() ? switcher
      : await visibleControl(page, "#homeMobileSubjects, #homeHeroLink");
    await opener.click();
    await page.locator("#uxListView").waitFor({ state: "visible" });
    if (await opener.getAttribute("aria-expanded") !== null) assert.equal(await opener.getAttribute("aria-expanded"), "true");
  }
}

async function showCategoriesWithShortcut(page) {
  if (await page.locator("#uxListView").isVisible()) return;
  const heading = page.locator((await readState(page)).galaxyId ? "#uxGalaxyTitle" : "#homeTitle");
  await heading.focus({ preventScroll: true });
  await page.keyboard.press("g");
  await page.locator("#uxListView").waitFor({ state: "visible" });
}

async function clearCatalogFilters(page) {
  await page.locator("#uxWorldFilter").fill("");
}

async function verifyRemovedHomeFeatures(page) {
  for (const selector of ["#uxListButton", "#homeMapHome", "#homeContinue", "#homeContinueWrap", ".home-map-coordinate", ".ux-save", "#uxSavedDialog", '[data-open-dialog="uxSavedDialog"]']) {
    assert.equal(await page.locator(selector).count(), 0, "Removed homepage feature must not return: " + selector);
  }
  assert.equal((await page.locator("header .ux-search-trigger span").textContent()).trim(), "Search", "The header uses the compact Search label");
}

async function selectCategory(page, id, keyboard = false) {
  await showCategories(page);
  const button = page.locator('#flightGalaxyItems [data-galaxy="' + id + '"]');
  if (keyboard) { await button.focus(); await page.keyboard.press("Enter"); }
  else await button.click();
  await waitState(page, { galaxyId: id });
  assert.equal(await page.locator("#homeGalaxyStepper, #homeAvailableOnly, #uxGalaxyDescription").count(), 0, "Galaxy catalogs omit removed controls and instruction copy");
  assert.equal(await page.locator("#homeCategoryLabel").isVisible(), false, "Selected galaxies omit numbered headings");
  assert.doesNotMatch(await page.locator("#uxWorldGrid").innerText(), /Unavailable|Available now|SYSTEM\s*\//i);
  assert.equal(await page.locator("#uxWorldGrid .ux-world-card").evaluateAll((cards) => cards.every((card) => ["none", "normal", '""'].includes(getComputedStyle(card, "::before").content))), true, "Cards have no generated system numbers");
  assert.equal(await page.locator("#uxGalaxyView").isVisible(), true, "Catalog stays available when a category is selected");
  if (page.viewportSize().width <= 640) {
    assert.equal(await page.locator("#homeMobileCategory").innerText(), await button.locator("strong").innerText(), "Phone navigation names the selected category");
  }
}

async function verifySharedDialogUsability() {
  for (const width of [320, 1440]) {
    const { page, context, errors } = await newPage({ width, height: 900 });
    try {
      await open(page);
      const skip = page.locator(".skip-link");
      await skip.focus();
      assert.equal(await skip.evaluate((element) => getComputedStyle(element).color), "rgb(7, 16, 31)", "The focused skip link keeps readable dark text");
      const feedback = page.locator('[data-open-dialog="uxFeedbackDialog"]');
      await feedback.click();
      for (const name of ["Your name", "Email address", "Your feedback"]) {
        const field = page.locator("#joinForm").getByLabel(name, { exact: true });
        assert.equal(await field.evaluate((element) => element.required && element.labels.length > 0), true, "Feedback keeps a visible label and required state: " + name);
      }
      await page.locator("#joinSubmit").click();
      assert.equal(await page.locator("#joinName").evaluate((element) => element === document.activeElement), true, "An empty feedback submission focuses the first required field");
      await page.locator("#joinName").fill("UI review");
      await page.locator("#joinEmail").fill("invalid");
      await page.locator("#joinSubmit").click();
      assert.equal(await page.locator("#joinEmail").evaluate((element) => element === document.activeElement), true, "Feedback validation directs attention to an invalid email");
      assert.equal(await page.locator("#joinEmail").getAttribute("aria-invalid"), "true");
      assert.match(await page.locator("#joinStatus").textContent(), /valid email address/);
      const closeFeedback = page.getByRole("button", { name: "Close feedback", exact: true });
      const closeBounds = await closeFeedback.boundingBox();
      assert.ok(closeBounds.width >= 44 && closeBounds.height >= 44, "Dialog dismissal has a 44px target");
      await closeFeedback.click();
      assert.equal(await feedback.evaluate((element) => element === document.activeElement), true, "Feedback dismissal restores its opener");
      for (const target of await page.locator(".ux-footer-links a, .ux-footer-links button").evaluateAll((elements) => elements.map((element) => { const r = element.getBoundingClientRect(); return { width: r.width, height: r.height }; }))) {
        assert.ok(target.width >= 44 && target.height >= 44, "Footer actions have usable touch targets");
      }
      await page.evaluate(() => scrollTo(0, 0));
      const trigger = page.locator(".account-trigger:visible").first();
      assert.equal(await trigger.getAttribute("aria-haspopup"), "dialog", "The account trigger identifies its dialog correctly");
      await trigger.click();
      const account = page.getByRole("dialog", { name: "Account", exact: true });
      assert.equal(await account.isVisible(), true, "Account forms have dialog semantics");
      assert.equal(await account.locator('.login-form button[type="submit"]').textContent(), "Log in", "The account action describes signing in");
      const closeAccount = account.getByRole("button", { name: "Close account panel", exact: true });
      const accountBounds = await closeAccount.boundingBox();
      assert.ok(accountBounds.width >= 44 && accountBounds.height >= 44, "Account has a visible 44px dismissal target");
      await closeAccount.click();
      assert.equal(await trigger.getAttribute("aria-expanded"), "false");
      assert.equal(await trigger.evaluate((element) => element === document.activeElement), true, "Account dismissal restores its trigger");
      assert.equal(await page.locator(".account-trigger-bubble:visible").count(), 0, "Automatic promotional text does not cover navigation");
      await page.goto(preview.origin + "/english-world.html", { waitUntil: "domcontentloaded" });
      await page.locator(".account-trigger").waitFor();
      if (width === 320) {
        const brand = await page.locator(".brand").boundingBox();
        const controls = await page.locator(".nav-controls").boundingBox();
        assert.ok(brand.x + brand.width <= controls.x + 1, "The compact language header separates branding from controls");
      }
      await screenshot(page, "shared-ui-" + width);
      assert.deepEqual(errors, []);
    } finally { await context.close(); }
  }
}

async function verifySearch(page) {
  const trigger = await visibleControl(page, '[data-open-dialog="uxSearchDialog"]');
  await trigger.focus();
  await page.keyboard.press("/");
  await page.locator('#homeSearchScope [data-search-scope="all"]').click();
  assert.deepEqual(await page.locator("#homeSearchScope button").allTextContents(), ["All"], "Search keeps only All");
  assert.equal(await page.locator("#uxSearchResults .ux-search-result").count(), 45, "An empty search lists every subject, including unavailable subjects");
  assert.equal(await page.locator("#uxSearchResults").getByText("Browse subjects", { exact: true }).count(), 0, "Search does not list galaxy categories");
  await page.locator("#uxSearchInput").fill("French");
  assert.equal(await page.locator('#uxSearchResults a[href="world-french.html"]').count(), 1);
  for (const query of ["Francais", "French Languages"]) {
    await page.locator("#uxSearchInput").fill(query);
    assert.equal(await page.locator('#uxSearchResults a[href="world-french.html"]').count(), 1, "Search resolves accents and subject/category words: " + query);
  }
  for (const query of ["math", "maths"]) {
    await page.locator("#uxSearchInput").fill(query);
    assert.equal(await page.locator('#uxSearchResults a[href="maths-lab.html"]').count(), 1, "Search aliases resolve the real mathematics preview: " + query);
  }
  await page.locator("#uxSearchInput").fill("Physics");
  assert.equal(await page.locator("#uxSearchDialog .ux-search-footer").count(), 0, "Search has no instructions for the removed Available filter");
  assert.ok(await page.locator("#uxSearchResults button.ux-search-result").count() > 0, "All search retains the honest in-development destination");
  await page.locator("#uxSearchInput").fill("Science");
  assert.equal(await page.locator('#uxSearchResults a[href="maths-lab.html"]').count(), 1, "Searching a category name still finds its subjects");
  const scienceResults = await page.locator("#uxSearchResults .ux-search-result strong").allTextContents();
  assert.deepEqual([...scienceResults].sort(), ["Mathematics", "Physics", "Chemistry", "Biology", "Astronomy", "Computer Science", "Medical Science"].sort(), "Science matches subjects and their category metadata without adding a category result");
  await page.locator('#homeSearchScope [data-search-scope="all"]').click();
  await page.locator("#homeSearchReset").click();
  assert.equal(await page.locator("#uxSearchInput").inputValue(), "", "Clear search empties the query");
  assert.ok(await page.locator("#uxSearchResults .ux-search-result").count() > 0);
  await page.locator("#uxSearchInput").fill("a-subject-that-does-not-exist");
  assert.match(await page.locator("#uxSearchResults").innerText(), /No (?:destinations|subjects|results) found/i);
  await page.locator("#uxSearchInput").fill("French");
  await page.keyboard.press("ArrowDown");
  assert.equal(await page.locator('#uxSearchResults a[href="world-french.html"]').evaluate((element) => element === document.activeElement), true, "ArrowDown reaches the matching course from the search input");
  await page.keyboard.press("Escape");
  assert.equal(await page.locator("#uxSearchDialog").isVisible(), false);
  assert.equal(await trigger.evaluate((element) => element === document.activeElement), true, "Closing search returns keyboard focus");
  if (await page.locator("#uxGalaxyView").isVisible()) {
    await page.locator("#uxWorldFilter").focus();
    await page.evaluate(() => new Promise(requestAnimationFrame));
    assert.equal(await page.locator("#uxWorldFilter").evaluate((element) => element === document.activeElement), true, "A delayed dialog close must not steal focus from the filter");
    await page.keyboard.type("/");
    assert.equal(await page.locator("#uxSearchDialog").isVisible(), false, "Search shortcut must not interrupt typing in a filter");
    await page.locator("#uxWorldFilter").fill("");
  }
}

async function verifyLanguageList(page) {
  // Explicit switching now resumes each galaxy's prior state. This helper checks
  // the complete course inventory deliberately, rather than assuming a reset.
  await clearCatalogFilters(page);
  await page.locator("#uxWorldGrid").waitFor({ state: "visible" });
  assert.equal(await page.locator("#uxWorldGrid .ux-world-card").count(), 12);
  for (const route of languageRoutes) assert.equal(await page.locator('#uxWorldGrid a[href="' + route + '"]').count(), 1, route);
  for (const query of ["Francais", "French Languages"]) {
    await page.locator("#uxWorldFilter").fill(query);
    assert.equal(await page.locator("#uxWorldGrid .ux-world-card").count(), 1, "Local and global search agree: " + query);
    assert.equal(await page.locator('#uxWorldGrid a[href="world-french.html"]').count(), 1);
  }
  await page.locator("#homeClearFilter").click();
  assert.equal(await page.locator("#uxWorldFilter").inputValue(), "");
  assert.equal(await page.locator("#uxWorldGrid .ux-world-card").count(), 12);
  await page.locator("#uxWorldFilter").fill("Japanese");
  assert.equal(await page.locator("#uxWorldGrid .ux-world-card").count(), 1);
  assert.equal(await page.locator('#uxWorldGrid a[href="world-japanese.html"]').count(), 1);
  await page.locator("#uxWorldFilter").press("Escape");
  assert.equal(await page.locator("#uxWorldFilter").inputValue(), "", "Escape clears a local query before changing category");
  assert.equal((await readState(page)).galaxyId, "languages");
  assert.equal(await page.locator("#uxWorldGrid .ux-world-card").count(), 12);
  await page.locator("#uxWorldFilter").fill("a-subject-that-does-not-exist");
  assert.equal(await page.locator("#uxWorldGrid .ux-world-card").count(), 0);
  assert.match(await page.locator("#uxWorldGrid").innerText(), /No .*match/i);
  await page.locator("#uxWorldFilter").fill("Physics");
  await page.locator("#uxWorldGrid").getByRole("button", { name: "Search all subjects", exact: true }).click();
  assert.equal(await page.locator("#uxSearchDialog").isVisible(), true, "An empty local search offers the global search");
  assert.equal(await page.locator("#uxSearchInput").inputValue(), "Physics", "Global search retains the local query");
  await page.keyboard.press("Escape");
  await page.locator("#homeClearFilter").click();
  assert.equal(await page.locator("#uxWorldGrid .ux-world-card").count(), 12);
}

async function verifyOverview(page) {
  assert.equal(await page.locator("h1").count(), 1);
  assert.equal((await page.locator("#homeTitle").innerText()).replace(/\s+/g, " ").trim(), "Choose a subject", "The opening heading explains subject selection in familiar language");
  assert.equal(await page.locator("#uxGalaxyView").isVisible(), false, "A course catalog must not replace the opening galaxy experience");
  assert.equal(await page.locator("#uxWorldGrid .ux-world-card:visible").count(), 0, "Course cards appear after choosing a galaxy");
  await verifyRemovedHomeFeatures(page);
  assert.deepEqual((await page.locator('#flightGalaxyItems [data-galaxy]:not([data-galaxy=""])').evaluateAll((buttons) => buttons.map((button) => button.dataset.galaxy))).sort(), [...galaxyIds].sort(), "All nine existing galaxy identities remain in the index");
  if ((await readState(page)).renderer === "svg") {
    assert.equal(await page.locator("#uxListView").isVisible(), false, "The opening map has no permanent catalog sidebar");
    await assertGalaxyMap(page);
    await page.locator("#homeHeroLink").click();
    assert.equal(await page.locator("#uxListView").isVisible(), true, "All galaxies opens the complete accessible index");
    assert.equal(await page.locator('#flightGalaxyItems [data-galaxy="languages"]').isVisible(), true);
    await page.locator("#uxMapView").click();
    assert.equal(await page.locator("#uxListView").isVisible(), false, "Closing the index leaves the galaxy map available");
  } else {
    assert.equal(await page.locator("#uxListView").isVisible(), true, "A missing renderer exposes the complete galaxy index");
    assert.equal(await page.locator('#flightGalaxyItems [data-galaxy="languages"]').isVisible(), true);
  }
  await assertHeaderLayout(page);
  await verifyMobileNavigation(page);
}

async function assertGalaxyMap(page) {
  const scene = await readState(page);
  assert.equal(scene.galaxies, 9, "Renderer retains all existing galaxy identities");
  assert.equal(await page.locator(".cs-space-backdrop").count(), 1, "One deep-space backdrop is mounted");
  assert.equal(scene.background.depthLayers, 3, "The space background has three star depths");
  assert.ok(scene.background.stars >= 1800, "The backdrop contains a rich star field");
  const backgroundSource = await page.locator(".cs-space-backdrop").evaluate(async (host) => {
    const value = host.style.backgroundImage;
    const prefix = "data:image/svg+xml;charset=utf-8,";
    const start = value.indexOf(prefix);
    if (start < 0) throw new Error("The background must be a generated SVG resource");
    const encoded = value.slice(start + prefix.length).replace(/["']?\)$/, "");
    const doc = new DOMParser().parseFromString(decodeURIComponent(encoded), "image/svg+xml");
    const image = new Image();
    image.src = prefix + encoded;
    await image.decode();
    return { errors: doc.querySelectorAll("parsererror").length, nebula: doc.querySelectorAll(".cs-space-nebula").length, depths: doc.querySelectorAll(".cs-space-star-layer").length, unsupported: doc.querySelectorAll("filter, image, script").length, width: image.naturalWidth, height: image.naturalHeight };
  });
  assert.equal(backgroundSource.errors, 0, "The cached SVG background is valid XML");
  assert.equal(backgroundSource.width, 1440, "The browser decodes the generated background under the real server CSP");
  assert.equal(backgroundSource.height, 900, "The decoded vector background retains its intended dimensions");
  assert.equal(backgroundSource.nebula, 1, "The background includes diffuse nebula clouds");
  assert.equal(backgroundSource.depths + await page.locator(".cs-space-near-layer").count(), 3, "Two SVG star depths and one composited near layer are present");
  assert.equal(backgroundSource.unsupported, 0, "The background contains no filters, raster images, or scripts");
  assert.equal(Object.hasOwn(scene, "spacecraft"), false, "Galaxy navigation has no spacecraft state");
  assert.equal(await page.locator(".cs-flight-layer, .cs-spacecraft, .flight-dock, #flightLaunch, [data-ship-state]").count(), 0, "Ship artwork, flight paths, and launch controls are removed");
  assert.deepEqual(Object.keys(scene.galaxyForms || {}).sort(), [...galaxyIds].sort(), "The scene records a subject symbol for every galaxy");
  assert.equal(new Set(Object.values(scene.galaxyForms)).size, 9, "Every galaxy has a distinct subject symbol");
  const clusters = await page.locator(".cs-subject-cluster").evaluateAll((elements) => elements.map((cluster) => ({
    stars: Number(cluster.dataset.starCount),
    symbol: cluster.closest("svg").dataset.subjectSymbol,
    paths: cluster.querySelectorAll("path").length,
  })));
  assert.equal(clusters.length, 9, "Every subject is drawn as a star cluster");
  for (const cluster of clusters) {
    assert.ok(cluster.stars >= 500, "The subject symbol contains a visible concentration of individual stars: " + cluster.symbol);
    assert.equal(cluster.paths, 5, "Star particles stay batched into a small number of SVG paths");
  }
  assert.equal(await page.locator(".cs-galaxy-art text, .cs-galaxy-art image").count(), 0, "Subject symbols are drawn from stars without text or bitmap overlays");
  const targets = await page.locator(".cs-galaxy-button[data-category]").evaluateAll((buttons) => buttons.map((button) => {
    const box = (element) => {
      const { x, y, width, height } = element.getBoundingClientRect();
      return { x, y, width, height };
    };
    const art = button.querySelector("svg.cs-galaxy-art");
    const label = button.querySelector(".cs-category-name");
    const style = getComputedStyle(button);
    return {
      id: button.dataset.category,
      name: button.getAttribute("aria-label") || button.textContent.trim(),
      target: box(button),
      label: label ? { text: label.textContent.trim(), ...box(label) } : null,
      art: art ? box(art) : null,
      hidden: Boolean(button.closest('[hidden], [aria-hidden="true"]')) || style.display === "none" || style.visibility === "hidden",
    };
  }));
  assert.deepEqual(targets.map((target) => target.id).sort(), [...galaxyIds].sort(), "Every category is represented by an actual illustrated galaxy");
  for (const target of targets) {
    assert.ok(Math.abs(target.art.width - targets[0].art.width) <= 0.5, "Galaxies share the same responsive artwork width: " + target.id);
    assert.ok(Math.abs(target.art.height - targets[0].art.height) <= 0.5, "Galaxies share the same responsive artwork height: " + target.id);
  }
  for (const target of targets) {
    assert.equal(target.hidden, false, "Galaxy remains accessible: " + target.id);
    assert.ok(target.name && target.label?.text, "Galaxy has a persistent readable name: " + target.id);
    assert.ok(target.target.width >= 43.5 && target.target.height >= 43.5, "Galaxy target needs 44px: " + target.id);
    assert.ok(target.art && target.art.width >= 100 && target.art.height >= 60, "Galaxy needs substantial artwork rather than a small icon: " + target.id);
    assert.ok(target.label.width > 0 && target.label.height > 0, "Galaxy label is visible without hover: " + target.id);
    assert.ok(target.label.x >= -1 && target.label.x + target.label.width <= page.viewportSize().width + 1, "Galaxy names remain horizontally readable: " + target.id);
  }
  for (let left = 0; left < targets.length; left++) for (let right = left + 1; right < targets.length; right++) {
    const a = targets[left].label, b = targets[right].label;
    const overlapX = Math.min(a.x + a.width, b.x + b.width) - Math.max(a.x, b.x);
    const overlapY = Math.min(a.y + a.height, b.y + b.height) - Math.max(a.y, b.y);
    assert.ok(overlapX <= 1 || overlapY <= 1, "Galaxy names must not overlap: " + targets[left].id + " / " + targets[right].id);
  }
}

async function verifyFutureSubjects(page) {
  await selectCategory(page, "science");
  await clearCatalogFilters(page);
  assert.equal(await page.locator("#uxWorldGrid .ux-world-card").count(), 5);
  assert.equal(await page.locator('#uxWorldGrid a[href="maths-lab.html"]').count(), 1);
  assert.equal(await page.locator("#uxWorldGrid .is-planned a").count(), 0, "Unavailable subjects must not masquerade as working destinations");
  assert.doesNotMatch(await page.locator("#uxWorldGrid .is-planned").first().innerText(), /Unavailable/);
  assert.equal(await page.locator("#uxWorldGrid .ux-world-card").count(), 5);
  await selectCategory(page, "engineering");
  await clearCatalogFilters(page);
  assert.equal(await page.locator("#uxWorldGrid a").count(), 0);
  assert.equal(await page.locator("#uxWorldGrid .ux-world-card").count(), 4);
}

async function verifyGalaxySwitching() {
  for (const viewport of [{ width: 1440, height: 1000 }, { width: 390, height: 844 }]) {
    const { page, context, errors } = await newPage(viewport);
    try {
      await open(page);
      await verifyRemovedHomeFeatures(page);
      await selectCategory(page, "languages");
      await clearCatalogFilters(page);
      await page.locator("#uxWorldFilter").focus();
      await page.keyboard.type("g");
      assert.equal(await page.locator("#uxListView").isVisible(), false, "G must not steal typing from the subject filter");
      assert.equal(await page.locator("#uxWorldFilter").inputValue(), "g");
      await page.locator("#uxWorldFilter").fill("a");
      const languageLinks = await page.locator("#uxWorldGrid a[href]").evaluateAll((links) => links.map((link) => link.getAttribute("href")));
      const languageScroll = await page.evaluate(async () => {
        scrollTo(0, Math.min(220, Math.max(0, document.documentElement.scrollHeight - innerHeight)));
        await new Promise(requestAnimationFrame);
        return scrollY;
      });
      await page.waitForTimeout(150);
      await showCategoriesWithShortcut(page);
      await selectCategory(page, "science");
      await waitState(page, { galaxyId: "science" });
      await showCategoriesWithShortcut(page);
      await selectCategory(page, "languages");
      await waitState(page, { galaxyId: "languages" });
      assert.equal(await page.locator("#uxWorldFilter").inputValue(), "a", "Galaxy switching restores its query");
      await page.waitForFunction((expected) => Math.abs(scrollY - expected) <= 3, languageScroll);
      await page.goBack();
      await waitState(page, { galaxyId: "science" });
      await page.goForward();
      await waitState(page, { galaxyId: "languages" });
      assert.equal(await page.locator("#uxWorldFilter").inputValue(), "a", "Browser history includes galaxy switching");
      await showCategoriesWithShortcut(page);
      const index = page.locator("#flightGalaxyItems");
      await page.keyboard.press("Home");
      assert.equal(await index.locator('[data-galaxy=""]').evaluate((element) => element === document.activeElement), true, "Home reaches the overview option");
      await page.keyboard.press("End");
      assert.equal(await index.locator('[data-galaxy="arts"]').evaluate((element) => element === document.activeElement), true, "End reaches the last galaxy");
      await page.keyboard.press("ArrowUp");
      assert.equal(await index.locator('[data-galaxy="business"]').evaluate((element) => element === document.activeElement), true, "ArrowUp moves between galaxy names");
      await page.keyboard.press("Home");
      await page.keyboard.press("ArrowDown");
      assert.equal(await index.locator('[data-galaxy="languages"]').evaluate((element) => element === document.activeElement), true, "ArrowDown reaches Languages");
      await page.keyboard.press("Home");
      await page.keyboard.type("sci", { delay: 30 });
      assert.equal(await index.locator('[data-galaxy="science"]').evaluate((element) => element === document.activeElement), true, "Typeahead finds an actual galaxy name");
      await page.keyboard.press("Enter");
      await waitState(page, { galaxyId: "science", menuOpen: false });
      await clearCatalogFilters(page);
      await page.locator("#uxWorldFilter").fill("Physics");
      await showCategoriesWithShortcut(page);
      await page.keyboard.press("Home");
      await page.keyboard.type("lan", { delay: 30 });
      await page.keyboard.press("Enter");
      await waitState(page, { galaxyId: "languages", menuOpen: false });
      await page.waitForFunction(() => document.getElementById("uxWorldFilter").value === "a");
      assert.deepEqual(await page.locator("#uxWorldGrid a[href]").evaluateAll((links) => links.map((link) => link.getAttribute("href"))), languageLinks, "Explicit switching restores the previous course set");
      await page.waitForFunction((expected) => Math.abs(scrollY - expected) <= 3, languageScroll);
      await showCategoriesWithShortcut(page);
      await page.keyboard.press("Home");
      await page.keyboard.type("sci", { delay: 30 });
      await page.keyboard.press("Enter");
      await waitState(page, { galaxyId: "science", menuOpen: false });
      assert.equal(await page.locator("#uxWorldFilter").inputValue(), "Physics", "The second galaxy also resumes its own query");
      assert.equal(await page.locator("#uxWorldGrid .ux-world-card").count(), 1);
      assert.equal(await page.locator("#uxWorldGrid a[href]").count(), 0, "A resumed planned subject still has no invented link");
      await page.locator(".ux-brand[data-universe-home]").click();
      await waitState(page, { galaxyId: null });
      assert.equal(await page.locator("#uxGalaxyView").isVisible(), false, "The brand returns to the full galaxy map");
      await showCategoriesWithShortcut(page);
      await page.keyboard.press("Escape");
      assert.equal(await page.locator("#homeTitle").evaluate((element) => element === document.activeElement), true, "Escape restores the G shortcut opener");
      await screenshot(page, "switching-" + viewport.width);
      assert.deepEqual(errors, [], "Galaxy switching " + viewport.width);
    } catch (error) {
      await screenshot(page, "switching-" + viewport.width + "-failure").catch(() => {});
      throw error;
    } finally { await context.close(); }
  }
}

async function verifyImmediateBrowsingEdit() {
  const { page, context, errors } = await newPage();
  try {
    await open(page);
    const snapshot = await page.evaluate(() => {
      const universe = window.cosmicaUniverse;
      // Re-enter a visited galaxy, then edit in the same task before its pending
      // restoration frame. This reproduces fast input without changing timers.
      universe.enterGalaxy("science");
      universe.enterGalaxy("languages");
      universe.enterGalaxy("science");
      const input = document.getElementById("uxWorldFilter");
      input.value = "Physics";
      input.dispatchEvent(new Event("input", { bubbles: true }));
      return history.state.cosmicaHomeBrowser;
    });
    assert.equal(snapshot.filter, "Physics", "A deliberate edit saves before the pending restoration frame");
    await page.goBack();
    await waitState(page, { galaxyId: "languages" });
    await page.goForward();
    await waitState(page, { galaxyId: "science" });
    assert.equal(await page.locator("#uxWorldFilter").inputValue(), "Physics", "Forward restores an immediately edited query");
    assert.equal(await page.locator("#uxWorldGrid .ux-world-card").count(), 1);
    assert.equal(await page.locator("#uxWorldGrid a").count(), 0, "A planned subject still has no invented destination");
    assert.deepEqual(errors, []);
  } finally { await context.close(); }
}

async function verifyHistory(page, renderer) {
  await page.locator("#uxWorldFilter").fill("a");
  const languageLinks = await page.locator("#uxWorldGrid a[href]").evaluateAll((links) => links.map((link) => link.getAttribute("href")));
  const languageScroll = await page.evaluate(async () => {
    scrollTo(0, Math.min(180, document.documentElement.scrollHeight - innerHeight));
    await new Promise(requestAnimationFrame);
    return scrollY;
  });
  // Scroll state is saved after the browser has delivered its scroll event.
  await page.waitForTimeout(200);
  await showCategoriesWithShortcut(page);
  await selectCategory(page, "science");
  await page.locator("#uxWorldFilter").fill("Physics");
  await page.goBack();
  await waitState(page, { galaxyId: "languages" });
  await page.waitForFunction(() => document.getElementById("uxWorldFilter").value === "a");
  assert.deepEqual(await page.locator("#uxWorldGrid a[href]").evaluateAll((links) => links.map((link) => link.getAttribute("href"))), languageLinks, "Back restores the filtered course set");
  await page.waitForFunction((expected) => Math.abs(scrollY - expected) <= 3, languageScroll);
  await page.goForward();
  await waitState(page, { galaxyId: "science" });
  assert.equal(await page.locator("#uxWorldFilter").inputValue(), "Physics", "Forward restores the next category's query");
  assert.equal(await page.locator("#uxWorldGrid .ux-world-card").count(), 1);
  assert.equal(await page.locator("#uxWorldGrid a").count(), 0, "Restoring Physics does not invent a course link");
  await page.locator("#uxBack").click();
  await waitState(page, { galaxyId: null });
  assert.equal(await page.locator("#uxGalaxyView").isVisible(), false, "Back returns to the galaxy map");
  assert.equal(await page.locator("#homeTitle").evaluate((element) => element === document.activeElement), true, "Returning to the map restores focus to its heading");
  await page.goBack();
  await waitState(page, { galaxyId: "science" });
  assert.equal(await page.locator("#uxWorldFilter").inputValue(), "Physics");
  await page.goForward();
  await waitState(page, { galaxyId: null });
  await open(page, "/#galaxy-languages");
  await verifyLanguageList(page);
  await page.reload({ waitUntil: "domcontentloaded" });
  await waitState(page, { renderer, galaxyId: "languages" });
  await verifyLanguageList(page);
}

async function verifySceneControls(page) {
  const controls = page.locator(".cs-category-controls");
  await controls.waitFor({ state: "visible" });
  const labels = await controls.locator("button[data-category]").evaluateAll((buttons) => buttons.map((button) => {
    const { x, y, width, height } = button.getBoundingClientRect();
    return {
      category: button.dataset.category,
      label: button.getAttribute("aria-label") || button.textContent.trim(),
      hiddenFromAssistiveTechnology: Boolean(button.closest('[aria-hidden="true"]')),
      x, y, width, height,
    };
  }));
  assert.equal(labels.length, 9, "All nine illustrated galaxies provide actual navigation");
  assert.equal(await controls.locator(".cs-galaxy-status").count(), 0, "Galaxies omit course counts and availability labels");
  assert.equal(await controls.locator(".cs-galaxy-action").count(), 9, "Every galaxy retains its View subjects cue");
  for (const target of labels) {
    assert.ok(target.label, "Scene category controls have an accessible name");
    assert.equal(target.hiddenFromAssistiveTechnology, false, "Scene controls are HTML navigation rather than an inaccessible SVG hit region");
    assert.ok(target.width >= 43.5 && target.height >= 43.5, "Scene category target needs 44px: " + target.category);
  }
  const science = controls.locator('[data-category="science"]');
  // The galaxy map scrolls on phones. Put the complete target in view before
  // measuring hover stability, so browser auto-scrolling is not an art movement.
  await science.evaluate((button) => button.scrollIntoView({ block: "center", behavior: "instant" }));
  const before = { url: page.url(), state: await readState(page), box: await science.boundingBox() };
  await science.hover();
  await science.focus();
  await page.waitForTimeout(150);
  assert.equal(page.url(), before.url, "Scene hover/focus previews do not navigate");
  assert.equal((await readState(page)).galaxyId, before.state.galaxyId, "Scene hover/focus preserves selected category");
  assert.deepEqual((await readState(page)).camera, before.state.camera, "Reduced-motion scene preview preserves the camera");
  const after = await science.boundingBox();
  assert.ok(Math.abs(after.x - before.box.x) <= 1 && Math.abs(after.y - before.box.y) <= 1, "Scene category hit targets stay fixed while previewing: " + JSON.stringify({ before: before.box, after }));
  assert.equal(after.width, before.box.width, "Hover does not resize the clickable target");
  assert.equal(after.height, before.box.height, "Hover does not resize the clickable target");
  assert.equal(await science.evaluate((button) => button.classList.contains("is-previewed")), true, "Hover/focus highlights the previewed galaxy");
  assert.equal(await science.locator(".cs-galaxy-action").evaluate((cue) => getComputedStyle(cue).opacity), "1", "A preview shows its View subjects action");
  assert.equal(await page.locator("#homeGalaxyPreview, #homeSceneName").count(), 0, "Hover does not create a separate galaxy text panel");
  await page.keyboard.press("Home");
  const languages = controls.locator('[data-category="languages"]');
  assert.equal(await languages.evaluate((button) => button === document.activeElement), true, "Home focuses the first galaxy without entering it");
  const origin = await languages.boundingBox();
  await page.keyboard.press("ArrowRight");
  const right = await page.locator(".cs-galaxy-button:focus").boundingBox();
  assert.ok(right.x + right.width / 2 > origin.x + origin.width / 2, "Right arrow focuses a galaxy to the right in the rendered layout");
  await page.keyboard.press("End");
  assert.equal(await controls.locator('[data-category="arts"]').evaluate((button) => button === document.activeElement), true, "End focuses the last galaxy");
  assert.equal(page.url(), before.url, "Map arrow keys preview without changing the route");
  assert.equal((await readState(page)).galaxyId, null, "Map arrow keys do not enter a galaxy");
  const horizontalScroll = await page.evaluate(() => ({
    window: scrollX,
    ancestors: [...document.querySelectorAll("#uxSpace, .home-space-wrap, .home-hero")].map((element) => ({ name: element.id || element.className, scrollLeft: element.scrollLeft })),
  }));
  assert.equal(horizontalScroll.window, 0, "Galaxy focus must not pan the page horizontally");
  for (const ancestor of horizontalScroll.ancestors) assert.equal(ancestor.scrollLeft, 0, "Galaxy focus must not scroll its clipping ancestor: " + ancestor.name);
  await science.click();
  await waitState(page, { galaxyId: "science" });
  assert.equal((await readState(page)).transitioning, false, "Reduced motion opens the selected galaxy immediately");
  assert.equal(await page.locator("#uxGalaxyView").isVisible(), true, "Choosing a galaxy reveals its subject catalog");
  assert.equal(await page.locator('#uxWorldGrid a[href="maths-lab.html"]').count(), 1, "Scene selection reaches the real Science catalog");
  await page.locator("#uxBack").click();
  await waitState(page, { galaxyId: null });
  assert.equal(await page.locator("#uxGalaxyView").isVisible(), false);
  assert.equal(await page.locator("#homeTitle").evaluate((element) => element === document.activeElement), true);
  await page.evaluate(() => scrollTo(0, 0));
  await page.mouse.move(0, 0);
}

async function verifyFallback(options) {
  const { page, context, errors } = await newPage(options);
  try {
    await open(page);
    const expectedRenderer = options.noBundle ? "fallback" : "svg";
    await waitState(page, { renderer: expectedRenderer, galaxyId: null, spatialAvailable: !options.noBundle });
    assert.equal(await page.locator(".cs-vector-scene").count(), options.noBundle ? 0 : 1);
    assert.equal(await page.locator("#uxSpace canvas, #uxSpace img, #uxSpace svg image").count(), 0, "Homepage scene is vector-based and independent of canvas and raster assets");
    await verifyOverview(page);
    if (!options.noBundle) await verifySceneControls(page);
    await screenshot(page, options.name + "-index");
    // Closing the optional index retains the map; catalogs still require selection.
    if (await page.locator("#uxMapView").isVisible()) await page.locator("#uxMapView").click();
    assert.equal(await page.locator("#uxGalaxyView").isVisible(), false);
    await verifySearch(page);
    await selectCategory(page, "languages", true);
    assert.equal(await page.locator("#uxGalaxyTitle").evaluate((element) => element === document.activeElement), true, "Keyboard category selection focuses the subject heading");
    await verifyLanguageList(page);
    await verifyRemovedHomeFeatures(page);
    await screenshot(page, options.name + "-languages");
    await assertFits(page, options.name);
    await verifyHistory(page, expectedRenderer);
    await verifyFutureSubjects(page);
    await selectCategory(page, "languages");
    await page.locator('#uxWorldGrid a[href="english-world.html"]').click();
    await page.waitForURL("**/english-world.html");
    assert.equal(await page.locator("main").isVisible(), true);
    assert.deepEqual(errors, [], options.name);
  } catch (error) {
    await screenshot(page, options.name + "-failure").catch(() => {});
    throw error;
  } finally { await context.close(); }
}

async function verifySubjectViewport(viewport) {
  const { page, context, errors } = await newPage(viewport);
  try {
    await open(page);
    await waitState(page, { renderer: "svg", transitioning: false, motionEnabled: false, spatialAvailable: true });
    assert.equal(await page.locator(".cs-vector-scene").count(), 1);
    assert.equal(await page.locator("#uxSpace canvas, #uxSpace img, #uxSpace svg image").count(), 0);
    await page.waitForFunction(() => window.cosmicaUniverse.getState().renderedFrames > 0);
    await verifyOverview(page);
    await verifySceneControls(page);
    assert.equal(await page.locator("#uxSound").getAttribute("aria-pressed"), "false");
    await assertFits(page, "Home " + viewport.width);
    await screenshot(page, "home-" + viewport.width);
    await selectCategory(page, "languages", true);
    await waitState(page, { galaxyId: "languages", transitioning: false });
    assert.equal(Object.hasOwn(await readState(page), "spacecraft"), false, "Selecting a galaxy does not recreate spacecraft state");
    await verifyLanguageList(page);
    await assertFits(page, "Languages " + viewport.width);
    await screenshot(page, "languages-" + viewport.width);
    await verifySearch(page);

    // Previewing must not select a category, alter URLs, or move the target.
    await showCategories(page);
    const science = page.locator('#flightGalaxyItems [data-galaxy="science"]');
    const before = { url: page.url(), state: await readState(page), box: await science.boundingBox() };
    await science.hover();
    await science.focus();
    await page.waitForTimeout(250);
    assert.equal((await readState(page)).galaxyId, "languages");
    assert.equal(page.url(), before.url);
    assert.equal(await page.locator("#uxWorldGrid .ux-world-card").count(), 12);
    const afterBox = await science.boundingBox();
    assert.ok(Math.abs(afterBox.x - before.box.x) <= 1 && Math.abs(afterBox.y - before.box.y) <= 1, "Preview must not move its navigation target");
    const afterState = await readState(page);
    assert.deepEqual(afterState.camera, before.state.camera, "Reduced-motion hover must not move the camera");
    if (await page.locator("#uxMapView").isVisible()) await page.locator("#uxMapView").click();

    await page.locator("#uxWorldFilter").fill("French");
    await page.reload({ waitUntil: "domcontentloaded" });
    await waitState(page, { renderer: "svg", galaxyId: "languages", transitioning: false });
    assert.equal(await page.locator("#uxWorldFilter").inputValue(), "French", "Browsing query survives reload through history state");
    assert.equal(await page.locator('#uxWorldGrid a[href="world-french.html"]').count(), 1);
    assert.equal(await page.locator("#uxWorldGrid .ux-world-card").count(), 1);
    await verifyRemovedHomeFeatures(page);

    await clearCatalogFilters(page);
    // The scene must leave normal wheel/page scrolling available.
    await page.evaluate(() => scrollTo(0, 0));
    const sceneBox = await page.locator("#uxSpace").boundingBox();
    if (sceneBox && sceneBox.y >= 0 && sceneBox.y < viewport.height) {
      await page.mouse.move(sceneBox.x + sceneBox.width / 2, Math.min(sceneBox.y + sceneBox.height / 2, viewport.height - 10));
      await page.mouse.wheel(0, 500);
      await page.waitForFunction(() => scrollY > 0);
    }
    await assertFits(page, "Scrolled catalog " + viewport.width);
    assert.deepEqual(errors, [], "Browser " + viewport.width);
  } catch (error) {
    await screenshot(page, "home-" + viewport.width + "-failure").catch(() => {});
    throw error;
  } finally { await context.close(); }
}

async function verifyStorageOnly() {
  const { page, context, errors } = await newPage({ noStorage: true });
  try {
    await open(page, "/#galaxy-languages");
    await waitState(page, { renderer: "svg", galaxyId: "languages", transitioning: false });
    assert.equal(await page.evaluate(() => { try { void window.localStorage; return false; } catch { return true; } }), true, "The scenario really denies browser storage");
    await clearCatalogFilters(page);
    await page.locator("#uxWorldFilter").fill("Japanese");
    await page.reload({ waitUntil: "domcontentloaded" });
    await waitState(page, { renderer: "svg", galaxyId: "languages", transitioning: false });
    assert.equal(await page.locator("#uxWorldFilter").inputValue(), "Japanese", "History restores browsing even without local storage");
    await verifyRemovedHomeFeatures(page);
    await showCategoriesWithShortcut(page);
    await selectCategory(page, "science");
    await clearCatalogFilters(page);
    await page.locator("#uxWorldFilter").fill("math");
    assert.equal(await page.locator('#uxWorldGrid a[href="maths-lab.html"]').count(), 1);
    await showCategoriesWithShortcut(page);
    await selectCategory(page, "languages");
    assert.equal(await page.locator("#uxWorldFilter").inputValue(), "Japanese", "Explicit galaxy switching works with storage denied");
    assert.equal(await page.locator("#uxWorldGrid .ux-world-card").count(), 1);
    await page.locator('#uxWorldGrid a[href="world-japanese.html"]').click();
    await page.waitForURL("**/world-japanese.html");
    assert.equal(await page.locator("main").isVisible(), true);
    assert.deepEqual(errors, []);
  } finally { await context.close(); }
}

async function verifyDirectLinks() {
  const { page, context } = await newPage({ noJavaScript: true });
  try {
    await page.goto(preview.origin, { waitUntil: "domcontentloaded" });
    await page.locator('noscript a[href="english-world.html"]').waitFor({ state: "visible" });
    for (const route of languageRoutes) assert.equal(await page.locator('noscript a[href="' + route + '"]').isVisible(), true, route);
    await page.locator('noscript a[href="english-world.html"]').click();
    await page.waitForURL("**/english-world.html");
    assert.equal(await page.locator("main").isVisible(), true);
  } finally { await context.close(); }
}

async function verifyRestrictedCourse() {
  const { page, context, errors } = await newPage({ noWebGL: true, noStorage: true, noAudio: true });
  try {
    await open(page);
    await page.locator("#uxSound").click();
    assert.equal(await page.locator("#uxSound").getAttribute("aria-pressed"), "false");
    assert.match(await page.locator("#uxAnnouncement").innerText(), /unavailable/i);
    await selectCategory(page, "languages");
    await page.locator('#uxWorldGrid a[href="english-world.html"]').click();
    await page.waitForURL("**/english-world.html");
    const consent = page.locator(".cookie-notice button").first();
    if (await consent.isVisible()) {
      await consent.click();
      // The notice is removed after its fade. Await the real dismissal so the
      // later optional check cannot try to click that already-closing node.
      await consent.waitFor({ state: "detached" });
    }
    await page.locator("#soundToggle").click();
    assert.equal(await page.locator("#soundToggle").getAttribute("aria-pressed"), "false");
    await page.locator('.world-hero .hero-actions a[href="#language"]').click();
    await page.locator("#languageSearch").fill("Spanish");
    if (await consent.isVisible()) await consent.click();
    await page.locator(".language-pill").filter({ hasText: "Spanish" }).click();
    assert.equal(await page.locator("body").evaluate((element) => element.classList.contains("language-picked")), true);
    assert.match(await page.locator(".language-pill.is-selected").innerText(), /Spanish/);
    assert.match(await page.locator(".map-words").innerText(), /Palabras/);
    assert.deepEqual(errors, []);
  } catch (error) {
    await screenshot(page, "restricted-course-failure").catch(() => {});
    throw error;
  } finally { await context.close(); }
}

async function verifyStudio() {
  for (const noStorage of [false, true]) {
    const { page, context, errors } = await newPage({ noStorage });
    try {
      await page.goto(preview.origin + "/maths-lab.html", { waitUntil: "domcontentloaded" });
      await page.locator("#slope-number").fill("2");
      await page.locator("#intercept-number").fill("1");
      await page.locator("#prediction").fill("13");
      assert.equal(await page.locator("#equation-output").innerText(), "2x + 1");
      await page.locator('#prediction-form button[type="submit"]').click();
      assert.equal(await page.locator("#prediction-feedback").getAttribute("data-state"), "correct");
      await page.locator("#save-work").click();
      assert.match(await page.locator("#save-status").innerText(), noStorage ? /could not save/ : /saved on this device/);
      if (!noStorage) {
        await page.reload({ waitUntil: "commit" });
        await page.waitForFunction(() => document.getElementById("equation-output")?.textContent === "2x + 1" && document.getElementById("function-line")?.hasAttribute("d"));
        assert.equal(await page.locator("#equation-output").innerText(), "2x + 1");
      }
      await assertFits(page, "Mathematics studio");
      assert.deepEqual(errors, []);
    } finally { await context.close(); }
  }
}

async function verifyWithoutCanvas() {
  const { page, context, errors } = await newPage({ noCanvas: true });
  try {
    await open(page, "/#galaxy-languages");
    await waitState(page, { renderer: "svg", galaxyId: "languages", transitioning: false });
    assert.equal(await page.evaluate(() => document.createElement("canvas").getContext("2d")), null, "The test has disabled every canvas context");
    assert.equal(await page.locator(".cs-vector-scene").isVisible(), true, "Vector scene works without canvas or WebGL");
    await page.locator("#uxWorldFilter").fill("Japanese");
    await page.locator("#uxWorldFilter").focus();
    assert.equal(await page.locator("#uxWorldGrid .ux-world-card").count(), 1);
    assert.equal(await page.locator('#uxWorldGrid a[href="world-japanese.html"]').count(), 1);
    await screenshot(page, "without-canvas");
    await page.locator("#uxWorldFilter").fill("");
    await verifyLanguageList(page);
    await page.locator('#uxWorldGrid a[href="world-japanese.html"]').click();
    await page.waitForURL("**/world-japanese.html");
    assert.equal(await page.locator("main").isVisible(), true);
    assert.deepEqual(errors, []);
  } finally { await context.close(); }
}

async function verifyMotionAndMeasurements() {
  const { page, context, errors } = await newPage({ width: 1440, height: 1000, reducedMotion: "no-preference" });
  try {
    await open(page);
    await waitState(page, { renderer: "svg", motionEnabled: true });
    await page.waitForFunction(() => window.cosmicaUniverse.getState().renderedFrames > 2);
    const sceneCategory = page.locator('.cs-category-controls [data-category="science"]');
    const sceneBefore = { url: page.url(), category: (await readState(page)).galaxyId, box: await sceneCategory.boundingBox() };
    await sceneCategory.hover();
    await sceneCategory.focus();
    await waitState(page, { interactionPaused: true, motionEnabled: true });
    // Let the bounded hover highlight settle before checking the stopped orbit.
    await page.waitForTimeout(220);
    const heldFrame = (await readState(page)).renderedFrames;
    await page.waitForTimeout(200);
    assert.equal((await readState(page)).renderedFrames, heldFrame, "Hover/focus stops moving illustration targets without changing the user's motion preference");
    assert.equal(page.url(), sceneBefore.url);
    assert.equal((await readState(page)).galaxyId, sceneBefore.category);
    const heldBox = await sceneCategory.boundingBox();
    assert.ok(Math.abs(heldBox.x - sceneBefore.box.x) <= 1 && Math.abs(heldBox.y - sceneBefore.box.y) <= 1, "Animated scene controls retain fixed hit targets");
    await sceneCategory.evaluate((element) => element.blur());
    await page.mouse.move(0, 0);
    await waitState(page, { interactionPaused: false, motionEnabled: true });
    await page.waitForFunction((before) => window.cosmicaUniverse.getState().renderedFrames > before, heldFrame);
    const category = page.locator('.cs-galaxy-button[data-category="languages"]');
    const selectionStart = Date.now();
    await category.click();
    await waitState(page, { galaxyId: "languages", transitioning: false });
    const categorySelectionMs = Date.now() - selectionStart;
    await page.evaluate(() => scrollTo(0, 0));
    await page.mouse.move(0, 0);
    await page.locator("#uxGalaxyTitle").focus({ preventScroll: true });
    await waitState(page, { interactionPaused: false, motionEnabled: true });
    await screenshot(page, "animated-languages");
    const metrics = await page.evaluate(async () => {
      const times = [];
      const started = performance.now();
      const framesBefore = window.cosmicaUniverse.getState().renderedFrames;
      await new Promise((resolve) => {
        let last;
        const frame = (now) => {
          if (last !== undefined) times.push(now - last);
          last = now;
          if (times.length < 30) requestAnimationFrame(frame); else resolve();
        };
        requestAnimationFrame(frame);
      });
      times.sort((a, b) => a - b);
      const state = window.cosmicaUniverse.getState();
      const navigation = performance.getEntriesByType("navigation")[0];
      return {
        frameMedianMs: times[Math.floor(times.length / 2)], frameP95Ms: times[Math.floor(times.length * 0.95)],
        domContentLoadedMs: navigation.domContentLoadedEventEnd,
        heapBytes: performance.memory?.usedJSHeapSize ?? null,
        renderer: state.renderer, vector: state.vector,
        sampledRenderFps: ((state.renderedFrames - framesBefore) * 1000) / (performance.now() - started),
      };
    });
    const filterLatencyMs = await page.evaluate(async () => {
      const filter = document.getElementById("uxWorldFilter");
      const started = performance.now();
      filter.value = "Japanese";
      filter.dispatchEvent(new Event("input", { bubbles: true }));
      await new Promise(requestAnimationFrame);
      return performance.now() - started;
    });
    assert.equal(await page.locator("#uxWorldGrid .ux-world-card").count(), 1, "Filter remains responsive with animation running");
    await page.locator("#uxWorldFilter").fill("");
    await page.locator("#uxMotion").click();
    await waitState(page, { motionEnabled: false, transitioning: false });
    await page.waitForTimeout(100);
    const pausedFrame = (await readState(page)).renderedFrames;
    await page.waitForTimeout(250);
    assert.equal((await readState(page)).renderedFrames, pausedFrame, "Paused scene must stop rendering continuously");
    await page.locator("#uxMotion").click();
    await waitState(page, { motionEnabled: true });
    await page.waitForFunction((before) => window.cosmicaUniverse.getState().renderedFrames > before, pausedFrame);
    await page.emulateMedia({ reducedMotion: "reduce" });
    await waitState(page, { motionEnabled: false, transitioning: false });
    const heapBeforeRepeatedNavigation = await page.evaluate(() => performance.memory?.usedJSHeapSize ?? null);
    for (let round = 0; round < 5; round++) {
      await selectCategory(page, "science");
      await waitState(page, { transitioning: false });
      await selectCategory(page, "languages");
      await waitState(page, { transitioning: false });
      assert.equal(await page.locator(".cs-vector-scene").count(), 1, "Repeated navigation retains a single vector scene");
      assert.equal(await page.locator("#uxWorldGrid .ux-world-card").count(), 12);
    }
    const heapAfterRepeatedNavigation = await page.evaluate(() => performance.memory?.usedJSHeapSize ?? null);
    results.push({
      name: "local-browser-measurements", viewport: { width: 1440, height: 1000 }, network: "loopback; optional external requests blocked",
      browser: browserName, browserVersion: browser.version(), categorySelectionMs, filterEventToNextFrameMs: filterLatencyMs, ...metrics,
      repeatedNavigation: { rounds: 5, heapBeforeBytes: heapBeforeRepeatedNavigation, heapAfterBytes: heapAfterRepeatedNavigation, note: "Browser heap samples without forced GC; no leak or memory-budget claim." },
      note: "Diagnostic local browser measurements of the vector scene. These are not real-device or public-network performance results.",
    });
    await page.locator('#uxWorldGrid a[href="english-world.html"]').click();
    await page.waitForURL("**/english-world.html");
    await page.goBack({ waitUntil: "domcontentloaded" });
    await page.waitForFunction(() => window.cosmicaUniverse?.getState());
    await verifyRemovedHomeFeatures(page);
    assert.deepEqual(errors, []);
  } catch (error) {
    await screenshot(page, "motion-failure").catch(() => {});
    throw error;
  } finally { await context.close(); }
}

(async () => {
  preview = await startIsolatedPreview({ root, keepArtifacts: true });
  try {
    await runCase("real Express: twelve language routes, asset bytes/cache headers, guest authorization", verifyServing);
    browserServer = await browserType.launchServer({ headless: true });
    browser = await browserType.connect(browserServer.wsEndpoint());
    if (!motionOnly) {
      await runCase("no-JavaScript language links", verifyDirectLinks);
      await runCase("shared dialogs, feedback validation, footer targets and compact language navigation", verifySharedDialogUsability);
      if (!homepageOnly) {
        await runCase("mathematics model, feedback, and local save failure/recovery", verifyStudio);
        await runCase("blocked storage and unavailable audio preserve language study", verifyRestrictedCourse);
      }
      for (const options of [
        { name: "no-webgl-desktop", width: 1440, height: 1000, noWebGL: true },
        { name: "no-canvas-mobile", width: 320, height: 800, noCanvas: true },
        { name: "storage-and-canvas-denied", noCanvas: true, noStorage: true },
        { name: "renderer-bundle-missing", width: 768, height: 1024, noBundle: true },
      ]) await runCase(options.name, () => verifyFallback(options));
    }
    if (!fallbackOnly) {
      if (!motionOnly) {
        for (const viewport of [
          { width: 1440, height: 1000 }, { width: 768, height: 1024 }, { width: 390, height: 844 }, { width: 320, height: 800 },
        ]) await runCase("galaxy map and subjects " + viewport.width + "px, reduced motion", () => verifySubjectViewport(viewport));
        await runCase("galaxy switching resumes browsing state and supports keyboard navigation", verifyGalaxySwitching);
        await runCase("immediate filter edits survive pending history restoration", verifyImmediateBrowsingEdit);
        await runCase("storage denied with working renderer", verifyStorageOnly);
        await runCase("vector scene and course access without any canvas context", verifyWithoutCanvas);
      }
      await runCase("animated category selection, motion controls, responsive filtering and real course entry", verifyMotionAndMeasurements);
    }
  } finally {
    try {
      if (browserServer) await browserServer.kill();
      fs.writeFileSync(path.join(preview.outputPath, browserName + "-report.json"), JSON.stringify({
        browser: browserName,
        scope: homepageOnly ? "Homepage only; legacy course interactions and mathematics model checks excluded explicitly" : "Homepage and existing course/model journeys",
        results,
      }, null, 2) + "\n");
      console.log("Browser screenshots and report: " + preview.outputPath);
    } finally { await preview.stop(); }
  }
})().catch((error) => { console.error(error.stack || error); process.exitCode = 1; });

