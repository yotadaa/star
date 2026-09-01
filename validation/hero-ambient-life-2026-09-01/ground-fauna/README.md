# Historical ground-fauna validation (superseded)

> **Historical evidence only.** This directory records the former noon-cat
> implementation. The owner later removed every ground entity, so none of the
> behavior below is the current production contract. See
> `../ground-entity-removal/README.md` for current evidence.

- **Historical result:** PASS after the earlier rabbit-only removal
- **Historical production build:** PASS at capture time
- **Former ground species:** noon cat only
- **Historical Sol review:** READY at capture time

## Former behavior

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

The following values describe the retained historical snapshot, not the
current route:

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
  reduced-motion, and overflow results for the former implementation.
- `../firefly/runtime-mobile.json` — full Hero regression and lifecycle audit.

The old rabbit-removal runner was deleted when its noon-cat contract was
superseded. The current zero-ground contract is reproducible with
`../run-ground-entity-removal-audit.mjs` and documented in
`../ground-entity-removal/README.md`; that runner intentionally does not
reproduce this obsolete cat state.
