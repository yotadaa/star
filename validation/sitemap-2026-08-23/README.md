# Sitemap validation, 2026-08-23

The production build generated these static App Router routes:

- `/sitemap.xml`: sitemap index with 2 child sitemap URLs.
- `/sitemap-pages.xml`: 6 public page URLs.
- `/sitemap-blog.xml`: 2 published Blog URLs from Convex.
- `/robots.txt`: points to `https://me.mukhtada.my.id/sitemap.xml`.

Validation completed against the files emitted under `.next/server/app/`:

- `npm run build` passed.
- All three XML documents passed `xmllint --noout`.
- All generated metadata reports HTTP status `200`.
- All generated metadata uses `Content-Type: application/xml; charset=utf-8`.
- Every `<loc>` is non-empty, absolute, and uses `https://me.mukhtada.my.id`.
- No API, management, admin, forbidden, or redirect route appears in a sitemap.

The root sitemap no longer queries Convex. A transient database or deployment
failure therefore cannot make the URL submitted to Search Console return an
application error.
