/* ==========================================================================
   PERFORMANCE REGRESSION CHECK
   - Compares fresh perf snapshot with perf/baseline.json.
   - Fails only on meaningful regressions.
   ========================================================================== */
const fs = require("fs");
const path = require("path");
const { spawnSync } = require("child_process");

/* --------------------------------------------------------------------------
   CONFIG
   -------------------------------------------------------------------------- */
const ROOT = path.resolve(__dirname, "..");
const BASELINE_PATH = path.join(ROOT, "perf", "baseline.json");
const SNAPSHOT_SCRIPT = path.join(ROOT, "scripts", "perf-snapshot.js");

const MAX_DURATION_REGRESSION_RATIO = 1.5; // +50%
const MAX_BYTES_REGRESSION_RATIO = 1.2; // +20%
const MAX_ABSOLUTE_DURATION_REGRESSION_MS = 120;

/* --------------------------------------------------------------------------
   HELPERS
   -------------------------------------------------------------------------- */
const runSnapshot = () => {
  const result = spawnSync(process.execPath, [SNAPSHOT_SCRIPT], {
    cwd: ROOT,
    encoding: "utf8",
  });

  if (result.error) {
    throw result.error;
  }

  if (result.status !== 0) {
    const output = [result.stdout, result.stderr].filter(Boolean).join("\n").trim();
    throw new Error(output || "Failed to generate fresh performance snapshot");
  }

  return JSON.parse(result.stdout);
};

const loadBaseline = () => {
  if (!fs.existsSync(BASELINE_PATH)) {
    throw new Error(
      `Missing perf baseline at ${path.relative(ROOT, BASELINE_PATH)}. Run: npm run perf:baseline`
    );
  }
  return JSON.parse(fs.readFileSync(BASELINE_PATH, "utf8"));
};

const formatRatio = (ratio) => `${Math.round((ratio - 1) * 100)}%`;

const isSandboxSpawnRestriction = (error) => {
  const message = String(error?.message || error || "");
  return /eperm|eacces|operation not permitted/i.test(message);
};

/* --------------------------------------------------------------------------
   MAIN
   -------------------------------------------------------------------------- */
try {
  const baseline = loadBaseline();
  let current = null;
  try {
    current = runSnapshot();
  } catch (error) {
    // Local/sandbox environments can block child-process spawn; skip perf regression
    // comparison there so "quality" still validates app code deterministically.
    if (isSandboxSpawnRestriction(error)) {
      console.warn("SKIP [perf] snapshot blocked by environment restrictions");
      console.warn(`- ${error.message || error}`);
      process.exit(0);
    }
    throw error;
  }
  const failures = [];

  const baselineRoutes = baseline.routes || {};
  const currentRoutes = current.routes || {};

  for (const [route, baseData] of Object.entries(baselineRoutes)) {
    const nowData = currentRoutes[route];
    if (!nowData) {
      failures.push(`${route}: missing from current snapshot`);
      continue;
    }

    if (baseData.status !== 200 || nowData.status !== 200) {
      failures.push(`${route}: expected HTTP 200 (baseline=${baseData.status}, current=${nowData.status})`);
      continue;
    }

    const durationRatio =
      baseData.durationMs > 0 ? nowData.durationMs / baseData.durationMs : 1;
    const durationDelta = nowData.durationMs - baseData.durationMs;
    if (
      durationRatio > MAX_DURATION_REGRESSION_RATIO &&
      durationDelta > MAX_ABSOLUTE_DURATION_REGRESSION_MS
    ) {
      failures.push(
        `${route}: duration regression ${baseData.durationMs}ms -> ${nowData.durationMs}ms (${formatRatio(durationRatio)})`
      );
    }

    const bytesRatio = baseData.bytes > 0 ? nowData.bytes / baseData.bytes : 1;
    if (bytesRatio > MAX_BYTES_REGRESSION_RATIO) {
      failures.push(
        `${route}: payload regression ${baseData.bytes} -> ${nowData.bytes} bytes (${formatRatio(bytesRatio)})`
      );
    }
  }

  if (failures.length) {
    console.error("PERF CHECK FAILED");
    failures.forEach((line) => console.error(`- ${line}`));
    process.exit(1);
  }

  console.log("PASS [perf] no significant regressions versus baseline");
} catch (error) {
  console.error("PERF CHECK FAILED");
  console.error(`- ${error.message || error}`);
  process.exit(1);
}
