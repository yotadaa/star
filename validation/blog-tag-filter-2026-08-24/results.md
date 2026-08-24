# `/blog` tag filter validation — 2026-08-24

## Final result

The default tag wall is reduced to `All` plus three ranked topics. The other 54 current topics remain reachable through a searchable disclosure panel. Selecting a long-tail topic filters the article list, updates the live result summary, and promotes that topic into the compact rail when the panel closes.

## Browser evidence

| View/state | Screenshot | Measured result |
|---|---|---|
| Desktop 1440×900, default | `desktop-default.png` | 4 exposed filters; document 1425/1425 px; primary rail 716/716 px; 44 px minimum controls |
| Desktop 1440×900, expanded | `desktop-expanded.png` | 54 long-tail buttons; panel width 876 px; local list 194/365 px with `overflow-y: auto`; no page overflow |
| Desktop keyboard focus | `desktop-keyboard-focus.png` | More-topics control has a visible 2 px solid focus outline; Escape closes the panel and restores focus |
| Tablet 768×900, default | `tablet-default.png` | 4 exposed filters; document 753/753 px; primary rail 553/553 px; no overflow |
| Mobile 375×812, default | `mobile-default.png` | Document 360/360 px; compact rail locally scrolls 211/438 px; 44 px minimum controls |
| Mobile 375×812, expanded | `mobile-expanded.png` | Panel remains inside the 320 px content area; tag list scrolls locally 238/1041 px; no page overflow |
| Mobile, long-tail selected | `mobile-selected.png` | `Semiconductors` reports 1 article, is promoted into view, and document width remains 360/360 px |

Search was exercised with `semic`, returning only the real `Semiconductors` tag. Across the final state, all 57 unique source tags are reachable: three in the primary set and 54 in the disclosure. Browser console errors and warnings: 0.

## Accessibility and guardrails

- Filters are native buttons grouped with `role="group"` and expose `aria-pressed`; the disclosure exposes `aria-expanded` and `aria-controls`.
- Article-count changes use a polite live status. Search has a visible label, and Escape returns focus to the disclosure button.
- Controls are at least 44 px high. Text contrast checks: `--ink-soft` on `--cream` 6.44:1; `--ink` on `--gold` 8.67:1.
- The expanded list uses local scrolling and `overscroll-behavior: contain`; the mobile primary rail is independently scrollable without widening the document.
- Reduced motion is enforced by the project-wide `prefers-reduced-motion: reduce` block and scoped rules disabling selected-filter animation and disclosure-chevron transition. The in-app Browser capability did not expose media emulation, so this gate was verified statically rather than represented by a misleading screenshot.
- No dependency change, new color literal, fabricated tag, modal, audio, or emoji was introduced.
- Impeccable detector findings are pre-existing rules outside this diff; the changed selectors introduced no new detector finding.

## Automated checks

- `npm run convex:typecheck` — pass.
- `npm run build` — pass; `/blog` production route compiled successfully.
- `git diff --check` — pass for the scoped source and plan files.
- New hex literals in the scoped CSS diff — none.
- `package.json` / lockfile dependency diff — none.

## Triage log

- P2: the first design kept too many persistent topics on narrow screens. Fixed by capping the default rail at three ranked topics plus `All`.
- P2: a selected long-tail topic could be outside the visible mobile rail. Fixed by promoting it into the compact set and adjusting the rail scroll position without animation.
- Final pass: no unresolved P0-P4 finding in this component.
