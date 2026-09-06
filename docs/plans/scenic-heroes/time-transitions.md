# SH-01b / SH-01c — Phase transitions and About stability

2026-09-06 → 2026-09-07. Status: Home committed; About composition accepted by the owner, with follow-ups retained. Projects resumed at the owner's explicit request.

## Authority and scope

Owner: smooth morning → noon → sunset → night → morning across Home, About and future pages; immersive phase atmosphere; eliminate About stutter/flicker; commit each completed change. Every rendered result is visually evaluated by Astra. Preserve the approved composition and independent objects. Sources: PRODUCT.md accessibility/anti-reference rules, scenic README §§3,5,6; Impeccable animate guidance (bounded effects, reduced motion, measured frames). Sol read-only review recommends a shared 900ms interruption-safe visual policy, with shorter functional surface changes.

## SH-01b: shared phase policy and Home adapters

- Location: root layout/controller/clean CSS; Home initial/static and WebGL renderers.
- Structure: existing HTML phase attribute remains target; no provider/context rewrite. Stable sky/orb/image nodes; four constant sky gradients crossfade through compositor opacity with an opaque underlay; one WebGL phase snapshot owns target/from/live colors and scalars. Rapid reversal freezes the displayed blend, keeps a fully opaque lower plane, and releases temporary promotion after settling.
- No new dependencies, assets, palette colors, audio, data, modal, or persistent schema.
- Initialization/saved phase, reduced motion, hidden/covered content settle immediately. Rapid updates retarget current values, never queue.
- Visual duration 900ms; ordinary text/surface transitions remain short to avoid prolonged low contrast during light/dark inversion. Hero text uses existing contrasting fill/contour tokens. Scenic copy has no area backing; per-scene data can select light/dark text by phase and place it over a quieter part of the artwork.
- Acceptance: all four edges have intermediate colors and final targets; rapid retarget reaches latest target; stable node/source counts; static mobile/fallback and WebGL desktop both tested; original motion suspension retained; global route setting persists.
- Evidence: validation/hero-time-transition-2026-09-06/ (actual intermediate screenshots, material diagnostics, assertions).
- Status: implementing. Commit pending.

## SH-01c: About performance and atmosphere

- Location: reusable ScenicHero, ScenicObject, useScenicLifecycle, scoped CSS and About scene configuration.
- Replace full-scene phase filters with four constant phase-color planes whose opacity transitions. Keep an invariant sharp background plus a cached, statically blurred view of the same URL; focus only crossfades their opacity. Keep selective depth blur on individual cutouts, preserving the owner's depth-focus behavior.
- Cache pointer bounds with ResizeObserver/scroll updates; pointermove only stores coordinates and requests one frame. No layout read on each event, no idle JS loop.
- Keep all transforms stable on focus; pause inner animation without removing transforms. No hover promotion or hover stop/start.
- Phase-specific sun/moon lighting uses existing tokens; conceal the light naturally behind foreground foliage. Future scenes inherit the atmosphere contract through data/CSS variables.
- Acceptance: screenshot review at1440/768/375 across depth, keyboard/triggered, phase endpoints and intermediate frames; no clipped controls or horizontal overflow; boundary matches main at intermediate and final states; pause/reduced/offscreen/hidden/overlays suppress motion; image budgets unchanged; no blank/remounted sprites.
- Performance: identical local production baseline/final frame samples during each transition and pointer sweep; p95 no worse than baseline+4ms, report >34ms gaps/long tasks honestly. Browser automation on this host is not proof for every physical mobile GPU.
- Evidence: same transition folder plus About regression report.
- Astra baseline findings: P4 near bark mostly beneath fade; P2 verification gap dim bird focus treatment (measure before claiming failure); P4 celestial disc overlaps foliage. Address in this bounded visual/performance cycle, record final disposition.
- Status: implementing. Commit pending.

## Sequence and gates

1. Save production baseline screenshots/frame intervals before code changes.
2. Implement shared policy + Home; render and inspect; commit only task-owned files/hunks.
3. Implement About renderer refinement; build isolated production preview; numerical + visual tests; Astra evaluates actual files and returns explicit findings.
4. Fix P0–P2; record P3/P4; update ledger/evidence; commit. Resume Projects only after this gate.

