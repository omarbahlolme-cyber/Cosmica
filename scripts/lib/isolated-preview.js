/*
 * Safe local preview of the real Express application, with no inherited app config.
 *
 * const preview = await startIsolatedPreview({ root, keepArtifacts: true });
 * try { // use preview.origin and write reports under preview.outputPath
 * } finally { await preview.stop(); }
 *
 * root defaults to this repository. There are intentionally no env, port, auth,
 * or output-path overrides. Each run uses a new empty temporary working directory;
 * dotenv therefore cannot read the repository's .env. keepArtifacts retains only
 * output/ after shutdown, including after startup failure (error.outputPath).
 * stop() is idempotent and has bounded process-termination waits. A rejected stop
 * leaves any unverified directory intact. This runs trusted application code;
 * it is not a sandbox for an untrusted project.
 */
const fs = require("node:fs/promises");
const path = require("node:path");
const os = require("node:os");
const net = require("node:net");
const http = require("node:http");
const crypto = require("node:crypto");
const { spawn } = require("node:child_process");

const TEMP_PREFIX = "cosmica-isolated-preview-";
const STARTUP_TIMEOUT_MS = 15000;
const LOG_LIMIT_BYTES = 32768;
const activePreviews = new Set();
const signalNumbers = { SIGINT: 2, SIGTERM: 15, SIGHUP: 1 };
let signalHandlers = null;
let handlingSignal = false;

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

function installSignalHandlers() {
  if (signalHandlers) return;
  signalHandlers = new Map();
  for (const [signal, number] of Object.entries(signalNumbers)) {
    const handler = () => {
      if (handlingSignal) return;
      handlingSignal = true;
      void Promise.allSettled([...activePreviews].map((preview) => preview.stop())).then(() => {
        process.exit(128 + number);
      });
    };
    signalHandlers.set(signal, handler);
    process.on(signal, handler);
  }
  const exitHandler = () => {
    for (const preview of activePreviews) {
      if (!preview.exited) preview.child.kill("SIGKILL");
    }
  };
  signalHandlers.set("exit", exitHandler);
  process.on("exit", exitHandler);
}

function unregisterPreview(preview) {
  activePreviews.delete(preview);
  if (activePreviews.size || !signalHandlers) return;
  for (const [signal, handler] of signalHandlers) process.removeListener(signal, handler);
  signalHandlers = null;
}

function childEnvironment(tempRoot, origin, port) {
  const environment = Object.create(null);
  // Absolute node/server paths need no PATH, HOME, NODE_OPTIONS, NODE_PATH, or
  // provider/DB/webhook variables. These Windows launch variables are OS-only.
  for (const name of ["SystemRoot", "WINDIR", "ComSpec"]) {
    const key = Object.keys(process.env).find(
      (candidate) => candidate.toLowerCase() === name.toLowerCase()
    );
    if (key && process.env[key]) environment[name] = process.env[key];
  }
  return Object.assign(environment, {
    NODE_ENV: "test",
    PORT: String(port),
    PUBLIC_APP_ORIGIN: origin,
    AUTH_STORE_BACKEND: "file",
    AUTH_DATA_ROOT: path.join(tempRoot, "auth"),
    GOOGLE_TTS_ENABLED: "false",
    TEMP: tempRoot,
    TMP: tempRoot,
    TMPDIR: tempRoot,
    TZ: "UTC",
  });
}

async function availableLoopbackPort() {
  const server = net.createServer();
  return new Promise((resolve, reject) => {
    server.once("error", reject);
    server.listen({ host: "127.0.0.1", port: 0, exclusive: true }, () => {
      const { port } = server.address();
      server.close((error) => (error ? reject(error) : resolve(port)));
    });
  });
}

function loopbackPreload(port, token) {
  // The application currently calls app.listen(port) without a host. Force that
  // genuine listener to loopback and attest its PID/address over private IPC.
  return `"use strict";
// libuv may add Windows profile variables even with an explicit spawn env.
const allowedEnvironment = new Set(["SYSTEMROOT", "WINDIR", "COMSPEC", "NODE_ENV", "PORT", "PUBLIC_APP_ORIGIN", "AUTH_STORE_BACKEND", "AUTH_DATA_ROOT", "GOOGLE_TTS_ENABLED", "TEMP", "TMP", "TMPDIR", "TZ"]);
for (const name of Object.keys(process.env)) {
  if (!allowedEnvironment.has(name.toUpperCase())) delete process.env[name];
}
const net = require("node:net");
const originalListen = net.Server.prototype.listen;
const expectedPort = ${port};
net.Server.prototype.listen = function (...args) {
  const first = args[0];
  const options = first && typeof first === "object" ? { ...first } : { port: first };
  if (Number(options.port) !== expectedPort || options.path || options.fd || options.handle) {
    throw new Error("Isolated preview permits only its assigned loopback listener");
  }
  options.port = expectedPort;
  options.host = "127.0.0.1";
  options.exclusive = true;
  const callback = typeof args.at(-1) === "function" ? args.at(-1) : undefined;
  this.once("listening", () => {
    const address = this.address();
    if (process.send) process.send({ type: "isolated-preview-listening", token: ${JSON.stringify(token)}, pid: process.pid, ...address });
  });
  return callback ? originalListen.call(this, options, callback) : originalListen.call(this, options);
};
`;
}

