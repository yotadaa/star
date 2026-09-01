import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

function loadLocalEnv() {
  for (const fileName of [".env.local", ".env"]) {
    const envPath = path.join(root, fileName);
    if (!fs.existsSync(envPath)) continue;
    for (const rawLine of fs.readFileSync(envPath, "utf8").split(/\r?\n/)) {
      const line = rawLine.trim();
      if (!line || line.startsWith("#")) continue;
      const separator = line.indexOf("=");
      if (separator < 1) continue;
      const name = line.slice(0, separator).trim();
      let value = line.slice(separator + 1).trim();
      if (
        (value.startsWith('"') && value.endsWith('"'))
        || (value.startsWith("'") && value.endsWith("'"))
      ) {
        value = value.slice(1, -1);
      }
      if (process.env[name] === undefined) process.env[name] = value;
    }
  }
}

function argumentValue(name) {
  const prefix = `--${name}=`;
  return process.argv.find((argument) => argument.startsWith(prefix))?.slice(prefix.length) || "";
}

function normalizedTarget(value) {
  const url = new URL(String(value || "").trim());
  if (!/^https?:$/.test(url.protocol) || url.username || url.password) {
    throw new Error("PageSpeed target must be a public HTTP or HTTPS URL.");
  }
  url.hash = "";
  return url.toString();
}

function score(category) {
  const value = Number(category?.score);
  return Number.isFinite(value) ? Math.round(value * 100) : null;
}

loadLocalEnv();

const apiKey = String(process.env.PAGESPEED_INSIGHT_API || "").trim();
if (!apiKey) throw new Error("PAGESPEED_INSIGHT_API is required for this command.");

const target = normalizedTarget(
  argumentValue("url") || process.env.NEXT_PUBLIC_SITE_URL || "https://me.mukhtada.my.id",
);
const strategy = argumentValue("strategy") || "mobile";
if (!new Set(["mobile", "desktop"]).has(strategy)) {
  throw new Error("PageSpeed strategy must be mobile or desktop.");
}

const endpoint = new URL("https://www.googleapis.com/pagespeedonline/v5/runPagespeed");
endpoint.searchParams.set("url", target);
endpoint.searchParams.set("strategy", strategy);
endpoint.searchParams.set("key", apiKey);
for (const category of ["performance", "accessibility", "best-practices", "seo"]) {
  endpoint.searchParams.append("category", category);
}

const response = await fetch(endpoint, { signal: AbortSignal.timeout(120_000) });
if (!response.ok) {
  throw new Error(`PageSpeed Insights returned HTTP ${response.status}.`);
}

const payload = await response.json();
const lighthouse = payload.lighthouseResult || {};
const categories = lighthouse.categories || {};
const audits = lighthouse.audits || {};
const result = {
  analyzedAt: lighthouse.fetchTime || new Date().toISOString(),
  requestedUrl: target,
  finalUrl: lighthouse.finalUrl || target,
  strategy,
  lighthouseVersion: lighthouse.lighthouseVersion || "",
  scores: {
    performance: score(categories.performance),
    accessibility: score(categories.accessibility),
    bestPractices: score(categories["best-practices"]),
    seo: score(categories.seo),
  },
  metrics: {
    firstContentfulPaint: audits["first-contentful-paint"]?.displayValue || "",
    largestContentfulPaint: audits["largest-contentful-paint"]?.displayValue || "",
    totalBlockingTime: audits["total-blocking-time"]?.displayValue || "",
    cumulativeLayoutShift: audits["cumulative-layout-shift"]?.displayValue || "",
    speedIndex: audits["speed-index"]?.displayValue || "",
  },
};

const serialized = `${JSON.stringify(result, null, 2)}\n`;
const outputPath = argumentValue("output");
if (outputPath) {
  const absolutePath = path.resolve(outputPath);
  fs.mkdirSync(path.dirname(absolutePath), { recursive: true });
  fs.writeFileSync(absolutePath, serialized);
}
process.stdout.write(serialized);
