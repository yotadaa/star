# GA4 all-route tagging and SEO roadmap evidence

- **Date:** 2026-09-01
- **Plan:** `plans/google-analytics-all-routes-2026-09-01.md`
- **Result:** validated locally; production tag detection needs the pushed
  deployment to finish.

## Root cause and repair

Before this change, the production Home document contained zero GA loader
scripts and zero config commands. The root layout already covered every App
Router document, but the env validator still read
`NEXT_PUBLIC_GOOGLE_ANALYTICS_ID`; the configured deployment name had changed
to `GOOGLE_ANALYTICS_ID`, so the component returned `null`.

The final implementation reads only the new name and emits one native async
loader followed by one config script inside the root document `head`. No
measurement ID is stored in Git. Redirect responses and non-HTML handlers don't
contain a document head, so they aren't counted as untagged pages.

## Route and browser assertions

`run-audit.mjs` builds its route matrix from both local sitemaps and checks the
root error documents separately. Google requests are intercepted.

| Gate | Result |
| --- | --- |
| Sitemap HTML routes | 47/47 have one loader and one config in `head` |
| Extra HTML documents | `/forbidden` and a real 404 both tagged once |
| Measurement ID | one validated value across every document, redacted in evidence |
| Home → About client navigation | loader, inline script, `js`, and `config` remained singletons |
| Desktop/mobile overflow | 0 px |
| Console errors | 0 |
| Validation traffic sent to GA4 | 0 |

The screenshots in `screenshots/` cover Home at 1440 × 900 and About at
375 × 812. Visual inspection found no layout change, clipping, or new UI.

## Environment boundary

| Variable | Runtime | Use |
| --- | --- | --- |
| `GOOGLE_ANALYTICS_ID` | root Server Component; ID becomes public in HTML | one GA4 tag on every HTML document |
| `PAGESPEED_INSIGHT_API` | server-only CLI | `npm run pagespeed:audit` |
| `AHREFS_INDEXNOW_KEY` | server-only Next.js and CLI | key route and IndexNow submissions |

The old `INDEXNOW_API_KEY` remains a migration fallback, but the new name wins
when both exist. The old public GA env name is deliberately ignored so a stale
deployment setting can't hide another naming mismatch.

## Current public checks

- Public SEO crawl: 47 sitemap URLs, 47 indexable, 47 internally discovered,
  zero failures, zero warnings.
- PageSpeed Insights mobile: Performance 75, Accessibility 100, Best Practices
  100, SEO 100; FCP 1.1 s, LCP 3.5 s, TBT 550 ms, CLS 0.
- Status controls: an unknown Blog slug returns 404 with `noindex`; `/redirect`
  returns its intentional 307 to `/`; `/forbidden`, `/manage`, and Blog Admin
  stay `noindex, nofollow, nocache`.

The PageSpeed result describes the deployment before the new head tag ships.
Run it again after deployment because the async Google loader starts earlier
than the former missing tag.

## SEO roadmap status

| # | Roadmap item | Status on 2026-09-01 | Evidence or next move |
| ---: | --- | --- | --- |
| 1 | Fix sitemap / Googlebot access | Done | Sitemap index and two children return 200; all 47 URLs pass the Googlebot crawl. |
| 2 | Screaming Frog full crawl | Done once, repeat later | User supplied the completed crawl exports. A fresh crawl belongs after each large release and during the monthly cycle. |
| 3 | Fix 404 / redirect / noindex / canonical | Mostly done | Public sitemap pages pass; intentional private redirects/noindex rules are correct. The aggregate external-4XX export still lacks affected URLs. |
| 4 | Improve titles + H1 + descriptions | Done for the current crawl | Every sitemap page has one H1, a non-empty unique title, and a description. Supplied overlength rows were fixed. |
| 5 | Strengthen internal linking | Partial | Every sitemap URL is discoverable from Home, and Blog has Featured/Recent/Read Next links. Six low-inlink rows need their URL export before targeted edits. |
| 6 | Identify Search Console queries | Not verified | Needs Search Console Performance data grouped by query and page; repository code can't prove it. |
| 7 | Create content based on those queries | Partial | The site has 37 published articles, but no evidence ties their backlog to current Search Console queries yet. |
| 8 | Add appropriate structured data | Partial | Root has `WebSite`, `ProfilePage`, and `Person`; articles have `BlogPosting`. The reported rich-result error needs its exact URL/property. |
| 9 | Improve PageSpeed / Core Web Vitals | Good lab result, recurring | Mobile PSI reached 75 with perfect accessibility/best-practices/SEO. Field Core Web Vitals and the post-GA deployment need another check. |
| 10 | Get links from authoritative related sites | External work, not verified | Requires real outreach, citations, partnerships, or earned references. No code change can mark this done. |
| 11 | Monitor clicks, impressions, CTR, ranking | Partial | GA4 code is repaired. Search Console and GA4 Realtime need post-deploy account checks; ranking monitoring remains recurring. |
| 12 | Repeat monthly | Recurring | Keep one monthly crawl/query/content/performance review with dated evidence rather than marking this permanently done. |

The order is sound, with one change: run PageSpeed and template-level structured
data checks during the technical-fix phase and again after content changes,
instead of waiting until step 9. Search Console query work should still precede
new content, while backlinks and monitoring remain continuous.

## Commands passed

```text
npm run seo:env:verify
npm run indexnow:verify
npm run credentials:audit
npm run pagespeed:audit -- --url=https://me.mukhtada.my.id --strategy=mobile
GOOGLE_ANALYTICS_ID=<synthetic-valid-id> npm run build
node validation/google-analytics-all-routes-2026-09-01/run-audit.mjs
npm run seo:audit
npm run convex:typecheck
git diff --check
```

`audit.json`, `seo-live.json`, and `pagespeed-live.json` contain the redacted
machine-readable results.