async function verifyOwnedRoot(preview) {
  let stat;
  try {
    stat = await fs.lstat(preview.tempRoot);
  } catch (error) {
    if (error.code === "ENOENT") return false;
    throw error;
  }
  const realTarget = await fs.realpath(preview.tempRoot);
  const relative = path.relative(preview.tempBase, realTarget);
  if (
    !stat.isDirectory() ||
    stat.isSymbolicLink() ||
    realTarget !== preview.tempRoot ||
    path.dirname(realTarget) !== preview.tempBase ||
    relative.startsWith("..") ||
    path.isAbsolute(relative) ||
    !/^cosmica-isolated-preview-[a-zA-Z0-9]+$/.test(path.basename(realTarget)) ||
    stat.dev !== preview.identity.dev ||
    stat.ino !== preview.identity.ino
  ) {
    throw new Error(
      "Refusing cleanup: isolated preview root no longer matches its owned OS-temp directory"
    );
  }
  const markerPath = path.join(realTarget, ".preview-owner");
  const marker = await fs.lstat(markerPath);
  if (
    !marker.isFile() ||
    marker.isSymbolicLink() ||
    marker.size > 128 ||
    (await fs.readFile(markerPath, "utf8")) !== preview.token
  ) {
    throw new Error("Refusing cleanup: isolated preview ownership marker does not match");
  }
  return true;
}

async function cleanupFiles(preview) {
  if (!(await verifyOwnedRoot(preview))) return;
  if (!preview.keepArtifacts) {
    await fs.rm(preview.tempRoot, { recursive: true, force: true, maxRetries: 3, retryDelay: 100 });
    return;
  }
  // Preserve reports/screenshots only. rm does not follow directory symlinks.
  for (const entry of await fs.readdir(preview.tempRoot)) {
    if (entry === "output") continue;
    const target = path.join(preview.tempRoot, entry);
    if (path.dirname(target) !== preview.tempRoot)
      throw new Error("Invalid preview cleanup target");
    const stat = await fs.lstat(target);
    if (stat.isSymbolicLink()) {
      await fs.unlink(target);
      continue;
    }
    const relative = path.relative(preview.tempRoot, await fs.realpath(target));
    if (!relative || relative.startsWith("..") || path.isAbsolute(relative)) {
      throw new Error("Refusing cleanup outside the owned preview directory");
    }
    await fs.rm(target, {
      recursive: stat.isDirectory(),
      force: true,
      maxRetries: 3,
      retryDelay: 100,
    });
  }
}

function checkHealth(origin) {
  return new Promise((resolve) => {
    let settled = false;
    let timer;
    const finish = (healthy) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      resolve(healthy);
    };
    const request = http.get(`${origin}/api/health`, { agent: false }, (response) => {
      let body = "";
      response.setEncoding("utf8");
      response.on("data", (chunk) => {
        body += chunk;
        if (body.length > 16384) {
          request.destroy();
          finish(false);
        }
      });
      response.on("error", () => finish(false));
      response.on("aborted", () => finish(false));
      response.on("end", () => {
        try {
          finish(response.statusCode === 200 && JSON.parse(body).status === "ok");
        } catch {
          finish(false);
        }
      });
    });
    timer = setTimeout(() => {
      request.destroy();
      finish(false);
    }, 750);
    request.on("error", () => finish(false));
  });
}

function waitForExit(preview, timeout) {
  return new Promise((resolve) => {
    const timer = setTimeout(resolve, timeout);
    void preview.exitPromise.then(() => {
      clearTimeout(timer);
      resolve();
    });
  });
}

async function terminateChild(preview) {
  if (preview.exited) return;
  preview.child.kill("SIGTERM");
  await waitForExit(preview, 1000);
  if (!preview.exited) {
    preview.child.kill("SIGKILL");
    await waitForExit(preview, 3000);
  }
  if (!preview.exited) {
    throw new Error(
      "Could not confirm owned preview process terminated; temporary directory retained"
    );
  }
}

