import assert from "node:assert/strict";
import { mkdir, writeFile } from "node:fs/promises";
import { chromium } from "playwright-core";

const baseUrl = process.env.AUDIT_BASE_URL || "http://127.0.0.1:3124";
const outputDir = new URL("./firefly/", import.meta.url);
await mkdir(outputDir, { recursive: true });

const browser = await chromium.launch({ headless: true });
const viewport = { width: 375, height: 812 };
const consoleErrors = [];

function intersects(a, b) {
  return a.left < b.right && a.right > b.left && a.top < b.bottom && a.bottom > b.top;
}

async function makePage({ phase = "night", clusterSize = 3, reducedMotion = "no-preference", hasTouch = true } = {}) {
  const context = await browser.newContext({ viewport, reducedMotion, hasTouch });
  await context.addInitScript(({ savedPhase, wantedClusterSize, isReduced }) => {
    localStorage.setItem("cockpit-phase", savedPhase);
    Object.defineProperty(window, "WebGL2RenderingContext", {
      configurable: true,
      value: undefined,
    });
    window.setTimeout(() => {
      const heroSequence = [0.05, 0.8, 0.2, 0.4, 0.25, 0.65, wantedClusterSize === 2 ? 0.25 : 0.75];
      const sequence = isReduced ? [0.4, 0.4, 0.4, ...heroSequence] : heroSequence;
      let index = 0;
      Math.random = () => sequence[index++ % sequence.length];
    }, isReduced ? 0 : 350);
  }, { savedPhase: phase, wantedClusterSize: clusterSize, isReduced: reducedMotion === "reduce" });

  const page = await context.newPage();
  page.on("console", (message) => {
    if (message.type() === "error") consoleErrors.push(message.text());
  });
  page.on("pageerror", (error) => consoleErrors.push(error.message));
  await page.goto(`${baseUrl}/`, { waitUntil: "domcontentloaded" });
  await page.waitForLoadState("networkidle");
  return { context, page };
}

async function waitForFirefly(page, expectedSize) {
  const encounter = page.locator('[data-testid="hero-entity-encounter"][data-entity="firefly"]');
  try {
    await encounter.waitFor({ state: "attached", timeout: 7000 });
  } catch (error) {
    const diagnostic = await page.evaluate(() => ({
      phase: document.querySelector("#main")?.dataset.cockpitPhase,
      entity: document.querySelector('[data-testid="hero-entity-encounter"]')?.dataset.entity,
      storedPhase: localStorage.getItem("cockpit-phase"),
    }));
    throw new Error(`Firefly did not spawn: ${JSON.stringify(diagnostic)}`, { cause: error });
  }
  const target = encounter.locator(".hero-entity-target");
  await page.waitForFunction(() => {
    const node = document.querySelector('[data-testid="hero-entity-encounter"][data-entity="firefly"] .hero-entity-target');
    if (!node) return false;
    const rect = node.getBoundingClientRect();
    return rect.left >= 8 && rect.right <= window.innerWidth - 8;
  }, null, { timeout: 7000 });
  const actualSize = await target.locator(".hero-entity-sprite").count();
  if (actualSize !== expectedSize) {
    throw new Error(`Expected ${expectedSize} fireflies, received ${actualSize}`);
  }
  return { encounter, target };
}

