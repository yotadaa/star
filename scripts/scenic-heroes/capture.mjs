import { chromium } from 'playwright-core';
import { mkdir, writeFile } from 'node:fs/promises';
const route = process.argv[2] || 'about';
const base = process.env.SCENIC_BASE_URL || 'http://127.0.0.1:3123';
const output = `validation/biome-heroes-2026-09-06/${route}`;
await mkdir(output, { recursive: true });
const browser = await chromium.launch({ executablePath: process.env.PLAYWRIGHT_CHROMIUM_PATH || '/home/tada/.cache/ms-playwright/chromium-1228/chrome-linux64/chrome', headless: true, args: ['--no-sandbox'] });
const errors = [];
for (const width of [1440, 768, 375]) {
 const page = await browser.newPage({ viewport: { width, height: width === 375 ? 1100 : 1000 }, deviceScaleFactor: 1 });
 await page.route(/google-analytics\.com|googletagmanager\.com/, r => r.abort());
 page.on('pageerror', error => errors.push(error.message));
 await page.goto(`${base}/${route}`, { waitUntil: 'networkidle' });
 await page.locator('[data-scene]').waitFor();
 await page.locator('[data-scene] img').evaluateAll(imgs => Promise.all(imgs.map(img => img.decode().catch(() => {}))));
 await page.screenshot({ path: `${output}/${width}-default.png` });
 console.log(JSON.stringify(await page.evaluate(() => ({ width:innerWidth, doc:document.documentElement.scrollWidth, h1:document.querySelector('h1')?.textContent, hero:document.querySelector('[data-scene]')?.getBoundingClientRect().toJSON(), motion:document.querySelector('[data-scene]')?.dataset.motion, images:[...document.querySelectorAll('[data-scene] img')].map(i=>({src:i.currentSrc,loaded:i.complete&&i.naturalWidth>0})) }))));
 await page.close();
}
await writeFile(`${output}/capture-errors.json`, JSON.stringify(errors,null,2));
await browser.close();
