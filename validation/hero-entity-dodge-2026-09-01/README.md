# Hero entity dodge continuity validation

**Date:** 2026-09-01  
**Route:** `/`  
**Component:** `components/HeroEntityLayer.jsx`  
**Result:** PASS

## Reproduced defects

1. The interaction handler canceled native flight before reading the visible target rectangle. A controlled pre-fix probe clicked at approximately `x = 1091`, but the recorded dodge began at `x = 1601`, the off-screen CSS flight fallback.
2. The dodge endpoint used an absolute Hero-layer Y value when normal flight expected a lane-relative transform. A pre-fix transition jumped `161 px` while the lane top was `162 px`.
3. The 10% mobile lane left only about `11 px` below the target before the Hero copy. A downward dodge could enter the status strip.

## Final runtime measurements

| Gate | Final result |
| --- | --- |
| Desktop pointer direction | `(1104, 104)` → `(1215, 172)`; `+111 px` X and `+68 px` Y away from a top-left interaction |
| Desktop resume continuity | `0 px` X jump; `0 px` Y jump |
| Desktop copy clearance | `40.6 px` in the post-build probe |
| Mobile touch direction | `(41, 84)` → `(123, 23)`; local bounded avoidance |
| Mobile resume continuity | `0 px` X jump; `0.2 px` Y sub-pixel delta |
| Mobile copy clearance | `67.3 px` in the geometry probe; `49.1 px` in the final rendered capture |
| Mobile overflow | `scrollWidth 375 px`; `clientWidth 375 px` |
| Hover | state stayed `flying`; `0` sparks |
| Keyboard | Enter produced `dodging`; `1` spark; target retained focus |
| Reduced motion | state stayed static/flying; no dodge; encounter, target, and sprite all reported `animation-name: none` |
| Package guard | no `package.json` or lockfile diff |
| Production build | `npm run build` passed; Home remained `8.45 kB`, `137 kB` First Load JS |
| Post-build hydration | zero failed requests after the local port-3123 dev server restart |

## Visual evidence reviewed

- `desktop-dodging-stable-final-v2.png`
- `desktop-resumed-flight-stable-final-v2.png`
- `desktop-keyboard-dodging-stable-final-v2.png`
- `mobile-touch-dodging-final-v2.png`
- `mobile-resumed-flight-stable-final-v2.png`
- `desktop-reduced-motion-interaction-final-v2.png`

The action-state captures pause the already-rendered Hero scene after the interaction state and geometry are measured. This avoids the known headless Chromium/WebGL screenshot tearing without changing entity state, coordinates, copy boundaries, or responsive layout. Each listed image was inspected visually; the entity remains in the upper sky, the Hero copy and CTA remain intact, keyboard focus is visible, and no mobile horizontal overflow appears.

## Guardrail audit

- No dependency or package-lock change.
- No color, asset, copy, emoji, modal, audio, or data addition.
- No React per-frame state/render loop added.
- Existing native flight animation, reduced-motion stop, focus treatment, and pointer-coarse target remain intact.