async function captureGeometry(clusterSize) {
  const { context, page } = await makePage({ clusterSize });
  const { target } = await waitForFirefly(page, clusterSize);
  await page.screenshot({ path: new URL(`mobile-night-${clusterSize}-default.png`, outputDir).pathname });
  await target.focus();

  const samples = [];
  for (let index = 0; index < 30; index += 1) {
    samples.push(await target.evaluate((node) => {
      const rect = node.getBoundingClientRect();
      return { left: rect.left, top: rect.top, right: rect.right, bottom: rect.bottom };
    }));
    await page.waitForTimeout(90);
  }

  const obstacles = await page.evaluate(() => {
    const rect = (selector) => {
      const node = document.querySelector(selector);
      if (!node) return null;
      const box = node.getBoundingClientRect();
      return { left: box.left, top: box.top, right: box.right, bottom: box.bottom };
    };
    const celestial = [...document.querySelectorAll("[data-static-celestial]")]
      .filter((node) => Number.parseFloat(getComputedStyle(node).opacity) > 0.01)
      .map((node) => {
        const box = node.getBoundingClientRect();
        return {
          kind: node.dataset.staticCelestial,
          left: box.left,
          top: box.top,
          right: box.right,
          bottom: box.bottom,
        };
      });
    return {
      navigation: rect('[data-testid="top-nav"]'),
      heroCopy: rect(".hero-copy"),
      heroStatus: rect(".hero-status"),
      heroActions: rect(".hero-actions"),
      celestial,
      scrollWidth: document.documentElement.scrollWidth,
      clientWidth: document.documentElement.clientWidth,
    };
  });

  const expandedSamples = samples.map((sample) => ({
    left: sample.left - 6,
    top: sample.top - 6,
    right: sample.right + 6,
    bottom: sample.bottom + 6,
  }));
  const obstacleRects = [
    ["navigation", obstacles.navigation],
    ["heroCopy", obstacles.heroCopy],
    ["heroStatus", obstacles.heroStatus],
    ["heroActions", obstacles.heroActions],
    ...obstacles.celestial.map((item) => [`celestial:${item.kind}`, item]),
  ].filter(([, rect]) => rect);
  const collisions = [];
  expandedSamples.forEach((sample, sampleIndex) => {
    obstacleRects.forEach(([name, rect]) => {
      if (intersects(sample, rect)) collisions.push({ sampleIndex, obstacle: name });
    });
  });

  const targetMetrics = await target.evaluate((node) => ({
    width: node.getBoundingClientRect().width,
    height: node.getBoundingClientRect().height,
    focused: document.activeElement === node,
    focusableCount: node.closest("[data-testid=hero-entity-encounter]")?.querySelectorAll("button, a, input, select, textarea, [tabindex]:not([tabindex='-1'])").length,
    childPointerEvents: [...node.children].map((child) => getComputedStyle(child).pointerEvents),
  }));
  await page.screenshot({ path: new URL(`mobile-night-${clusterSize}-focused.png`, outputDir).pathname });
  await context.close();

  return {
    clusterSize,
    targetMetrics,
    focusEnvelope: {
      sampleCount: expandedSamples.length,
      minTop: Math.min(...expandedSamples.map((item) => item.top)),
      maxBottom: Math.max(...expandedSamples.map((item) => item.bottom)),
      collisions,
    },
    obstacles,
  };
}

