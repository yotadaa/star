import assert from "node:assert/strict";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright-core";

const here = path.dirname(fileURLToPath(import.meta.url));
const baseUrl = process.env.STAR_BASE_URL || "http://127.0.0.1:3123";
await mkdir(path.join(here, "screenshots"), { recursive: true });

function parseColor(value) {
  const values = String(value).match(/[\d.]+/g)?.map(Number) || [];
  return values.slice(0, 3);
}

function luminance([red, green, blue]) {
  const channels = [red, green, blue].map((channel) => {
    const value = channel / 255;
    return value <= 0.03928 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
  });
  return channels[0] * 0.2126 + channels[1] * 0.7152 + channels[2] * 0.0722;
}

function contrastRatio(foreground, background) {
  const light = Math.max(luminance(foreground), luminance(background));
  const dark = Math.min(luminance(foreground), luminance(background));
  return (light + 0.05) / (dark + 0.05);
}

async function screenshot(locator, name) {
  await locator.screenshot({ path: path.join(here, "screenshots", name), animations: "disabled" });
}

const initialHtml = await fetch(`${baseUrl}/`).then(async (response) => {
  assert.equal(response.status, 200, "Home initial document must return 200");
  return response.text();
});

const initialDocument = {
  hasResponsivePicture: initialHtml.includes("<picture>"),
  hasMobileMountains: initialHtml.includes("/assets/parallax/optimized/mobile/mountains.webp"),
  hasHighPriorityHero: initialHtml.includes('fetchPriority="high"'),
  hasOptimizedBlogImages: initialHtml.includes("/_next/image?url="),
};
assert.ok(Object.values(initialDocument).every(Boolean), "Initial HTML is missing a required Hero or Blog image contract");

const browser = await chromium.launch({ headless: true });
const results = { initialDocument };

async function openPage({ width, height, reducedMotion = "no-preference", phase = "morning" }) {
  const context = await browser.newContext({
    viewport: { width, height },
    deviceScaleFactor: width <= 640 ? 1.75 : 1,
    reducedMotion,
  });
  await context.addInitScript((savedPhase) => localStorage.setItem("cockpit-phase", savedPhase), phase);
  const page = await context.newPage();
  const requests = [];
  const errors = [];
  page.on("request", (request) => requests.push(request.url()));
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(message.text());
  });
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto(`${baseUrl}/`, { waitUntil: "networkidle", timeout: 60_000 });
  await page.waitForTimeout(1_200);
  return { context, page, requests, errors };
}

const mobile = await openPage({ width: 412, height: 823 });
const mobileHero = await mobile.page.evaluate(() => ({
  renderer: document.querySelector(".parallax-scene-shell")?.dataset.renderer,
  canvasCount: document.querySelectorAll(".hero canvas").length,
  overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
  nalaSource: document.querySelector(".nala-fab img")?.currentSrc,
  questRole: document.querySelector(".questlog")?.getAttribute("role"),
  hudRole: document.querySelector(".questlog .hud-strip")?.getAttribute("role"),
  readLabels: [...document.querySelectorAll(".blog-card-actions a:first-child")].map((link) => link.getAttribute("aria-label")),
  footerDecoration: getComputedStyle(document.querySelector(".foot-copy a")).textDecorationLine,
  glimpseAnimation: getComputedStyle(document.querySelector(".glimpse-slide.active")).animationName,
  glimpseDotTransition: getComputedStyle(document.querySelector(".glimpse-dot")).transitionProperty,
  blogSources: [...document.querySelectorAll(".blog-card-cover img")].map((image) => image.currentSrc).filter(Boolean),
}));

const webglChunkPattern = /b79b|bd904|b536|5847|3511/;
const mobileWebglRequests = mobile.requests.filter((url) => webglChunkPattern.test(url));
const heroAssetRequests = mobile.requests.filter((url) => url.includes("/assets/parallax/optimized/mobile/"));
const heroRequestCounts = Object.fromEntries(
  [...new Set(heroAssetRequests)].map((url) => [new URL(url).pathname, heroAssetRequests.filter((candidate) => candidate === url).length])
);
assert.equal(mobileHero.renderer, "static");
assert.equal(mobileHero.canvasCount, 0);
assert.equal(mobileHero.overflow, 0);
assert.equal(mobileWebglRequests.length, 0);
assert.ok(Object.values(heroRequestCounts).every((count) => count === 1), "Mobile Hero assets must not transfer twice after hydration");
assert.ok(mobileHero.nalaSource.endsWith("nala-idle-pixel.webp"));
assert.equal(mobileHero.questRole, null);
assert.equal(mobileHero.hudRole, null);
assert.equal(new Set(mobileHero.readLabels).size, mobileHero.readLabels.length);
assert.ok(mobileHero.readLabels.every(Boolean));
assert.ok(mobileHero.footerDecoration.includes("underline"));
assert.equal(mobileHero.glimpseAnimation, "none");
assert.equal(mobileHero.glimpseDotTransition, "transform");
assert.ok(mobileHero.blogSources.every((source) => source.includes("/_next/image?")));
assert.deepEqual(mobile.errors, []);

