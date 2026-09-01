# Plan: Harden and optimize the Home Hero

- **Status:** validated
- **Date:** 2026-09-01
- **Source:** user-provided Hero audit; `PRODUCT.md`; `DESIGN.md`; `report.md`; `design-system.md`; `plans/performance-audit-2026-08-24.md`
- **Page / exact location:** Home route `/`, Hero scene, Hero entity layer, top navigation, and the Featured Blog delivery boundary
- **New dependency required?:** NO
- **New color token required?:** NO; all foreground, scrim, and celestial light treatments reuse existing tokens or existing phase colors.
- **Data confirmation required?:** NO; this repairs measured accessibility/performance defects and adds the explicitly requested sun/moon shine without changing content or product data.

## Baseline evidence

1. Daylight Hero lede contrast is below WCAG AA: morning `2.05:1`, noon `1.66:1`, sunset `2.22:1`; night is approximately `12:1`.
2. The WebGL canvas uses `frameloop="always"`. A fresh reduced-motion run still mounted WebGL, transferred `5,087,838` bytes across the moon/cloud/landscape PNGs, and produced an `813 ms` long task. Offscreen and overlay probes continued to observe Hero animation callbacks.
3. The day scene requests the `1,222,212` byte moon because `SunMoonRig` mounts `useLoader()` for it in every phase.
4. A focused creature is removed when its native flight finishes, dropping focus to `body`.
5. At 1440, 768, and 375 px, the phase/inventory/command controls measure `32 × 32` px and the brand link is only about `28.5` px tall.
6. `app/page.js` awaits `listBlogPostSummaries()` before it can return the Hero shell.
7. Static CSS and WebGL hardcoded theme/geometry sources have visibly diverged.

## Task 1 — Daylight Hero copy contrast

- **Sources:** user audit P1.1; `PRODUCT.md` accessibility guardrail; `DESIGN.md` Hero open-air composition
- **Structure:** retain the user-selected unboxed `hero-copy--plain` composition and original cream/gold foreground. The title keeps a thin local outline; the lede explicitly has no outline and only a soft shadow. Treat the audit failure as an owner-authorized limitation, not as a passed AA fix.
- **Acceptance criteria:**
  1. Record the actual morning, noon, sunset, and night contrast results without claiming daylight WCAG AA compliance.
  2. The original foreground palette is preserved using existing tokens; there is no box, scrim, glass, blur, or lede glyph outline.
  3. Desktop, tablet, and mobile remain free of horizontal overflow; copy and CTA layout remain unchanged.

## Task 2 — Focus-safe Hero entity lifetime

- **Sources:** user audit P1.4; existing direct-touch entity contract
- **Structure:** pause the current native flight animation while the target owns focus; immediately pause replacement post-dodge flights while focus remains; resume on blur.
- **Acceptance criteria:**
  1. The same entity remains mounted and focused for longer than its normal flight lifetime.
  2. Enter/Space dodge while focused retains focus and the resumed flight remains paused.
  3. Blur resumes flight and eventual encounter completion/spawn without duplicate timers or removals.
  4. Pointer, touch, reduced-motion, and the already validated dodge continuity remain unchanged.

## Task 3 — Renderer lifecycle and startup

- **Sources:** user audit P1.2/P1.3; `plans/performance-audit-2026-08-24.md`
- **Structure:** separate the lightweight controller/static scene from the heavy R3F implementation; mount WebGL only after client capability/media detection; pass global overlay state from `HomePageContent`.
- **Acceptance criteria:**
  1. Reduced motion never mounts a Canvas or downloads Three/R3F scene textures.
  2. Offscreen, hidden-tab, and known-overlay states stop Hero renderer frames after a short settling interval, then resume without a layer jump.
  3. Active WebGL uses demand rendering at 30 invalidations per second, with a bounded 60 fps burst only for the first 2.6 seconds of an explicit phase transition; device pixel ratio never exceeds `1.5`.
  4. The procedural sun needs no image request. The optimized moon may remain loaded across phases so an interrupted orbit stays continuous, but its settled daytime visibility is zero.
  5. Cold Hero image transfer is reduced by at least 75% from the `5.09 MB` baseline, using alpha-preserving responsive WebP assets.
  6. No new dependency and no per-frame React state updates.

## Task 4 — Stream the Featured Blog boundary

- **Sources:** user audit P2.6; existing Home section order and SEO contract
- **Structure:** move Blog data mapping/markup to an async Server Component and pass its Suspense subtree into the existing Home client component as a slot.
- **Acceptance criteria:**
  1. `app/page.js` returns the Home shell without awaiting Blog summaries at the route root.
  2. The Hero portion arrives before the delayed Blog completion boundary.
  3. Completed HTML retains crawlable Blog headings, excerpts, and links in the same DOM order.
  4. The fallback reserves section space without fabricated article content.

## Task 5 — Top navigation target size

