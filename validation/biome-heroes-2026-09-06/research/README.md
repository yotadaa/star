# SH-03 — Research cyberpunk city

Date: 2026-09-07 · Status: validated; desktop frame-pacing follow-up remains open

Research uses the existing ScenicHero renderer with its original heading, editable caption, publication records and metadata. Independent buildings, rooftop, receiver, two shuttles and two vapor sprites establish depth. Eight seeded rain groups provide 32 thin streaks using eight animated elements. Receiver activation lights its indicator and records one session-local city discovery.

The owner requested stronger cyberpunk atmosphere. The final skyline, storm lighting, wet reflections and practical lamps replace the first grey composition.

## Reproduce

Build with `node scripts/scenic-heroes/build-preview.mjs`. Serve from `/tmp/star-scenic-build` using `node node_modules/next/dist/bin/next start --hostname 127.0.0.1 --port 3125`. The repository's `npm run start` is a development command and was not used for final measurements.

- `SCENIC_BASE_URL=http://127.0.0.1:3125 node scripts/scenic-heroes/verify-browser.mjs research`
- `SCENIC_BASE_URL=http://127.0.0.1:3125 node scripts/scenic-heroes/verify-research.mjs`
- `node scripts/scenic-heroes/verify-fade-transition.mjs`
- `node scripts/scenic-heroes/measure-performance.mjs research`
- `node scripts/scenic-heroes/measure-phase-motion.mjs research`
- `node scripts/scenic-heroes/validate-assets.mjs about projects research`
- `node scripts/scenic-heroes/validate-scenes.mjs research`
- `node --test scripts/scenic-heroes/state.test.mjs scripts/scenic-heroes/identity.test.mjs scripts/scenic-heroes/prepare-alpha.test.mjs`

## Results

| Gate | Result and evidence |
|---|---|
| Production build | Passed. No runtime dependency added. |
| Browser and lifecycle | 39 assertions: no overflow at 375/768/1440 px, one h1, loaded route assets, 44 px targets, keyboard and journal behavior, pause/reduced motion, three overlays, offscreen and synthetic hidden states, storage fallback and no-JS content. `browser-report.json`. |
| Content and interaction | 22 assertions: original title and publication titles, authors, venues and links; citation, h-index and publication totals calculated from existing data; receiver activation, current focus label, reload and reinspection. `content-interaction-report.json`. |
| Time continuity | Four actual intermediate atmosphere blends plus final fade samples; stable loaded image nodes in eight desktop/mobile phase transitions. `desktop-*-transition.png`, `browser-report.json`, `phase-motion.json`. |
| Fade regression | 24 live transition screenshots across About, Projects and Research, desktop and mobile, with at most one RGB level of difference across the edge. Reduced-motion page color stops immediately. `fade-regression/report.json`. |
| Copy contrast | Computed cream fill against ink contour: 13.682:1; 2 px stroke painted behind fill. This measures the glyph contour, not arbitrary scenery pixels. `text-contrast.json`. |
| Assets | 545,830 B mobile; 627,726 B desktop; seven unique requests; 3.20/4.38 MP decoded; twelve animated objects. Exact prompts, revisions, source/output hashes, alpha preparation and crop bounds in `docs/plans/scenic-heroes/assets/research/`. |
| Cold production samples | Six fresh local Chromium contexts without CPU/network throttling. Final samples after the fade correction: LCP 436–860 ms, CLS 0 in all six runs, zero idle long tasks. Startup long tasks remain visible in `performance.json`. These are local whole-page measurements, not field Core Web Vitals. |
| Phase frame samples | Serial runs without screenshot work. `phase-motion.json` records whole-page frame intervals and verifies that image nodes stay mounted and loaded. Final desktop p95 is 33.4–50 ms, maximum 50.1 ms; mobile p95 is 16.7 ms in all four transitions. This does not establish 60 fps desktop rendering; remaining desktop attribution is tracked as P3 in TASKS.md. |
| Unit checks | Ten passed: bounded state, identity, glyph contrast, opt-in matte extraction, unchanged existing asset path and translucent vapor. |

## Visual triage

Astra accepted the cyberpunk atmosphere and identified exposed mobile building bases. Lowering that group behind the parapet resolved the P1; Astra re-inspected the rendered screenshot and confirmed it. The rooftop's earlier lower edge and receiver support were also corrected.

The final state review found a transient night-to-morning seam. Computed colors and animation timing matched, but the screenshot showed a difference between two independently animated surfaces. The bounded correction animates one inherited color on the main surface; the fade consumes that value directly. Computed investigation evidence and fresh live transitions are retained under `fade-regression/`. Astra inspected all eight Research transitions and desktop/mobile About/Projects morning transitions, accepting the correction with no new seam or clipping findings. The typed-property behavior follows the [CSS Properties and Values API](https://developer.mozilla.org/en-US/docs/Web/API/CSS_Properties_and_Values_API/guide); the diagnosis and acceptance evidence come from the local render.

Evidence includes default, connected, restored and all four phase endpoints at 1440/768/375 px, plus desktop reduced motion, focus, trigger, transition and fade captures. Final PNGs are browser screenshots, not generated mockups.

No new backend facts, XP, account progress, sound, package dependency, UI palette token or renderer was introduced. The shared color correction is covered across all three scenic pages. Existing About follow-ups remain in TASKS.md. The opt-in offline asset helper bypasses existing About/Projects images byte-for-byte; only Research uses the new rain and indicator materials.
