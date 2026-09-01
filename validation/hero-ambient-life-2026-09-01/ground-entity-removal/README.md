# Hero ground-entity removal validation

- **Result:** PASS
- **Route:** `/`
- **Scope:** all decorative ground entities removed; ambient grass retained

## Contract

- Morning, noon, sunset, and night each render zero ground-entity roots.
- Production Hero source and CSS contain no ground-fauna class, cat SVG
  component, ground-fauna component, or cat species marker.
- Each checked phase retains all 24 ambient grass blades inside the existing
  `aria-hidden` environmental layer.
- Reduced motion uses the static renderer and gives every grass blade
  `animation-name: none`.
- Desktop 1440 and mobile 375 remain free of horizontal overflow and browser
  console errors.

## Evidence

- `runtime.json` — generated DOM, source-contract, reduced-motion, overflow,
  and console assertions.
- `desktop-noon.png` — desktop view after the former cat slot was removed.
- `mobile-morning.png`, `mobile-noon.png`, `mobile-sunset.png`,
  `mobile-night.png` — phase-by-phase mobile evidence.
- `mobile-reduced-noon.png` — reduced-motion static state.
- `run-ground-entity-removal-audit.mjs` — reproducible Playwright audit.
