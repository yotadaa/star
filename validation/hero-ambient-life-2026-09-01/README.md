# Hero Ambient Life continuation — validation

- **Date:** 2026-09-01
- **Route:** `/`
- **Plan:** `plans/hero-ambient-life-continuation-2026-09-01.md`
- **Status:** ground-entity removal validated — Sol Extra High final verdict READY

## Implemented continuation

1. Night fireflies now appear as one 2–3-sprite cluster with one focus target,
   one flight path, and one dodge lifecycle. The night selector is an explicit
   `1/6` firefly / `5/6` bat decision.
2. The owner-requested adjustment now removes every decorative ground entity,
   including the former noon cat. The CSS/SVG ground timeline no longer ships.
3. Ambient grass remains environmental scenery. Pair/cluster children remain
   part of their single airborne logical encounter.

## Validation result

- `npm run build` passed after the final implementation; Home is `8.87 kB`
  with `138 kB` First Load JS.
- Exact selection-boundary assertions passed 8/8.
- Desktop 1440, tablet 768, and mobile 375 visual and geometry gates passed.
- Focus, one-spark dodge, pause/resume, overlay, offscreen, reduced-motion,
  phase replacement, no-overflow, and static/WebGL handoff probes passed.
- The final mobile firefly audit covered both two- and three-sprite clusters at
  375×812. Thirty pre-dodge focus-envelope samples per size included the
  six-pixel focus extension and reported no intersection with navigation, Hero
  copy/status, or actions. Each input also passed 30 post-dodge samples against
  those interactive/content obstacles.
- Click, tap, Enter, and Space each produced exactly one spark and one
  `flying → dodging → flying` transition. Focused night-to-morning replacement
  moved focus to the first Hero CTA before removing the cluster.
- Returning to `flying` correctly remained paused while the target held focus.
  Moving focus to the first Hero CTA produced no material position jump, then
  advanced the WAAPI timeline by about 333 ms in the next 360 ms.
- A controlled `document.visibilityState` transition froze the flyer WAAPI
  root for 560 ms, then resumed it. Reduced motion used the static renderer
  with zero scoped running animations.
- No package/lock change, dependency, new hex token, emoji, audio, external
  fauna asset, or WebGL scene edit was introduced.
- The ground-entity-removal audit requires zero ground roots in morning, noon,
  sunset, and night, while retaining 24 ambient grass blades. It also checks
  reduced-motion grass, overflow, production-source references, and console
  errors.

Detailed evidence:

- `firefly/README.md`
- `firefly/runtime-mobile.json`
- `ground-entity-removal/README.md`

The older `ground-fauna/` artifacts are historical evidence from the now
superseded noon-cat implementation; they are not the current product contract.
Their local README carries the same historical warning and points to the
current zero-ground audit.

## Explicitly deferred proposal items

- Watchtower/lighthouse, smoke, and lamp: no approved scene anchor and a prior
  owner decision excluded the watchtower direction.
- Water ripple and boat: no body of water exists in the current scene.
- Sky breathing: optional continuous full-surface motion, not required for the
  fauna behavior.
- Ambient audio: requires a separate explicit product decision and mute UX.
