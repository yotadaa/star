# Player HUD Validation Report

Date: 2026-07-04

## Automated Checks

- Production build passed from an isolated temporary copy; the active `.next`
  dev output on port 4123 was not modified.
- No `package.json` or lockfile dependency changes.
- No console errors or failed requests while opening and navigating the HUD.
- `System Integrity` exposes `role="progressbar"`, `aria-valuenow="11"`,
  `aria-valuemax="30"`, and `aria-valuetext="11/30 PP ke Lv.5"`.
- Enter and Space open the HUD; Escape closes it and restores trigger focus.
- The World Chat shortcut closes the HUD and opens the lazy chat panel.
- Inventory, Achievement, and Mission summary controls open the matching tab.
- At 375, 768, 1024, and 1440 pixels, document `scrollWidth` equals
  `clientWidth`.
- Under `prefers-reduced-motion: reduce`, the popover reports
  `animation-name: none`.
- Keyboard focus on a summary control reports a 2px dashed gold outline with a
  3px offset.

## Screenshot Evidence

- Desktop: `desktop-collapsed.png`, `desktop-expanded.png`,
  `desktop-focus-visible.png`, `desktop-reduced-motion-expanded.png`
- Summary shortcuts: `desktop-inventory-shortcut.png`,
  `desktop-achievement-shortcut.png`, `desktop-mission-shortcut.png`
- Tablet and medium: `tablet-collapsed.png`, `tablet-expanded.png`,
  `medium-collapsed.png`, `medium-expanded.png`
- Mobile: `mobile-collapsed.png`, `mobile-expanded.png`
- Review sheet: `contact-sheet.png`

All paths above are relative to `screenshots/player-hud-2026-07-04/`.

## Triage

- **P2 fixed:** at the first 768px pass, the expanded navigation occupied the
  same top row as the HUD trigger. The navigation collapse breakpoint now
  covers 800px and below; the final trigger-to-navbar gap is 208.5px at 768px.
- **P1 fixed:** the new HUD root initially shared `.player-hud` with the
  existing status strip inside `PlayerStatusPopup`. The status strip was
  renamed to `.player-popup-hud-status` to remove cascade coupling.
- **P3 pass:** chat and player popups remain dynamically imported; the
  production Home route remains 3.93kB with 128kB first-load JS.
- **P4 deferred:** the existing full Player Status popup still has older
  rounded/gradient styling. It predates this HUD task and is recorded in
  `TASKS.md` rather than changed during this validation cycle.
