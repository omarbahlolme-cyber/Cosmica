const fs = require("fs");
const path = require("path");

const copyIfExists = (source, target) => {
  if (fs.existsSync(source)) {
    fs.copyFileSync(source, target);
  }
};

const createAuthTestStore = ({ root, namespace, envKey = "AUTH_TEST_DATA_ROOT" }) => {
  const defaultRoot = path.join(root, "backend", "data");
  const explicitRoot = String(process.env[envKey] || process.env.AUTH_DATA_ROOT || "").trim();
  const authDataRoot = path.resolve(
    explicitRoot || path.join(root, "tmp", "auth-test-stores", `${namespace}-${process.pid}`)
  );
  const isDefaultRoot = path.resolve(defaultRoot) === authDataRoot;

  const prepare = () => {
    if (isDefaultRoot) {
      return;
    }
    fs.mkdirSync(authDataRoot, { recursive: true });
    for (const fileName of [
      "accounts.json",
      "accounts.last-known-good.json",
      "deleted-accounts.json",
      "registered-accounts.json",
      "blocked-users.json",
      "security-events.json",
    ]) {
      copyIfExists(path.join(defaultRoot, fileName), path.join(authDataRoot, fileName));
    }
  };

  const cleanup = () => {
    if (!isDefaultRoot && fs.existsSync(authDataRoot)) {
      fs.rmSync(authDataRoot, { recursive: true, force: true });
    }
  };

  return {
    root: authDataRoot,
    file: (fileName) => path.join(authDataRoot, fileName),
    env: () => ({ AUTH_DATA_ROOT: authDataRoot }),
    prepare,
    cleanup,
  };
};

module.exports = { createAuthTestStore };
