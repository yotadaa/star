import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  INDEXNOW_KEY_PATH,
  normalizeIndexNowUrls,
  normalizeSiteOrigin,
  submitIndexNowUrls,
  validateIndexNowKey,
} from "../lib/indexNowCore.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

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

function decodeXml(value) {
  return value
    .replaceAll("&amp;", "&")
    .replaceAll("&lt;", "<")
    .replaceAll("&gt;", ">")
    .replaceAll("&quot;", '"')
    .replaceAll("&apos;", "'");
}

async function sitemapUrls(siteOrigin) {
  const sitemapUrl = new URL("/sitemap-blog.xml", `${siteOrigin}/`).toString();
  const response = await fetch(sitemapUrl, {
    headers: { Accept: "application/xml, text/xml;q=0.9" },
    signal: AbortSignal.timeout(15_000),
  });
  if (!response.ok) throw new Error(`Could not read the Blog sitemap (HTTP ${response.status}).`);
  const xml = await response.text();
  return Array.from(xml.matchAll(/<loc>([\s\S]*?)<\/loc>/gi), (match) => decodeXml(match[1].trim()));
}

function equalSecret(left, right) {
  const a = Buffer.from(left);
  const b = Buffer.from(right);
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

async function verifyKeyLocation({ key, siteOrigin }) {
  const keyLocation = new URL(INDEXNOW_KEY_PATH, `${siteOrigin}/`).toString();
  const response = await fetch(keyLocation, { cache: "no-store", signal: AbortSignal.timeout(15_000) });
  if (!response.ok) throw new Error(`The deployed IndexNow key file returned HTTP ${response.status}.`);
  const deployedKey = (await response.text()).trim();
  if (!equalSecret(deployedKey, key)) {
    throw new Error("The deployed IndexNow key file does not match the local server key.");
  }
  return keyLocation;
}

loadLocalEnv();

const dryRun = process.argv.includes("--dry-run");
const siteOrigin = normalizeSiteOrigin(
  process.env.NEXT_PUBLIC_SITE_URL || "https://me.mukhtada.my.id",
);
const key = validateIndexNowKey(process.env.INDEXNOW_API_KEY);
const explicitUrls = process.argv
  .filter((argument) => argument.startsWith("--url="))
  .map((argument) => argument.slice("--url=".length));
const discoveredUrls = explicitUrls.length ? explicitUrls : await sitemapUrls(siteOrigin);
const urls = normalizeIndexNowUrls([new URL("/blog", `${siteOrigin}/`).toString(), ...discoveredUrls], siteOrigin);

if (dryRun) {
  console.log(JSON.stringify({
    dryRun: true,
    host: new URL(siteOrigin).host,
    keyLocation: new URL(INDEXNOW_KEY_PATH, `${siteOrigin}/`).toString(),
    urls: urls.length,
  }, null, 2));
  process.exit(0);
}

const keyLocation = await verifyKeyLocation({ key, siteOrigin });
const result = await submitIndexNowUrls({ key, siteOrigin, urls });
console.log(JSON.stringify({ ...result, keyLocation }, null, 2));
