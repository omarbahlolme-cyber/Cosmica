const fs = require("fs");
const path = require("path");

const copyIfExists = (source, target) => {
  if (fs.existsSync(source)) {
    fs.copyFileSync(source, target);
  }
};

const writeJsonIfMissing = (target, value) => {
  if (!fs.existsSync(target)) {
    fs.writeFileSync(target, JSON.stringify(value, null, 2), "utf8");
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
    const updatedAt = new Date().toISOString();
    const emptyAuthStore = {
      schemaVersion: 1,
      updatedAt,
      users: {},
      emailIndex: {},
      sessions: {},
      giftTokens: { tokens: {} },
      deletedUsers: { userIds: {}, emails: {} },
    };
    writeJsonIfMissing(path.join(authDataRoot, "accounts.json"), emptyAuthStore);
    writeJsonIfMissing(path.join(authDataRoot, "accounts.last-known-good.json"), emptyAuthStore);
    writeJsonIfMissing(path.join(authDataRoot, "deleted-accounts.json"), []);
    writeJsonIfMissing(path.join(authDataRoot, "registered-accounts.json"), []);
    writeJsonIfMissing(path.join(authDataRoot, "blocked-users.json"), {
      schemaVersion: 1,
      updatedAt,
      emails: {},
      userIds: {},
      ipHashes: {},
    });
    writeJsonIfMissing(path.join(authDataRoot, "security-events.json"), {
      schemaVersion: 1,
      updatedAt,
      events: [],
    });
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
