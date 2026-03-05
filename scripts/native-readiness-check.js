const fs = require("fs");
const path = require("path");
const { spawnSync } = require("child_process");

const ROOT = path.resolve(__dirname, "..");

const readText = (filePath) => {
  try {
    return fs.readFileSync(filePath, "utf8");
  } catch {
    return "";
  }
};

const readJson = (filePath) => {
  try {
    return JSON.parse(fs.readFileSync(filePath, "utf8"));
  } catch {
    return null;
  }
};

const resultRows = [];
const issues = [];
const warnings = [];

const addRow = (name, value, ok = true) => {
  resultRows.push({ name, value: String(value), ok: Boolean(ok) });
};

const addIssue = (message) => {
  issues.push(String(message || "").trim());
};

const addWarning = (message) => {
  warnings.push(String(message || "").trim());
};

const capacitorConfigPath = path.join(ROOT, "capacitor.config.json");
const capacitorConfig = readJson(capacitorConfigPath);
if (!capacitorConfig) {
  addIssue("Missing or invalid capacitor.config.json.");
} else {
  const appId = String(capacitorConfig.appId || "").trim();
  const appName = String(capacitorConfig.appName || "").trim();
  const webDir = String(capacitorConfig.webDir || "").trim();
  const serverUrl = String(capacitorConfig?.server?.url || "").trim();
  addRow("Capacitor appId", appId || "(missing)", Boolean(appId));
  addRow("Capacitor appName", appName || "(missing)", Boolean(appName));
  addRow("Capacitor webDir", webDir || "(missing)", Boolean(webDir));
  addRow("Capacitor server.url", serverUrl || "(not set)");
  if (!appId) {
    addIssue("Capacitor appId is required.");
  }
  if (!appName) {
    addIssue("Capacitor appName is required.");
  }
  if (!webDir) {
    addIssue("Capacitor webDir is required.");
  }
}

const androidBuildGradlePath = path.join(ROOT, "android", "app", "build.gradle");
const androidBuildGradle = readText(androidBuildGradlePath);
const androidAppIdMatch = androidBuildGradle.match(/applicationId\s+"([^"]+)"/);
const androidVersionCodeMatch = androidBuildGradle.match(/versionCode\s+(\d+)/);
const androidVersionNameMatch = androidBuildGradle.match(/versionName\s+"([^"]+)"/);
const androidAppId = androidAppIdMatch ? androidAppIdMatch[1] : "";
const androidVersionCode = androidVersionCodeMatch ? androidVersionCodeMatch[1] : "";
const androidVersionName = androidVersionNameMatch ? androidVersionNameMatch[1] : "";
addRow("Android applicationId", androidAppId || "(missing)", Boolean(androidAppId));
addRow("Android versionCode", androidVersionCode || "(missing)", Boolean(androidVersionCode));
addRow("Android versionName", androidVersionName || "(missing)", Boolean(androidVersionName));
if (!androidBuildGradle) {
  addIssue("Missing android/app/build.gradle.");
}

const iosPbxProjPath = path.join(ROOT, "ios", "App", "App.xcodeproj", "project.pbxproj");
const iosPbxProj = readText(iosPbxProjPath);
const iosBundleMatch = iosPbxProj.match(/PRODUCT_BUNDLE_IDENTIFIER = ([^;]+);/);
const iosMarketingMatch = iosPbxProj.match(/MARKETING_VERSION = ([^;]+);/);
const iosBuildMatch = iosPbxProj.match(/CURRENT_PROJECT_VERSION = ([^;]+);/);
const iosBundleId = iosBundleMatch ? iosBundleMatch[1].trim() : "";
const iosMarketingVersion = iosMarketingMatch ? iosMarketingMatch[1].trim() : "";
const iosBuildVersion = iosBuildMatch ? iosBuildMatch[1].trim() : "";
addRow("iOS bundle id", iosBundleId || "(missing)", Boolean(iosBundleId));
addRow("iOS marketing version", iosMarketingVersion || "(missing)", Boolean(iosMarketingVersion));
addRow("iOS build number", iosBuildVersion || "(missing)", Boolean(iosBuildVersion));
if (!iosPbxProj) {
  addWarning("Missing iOS Xcode project files (or not generated on this machine).");
}

if (capacitorConfig && androidAppId && capacitorConfig.appId !== androidAppId) {
  addIssue(
    `App ID mismatch: capacitor.config.json has "${capacitorConfig.appId}" but Android uses "${androidAppId}".`
  );
}
if (capacitorConfig && iosBundleId && capacitorConfig.appId !== iosBundleId) {
  addIssue(
    `App ID mismatch: capacitor.config.json has "${capacitorConfig.appId}" but iOS uses "${iosBundleId}".`
  );
}

const indexHtmlPath = path.join(ROOT, "frontend", "index.html");
const indexHtml = readText(indexHtmlPath);
const appStoreMatch = indexHtml.match(/appStoreUrl:\s*"([^"]*)"/);
const playStoreMatch = indexHtml.match(/playStoreUrl:\s*"([^"]*)"/);
const appStoreUrl = appStoreMatch ? appStoreMatch[1].trim() : "";
const playStoreUrl = playStoreMatch ? playStoreMatch[1].trim() : "";
addRow("App Store URL", appStoreUrl || "(not set)");
addRow("Play Store URL", playStoreUrl || "(not set)");
if (!appStoreUrl) {
  addWarning("App Store URL is not set in frontend/index.html (window.COSMICA_STORE_LINKS).");
}
if (!playStoreUrl) {
  addWarning("Play Store URL is not set in frontend/index.html (window.COSMICA_STORE_LINKS).");
}

const xcodeCheck = spawnSync("xcodebuild", ["-version"], { encoding: "utf8" });
if (xcodeCheck.status === 0) {
  addRow("Xcode", "installed");
} else {
  addRow("Xcode", "not detected");
  addWarning("Xcode not detected. iOS archive/TestFlight must be done on macOS with Xcode.");
}

console.log("Native readiness report:\n");
resultRows.forEach((row) => {
  const marker = row.ok ? "OK " : "ERR";
  console.log(`- [${marker}] ${row.name}: ${row.value}`);
});

if (issues.length) {
  console.log("\nBlocking issues:");
  issues.forEach((message) => console.log(`- ${message}`));
}

if (warnings.length) {
  console.log("\nWarnings:");
  warnings.forEach((message) => console.log(`- ${message}`));
}

if (!issues.length) {
  console.log("\nNative check completed.");
} else {
  console.log("\nNative check found blocking issues.");
  process.exitCode = 1;
}
