const assert = require("node:assert/strict");
const crypto = require("node:crypto");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const test = require("node:test");
const {
  ASSET_PATHS,
  BUILD_INPUT_PATHS,
  MANIFEST_PATH,
  PAGE_ASSETS,
  RENDERER_PATH,
  checkUniverseAssets,
} = require("../lib/universe-assets");

const PROJECT_ROOT = path.resolve(__dirname, "../..");
const TEMP_ROOT = fs.realpathSync(os.tmpdir());
const FIXTURE_PREFIX = "cosmica-universe-assets-";
const ownedFixtures = new Set();
// Explicit public-file inventory: never copy account stores or environment files.
const FIXTURE_FILES = [
  ...new Set([
    ...ASSET_PATHS.map((assetPath) => `frontend/${assetPath}`),
    ...BUILD_INPUT_PATHS,
    ...Object.keys(PAGE_ASSETS),
    MANIFEST_PATH,
    "package-lock.json",
  ]),
];

const removeFixture = (fixtureRoot) => {
  const resolved = fs.realpathSync(fixtureRoot);
  assert.ok(ownedFixtures.has(resolved), "Cleanup requires an owned fixture");
  assert.equal(path.dirname(resolved), TEMP_ROOT, "Fixture must remain directly under OS temp");
  assert.ok(path.basename(resolved).startsWith(FIXTURE_PREFIX));
  assert.equal(fs.lstatSync(fixtureRoot).isSymbolicLink(), false);
  fs.rmSync(resolved, { recursive: true });
  ownedFixtures.delete(resolved);
};

const createFixture = (t) => {
  const fixtureRoot = fs.realpathSync(fs.mkdtempSync(path.join(TEMP_ROOT, FIXTURE_PREFIX)));
  ownedFixtures.add(fixtureRoot);
  t.after(() => removeFixture(fixtureRoot));
  for (const relativePath of FIXTURE_FILES) {
    const target = path.join(fixtureRoot, relativePath);
    fs.mkdirSync(path.dirname(target), { recursive: true });
    fs.copyFileSync(path.join(PROJECT_ROOT, relativePath), target);
  }
  return fixtureRoot;
};

// Include metadata and directory entries to catch rewrites and newly created files,
// even if an attempted write leaves identical content behind.
const snapshotTree = (root, relativePath = "") => {
  const records = [];
  for (const name of fs.readdirSync(path.join(root, relativePath)).sort()) {
    const entryPath = path.join(relativePath, name);
    const absolutePath = path.join(root, entryPath);
    const stat = fs.statSync(absolutePath, { bigint: true });
    if (stat.isDirectory()) {
      records.push([entryPath, "directory", String(stat.mtimeNs)]);
      records.push(...snapshotTree(root, entryPath));
    } else {
      records.push([
        entryPath,
        String(stat.size),
        String(stat.mtimeNs),
        crypto.createHash("sha256").update(fs.readFileSync(absolutePath)).digest("hex"),
      ]);
    }
  }
  return records;
};

const checkWithoutWrites = (fixtureRoot) => {
  const before = snapshotTree(fixtureRoot);
  let problems;
  try {
    problems = checkUniverseAssets(fixtureRoot);
  } finally {
    assert.deepEqual(
      snapshotTree(fixtureRoot),
      before,
      "Verification must never change its fixture"
    );
  }
  return problems;
};

test("current public assets and page versions pass without writes", (t) => {
  const fixture = createFixture(t);
  assert.deepEqual(checkWithoutWrites(fixture), []);
});

test("changed renderer source is rejected without rewriting artifacts", (t) => {
  const fixture = createFixture(t);
  fs.appendFileSync(
    path.join(fixture, "frontend/ui/cosmic-scene.js"),
    '\nthrow new Error("Changed scene regression fixture");\n'
  );
  assert.ok(checkWithoutWrites(fixture).some((problem) => problem.includes(MANIFEST_PATH)));
});

test("changed subject star artwork is rejected without rewriting artifacts", (t) => {
  const fixture = createFixture(t);
  fs.appendFileSync(
    path.join(fixture, "frontend/ui/subject-star-clusters.js"),
    '\n// Changed subject star artwork regression fixture\n'
  );
  assert.ok(checkWithoutWrites(fixture).some((problem) => problem.includes(MANIFEST_PATH)));
});

test("changed space backdrop invalidates the renderer manifest without writes", (t) => {
  const fixture = createFixture(t);
  fs.appendFileSync(
    path.join(fixture, "frontend/ui/space-backdrop.js"),
    '\n// Changed space backdrop regression fixture\n'
  );
  assert.ok(checkWithoutWrites(fixture).some((problem) => problem.includes(MANIFEST_PATH)));
});

test("changed subject-browser styles invalidate the manifest and cached page URL", (t) => {
  const fixture = createFixture(t);
  fs.appendFileSync(
    path.join(fixture, "frontend/ui/observatory.css"),
    "\n.home-hero { border-color: transparent; }\n"
  );
  const problems = checkWithoutWrites(fixture);
  assert.ok(problems.some((problem) => problem.includes(MANIFEST_PATH)));
  assert.ok(problems.some((problem) => problem.includes("frontend/index.html has stale")));
});

test("changed UI script invalidates its cached page URL", (t) => {
  const fixture = createFixture(t);
  fs.appendFileSync(
    path.join(fixture, "frontend/ui/universe.js"),
    "\nwindow.__assetRegression = true;\n"
  );
  const problems = checkWithoutWrites(fixture);
  assert.ok(problems.some((problem) => problem.includes(MANIFEST_PATH)));
  assert.ok(problems.some((problem) => problem.includes("frontend/index.html has stale")));
});

test("stale HTML query is rejected even when every asset is unchanged", (t) => {
  const fixture = createFixture(t);
  const pagePath = path.join(fixture, "frontend/index.html");
  const source = fs.readFileSync(pagePath, "utf8");
  const modified = source.replace(/(ui\/universe\.js\?v=)[^"']+/, "$1stale-version");
  assert.notEqual(modified, source, "Fixture must actually alter the script URL");
  fs.writeFileSync(pagePath, modified);
  assert.deepEqual(checkWithoutWrites(fixture), [
    "frontend/index.html has stale spatial/studio asset versions",
  ]);
});

test("corrupt served renderer is rejected without repairing it", (t) => {
  const fixture = createFixture(t);
  fs.appendFileSync(
    path.join(fixture, "frontend", RENDERER_PATH),
    "\n! corrupt renderer fixture\n"
  );
  const problems = checkWithoutWrites(fixture);
  assert.ok(problems.some((problem) => problem.includes(MANIFEST_PATH)));
  assert.ok(problems.some((problem) => problem.includes("frontend/index.html has stale")));
});
