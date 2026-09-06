# SH-03 — Research: cyberpunk city after rain

Status: validated, included in the Research feature commit · SH-02 committed as `abc8f6a`

Authority: approved five-biome mockup; scenic README §5 SH-03; PRODUCT.md brand/accessibility. Preserve the owner-accepted unboxed caption treatment. No Home imagery or new backend claims.

## Composition and independent assets

View from a wet rooftop across a restrained future Japanese city. Distant buildings and pale humid sky form the background; closer weathered facades, rooftop edge, a small signal receiver and airborne transit are separate transparent objects. Leave the left caption area quiet. The lower rooftop fades into the current page surface without a horizontal cut.

Asset inventory, generated with the built-in image tool and individually inspected:

1. City environment plate: distant skyline only, muted blue-grey air, cloudy daylight, no foreground roof or transit baked into the image; 768/1280/1536px WebP variants.
2. Near facade: weathered concrete and oxidized metal, straight structural geometry, actual transparent sky around the silhouette.
3. Middle building group: independent lower skyline detail for shallow parallax, transparent background.
4. Rooftop edge: wide wet concrete ledge, restrained reflections and irregular material marks; transparent above the edge.
5. Signal receiver: small plausible antenna/device cutout with a clear physical activation point; no text or baked-in UI.
6. Transit vehicle: small restrained futuristic shuttle, side/three-quarter view, actual alpha; reused instances have different scale, depth, delay and routes.

Owner steering (2026-09-07): “we need atmospher and cyberpunk vibes”. The first grey city established layout but lacked that atmosphere. Revise the environment with practical teal/coral/amber architectural lights, wet reflections, dense distant infrastructure and drifting rooftop vapor. These are physical environment materials; keep the existing portfolio UI, typography and tokens. Preserve quiet caption space, coherent perspective, independent alpha cutouts and the lower fade. No generated lettering, decorative circuitry, extra dashboards or flattened hero artwork. Record exact prompts, source hashes, alpha bounds and production output in `assets/research/`.

Revision acceptance: cyberpunk character remains visible in a still screenshot; atmosphere has visible depth and localized light sources; scene life comes from two independently moving shuttles, rain and vapor. Maximum 12 animated objects, 8 unique image requests, existing mobile/desktop asset budgets, no additional renderer or dependencies. Recheck all four time phases and the fixed mobile roof boundary after art export.

## Implementation and gates

- [x] Seven assets generated/edited with built-in imagegen and inspected. Transparent cutouts trimmed/exported; 545,830B / 627,726B mobile/desktop, seven unique requests, 3.20 / 4.38 MP decoded. Exact prompts, original/revision paths and source/output hashes retained. Three edited building/roof images contained baked pale matte; opt-in offline extraction removes it and preserves the largest connected object. Vapor alpha reduced to .42 offline. Existing assets bypass this preparation unchanged.
- [x] One route data definition using existing ScenicHero/ScenicObject/lifecycle; two small rain/signal-light CSS material rules.
- [x] Rain and transit use independent bounded native animations; pause/reduced motion/offscreen/overlays stop them. No frame loop in React.
- [x] Signal activation runs one bounded response, then stays connected for the session; no repeated completion toast. This labels a scene discovery only.
- [x] Existing h1/editable caption wired into the shared hero and `Read publications` links to `#research-content`; runtime assertions passed.
- [x] Publication titles, authors, links, citation total and h-index remain sourced from the existing records; verify against repository data.
- [x] Desktop/tablet/mobile and four phases, keyboard/touch, triggered/restored, reduced motion and smooth lower fade screenshots.
- [x] Astra visual evaluation; correct concrete P0–P2 issues, retain unrelated findings in tracker.
- [x] Unit/asset/browser checks, isolated production build and measured delivery budgets; commit only Research and necessary shared additions.

Evidence destination: `validation/biome-heroes-2026-09-06/research/`. No implementation is marked complete from code inspection alone.

## Visual decisions and triage

- First grey composition: layout established, then superseded by the owner's explicit cyberpunk/immersive steering.
- Cyberpunk revision: moved distant towers into the visible center/right instead of hiding them behind the facade; exposed skyline by narrowing nearer buildings; added practical architectural lights, wet reflections, two translucent vapor objects and eight seeded groups of four rain streaks. All movement stays within the twelve-object native animation budget.
- Night wash: existing configurable atmosphere uses ink at 45% instead of slate-blue at 60%, retaining more natural material/light contrast. No new renderer, blend mode, phase image swaps or changes to the existing UI palette.
- P1 mobile roof boundary: extended the wide rooftop below the frame; final fade conceals the lower asset edge.
- P1 mobile receiver support: lowered its attached position to rest on the wet surface.
- P1 mobile building bases: Astra identified exposed lower cutout silhouettes. Lowered only the mobile middle-building group behind the parapet; Astra re-inspected the actual 375 px screenshot and confirmed resolution.
- Astra accepted the revised atmosphere, grounding and interaction composition. Its full state review found a P1 transient night→morning edge seam. Both independently animated surfaces reported identical computed colors/timing while the screenshot showed different painted colors. Bounded correction: animate one inherited page-color property on the main surface and have the fade consume that value directly. All 24 live intermediate captures across About/Projects/Research and every phase passed with a maximum one-level RGB gap at the boundary; reduced motion stops the shared color immediately. Astra inspected all eight Research transitions and desktop/mobile About/Projects morning transitions and accepted the correction.

## Final validation and remaining performance work

- Production build passed; 39 shared browser/lifecycle assertions, 22 Research content/interaction assertions and ten unit checks passed.
- Desktop/tablet/mobile endpoints, focus, connected/restored receiver, reduced motion and phase/fade screenshots were inspected. Astra accepted the final atmosphere, composition and fade; no open P0–P2 findings remain for this unit.
- Six fresh local production contexts: LCP 436–860 ms, CLS 0, zero idle long tasks. These are unthrottled local measurements of the whole page, not field Core Web Vitals.
- P3 follow-up: desktop phase-frame p95 is 33.4–50 ms (maximum 50.1 ms); mobile p95 is 16.7 ms in all four transitions. All scene image nodes stay mounted and loaded. Frame pacing is not a passed 60 fps gate. Attribute the remaining desktop cost separately before changing the shared rendering architecture; recorded in TASKS.md with `phase-motion.json`.
- Existing About follow-ups remain open. No package dependencies, fabricated facts, audio or new UI color tokens were added.
