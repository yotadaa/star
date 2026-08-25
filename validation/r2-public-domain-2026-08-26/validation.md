# R2 public-domain delivery validation

- Date: 2026-08-26
- Deployment: `dev:impartial-basilisk-364`
- Public domain: `https://pub-5447936c636f46cd8c8aaf2d17cde93c.r2.dev`
- Production changed: no

## Acceptance results

| Gate | Result |
|---|---:|
| Published posts | 21 |
| Blog image occurrences | 96 |
| Direct `R2_PUBLIC_DOMAIN` URLs | 89 |
| Same-origin `/api/media/` URLs in current output | 0 |
| Intentional external image URLs | 7 |
| Verified R2 files | 69 / 69 |
| Pending or failed migration jobs | 0 |
| Legacy Convex objects retained for rollback | 69 |

The development Convex environment contains the supplied `R2_PUBLIC_DOMAIN`. Public file results, featured images, image blocks, carousels, and the public compatibility-download action all resolve from that setting at read time; no full URL is persisted in Blog records. Verified public R2 reads fail explicitly if the deployment setting is missing or invalid instead of silently falling back to the portfolio origin. The legacy `/api/media/{fileId}` endpoint returns HTTP 307 to the same direct, unsigned content-addressed URL and includes no signed query string.

## Object verification

The canary object returned HTTP 200, `image/png`, 623,420 bytes, and `Cache-Control: public, max-age=31536000, immutable`. Its downloaded SHA-256 remained `261627fc63429eec9c761daa0108f7ee7abab8cbb589718ee76aae4191a81a3f`, matching the source and migration audit.

## Browser evidence

- Desktop, 1440 × 900, reduced motion: [blog-desktop.png](blog-desktop.png)
- Mobile, 375 × 812, reduced motion: [blog-mobile.png](blog-mobile.png)
- Captured request/image data: [browser-results.json](browser-results.json)

Both viewports rendered the article's visible R2 images at their expected natural dimensions, received HTTP 200 image responses directly from `r2.dev`, reported zero R2 request failures, and had no horizontal page overflow. Lazy images below the tested viewport remained intentionally unloaded.

## Security boundary

The supplied `r2.dev` hostname exposes the entire configured bucket. The live inventory contains only public Blog media and no private attachments. New private uploads therefore fail closed with `R2_PRIVATE_BUCKET_NOT_CONFIGURED`; private storage requires a separate bucket with public development access disabled.

## Local DNS finding

The workstation's system/ISP resolver currently maps the supplied hostname to `158.140.186.3` (`block.myrepublic.co.id`). Cloudflare DNS returns the correct edge addresses (`104.18.54.45` and `104.18.50.34`), and direct edge/browser validation succeeds. The screenshots used Chromium's host resolver override to test the actual Cloudflare endpoint rather than the ISP block page. A custom production hostname such as `media.mukhtada.my.id` is recommended before production cutover.

## Automated gates

- `npm run convex:typecheck`: pass
- Convex development deployment: pass
- `npm run convex:files:r2:audit`: 69 verified, zero pending, zero failed
- `npm run build`: pass
- Public URL helper: origin-only HTTPS validation, path-segment encoding, and missing-config failure pass
- Private upload guard: `R2_PRIVATE_BUCKET_NOT_CONFIGURED` before URL issuance
- Compatibility route: HTTP 307 to the direct public domain with no signed query string
- `git diff --check`: pass
