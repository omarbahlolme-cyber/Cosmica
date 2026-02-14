const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..", "frontend");
const EXTS = new Set([".html", ".css", ".js", ".json", ".md", ".txt"]);
const OFFENDING = "`r`n";

const findings = [];

function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name.startsWith(".")) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walk(full);
      continue;
    }
    const ext = path.extname(entry.name).toLowerCase();
    if (!EXTS.has(ext)) continue;
    const raw = fs.readFileSync(full, "utf8");
    if (!raw.includes(OFFENDING)) continue;
    const rel = path.relative(path.resolve(__dirname, ".."), full).replace(/\\/g, "/");
    const lines = raw.split(/\r?\n/);
    lines.forEach((line, i) => {
      if (line.includes(OFFENDING)) {
        findings.push(`${rel}:${i + 1}`);
      }
    });
  }
}

walk(ROOT);

if (findings.length) {
  console.error("FAIL [literal-escapes] Found literal `r`n tokens:");
  findings.forEach((f) => console.error(`- ${f}`));
  process.exit(1);
}

console.log("PASS [literal-escapes] no literal `r`n tokens in frontend text assets");
