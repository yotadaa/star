# Interactive CV Lore, public copy, SEO, and Featured Blog validation

Date: 2026-09-01

## Result

Passed. `/lore` renders the supplied English CV as semantic HTML with a local
portrait, a byte-identical PDF download, responsive document records, and
native detail dialogs. Home links to the route through `Read the Lore` without
adding it to the primary navigation. Home also emits three current published
Blog summaries as server-rendered article links.

The public route copy and metadata now identify the subject of Home, About,
Projects, Research, Blog, Contact, and Lore directly. Existing Blog article
canonical, publication, update, image, social, and JSON-LD fields remain
present.

## Source integrity

- Source PDF: `/home/tada/Downloads/Mukhtada_Nasution_CV_English.pdf`
- Public copy: `public/documents/mukhtada-nasution-cv-english.pdf`
- Matching SHA-256:
  `64644eb6264ebc85ddb2b3ca0c775a190ad4112b31c323aef4d30903559937cb`
- Both files are two-page PDF 1.4 documents.
- The extracted local portrait is a 287 x 289 JPEG.
- Education: 2 records; organizations: 4; experience: 5; skills: 3.
- The fuller details remain in initial HTML inside native dialogs. JavaScript
  is needed to open a dialog, not to crawl or read its source text.

## Build and data gates

- `npm run convex:typecheck`: passed.
- `npm run build`: passed; `/` is ISR at five minutes and `/lore` is static.
- `npm run blog:seo-data`: 40 records and 110 image blocks passed, with zero
  missing SEO fields and zero pending data updates.
- `git diff --check`: passed.
- Package and lockfile diff: empty.
- New hex literals in the Lore CSS diff: none.
- Static sitemap contains `/lore`; robots allows the route.

## Raw HTML and indexing surface

Production-server requests returned 200 for `/`, `/about`, `/projects`,
`/research`, `/blog`, `/contact`, and `/lore`. Each response has one H1, an
exact self-canonical, a page-specific title and description, and `index,
follow`.

Home initial HTML contains three distinct published `/blog/{slug}` links and a
plain `/lore` link. Lore initial HTML contains all five named sections, 11
`Open details` controls, the substantive source records, and parseable
`ProfilePage` JSON-LD. A current Blog article regression probe retained its
canonical, robots, Open Graph image, Twitter card, published and modified
metadata, two semantic time elements, and BlogPosting date fields.

## Browser and accessibility gates

The browser result is recorded in `browser-results.json`.

- Desktop 1440 px and mobile 375 px checks passed for all six existing public
  index pages.
- Home also passed at 768 px and with reduced motion.
- Lore passed at 1440, 768, and 375 px, with reduced motion and with JavaScript
  disabled.
- Every tested route had `scrollWidth === clientWidth`, one H1, a 200 response,
  and zero console or hydration errors.
- Keyboard Enter opened a dialog; Escape, backdrop click, and the close button
  closed it; focus returned to the opening control.
- The mobile dialog stayed within the viewport at 337 px wide inside a 375 px
  viewport.
- Home contained three Featured Blog article destinations and no Lore link in
  primary navigation.

## Screenshot evidence

The final screenshots are in `screenshots/`:

- route tops: `home`, `about`, `projects`, `research`, `blog`, and `contact`,
  each at desktop and mobile widths;
- Home: tablet, reduced motion, Featured Blog desktop, and Featured Blog
  mobile;
- Lore: desktop, tablet, mobile, reduced motion, JavaScript disabled,
  focus-visible, desktop dialog, and mobile dialog.

## Visual triage

- P0 guardrail: none.
- P1 functional: fixed before final evidence; record cards now show concise
  summaries while dialogs contain the complete source account.
- P2 accessibility: none after final interaction and overflow checks.
- P3 performance: no global listener, animation loop, WebGL path, or new
  dependency was added. The scoped commit's Home production First Load JS is
  135 kB.
- P4 cosmetic: none left in the changed surfaces.

## Boundary

These changes improve page clarity, crawl paths, semantic content, and search
result eligibility. They do not control when a search engine crawls, indexes,
or ranks a URL.
