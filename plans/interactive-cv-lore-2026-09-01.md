# Interactive CV Lore route

## Goal

Turn the supplied two-page English CV into a semantic, interactive document at
`/lore`. The route stays out of the navbar and command palette, and the Home
Hero's existing `Read the Lore` action becomes its only visible primary entry
point. The page remains indexable through that link and the public sitemap.

## Source record

- Source PDF: `/home/tada/Downloads/Mukhtada_Nasution_CV_English.pdf`
- SHA-256: `64644eb6264ebc85ddb2b3ca0c775a190ad4112b31c323aef4d30903559937cb`
- Format: two A4 pages, 62,729 bytes, PDF 1.4, no forms or JavaScript.
- Visual review: both pages rendered at 160 dpi and inspected. Page 1 contains
  portrait/contact, Summary, Education, and Organizations. Page 2 contains
  Experience and Skills.
- Embedded assets: one 287 x 289 portrait JPEG and four small contact icons.

## Specification mapping

- `PRODUCT.md`: warm, mechanical, exploratory; real proof carries the visual
  weight; no fake metrics, emoji UI, generic AI glow, or repeated glass cards.
- `DESIGN.md` §§4, 8, 10, 14, 16, 18: parchment/ink document surfaces,
  Fraunces/Silkscreen/Nunito roles, hardcard grammar, semantic native controls,
  mobile stacking, focus return, reduced motion, and visual proof.
- `design-system.md` §§5 and 11: tactile button/focus states and complete
  keyboard/reduced-motion behavior.
- `report.md` §§2 and 6: the route may extend the profile narrative, but this
  task adds no rarity, fabricated level, sound, or blocking celebration.
- Active Home performance task: the Home change is one ordinary route link;
  the CV route adds no WebGL, animation loop, or global listener.

## Factual decisions

1. Use `Information Systems student`, not the PDF Summary's `graduate`, because
   the same PDF says `2022 - Present` and the current repository consistently
   identifies an active student. This avoids a contradictory public claim.
2. Use the PDF's fuller Parto.id record: Fullstack Developer internship,
   attendance application, Go/Go Gin, React Native, and mixed front/back-end
   contribution.
3. Include the three CV records missing from the current public experience
   data: HIMASI Research and Technology, Statistics Corner, and Pematang Gajah
   agrotourism/WordPress work.
4. Include the 2019 German Language Olympiad record from the CV. Keep the
   repository's more specific `OSN-P Informatics Finalist` wording while
   explaining its provincial OSN context.
5. Keep exact publication titles and citation data on `/research`; the PDF only
   makes a general research claim and is not their primary source.
6. The supplied phone/email may be rendered because the user explicitly asked
   to publish this CV. They are visible contact links but are omitted from
   JSON-LD to avoid expanding machine-readable personal data unnecessarily.

## Information architecture

1. Document cover
   - Local portrait extracted from the source PDF.
   - Name, role, location, and a concise student/builder summary.
   - Contact links with existing line icons.
   - `Download CV` and `View projects` actions.
2. Sticky document index
   - Summary, Education, Organizations, Experience, and Skills anchors.
   - Becomes a wrapping inline index on mobile.
3. Summary
   - Short, direct rewrite that preserves the PDF's academic, research,
     community, project, and GenBI substance.
4. Education, Organizations, Experience
   - Document-style records with title, organization, and period always
     visible.
   - A native detail dialog holds the longer source-grounded account.
5. Skills
   - Three document cards: Web/Mobile, Programming/Data, and UI/UX/SEO.
   - Text labels accompany every icon; no invented proficiency meter.
6. Evidence handoff
   - Ordinary links to Projects, Research, Blog, GitHub, and Google Scholar.
   - These links are sourced from existing repository data, not attributed to
     the PDF.

## Interaction contract

- Each `Open details` control is a native button linked to a native `<dialog>`.
- Escape, explicit close, and backdrop click close the dialog.
- Focus returns to the opening control.
- Dialog content exists in server-rendered HTML even while closed.
- No hover-only content and no looping animation.
- Reduced motion removes document/dialog transforms and scrolling animation.
- The route has one H1; sections use H2 and records use H3.

## SEO and discovery

- Title: `Interactive CV · Mukhtada Billah NST`.
- Page-specific description and restrained topic metadata.
- Exact canonical `/lore`, index/follow, social image, and a source-backed
  `ProfilePage` node pointing to the existing site Person identity.
- Add `/lore` to the static public-pages sitemap.
- Do not add it to `navLinks`, command palette, footer, or Nala's route list.
- Keep the full CV as HTML; the PDF and portrait are supporting assets, not the
  only readable representation.

## Task contract

- Dependency baru dibutuhkan?: TIDAK.
- Token warna baru dibutuhkan?: TIDAK; use existing semantic tokens only.
- Butuh konfirmasi rarity/medal?: TIDAK; this route does not assign either.
- Guardrails: no fabricated claims, no emoji UI, no audio, no full-screen game
  modal, no generic glass/gradient card system, complete keyboard/focus/mobile
  support.
- Screenshot evidence:
  `validation/interactive-cv-lore-2026-09-01/screenshots/`.
- Status: done. Final evidence:
  `validation/interactive-cv-lore-2026-09-01/validation.md`.

## Acceptance criteria

1. `/lore` returns 200 with one H1, five named CV sections, an exact canonical,
   index/follow, valid metadata, and parseable `ProfilePage` JSON-LD.
2. Home `Read the Lore` is a crawlable `/lore` link. The route remains absent
   from the navbar and command palette and is present in `sitemap-pages.xml`.
3. Every substantive PDF record is present in HTML, and no unsupported fact,
   proficiency score, metric, date, or employer claim is added.
4. The portrait and downloadable PDF are byte-derived from the supplied source,
   served locally, and do not depend on the Downloads path at runtime.
5. Detail dialogs open by mouse and keyboard; Escape, backdrop, and close button
   work; focus returns to the trigger; names and descriptions are exposed to
   assistive technology.
6. Desktop (1440 px), tablet (768 px), mobile (375 px), open-dialog,
   focus-visible, JavaScript-disabled, and reduced-motion gates pass without
   document overflow, clipped text, hydration warnings, or broken assets.
7. `npm run convex:typecheck`, `npm run build`, raw-HTML assertions,
   `git diff --check`, and dependency/color-literal checks pass.

## Boundaries

- The source PDF is not edited.
- No database row, authentication rule, or external account is changed.
- This route is an interactive CV, not a replacement for the deeper About,
  Projects, Research, or Blog records.