async function auditInput(input) {
  const { context, page } = await makePage({ clusterSize: 3 });
  const { encounter, target } = await waitForFirefly(page, 3);
  await target.focus();
  await encounter.evaluate((node) => {
    window.__heroInteractionAudit = { sparkAdds: 0, states: [node.dataset.state] };
    const layer = node.closest(".hero-entity-layer");
    const observer = new MutationObserver((records) => {
      for (const record of records) {
        if (record.type === "attributes" && record.target === node && record.attributeName === "data-state") {
          window.__heroInteractionAudit.states.push(node.dataset.state);
        }
        for (const added of record.addedNodes) {
          if (added.nodeType === Node.ELEMENT_NODE && added.matches?.(".hero-entity-spark")) {
            window.__heroInteractionAudit.sparkAdds += 1;
          }
        }
      }
    });
    observer.observe(layer, { childList: true, subtree: true, attributes: true, attributeFilter: ["data-state"] });
    window.__heroInteractionObserver = observer;
  });

  if (input === "click") await target.click({ force: true });
  if (input === "tap") await target.tap({ force: true });
  if (input === "Enter") await target.press("Enter");
  if (input === "Space") await target.press(" ");

  await page.waitForFunction(() => window.__heroInteractionAudit?.states.includes("dodging"));
  await page.waitForFunction(() => {
    const states = window.__heroInteractionAudit?.states || [];
    return states.includes("dodging") && states.at(-1) === "flying";
  });
  await page.waitForTimeout(620);

  const postDodgeSamples = [];
  for (let index = 0; index < 30; index += 1) {
    postDodgeSamples.push(await target.evaluate((node) => {
      const rect = node.getBoundingClientRect();
      return {
        left: rect.left - 6,
        top: rect.top - 6,
        right: rect.right + 6,
        bottom: rect.bottom + 6,
      };
    }));
    await page.waitForTimeout(90);
  }

  const postDodgeObstacles = await page.evaluate(() => {
    const rect = (selector) => {
      const node = document.querySelector(selector);
      if (!node) return null;
      const box = node.getBoundingClientRect();
      return { left: box.left, top: box.top, right: box.right, bottom: box.bottom };
    };
    return {
      navigation: rect('[data-testid="top-nav"]'),
      heroCopy: rect(".hero-copy"),
      heroActions: rect(".hero-actions"),
    };
  });
  const postDodgeCollisions = [];
  postDodgeSamples.forEach((sample, sampleIndex) => {
    Object.entries(postDodgeObstacles).forEach(([name, obstacle]) => {
      if (obstacle && intersects(sample, obstacle)) postDodgeCollisions.push({ sampleIndex, obstacle: name });
    });
  });

  if (input === "tap") {
    await page.screenshot({ path: new URL("mobile-night-post-dodge.png", outputDir).pathname });
  }
  const focusedResult = await page.evaluate(() => {
    window.__heroInteractionObserver?.disconnect();
    const audit = window.__heroInteractionAudit;
    const target = document.querySelector('[data-testid="hero-entity-firefly"]');
    const encounter = target?.closest("[data-testid=hero-entity-encounter]");
    const animation = encounter?.getAnimations()[0];
    const box = target?.getBoundingClientRect();
    return {
      states: audit.states,
      dodgeTransitions: audit.states.filter((state) => state === "dodging").length,
      sparkAdds: audit.sparkAdds,
      sparkRemaining: document.querySelectorAll(".hero-entity-spark").length,
      returnedState: encounter?.dataset.state,
      focusRetained: document.activeElement === target,
      focusedFlightPlayState: animation?.playState || "missing",
      focusedFlightTime: Number(animation?.currentTime || 0),
      beforeBlurRect: box ? { left: box.left, top: box.top, right: box.right, bottom: box.bottom } : null,
    };
  });

  await page.locator('[data-testid="cta-quests"]').focus();
  const afterBlur = await page.evaluate(() => {
    const target = document.querySelector('[data-testid="hero-entity-firefly"]');
    const encounter = target?.closest("[data-testid=hero-entity-encounter]");
    const animation = encounter?.getAnimations()[0];
    const box = target?.getBoundingClientRect();
    return {
      activeTestId: document.activeElement?.dataset.testid || "",
      flightPlayState: animation?.playState || "missing",
      flightTime: Number(animation?.currentTime || 0),
      rect: box ? { left: box.left, top: box.top, right: box.right, bottom: box.bottom } : null,
    };
  });
  await page.waitForTimeout(360);
  const resumed = await page.evaluate(() => {
    const target = document.querySelector('[data-testid="hero-entity-firefly"]');
    const encounter = target?.closest("[data-testid=hero-entity-encounter]");
    const animation = encounter?.getAnimations()[0];
    const box = target?.getBoundingClientRect();
    return {
      flightPlayState: animation?.playState || "missing",
      flightTime: Number(animation?.currentTime || 0),
      rect: box ? { left: box.left, top: box.top, right: box.right, bottom: box.bottom } : null,
    };
  });
  const positionJump = focusedResult.beforeBlurRect && afterBlur.rect
    ? Math.hypot(
      afterBlur.rect.left - focusedResult.beforeBlurRect.left,
      afterBlur.rect.top - focusedResult.beforeBlurRect.top
    )
    : null;
  await context.close();
  return {
    input,
    ...focusedResult,
    postDodgeFocusEnvelope: {
      sampleCount: postDodgeSamples.length,
      minTop: Math.min(...postDodgeSamples.map((item) => item.top)),
      maxBottom: Math.max(...postDodgeSamples.map((item) => item.bottom)),
      collisions: postDodgeCollisions,
    },
    blurResume: {
      afterBlur,
      resumed,
      positionJump,
      noMaterialPositionJump: positionJump !== null && positionJump < 12,
      timeAdvance: resumed.flightTime - afterBlur.flightTime,
      resumedRunning: resumed.flightPlayState === "running" && resumed.flightTime - afterBlur.flightTime > 100,
    },
  };
}

