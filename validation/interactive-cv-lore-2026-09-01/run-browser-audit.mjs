import { mkdir, writeFile } from "node:fs/promises";
import { chromium } from "playwright-core";

const baseUrl = process.env.AUDIT_BASE_URL || "http://127.0.0.1:3124";
const outputDir = new URL("./screenshots/", import.meta.url);
await mkdir(outputDir, { recursive: true });

const browser = await chromium.launch({ headless: true });
const results = [];

async function auditRoute(route, label, viewport, options = {}) {
  const context = await browser.newContext({
    viewport,
    javaScriptEnabled: options.javaScriptEnabled ?? true,
    reducedMotion: options.reducedMotion || "no-preference",
  });
  const page = await context.newPage();
  const consoleErrors = [];
  page.on("console", (message) => {
    if (message.type() === "error") consoleErrors.push(message.text());
  });
  page.on("pageerror", (error) => consoleErrors.push(error.message));

  const response = await page.goto(`${baseUrl}${route}`, { waitUntil: "networkidle" });
  const metrics = await page.evaluate(() => ({
    h1Count: document.querySelectorAll("h1").length,
    scrollWidth: document.documentElement.scrollWidth,
    clientWidth: document.documentElement.clientWidth,
    title: document.title,
    canonical: document.querySelector('link[rel="canonical"]')?.href || "",
  }));

  await page.screenshot({ path: new URL(`${label}.png`, outputDir).pathname, fullPage: options.fullPage ?? false });
  results.push({ route, label, status: response?.status(), consoleErrors, ...metrics });
  await context.close();
}

const publicRoutes = [
  ["/", "home"],
  ["/about", "about"],
  ["/projects", "projects"],
  ["/research", "research"],
  ["/blog", "blog"],
  ["/contact", "contact"],
];

for (const [route, label] of publicRoutes) {
  await auditRoute(route, `${label}-desktop`, { width: 1440, height: 1000 });
  await auditRoute(route, `${label}-mobile`, { width: 375, height: 812 });
}

await auditRoute("/", "home-tablet", { width: 768, height: 1024 });
await auditRoute("/", "home-reduced-motion", { width: 1440, height: 1000 }, { reducedMotion: "reduce" });
await auditRoute("/lore", "lore-desktop", { width: 1440, height: 1000 }, { fullPage: true });
await auditRoute("/lore", "lore-tablet", { width: 768, height: 1024 }, { fullPage: true });
await auditRoute("/lore", "lore-mobile", { width: 375, height: 812 }, { fullPage: true });
await auditRoute("/lore", "lore-reduced-motion", { width: 1440, height: 1000 }, { reducedMotion: "reduce" });
await auditRoute("/lore", "lore-no-javascript", { width: 375, height: 812 }, { javaScriptEnabled: false, fullPage: true });

const interactionContext = await browser.newContext({ viewport: { width: 1440, height: 1000 } });
const interactionPage = await interactionContext.newPage();
const interactionErrors = [];
interactionPage.on("console", (message) => {
  if (message.type() === "error") interactionErrors.push(message.text());
});
interactionPage.on("pageerror", (error) => interactionErrors.push(error.message));
await interactionPage.goto(`${baseUrl}/lore`, { waitUntil: "networkidle" });
const trigger = interactionPage.getByRole("button", { name: "Open details" }).first();
await trigger.focus();
await interactionPage.screenshot({ path: new URL("lore-focus-visible.png", outputDir).pathname });
await trigger.press("Enter");
const dialog = interactionPage.locator("dialog").first();
const openedByKeyboard = await dialog.evaluate((node) => node.open);
await interactionPage.screenshot({ path: new URL("lore-dialog-desktop.png", outputDir).pathname });
await interactionPage.keyboard.press("Escape");
const escapedClosed = !(await dialog.evaluate((node) => node.open));
const focusReturnedAfterEscape = await trigger.evaluate((node) => document.activeElement === node);
await trigger.click();
await interactionPage.mouse.click(4, 4);
const backdropClosed = !(await dialog.evaluate((node) => node.open));
await trigger.click();
await interactionPage.getByRole("button", { name: /Close details for/ }).click();
const closeButtonClosed = !(await dialog.evaluate((node) => node.open));

const homeChecks = await interactionPage.goto(`${baseUrl}/`, { waitUntil: "networkidle" }).then(() => interactionPage.evaluate(() => ({
  loreLink: Boolean(document.querySelector('a[href="/lore"]')),
  loreInPrimaryNavigation: Boolean(document.querySelector('header a[href="/lore"], nav a[href="/lore"]')),
  featuredBlogLinks: new Set([...document.querySelectorAll('#featured-blog a[href^="/blog/"]')].map((node) => node.getAttribute("href"))).size,
})));
await interactionPage.locator("#featured-blog").screenshot({ path: new URL("home-featured-blog-desktop.png", outputDir).pathname });

const mobileContext = await browser.newContext({ viewport: { width: 375, height: 812 } });
const mobilePage = await mobileContext.newPage();
await mobilePage.goto(`${baseUrl}/`, { waitUntil: "networkidle" });
await mobilePage.locator("#featured-blog").screenshot({ path: new URL("home-featured-blog-mobile.png", outputDir).pathname });
await mobilePage.goto(`${baseUrl}/lore`, { waitUntil: "networkidle" });
await mobilePage.getByRole("button", { name: "Open details" }).first().click();
const mobileDialog = mobilePage.locator("dialog").first();
const mobileDialogBox = await mobileDialog.boundingBox();
await mobilePage.screenshot({ path: new URL("lore-dialog-mobile.png", outputDir).pathname });
await mobileContext.close();

results.push({
  label: "lore-interactions",
  openedByKeyboard,
  escapedClosed,
  focusReturnedAfterEscape,
  backdropClosed,
  closeButtonClosed,
  consoleErrors: interactionErrors,
  mobileDialogBox,
  homeChecks,
});

await interactionContext.close();
await browser.close();

await writeFile(new URL("../browser-results.json", outputDir), `${JSON.stringify(results, null, 2)}\n`);
console.log(JSON.stringify(results, null, 2));
