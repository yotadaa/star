import { mkdir, writeFile } from "node:fs/promises";
import { chromium } from "playwright-core";

const baseUrl = process.env.AUDIT_BASE_URL || "http://127.0.0.1:3126";
const outputDir = new URL("./screenshots/", import.meta.url);
await mkdir(outputDir, { recursive: true });

const browser = await chromium.launch({ headless: true });

async function installMeasurementInterception(page, requestLog) {
  await page.route(/https:\/\/www\.googletagmanager\.com\/gtag\/js.*/, async (route) => {
    requestLog.push(route.request().url());
    await route.fulfill({ status: 200, contentType: "application/javascript", body: "/* GA loader intercepted by local validation */" });
  });
  await page.route(/https:\/\/(?:www\.)?(?:google-analytics|analytics\.google)\.com\/.*/, async (route) => {
    requestLog.push(route.request().url());
    await route.abort("blockedbyclient");
  });
}

async function analyticsState(page) {
  return page.evaluate(() => {
    const commands = (window.dataLayer || []).map((entry) => Array.from(entry, (value) => (
      value instanceof Date ? value.toISOString() : value
    )));
    const externalScripts = [...document.querySelectorAll('script[src^="https://www.googletagmanager.com/gtag/js?"]')];
    const measurementId = externalScripts.length === 1
      ? new URL(externalScripts[0].src).searchParams.get("id")
      : "";
    return {
      measurementId,
      measurementIdIsValid: /^G-[A-Z0-9]{6,20}$/.test(measurementId),
      externalScriptCount: externalScripts.length,
      inlineScriptCount: document.querySelectorAll("script#google-analytics").length,
      configCount: commands.filter((entry) => entry[0] === "config" && entry[1] === measurementId).length,
      hasJsCommand: commands.some((entry) => entry[0] === "js"),
      commands,
      scrollWidth: document.documentElement.scrollWidth,
      clientWidth: document.documentElement.clientWidth,
    };
  });
}

const desktopContext = await browser.newContext({ viewport: { width: 1440, height: 1000 } });
const desktopPage = await desktopContext.newPage();
const desktopRequests = [];
const desktopErrors = [];
await installMeasurementInterception(desktopPage, desktopRequests);
desktopPage.on("console", (message) => {
  if (message.type() === "error") desktopErrors.push(message.text());
});
desktopPage.on("pageerror", (error) => desktopErrors.push(error.message));

const homeResponse = await desktopPage.goto(`${baseUrl}/`, { waitUntil: "networkidle" });
await desktopPage.waitForFunction(() => (
  (window.dataLayer || []).some((entry) => entry[0] === "config" && /^G-[A-Z0-9]{6,20}$/.test(entry[1]))
));
const homeState = await analyticsState(desktopPage);
await desktopPage.screenshot({ path: new URL("home-desktop.png", outputDir).pathname });

await desktopPage.getByRole("link", { name: "About", exact: true }).click();
await desktopPage.waitForURL(`${baseUrl}/about`);
await desktopPage.waitForLoadState("networkidle");
const aboutAfterClientNavigation = await analyticsState(desktopPage);

const mobileContext = await browser.newContext({ viewport: { width: 375, height: 812 } });
const mobilePage = await mobileContext.newPage();
const mobileRequests = [];
const mobileErrors = [];
await installMeasurementInterception(mobilePage, mobileRequests);
mobilePage.on("console", (message) => {
  if (message.type() === "error") mobileErrors.push(message.text());
});
mobilePage.on("pageerror", (error) => mobileErrors.push(error.message));
const aboutResponse = await mobilePage.goto(`${baseUrl}/about`, { waitUntil: "networkidle" });
await mobilePage.waitForFunction(() => (
  (window.dataLayer || []).some((entry) => entry[0] === "config" && /^G-[A-Z0-9]{6,20}$/.test(entry[1]))
));
const aboutMobileState = await analyticsState(mobilePage);
await mobilePage.screenshot({ path: new URL("about-mobile.png", outputDir).pathname });

const result = {
  measurementId: homeState.measurementId,
  home: {
    status: homeResponse?.status(),
    ...homeState,
    requests: desktopRequests,
    consoleErrors: desktopErrors,
  },
  aboutAfterClientNavigation,
  aboutMobile: {
    status: aboutResponse?.status(),
    ...aboutMobileState,
    requests: mobileRequests,
    consoleErrors: mobileErrors,
  },
  assertions: {
    configuredMeasurementIdIsValid: homeState.measurementIdIsValid && aboutMobileState.measurementIdIsValid,
    sameMeasurementIdAcrossRoutes: homeState.measurementId === aboutAfterClientNavigation.measurementId
      && homeState.measurementId === aboutMobileState.measurementId,
    homeHasOneLoader: homeState.externalScriptCount === 1,
    homeHasOneConfigScript: homeState.inlineScriptCount === 1,
    homeHasOneConfigCommand: homeState.configCount === 1,
    homeHasJsCommand: homeState.hasJsCommand,
    clientNavigationDidNotDuplicateLoader: aboutAfterClientNavigation.externalScriptCount === 1,
    clientNavigationDidNotDuplicateConfig: aboutAfterClientNavigation.configCount === 1,
    mobileHasOneLoaderAndConfig: aboutMobileState.externalScriptCount === 1 && aboutMobileState.configCount === 1,
    noDesktopOverflow: homeState.scrollWidth === homeState.clientWidth,
    noMobileOverflow: aboutMobileState.scrollWidth === aboutMobileState.clientWidth,
    noConsoleErrors: desktopErrors.length === 0 && mobileErrors.length === 0,
    onlyInterceptedGoogleRequests: [...desktopRequests, ...mobileRequests].every((url) => url.includes("googletagmanager.com/gtag/js")),
  },
};

const redactedResult = JSON.parse(JSON.stringify(result, (_key, value) => (
  typeof value === "string"
    ? value.replace(/G-[A-Z0-9]{6,20}/g, "[configured-ga-measurement-id]")
    : value
)));

await writeFile(new URL("./browser-results.json", import.meta.url), `${JSON.stringify(redactedResult, null, 2)}\n`);
console.log(JSON.stringify(redactedResult, null, 2));

await desktopContext.close();
await mobileContext.close();
await browser.close();

if (Object.values(result.assertions).some((value) => value !== true)) process.exitCode = 1;
