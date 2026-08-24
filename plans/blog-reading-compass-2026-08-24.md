# Blog Reading Compass — 2026-08-24

## Evidence and scope

- Direct owner request: improve `/blog/[slug]` with useful left/right article navigation and one additional section before comments, with permission to choose a stronger information design.
- Supplied evidence: `/tmp/codex-clipboard-80453864-0965-40f9-8d7a-1e87a30d3d6d.png` shows a focused 760 px article measure surrounded by unused desktop gutters.
- Current render: the 1440×900 baseline keeps the article readable, but the gutters carry no onward path and the article body drops directly into the engagement ledger.
- Product authority: `PRODUCT.md` requires warm, mechanical, exploratory UI grounded in real proof; `DESIGN.md` requires the hardcard/pixel grammar, real Blog covers, keyboard access, reduced motion, and no page overflow.
- Existing data: published Blog rows already contain the real tags, excerpts, reading times, vote counts, and featured images needed for recommendations. The first implementation audit found that reusing `listBlogPosts()` transferred roughly 329 KB and resolved every article block, so the final design uses a bounded summary-only Convex query instead. No schema, seed, fabricated score, new dependency, or new color is needed.
- Scope: public `/blog/[slug]` only. Blog payloads, CMS/editor, SEO metadata, comments, votes, and Convex schema/functions remain unchanged.

## Design decision

Use two different recommendation signals instead of repeating one list:

1. **Desktop reading compass:** the two newest other articles occupy quiet sticky cards in the left and right gutters. They remain secondary to the article and disappear below the wide-desktop breakpoint.
2. **In-flow reading trail:** before comments, show up to three articles ranked by shared tags, then recency. The first recommendation carries the visual lead; the remaining two use compact ledger rows rather than an identical card grid.
3. **Responsive continuity:** tablet and mobile omit the gutters, but retain the complete in-flow trail. No article is available only through hover or only on desktop.
4. **Bounded rail behavior:** desktop rails stay with the article body and end before the in-flow trail. This permits the topic-ranked section to retain the strongest matches on mobile without showing duplicate cards beside it on desktop.
5. **Plain copy:** labels state what the links are—`Recent article`, `Read next`, and `View all articles`—without fabricated quest progress, inflated claims, or metaphor-heavy filler.

## Task: Add the Blog reading compass and next-reading trail

- Source specification: direct owner request; `PRODUCT.md` principles 2–5; `DESIGN.md` §§4, 8.1, 8.6, 10, 16, and 19; Impeccable layout/adaptation guidance; Anti-slop copy guardrails.
- Page/exact location: `/blog/[slug]`; gutter links flank the article column on wide desktop; the related-reading section sits after `BlogPostRenderer` and before `BlogEngagement`.
- Structure: semantic central `<article>`, two labelled navigation `<aside>` elements, and a labelled related-reading `<section>` with real links and decorative cover imagery.
- New dependency required?: NO.
- New color token required?: NO.
- Data confirmation required?: NO; all ordering and relationships derive from published post fields.
- Acceptance criteria:
  1. Wide desktop shows two newest other published articles in left/right sticky gutters without narrowing the article below its established readable measure.
  2. The pre-comment section shows up to three distinct posts, prioritizing shared tags and then publication recency; desktop rails end before this section begins.
  3. Every recommendation uses a real slug, title, excerpt/metadata, tag, and existing featured-image resolver; missing images retain the document-sprite fallback.
  4. Side links are hidden below the wide-desktop breakpoint; the in-flow trail composes into one column on mobile with 44 px minimum link targets and no lost functionality.
  5. Links have native semantics, descriptive accessible names through visible copy, visible `:focus-visible`, and no hover-only information.
  6. Hover/press transitions are disabled under `prefers-reduced-motion: reduce`.
  7. Desktop 1440×900, tablet 768×900, and mobile 375×812 have no new document-level horizontal overflow; the already-tracked global Nala FAB footprint is not broadened in this task.
  8. Existing article rendering, structured data, vote/comment behavior, source action, and Blog return link remain intact.
  9. Recommendation data uses a summary-only indexed query: no article block arrays are transferred, and its payload is materially smaller than the measured 329 KB full-list path.
  10. `package.json` dependencies and existing color literals remain unchanged; production typecheck/build pass with zero new browser console errors.
- Relevant guardrails: real data only; no dependency; no new literal color; no emoji; no blocking modal; no repeated uppercase section scaffold; keyboard/touch parity; reduced motion; mobile overflow prevention.
- Screenshot evidence: `validation/blog-reading-compass-2026-08-24/desktop-top.png`, `desktop-reading-trail.png`, `desktop-focus.png`, `tablet-reading-trail.png`, and `mobile-reading-trail.png`. The connected browser did not expose media emulation, so reduced motion was validated from the explicit terminal-state media rule rather than represented by a misleading screenshot.
- Triage findings:
  - P3 fixed: the first pass reused the full Blog list and measured 328,953 bytes. A bounded indexed Convex summary query now returns 22,675 bytes for all 21 published rows (about 93% smaller) without resolving block arrays.
  - P2 pre-existing/deferred: the fixed Nala mobile FAB can cover a small lower-right part of any Blog content while scrolling. This was already recorded in `TASKS.md` Someday with earlier evidence; it was not introduced or expanded by this component.
  - No new P0, P1, P2, or P4 finding remains in the scoped reading-compass implementation.
- Status: done.

## Validation gates

- Static: production typecheck/build, dependency diff, color-literal diff, export/source checks, and deterministic recommendation assertions.
- Browser: default top, recommendation boundary, keyboard focus, desktop/tablet/mobile layout, and missing-image fallback where available; reduced motion is tested through media emulation when the connected browser exposes it, otherwise by explicit terminal-state rule inspection.
- Measured: document `scrollWidth <= clientWidth`; side rails absent below their breakpoint; three or fewer distinct in-flow recommendations; all recommendation slugs differ from the current slug; touch targets at least 44 px.

## Final validation — 2026-08-24

- Convex function push: `npx convex dev --once` completed against the configured development deployment.
- Types: `npm run convex:typecheck` passed.
- Production: `npm run build` passed; `/blog/[slug]` remains a dynamic route at 4.94 kB / 143 kB first-load JS.
- Production smoke: the built server returned HTTP 200 and contained `Read next` plus all three expected recommendation slugs.
- Ranking assertion: current slug/drafts excluded, recent order deterministic, shared-tag count ranked before recency.
- Desktop 1440×900: document 1425/1425 px client/scroll width; both 172 px rails visible; three topic-ranked recommendations rendered; rails left the viewport before the reading trail.
- Tablet 768×900: document 753/753 px client/scroll width; rails `display:none`; 713 px in-flow layout; all link targets at least 44 px.
- Mobile 375×812: document 360/360 px client/scroll width; rails `display:none`; 320 px single-column layout; recommendation targets measured 44, 382, 118, and 118 px high.
- Keyboard: the recommendation action matched `:focus-visible` with a 2 px dashed outline and 3–4 px offset.
- Browser console: a fresh article tab reported no warnings or errors.
- Design detector: no new warning originated in the added selectors; reported side-tab/bounce warnings predate this task elsewhere in the global stylesheet.
- Guardrails: no package dependency change, no new literal color, no schema change, no fabricated article data, and no client-side listener or recommendation JavaScript.
