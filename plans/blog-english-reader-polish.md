# Blog English Reader Polish

### Task: Public Blog detail language, fullscreen image control, and data tables

- Source specification: user request on 2026-08-24; `PRODUCT.md` identity/accessibility rules; current Blog reader contract in `DESIGN.md` Sections 10 and 16
- Exact route: `/blog`, every published `/blog/[slug]` reader surface, and remaining site-wide user-facing copy covered by the explicit “website fully in English” request
- Elements and structure:
  - shared Blog list/detail copy in `app/blog/` and `components/blog/`
  - stored Blog payloads in the deterministic publisher scripts
  - shared site copy and known Convex-backed page captions/contact-channel labels
  - `BlogImagePreview` native-dialog trigger and its existing monoline `SpriteIcon` family
  - semantic `<table>` output in `BlogPostRenderer`
- New dependency required?: NO
- New color token required?: NO
- Data confirmation required?: NO; the request explicitly changes the public language to English and does not change article facts
- Acceptance criteria:
  1. Shared Blog list, reader, comments, image preview, flowchart, empty/error, and accessible-label copy is English.
  2. Every published Blog payload is English except proper names, repository identifiers, quoted interface labels visible in source screenshots, and official Indonesian publication/project names that must remain factual.
  3. The former “Buka ukuran besar” overlay is a monoline fullscreen icon from the existing sprite system. The full-image button has an English accessible name, a visible focus state, and a minimum 44 x 44 px visual control.
  4. Tables expose their block title as a semantic caption, use existing brand tokens, preserve column headers, improve row scanning, and scroll only inside the table shell on narrow screens.
  5. No page-level horizontal overflow occurs at 375 px. Keyboard users can open and close image previews, and focus returns to the trigger.
  6. Reduced motion, image carousel behavior, links, citations, block order, facts, numbers, and storage-backed image ownership remain unchanged.
  7. `npm run convex:typecheck`, deterministic seed generation, and `npm run build` pass.
  8. The document language is `en`, known Convex-backed captions and contact labels render in English without replacing owner-authored English biography text, and Nala answers in English.
- Relevant guardrails:
  - no new npm dependency, color literal, emoji UI, fabricated data, or blocking custom modal
  - reuse the native dialog and current hardcard/pixel language
  - preserve focus-visible, reduced-motion, semantic table headers, and mobile containment
- Screenshot evidence:
  - `validation/blog-english-reader-polish-2026-08-24/desktop-table.png`
  - `validation/blog-english-reader-polish-2026-08-24/desktop-image-focus.png`
  - `validation/blog-english-reader-polish-2026-08-24/desktop-engagement.png`
  - `validation/blog-english-reader-polish-2026-08-24/mobile-table.png`
  - `validation/blog-english-reader-polish-2026-08-24/mobile-image-dialog.png`
  - `validation/blog-english-reader-polish-2026-08-24/mobile-engagement.png`
  - `validation/blog-english-reader-polish-2026-08-24/desktop-reduced-motion.png`
- Triage findings: P0-P3 none. Existing P4 Nala mobile FAB overlap is deferred to the already-tracked `TASKS.md` item. The connected browser did not expose media emulation; the static end-state screenshot and exact reduced-motion CSSOM rules are recorded in `validation/blog-english-reader-polish-2026-08-24/results.md`.
- Status: done

## Implementation order

1. Translate shared reader/list copy and fallback/error text.
2. Add the sprite-compatible fullscreen glyph and replace the visual hint.
3. Add semantic table caption/shell markup and token-only responsive styles.
4. Translate stored published payload sources without changing factual structure.
5. Normalize known legacy Convex page labels at the read boundary and update the deterministic seed so old Indonesian records cannot reappear in the UI or a later migration.
6. Republish changed payloads to Convex, verify public readback, then run visual/technical gates.
7. Record validation and commit only the coherent Blog, audit-plan, and evidence changes.
