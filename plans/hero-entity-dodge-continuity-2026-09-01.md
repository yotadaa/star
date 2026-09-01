# Task: Repair Hero entity dodge continuity

- **Status:** validated
- **Date:** 2026-09-01
- **Source:** user-reported interaction defect; `PRODUCT.md`; `DESIGN.md`; `plans/hero-entity-implementation-plan.md` §§2, 4.1, 4.3, 9
- **Page / exact location:** Home route `/`, `HeroEntityLayer` between the Hero canvas and Hero copy
- **Element and structure:** keep the existing `HeroEntityLayer` wrapper, interactive button, spark, CSS dodge animation, and native `Element.animate()` flight. Correct only the coordinate handoff from dodge to resumed flight.
- **New dependency required?:** NO
- **New color token required?:** NO
- **Data confirmation required?:** NO; this repairs behavior already specified and approved.

## Root-cause evidence

### 1. Dodge start was measured after canceling flight

`handleInteract` canceled the native flight animation before calling `getBoundingClientRect()`. Canceling removed the live transform and restored the CSS fallback at the off-screen flight origin. A deterministic runtime check clicked the visible entity at approximately `x = 1091`, but the handler stored `dodgeStartX = 1601`. The dodge therefore began with a large horizontal teleport instead of from the clicked position.

The repair must capture the target and layer rectangles while the native animation is still applied, then cancel flight and use those captured coordinates for the dodge.

### 2. Dodge end used the wrong Y coordinate space when flight resumed

The normal flight wrapper is positioned at `top: var(--entity-lane)` and its native animation supplies a **lane-relative** transform Y. During dodge, `.is-dodging` changes the wrapper to `top: 0`, so `dodgeEndY` is stored as an **absolute Hero-layer** Y coordinate. Both parts of the handoff treated that absolute value as lane-relative:

```text
courseOffsetY = dodgeEndY - baseline.y
--flight-start-y = dodgeEndY
```

When normal flight resumes, CSS restores the lane top and adds that offset, producing:

```text
visualY = laneY + baseline.y + dodgeEndY - baseline.y
        = dodgeEndY + laneY
```

The CSS fallback is visible before the new native flight animation attaches, so it produces the same double-lane jump for at least one rendered frame. Live desktop sampling reproduced a `161 px` vertical discontinuity at the `dodging → flying` transition while the computed lane top was `162 px` (`18%` of the 900 px Hero, with sub-pixel sampling/scale accounting for the one-pixel difference).

## Acceptance criteria

1. Click/tap/Enter/Space still creates one spark and a nearby bounded dodge; hover remains inert.
2. At the dodge-to-flight transition, the resumed wrapper starts from the dodge endpoint in the same Hero-layer coordinate space. The measured transition must not contain a lane-sized vertical jump; target threshold is at most `12 px` frame-to-frame under the headless validation sampler.
3. The rejoin offset still eases back into the species flight curve over the existing 720 ms, without a React render loop or another animation object.
4. The entity remains within the Hero bounds and above the Hero copy throughout dodge and initial rejoin on desktop and mobile.
5. Reduced-motion behavior stays static: interaction may show the existing spark but must not dodge or start flight.
6. No dependency, color token, asset, copy, stacking, or unrelated Home behavior changes.

## Guardrails

- Preserve the existing transform/opacity-only motion path and one cancellable native flight animation.
- Preserve the 74–116 px horizontal and 42–68 px vertical dodge ranges, including boundary clamping.
- Preserve keyboard focus treatment, pointer-coarse target sizing, and reduced-motion stop behavior.
- Do not touch the active broader Home performance task except to ensure this fix adds no work per frame.

## Validation evidence

Final artifacts are stored in `validation/hero-entity-dodge-2026-09-01/` and cover desktop dodge/resume, mobile touch/resume, keyboard activation, reduced motion, trajectory metrics, and a production build. See `validation/hero-entity-dodge-2026-09-01/README.md`.

## Triage findings

- **P1 functional:** live flight was canceled before its displayed position was captured, so dodge began at the off-screen flight fallback. Status: fixed and runtime-verified.
- **P1 functional:** lane offset was applied twice when flight resumed after a dodge. Status: fixed and runtime-verified.
- **P1 functional:** a downward dodge from the 10% mobile lane could overlap the Hero status strip/copy. Status: fixed with measured-copy clamping and direction reversal when the intended direction lacks safe sky.

## Validation result

- Final desktop pointer probe: visible start `(1104, 104)` → dodge endpoint `(1215, 172)`, a local `(+111, +68)` move away from a top-left interaction. Resume jump: `(0, 0)` px; copy clearance: `40.6` px.
- Final mobile touch probe: start `(41, 84)` → endpoint `(123, 23)`, within the Hero and `67.3` px above the copy. Resume jump: `(0, 0.2)` px. Page width remained `375 / 375` px.
- Hover remained `flying` with zero sparks. Enter triggered `dodging`, one spark, and retained focus.
- Reduced motion remained static/flying, never entered dodge, produced the existing spark, and reported `animation-name: none` on encounter, target, and sprite.
- `npm run build` passed. The post-build browser reload had zero failed requests after restarting the local dev server.
