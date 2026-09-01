import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

const DEFAULT_ORIGIN = "https://me.mukhtada.my.id";
const GOOGLEBOT_USER_AGENT = "Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)";
const MAX_SITEMAP_URLS = 50_000;
const MAX_DISCOVERY_PAGES = 200;
const REQUEST_TIMEOUT_MS = 20_000;

function argumentValue(name) {
  const prefix = `--${name}=`;
  return process.argv.find((argument) => argument.startsWith(prefix))?.slice(prefix.length) || "";
}

function canonicalOrigin(value) {
  const url = new URL(String(value || DEFAULT_ORIGIN).trim());
  if (!/^https?:$/.test(url.protocol)) throw new Error("Audit origin must use HTTP or HTTPS.");
  return url.origin;
}

function comparableUrl(value) {
  const url = new URL(value);
  url.hash = "";
  if (url.pathname !== "/") url.pathname = url.pathname.replace(/\/+$/, "");
  return url.toString();
}

function xmlText(value) {
  return value
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'");
}

function sitemapLocations(xml) {
  return [...xml.matchAll(/<loc>([\s\S]*?)<\/loc>/gi)]
    .map((match) => xmlText(match[1].trim()))
    .filter(Boolean);
}

function attribute(tag, name) {
  const match = tag.match(new RegExp(`\\s${name}\\s*=\\s*(?:"([^"]*)"|'([^']*)'|([^\\s>]+))`, "i"));
  return match?.[1] ?? match?.[2] ?? match?.[3] ?? "";
}

function namedMeta(html, name) {
  for (const match of html.matchAll(/<meta\b[^>]*>/gi)) {
    if (attribute(match[0], "name").toLowerCase() === name.toLowerCase()) {
      return attribute(match[0], "content");
    }
  }
  return "";
}

function canonicalHref(html) {
  for (const match of html.matchAll(/<link\b[^>]*>/gi)) {
    const rel = attribute(match[0], "rel").toLowerCase().split(/\s+/);
    if (rel.includes("canonical")) return attribute(match[0], "href");
  }
  return "";
}

function documentTitle(html) {
  return html.match(/<title\b[^>]*>([\s\S]*?)<\/title>/i)?.[1]?.replace(/\s+/g, " ").trim() || "";
}

function headingCount(html) {
  return [...html.matchAll(/<h1\b[^>]*>/gi)].length;
}

function jsonLdBlocks(html) {
  const blocks = [];
  for (const match of html.matchAll(/<script\b[^>]*>[\s\S]*?<\/script>/gi)) {
    const openingTag = match[0].match(/^<script\b[^>]*>/i)?.[0] || "";
    if (attribute(openingTag, "type").toLowerCase() !== "application/ld+json") continue;
    blocks.push(match[0].replace(/^<script\b[^>]*>/i, "").replace(/<\/script>$/i, "").trim());
  }
  return blocks;
}

function anchorHrefs(html) {
  return [...html.matchAll(/<a\b[^>]*>/gi)]
    .map((match) => attribute(match[0], "href"))
    .filter(Boolean);
}

async function fetchResource(url, accept) {
  const startedAt = Date.now();
  const response = await fetch(url, {
    headers: {
      accept,
      "user-agent": GOOGLEBOT_USER_AGENT,
    },
    redirect: "manual",
    signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
  });
  return {
    url,
    status: response.status,
    contentType: response.headers.get("content-type") || "",
    elapsedMs: Date.now() - startedAt,
    body: await response.text(),
  };
}

async function inBatches(values, size, callback) {
  const output = [];
  for (let index = 0; index < values.length; index += size) {
    output.push(...await Promise.all(values.slice(index, index + size).map(callback)));
  }
  return output;
}

const origin = canonicalOrigin(argumentValue("origin") || process.env.SEO_AUDIT_ORIGIN);
const outputPath = argumentValue("output");
const failures = [];
const warnings = [];
const fail = (scope, message) => failures.push({ scope, message });

const robotsUrl = new URL("/robots.txt", `${origin}/`).toString();
const sitemapUrl = new URL("/sitemap.xml", `${origin}/`).toString();
const [robots, sitemapIndex] = await Promise.all([
  fetchResource(robotsUrl, "text/plain,*/*;q=0.1"),
  fetchResource(sitemapUrl, "application/xml,text/xml;q=0.9,*/*;q=0.1"),
]);

if (robots.status !== 200) fail("robots", `Expected HTTP 200, received ${robots.status}.`);
if (!/^text\/plain\b/i.test(robots.contentType)) fail("robots", `Unexpected content type ${robots.contentType || "(missing)"}.`);
if (!new RegExp(`^Sitemap:\\s*${sitemapUrl.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\s*$`, "im").test(robots.body)) {
  fail("robots", "The canonical sitemap index is not declared.");
}
if (/^Disallow:\s*\/$/im.test(robots.body)) fail("robots", "The root path is disallowed.");