async function auditFocusedPhaseHandoff() {
  const { context, page } = await makePage({ clusterSize: 3 });
  const { target } = await waitForFirefly(page, 3);
  await target.focus();
  const before = await page.evaluate(() => ({
    phase: document.querySelector("#main")?.dataset.cockpitPhase,
    activeTestId: document.activeElement?.dataset.testid || "",
  }));
  await page.locator('[data-testid="daynight-toggle"]').evaluate((node) => node.click());
  await page.waitForFunction(() => document.querySelector("#main")?.dataset.cockpitPhase === "morning");
  await page.waitForTimeout(120);
  const after = await page.evaluate(() => ({
    phase: document.querySelector("#main")?.dataset.cockpitPhase,
    activeTestId: document.activeElement?.dataset.testid || "",
    fireflyCount: document.querySelectorAll('[data-testid="hero-entity-encounter"][data-entity="firefly"]').length,
  }));
  await context.close();
  return { before, after, focusMovedToFirstHeroCta: after.activeTestId === "cta-quests" };
}

async function auditVisibilityLifecycle() {
  const { context, page } = await makePage({ phase: "morning", clusterSize: 2 });
  const encounter = page.locator('[data-testid="hero-entity-encounter"]');
  const fauna = page.locator('[data-testid="hero-ground-fauna"]');
  await encounter.waitFor({ state: "attached", timeout: 7000 });
  await fauna.waitFor({ state: "attached" });

  await page.evaluate(() => {
    window.__auditVisibilityState = "visible";
    Object.defineProperty(document, "visibilityState", {
      configurable: true,
      get: () => window.__auditVisibilityState,
    });
  });
  await page.evaluate(() => {
    window.__auditVisibilityState = "hidden";
    document.dispatchEvent(new Event("visibilitychange"));
  });
  await page.waitForFunction(() => document.querySelector(".parallax-scene-shell")?.dataset.renderActive === "false");
  await page.waitForTimeout(180);

  const readTimes = () => page.evaluate(() => {
    const flyer = document.querySelector('[data-testid="hero-entity-encounter"]');
    const ground = document.querySelector('[data-testid="hero-ground-fauna"]');
    return {
      flyerTime: Number(flyer?.getAnimations()[0]?.currentTime || 0),
      flyerPlayState: flyer?.getAnimations()[0]?.playState || "missing",
      groundTime: Number(ground?.getAnimations()[0]?.currentTime || 0),
      groundPlayState: ground?.getAnimations()[0]?.playState || "missing",
      shellActive: document.querySelector(".parallax-scene-shell")?.dataset.renderActive,
      layerPaused: document.querySelector(".hero-entity-layer")?.dataset.motionPaused,
    };
  });

  const hiddenStart = await readTimes();
  await page.waitForTimeout(560);
  const hiddenEnd = await readTimes();
  await page.evaluate(() => {
    window.__auditVisibilityState = "visible";
    document.dispatchEvent(new Event("visibilitychange"));
  });
  await page.waitForFunction(() => document.querySelector(".parallax-scene-shell")?.dataset.renderActive === "true");
  await page.waitForTimeout(360);
  const resumed = await readTimes();
  await context.close();
  return {
    method: "controlled document.visibilityState override plus native visibilitychange event",
    hiddenStart,
    hiddenEnd,
    resumed,
    flyerFrozen: Math.abs(hiddenEnd.flyerTime - hiddenStart.flyerTime) < 5,
    groundFrozen: Math.abs(hiddenEnd.groundTime - hiddenStart.groundTime) < 5,
    flyerResumed: resumed.flyerTime - hiddenEnd.flyerTime > 100,
    groundResumed: resumed.groundTime - hiddenEnd.groundTime > 100,
  };
}

