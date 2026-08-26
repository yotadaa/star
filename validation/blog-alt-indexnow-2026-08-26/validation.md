# Blog ALT and IndexNow validation

Date: 2026-08-26

## Scope

- Replace crawler-visible absent/empty Blog image descriptions with accurate alt text while preserving `aria-hidden` on redundant decorative copies.
- Add a server-only IndexNow verification route and automatic Blog change notifications.

## Rendered Blog evidence

- Production-mode HTML audit: 22 public Blog routes, 256 `<img>` elements, zero missing `alt` attributes, and zero empty alt values.
- Hydrated desktop route at 1366 × 900: 9 images, zero missing/empty alt values, one `<main>`, one `<h1>`, no horizontal overflow.
- Hydrated mobile route at 375 × 812: 9 images, zero missing/empty alt values, one `<main>`, one `<h1>`, no horizontal overflow (`scrollWidth === clientWidth`).
- Fullscreen preview: its image alt begins with `Enlarged view:` and preserves the article image description.
- Article SEO structure: canonical URL present, `robots=index, follow`, `lang=en-US`, one visible H1 followed by H2 sections, and `BlogPosting` JSON-LD present.
- Source scan: no literal `alt=""` remains under `app/` or `components/`.

Screenshots:

- `desktop-blog.jpg`
- `mobile-blog.jpg`
- `desktop-image-preview.jpg`

## IndexNow evidence

- `INDEXNOW_API_KEY` exists in `.env.local` and passes the protocol format check; its value was never printed.
- `/indexnow-key.txt` returns HTTP 200, `text/plain; charset=utf-8`, and exactly matches the configured key.
- Mock protocol audit passes key validation, same-host enforcement, fragment deduplication, the 10,000-URL ceiling, JSON payload shape, 202 acceptance, and 403 rejection.
- Deployment CLI dry-run finds 22 current Blog/index URLs and reports only host, key location, and count.
- Secret audit confirms the key is absent from the rendered Blog HTML and all 90 generated client assets.
- The local validation intentionally did not send a live IndexNow request before `/indexnow-key.txt` is deployed. The production CLI verifies that the deployed key file matches before it transmits URLs.
- Post-push production check: Vercel serves the new route, but `/indexnow-key.txt` returns HTTP 503 because `INDEXNOW_API_KEY` is absent from the Vercel Production environment. Live submission is blocked until that existing server-only value is added and the deployment is refreshed.

## Commands

- `npm run convex:typecheck`
- `npm run build`
- `npm run blog:seo-alt -- --base=http://localhost:3123`
- `npm run indexnow:verify`
- `npm run indexnow:submit -- --dry-run`
- `git diff --check`

All checks passed.
