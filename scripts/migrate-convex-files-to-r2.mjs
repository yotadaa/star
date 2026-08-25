import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { ConvexHttpClient } from "convex/browser";
import { makeFunctionReference } from "convex/server";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const getAudit = makeFunctionReference("bridge:getFileMigrationAudit");
const listPending = makeFunctionReference("bridge:listPendingFileMigrations");
const migrateFile = makeFunctionReference("bridge:migrateFileToR2");
const rewriteReferences = makeFunctionReference("bridge:rewriteBlogFileReferences");

function loadLocalEnv() {
  const envPath = path.join(root, ".env.local");
  if (!fs.existsSync(envPath)) return;
  for (const rawLine of fs.readFileSync(envPath, "utf8").split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) continue;
    const separator = line.indexOf("=");
    if (separator < 1) continue;
    const key = line.slice(0, separator).trim();
    let value = line.slice(separator + 1).trim();
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    if (process.env[key] === undefined) process.env[key] = value;
  }
}

function positiveInteger(value, fallback, maximum) {
  const parsed = Number.parseInt(value, 10);
  if (!Number.isFinite(parsed) || parsed < 1) return fallback;
  return Math.min(maximum, parsed);
}

function optionsFrom(argv) {
  const options = { auditOnly: false, canary: false, rewrite: true, concurrency: 3, batchSize: 24 };
  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === "--audit-only") options.auditOnly = true;
    else if (arg === "--canary") options.canary = true;
    else if (arg === "--no-rewrite") options.rewrite = false;
    else if (arg === "--concurrency") options.concurrency = positiveInteger(argv[++index], 3, 6);
    else if (arg === "--batch-size") options.batchSize = positiveInteger(argv[++index], 24, 100);
    else throw new Error(`Unknown argument: ${arg}`);
  }
  return options;
}

async function mapConcurrent(values, concurrency, worker) {
  const results = new Array(values.length);
  let next = 0;
  async function run() {
    while (next < values.length) {
      const index = next;
      next += 1;
      results[index] = await worker(values[index], index);
    }
  }
  await Promise.all(Array.from({ length: Math.min(concurrency, values.length) }, run));
  return results;
}

function assertFinalAudit(audit) {
  const failures = [];
  if (audit.pendingFiles !== 0) failures.push(`${audit.pendingFiles} file rows still pending`);
  if (audit.failedJobs !== 0) failures.push(`${audit.failedJobs} migration jobs failed`);
  if (audit.r2VerifiedFiles !== audit.totalFiles) failures.push("not every file row is R2-verified");
  if (audit.legacyObjectsRetained !== audit.totalFiles) failures.push("a legacy Convex reference was removed");
  if (audit.unresolvedBlogAssets !== 0) failures.push(`${audit.unresolvedBlogAssets} Blog assets are unresolved`);
  if (audit.blogStorageIdReferences !== 0) failures.push(`${audit.blogStorageIdReferences} Blog storageId references remain`);
  if (failures.length) throw new Error(`R2 migration validation failed: ${failures.join("; ")}`);
}

export async function migrateConvexFilesToR2(argv = process.argv.slice(2)) {
  loadLocalEnv();
  const options = optionsFrom(argv);
  const deploymentUrl = String(process.env.CONVEX_CLOUD_URL
    || process.env.NEXT_PUBLIC_CONVEX_URL
    || process.env.CONVEX_URL
    || "").trim().replace(/\/+$/, "");
  const secret = process.env.CONVEX_INTERNAL_API_KEY;
  if (!deploymentUrl || !secret) throw new Error("Convex URL and CONVEX_INTERNAL_API_KEY are required");

  const client = new ConvexHttpClient(deploymentUrl);
  const initialAudit = await client.action(getAudit, { secret });
  console.log(JSON.stringify({ phase: "initial-audit", audit: initialAudit }));
  if (options.auditOnly) return { initialAudit, finalAudit: initialAudit, migrated: [] };

  const migrated = [];
  do {
    const requested = options.canary ? 1 : options.batchSize;
    const pending = await client.action(listPending, { secret, limit: requested });
    if (!pending.length) break;
    const batch = await mapConcurrent(pending, options.canary ? 1 : options.concurrency, async (id) => {
      const result = await client.action(migrateFile, { secret, id });
      console.log(JSON.stringify({
        phase: "copy-verified",
        fileId: result.fileId,
        status: result.status,
        sizeBytes: result.sizeBytes,
        sha256: result.sha256,
      }));
      return result;
    });
    migrated.push(...batch);
    if (options.canary) break;
  } while (true);

  let beforeRewrite = await client.action(getAudit, { secret });
  console.log(JSON.stringify({ phase: "pre-rewrite-audit", audit: beforeRewrite }));
  if (options.canary || !options.rewrite) {
    return { initialAudit, beforeRewrite, finalAudit: beforeRewrite, migrated };
  }
  if (beforeRewrite.pendingFiles || beforeRewrite.failedJobs || beforeRewrite.unresolvedBlogAssets) {
    throw new Error("Refusing to rewrite Blog references before every stored asset is verified");
  }

  const rewrite = await client.action(rewriteReferences, { secret });
  console.log(JSON.stringify({ phase: "reference-rewrite", ...rewrite }));
  const finalAudit = await client.action(getAudit, { secret });
  assertFinalAudit(finalAudit);
  console.log(JSON.stringify({ phase: "final-audit", audit: finalAudit }));
  return { initialAudit, beforeRewrite, rewrite, finalAudit, migrated };
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  migrateConvexFilesToR2().catch((error) => {
    console.error(error instanceof Error ? error.message : String(error));
    process.exitCode = 1;
  });
}
