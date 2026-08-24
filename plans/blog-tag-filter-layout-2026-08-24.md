# Blog Tag Filter Layout — 2026-08-24

## Evidence and scope

- Direct owner request: repair the tag wall on `/blog` so the page is neat and comfortable.
- Visual evidence: `/tmp/codex-clipboard-537ab8f9-5b7d-4fa2-8735-64b1df363a7b.png` shows every Blog tag rendered with equal priority across seven wrapped rows before the article controls.
- Product constraints: preserve the warm, mechanical hardcard language; keep keyboard access, reduced motion, legible contrast, and zero page-level horizontal overflow (`PRODUCT.md`).
- Existing implementation: `components/blog/BlogPostList.jsx` renders the complete dynamic tag set inside one wrapping `.cat-filters` row; `app/globals.css` gives every filter the same visual weight.
- Scope is limited to the `/blog` index filter toolbar. Article payloads, tag assignments, Blog cards, CMS data, and `/blog/[slug]` are unchanged.

## Layout decision

Use progressive disclosure:

1. Keep `All` plus at most three frequent/recent topics in the primary filter rail.
2. Rank topics by real post frequency, retaining first-seen order for ties so the result remains deterministic and current-content-aware.
3. Put the remaining topics behind a clearly labelled `More topics` disclosure.
4. Give the expanded long-tail panel a local topic search instead of making visitors scan a large undifferentiated wall.
5. If a long-tail topic is selected, keep it in the primary rail so the active state remains visible after collapse.
6. Report the active topic and matching article count next to the toolbar label.

This changes information hierarchy without deleting data, inventing categories, or adding a dependency.

## Task

### Task: Compact `/blog` tag filter

- Source specification: direct owner request and supplied screenshot; `PRODUCT.md` Design Principles 2 and 5; Impeccable layout guidance for density, hierarchy, and tight/loose grouping.
- Page/exact location: `/blog`, between the optional CMS access card and the article list/grid.
- Elements and structure: primary filter rail, result summary, `More topics` disclosure, searchable long-tail panel, existing grid/list controls.
- New dependency required?: NO.
- New color token required?: NO.
- Data confirmation required?: NO; ordering is derived from real post tags and no tags are mutated.
- Acceptance criteria:
  1. No more than four filter buttons (`All` plus three topics) are exposed in the default primary rail.
  2. Every remaining real tag is available through `More topics`; search filters that long tail case-insensitively.
  3. Selecting any tag filters posts, updates a polite result summary, and keeps a selected long-tail tag visible in the compact rail.
  4. Filter controls use button-group semantics with `aria-pressed`; disclosure state and controlled panel are announced; all controls have visible keyboard focus.
  5. Primary filter and expanded topics stay contained at desktop, 768 px, and 375 px without adding document-level horizontal overflow.
  6. Mobile keeps the compact primary rail locally scrollable and touch targets at least 44 px high.
  7. Reduced-motion mode does not animate selection or disclosure changes.
  8. `package.json` dependencies and existing color literals remain unchanged.
- Relevant guardrails: no dependency, no new color, no fabricated data, no blocking modal, focus-visible parity, reduced motion, mobile overflow prevention.
- Screenshot evidence: `validation/blog-tag-filter-2026-08-24/desktop-default.png`, `desktop-expanded.png`, `desktop-keyboard-focus.png`, `tablet-default.png`, `mobile-default.png`, `mobile-expanded.png`, and `mobile-selected.png`.
- Triage findings: P2 mobile primary-filter visibility was fixed by reducing the persistent topic set from five to three; P2 long-tail active-state visibility was fixed by promoting the selection into the compact rail and scrolling it into view. Final checks found no open P0-P4 issue in this component.
- Status: done.

## Validation gates

- Static: production build, dependency diff, color-literal diff, and source checks for dynamic tag derivation/accessibility attributes.
- Browser: 1440×900, 768×900, and 375×812; default, expanded, searched, selected-long-tail, and keyboard focus states. The Browser capability does not expose media emulation, so reduced motion is verified from the explicit scoped CSS override plus the project-wide reduced-motion override.
- Measured: document `scrollWidth <= clientWidth`; primary rail and long-tail panel remain within their container; default exposed-filter count `<= 4`; all source tags remain reachable.
