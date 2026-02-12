/* ==========================================================================
   ROLLBACK INFO HELPER
   - Prints latest release tags and a safe rollback command checklist.
   - Non-destructive: read-only git operations only.
   ========================================================================== */
const { spawnSync } = require("child_process");
const path = require("path");

/* --------------------------------------------------------------------------
   PATHS
   -------------------------------------------------------------------------- */
const ROOT = path.resolve(__dirname, "..");

/* --------------------------------------------------------------------------
   HELPERS
   -------------------------------------------------------------------------- */
const runGit = (args, stepName) => {
  const result = spawnSync("git", args, {
    cwd: ROOT,
    encoding: "utf8",
  });

  if (result.error) {
    throw new Error(`${stepName} failed\n${result.error.message || result.error}`);
  }
  if (result.status !== 0) {
    const output = [result.stdout, result.stderr].filter(Boolean).join("\n").trim();
    throw new Error(`${stepName} failed\n${output}`);
  }
  return String(result.stdout || "").trim();
};

/* --------------------------------------------------------------------------
   MAIN
   -------------------------------------------------------------------------- */
try {
  const currentBranch = runGit(["rev-parse", "--abbrev-ref", "HEAD"], "Resolve current branch");
  const currentCommit = runGit(["rev-parse", "--short", "HEAD"], "Resolve current commit");
  const tagsRaw = runGit(["tag", "--sort=-creatordate"], "Read tags");
  const releaseTags = tagsRaw
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .filter((tag) => /^v\d+\.\d+\.\d+$/.test(tag));

  console.log("ROLLBACK INFO");
  console.log(`- branch: ${currentBranch}`);
  console.log(`- head: ${currentCommit}`);
  console.log("");
  console.log("Latest release tags:");
  if (!releaseTags.length) {
    console.log("- none found (create one using release process before relying on tag rollbacks)");
  } else {
    releaseTags.slice(0, 8).forEach((tag) => console.log(`- ${tag}`));
  }

  const targetTag = releaseTags[0] || "vX.Y.Z";
  console.log("");
  console.log("Safe rollback checklist:");
  console.log("1) Sync local main");
  console.log("   git checkout main");
  console.log("   git pull origin main");
  console.log("");
  console.log("2) Create rollback branch from current main");
  console.log(`   git checkout -b rollback/${targetTag}-hotfix`);
  console.log("");
  console.log("3) Revert to a known good release snapshot");
  console.log(`   git revert --no-edit $(git rev-list -n 1 ${targetTag})..HEAD`);
  console.log("");
  console.log("4) Push rollback branch and open PR");
  console.log(`   git push -u origin rollback/${targetTag}-hotfix`);
  console.log("");
  console.log("5) Merge PR, deploy latest main on Render, purge Cloudflare cache.");
} catch (error) {
  console.error("ROLLBACK INFO FAILED");
  console.error(`- ${error.message || error}`);
  process.exit(1);
}
