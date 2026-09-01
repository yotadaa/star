import assert from "node:assert/strict";
import { writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright-core";

const here = path.dirname(fileURLToPath(import.meta.url));
const baseUrl = process.env.STAR_BASE_URL || "http://127.0.0.1:3123";
const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({
  viewport: { width: 412, height: 823 },
  deviceScaleFactor: 1.75,
  reducedMotion: "no-preference",
});
await context.addInitScript(() => {
  localStorage.setItem("cockpit-phase", "morning");
  window.__pageSpeedEvidence = { longTasks: [], lcp: null, cls: 0 };
  new PerformanceObserver((list) => {
    window.__pageSpeedEvidence.longTasks.push(...list.getEntries().map((entry) => ({
      startTime: entry.startTime,
      duration: entry.duration,
    })));
  }).observe({ type: "longtask", buffered: true });
  new PerformanceObserver((list) => {
    const entry = list.getEntries().at(-1);
    if (!entry) return;
    window.__pageSpeedEvidence.lcp = {
      startTime: entry.startTime,
      size: entry.size,
      url: entry.url,
      tagName: entry.element?.tagName || "",
      className: entry.element?.className || "",
      source: entry.element?.currentSrc || entry.element?.src || "",
    };
  }).observe({ type: "largest-contentful-paint", buffered: true });
  new PerformanceObserver((list) => {
    for (const entry of list.getEntries()) {
      if (!entry.hadRecentInput) window.__pageSpeedEvidence.cls += entry.value;
    }
  }).observe({ type: "layout-shift", buffered: true });
});

const page = await context.newPage();
const client = await context.newCDPSession(page);
await client.send("Network.enable");
await client.send("Network.setCacheDisabled", { cacheDisabled: true });
await client.send("Network.emulateNetworkConditions", {
  offline: false,
  latency: 150,
  downloadThroughput: 200 * 1024,
  uploadThroughput: 94 * 1024,
  connectionType: "cellular4g",
});
await client.send("Emulation.setCPUThrottlingRate", { rate: 4 });

const transfers = new Map();
const requestUrls = new Map();
const consoleErrors = [];
client.on("Network.requestWillBeSent", ({ requestId, request }) => requestUrls.set(requestId, request.url));
client.on("Network.loadingFinished", ({ requestId, encodedDataLength }) => {
  const url = requestUrls.get(requestId);
  if (url) transfers.set(url, (transfers.get(url) || 0) + encodedDataLength);
});
page.on("console", (message) => {
  if (message.type() === "error") consoleErrors.push(message.text());
});
page.on("pageerror", (error) => consoleErrors.push(error.message));

await page.goto(`${baseUrl}/`, { waitUntil: "networkidle", timeout: 90_000 });
await page.waitForTimeout(2_000);

const observed = await page.evaluate(() => {
  const fcp = performance.getEntriesByName("first-contentful-paint")[0];
  const longTasks = window.__pageSpeedEvidence.longTasks;
  return {
    renderer: document.querySelector(".parallax-scene-shell")?.dataset.renderer,
    canvasCount: document.querySelectorAll(".hero canvas").length,
    overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
    fcpMs: Math.round(fcp?.startTime || 0),
    lcp: window.__pageSpeedEvidence.lcp
      ? { ...window.__pageSpeedEvidence.lcp, startTime: Math.round(window.__pageSpeedEvidence.lcp.startTime) }
      : null,
    cls: Number(window.__pageSpeedEvidence.cls.toFixed(4)),
    longTaskCount: longTasks.length,
    longTaskTotalMs: Math.round(longTasks.reduce((total, entry) => total + entry.duration, 0)),
    blockingTimeAbove50Ms: Math.round(longTasks.reduce((total, entry) => total + Math.max(0, entry.duration - 50), 0)),
    maxLongTaskMs: Math.round(Math.max(0, ...longTasks.map((entry) => entry.duration))),
  };
});

const webglPattern = /b79b|bd904|b536|5847|3511/;
const heroTransfers = [...transfers]
  .filter(([url]) => url.includes("/assets/parallax/optimized/mobile/"))
  .map(([url, bytes]) => ({ url: new URL(url).pathname, bytes }));
const result = {
  profile: {
    viewport: "412x823",
    deviceScaleFactor: 1.75,
    network: "150 ms RTT, 1.6 Mbps down, 752 Kbps up",
    cpuThrottle: "4x",
  },
  ...observed,
  transferTotalBytes: Math.round([...transfers.values()].reduce((total, bytes) => total + bytes, 0)),
  heroTransferBytes: heroTransfers.reduce((total, entry) => total + entry.bytes, 0),
  heroTransfers,
  webglRequests: [...transfers.keys()].filter((url) => webglPattern.test(url)),
  consoleErrors,
};

assert.equal(result.renderer, "static");
assert.equal(result.canvasCount, 0);
assert.equal(result.overflow, 0);
assert.equal(result.webglRequests.length, 0);
assert.equal(new Set(heroTransfers.map((entry) => entry.url)).size, 4);
assert.deepEqual(consoleErrors, []);

await writeFile(path.join(here, "performance.json"), `${JSON.stringify(result, null, 2)}\n`);
console.log(JSON.stringify(result, null, 2));
await browser.close();
