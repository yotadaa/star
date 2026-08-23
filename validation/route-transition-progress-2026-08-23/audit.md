# Route Transition Progress Validation

Date: 2026-08-23

Result: passed

## Render evidence

- `desktop-active.png`: 1280 × 800, Home remains visible while Blog prepares;
  the route rail is active at the top edge.
- `desktop-idle-blog.png`: 1280 × 800, Blog settled; the route rail is hidden and
  the original 3 px XP rail remains.
- `tablet-active-command-palette.png`: 768 × 1024, programmatic App Router
  navigation from the command palette.
- `mobile-active.png`: 375 × 812, Contact remains visible while Projects
  prepares; the rail stays inside the document width.
- `mobile-idle-projects.png`: 375 × 812, Projects settled with no rail residue.

## Programmatic checks

| Check | Result |
| --- | --- |
| Active geometry | 4 px high, full viewport width, fixed at top |
| Layer | z-index 270, above XP 260 and below Toast 280 |
| Input interception | `pointer-events: none`; no focus target |
| Active semantics | `role=progressbar`, `aria-label=Memuat halaman` |
| Honesty | no `aria-valuenow`; `aria-valuetext=Berpindah halaman` |
| Settled semantics | role removed, `aria-hidden=true`, visibility hidden |
| Existing XP rail | still 3 px at z-index 260 |
| Overflow | 0 px at 1280, 768, and 375 viewports |
| Current-route click | ignored; rail remains idle |
| Command palette | explicit start event reaches the same lifecycle |
| Browser history | back navigation reached the previous route through `popstate` |
| Reduced motion | final CSSOM contains `transition: none !important`, full-width fill, and a static end cap inside `prefers-reduced-motion: reduce` |
| Dependency/token diff | no package or root color-token changes |
| Production build | `npm run build` passed after the old dev server released `.next` |

The browser harness did not expose media emulation. Reduced-motion validation
therefore used the final loaded stylesheet rather than a claimed visual capture.
The rule removes every route-rail transition with `!important` so the global
0.001 ms fallback cannot reintroduce movement.

## Triage

- P2 fixed: the first implementation used `transition: none` without priority.
  The global reduced-motion rule had an `!important` transition duration, so
  the route selectors now use `transition: none !important`.
- No P0, P1, P3, or P4 findings remain in this component.

