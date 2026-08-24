# Performance Audit: Player Status and Public Pages

> Audit date: 2026-08-24 (Asia/Jakarta)
> Status: audit complete, implementation planned
> Scope: Player Status open/scroll behavior, Home rendering, shared fixed layers, Blog/route background work
> Change policy: no production performance fix is included in this audit document

## 1. Sources and guardrails

- Product authority: `PRODUCT.md`
- Component and accessibility rules: `design-system.md`
- Gamification source items: `report.md`
- Active work and known debt: `TASKS.md`
- Implementation workflow: `AGENTS.md`
- Runtime evidence: local production and development builds at desktop 1440 x 900 and mobile 375 x 812
- Primary framework guidance:
  - React Three Fiber performance scaling: <https://r3f.docs.pmnd.rs/advanced/scaling-performance>
  - React Three Fiber Canvas API: <https://r3f.docs.pmnd.rs/api/canvas>
  - React Three Fiber hooks: <https://r3f.docs.pmnd.rs/api/hooks>
  - CSS overscroll behavior: <https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/overscroll-behavior>
  - Page Visibility API: <https://developer.mozilla.org/en-US/docs/Web/API/Page_Visibility_API>

The repair must add no npm dependency and no new color literal. It must preserve keyboard access, stop motion under `prefers-reduced-motion: reduce`, avoid document overflow, and include real multi-viewport screenshots before any task is marked done.

## 2. Reproduction baseline

### Player Status scroll escape

The popup has an independently scrollable body, but the document is not locked and the scroll area does not contain overscroll. The defect reproduces at both tested widths.

| Viewport | Popup body range | Document movement after one extra wheel gesture at the popup boundary |
| --- | ---: | ---: |
| 1440 x 900 | about 148 px | 546 px |
| 375 x 812 | about 662 px | 841 px |

The background remains displaced after the popup closes. `aria-modal="true"` is present, but the underlying page remains scrollable and interactive.

### Home main-thread stall

Repeated route sampling found one large stall on Home that did not occur on the other public routes.

| Route | Largest observed timer delay |
| --- | ---: |
| Home, WebGL renderer | 755-844 ms |
| Home, forced static renderer | 36-39 ms |
| About | 59 ms |
| Projects | 47 ms |
| Research | 42 ms |
| Contact | 61 ms |
| Blog | 61 ms |

The same Home module produced an 837-844 ms stall with WebGL and a 36-39 ms stall with its static renderer. This isolates the main startup hitch to the Three/R3F path rather than general route JavaScript.

### Player Status open timing

- Cold open over the active WebGL Home: about 1,394 ms in the slow sample.
- Cold open over the forced static Home: about 529 ms.
- Warm reopen: about 362-375 ms.
- The popup chunk itself is small: about 10.7 KB raw and 3.7 KB gzip.

The slowest first open collides with Hero renderer initialization and full-screen compositing. Downloading the popup component is not the primary bottleneck.

## 3. Findings

### P0 - Popup scroll isolation is functionally broken

Evidence:

- `components/player/PlayerStatusPopup.jsx` manages focus and Escape, but never locks the document or makes the application shell inert.
- `.player-popup-body` in `app/globals.css` uses `overflow: auto` without `overscroll-behavior`.
- Desktop and mobile both pass wheel/touch momentum to the document when the popup reaches its boundary.

Impact:

- Users lose their reading position.
- The modal contract is incomplete for keyboard and assistive-technology users.
- Multiple independent overlays can remain active and perform hidden work.

### P1 - Home WebGL initialization creates the largest measured stall

Evidence:

- `components/ParallaxScene.jsx` creates a Canvas with `frameloop="always"`, desktop DPR up to 2, antialiasing, and roughly ten `useFrame` callbacks per frame.
- The scene contains several large transparent or additive planes, which increase overdraw.
- The WebGL path downloads about 895 KiB of asynchronous JavaScript raw (about 237 KiB gzip). This cost is not visible in Next.js's 132 KB Home first-load figure.
- The parallax PNG files total about 6.09 MB over the network. Their decoded RGBA footprint is at least about 35.7 MiB before mipmaps, render targets, depth buffers, or multisampling.
- The scene loads moon assets even when the current phase displays the sun.

Impact:

- A repeatable 0.75-0.84 second main-thread hitch on Home.
- More GPU and memory pressure at DPR 2.
- Popup opening feels slower when it overlaps the renderer's cold path.

### P1 - Continuous WebGL work ignores visibility and motion preferences

Evidence:

- The Canvas continues rendering when the Hero leaves the viewport, the document is hidden, or Player Status covers the page.
- Reduced-motion CSS cannot stop JavaScript-driven `useFrame` work.
- The current static fallback handles unavailable/lost WebGL, but not reduced motion or an intentionally selected low-cost mode.

Impact:

- Ongoing battery/GPU use after the scene is no longer useful.
- The public reduced-motion contract is not met by the Hero renderer.

### P1 - Full-screen popup blur compounds the renderer cost

Evidence:

