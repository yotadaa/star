# Blog English Reader Polish - Validation Results

Validated on 2026-08-24 against the final Next.js production build and the live Convex deployment.

## Functional and language checks

- `html[lang]` is `en`; the skip link reads “Skip to main content.”
- The shared Blog reader, list, engagement, image preview, flowchart, admin, fallback, and error copy is English.
- Live readback returned six published posts with the expected block counts and English read-time labels.
- The deterministic seed contains nine English posts, 14 inventory items, six content entries, and five contact channels.
- The content scan found no Indonesian prose. Two deliberate source quotations remain: the Stok Toko labels `Tersedia`, `Stok Menipis`, and `Stok Habis`, and the GenBI screenshot headline containing `dan`.
- The former “Buka ukuran besar” text does not exist in the rendered DOM.

## Fullscreen image control

- Visual control: 44 x 44 px.
- Accessible name begins with “Open image fullscreen.”
- The control contains the shared monoline fullscreen SVG and no visual text.
- The native dialog fits inside the 375 x 812 viewport; measured shell bounds were 345 x 328 px.
- Explicit close, native cancel handling, and focus return are present. Browser validation confirmed focus returned to the originating image trigger after close.

## Table checks

- Desktop 1440 x 900: shell and table were both 756 px wide; no local overflow was needed.
- Mobile 375 x 812: shell client width was 316 px and table scroll width was 620 px, with `overflow-x: auto` on the shell.
- Document width was 360 px inside a 375 px viewport, so the table introduced no page-level horizontal overflow.
- The table region is keyboard-focusable, exposes “Primary-source timeline” as its semantic caption, and retains three scoped column headers.

## Motion and browser diagnostics

- The Blog changes add no looping animation.
- The final CSSOM contains the reduced-motion rules that set the fullscreen hint transition to `none`, suppress its transform, and remove dialog/backdrop animation and transition.
- The connected in-app browser did not expose media emulation and retained `matchMedia('(prefers-reduced-motion: reduce)').matches === false`; `desktop-reduced-motion.png` therefore records the required static end state while the CSSOM assertion verifies the reduced-motion branch.
- No browser errors were recorded. The existing Three.js `THREE.Clock` deprecation warning remains and is tracked in `plans/performance-audit-2026-08-24.md`.

## Technical gates

- `npm run convex:typecheck` - pass.
- `npm run convex:seed:build` - pass; content SHA-256 `4ac64071cbd638c09958a25150ed098e01151034daee90789b275ed5691ec328`.
- `npm run build` - pass after discarding one stale generated `.next` cache; final Home first-load JS remained 132 kB and `/blog/[slug]` remained 143 kB.
- `git diff --check` - pass.

## Visual triage

- P0-P2: none.
- P3: none introduced by this task.
- P4, deferred: the existing Nala mobile FAB can cover a small lower-right area of long media, table, and engagement surfaces. It is recorded in `TASKS.md`; this task does not change the global Nala placement.

## Evidence

- `desktop-table.png`
- `desktop-image-focus.png`
- `desktop-engagement.png`
- `mobile-table.png`
- `mobile-image-dialog.png`
- `mobile-engagement.png`
- `desktop-reduced-motion.png`