const contrast = await mobile.page.evaluate(() => {
  const entries = [
    ...[...document.querySelectorAll(".section-band:not(.glimpse-band) .section-head .pixel-label")].map((element) => ({
      name: element.textContent.trim(),
      color: getComputedStyle(element).color,
      background: getComputedStyle(element.closest(".section-band")).backgroundColor,
    })),
    ...[...document.querySelectorAll(".blog-card-meta, .blog-card-actions a")].map((element) => ({
      name: element.textContent.trim(),
      color: getComputedStyle(element).color,
      background: getComputedStyle(element.closest(".blog-card")).backgroundColor,
    })),
  ];
  return entries;
});
const contrastResults = contrast.map((entry) => ({
  ...entry,
  ratio: Number(contrastRatio(parseColor(entry.color), parseColor(entry.background)).toFixed(2)),
}));
assert.ok(contrastResults.every((entry) => entry.ratio >= 4.5), JSON.stringify(contrastResults, null, 2));

await screenshot(mobile.page.locator(".hero"), "mobile-morning.png");
for (const phase of ["noon", "sunset", "night"]) {
  await mobile.page.getByTestId("daynight-toggle").click();
  await mobile.page.waitForTimeout(350);
  assert.equal(await mobile.page.getByTestId("daynight-toggle").getAttribute("data-phase"), phase);
  await screenshot(mobile.page.locator(".hero"), `mobile-${phase}.png`);
}

await mobile.page.locator("#project-previews").scrollIntoViewIfNeeded();
await mobile.page.waitForTimeout(250);
await screenshot(mobile.page.locator("#project-previews"), "mobile-glimpses.png");
await mobile.page.locator("#featured-blog").scrollIntoViewIfNeeded();
await screenshot(mobile.page.locator("#featured-blog"), "mobile-featured-blog.png");
await mobile.page.getByTestId("open-nala").click();
await mobile.page.waitForTimeout(250);
assert.equal(await mobile.page.locator("#nala-message").evaluate((input) => document.activeElement === input), true);
assert.ok((await mobile.page.locator(".nala-panel img").first().getAttribute("src")).endsWith(".webp"));
await screenshot(mobile.page.locator(".nala-panel"), "mobile-nala-open.png");
await mobile.page.locator("footer.site-footer").scrollIntoViewIfNeeded();
await screenshot(mobile.page.locator("footer.site-footer"), "mobile-footer.png");

results.mobile = {
  ...mobileHero,
  mobileWebglRequests,
  heroRequestCounts,
  contrast: contrastResults,
  consoleErrors: mobile.errors,
};
await mobile.context.close();

const reduced = await openPage({ width: 375, height: 812, reducedMotion: "reduce", phase: "night" });
const reducedResult = await reduced.page.evaluate(() => ({
  renderer: document.querySelector(".parallax-scene-shell")?.dataset.renderer,
  canvasCount: document.querySelectorAll(".hero canvas").length,
  runningAnimations: document.getAnimations().filter((animation) => animation.playState === "running").length,
  overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
}));
assert.equal(reducedResult.renderer, "static");
assert.equal(reducedResult.canvasCount, 0);
assert.equal(reducedResult.runningAnimations, 0);
assert.equal(reducedResult.overflow, 0);
assert.equal(reduced.requests.filter((url) => webglChunkPattern.test(url)).length, 0);
assert.deepEqual(reduced.errors, []);
await screenshot(reduced.page.locator(".hero"), "mobile-night-reduced.png");
results.reducedMotion = reducedResult;
await reduced.context.close();

const desktop = await openPage({ width: 1440, height: 900 });
await desktop.page.waitForFunction(() => document.querySelector(".parallax-scene-shell")?.dataset.renderer === "webgl", null, { timeout: 15_000 });
const desktopResult = await desktop.page.evaluate(() => ({
  renderer: document.querySelector(".parallax-scene-shell")?.dataset.renderer,
  canvasCount: document.querySelectorAll(".hero canvas").length,
  webglReady: document.querySelector(".parallax-scene-shell")?.dataset.webglReady,
  overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
}));
assert.equal(desktopResult.renderer, "webgl");
assert.equal(desktopResult.canvasCount, 1);
assert.equal(desktopResult.overflow, 0);
assert.ok(desktop.requests.some((url) => webglChunkPattern.test(url)));
assert.deepEqual(desktop.errors, []);
await screenshot(desktop.page.locator(".hero"), "desktop-webgl-morning.png");
await desktop.page.setViewportSize({ width: 412, height: 823 });
await desktop.page.waitForFunction(() => document.querySelector(".parallax-scene-shell")?.dataset.renderer === "static");
assert.equal(await desktop.page.locator(".hero canvas").count(), 0);
results.desktop = desktopResult;
await desktop.context.close();

await browser.close();
await writeFile(path.join(here, "audit.json"), `${JSON.stringify(results, null, 2)}\n`);
console.log(JSON.stringify(results, null, 2));
