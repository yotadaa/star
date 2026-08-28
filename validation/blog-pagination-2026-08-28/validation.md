# Blog Pagination Validation

## Scope and acceptance criteria

- Route: `/blog`
- Request: paginate the public Blog index without hiding article routes from
  search engines.
- Page size: `10` published posts.
- Page URLs: `/blog`, `/blog?page=2`, and so on.
- SEO: each valid page has its own title, canonical URL, and crawlable numbered,
  previous, and next links. Individual posts remain listed in
  `sitemap-blog.xml`.
- Accessibility: pagination is a labelled navigation landmark; the active page
  uses `aria-current="page"`; focus is visible; disabled edge controls are
  labelled with `aria-disabled`.
- Guardrails: no dependency, new color token, fabricated data, modal, audio, or
  emoji was added.

## Automated checks

- `npm run convex:typecheck`: passed.
- `npm run build`: passed.
- Page 1: HTTP `200`, `10` rendered Blog rows, current page `1`.
- Page 2: HTTP `200`, `10` rendered Blog rows, title
  `Blog — Page 2 · Mukhtada Billah NST`, canonical
  `https://me.mukhtada.my.id/blog?page=2`, previous `/blog`, next
  `/blog?page=3`.
- Page 3: HTTP `200`, `4` rendered Blog rows, self-canonical metadata, previous
  `/blog?page=2`, and no next link.
- `/blog?page=99`: HTTP `307` to `/blog?page=3`, preventing an empty duplicate
  index page.
- Selecting the `Ox Alpha` topic from page 2 resets the client view to page 1,
  renders its `3` matching posts, and hides unnecessary pagination.

## Browser evidence

- `desktop-page-2.png`: desktop list layout at 1440×1000.
- `mobile-page-2-pagination.png`: 375×812 pagination controls with page 2
  focused.
- Desktop document width: `1425`; client width: `1425`.
- Mobile document width: `360`; client width: `360`.
- Mobile active-page focus outline: `3px dashed`.
- Mobile pagination occupies the full 320 px content width without causing page
  overflow; previous and next controls remain 44 px high.

## Result

Pagination passes the local production-build render gate. Deployment of these
repository changes is separate from the already completed Convex/R2 article
publication.
