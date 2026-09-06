import { chromium } from 'playwright-core';
import { writeFile, mkdir } from 'node:fs/promises';
import assert from 'node:assert/strict';
import { publications, publicPageCopy } from '../../lib/data.js';

const base = process.env.SCENIC_BASE_URL || 'http://127.0.0.1:3125';
const out = 'validation/biome-heroes-2026-09-06/research';
await mkdir(out, { recursive: true });
const browser = await chromium.launch({ executablePath: '/home/tada/.cache/ms-playwright/chromium-1228/chrome-linux64/chrome', headless: true, args: ['--no-sandbox'] });
const report = { base, checks: [], errors: [] };
const check = (name, condition) => { assert.ok(condition, name); report.checks.push(name); };
try {
  for (const width of [1440, 768, 375]) {
    const page = await browser.newPage({ viewport: { width, height: 1100 } });
    page.on('pageerror', error => report.errors.push(error.message));
    await page.goto(`${base}/research`, { waitUntil: 'networkidle' });
    const hero = page.locator('[data-scene]');
    await hero.locator('img').evaluateAll(images => Promise.all(images.map(image => image.decode())));
    check(`${width}: existing title`, await page.locator('h1').textContent() === publicPageCopy.research.title);
    const records = await page.locator('a.pub-card').evaluateAll(cards => cards.map(card => ({ title: card.querySelector('h3').textContent, authors: card.querySelector('.pub-authors').textContent, venue: card.querySelector('.pub-venue').textContent, href: card.getAttribute('href') })));
    check(`${width}: publication records and links preserved`, JSON.stringify(records) === JSON.stringify(publications.map(p => ({ title: p.title, authors: p.authors, venue: p.venue, href: p.href }))));
    const citations = publications.reduce((sum, p) => sum + Math.max(0, Number(p.citedBy || 0)), 0);
    const counts = publications.map(p => Number(p.citedBy || 0)).sort((a, b) => b - a);
    const h = counts.reduce((value, count, i) => count >= i + 1 ? i + 1 : value, 0);
    const hud = await page.locator('.research-hud').textContent();
    check(`${width}: research stats remain factual`, hud.includes(`${citations} citations`) && hud.includes(`h-index ${h}`) && hud.includes(`${publications.length} publications`));
    const signal = hero.locator('[data-object="signal"]');
    await signal.getByRole('button').focus();
    await page.keyboard.press('Enter');
    await page.waitForTimeout(1100);
    check(`${width}: signal connected`, await signal.getByRole('button').getAttribute('aria-pressed') === 'true');
    check(`${width}: one city discovery`, (await hero.getByRole('button', { name: /Journal/ }).textContent()).includes('1/5'));
    const label = hero.locator('[data-scene-focus-ring] span');
    check(`${width}: current focus label`, await label.textContent() === await signal.getByRole('button').getAttribute('aria-label'));
    await page.screenshot({ path: `${out}/${width}-connected.png` });
    await page.reload({ waitUntil: 'networkidle' });
    await page.waitForFunction(() => document.querySelector('[data-object="signal"] button')?.getAttribute('aria-pressed') === 'true');
    await signal.getByRole('button').click();
    check(`${width}: revisit inspects without repeated discovery`, await hero.getByRole('status').textContent() === 'Inspect the connected receiver');
    await page.screenshot({ path: `${out}/${width}-restored.png` });
    for (const phase of ['morning', 'noon', 'sunset', 'night']) {
      while (await page.getByTestId('daynight-toggle').getAttribute('data-phase') !== phase) await page.getByTestId('daynight-toggle').click();
      await page.waitForTimeout(1100);
      await page.evaluate(() => { document.activeElement?.blur(); window.scrollTo({ top: 0, behavior: 'instant' }); });
      await page.screenshot({ path: `${out}/${width}-${phase}.png` });
    }
    await page.close();
  }
  check('no runtime errors', report.errors.length === 0);
  report.status = 'passed';
} catch (error) { report.status = 'failed'; report.failure = error.message; throw error; }
finally { await browser.close(); await writeFile(`${out}/content-interaction-report.json`, JSON.stringify(report, null, 2)); }
console.log(JSON.stringify({ status: report.status, checks: report.checks.length }));
