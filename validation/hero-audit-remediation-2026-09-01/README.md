# Home Hero audit remediation — validation

- **Date:** 2026-09-01
- **Route:** `/`
- **Plan:** `plans/hero-audit-remediation-2026-09-01.md`
- **Final independent review:** Sol Extra High — **READY**, with no remaining source-grounded P0–P3 blockers.

## Visual evidence

- Desktop, four phases: `final/matrix-desktop-contact-sheet.webp`
- Mobile, four phases: `final/matrix-mobile-contact-sheet.webp`
- Tablet source frames: `final/matrix-tablet-{morning,noon,sunset,night}.webp`
- Reduced motion: `final/matrix-desktop-reduced-morning.webp`, `final/matrix-mobile-reduced-night.webp`
- Celestial orbit and night cloud relocation: `final/motion-contact-sheet.webp`
- Cold static-to-WebGL handoff: `final/handoff-desktop-static.webp`, `final/handoff-desktop-webgl.webp`
- Focused entity: `final/entity-focus-night.webp`

All final screenshots were captured from the production server after the final build. Desktop, tablet, and mobile were visually inspected after capture.

## Functional and visual results

1. The Hero is unboxed. The title uses the restored cream/gold treatment and the lede has no glyph outline.
2. Sky, atmospheric haze, landscape, procedural sun glare, moon texture, and phase palettes are present in WebGL and static modes.
3. The moon rises from below the left horizon on sunset → night and sets below the right horizon on night → morning. Rapid and interrupted phase changes retain forward orbit lineage.
4. Entering night moves the cloud formation outward while it smoothly dims and cools. The static renderer reaches the same night anchors without motion under reduced-motion.
5. CSS foreground grass adds one decorative ambient layer with no focus target, texture request, or WebGL draw call.
6. A focused creature stayed mounted and focused beyond the original 7.2-second removal point. Keyboard dodge retained focus; blur resumed flight. Overlay/hidden pauses freeze the native flight/dodge instead of advancing a wall timer.
7. The final 1440, 768, and 375 px matrix has zero horizontal overflow and no browser errors. The brand target is `99 × 44` px and all three navigation controls are `44 × 44` px.

## Renderer lifecycle and fallback

- Reduced motion: static renderer, `0` canvases, `0` running Hero animations, and zero overflow.
- Normal renderer: demand frameloop, DPR capped at `1.5`, 30 fps steady invalidation with a bounded 2.6-second 60 fps phase-transition burst.
- Overlay and offscreen probes changed WebGL `data-active` to false and paused ambient CSS loops; returning resumed both.
- A delayed WebGL-module probe verified the complete loading fallback:
  - overlay: cloud/grass animation time stayed `0` for 550 ms;
  - offscreen: both stayed at `550.069 ms` for 450 ms;
  - hidden: both stayed at `550.069 ms` for 450 ms;
  - resume: one WebGL scene, one sky stack, one ambient layer, and no temporary static scene remained.
- Static phase + overlay in the same task froze the new celestial orbit at `0 ms`; closing the overlay resumed it to `333.392 ms`.
- Static phase + offscreen paused at `233.319 ms`; returning advanced it to `749.970 ms`.
- Disabled WebGL, forced-null WebGL2 context, and live context loss all switched to the complete static Hero with `0` canvases and no page error, console error, or unhandled rejection.
- The renderer uses the real Canvas to request exactly one WebGL2 context per genuine session. Three fresh-process probes each observed one attempt.
- The temporary full static scene remains until the first texture-resolved WebGL frame, preventing the former blank landscape interval.

## Performance results

| Metric | Baseline | Final |
|---|---:|---:|
| Desktop Hero image bodies | 5,087,838 B | 436,492 B |
| Desktop image reduction | — | 91.4% |
| Mobile Hero image bodies | 5,087,838 B reference | 195,032 B |
| WebGL2 context attempts per session | 2 | 1 |
| Fresh-process maximum long task | 813 ms | 320–360 ms |
| Reduced-motion Canvas count | 1 | 0 |

The static handoff and Three texture loader share the same five optimized URLs. The first desktop bodies transfer once (`437,992` bytes including response overhead); the second consumer receives only five cached revalidation responses (`1,500` bytes total), not duplicate bodies.

## Route delivery

- `app/page.js` no longer awaits Blog summaries before returning the Home shell.
- The production response is `43,597` bytes; Hero copy occurs before Featured Blog (`10,998` versus `16,838` byte index).
- Three crawlable `/blog/{slug}` links remain in the server HTML and final DOM order is unchanged.

## Build and repository gates

- `npm run build` — passed; `/` is `8.69 kB`, First Load JS `137 kB`.
- `git diff --check` — passed.
- The repository has no `lint` npm script; Next's production build completed its type-validity gate.
- No dependency was added and no unrelated dirty-worktree file is included in the scoped handoff.

## Owner-authorized contrast limitation

The daylight lede keeps the requested original cream color, open-air composition, no box/scrim, and no glyph outline. Its supplied fill-only contrast remains below WCAG AA: morning `2.05:1`, noon `1.66:1`, sunset `2.22:1`; night remains approximately `12:1`. This is recorded as an explicit visual-direction limitation, not reported as an accessibility pass.
