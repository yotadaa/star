# Hero WebGL fallback validation

Tanggal: 2026-08-23

## Functional matrix

| Case | Evidence | Result |
|---|---|---|
| Desktop, WebGL available | `desktop-webgl.jpg` | `parallax-canvas=1`; original layered R3F scene remains visible. |
| Desktop, forced unsupported/static | `desktop-static.jpg` | `parallax-canvas=0`; static scene visible and fills the Hero. |
| Desktop, static night phase | `desktop-static-night.jpg` | Static scene reports `data-phase=night`; moon, dark atmosphere, landscape, copy, and controls remain visible. |
| Desktop, context lost after R3F mount | `desktop-context-loss-recovered.jpg` | Diagnostic `WEBGL_lose_context` event leaves `parallax-canvas=0`, `parallax-static-scene=1`; no Next.js runtime overlay. |
| Mobile 375 × 812, static night | `mobile-static-night.jpg` | Static scenery fills the viewport; no visual horizontal overflow or layer seam. |
| Mobile 375 × 812, WebGL available | `mobile-webgl-night.jpg` | Original R3F path remains visible; no hidden static-scene duplicate. |

## Programmatic checks

- Supported final path: `parallax-canvas=1`, hidden static duplicate `=0`.
- Forced static final path: `parallax-canvas=0`, visible static scene `=1`.
- Context-loss final path: `parallax-canvas=0`, visible static scene `=1` after the non-bubbling event.
- Browser diagnostics: no `error` entries and no Next.js runtime overlay; the deliberate context-loss probe only reports Three's expected context-lost log.
- Accessibility: static root has `aria-hidden=true`; all child image alts are empty; composition is motionless.
- Guardrails: package diff empty; new-hex scan empty; `git diff --check` clean.

## Build

- Command: `npm run build` in isolated `/tmp/star-webgl-build.WbrXPx` so the active dev server's `.next` directory remained untouched.
- Result: pass, 15/15 static pages generated; Home 6.61 kB route size and 132 kB first-load JS.
