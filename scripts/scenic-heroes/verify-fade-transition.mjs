import { chromium } from 'playwright-core';
import { mkdir, writeFile } from 'node:fs/promises';
import assert from 'node:assert/strict';
import sharp from 'sharp';

const base = process.env.SCENIC_BASE_URL || 'http://127.0.0.1:3125';
const out = 'validation/biome-heroes-2026-09-06/research/fade-regression';
await mkdir(out, { recursive: true });
const browser = await chromium.launch({ executablePath: '/home/tada/.cache/ms-playwright/chromium-1228/chrome-linux64/chrome', headless: true, args: ['--no-sandbox'] });
const samples = [];
try {
  for (const route of ['about', 'projects', 'research']) for (const width of [1440, 375]) {
    const page = await browser.newPage({ viewport: { width, height: 1000 } });
    await page.route(/google-analytics\.com|googletagmanager\.com/, r => r.abort());
    await page.goto(`${base}/${route}`, { waitUntil: 'networkidle' });
    await page.locator('[data-scene] img').evaluateAll(images => Promise.all(images.map(image => image.decode())));
    const toggle = page.getByTestId('daynight-toggle');
    for (let i = 0; i < 4 && await toggle.getAttribute('data-phase') !== 'morning'; i++) await toggle.click();
    await page.waitForTimeout(1100);
    await page.evaluate(() => window.scrollTo({ top: document.querySelector('[data-scene]').offsetHeight - 600, behavior: 'instant' }));
    for (const phase of ['noon', 'sunset', 'night', 'morning']) {
      await page.evaluate(() => document.querySelector('[data-testid="daynight-toggle"]').click());
      await page.waitForTimeout(35);
      const edge = await page.locator('[data-scene]').evaluate(node => node.getBoundingClientRect().bottom);
      const png = await page.screenshot({ path: `${out}/${route}-${width}-${phase}-live.png` });
      const { data, info } = await sharp(png).removeAlpha().raw().toBuffer({ resolveWithObject: true });
      const at = (x, y) => [...data.subarray((Math.round(y) * info.width + Math.round(x)) * 3, (Math.round(y) * info.width + Math.round(x)) * 3 + 3)];
      const pixels = [.03, .3].map(x => ({ above: at(width * x, edge - 3), below: at(width * x, edge + 3) }));
      const gap = Math.max(...pixels.flatMap(({ above, below }) => above.map((v, i) => Math.abs(v - below[i]))));
      samples.push({ route, width, phase, edge, pixels, gap });
      assert.ok(gap <= 2, `${route}/${width}/${phase}: transient edge gap ${gap}`);
      await page.waitForTimeout(1100);
    }
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.evaluate(() => document.querySelector('[data-testid="daynight-toggle"]').click());
    await page.waitForTimeout(100);
    assert.ok(await page.locator('main.site-main').evaluate(node => node.getAnimations().every(a => a.playState !== 'running')), 'Reduced-motion page color must settle immediately');
    await page.close();
  }
} finally {
  await browser.close();
  await writeFile(`${out}/report.json`, JSON.stringify({ base, sampling: 'Live, unpaused transitions; screenshot requested 35ms after actual toggle. Pixels sampled on both sides of the visible hero edge.', samples }, null, 2));
}
console.log(JSON.stringify({ samples: samples.length, maximumPixelGap: Math.max(...samples.map(s => s.gap)) }));