Research: MDN [registered properties](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/At-rules/@property), [filter interpolation](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/filter), [PerformanceObserver](https://developer.mozilla.org/en-US/docs/Web/API/PerformanceObserver). No whole-page screenshot crossfades, duplicate canvases, broad dependency upgrades, or unreviewed Projects inclusion.

## Owner review: local text shading and foreground branch

- Authority: owner screenshots of About and Projects identify the broad dark left veil; owner asks the About branch to break out of the hero frame. This explicitly authorizes the composition refinement.
- Scrim task: owner rejected the subsequent local feathered backing too (23:51 screenshot). Remove the backing completely. Use a 2px contrasting stroke behind the letter fill (about1px exterior contour), with a glyph-sized shadow as on Home; no panel, mask or full-area scrim. Verify About and Projects at 1440/768/375 in all phases, including long caption wrapping and actual letter rendering. No new palette token or dependency.
- Branch task: optional scene configuration selects foreground layers which cross the hero/body fade. Preserve one interactive object tree, phase treatment, depth focus and the existing lifecycle. Keep a bounded overhang and reserve content clearance; no horizontal scroll or overlap with reading text/controls. Read-only Sol advice precedes this layering change.
- Acceptance/evidence: real screenshots before/after, keyboard and pointer branch/bird actions, reduced motion, all four phases, unobstructed CTA/journal/content, numerical overflow/mask coverage checks. Astra evaluates actual screenshots before closure. Save in `validation/hero-time-transition-2026-09-06/` and record remaining findings explicitly.
- Status: in progress; do not mark the About gate complete before this feedback is resolved.

## Verified implementation decisions

- Sol advised constant opacity planes after runtime evidence showed animating registered gradient stops still repainted the sky. Only the small bottom fade owns a registered non-inherited color; using an inherited animated root color had dirtied the full subtree. WebGL materials each have one frame writer and an interruption-safe snapshot.
- The About foreground is a partition of the scene layers, rendered once above the fade. A clipped environment remains at the original hero bounds. Breakout coordinates retain the original hero height; a bounded clip and flow clearance are96/64/40px. The actual branch is bottom-anchored64/44/28px outside the frame. Per-phase opacity handles its light without a large filter.
- A separate transparent hit rectangle covers opaque in-frame bark; the overhang is decorative. It shares the branch parallax anchor and freezes at the displayed matrix on focus. Tablet leaves were visibly detached in Astra's first review; nesting them under the branch resolves the attachment at every breakpoint.
- Owner rejected both the broad scrim and the subsequent local backing. Neither remains in markup/CSS. Caption is17–20px/500. Projects uses dark ink in its bright phases and cream at night; copy position is scene data, and its mobile arch starts below caption text. The narrow contour follows W3C [G18](https://www.w3.org/WAI/WCAG22/Techniques/general/G18); [paint order](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/paint-order) paints the contour before the unchanged letter fill. A shadow fallback supports browsers without text stroke.
- The copy wrapper has no hit testing in its empty padding. Its real children remain selectable/interactive; this prevents transparent layout padding from blocking the branch.
- Astra's Home endpoint review identified pale night CTA labels and a duplicate cratered moon used as a glow. Fixed button labels to the existing ink token, gave the caption a contrasting contour, and removed the duplicated moon mesh. No new moon asset or extra renderer was added.
- Focus regression measurements use document coordinates: an observed3px viewport displacement was exactly3px of native smooth scrolling; the focus matrix itself did not change. The probe now records both scroll and transform so it does not conflate scrolling with an object jump.
- Astra's separate existing mobile Nala/content obstruction is recorded in TASKS.md. Projects tablet floating-arch/hard-sand-edge findings are handled in its pending scene configuration, outside the About commit.

## Review checkpoint — 2026-09-07

Home commit: `6884b95`. Isolated production build passed. `home-trace-headed.json` passed static/WebGL four-edge and rapid-reversal assertions, including measured CTA and contour contrast. Astra accepted all eight refreshed Home endpoint screenshots and closed the duplicate moon/CTA issues.

Caption/breakout report: 193 assertions passed. Astra visually accepted all 24 About/Projects composition screenshots. The owner then said: “i think thats enough, we can go to the next page”. Proceed with Projects and retain these findings without further unsolicited About refinement:

- About desktop sunset performance remains open: latest full run failed the 34ms p95 target (55.7ms p95, 370ms maximum, one 376ms long task). 76 preceding checks passed. `report.json` preserves the failure; there is no blanket smoothness claim.
- About night hover plaque needs effective contrast verification/correction. Keyboard focus uses the separate readable label; the hover-only plaque remains beneath the atmosphere. Evidence: `about-1440-night-copy-breakout.png`.
- Existing Nala mobile obstruction remains in TASKS.md.

This owner-directed checkpoint is not a claim that the unresolved gates passed. Evidence summary: `validation/hero-time-transition-2026-09-06/README.md`.