- `.player-popup-overlay` applies `backdrop-filter: blur(10px) saturate(120%)` across the viewport.
- The filter sits above a continuously changing WebGL canvas.
- The legacy popup also uses the rounded/gradient treatment already recorded as design debt in `TASKS.md`.

Impact:

- The browser must composite a large filtered surface while the scene keeps changing underneath it.
- The visual treatment conflicts with the product's solid hardcard direction and anti-glass rule.

### P2 - Inventory data is fetched and reconciled on every popup mount

Evidence:

- `components/player/InventoryGrid.jsx` requests `/api/inventory/items` with `cache: "no-store"` on mount.
- Player Status unmounts on close, so every reopen starts another request.
- Five production samples took 0.209-0.560 seconds for a 6.4 KB response.
- The local fallback renders immediately, then the backend result triggers a second render of the inventory grid.

Impact:

- Repeated network work and reconciliation for unchanged data.
- A visible second update during some opens.

### P2 - Opening one overlay rerenders broad provider consumers

Evidence:

- `components/site/SiteProvider.jsx` stores several unrelated overlay states in one provider.
- Its context value is recreated on each render.
- Opening Player Status rerenders TopNav, HUD, and other consumers even when their data did not change.

Impact:

- Extra render work during an already expensive interaction.
- Overlay collisions are harder to prevent because ownership is distributed.

### P2 - Home carousel works while offscreen

Evidence:

- `components/HomeGlimpseSlider.jsx` starts its interval immediately.
- It does not pause outside the viewport, in a hidden tab, or under reduced motion.
- All six large glimpse images eventually load even while the section is below the fold.
- `priority={isActive}` promotes a different image whenever the active slide changes.

Impact:

- Background state updates and image traffic compete with Hero startup.

### P3 - Smaller shared costs add up during scroll

- The fixed navigation island uses an 18 px backdrop blur on every page.
- Quest HUD chips add four more blurred surfaces over Home.
- `XpScrollBar` performs a React state update on every throttled scroll frame.
- Each `Reveal` instance creates its own IntersectionObserver; About currently has 19 reveal targets.
- Nala mounts on every public page and runs a permanent idle/bob animation.
- Projects renders a large activity grid. It is not the primary lag source, but `content-visibility` and containment can reduce offscreen layout/paint work.

### P4 - Runtime warning and server response variance

- Each Hero mount logs `THREE.Clock: This module has been deprecated. Please use THREE.Timer instead.` The warning appears to come from the current Three/R3F combination and is not the measured root cause.
- Dynamic routes took about 0.22-0.26 seconds after warm-up, while Home was static and returned in about 0.004-0.007 seconds. This affects navigation latency, not the observed scroll hitch.

## 4. Repair plan

The phases are ordered by user impact and dependency. Each component must pass validation before the next component starts.

### Phase A - Add a repeatable performance harness

Files in scope:

- new Playwright/performance script using the existing development dependency
- `validation/player-status-performance-2026-08-24/`
- `validation/home-performance-2026-08-24/`

Acceptance criteria:

1. Capture desktop 1440 x 900, tablet 768 px, and mobile 375 x 812.
2. Record cold and warm popup open interaction timing, long tasks, document scroll delta, request count, and DOM size.
3. Compare WebGL, static, and reduced-motion Home using the same navigation and sampling window.
4. Save traces or JSON measurements beside screenshots so results are reproducible.
5. Keep the test independent from subjective visual timing.

### Phase B - Repair Player Status before optimizing its internals

#### Task: Player Status scroll and modal isolation

- Source: `PRODUCT.md` accessibility contract, `design-system.md` modal/focus requirements, reproduced defect above
- Files: `components/player/PlayerStatusPopup.jsx`, `app/globals.css`, overlay coordination in `components/site/SiteProvider.jsx`
- Dependency: none
- New color: none

Acceptance criteria:

1. Opening the popup locks document scroll while preserving the exact page position and scrollbar width.
2. Wheel, trackpad, and touch gestures at either popup boundary produce a document scroll delta of 0.
3. `overscroll-behavior-y: contain` supplements the document lock; it is not the only lock mechanism.
4. The application behind the modal is inert while the dialog is open.
5. Escape, outside click, explicit close, focus trap, and focus return work at all tested widths.
6. Opening another overlay cannot leave two modal surfaces active.
7. Tab semantics include linked tab/tabpanel roles and arrow-key navigation.

#### Task: Player Status first-open cost

- Source: measured open timing and `TASKS.md` legacy visual debt
- Files: popup CSS, `InventoryGrid.jsx`, the popup loader/trigger, shared player data
- Dependency: complete modal isolation first

Acceptance criteria:

1. Replace the full-screen backdrop blur with an opaque or mixed approved token surface that matches the existing hardcard language.
2. Freeze Home WebGL while the popup is open.
3. Cache the inventory result for the session/shared player-data lifetime; reopening does not issue another request when data is still valid.
4. Abort an in-flight inventory request when its owner unmounts.
5. Avoid a state update when the returned inventory is equivalent to the rendered fallback.
6. Preload the 3.7 KB gzip popup chunk during idle time or on trigger hover/focus, without making it part of every route's critical path.
7. No interaction long task exceeds 50 ms, and the dialog's first content paint begins within the 200 ms interaction budget on the validation machine.

