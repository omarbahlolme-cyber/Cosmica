const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs/promises");
const os = require("node:os");
const path = require("node:path");
const { startIsolatedPreview } = require("../lib/isolated-preview");

const repositoryRoot = path.resolve(__dirname, "../..");
const syntheticServer = `
const fs = require("node:fs");
const path = require("node:path");
const http = require("node:http");
require(${JSON.stringify(path.join(repositoryRoot, "node_modules/dotenv"))}).config();
const auth = process.env.AUTH_DATA_ROOT;
fs.mkdirSync(auth, { recursive: true });
fs.writeFileSync(path.join(auth, "accounts.json"), JSON.stringify({ users: {}, sessions: {} }));
const server = http.createServer((request, response) => {
  response.setHeader("Content-Type", "application/json");
  if (request.url === "/api/health") return response.end(JSON.stringify({ status: "ok" }));
  response.end(JSON.stringify({ environment: process.env, cwd: process.cwd(), address: server.address(), pid: process.pid }));
});
server.listen(Number(process.env.PORT));
`;

async function fixture(t, source = syntheticServer) {
  const tempBase = await fs.realpath(os.tmpdir());
  const root = await fs.mkdtemp(path.join(tempBase, "cosmica-preview-fixture-"));
  t.after(async () => {
    const realRoot = await fs.realpath(root);
    assert.equal(path.dirname(realRoot), tempBase);
    assert.match(path.basename(realRoot), /^cosmica-preview-fixture-[a-zA-Z0-9]+$/);
    await fs.rm(realRoot, { recursive: true, force: true });
  });
  await fs.writeFile(path.join(root, "server.js"), source);
  await fs.writeFile(path.join(root, ".env"), "SYNTHETIC_REPO_SECRET=should-never-be-loaded\n");
  await fs.mkdir(path.join(root, "backend/data"), { recursive: true });
  await fs.writeFile(
    path.join(root, "backend/data/accounts.json"),
    '{"users":{"synthetic-existing-user":{}}}'
  );
  return root;
}

test("starts a genuine owned loopback process with a fresh environment and store", async (t) => {
  const root = await fixture(t);
  const inherited = {
    NODE_OPTIONS: "--require nonexistent-synthetic-module",
    NODE_PATH: "synthetic-untrusted-node-path",
    DATABASE_URL: "postgres://synthetic-do-not-use",
    AUTH_DATA_ROOT: path.join(root, "backend/data"),
    AUTH_STORE_BACKEND: "postgres",
    OPENAI_API_KEY: "synthetic-do-not-use",
    GOOGLE_APPLICATION_CREDENTIALS: "synthetic-do-not-use",
    GOOGLE_TTS_ENABLED: "true",
    SIGNUP_WEBHOOK_URL: "https://synthetic.invalid",
    ERROR_WEBHOOK_URL: "https://synthetic.invalid",
    SMTP_PASS: "synthetic-do-not-use",
  };
  const previous = Object.fromEntries(Object.keys(inherited).map((key) => [key, process.env[key]]));
  for (const [key, value] of Object.entries(inherited)) process.env[key] = value;
  let preview;
  try {
    preview = await startIsolatedPreview({ root });
  } finally {
    for (const [key, value] of Object.entries(previous)) {
      if (value === undefined) delete process.env[key];
      else process.env[key] = value;
    }
  }
  t.after(() => preview.stop());
  const inspection = await (await fetch(`${preview.origin}/inspection`)).json();
  assert.equal(inspection.address.address, "127.0.0.1");
  assert.equal(inspection.address.port, Number(new URL(preview.origin).port));
  assert.equal(inspection.cwd, preview.tempRoot);
  assert.equal(inspection.environment.NODE_ENV, "test");
  assert.equal(inspection.environment.PUBLIC_APP_ORIGIN, preview.origin);
  assert.equal(inspection.environment.AUTH_DATA_ROOT, path.join(preview.tempRoot, "auth"));
  assert.equal(inspection.environment.AUTH_STORE_BACKEND, "file");
  assert.equal(inspection.environment.GOOGLE_TTS_ENABLED, "false");
  for (const key of Object.keys(inherited).filter(
    (key) => !["AUTH_DATA_ROOT", "AUTH_STORE_BACKEND", "GOOGLE_TTS_ENABLED"].includes(key)
  )) {
    assert.equal(inspection.environment[key], undefined, `Inherited ${key} reached preview`);
  }
  assert.equal(inspection.environment.SYNTHETIC_REPO_SECRET, undefined);
  assert.equal(inspection.environment.HOME, undefined);
  assert.equal(inspection.environment.USERPROFILE, undefined);
  const store = JSON.parse(
    await fs.readFile(path.join(preview.tempRoot, "auth/accounts.json"), "utf8")
  );
  assert.deepEqual(store, { users: {}, sessions: {} });
  assert.match(
    await fs.readFile(path.join(root, "backend/data/accounts.json"), "utf8"),
    /synthetic-existing-user/
  );
  assert.equal(path.dirname(preview.outputPath), preview.tempRoot);
  await preview.stop();
  await assert.rejects(fs.stat(preview.tempRoot), { code: "ENOENT" });
  assert.match(await fs.readFile(path.join(root, ".env"), "utf8"), /SYNTHETIC_REPO_SECRET/);
  assert.throws(() => process.kill(inspection.pid, 0), { code: "ESRCH" });
  await preview.stop();
});