- **Sources:** user audit P2.5; WCAG target-size guardrail
- **Structure:** keep icon artwork size and pill visual language while making the brand and three round controls at least `44 × 44` CSS px.
- **Acceptance criteria:**
  1. All four targets measure at least `44 × 44` at 1440, 768, and 375 px.
  2. 375 px layout remains clear of the top-left utility control and has no overflow.
  3. Existing keyboard order and focus ring remain intact.

## Task 6 — Static/WebGL parity and celestial shine

- **Sources:** user audit P2.7; explicit request that the sun and moon shine; `DESIGN.md` progressive-enhancement contract
- **Structure:** centralize phase geometry and responsive assets, use the same optimized source artwork in static/WebGL, and restore the reference scene's physical celestial glare behind the current sun or moon.
- **Acceptance criteria:**
  1. Static and WebGL celestial centers differ by no more than 2% of the Hero and apparent diameter by no more than 10%; main horizon anchors differ by no more than 5%.
  2. Sun and moon visibly shine behind the orb without post-processing bloom or UI glow. The user-approved reference glare is intentionally broader than the earlier `1.5×` proposal: up to `2.72×` for the sun's diffuse wash and `1.6×` for the moon.
  3. Shine may breathe only while the active renderer is visible; reduced motion shows one static midpoint state.
  4. The halo does not overlap the Hero copy or reduce the validated contrast.

## Task 7 — Ambient life, Tier 1

- **Sources:** user-provided `Hero Ambient Life — Feature Spec`; user request to improve the Hero with that proposal
- **Structure:** add only the applicable low-cost environmental layer: CSS foreground grass and independent static-cloud drift. Keep the existing WebGL cloud meshes and creature system unchanged; do not invent water, a cottage, or a tower where the current scene has no verified anchor.
- **Acceptance criteria:**
  1. Ambient additions use DOM/CSS transforms only and add zero WebGL draw calls or texture requests.
  2. Grass remains below the copy/CTA reading area and all additions are decorative, non-focusable, and `aria-hidden`.
  3. Offscreen/overlay states pause every ambient loop; reduced motion retains a static final frame with no running animation.
  4. Desktop and mobile remain free of overflow and the additions do not obscure celestial objects, creatures, or Hero copy.
  5. Entering night visibly relocates the cloud formation away from the moon/copy corridor while dimming it; WebGL/static transitions remain smooth and reduced motion shows the final night positions without travel.

## User-authorized visual decisions

1. The Hero remains fully unboxed. Daylight copy keeps its original cream/gold palette; the lede has no glyph outline and uses only a soft local shadow. This visual direction supersedes the audit's suggested scrim/darker-foreground treatment, so fill-only daylight contrast remains a documented limitation rather than being falsely reported as WCAG AA.
2. The original blue sky, atmospheric haze, procedural sun glare, and paired celestial transition are the art-direction source of truth. The moon may remain faint only while a transition is still in progress; settled daylight opacity is zero.
3. The moon follows a continuous orbit: it resets below the horizon during daylight, rises from the left at sunset/night, and sets below the right horizon when night returns to morning.
4. The optimized moon asset remains loaded as the orbit-continuity source, but it is visible during daylight only while an interrupted transition is still completing; settled daylight opacity is zero. At roughly 24 KB desktop it no longer carries the former 1.22 MB startup penalty.

## Guardrails

- Preserve the open-air Hero copy, current information hierarchy, CTA stack, night contrast, and no-overflow behavior.
- No new npm dependency, new hex token, fabricated data, emoji, audio, blocking modal, or generic card/text glow.
- All loops stop under `prefers-reduced-motion: reduce`; focus-visible and keyboard behavior remain first-class.
- Preserve unrelated dirty-worktree changes, especially the existing user edit in `components/site/SiteProvider.jsx`.
- Validate each coherent unit before committing it; final evidence will live in `validation/hero-audit-remediation-2026-09-01/`.

## Planned validation matrix

- Phases: morning, noon, sunset, night.
- Viewports: 1440 desktop, 768 tablet, 375 mobile.
- Renderer states: active WebGL, forced static, reduced motion, offscreen, overlay open, resumed.
- Interaction states: entity pointer/touch/keyboard/focused beyond lifetime; navigation keyboard focus.
- Runtime checks: actual foreground/backing contrast, renderer-specific frame count, effective DPR, cold network requests/bytes, long tasks, streamed HTML order, scroll width, and production build.

## Validation result

- **Result:** validated on 2026-09-01.
- **Evidence:** `validation/hero-audit-remediation-2026-09-01/README.md` and its `final/` screenshot set.
- **Independent review:** Sol Extra High returned **READY** after reviewing the final lifecycle, orbit, responsive preload, renderer-construction, static handoff, entity, ambient, and Blog-boundary code. No source-grounded P0–P3 blocker remained.
- **Documented limitation:** the owner-selected daylight lede treatment intentionally retains the supplied sub-AA fill-only contrast values; Task 1 therefore records the result honestly instead of claiming remediation.