### Phase C - Change when the Hero renderer runs

#### Task: WebGL lifecycle and accessibility

- Source: Home renderer isolation measurements and the product motion contract
- Files: `components/ParallaxScene.jsx`, Home Hero integration
- Dependency: performance harness

Acceptance criteria:

1. Use the static scene when reduced motion is requested.
2. Stop rendering when the Hero is outside the viewport, the document is hidden, or a blocking overlay is open.
3. Resume only after the relevant state becomes visible again.
4. No continuous `requestAnimationFrame` or R3F frame loop remains active in a static/paused state.
5. WebGL context-loss behavior continues to fall back without a retry loop.

#### Task: Demand-driven, bounded rendering

Acceptance criteria:

1. Move from `frameloop="always"` to demand rendering where the scene is static.
2. Call `invalidate()` for pointer, phase, resize, and short intentional motion windows.
3. Remove continuous cloud/rig movement or bound it to a lower rate only while the Hero is visible.
4. Cap desktop DPR at 1.5. Validate antialias off because the scene is composed mainly of raster/pixel planes.
5. The repaired Home does not reproduce the 0.75-0.84 second renderer stall.
6. Visual comparison screenshots remain faithful at morning, noon, sunset, and night phases.

#### Task: Split and reduce renderer assets

Acceptance criteria:

1. Keep the static/controller module separate from the WebGL module so static and low-cost modes do not download Three/R3F chunks.
2. Move the sky gradient to the existing CSS scene when it can replace the generated 1600 x 900 CanvasTexture without visual loss.
3. Load the moon only in phases that use it.
4. Generate smaller responsive parallax textures for mobile instead of shipping the same 2K PNGs.
5. Record transferred bytes, decoded dimensions, and image quality before/after.

### Phase D - Stop unrelated background work

#### Task: Build Glimpses lifecycle

Acceptance criteria:

1. Autoplay runs only while the slider intersects the viewport and the document is visible.
2. Reduced motion shows a stable active slide and stops the interval.
3. Render/load the active slide and immediate neighbors instead of promoting every slide in sequence.
4. Carousel controls remain keyboard/touch accessible and do not cause document overflow.

#### Task: Shared fixed-layer paint cost

Acceptance criteria:

1. Replace the fixed navigation and Quest HUD backdrop blurs with solid approved token surfaces after screenshot comparison.
2. Update XP progress through a DOM ref or platform scroll primitive instead of a React render on every scroll frame.
3. Share reveal observation rather than creating one observer per item.
4. Pause Nala idle animation when hidden or reduced motion is active; defer expression assets until the panel needs them.

### Phase E - Route-specific follow-up

Only begin after a new route profile shows remaining material cost.

- Apply `content-visibility`/containment to the Projects activity calendar if it remains a scroll hotspot.
- Cache or stream dynamic route data only where server timing is visible to users.
- Check the supported Three/R3F version pairing and remove the `THREE.Clock` warning through an approved dependency update only if necessary. Dependency changes require explicit confirmation.

## 5. Performance budgets

| Metric | Required result |
| --- | ---: |
| Document scroll movement while Player Status is open | 0 px |
| Long task attributable to opening Player Status | no task over 50 ms |
| Interaction to first dialog content paint | under 200 ms on the validation machine |
| Home renderer startup stall | no 0.75 s class stall; no task over 50 ms after warm asset decode |
| WebGL work offscreen/hidden/modal/reduced motion | 0 active continuous frames |
| Desktop renderer DPR | at most 1.5 unless evidence justifies more |
| New npm dependencies | 0 |
| Document horizontal overflow at 375 px | 0 px |

These budgets must be measured with the same browser build and machine before and after each task. A screenshot alone cannot prove timing or frame-loop state.

## 6. Validation and triage

For each task:

1. Capture default, active/focus, boundary-scroll, after-trigger, and reduced-motion states where applicable.
2. Test 1440 px desktop and 375 px mobile; add 768 px for fixed overlays and strips.
3. Inspect each screenshot before changing code again. Record every visible defect, not only the first one.
4. Supplement screenshots with DOM/computed-style checks, document scroll deltas, request logs, and performance traces.
5. Fix P0-P2 issues before validation. Defer P3/P4 only with a named `TASKS.md` item and screenshot reference.
6. Limit each screenshot/analyze/fix loop to three rounds before splitting or escalating the task.
7. Run `npm run build` and `npm run convex:typecheck` after the final component state.
8. Confirm `package.json` has no dependency diff.

## 7. Expected payoff

The largest gain should come from changing the Hero renderer's lifecycle and startup path. The Player Status scroll lock is the first repair because it is a direct functional defect. Removing the popup blur and pausing WebGL while the modal is open should improve the same interaction immediately, while renderer splitting and asset work address the broader Home lag.