if (sitemapIndex.status !== 200) fail("sitemap-index", `Expected HTTP 200, received ${sitemapIndex.status}.`);
if (!/(?:application|text)\/xml\b/i.test(sitemapIndex.contentType)) {
  fail("sitemap-index", `Unexpected content type ${sitemapIndex.contentType || "(missing)"}.`);
}

const childSitemapUrls = sitemapLocations(sitemapIndex.body);
if (!childSitemapUrls.length) fail("sitemap-index", "No child sitemap URLs were found.");
if (new Set(childSitemapUrls).size !== childSitemapUrls.length) fail("sitemap-index", "Duplicate child sitemap URLs were found.");

for (const url of childSitemapUrls) {
  let parsed;
  try {
    parsed = new URL(url);
  } catch {
    fail("sitemap-index", `Invalid child sitemap URL: ${url}`);
    continue;
  }
  if (parsed.origin !== origin) fail("sitemap-index", `Cross-origin child sitemap: ${url}`);
}

const childSitemaps = await inBatches(childSitemapUrls, 4, (url) => fetchResource(url, "application/xml,text/xml;q=0.9,*/*;q=0.1"));
const sitemapEntries = [];

for (const child of childSitemaps) {
  if (child.status !== 200) fail(child.url, `Expected HTTP 200, received ${child.status}.`);
  if (!/(?:application|text)\/xml\b/i.test(child.contentType)) fail(child.url, `Unexpected content type ${child.contentType || "(missing)"}.`);
  const locations = sitemapLocations(child.body);
  if (!locations.length) fail(child.url, "No page URLs were found.");
  if (locations.length > MAX_SITEMAP_URLS) fail(child.url, `Contains ${locations.length} URLs; maximum is ${MAX_SITEMAP_URLS}.`);
  for (const url of locations) sitemapEntries.push({ sitemap: child.url, url });
}

const pageUrls = sitemapEntries.map((entry) => entry.url);
if (new Set(pageUrls).size !== pageUrls.length) fail("sitemaps", "Duplicate page URLs were found across child sitemaps.");
for (const url of pageUrls) {
  try {
    if (new URL(url).origin !== origin) fail("sitemaps", `Cross-origin page URL: ${url}`);
  } catch {
    fail("sitemaps", `Invalid absolute page URL: ${url}`);
  }
}

const pages = await inBatches(pageUrls, 6, async (url) => {
  try {
    return await fetchResource(url, "text/html,application/xhtml+xml;q=0.9,*/*;q=0.1");
  } catch (error) {
    fail(url, `Fetch failed: ${error.message}`);
    return { url, status: 0, contentType: "", elapsedMs: 0, body: "" };
  }
});

const pageDetails = [];
const titleOwners = new Map();
const descriptionOwners = new Map();

for (const page of pages) {
  const title = documentTitle(page.body);
  const description = namedMeta(page.body, "description").trim();
  const robotsDirective = namedMeta(page.body, "robots");
  const canonical = canonicalHref(page.body);
  const h1Count = headingCount(page.body);
  const jsonLd = jsonLdBlocks(page.body);
  const links = anchorHrefs(page.body);

  if (page.status !== 200) fail(page.url, `Expected HTTP 200, received ${page.status}.`);
  if (!/^text\/html\b/i.test(page.contentType)) fail(page.url, `Unexpected content type ${page.contentType || "(missing)"}.`);
  if (!title) fail(page.url, "Missing document title.");
  if (!description) fail(page.url, "Missing meta description.");
  if (!canonical) {
    fail(page.url, "Missing canonical link.");
  } else {
    try {
      if (comparableUrl(new URL(canonical, page.url)) !== comparableUrl(page.url)) {
        fail(page.url, `Canonical points elsewhere: ${canonical}`);
      }
    } catch {
      fail(page.url, `Invalid canonical URL: ${canonical}`);
    }
  }
  if (/\bnoindex\b/i.test(robotsDirective)) fail(page.url, "Robots metadata contains noindex.");
  if (h1Count !== 1) fail(page.url, `Expected exactly one H1, found ${h1Count}.`);
  if (!jsonLd.length) fail(page.url, "No JSON-LD block found.");
  for (const block of jsonLd) {
    try {
      JSON.parse(block);
    } catch (error) {
      fail(page.url, `Invalid JSON-LD: ${error.message}`);
    }
  }

  if (title) titleOwners.set(title, [...(titleOwners.get(title) || []), page.url]);
  if (description) descriptionOwners.set(description, [...(descriptionOwners.get(description) || []), page.url]);
  pageDetails.push({
    url: page.url,
    elapsedMs: page.elapsedMs,
    title,
    description,
    links,
  });
}

