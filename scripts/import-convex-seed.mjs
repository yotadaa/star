import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";

const root = process.cwd();
const seedDir = path.join(root, ".migration", "convex-seed");
const isProd = process.argv.includes("--prod");
const unknownFlags = process.argv.slice(2).filter((arg) => arg !== "--prod");
if (unknownFlags.length) throw new Error(`Unknown flag(s): ${unknownFlags.join(", ")}`);

const tables = ["blogPosts", "inventoryItems", "contentEntries", "contactChannels"];

function sha256(value) {
  return crypto.createHash("sha256").update(value).digest("hex");
}

function runConvex(args, { capture = false } = {}) {
  const finalArgs = ["convex", ...args, ...(isProd ? ["--prod"] : [])];
  const result = spawnSync("npx", finalArgs, {
    cwd: root,
    encoding: "utf8",
    stdio: capture ? ["ignore", "pipe", "pipe"] : "inherit",
  });
  if (result.status !== 0) {
    const detail = capture ? `${result.stdout || ""}\n${result.stderr || ""}`.trim() : "";
    throw new Error(`npx ${finalArgs.join(" ")} failed${detail ? `: ${detail}` : ""}`);
  }
  return capture ? result.stdout.trim() : "";
}

function parseJsonOutput(output) {
  const start = output.indexOf("{");
  if (start === -1) throw new Error(`Expected JSON output, received: ${output}`);
  return JSON.parse(output.slice(start));
}

const manifestPath = path.join(seedDir, "manifest.json");
if (!fs.existsSync(manifestPath)) throw new Error("Missing seed manifest. Run npm run convex:seed:build first.");
const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));

for (const table of tables) {
  const file = path.join(seedDir, `${table}.jsonl`);
  if (!fs.existsSync(file)) throw new Error(`Missing seed file: ${file}`);
  const actual = sha256(fs.readFileSync(file));
  if (actual !== manifest.checksums[table]) throw new Error(`Checksum mismatch for ${table}`);
}

const expectedContentHash = sha256(
  Object.entries(manifest.checksums).sort().map(([table, checksum]) => `${table}:${checksum}`).join("\n"),
);
if (expectedContentHash !== manifest.contentHash) throw new Error("Manifest contentHash mismatch");

console.log(`Target: ${isProd ? "PRODUCTION" : "development"}`);
console.log(`Importing manifest ${manifest.version}`);
const before = parseJsonOutput(runConvex(["run", "migrationAudit:seedStatus"], { capture: true }));
console.log(`Before: ${JSON.stringify(before)}`);

for (const table of tables) {
  runConvex(["import", "--replace", "--yes", "--table", table, path.join(seedDir, `${table}.jsonl`)]);
}
runConvex(["import", "--replace", "--yes", "--table", "seedManifests", path.join(seedDir, "seedManifests.jsonl")]);
runConvex(["run", "migrations:runAll", JSON.stringify({ reset: true })]);

let after = null;
for (let attempt = 0; attempt < 30; attempt += 1) {
  after = parseJsonOutput(runConvex(["run", "migrationAudit:seedStatus"], { capture: true }));
  const seedTablesReady = tables.every((table) =>
    after[table].count === manifest.counts[table]
      && after[table].schemaVersionMissing === 0
      && after[table].duplicateKeys.length === 0,
  );
  if (seedTablesReady) break;
  await new Promise((resolve) => setTimeout(resolve, 500));
}

for (const table of tables) {
  if (after[table].count !== manifest.counts[table]) {
    throw new Error(`${table} count mismatch: expected ${manifest.counts[table]}, got ${after[table].count}`);
  }
  if (after[table].schemaVersionMissing !== 0) throw new Error(`${table} migration did not finish`);
  if (after[table].duplicateKeys.length) throw new Error(`${table} duplicate keys: ${after[table].duplicateKeys.join(", ")}`);
}
if (after.seedManifests !== 1) throw new Error(`Expected one seed manifest, got ${after.seedManifests}`);

console.log(`After: ${JSON.stringify(after)}`);
console.log(`Convex seed import verified: ${manifest.version}`);
