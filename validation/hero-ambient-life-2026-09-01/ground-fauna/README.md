# Ground fauna validation

- **Result:** PASS after owner-requested rabbit removal
- **Production build:** PASS
- **Current ground species:** noon cat only
- **Sol Extra High:** READY, no P0–P3 findings

## Final behavior

- The rabbit production branch and SVG are deleted. Morning, sunset, and night
  render zero ground roots; noon renders exactly one cat.
- The cat's 24-second CSS transform/opacity timeline enters from the left,
  walks within the left quarter of the meadow, pauses, fades, and spends the
  rest of the cycle invisible.
- Inline SVG uses existing tokens and creates no image request, WebGL draw call,
  JavaScript timer, RAF loop, pointer target, or focus target.
- One airborne root plus the noon cat remains the structural maximum of two
  logical encounters.

## Runtime gates

- Source scan: zero case-insensitive `rabbit` references in
  `components/ParallaxScene.jsx`.
- Phase roots: `morning 0 / noon 1 / sunset 0 / night 0`.
- Noon cat: `data-species=cat`, ambient parent `aria-hidden=true`, zero focusable
  descendants, and `pointer-events: none`.
- Desktop `1440 / 1440` and mobile `375 / 375`: no horizontal overflow.
- Reduced-motion noon uses the static renderer with `animation-name: none`.
- The full Hero audit revalidated hidden-state freeze/resume for both the noon
  cat CSS timeline and flyer WAAPI, plus all firefly interaction assertions.
- Both browser audits completed with zero console/page errors.

## Visual evidence

- `mobile-morning-no-rabbit.png`
- `mobile-noon.png`
- `desktop-noon.png`
- `mobile-sunset-no-fauna.png`
- `mobile-night-no-fauna.png`
- `mobile-reduced-noon.png`
- `rabbit-removal-contact-sheet.webp`
- `runtime.json` — assertion-bearing source, phase, accessibility,
  reduced-motion, and overflow results.
- `../firefly/runtime-mobile.json` — full Hero regression and lifecycle audit.
- `../run-rabbit-removal-audit.mjs` — reproducible targeted audit.
