const fs = require("fs");
const path = require("path");
const { repairPhrasePragmaticsInPack } = require("./repair-phrase-pragmatics");

const root = path.join(__dirname, "..", "frontend", "worlds");

let updated = 0;

for (const world of fs.readdirSync(root, { withFileTypes: true })) {
  if (!world.isDirectory() || world.name === "english") {
    continue;
  }

  const file = path.join(root, world.name, "translations.json");
  if (!fs.existsSync(file)) {
    continue;
  }

  const pack = JSON.parse(fs.readFileSync(file, "utf8"));
  const changed = repairPhrasePragmaticsInPack(pack, world.name);
  if (!changed) {
    continue;
  }

  fs.writeFileSync(file, `${JSON.stringify(pack, null, 2)}\n`, "utf8");
  updated += 1;
  console.log(`Applied phrase pragmatics: ${world.name} (${changed})`);
}

console.log(`Phrase pragmatics apply complete. Worlds updated: ${updated}`);
