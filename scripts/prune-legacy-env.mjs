import fs from "node:fs";
import path from "node:path";

const envPath = path.resolve(".env.local");
const legacyPattern = /^(?:DB_PASSWORD|SUPABASE_[A-Z0-9_]+)$/;

if (!fs.existsSync(envPath)) {
  console.log("No .env.local file found; nothing to prune.");
  process.exit(0);
}

const lines = fs.readFileSync(envPath, "utf8").split(/\r?\n/);
const removed = [];
const kept = lines.filter((line) => {
  const match = line.match(/^([A-Z][A-Z0-9_]*)=/);
  if (!match || !legacyPattern.test(match[1])) return true;
  removed.push(match[1]);
  return false;
});

fs.writeFileSync(envPath, `${kept.join("\n").replace(/\n+$/, "")}\n`, {
  mode: 0o600,
});

console.log(`Removed ${removed.length} legacy database variables.`);
for (const key of removed) console.log(`- ${key}`);
