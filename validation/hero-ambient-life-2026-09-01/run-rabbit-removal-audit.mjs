import assert from "node:assert/strict";
import { readFile, writeFile } from "node:fs/promises";
import { chromium } from "playwright-core";

const baseUrl = process.env.AUDIT_BASE_URL || "http://127.0.0.1:3124";
const outputDir = new URL("./ground-fauna/", import.meta.url);
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
    const roots = [...document.querySelectorAll('[data-testid="hero-ground-fauna"]')];
    const root = roots[0] || null;
    const animation = root?.getAnimations()[0];
    return {
      phase: document.querySelector("#main")?.dataset.cockpitPhase,
      rootCount: roots.length,
      species: roots.map((node) => node.dataset.species),
      ambientAriaHidden: document.querySelector(".hero-ambient-life")?.getAttribute("aria-hidden"),
      pointerEvents: root ? getComputedStyle(root).pointerEvents : null,
      focusableDescendants: root
        ? root.querySelectorAll("button, a, input, select, textarea, [tabindex]:not([tabindex='-1'])").length
        : 0,
      animationName: root ? getComputedStyle(root).animationName : null,
      animationPlayState: animation?.playState || null,
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
  const source = await readFile(new URL("../../components/ParallaxScene.jsx", import.meta.url), "utf8");
  const scenarios = [
    { phase: "morning", label: "mobile-morning-no-rabbit", viewport: { width: 375, height: 812 } },
    { phase: "noon", label: "mobile-noon", viewport: { width: 375, height: 812 } },
    { phase: "noon", label: "desktop-noon", viewport: { width: 1440, height: 1000 } },
    { phase: "sunset", label: "mobile-sunset-no-fauna", viewport: { width: 375, height: 812 } },
    { phase: "night", label: "mobile-night-no-fauna", viewport: { width: 375, height: 812 } },
    { phase: "noon", label: "mobile-reduced-noon", viewport: { width: 375, height: 812 }, reducedMotion: "reduce" },
  ];
  const phases = [];
  for (const scenario of scenarios) phases.push(await auditPhase(scenario));

  const result = {
    productionRabbitReferences: (source.match(/rabbit/gi) || []).length,
    phases,
    consoleErrors,
  };

  assert.equal(result.productionRabbitReferences, 0);
  for (const entry of phases) {
    const expectedCount = entry.phase === "noon" ? 1 : 0;
    assert.equal(entry.rootCount, expectedCount);
    assert.equal(entry.scrollWidth, entry.clientWidth);
    assert.equal(entry.ambientAriaHidden, "true");
    if (entry.phase === "noon") {
      assert.deepEqual(entry.species, ["cat"]);
      assert.equal(entry.pointerEvents, "none");
      assert.equal(entry.focusableDescendants, 0);
    }
  }
  const reduced = phases.at(-1);
  assert.equal(reduced.renderer, "static");
  assert.equal(reduced.animationName, "none");
  assert.notEqual(reduced.animationPlayState, "running");
  assert.deepEqual(consoleErrors, []);

  await writeFile(new URL("runtime.json", outputDir), `${JSON.stringify(result, null, 2)}\n`);
  console.log(JSON.stringify(result, null, 2));
} finally {
  await browser.close();
}