for (const [title, urls] of titleOwners) {
  if (urls.length > 1) fail("titles", `Duplicate title on ${urls.join(", ")}: ${title}`);
}
for (const [description, urls] of descriptionOwners) {
  if (urls.length > 1) warnings.push({ scope: "descriptions", message: `Duplicate description on ${urls.join(", ")}: ${description}` });
}

const homeComparable = comparableUrl(`${origin}/`);
const sitemapUrlByComparable = new Map(pageUrls.map((url) => [comparableUrl(url), url]));
const cachedPages = new Map(pageDetails.map((page) => [comparableUrl(page.url), page]));
const disallowedPrefixes = [...robots.body.matchAll(/^Disallow:\s*(\S+)\s*$/gim)]
  .map((match) => match[1])
  .filter((value) => value && value !== "/");
const discoveryQueue = [homeComparable];
const discoveredPages = new Set(discoveryQueue);

function crawlTarget(href, sourceUrl) {
  if (/^(?:mailto:|tel:|javascript:|data:)/i.test(href)) return "";
  let target;
  try {
    target = new URL(href, sourceUrl);
  } catch {
    return "";
  }
  if (target.origin !== origin || !/^https?:$/.test(target.protocol)) return "";
  if (disallowedPrefixes.some((prefix) => target.pathname.startsWith(prefix))) return "";
  if (/\.[A-Za-z0-9]{2,8}$/.test(target.pathname)) return "";
  target.hash = "";
  return comparableUrl(target);
}

for (let index = 0; index < discoveryQueue.length && index < MAX_DISCOVERY_PAGES; index += 1) {
  const currentUrl = discoveryQueue[index];
  let page = cachedPages.get(currentUrl);
  if (!page) {
    let response;
    try {
      response = await fetchResource(currentUrl, "text/html,application/xhtml+xml;q=0.9,*/*;q=0.1");
    } catch (error) {
      fail(currentUrl, `Internal crawl fetch failed: ${error.message}`);
      continue;
    }
    if (response.status !== 200) {
      fail(currentUrl, `Internal HTML link returned HTTP ${response.status}.`);
      continue;
    }
    if (!/^text\/html\b/i.test(response.contentType)) continue;
    page = { url: currentUrl, links: anchorHrefs(response.body) };
    cachedPages.set(currentUrl, page);
  }

  for (const href of page.links) {
    const target = crawlTarget(href, page.url);
    if (!target || discoveredPages.has(target)) continue;
    if (discoveredPages.size >= MAX_DISCOVERY_PAGES) {
      warnings.push({ scope: "internal-crawl", message: `Stopped after ${MAX_DISCOVERY_PAGES} HTML pages.` });
      break;
    }
    discoveredPages.add(target);
    discoveryQueue.push(target);
  }
}

for (const [url, originalUrl] of sitemapUrlByComparable) {
  if (url !== homeComparable && !discoveredPages.has(url)) {
    warnings.push({ scope: originalUrl, message: "Not discoverable through normal HTML links from the homepage." });
  }
}

const discoveredOutsideSitemaps = [...discoveredPages]
  .filter((url) => !sitemapUrlByComparable.has(url))
  .sort();
for (const url of discoveredOutsideSitemaps) {
  warnings.push({ scope: url, message: "Discoverable HTML URL is missing from the sitemap." });
}

const elapsedValues = pages.map((page) => page.elapsedMs).filter((value) => Number.isFinite(value));
const result = {
  auditedAt: new Date().toISOString(),
  origin,
  summary: {
    robotsStatus: robots.status,
    sitemapIndexStatus: sitemapIndex.status,
    childSitemapCount: childSitemaps.length,
    publicUrlCount: pageUrls.length,
    indexableUrlCount: pages.filter((page) => page.status === 200).length,
    crawlableHtmlPageCount: discoveredPages.size,
    discoveredOutsideSitemapCount: discoveredOutsideSitemaps.length,
    maxResponseMs: elapsedValues.length ? Math.max(...elapsedValues) : 0,
    failureCount: failures.length,
    warningCount: warnings.length,
  },
  childSitemaps: childSitemaps.map((child) => ({
    url: child.url,
    status: child.status,
    contentType: child.contentType,
    urlCount: sitemapLocations(child.body).length,
  })),
  discoveredOutsideSitemaps,
  failures,
  warnings,
};

const serialized = `${JSON.stringify(result, null, 2)}\n`;
if (outputPath) {
  await mkdir(path.dirname(path.resolve(outputPath)), { recursive: true });
  await writeFile(outputPath, serialized);
}
process.stdout.write(serialized);
if (failures.length) process.exitCode = 1;
