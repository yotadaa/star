# Source ledger

Access date for all web sources: 30 August 2026, Asia/Jakarta.

| ID | Source | Class | Used for | Capture | Limit |
|---|---|---|---|---|---|
| S01 | https://nextjs.org/docs | first-party | Framework definition and current documentation surface | `sources/S01-nextjs-docs.png` | Current docs show Next.js 16 while the inspected project remains on 15.5.19. |
| S02 | https://github.com/vercel/next.js | direct artifact | Public repository and MIT license | `sources/S02-nextjs-github.png` | Repository activity and star counts are not article claims. |
| S03 | https://vercel.com/pricing | first-party | Current Hobby allowances | `sources/S03-vercel-pricing.png` | Pricing can change and metrics are separate pools. |
| S04 | https://vercel.com/docs/plans/hobby | first-party | Hobby behavior, limits, and non-commercial rule | `sources/S04-vercel-hobby-plan.png`, focused variants | Terms application to a specific business is not legal advice. |
| S05 | https://www.convex.dev/pricing | first-party | Free and Starter pricing table | `sources/S05-convex-pricing.png` | Vendor page establishes its offer, not workload suitability. |
| S06 | https://docs.convex.dev/production/state/limits | first-party | Hard caps, resource amounts, counting rules, platform limits | `sources/S06-convex-platform-limits.png` | Many limits are per team and region pricing differs for paid overage. |
| S07 | https://developers.cloudflare.com/r2/pricing/ | first-party | Free allocation, paid rates, operations, storage classes | `sources/S07-cloudflare-r2-pricing.png`, `S07b-r2-free-tier-focused.png` | Free allocation is Standard-only. |
| S08 | https://developers.cloudflare.com/r2/get-started/ | first-party | Subscription and checkout requirement | `sources/S08-cloudflare-r2-get-started.png`, `S08b-r2-checkout-focused.png` | Page says checkout; payment-method detail is also user-supplied account evidence. |
| S09 | Brave Search query for Cloudflare R2 payment wording | discovery | Located first-party checkout and API-token pages | `sources/S09-brave-search-r2-payment-method.png` | Search snippets carry no article claim. |
| S10 | https://developers.cloudflare.com/r2/platform/limits/ | first-party | Bucket/object limits and `r2.dev` warning | `sources/S10-cloudflare-r2-limits.png` | Platform maxima are not free-tier allowances. |
| S11 | https://developers.cloudflare.com/r2/buckets/public-buckets/ | first-party | Custom-domain production delivery, same-account zone requirement, and the `r2.dev` development boundary | `sources/S11-cloudflare-r2-public-buckets.png` | A domain is not required to create the bucket; registration and renewal are external to R2 pricing. |
| S12 | Brave Search: `free portfolio stack Next.js Convex Cloudflare R2 Vercel` | discovery | Search-intent and competitor mapping | `sources/S12-brave-serp-1.png` | Snippets are not evidence for provider facts. |
| S13 | Brave Search: `how to build a free developer portfolio with Next.js` | discovery | Identified crowded generic tutorial intent | `sources/S13-brave-serp-2.png` | Results vary by time, locale, and engine. |
| S14 | Brave Search: `Next.js Convex R2 portfolio` | discovery | Identified the missing four-service comparison | `sources/S14-brave-serp-3.png` | A search snapshot cannot prove ranking difficulty. |
| S15 | https://docs.convex.dev/client/nextjs/app-router/ | first-party | Official Next.js App Router integration | `sources/S15-convex-nextjs-app-router.png` | Authentication setup varies by provider. |
| S16 | https://nextjs.org/docs/app/getting-started/deploying | first-party | Deployment portability and static-export boundary | `sources/S16-nextjs-deploying.png` | Support varies across adapters and export modes. |
| S17 | https://me.mukhtada.my.id/ | user-owned direct observation | Working project screenshot | `sources/S17-live-portfolio-home.png` | Visual success does not measure scale or uptime. |
| S18 | https://vercel.com/templates/next.js/next-js-convex-template | first-party | Official Next.js + Convex + Vercel starting point | `sources/S18-vercel-nextjs-convex-template.png` | Template does not add R2 or this project's SEO pipeline. |
| S19 | https://developers.google.com/search/docs/fundamentals/creating-helpful-content | first-party | People-first SEO and originality guidance | `sources/S19-google-helpful-content.png` | No ranking guarantee. |
| S20 | https://www.bing.com/webmasters/help/webmaster-guidelines-30fba23a | first-party | Bing crawl, content, structure, media, and IndexNow guidance | `sources/S20-bing-webmaster-guidelines.png` | Eligibility and notification do not guarantee ranking. |
| S21 | https://docs.convex.dev/self-hosting | first-party | Open-source/self-hosting portability and license boundary | `sources/S21-convex-self-hosting.png` | Self-hosting is operationally different from the managed free plan. |

## Local artifacts inspected

- `package.json`
- `app/blog/[slug]/page.js`
- `app/blog/page.js`
- `components/blog/BlogPostRenderer.jsx`
- `lib/backend/featureStore.js`
- `lib/blog/articleSeo.js`
- `convex/schema.ts`
- `convex/blog.ts`
- `convex/files.ts`
- `convex/r2Storage.ts`
- `convex/r2PublicUrl.ts`
- `scripts/publish-grounded-blog-batch.mjs`
- `scripts/blog-seo-data.mjs`
- `app/sitemap-blog.xml/route.js`
- `app/robots.js`
