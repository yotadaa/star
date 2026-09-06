import { chromium } from 'playwright-core';
import { writeFile } from 'node:fs/promises';
import assert from 'node:assert/strict';

const route = process.argv[2] || 'research';
const base = process.env.SCENIC_BASE_URL || 'http://127.0.0.1:3125';
const browser = await chromium.launch({ executablePath: '/home/tada/.cache/ms-playwright/chromium-1228/chrome-linux64/chrome', headless: true, args: ['--no-sandbox'] });
const samples = [];
try {
  for (const width of [1440, 375]) {
    const page = await browser.newPage({ viewport: { width, height: 1000 } });
    await page.route(/google-analytics\.com|googletagmanager\.com/, r => r.abort());
    await page.goto(`${base}/${route}`, { waitUntil: 'networkidle' });
    await page.locator('[data-scene] img').evaluateAll(images => Promise.all(images.map(image => image.decode())));
    const toggle = page.getByTestId('daynight-toggle');
    for (let i = 0; i < 4 && await toggle.getAttribute('data-phase') !== 'morning'; i++) await toggle.click();
    await page.waitForTimeout(2000);
    for (const phase of ['noon', 'sunset', 'night', 'morning']) {
      await page.evaluate(() => {
        window.__phaseNodes = [...document.querySelectorAll('[data-scene] img')];
        window.__phaseFrames = [];
        window.__phaseSampling = true;
        let previous;
        const frame = time => {
          if (!window.__phaseSampling) return;
          if (previous) window.__phaseFrames.push(time - previous);
          previous = time; window.__phaseRaf = requestAnimationFrame(frame);
        };
        window.__phaseRaf = requestAnimationFrame(frame);
      });
      await toggle.click();
      await page.waitForTimeout(1400);
      const sample = await page.evaluate(() => {
        window.__phaseSampling = false;
        cancelAnimationFrame(window.__phaseRaf);
        const sorted = window.__phaseFrames.toSorted((a, b) => a - b);
        const images = [...document.querySelectorAll('[data-scene] img')];
        return {
          phase: document.querySelector('[data-scene]').dataset.phase,
          frames: sorted.length,
          p95: sorted[Math.floor(sorted.length * .95)], max: sorted.at(-1),
          stableImages: images.every((image, i) => image === window.__phaseNodes[i]),
          loaded: images.every(image => image.complete && image.naturalWidth > 0),
        };
      });
      assert.equal(sample.phase, phase);
      assert.ok(sample.stableImages && sample.loaded, 'Transition replaces or loses a scene image');
      assert.ok(sample.frames > 0, 'No frame sample');
      samples.push({ width, ...sample });
    }
    await page.close();
  }
} finally { await browser.close(); }
await writeFile(`validation/biome-heroes-2026-09-06/${route}/phase-motion.json`, JSON.stringify({ base, conditions: 'Local production Chromium, no CPU/network throttling, serial samples without screenshot work. Frame intervals cover the whole page, not only the hero.', samples }, null, 2));
console.log(JSON.stringify(samples, null, 2));
