# Night firefly cluster validation

- **Result:** PASS after Sol P2 remediation
- **Production build:** PASS
- **Pure selection assertions:** 8/8
- **Mobile audit:** 375×812, two- and three-sprite states

## Verified behavior

- The exact night boundary selects firefly below `1/6` and bat at or above
  `1/6`; firefly is absent from the fallback pool.
- Both cluster sizes render inside one logical encounter and one focusable
  button. Every child reports `pointer-events: none`.
- The mobile target is `102×68 px`. Thirty pre-dodge focus-envelope samples for
  each cluster size included the six-pixel outline/offset extension. Their
  maximum bottom edge was `157.19 px`, below the Hero copy start at `160.42 px`,
  with no collision against navigation, Hero copy/status, or actions.
- Click, tap, Enter, and Space each recorded exactly one spark addition and one
  `flying → dodging → flying` transition. The spark cleared and focus stayed on
  the target, so the returned `flying` WAAPI correctly remained paused.
- Every input then passed another 30 expanded post-dodge samples against
  navigation, Hero copy/status, and actions. Moving focus to `cta-quests`
  changed WAAPI to `running` without a material jump (`0–0.15 px`) and advanced
  its current time by about `333 ms` during the next `360 ms`.
- A focused night cluster changed to morning through a programmatic phase
  activation that did not steal focus. Focus moved to `cta-quests` before the
  firefly root was removed.
- A controlled `document.visibilityState` change paused the flyer WAAPI root at
  an unchanged current time for 560 ms, then resumed it by more than 100 ms.
- Reduced motion uses the static renderer, a `102×68 px` two-sprite target,
  one static encounter, zero scoped running animations, and no overflow.
- Desktop width remained `1440 / 1440`; mobile remained `375 / 375`.
- No console or page errors were emitted by the final mobile audit.

The celestial moon is scenic imagery rather than an interaction obstacle. A
flyer may cross it during flight or dodge; the collision contract and final
assertions cover navigation and Hero content, not decorative celestial art.

## Evidence

- `mobile-night-2-default.png` / `mobile-night-2-focused.png`
- `mobile-night-3-default.png` / `mobile-night-3-focused.png`
- `mobile-night-post-dodge.png`
- `mobile-night-reduced.png`
- `mobile-contact-sheet.png` — visually reviewed all final mobile states.
- `runtime-mobile.json` — focus geometry, collision probes, four input modes,
  focused phase handoff, visibility lifecycle, reduced motion, and overflow.
- `desktop-night-focused.png` / `runtime.json` — original desktop focus and
  one-spark interaction evidence.
- `run-final-audit.mjs` — reproducible browser audit. Its deterministic random
  sequence is installed only in the Playwright page after framework bootstrap;
  no production debug path or runtime hook was added.

The final mobile screenshots use the production static fallback by disabling
WebGL capability in the audit page. This keeps the captured scene deterministic
while exercising the same Hero entity DOM, phase context, accessibility, and
lifecycle code used with the WebGL renderer.
