# PageSpeed mobile and Ahrefs remediation evidence

- **Date:** 2026-09-01
- **Production server under test:** local `next start`, port 3123
- **Plan:** `plans/pagespeed-mobile-remediation-2026-09-01.md`
- **Result:** validated

## Mobile performance result

The supplied public PageSpeed run is the historical baseline. The final local
run used a 412 × 823 viewport at DPR 1.75, 150 ms RTT, 1.6 Mbps download, and
4× CPU throttling. It is an assertion-bearing browser trace, not a replacement
for a post-deployment Lighthouse score.

| Signal | Supplied public report | Final local trace |
| --- | ---: | ---: |
| FCP | 2.5 s | 2.3 s |
| LCP | 6.7 s | 2.3 s |
| TBT / observed blocking above 50 ms | 18.09 s | 1.62 s |
| CLS | 0 | 0 |
| Mobile Hero renderer | WebGL-capable path | static, zero canvas |
| Mobile R3F/Three requests | repeated heavy chunks | 0 |
| Mobile Hero image transfers | JS-discovered | 4 parser-discovered files, one request each |

`performance.json` records the complete final observation: the responsive
mountains image became the LCP element, the four Hero images transferred
182,513 bytes in total, the page had zero horizontal overflow, and no console
errors appeared.

## PageSpeed behavior and visual gates

`run-audit.mjs` produced `audit.json` and the screenshots in `screenshots/`.
The assertions cover:

- server-visible responsive Hero markup and high fetch priority;
- mobile static rendering with no WebGL chunks or duplicate Hero transfers;
- desktop WebGL retention and desktop-to-mobile fallback;
- morning, noon, sunset, night, and reduced-motion states;
- Nala WebP expressions, optimized Featured Blog covers, unique link names,
  corrected Quest/HUD semantics, contrast, footer affordance, and composited
  Glimpse transitions;
- zero overflow and zero console errors.

All ten screenshots were visually inspected as a contact sheet. No P0-P4
triage item remained.

## Ahrefs rows repaired

`run-seo-audit.mjs` produced `seo-audit.json` and validates the rendered output,
not only the source strings.

| Supplied issue | Final assertion |
| --- | --- |
| 5 meta descriptions too long | 143-155 characters |
| 1 title too long | Ox Alpha document title is 58 characters including suffix |
| 4 links to redirects | all four rendered destinations return direct HTTP 200 with no `Location` header |
| 6 images too large | six Caelestia previews use `/_next/image`; zero direct client requests to `raw.githubusercontent.com` |
| 3 indexable pages absent from sitemap | `/blog?page=2`, `?page=3`, and `?page=4` added to the Blog sitemap |

The fullscreen Caelestia image is absent before its native dialog opens, then
loads through the optimizer while retaining its alt text and focus-return
behavior. Visible Blog headlines remain unchanged; the shorter SEO values feed
metadata, social cards, and `BlogPosting` descriptions consistently.

## Validation commands

```text
npm run convex:typecheck
npm run build
node validation/pagespeed-mobile-remediation-2026-09-01/run-audit.mjs
node validation/pagespeed-mobile-remediation-2026-09-01/run-performance.mjs
node validation/pagespeed-mobile-remediation-2026-09-01/run-seo-audit.mjs
npm run seo:audit -- --output=validation/pagespeed-mobile-remediation-2026-09-01/public-seo-live.json
git diff --check
```

The pre-deployment live crawl kept 44/44 sitemap URLs valid with zero failures.
Its added diagnostic produced three warnings for the pagination URLs behind the
supplied sitemap finding; the local final sitemap contains all three. The
PDF-only external 4XX, thin-internal-link, and rich-result categories still lack
affected URL rows, so this work unit does not invent replacements for them.
