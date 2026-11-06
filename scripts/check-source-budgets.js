/* ========================================================================== 
   SOURCE SIZE BUDGETS
   Prevents already-large runtime files from growing unnoticed while modules
   are extracted incrementally.
   ========================================================================== */
const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const BUDGETS = Object.freeze({
  "frontend/app.js": 550_000,
  "frontend/style.css": 440_000,
  "frontend/maps/app-maps.js": 400_000,
  "frontend/maps/style-maps.css": 110_000,
  "backend/server.js": 340_000,
});

const failures = [];
for (const [relativePath, maxBytes] of Object.entries(BUDGETS)) {
  const filePath = path.join(ROOT, relativePath);
  if (!fs.existsSync(filePath)) {
    failures.push(`${relativePath}: file is missing`);
    continue;
  }
  const actualBytes = fs.statSync(filePath).size;
  if (actualBytes > maxBytes) {
    failures.push(`${relativePath}: ${actualBytes} bytes exceeds ${maxBytes}-byte budget`);
  }
}

if (failures.length) {
  console.error("SOURCE BUDGET CHECK FAILED");
  failures.forEach((failure) => console.error(`- ${failure}`));
  process.exit(1);
}

console.log(`PASS [source-budgets] ${Object.keys(BUDGETS).length} large runtime files remain within ceilings`);
