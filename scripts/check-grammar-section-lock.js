/* ==========================================================================
   GRAMMAR SECTION LOCK CHECK
   - A section can be marked PASS only when:
     1) zero-tolerance check passes
     2) peer-review check passes
     3) both pass twice in a row
   ========================================================================== */
const { spawnSync } = require("child_process");

const extraArgs = process.argv.slice(2);

const run = (scriptPath) => {
  const result = spawnSync("node", [scriptPath, ...extraArgs], { stdio: "inherit" });
  if (result.status !== 0) {
    process.exit(result.status || 1);
  }
};

for (let pass = 1; pass <= 2; pass += 1) {
  run("scripts/check-grammar-zero-tolerance.js");
  run("scripts/check-grammar-peer-review.js");
}

const argSuffix = extraArgs.length ? ` (${extraArgs.join(" ")})` : "";
console.log(`PASS [grammar-section-lock] double-pass lock satisfied${argSuffix}`);
