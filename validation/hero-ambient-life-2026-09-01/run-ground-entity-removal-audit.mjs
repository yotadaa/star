import assert from "node:assert/strict";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { chromium } from "playwright-core";

const baseUrl = process.env.AUDIT_BASE_URL || "http://127.0.0.1:3124";
const outputDir = new URL("./ground-entity-removal/", import.meta.url);
await mkdir(outputDir, { recursive: true });

const browser = await chromium.launch({ headless: true });
const consoleErrors = [];

async function auditPhase({ phase, label, viewport, reducedMotion = "no-preference" }) {
  const context = await browser.newContext({ viewport, reducedMotion });
  await context.addInitScript((savedPhase) => {
    localStorage.setItem("cockpit-phase", savedPhase);
    Object.defineProperty(window, "WebGL2RenderingContext", {
      configurable: true,
      value: undefined,
    });
  }, phase);
  const page = await context.newPage();
  page.on("console", (message) => {
    if (message.type() === "error") consoleErrors.push(message.text());
  });
  page.on("pageerror", (error) => consoleErrors.push(error.message));
  await page.goto(`${baseUrl}/`, { waitUntil: "networkidle" });
  await page.waitForFunction((expectedPhase) => (
    document.querySelector("#main")?.dataset.cockpitPhase === expectedPhase
  ), phase);
  await page.waitForTimeout(180);

  const result = await page.evaluate(() => {
    const ambient = document.querySelector(".hero-ambient-life");
    const grass = [...document.querySelectorAll(".hero-ambient-grass-blade")];
    return {
      phase: document.querySelector("#main")?.dataset.cockpitPhase,
      groundRootCount: document.querySelectorAll('[data-testid="hero-ground-fauna"], .hero-ground-fauna').length,
      grassBladeCount: grass.length,
      grassAnimationNames: [...new Set(grass.map((node) => getComputedStyle(node).animationName))],
      ambientAriaHidden: ambient?.getAttribute("aria-hidden"),
      renderer: document.querySelector(".parallax-scene-shell")?.dataset.renderer,
      scrollWidth: document.documentElement.scrollWidth,
      clientWidth: document.documentElement.clientWidth,
    };
  });

  await page.screenshot({ path: new URL(`${label}.png`, outputDir).pathname });
  await context.close();
  return result;
}

try {
  const [sceneSource, cssSource] = await Promise.all([
    readFile(new URL("../../components/ParallaxScene.jsx", import.meta.url), "utf8"),
    readFile(new URL("../../app/globals.css", import.meta.url), "utf8"),
  ]);
  const productionSource = `${sceneSource}\n${cssSource}`;
  const scenarios = [
    { phase: "morning", label: "mobile-morning", viewport: { width: 375, height: 812 } },
    { phase: "noon", label: "mobile-noon", viewport: { width: 375, height: 812 } },
    { phase: "noon", label: "desktop-noon", viewport: { width: 1440, height: 1000 } },
    { phase: "sunset", label: "mobile-sunset", viewport: { width: 375, height: 812 } },
    { phase: "night", label: "mobile-night", viewport: { width: 375, height: 812 } },
    { phase: "noon", label: "mobile-reduced-noon", viewport: { width: 375, height: 812 }, reducedMotion: "reduce" },
  ];
  const phases = [];
  for (const scenario of scenarios) phases.push(await auditPhase(scenario));

  const result = {
    productionGroundEntityReferences: {
      className: (productionSource.match(/hero-ground-fauna/g) || []).length,
      componentName: (productionSource.match(/Ground(?:Cat|Fauna)/g) || []).length,
      catSpecies: (productionSource.match(/data-species=["']cat["']/g) || []).length,
    },
    phases,
    consoleErrors,
  };

  assert.deepEqual(result.productionGroundEntityReferences, {
    className: 0,
    componentName: 0,
    catSpecies: 0,
  });
  for (const entry of phases) {
    assert.equal(entry.groundRootCount, 0);
    assert.equal(entry.grassBladeCount, 24);
    assert.equal(entry.scrollWidth, entry.clientWidth);
    assert.equal(entry.ambientAriaHidden, "true");
  }
  const reduced = phases.at(-1);
  assert.equal(reduced.renderer, "static");
  assert.deepEqual(reduced.grassAnimationNames, ["none"]);
  assert.deepEqual(consoleErrors, []);

  await writeFile(new URL("runtime.json", outputDir), `${JSON.stringify(result, null, 2)}\n`);
  console.log(JSON.stringify(result, null, 2));
} finally {
  await browser.close();
}
