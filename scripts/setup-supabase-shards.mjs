import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const envPath = path.join(root, ".env.local");
const schemaPath = path.join(root, "docs", "supabase", "schema.sql");

function readEnvFile(filePath) {
  const entries = {};
  if (!fs.existsSync(filePath)) return entries;

  for (const line of fs.readFileSync(filePath, "utf8").split(/\r?\n/)) {
    if (!line || line.trimStart().startsWith("#") || !line.includes("=")) continue;
    const index = line.indexOf("=");
    entries[line.slice(0, index)] = line.slice(index + 1);
  }

  return entries;
}

function readShard(index, env) {
  const prefix = `SUPABASE_SHARD_${index}`;
  const id = env[`${prefix}_ID`] || `s${index}`;
  const host = env[`${prefix}_DB_HOST`];
  const projectRef = env[`${prefix}_PROJECT_REF`];
  const password = env[`${prefix}_DB_PASSWORD`] || env.DB_PASSWORD;

  if (!host || !projectRef) {
    throw new Error(`Missing ${prefix}_DB_HOST or ${prefix}_PROJECT_REF. Run npm run supabase:sync-env first.`);
  }

  if (!password) {
    throw new Error(`Missing ${prefix}_DB_PASSWORD or DB_PASSWORD in .env.local`);
  }

  return { id, host, projectRef, password };
}

const env = { ...process.env, ...readEnvFile(envPath) };
const appKey = env.SUPABASE_BACKEND_APP_KEY;
const bucket = env.SUPABASE_BACKEND_BUCKET || "mb-backend-assets";

if (!appKey) throw new Error("Missing SUPABASE_BACKEND_APP_KEY in .env.local");
if (!fs.existsSync(schemaPath)) throw new Error(`Missing schema file: ${schemaPath}`);

const shards = [1, 2, 3].map((index) => readShard(index, env));

for (const shard of shards) {
  console.log(`Applying backend schema to ${shard.id} (${shard.projectRef})...`);

  const result = spawnSync(
    "psql",
    [
      "-v", "ON_ERROR_STOP=1",
      "-v", `backend_app_key=${appKey}`,
      "-v", `backend_bucket=${bucket}`,
      "-h", shard.host,
      "-p", "5432",
      "-U", "postgres",
      "-d", "postgres",
      "-f", schemaPath,
    ],
    {
      cwd: root,
      env: { ...process.env, PGPASSWORD: shard.password, PGSSLMODE: "require" },
      encoding: "utf8",
      stdio: ["ignore", "pipe", "pipe"],
    }
  );

  if (result.status !== 0) {
    const stderr = result.stderr.replaceAll(shard.password, "[redacted]");
    throw new Error(`Schema setup failed for ${shard.id}: ${stderr}`);
  }

  console.log(`Done ${shard.id}.`);
}

console.log("Supabase backend schema is installed on all configured shards.");
