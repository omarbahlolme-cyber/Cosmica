const assert = require("node:assert/strict");
const fs = require("node:fs");
const http = require("node:http");
const path = require("node:path");
const test = require("node:test");
const { chromium } = require("playwright");
const { startIsolatedPreview } = require("../lib/isolated-preview");

const root = path.resolve(__dirname, "../..");
const retirementSource = fs.readFileSync(path.join(root, "frontend/service-worker.js"), "utf8");

test("website pages have no installation metadata, UI, or worker registration", { timeout: 45000 }, async (t) => {
  const preview = await startIsolatedPreview({ root });
  let browser;
  t.after(async () => { await browser?.close(); await preview.stop(); });
  const pkg = JSON.parse(fs.readFileSync(path.join(root, "package.json"), "utf8"));
  assert.ok(!Object.keys(pkg.devDependencies || {}).some((key) => key.startsWith("@capacitor/")));
  assert.ok(!Object.keys(pkg.scripts).some((key) => key.startsWith("native:")));
  assert.equal(fs.existsSync(path.join(root, "capacitor.config.json")), false);
  assert.equal(fs.existsSync(path.join(root, "frontend/app.webmanifest")), false);

  for (const name of fs.readdirSync(path.join(root, "frontend")).filter((name) => name.endsWith(".html"))) {
    const html = fs.readFileSync(path.join(root, "frontend", name), "utf8");
    assert.doesNotMatch(html, /rel=["']manifest["']|mobile-web-app-capable|apple-touch-icon|COSMICA_STORE_LINKS/i, name);
  }
  const retired = await fetch(preview.origin + "/service-worker.js?v=old");
  assert.equal(retired.status, 200);
  assert.equal(retired.headers.get("cache-control"), "no-store");
  assert.equal(await retired.text(), retirementSource);
  const health = await (await fetch(preview.origin + "/api/health")).json();
  assert.equal(Object.hasOwn(health, "version"), false);

  browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ serviceWorkers: "allow", reducedMotion: "reduce" });
  await context.route("**/*", (route) => new URL(route.request().url()).origin === preview.origin ? route.continue() : route.abort());
  const page = await context.newPage();
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  for (const route of ["/", "/english-world.html", "/world-french.html", "/privacy.html"]) {
    await page.goto(preview.origin + route, { waitUntil: "domcontentloaded" });
    await page.waitForFunction(() => Boolean(window.cosmicaGamification));
    assert.equal(await page.locator('[class*="install-app"], link[rel="manifest"]').count(), 0, route);
    assert.equal(await page.evaluate(async () => (await navigator.serviceWorker.getRegistrations()).length), 0, route);
  }
  assert.deepEqual(errors, []);
});

test("returning browsers retire the old worker without deleting visitor work or unrelated caches", { timeout: 45000 }, async (t) => {
  let retired = false;
  let browser;
  const legacy = `self.addEventListener("install", e => e.waitUntil(self.skipWaiting()));
self.addEventListener("activate", e => e.waitUntil(self.clients.claim()));
self.addEventListener("fetch", e => { if (new URL(e.request.url).pathname === "/legacy-probe") e.respondWith(new Response("old worker")); });`;
  const server = http.createServer((req, res) => {
    res.setHeader("Cache-Control", "no-store");
    if (req.url.split("?")[0] === "/service-worker.js") {
      res.setHeader("Content-Type", "application/javascript");
      res.end(retired ? retirementSource : legacy);
    } else if (req.url === "/legacy-probe") {
      res.end("network");
    } else {
      res.setHeader("Content-Type", "text/html; charset=utf-8");
      res.end("<!doctype html><html lang=en><title>Isolated worker retirement fixture</title><body>Website</body></html>");
    }
  });
  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  t.after(async () => {
    await browser?.close();
    await new Promise((resolve) => server.close(resolve));
  });
  const origin = "http://127.0.0.1:" + server.address().port;
  browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ serviceWorkers: "allow" });
  const page = await context.newPage();
  await page.goto(origin);
  await page.evaluate(async () => {
    await navigator.serviceWorker.register("/service-worker.js");
    await navigator.serviceWorker.ready;
    localStorage.setItem("visitor-work-fixture", "preserved");
    await caches.open("cosmica-pwa-vfixture:shell");
    await caches.open("unrelated-cache-fixture");
  });
  await page.reload();
  assert.equal(await page.evaluate(() => fetch("/legacy-probe").then((r) => r.text())), "old worker");
  retired = true;
  await page.evaluate(async () => { await (await navigator.serviceWorker.getRegistration()).update(); });
  await page.evaluate(async () => {
    const deadline = performance.now() + 10000;
    while (performance.now() < deadline) {
      const registrations = await navigator.serviceWorker.getRegistrations();
      const names = await caches.keys();
      if (!registrations.length && !names.some((name) => name.startsWith("cosmica-pwa-"))) return;
      await new Promise((resolve) => setTimeout(resolve, 20));
    }
    throw new Error("Worker retirement and owned-cache removal did not complete");
  });
  assert.equal(await page.evaluate(() => fetch("/legacy-probe").then((r) => r.text())), "network");
  assert.equal(await page.evaluate(() => localStorage.getItem("visitor-work-fixture")), "preserved");
  const cachesLeft = await page.evaluate(() => caches.keys());
  assert.ok(cachesLeft.includes("unrelated-cache-fixture"));
  assert.ok(!cachesLeft.some((name) => name.startsWith("cosmica-pwa-")), JSON.stringify(cachesLeft));
});
