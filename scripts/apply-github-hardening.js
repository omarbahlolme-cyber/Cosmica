/* ==========================================================================
   GITHUB HARDENING AUTOMATION
   - Applies branch protection on the target branch.
   - Enables repository security alert automation where supported.
   ========================================================================== */

/* --------------------------------------------------------------------------
   CONFIG
   -------------------------------------------------------------------------- */
const token = process.env.GH_ADMIN_TOKEN || process.env.GITHUB_TOKEN || "";
const repository = process.env.GITHUB_REPOSITORY || "";
const targetBranch = process.env.TARGET_BRANCH || "main";
const requiredChecks = String(process.env.REQUIRED_CHECKS || "quality")
  .split(",")
  .map((value) => value.trim())
  .filter(Boolean);
const minReviewers = Number(process.env.MIN_REVIEWERS || 1);

/* --------------------------------------------------------------------------
   HELPERS
   -------------------------------------------------------------------------- */
const parseOwnerRepo = (slug) => {
  const parts = String(slug || "").split("/");
  if (parts.length !== 2 || !parts[0] || !parts[1]) {
    throw new Error("GITHUB_REPOSITORY must be set as owner/repo");
  }
  return { owner: parts[0], repo: parts[1] };
};

const requestGitHub = async (method, path, body, options = {}) => {
  const response = await fetch(`https://api.github.com${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28",
      "Content-Type": "application/json",
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  if (response.ok) {
    const text = await response.text();
    return text ? JSON.parse(text) : null;
  }

  const errorText = await response.text();
  const message = `${method} ${path} failed (${response.status}) ${errorText}`.trim();
  if (options.optional) {
    console.warn(`WARN [github-hardening] ${message}`);
    return null;
  }
  throw new Error(message);
};

/* --------------------------------------------------------------------------
   MAIN
   -------------------------------------------------------------------------- */
Promise.resolve()
  .then(async () => {
    if (!token) {
      throw new Error("Missing GH_ADMIN_TOKEN (or GITHUB_TOKEN) with admin repo permissions");
    }
    if (!requiredChecks.length) {
      throw new Error("REQUIRED_CHECKS cannot be empty");
    }
    if (!Number.isInteger(minReviewers) || minReviewers < 1) {
      throw new Error("MIN_REVIEWERS must be an integer >= 1");
    }

    const { owner, repo } = parseOwnerRepo(repository);
    const encodedBranch = encodeURIComponent(targetBranch);

    await requestGitHub(
      "PUT",
      `/repos/${owner}/${repo}/branches/${encodedBranch}/protection`,
      {
        required_status_checks: {
          strict: true,
          contexts: requiredChecks,
        },
        enforce_admins: true,
        required_pull_request_reviews: {
          dismiss_stale_reviews: true,
          require_code_owner_reviews: false,
          required_approving_review_count: minReviewers,
        },
        restrictions: null,
        required_linear_history: true,
        allow_force_pushes: false,
        allow_deletions: false,
        required_conversation_resolution: true,
      }
    );
    console.log(`PASS [github-hardening] branch protection updated for ${owner}/${repo}:${targetBranch}`);

    await requestGitHub("PUT", `/repos/${owner}/${repo}/vulnerability-alerts`, null, { optional: true });
    await requestGitHub("PUT", `/repos/${owner}/${repo}/automated-security-fixes`, null, {
      optional: true,
    });
    await requestGitHub("PUT", `/repos/${owner}/${repo}/private-vulnerability-reporting`, null, {
      optional: true,
    });
    console.log("PASS [github-hardening] security alert automation enabled where supported");
  })
  .catch((error) => {
    console.error("GITHUB HARDENING FAILED");
    console.error(`- ${error.message || error}`);
    process.exit(1);
  });
