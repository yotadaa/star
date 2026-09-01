import { chromium } from "playwright-core";
const url = process.argv[2], out = process.argv[3];
const opt = Object.fromEntries(process.argv.slice(4).map(s => s.split("=")));
const executablePath = String(process.env.PLAYWRIGHT_CHROMIUM_PATH || "").trim();
const browser = await chromium.launch({
  ...(executablePath ? { executablePath } : {}),
  headless: true,
  args: ["--no-sandbox"],
});
const page = await browser.newPage({
  viewport: { width: Number(opt.w || 1440), height: Number(opt.h || 1100) },
  deviceScaleFactor: Number(opt.dsf || 2),
  userAgent: opt.ua || undefined,
});
try {
  await page.goto(url, { waitUntil: opt.until || "domcontentloaded", timeout: 120000 });
} catch (e) { console.log("nav-warn:", e.message.slice(0, 120)); }
await page.waitForTimeout(Number(opt.wait || 6000));
if (opt.find) {
  try { await page.getByText(opt.find, { exact: false }).first().scrollIntoViewIfNeeded({ timeout: 15000 }); await page.waitForTimeout(1200); }
  catch (e) { console.log("find-miss:", opt.find); }
} else if (opt.y) { await page.evaluate(y => window.scrollTo(0, y), Number(opt.y)); await page.waitForTimeout(1200); }
await page.screenshot({ path: out, fullPage: opt.full === "1" });
console.log("ok |", out, "|", (await page.title()).slice(0, 90));
await browser.close();
