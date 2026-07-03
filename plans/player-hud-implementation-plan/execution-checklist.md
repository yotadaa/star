# Player HUD Execution Checklist

Source: `player-hud-implementation-plan.md`, `player-hud-mockup.html`,
`PRODUCT.md`, `design-system.md`, and the current Player Status implementation.

## Decisions

- [x] Use **System Integrity** as real progress within the current PP level.
- [x] Keep Chat and Player HUD as separate desktop actions.
- [x] Use a real, user-provided profile image crop as the static pixel avatar;
      retain `icon-pixel-face` as the honest fallback.
- [x] Preserve Login/Logout access inside the expanded HUD so the existing auth
      workflow is not removed.
- [x] Use only existing palette tokens and small neobrutalist corners; do not
      copy the mockup's pill/glass/soft-shadow styling literally.

## Work Unit A - Assets And Primitives

- [x] Generate `public/assets/avatar-pixelated.png` once from the provided
      profile screenshot using nearest-neighbor downsampling/upscaling.
- [x] Add `icon-target`, `icon-pixel-face`, `icon-artifact`, and
      `icon-medal-outline` to the React icon map and both SVG sprite copies.
- [x] Build `LevelBadge.jsx` with numeric text (no emoji) and an accessible
      label supplied by the parent.
- [x] Build `IntegrityBar.jsx` using the existing segmented progress language.
- [x] Handle zero progress and maximum level without divide-by-zero behavior.
- [x] Verify primitives add no dependency, new hex color, or fabricated data.

## Work Unit B - HUD State And Navigation

- [x] Extend `SiteProvider` with `openPlayerStatus(tab)` and preserve the
      existing public popup trigger.
- [x] Let `PlayerStatusPopup` initialize directly on Inventory, Achievement, or
      Mission when opened from a HUD summary shortcut.
- [x] Keep popup lazy loading and avoid loading chat/player modal code while
      closed.
- [x] Build `PlayerHUDCard.jsx` from `usePlayerProgress()`:
      real level, PP progress, inventory count, unlocked achievement count, and
      active mission count.
- [x] Summary controls open the matching popup tab.
- [x] Preserve login for visitors and logout/account access for authenticated
      users.

## Work Unit C - Utility Bar Integration

- [x] Build `PlayerHUD.jsx` collapsed trigger with pixel avatar and level badge.
- [x] Desktop: render separate Chat and Player HUD controls on one row.
- [x] Mobile/medium: collapse to avatar + level badge only; expanded card
      includes World Chat and account action.
- [x] Close on outside pointer and Escape; restore focus to the trigger.
- [x] Add `aria-expanded`, `aria-controls`, clear accessible names, and visible
      focus states.
- [x] Ensure no horizontal overflow at 375px, 768px, 1024px, and 1440px.

## Work Unit D - Feedback And Edge States

- [x] Detect a genuine level increase before showing a queued toast.
- [x] Use an SVG icon and plain text in the toast (no production emoji).
- [x] Add a static maximum-level state and a reusable loading/skeleton state.
- [x] Stop popover/skeleton/flash animation under
      `prefers-reduced-motion: reduce`.

## Validation Gate

- [x] Production build passes without modifying the active `.next` dev output.
- [x] Desktop screenshots: HUD collapsed, expanded, and each summary shortcut.
- [x] Mobile screenshots: collapsed avatar, expanded card, no overlap/overflow.
- [x] Keyboard: trigger opens with Enter/Space, Escape closes, focus restores,
      summary actions and account controls are reachable.
- [x] Visual review assumes multiple mistakes; triage every screenshot P0-P4
      and recapture after fixes (maximum three cycles).
- [x] Record final screenshot paths and any deferred findings.
- [x] Update `TASKS.md`, then commit each validated work unit separately.

## Evidence

- Visual evidence: `screenshots/player-hud-2026-07-04/`
- Cross-viewport contact sheet:
  `screenshots/player-hud-2026-07-04/contact-sheet.png`
- Validation detail: `validation-report.md`