async function auditReducedMotion() {
  const { context, page } = await makePage({ clusterSize: 2, reducedMotion: "reduce" });
  const encounter = page.locator('[data-testid="hero-entity-encounter"][data-entity="firefly"]');
  await encounter.waitFor({ state: "attached", timeout: 7000 });
  const result = await page.evaluate(() => {
    const target = document.querySelector('[data-testid="hero-entity-firefly"]');
    const scoped = [...document.querySelectorAll(".parallax-scene-shell *, .hero-entity-layer *")]
      .flatMap((node) => node.getAnimations())
      .filter((animation) => animation.playState === "running");
    const box = target.getBoundingClientRect();
    return {
      renderer: document.querySelector(".parallax-scene-shell")?.dataset.renderer,
      spriteCount: target.querySelectorAll(".hero-entity-sprite").length,
      targetWidth: box.width,
      targetHeight: box.height,
      encounterStatic: target.closest("[data-testid=hero-entity-encounter]")?.classList.contains("is-static"),
      scopedRunningAnimations: scoped.length,
      scrollWidth: document.documentElement.scrollWidth,
      clientWidth: document.documentElement.clientWidth,
    };
  });
  await page.screenshot({ path: new URL("mobile-night-reduced.png", outputDir).pathname });
  await context.close();
  return result;
}

try {
  const result = {
    viewport,
    geometry: [await captureGeometry(2), await captureGeometry(3)],
    inputs: [],
  };
  for (const input of ["click", "tap", "Enter", "Space"]) {
    result.inputs.push(await auditInput(input));
  }
  result.focusedPhaseHandoff = await auditFocusedPhaseHandoff();
  result.visibilityLifecycle = await auditVisibilityLifecycle();
  result.reducedMotion = await auditReducedMotion();
  result.consoleErrors = consoleErrors;

  result.geometry.forEach((entry) => {
    assert.ok(Math.abs(entry.targetMetrics.width - 102) < 0.01);
    assert.ok(Math.abs(entry.targetMetrics.height - 68) < 0.01);
    assert.equal(entry.targetMetrics.focusableCount, 1);
    assert.deepEqual(entry.targetMetrics.childPointerEvents, Array(entry.clusterSize).fill("none"));
    assert.deepEqual(entry.focusEnvelope.collisions, []);
    assert.equal(entry.obstacles.scrollWidth, entry.obstacles.clientWidth);
  });
  result.inputs.forEach((entry) => {
    assert.deepEqual(entry.states, ["flying", "dodging", "flying"]);
    assert.equal(entry.dodgeTransitions, 1);
    assert.equal(entry.sparkAdds, 1);
    assert.equal(entry.sparkRemaining, 0);
    assert.equal(entry.returnedState, "flying");
    assert.equal(entry.focusRetained, true);
    assert.equal(entry.focusedFlightPlayState, "paused");
    assert.deepEqual(entry.postDodgeFocusEnvelope.collisions, []);
    assert.equal(entry.blurResume.noMaterialPositionJump, true);
    assert.equal(entry.blurResume.resumedRunning, true);
  });
  assert.equal(result.focusedPhaseHandoff.focusMovedToFirstHeroCta, true);
  assert.equal(result.visibilityLifecycle.flyerFrozen, true);
  assert.equal(result.visibilityLifecycle.groundFrozen, true);
  assert.equal(result.visibilityLifecycle.flyerResumed, true);
  assert.equal(result.visibilityLifecycle.groundResumed, true);
  assert.equal(result.reducedMotion.scopedRunningAnimations, 0);
  assert.equal(result.reducedMotion.scrollWidth, result.reducedMotion.clientWidth);
  assert.deepEqual(result.consoleErrors, []);

  await writeFile(new URL("runtime-mobile.json", outputDir), `${JSON.stringify(result, null, 2)}\n`);
  console.log(JSON.stringify(result, null, 2));
} finally {
  await browser.close();
}