async function startIsolatedPreview(options = {}) {
  if (
    !options ||
    typeof options !== "object" ||
    Array.isArray(options) ||
    Object.keys(options).some((key) => !["root", "keepArtifacts"].includes(key))
  ) {
    throw new TypeError("Preview options support only root and keepArtifacts");
  }
  if (options.keepArtifacts !== undefined && typeof options.keepArtifacts !== "boolean") {
    throw new TypeError("keepArtifacts must be a boolean");
  }
  const root = await fs.realpath(path.resolve(options.root || path.join(__dirname, "../..")));
  const serverPath = await fs.realpath(path.join(root, "server.js"));
  if (path.dirname(serverPath) !== root || !(await fs.stat(serverPath)).isFile()) {
    throw new Error("Preview requires a server.js file in the selected project root");
  }
  const tempBase = await fs.realpath(os.tmpdir());
  const tempRoot = await fs.mkdtemp(path.join(tempBase, TEMP_PREFIX));
  const outputPath = path.join(tempRoot, "output");
  const token = crypto.randomBytes(32).toString("hex");
  const preview = {
    tempBase,
    tempRoot,
    outputPath,
    token,
    identity: await fs.lstat(tempRoot),
    keepArtifacts: options.keepArtifacts === true,
    child: null,
    exited: false,
    stopping: false,
    starting: true,
    ownershipConfirmed: false,
    startupLogs: Buffer.alloc(0),
  };
  let stopPromise;
  preview.stop = () => {
    if (stopPromise) return stopPromise;
    preview.stopping = true;
    stopPromise = (async () => {
      if (preview.child) await terminateChild(preview);
      unregisterPreview(preview);
      if (preview.child?.connected) preview.child.disconnect();
      await cleanupFiles(preview);
    })();
    return stopPromise;
  };
  try {
    await fs.writeFile(path.join(tempRoot, ".preview-owner"), token, { flag: "wx", mode: 0o600 });
    await fs.mkdir(outputPath);
    await fs.mkdir(path.join(tempRoot, "auth"));
    const preloadPath = path.join(tempRoot, "loopback-preload.cjs");
    const port = await availableLoopbackPort();
    const origin = `http://127.0.0.1:${port}`;
    await fs.writeFile(preloadPath, loopbackPreload(port, token), { flag: "wx", mode: 0o600 });
    const child = spawn(process.execPath, ["--require", preloadPath, serverPath], {
      cwd: tempRoot,
      env: childEnvironment(tempRoot, origin, port),
      stdio: ["ignore", "pipe", "pipe", "ipc"],
      windowsHide: true,
      shell: false,
    });
    preview.child = child;
    preview.exitPromise = new Promise((resolve) => {
      const finish = (error) => {
        if (preview.exited) return;
        preview.exited = true;
        preview.exitError = error;
        resolve();
        if (!preview.starting && !preview.stopping) {
          console.error(
            `[isolated-preview] ${error.message}\n${preview.startupLogs.toString("utf8")}`
          );
          void preview
            .stop()
            .catch((cleanupError) => console.error(`[isolated-preview] ${cleanupError.message}`));
        }
      };
      child.once("error", (error) => finish(error));
      child.once("exit", (code, signal) =>
        finish(new Error(`Owned preview exited (${signal || `code ${code}`})`))
      );
    });
    const collectLogs = (chunk) => {
      if (!preview.starting) return;
      preview.startupLogs = Buffer.concat([preview.startupLogs, chunk]).subarray(-LOG_LIMIT_BYTES);
    };
    child.stdout.on("data", collectLogs);
    child.stderr.on("data", collectLogs);
    child.on("message", (message) => {
      if (
        message?.type === "isolated-preview-listening" &&
        message.token === token &&
        message.pid === child.pid &&
        message.address === "127.0.0.1" &&
        message.port === port
      ) {
        preview.ownershipConfirmed = true;
      }
    });
    activePreviews.add(preview);
    installSignalHandlers();
    const deadline = Date.now() + STARTUP_TIMEOUT_MS;
    while (Date.now() < deadline) {
      if (preview.exited) throw preview.exitError;
      if (preview.ownershipConfirmed && (await checkHealth(origin)) && !preview.exited) {
        process.kill(child.pid, 0);
        preview.starting = false;
        return { origin, tempRoot, outputPath, stop: preview.stop };
      }
      await Promise.race([delay(75), preview.exitPromise]);
    }
    throw new Error(`Owned preview did not become healthy within ${STARTUP_TIMEOUT_MS}ms`);
  } catch (cause) {
    let cleanupFailure = "";
    try {
      await preview.stop();
    } catch (error) {
      cleanupFailure = `\nCleanup: ${error.message}`;
    }
    const logs = preview.startupLogs.toString("utf8").trim();
    const error = new Error(
      `Isolated preview failed: ${cause.message}${cleanupFailure}${logs ? `\nStartup logs (bounded):\n${logs}` : ""}`,
      { cause }
    );
    error.tempRoot = tempRoot;
    error.outputPath = outputPath;
    throw error;
  }
}

module.exports = { startIsolatedPreview };
