# Night firefly cluster validation

- **Result:** PASS
- **Production build:** PASS
- **Pure selection assertions:** 8/8

## Verified behavior

- The exact night boundary selects firefly below `1/6` and bat at or above
  `1/6`; firefly is absent from the fallback pool.
- The captured encounter rendered three child sprites inside one logical
  encounter and one focusable button. The same pure selector constrains every
  cluster to two or three children.
- Every child reports `pointer-events: none`; the button remains the sole
  accessible target.
- Focus paused the parent WAAPI flight. One dispatched activation produced one
  spark, entered dodge once, returned to `flying`, and retained focus.
- Desktop width remained `1440 / 1440` with no horizontal overflow.

## Evidence

- `desktop-night-focused.png` — visually reviewed focused three-firefly cluster
  in the settled night scene.
- `runtime.json` — DOM counts, pointer behavior, focus/flight state, one-spark
  interaction, resumed state, bounding boxes, and overflow measurements.

The action transition was measured in the DOM instead of retained as a WebGL
screenshot because the existing headless Chromium/SwiftShader capture path can
tear the canvas during live animation. This does not affect the measured DOM
state or the focused visual capture.
