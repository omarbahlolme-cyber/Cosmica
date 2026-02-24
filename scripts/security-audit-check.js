/* ==========================================================================
   SECURITY AUDIT CHECK (WITH TARGETED UPSTREAM ALLOWLIST)
   - Runs npm audit --json.
   - Fails on any moderate+ vulnerability except a known unresolved upstream chain
     from google-gax/rimraf/glob/minimatch (GHSA-3ppc-4f35-3m26).
   ========================================================================== */
const { spawnSync } = require("child_process");

const ALLOWED_NAMES = new Set([
  "minimatch",
  "glob",
  "rimraf",
  "gaxios",
  "google-gax",
]);

const ALLOWED_ADVISORY_URLS = new Set([
  "https://github.com/advisories/GHSA-3ppc-4f35-3m26",
]);

const severityRank = (severity) => {
  const key = String(severity || "").trim().toLowerCase();
  if (key === "critical") return 4;
  if (key === "high") return 3;
  if (key === "moderate") return 2;
  if (key === "low") return 1;
  return 0;
};

const isAllowedVulnerability = (name, vulnerability) => {
  if (!ALLOWED_NAMES.has(name)) {
    return false;
  }
  const via = Array.isArray(vulnerability?.via) ? vulnerability.via : [];
  const advisoryObjects = via.filter((entry) => entry && typeof entry === "object");
  if (!advisoryObjects.length) {
    return true;
  }
  return advisoryObjects.every((entry) => ALLOWED_ADVISORY_URLS.has(String(entry.url || "").trim()));
};

const npmExecPath = String(process.env.npm_execpath || "").trim();
const result = npmExecPath
  ? spawnSync(process.execPath, [npmExecPath, "audit", "--json"], {
      encoding: "utf8",
    })
  : spawnSync(process.platform === "win32" ? "npm.cmd" : "npm", ["audit", "--json"], {
      encoding: "utf8",
    });

if (result.error) {
  console.error("SECURITY AUDIT FAILED");
  console.error(`- ${result.error.message || result.error}`);
  process.exit(1);
}

const rawOutput = String(result.stdout || "").trim();
if (!rawOutput) {
  console.error("SECURITY AUDIT FAILED");
  console.error("- npm audit returned no JSON output");
  process.exit(1);
}

let report = null;
try {
  report = JSON.parse(rawOutput);
} catch (error) {
  console.error("SECURITY AUDIT FAILED");
  console.error("- Could not parse npm audit JSON output");
  console.error(`- ${error.message || error}`);
  process.exit(1);
}

const vulnerabilities = report?.vulnerabilities && typeof report.vulnerabilities === "object"
  ? report.vulnerabilities
  : {};

const unexpected = [];
const allowed = [];

for (const [name, vulnerability] of Object.entries(vulnerabilities)) {
  const severity = String(vulnerability?.severity || "").trim().toLowerCase();
  if (severityRank(severity) < severityRank("moderate")) {
    continue;
  }
  if (isAllowedVulnerability(name, vulnerability)) {
    allowed.push({ name, severity });
    continue;
  }
  unexpected.push({ name, severity });
}

if (unexpected.length) {
  console.error("SECURITY AUDIT FAILED");
  unexpected.forEach((item) => {
    console.error(`- Unexpected ${item.severity || "unknown"} vulnerability: ${item.name}`);
  });
  process.exit(1);
}

if (allowed.length) {
  const summary = allowed
    .map((item) => `${item.name}:${item.severity}`)
    .sort()
    .join(", ");
  console.warn("PASS [security-audit] only known upstream transitive vulnerabilities detected");
  console.warn(`- allowlisted: ${summary}`);
  process.exit(0);
}

console.log("PASS [security-audit] no moderate+ vulnerabilities detected");
