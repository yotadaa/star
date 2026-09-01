import assert from "node:assert/strict";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright-core";

const here = path.dirname(fileURLToPath(import.meta.url));
const baseUrl = process.env.AUDIT_BASE_URL || "http://127.0.0.1:3123";
const screenshotsDir = path.join(here, "screenshots");
await mkdir(screenshotsDir, { recursive: true });

function decodeXml(value) {
  return value
    .replaceAll("&amp;", "&")
    .replaceAll("&lt;", "<")
    .replaceAll("&gt;", ">")
    .replaceAll("&quot;", '"')
    .replaceAll("&apos;", "'");
}

function sitemapLocations(xml) {
  return [...xml.matchAll(/<loc>([\s\S]*?)<\/loc>/gi)]
    .map((match) => decodeXml(match[1].trim()));
}

function localPath(absoluteUrl) {
  const url = new URL(absoluteUrl);
  return `${url.pathname}${url.search}`;
}

function analyticsMarkup(html, pathname) {
  const head = html.match(/<head\b[^>]*>([\s\S]*?)<\/head>/i)?.[1] || "";
  const loaders = [...html.matchAll(/<script\b[^>]*src=["']https:\/\/www\.googletagmanager\.com\/gtag\/js\?id=([^"']+)["'][^>]*><\/script>/gi)];
  const inlineScripts = [...html.matchAll(/<script\b[^>]*id=["']google-analytics["'][^>]*>([\s\S]*?)<\/script>/gi)];
  const measurementId = loaders[0]?.[1] || "";
  return {
    pathname,
    measurementId,
    loaderCount: loaders.length,
    inlineScriptCount: inlineScripts.length,
    loaderInHead: head.includes("https://www.googletagmanager.com/gtag/js?id="),
    configInHead: /id=["']google-analytics["']/.test(head),
    loaderBeforeConfig: head.indexOf("googletagmanager.com/gtag/js") < head.indexOf('id="google-analytics"'),
    configCommandCount: inlineScripts.filter((match) => match[1].includes(`gtag('config', \"${measurementId}\")`)).length,
  };
}

async function fetchText(pathname, expectedStatus = 200) {
  const response = await fetch(`${baseUrl}${pathname}`, { redirect: "manual" });
  assert.equal(response.status, expectedStatus, `${pathname} returned HTTP ${response.status}`);
  return response.text();
}

const sitemapPaths = ["/sitemap-pages.xml", "/sitemap-blog.xml"];
const publicPaths = [];
for (const pathname of sitemapPaths) {
  const xml = await fetchText(pathname);
  publicPaths.push(...sitemapLocations(xml).map(localPath));
}
assert.equal(new Set(publicPaths).size, publicPaths.length, "Sitemap HTML URLs must be unique");

const directResults = [];
for (let index = 0; index < publicPaths.length; index += 6) {
  directResults.push(...await Promise.all(publicPaths.slice(index, index + 6).map(async (pathname) => {
    const html = await fetchText(pathname);
    return analyticsMarkup(html, pathname);
  })));
}

const extraHtmlRoutes = [
  analyticsMarkup(await fetchText("/forbidden"), "/forbidden"),
  analyticsMarkup(await fetchText("/__ga4-audit-not-found__", 404), "/__ga4-audit-not-found__"),
];
const allDocuments = [...directResults, ...extraHtmlRoutes];
const measurementIds = new Set(allDocuments.map((entry) => entry.measurementId));
assert.equal(measurementIds.size, 1, "Every HTML document must use the same GA measurement ID");
assert.match([...measurementIds][0], /^G-[A-Z0-9]{6,20}$/);
for (const entry of allDocuments) {
  assert.equal(entry.loaderCount, 1, `${entry.pathname} must contain one GA loader`);
  assert.equal(entry.inlineScriptCount, 1, `${entry.pathname} must contain one GA config script`);
  assert.equal(entry.loaderInHead, true, `${entry.pathname} loader must be in head`);
  assert.equal(entry.configInHead, true, `${entry.pathname} config must be in head`);
  assert.equal(entry.loaderBeforeConfig, true, `${entry.pathname} loader must precede config`);
  assert.equal(entry.configCommandCount, 1, `${entry.pathname} must configure GA once`);
}

const browser = await chromium.launch({ headless: true });

async function interceptGoogle(page, requests) {
  await page.route(/https:\/\/www\.googletagmanager\.com\/gtag\/js.*/, async (route) => {
    requests.push(route.request().url());
    await route.fulfill({
      status: 200,
      contentType: "application/javascript",
      body: "/* Google tag loader intercepted by local validation. */",
    });
  });
  await page.route(/https:\/\/(?:www\.)?(?:google-analytics|analytics\.google)\.com\/.*/, async (route) => {
    requests.push(route.request().url());
    await route.abort("blockedbyclient");
  });
}

async function browserState(page) {
  return page.evaluate(() => {
    const loader = document.querySelector('head script[src^="https://www.googletagmanager.com/gtag/js?"]');
    const measurementId = loader ? new URL(loader.src).searchParams.get("id") : "";
    const commands = (window.dataLayer || []).map((entry) => Array.from(entry, (value) => (
      value instanceof Date ? value.toISOString() : value
    )));
    return {
      measurementId,
      loaderCount: document.querySelectorAll('script[src^="https://www.googletagmanager.com/gtag/js?"]').length,
      headLoaderCount: document.querySelectorAll('head script[src^="https://www.googletagmanager.com/gtag/js?"]').length,
      inlineScriptCount: document.querySelectorAll("head script#google-analytics").length,
      jsCommandCount: commands.filter((entry) => entry[0] === "js").length,
      configCommandCount: commands.filter((entry) => entry[0] === "config" && entry[1] === measurementId).length,
      overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
    };
  });
}

const desktopContext = await browser.newContext({ viewport: { width: 1440, height: 900 } });
const desktopPage = await desktopContext.newPage();
const desktopRequests = [];
const desktopErrors = [];
await interceptGoogle(desktopPage, desktopRequests);
desktopPage.on("console", (message) => {
  if (message.type() === "error") desktopErrors.push(message.text());
});
desktopPage.on("pageerror", (error) => desktopErrors.push(error.message));
await desktopPage.goto(`${baseUrl}/`, { waitUntil: "networkidle" });
const homeState = await browserState(desktopPage);
await desktopPage.screenshot({ path: path.join(screenshotsDir, "home-desktop.png") });
await desktopPage.getByRole("link", { name: "About", exact: true }).click();
await desktopPage.waitForURL(`${baseUrl}/about`);
await desktopPage.waitForLoadState("networkidle");
const aboutAfterClientNavigation = await browserState(desktopPage);

const mobileContext = await browser.newContext({ viewport: { width: 375, height: 812 } });
const mobilePage = await mobileContext.newPage();
const mobileRequests = [];
const mobileErrors = [];
await interceptGoogle(mobilePage, mobileRequests);
mobilePage.on("console", (message) => {
  if (message.type() === "error") mobileErrors.push(message.text());
});
mobilePage.on("pageerror", (error) => mobileErrors.push(error.message));
await mobilePage.goto(`${baseUrl}/about`, { waitUntil: "networkidle" });
const aboutMobileState = await browserState(mobilePage);
await mobilePage.screenshot({ path: path.join(screenshotsDir, "about-mobile.png") });

for (const state of [homeState, aboutAfterClientNavigation, aboutMobileState]) {
  assert.equal(state.loaderCount, 1);
  assert.equal(state.headLoaderCount, 1);
  assert.equal(state.inlineScriptCount, 1);
  assert.equal(state.jsCommandCount, 1);
  assert.equal(state.configCommandCount, 1);
  assert.equal(state.overflow, 0);
}
assert.equal(homeState.measurementId, aboutAfterClientNavigation.measurementId);
assert.equal(homeState.measurementId, aboutMobileState.measurementId);
assert.equal(desktopRequests.filter((url) => url.includes("googletagmanager.com/gtag/js")).length, 1);
assert.equal(mobileRequests.filter((url) => url.includes("googletagmanager.com/gtag/js")).length, 1);
assert.deepEqual(desktopErrors, []);
assert.deepEqual(mobileErrors, []);

const result = {
  sitemapHtmlRouteCount: publicPaths.length,
  additionalHtmlRouteCount: extraHtmlRoutes.length,
  initialDocumentFailures: [],
  initialDocumentContract: {
    loaderCount: 1,
    inlineScriptCount: 1,
    placement: "head",
    sameMeasurementId: true,
  },
  browser: {
    home: homeState,
    aboutAfterClientNavigation,
    aboutMobile: aboutMobileState,
    interceptedLoaderRequests: desktopRequests.length + mobileRequests.length,
    consoleErrors: [...desktopErrors, ...mobileErrors],
  },
};
const redacted = JSON.parse(JSON.stringify(result, (_key, value) => (
  typeof value === "string"
    ? value.replace(/G-[A-Z0-9]{6,20}/g, "[configured-ga-measurement-id]")
    : value
)));
await writeFile(path.join(here, "audit.json"), `${JSON.stringify(redacted, null, 2)}\n`);
console.log(JSON.stringify(redacted, null, 2));

await desktopContext.close();
await mobileContext.close();
await browser.close();
