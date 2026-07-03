import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const envPath = path.join(root, ".env.local");
const docsDir = path.join(root, "docs", "supabase");

function readEnvFile(filePath) {
  if (!fs.existsSync(filePath)) return new Map();
  const entries = new Map();
  const lines = fs.readFileSync(filePath, "utf8").split(/\r?\n/);

  for (const line of lines) {
    if (!line || line.trimStart().startsWith("#") || !line.includes("=")) continue;
    const index = line.indexOf("=");
    entries.set(line.slice(0, index), line.slice(index + 1));
  }

  return entries;
}

function writeEnvFile(filePath, entries) {
  const lines = [];
  for (const [key, value] of entries) {
    lines.push(`${key}=${value}`);
  }
  fs.writeFileSync(filePath, `${lines.join("\n")}\n`, { mode: 0o600 });
}

function pick(pattern, source, label) {
  const value = source.match(pattern)?.[1]?.trim();
  if (!value) throw new Error(`Missing ${label}`);
  return value;
}

function parseShardDoc(index) {
  const docPath = path.join(docsDir, `database-${index}.md`);
  const source = fs.readFileSync(docPath, "utf8");
  const url = pick(/NEXT_PUBLIC_SUPABASE_URL=(https:\/\/[a-z0-9]+\.supabase\.co)/, source, `database-${index} URL`);
  const publishableKey = pick(/NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=([^\s`]+)/, source, `database-${index} publishable key`);
  const storageEndpoint = pick(/storage\.endpoint:\s*(https:\/\/[^\s]+)/, source, `database-${index} storage endpoint`);
  const storageRegion = pick(/storage\.region:\s*([^\s]+)/, source, `database-${index} storage region`);
  const storageAccessKeyId = pick(/storage\.access_key_id:\s*([^\s]+)/, source, `database-${index} storage access key id`);
  const storageSecretAccessKey = pick(/storage\.secret_access_key:\s*([^\s]+)/, source, `database-${index} storage secret access key`);
  const projectRef = new URL(url).hostname.split(".")[0];

  return {
    id: `s${index}`,
    projectRef,
    url,
    publishableKey,
    storageEndpoint,
    storageRegion,
    storageAccessKeyId,
    storageSecretAccessKey,
  };
}

const env = readEnvFile(envPath);

if (!env.has("SUPABASE_BACKEND_APP_KEY")) {
  env.set("SUPABASE_BACKEND_APP_KEY", `mb_${crypto.randomBytes(32).toString("hex")}`);
}

if (!env.has("SUPABASE_BACKEND_BUCKET")) {
  env.set("SUPABASE_BACKEND_BUCKET", "mb-backend-assets");
}

for (const shard of [1, 2, 3].map(parseShardDoc)) {
  const prefix = `SUPABASE_SHARD_${shard.id.slice(1)}`;
  env.set(`${prefix}_ID`, shard.id);
  env.set(`${prefix}_PROJECT_REF`, shard.projectRef);
  env.set(`${prefix}_URL`, shard.url);
  env.set(`${prefix}_PUBLISHABLE_KEY`, shard.publishableKey);
  env.set(`${prefix}_DB_HOST`, `db.${shard.projectRef}.supabase.co`);
  env.set(`${prefix}_STORAGE_ENDPOINT`, shard.storageEndpoint);
  env.set(`${prefix}_STORAGE_REGION`, shard.storageRegion);
  env.set(`${prefix}_STORAGE_ACCESS_KEY_ID`, shard.storageAccessKeyId);
  env.set(`${prefix}_STORAGE_SECRET_ACCESS_KEY`, shard.storageSecretAccessKey);
}

writeEnvFile(envPath, env);

console.log("Synced Supabase shard env keys into .env.local without printing secret values.");
