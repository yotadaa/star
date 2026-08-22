import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";

const root = process.cwd();
const envPath = path.join(root, ".env.local");
if (!fs.existsSync(envPath)) throw new Error(".env.local is required");

const source = fs.readFileSync(envPath, "utf8");
const lines = source.split(/\r?\n/);
const values = new Map();
for (const line of lines) {
  if (!line || line.trimStart().startsWith("#") || !line.includes("=")) continue;
  const index = line.indexOf("=");
  values.set(line.slice(0, index), line.slice(index + 1));
}

const deployment = values.get("CONVEX_DEPLOYMENT") || "";
if (deployment.includes("|")) throw new Error("CONVEX_DEPLOYMENT still contains a deploy key suffix");

const rotate = process.argv.includes("--rotate");
const isProd = process.argv.includes("--prod");
const unknownFlags = process.argv.slice(2).filter((arg) => arg !== "--rotate" && arg !== "--prod");
if (unknownFlags.length) throw new Error(`Unknown flag(s): ${unknownFlags.join(", ")}`);
const secret = rotate ? crypto.randomBytes(32).toString("hex") : values.get("CONVEX_INTERNAL_API_KEY") || crypto.randomBytes(32).toString("hex");
let found = false;
const nextLines = lines.map((line) => {
  if (!line.startsWith("CONVEX_INTERNAL_API_KEY=")) return line;
  found = true;
  return `CONVEX_INTERNAL_API_KEY=${secret}`;
});
if (!found) {
  if (nextLines.at(-1) !== "") nextLines.push("");
  nextLines.push("# Server-only Auth.js to Convex bridge secret");
  nextLines.push(`CONVEX_INTERNAL_API_KEY=${secret}`);
}
fs.writeFileSync(envPath, `${nextLines.join("\n").replace(/\n+$/, "")}\n`, { mode: 0o600 });

const convexCli = path.join(root, "node_modules", "convex", "bin", "main.js");
const result = spawnSync(process.execPath, [
  convexCli,
  "env",
  "set",
  "CONVEX_INTERNAL_API_KEY",
  secret,
  ...(isProd ? ["--prod"] : []),
], {
  cwd: root,
  stdio: "inherit",
  env: { ...process.env, npm_config_loglevel: "silent" },
});
if (result.status !== 0) throw new Error(`Failed to set CONVEX_INTERNAL_API_KEY on the Convex ${isProd ? "production" : "development"} deployment`);
console.log(`Convex bridge secret configured locally and on the ${isProd ? "production" : "development"} deployment (value not printed).`);
