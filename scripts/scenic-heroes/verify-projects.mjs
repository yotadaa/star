import { chromium } from 'playwright-core';
import { writeFile } from 'node:fs/promises';
import assert from 'node:assert/strict';
import { featuredQuests } from '../../lib/data.js';
import { PROJECT_TYPES, PROJECT_CATEGORIES } from '../../lib/projects/projectFilters.mjs';

const base = process.env.SCENIC_BASE_URL || 'http://127.0.0.1:3125';
const out = 'validation/biome-heroes-2026-09-06/projects';
const browser = await chromium.launch({ executablePath: '/home/tada/.cache/ms-playwright/chromium-1228/chrome-linux64/chrome', headless: true, args: ['--no-sandbox'] });
const report = { base, checks: [], errors: [] };
const check = (name, condition) => { assert.ok(condition, name); report.checks.push(name); };
try {
  for (const width of [1440, 375]) {
    const page = await browser.newPage({ viewport: { width, height: 1100 } });
    page.on('pageerror', error => report.errors.push(error.message));
    await page.goto(`${base}/projects`, { waitUntil: 'networkidle' });
    const hero = page.locator('[data-scene]');
    const compass = hero.locator('[data-object="compass"]');
    const cover = hero.locator('[data-object="covering-sand"]');
    await hero.locator('img').evaluateAll(images => Promise.all(images.map(image => image.decode())));
    check(`${width}: initial sand fully covers compass`, await cover.evaluate(n => Number(getComputedStyle(n).opacity)) === 1);
    for (let step = 1; step <= 3; step++) {
      await compass.getByRole('button').focus();
      await page.keyboard.press('Enter');
      await page.waitForTimeout(550);
      const opacity = await cover.evaluate(n => Number(getComputedStyle(n).opacity));
      check(`${width}: stage ${step} has correct sand coverage`, Math.abs(opacity - (1 - step / 3)) < .01);
      check(`${width}: stage ${step} pressed state`, await compass.getByRole('button').getAttribute('aria-pressed') === String(step === 3));
      const label = hero.locator('[data-scene-focus-ring] span');
      check(`${width}: stage ${step} label follows current action`, await label.textContent() === await compass.getByRole('button').getAttribute('aria-label'));
      const labelRect = await label.boundingBox(), controls = await hero.locator('[data-scene-controls]').boundingBox();
      check(`${width}: stage ${step} label clears controls`, labelRect.y + labelRect.height <= controls.y || labelRect.y >= controls.y + controls.height);
      const objectRect = await compass.boundingBox();
      check(`${width}: stage ${step} label clears compass`, labelRect.y + labelRect.height <= objectRect.y || labelRect.y >= objectRect.y + objectRect.height);
      await page.screenshot({ path: `${out}/${width}-uncover-${step}.png` });
    }
    await compass.getByRole('button').click();
    check(`${width}: fourth action only inspects`, await hero.getByRole('status').textContent() === 'Inspect the uncovered compass');
    await page.reload({ waitUntil: 'networkidle' });
    await page.waitForFunction(() => Number(getComputedStyle(document.querySelector('[data-object="covering-sand"]')).opacity) === 0);
    check(`${width}: restored compass remains uncovered`, await cover.evaluate(n => Number(getComputedStyle(n).opacity)) === 0);
    await compass.getByRole('button').click();
    check(`${width}: restored action does not restart or reannounce discovery`, await hero.getByRole('status').textContent() === 'Inspect the uncovered compass');
    check(`${width}: journal remains one discovery`, (await hero.getByRole('button', { name: /Journal/ }).textContent()).includes('1/5'));
    await page.screenshot({ path: `${out}/${width}-restored.png` });

    for (const type of PROJECT_TYPES) for (const category of PROJECT_CATEGORIES) {
      await page.getByTestId(`filter-type-${type.toLowerCase()}`).click();
      await page.getByTestId(`filter-cat-${category.toLowerCase()}`).click();
      const expected = featuredQuests.filter(q => (type === 'All' || q.type === type) && (category === 'All' || q.category === category));
      const actual = await page.locator('.project-card').evaluateAll(cards => cards.map(card => ({ title: card.querySelector('h3').textContent, href: card.getAttribute('href') })));
      check(`${width}: ${type}/${category} retains real project titles and links`, JSON.stringify(actual) === JSON.stringify(expected.map(q => ({ title: q.title, href: q.href }))));
    }
    await page.getByTestId('filter-type-all').click();
    await page.getByTestId('filter-cat-all').click();
    await page.screenshot({ path: `${out}/${width}-project-filters.png` });
    await page.close();
  }
  check('no runtime errors', report.errors.length === 0);
  report.status = 'passed';
} catch (error) { report.status = 'failed'; report.failure = error.message; throw error; }
finally { await browser.close(); await writeFile(`${out}/interaction-report.json`, JSON.stringify(report, null, 2)); }
console.log(JSON.stringify({ status: report.status, checks: report.checks.length }));
