# Route Transition Progress Plan

Date: 2026-08-23

Status: completed and validated

## 1. Problem

Client-side page changes can leave the previous page visible while the next
route is prepared. The interface gives no immediate navigation feedback, so a
normal App Router transition can read as a frozen click.

The existing 3 px top rail does not solve this problem. It is `XpScrollBar`, a
real scroll-depth indicator. Reusing its value for route loading would mix two
different meanings and could present a made-up percentage.

## 2. Sources

- `PRODUCT.md`: warm, mechanical, exploratory; motion must stay quiet and
  accessible.
- `DESIGN.md` §§4–6, 14, 16, 18–19: approved Verdant Dusk tokens, fixed-layer
  contract, top-edge XP bar, responsive evidence requirements, reduced-motion
  behavior, and no fabricated progress.
- `design-system.md` §§3, 5, 11: the scroll XP bar remains 3 px and accurate;
  global motion must stop under reduced motion.
- `report.md` §§1.2 and 8: the top edge already represents exploration progress;
  do not create a real XP/backend system.
- Next.js 15 App Router documentation: route completion can be observed with
  `usePathname`; the App Router does not expose the old Pages Router event API.
- `impeccable` brand register: preserve the existing product identity and avoid
  a generic loading-library treatment.

## 3. Design decision

Add a second, temporary rail above `XpScrollBar`.

- The scroll rail keeps its current 3 px geometry, gradient, and real
  scroll-derived value at z-index 260.
- The route rail is 4 px at z-index 270. It uses solid `--gold` with a short
  `--aurora` leading cap, a dark token track, and stepped motion. No color,
  gradient, glow, icon, dependency, or visible loading copy is added.
- The route rail is indeterminate. Its staged visual movement is a waiting
  signal, not a network percentage, so it does not expose `aria-valuenow`.
- It starts for eligible same-origin page links and browser back/forward. It
  ignores external links, downloads, modifier-assisted new tabs, same-page
  anchors, and repeated links to the current path.
- `usePathname` marks the route ready. A short minimum display time prevents a
  one-frame flash, while a fail-safe clears a transition that never completes.
- Under `prefers-reduced-motion: reduce`, the rail is a static full-width band
  while navigation is pending. All stepped movement and fading stop.

This component improves perceived responsiveness without delaying navigation
or claiming to shorten route execution time.

## 4. Task record

### Task: Global route transition progress rail

- Sumber spesifikasi: `PRODUCT.md` Design Principles 2, 4, 5;
  `DESIGN.md` §§5.1, 5.4, 6.2, 14, 16, 18; `design-system.md` §§3, 11.
- Halaman/letak persis: fixed at the top viewport edge on every route, above the
  existing XP scroll bar and navigation island.
- Elemen & struktur: one non-interactive track, one visual fill, and one
  assistive indeterminate progress semantic while active.
- Dependency baru dibutuhkan?: TIDAK.
- Token warna baru dibutuhkan?: TIDAK.
- Butuh konfirmasi data?: TIDAK. No data, score, or percentage is shown.
- Acceptance criteria:
  1. Eligible mouse, touch, and keyboard link activation exposes the route rail
     before the destination is ready; external/hash/current-route activation
     does not.
  2. Back and forward navigation use the same pending/completed lifecycle.
  3. Completion follows the App Router pathname change, reaches the end once,
     then clears. A bounded fail-safe prevents a stuck rail.
  4. The scroll XP rail remains present and scroll-derived when route progress
     is idle.
  5. The active semantic is an indeterminate `progressbar` with an Indonesian
     accessible name and no fabricated `aria-valuenow`.
  6. Reduced motion shows a static final-width waiting state with no transition
     or animation.
  7. The component creates no focus target, captures no click, shifts no layout,
     and causes no horizontal overflow at 1280, 768, or 375 px.
  8. `package.json` dependencies and the root color-token list do not change.
- Guardrail relevan: no dependency, no color, no fake progress, no emoji, no
  blocking overlay, reduced motion, keyboard-safe behavior, no overflow.
- Screenshot evidence: `validation/route-transition-progress-2026-08-23/`
  covering desktop, tablet, mobile, active transition, and idle destination;
  `audit.md` records the loaded reduced-motion CSSOM because the browser harness
  does not expose media emulation.
- Temuan triase: P2 reduced-motion priority conflict fixed; no open P0–P4 item.
- Status: done.

## 5. Validation plan

1. Programmatically verify eligible and ignored link cases, pathname completion,
   timeout cleanup, ARIA attributes, pointer events, and document overflow.
2. Capture the active rail and settled destination at 1280 px, 768 px, and
   375 px.
3. Capture the reduced-motion pending state and confirm computed transition and
   animation values are disabled.
4. Run the production build after stopping the development server.
5. Record all P0–P4 findings. Fix P0–P2 before marking the task complete.

## 6. Validation result

The rail was captured during real cold route compilation at 1280 × 800,
768 × 1024, and 375 × 812. It remained 4 px high, non-interactive, and free of
horizontal overflow. Active state exposed an indeterminate progressbar without
`aria-valuenow`; idle state removed the role and revealed the unchanged 3 px XP
rail. Current-route links were ignored, command-palette navigation used the same
lifecycle, browser history returned through `popstate`, and the production build
passed. Full evidence and triage are in
`validation/route-transition-progress-2026-08-23/audit.md`.