test("retains only requested artifacts and installs one set of signal handlers", async (t) => {
  const root = await fixture(t);
  const signals = ["SIGINT", "SIGTERM", "SIGHUP", "exit"];
  const before = signals.map((signal) => process.listenerCount(signal));
  const first = await startIsolatedPreview({ root, keepArtifacts: true });
  const second = await startIsolatedPreview({ root });
  t.after(() => Promise.all([first.stop(), second.stop()]));
  assert.deepEqual(
    signals.map((signal) => process.listenerCount(signal)),
    before.map((count) => count + 1)
  );
  await fs.writeFile(path.join(first.outputPath, "synthetic-report.json"), '{"passed":true}');
  await Promise.all([first.stop(), first.stop(), second.stop()]);
  assert.deepEqual(await fs.readdir(first.tempRoot), ["output"]);
  assert.equal(
    await fs.readFile(path.join(first.outputPath, "synthetic-report.json"), "utf8"),
    '{"passed":true}'
  );
  assert.deepEqual(
    signals.map((signal) => process.listenerCount(signal)),
    before
  );
  // Explicitly remove this test's retained artifacts after checking its bound.
  const realRoot = await fs.realpath(first.tempRoot);
  assert.equal(path.dirname(realRoot), await fs.realpath(os.tmpdir()));
  assert.match(path.basename(realRoot), /^cosmica-isolated-preview-[a-zA-Z0-9]+$/);
  await fs.rm(realRoot, { recursive: true, force: true });
});

test("rejects environment/storage override interfaces", async () => {
  await assert.rejects(startIsolatedPreview({ env: {} }), /only root and keepArtifacts/);
  await assert.rejects(
    startIsolatedPreview({ outputPath: "synthetic" }),
    /only root and keepArtifacts/
  );
  await assert.rejects(startIsolatedPreview({ keepArtifacts: "true" }), /must be a boolean/);
});

test("startup exit returns bounded diagnostics and cleans its owned directory", async (t) => {
  const root = await fixture(
    t,
    'console.error("synthetic startup failure"); console.error("x".repeat(50000)); process.exit(23);'
  );
  let failure;
  try {
    await startIsolatedPreview({ root });
    assert.fail("Preview unexpectedly started");
  } catch (error) {
    failure = error;
  }
  assert.match(failure.message, /code 23/);
  assert.ok(failure.message.length < 34000, "Startup diagnostics exceeded bound");
  await assert.rejects(fs.stat(failure.tempRoot), { code: "ENOENT" });
});

test("cleanup rejects changed ownership instead of recursively removing the target", async (t) => {
  const root = await fixture(t);
  const preview = await startIsolatedPreview({ root });
  const inspection = await (await fetch(`${preview.origin}/inspection`)).json();
  await fs.writeFile(path.join(preview.tempRoot, ".preview-owner"), "synthetic-tamper");
  await assert.rejects(preview.stop(), /ownership marker/);
  assert.throws(() => process.kill(inspection.pid, 0), { code: "ESRCH" });
  assert.ok((await fs.stat(preview.tempRoot)).isDirectory());
  const realRoot = await fs.realpath(preview.tempRoot);
  assert.equal(path.dirname(realRoot), await fs.realpath(os.tmpdir()));
  assert.match(path.basename(realRoot), /^cosmica-isolated-preview-[a-zA-Z0-9]+$/);
  await fs.rm(realRoot, { recursive: true, force: true });
});

test("unexpected exit terminates lifecycle ownership and cleans temporary files", async (t) => {
  const root = await fixture(t, `${syntheticServer}\nsetTimeout(() => process.exit(17), 500);`);
  const preview = await startIsolatedPreview({ root });
  const inspection = await (await fetch(`${preview.origin}/inspection`)).json();
  const diagnostic = [];
  const originalError = console.error;
  console.error = (message) => diagnostic.push(message);
  try {
    const deadline = Date.now() + 3000;
    while (Date.now() < deadline) {
      try {
        await fs.stat(preview.tempRoot);
      } catch (error) {
        if (error.code === "ENOENT") break;
        throw error;
      }
      await new Promise((resolve) => setTimeout(resolve, 25));
    }
    await preview.stop();
  } finally {
    console.error = originalError;
  }
  assert.match(diagnostic.join("\n"), /code 17/);
  assert.throws(() => process.kill(inspection.pid, 0), { code: "ESRCH" });
  await assert.rejects(fs.stat(preview.tempRoot), { code: "ENOENT" });
});

test(
  "startup timeout bounds a health response that never finishes",
  { timeout: 22000 },
  async (t) => {
    const root = await fixture(
      t,
      `
const http = require("node:http");
http.createServer((request, response) => {
  response.writeHead(200, { "Content-Type": "application/json" });
  const timer = setInterval(() => response.write(" "), 50);
  response.on("close", () => clearInterval(timer));
}).listen(Number(process.env.PORT));
`
    );
    const startedAt = Date.now();
    let failure;
    try {
      await startIsolatedPreview({ root, keepArtifacts: true });
      assert.fail("Unfinished health response was accepted");
    } catch (error) {
      failure = error;
    }
    assert.match(failure.message, /did not become healthy/);
    assert.ok(Date.now() - startedAt < 20000, "Health response caused an unbounded wait");
    assert.deepEqual(await fs.readdir(failure.tempRoot), ["output"]);
    const realRoot = await fs.realpath(failure.tempRoot);
    assert.equal(path.dirname(realRoot), await fs.realpath(os.tmpdir()));
    assert.match(path.basename(realRoot), /^cosmica-isolated-preview-[a-zA-Z0-9]+$/);
    await fs.rm(realRoot, { recursive: true, force: true });
  }
);
