# Public copy, metadata, and Featured Blog plan

## Goal

Make every indexed public route read like a finished English portfolio, give
each page a clear search subject, and add recent published Blog articles to
the homepage as server-rendered internal links.

## Fresh evidence

- Production returns indexable HTML, exact self-canonicals, and distinct
  metadata for `/`, `/about`, `/projects`, `/research`, `/blog`, and
  `/contact`.
- The production homepage has no `/blog/{slug}` anchors in its initial HTML.
- The secondary Hero action points to `#journey`, but no element with that ID
  exists on the homepage.
- The live About intro contains the typo `Mukhtada Billah NSTs`.
- The live Blog caption exposes an internal storage detail instead of telling
  readers what the Blog covers.
- Several public labels still use game shorthand where a plain page subject
  would be clearer, and three accessibility labels remain in Indonesian on an
  English page.
- Google recommends concise, page-specific titles and descriptions, useful
  visible copy, meaningful crawlable links, and important text in the DOM.
  Google also states that the `meta keywords` tag does not affect its indexing
  or rankings.

## Scope

1. Refactor the visitor-facing page frame for Home, About, Projects, Research,
   Blog, each Blog article, and Contact:
   - metadata title, description, and restrained topic terms;
   - primary heading, caption, section heading, CTA, empty-state, and footer
     copy where the current wording is vague or implementation-facing;
   - English accessible names on the public English interface.
2. Keep the pixel-adventure language in small eyebrow labels where it supports
   the existing identity. Primary headings and links must say what the page or
   destination contains.
3. Keep publication titles, project names, employers, dates, citation records,
   article bodies, and other sourced facts unchanged.
4. Normalize only the exact known legacy About intro and legacy captions at
   read time. Preserve arbitrary future owner edits and do not mutate Convex.
5. Add the three newest published Blog summaries to `/` through a server data
   boundary and five-minute ISR. Render ordinary article anchors, titles,
   excerpts, images, dates, reading labels, and a link to the complete Blog.
6. Reuse the current Blog cards and design tokens. Do not add a dependency,
   color, schema, fabricated featured flag, or duplicate article structured
   data.

## Implementation boundary

- `app/page.js` becomes the async Server Component. It exports explicit root
  metadata, `revalidate = 300`, reads `listBlogPostSummaries({ limit: 3 })`,
  filters to published records, and passes only public serializable fields.
- The existing interactive homepage moves to
  `components/home/HomePageContent.jsx` with its hooks and client-only visual
  imports intact.
- `BlogPostCard` gains a bounded heading-level option so the Blog index keeps
  `h2` cards while the homepage uses `h3` below its section `h2`.
- The Blog summary path uses no cookies, headers, `noStore`, or no-cache fetch,
  so route-level ISR can remain effective.

## Copy direction by route

| Route | Primary subject |
|---|---|
| `/` | Mukhtada as a full-stack developer working across web, AI, data, and research |
| `/about` | Profile, experience, education, skills, and sourced achievements |
| `/projects` | Web, AI, data, research, and community projects with source links |
| `/research` | Information systems publications and Google Scholar records |
| `/blog` | Articles on web development, AI tooling, open source, and research |
| `/blog/{slug}` | The article title and editorial content; no backend source label |
| `/contact` | Project, research, and portfolio contact channels |

## Acceptance criteria

1. Each indexed public page has one clear H1, a unique title and description,
   an exact self-canonical, and `index, follow` in a production build.
2. Root raw HTML contains up to three distinct published Blog titles,
   excerpts, and crawlable `/blog/{slug}` anchors in newest-first order.
3. No draft or local-preview Blog record appears on the homepage; an honest
   empty state still links to `/blog` if no published summary is available.
4. The Hero secondary action reaches `/lore`; every changed internal action
   is an ordinary anchor or Next link with descriptive text.
5. Known legacy About text is corrected without replacing unrelated owner
   copy. No public caption mentions Convex, a database, or a local fallback in
   the normal state.
6. Blog article metadata, bodies, canonical URLs, dates, images, JSON-LD, and
   sitemap membership remain unchanged.
7. Type checking, production build, scoped copy checks, raw-HTML route audit,
   JavaScript-disabled homepage check, console/hydration check, and
   `git diff --check` pass.
8. Desktop and 375 px screenshots cover all six index pages; Home also has a
   tablet and reduced-motion capture. No new horizontal overflow or clipped
   card content is present.

## Boundaries

- This work can improve clarity, crawl paths, and eligibility. It cannot
  promise when Google will crawl, index, rank, or change a search result.
- Search Console is not mutated as part of this implementation.
- Existing unrelated worktree changes stay outside the commit.

## Validation result

Completed on 2026-09-01. Production build, raw HTML, metadata, Blog data,
JavaScript-disabled, interaction, desktop, tablet, mobile, reduced-motion,
overflow, and visual gates passed. Evidence:
`validation/interactive-cv-lore-2026-09-01/validation.md`.
