# Ground fauna validation

- **Result:** PASS after three visual-triage rounds
- **Production build:** PASS
- **Render modes:** static fallback and WebGL handoff

## Final behavior

- Morning renders one parchment rabbit; noon renders one gold cat;
  sunset/night render no ground fauna.
- The 22–24 second CSS timeline enters from the left, walks within the left
  quarter of the meadow, pauses, fades, and spends the rest of the cycle
  invisible. It never crosses the central copy/CTA/scroll corridor.
- Inline SVG uses existing tokens and creates no image request, WebGL draw
  call, JavaScript timer, RAF loop, or focus target.
- One airborne root plus one ground root is the structural maximum of two
  logical encounters.

## Runtime gates

- Desktop 1440, tablet 768, and mobile 375: zero copy, CTA, or scroll-cue
  intersections and `scrollWidth === clientWidth`.
- Ambient parent is `aria-hidden=true`; fauna has zero focusable descendants
  and `pointer-events: none`.
- Overlay pause froze the CSS timeline at `483.334 ms` for 550 ms, then closing
  the overlay resumed it. Offscreen pause froze at `1066.710 ms` for 550 ms,
  then returning resumed it.
- Reduced motion reports `animation-name: none`, `will-change: auto`, one
  visible static frame, and zero running animations inside the Hero scene and
  entity scopes.
- Normal WebGL mode retained one canvas, one ambient layer, one fauna root,
  zero overflow, and no additional scene implementation.
- Repeated morning → noon → sunset → night → morning transitions produced
  counts `1 → 1 → 0 → 0 → 1`, always with one ambient layer and no stale root.

## Visual evidence

- `desktop-morning.png`
- `desktop-noon.png`
- `tablet-morning.png`
- `mobile-noon.png`
- `mobile-reduced-morning.png`
- `runtime.json` — geometry, accessibility, lifecycle, reduced-motion, phase,
  and WebGL handoff measurements.

## Triage record

1. The initial dark silhouettes were technically present but visually lost in
   the forest texture. Existing parchment/gold tokens and an ink outline fixed
   legibility without a new color or glow.
2. The first full-width path could cross the mobile scroll cue. The final path
   stays within the left 24% of the scene, then pauses and fades; geometry
   assertions confirm no intersection at any validated viewport.
