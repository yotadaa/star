# SEO tooling setup

The application already provides canonical metadata, crawl directives, a
sitemap index, page and Blog sitemaps, grounded JSON-LD, GA4, and IndexNow. The
recommended external tools do not all belong in the runtime application.

## Environment variables used by this repository

Put local values in ignored `.env.local`. Put the same production values in
Vercel Project Settings → Environment Variables and redeploy. Commit only the
placeholder names in `.env.example`.

| Variable | Visibility | When it is needed |
|---|---|---|
| `NEXT_PUBLIC_SITE_URL` | Public | Canonical production origin; keep it set to the exact HTTPS hostname |
| `GOOGLE_ANALYTICS_ID` | Server-read, public in `<head>` | GA4 measurement ID; the root Server Component renders nothing when absent or malformed |
| `GOOGLE_SITE_VERIFICATION` | Public in `<head>` | Only when Search Console supplies an HTML-tag verification token |
| `BING_SITE_VERIFICATION` | Public in `<head>` | Only when Bing supplies an `msvalidate.01` HTML-tag token |
| `AHREFS_SITE_VERIFICATION` | Public in `<head>` | Only when Ahrefs HTML-tag verification is used instead of GSC import |
| `PAGESPEED_INSIGHT_API` | Server-only CLI | Optional API key used only by `npm run pagespeed:audit`; never rendered by Next.js |
| `AHREFS_INDEXNOW_KEY` | Server-only | Preferred IndexNow key file and submission client variable; never prefix with `NEXT_PUBLIC_` |

Paste only the `content` value from a verification meta tag, not the complete
`<meta>` element. Empty or malformed verification values are deliberately not
rendered.

The GA measurement ID and ownership tokens are publicly visible by design once
their scripts/meta tags are served. Environment variables keep deployment
configuration out of tracked code; they do not turn browser-visible values into
secrets. `PAGESPEED_INSIGHT_API` and `AHREFS_INDEXNOW_KEY` are different and
must remain server-only. The IndexNow reader temporarily accepts the older
`INDEXNOW_API_KEY` name as a deployment migration fallback.

## Tools that need no application credential

- Google Search Console: prefer a Domain property verified with a DNS TXT
  record. DNS verification uses no application env. For a URL-prefix property,
  the optional HTML-tag method uses `GOOGLE_SITE_VERIFICATION`.
- Screaming Frog: install and configure the desktop crawler locally. Do not put
  a license or account credential in this repository.
- PageSpeed Insights and Chrome Lighthouse: run URL/browser audits directly, or
  use `npm run pagespeed:audit -- --url=https://example.com` for a repeatable
  API result. Google allows keyless requests, but this CLI requires the
  configured server-only key to avoid anonymous quota limits.
- Google Rich Results Test: submit representative public URLs directly. It uses
  no application credential.
- Google Trends: use the Explore dashboard for query research. It uses no
  application credential.
- Ahrefs Webmaster Tools: importing the matching verified Search Console
  property is the preferred path. Complete Google authorization in Ahrefs; do
  not copy a Google password, OAuth refresh token, or Ahrefs session into this
  application. Use `AHREFS_SITE_VERIFICATION` only for the alternative HTML-tag
  method.
- Bing Webmaster Tools: GSC import or DNS verification needs no application
  env. Use `BING_SITE_VERIFICATION` only for the alternative HTML-tag method.

## Repeatable crawl audit

Run the production audit:

```bash
npm run seo:audit
```

Check tracked files for high-confidence credential patterns without printing
matched values:

```bash
npm run credentials:audit
```

Audit another deployment without editing source:

```bash
npm run seo:audit -- --origin=https://preview.example.com
```

The audit uses a Googlebot user agent and checks:

- `robots.txt` and the canonical sitemap declaration;
- sitemap and child-sitemap status/content type;
- same-origin absolute, unique sitemap URLs;
- HTTP 200, self-canonical, index/follow eligibility;
- non-empty unique titles, descriptions, exactly one H1;
- parseable JSON-LD;
- homepage-led HTML discovery, including pagination links, for every sitemap page.

Warnings identify likely internal-link or description issues. Failures exit
non-zero so the command can be used as a deployment gate. This is a bounded
repository check, not a replacement for Search Console's URL Inspection,
Screaming Frog's full crawl, or field Core Web Vitals.

## Dashboard follow-up

1. Verify the exact `https://me.mukhtada.my.id` property (or the Domain
   property) in Search Console.
2. Submit only `https://me.mukhtada.my.id/sitemap.xml` as the sitemap index.
3. Use URL Inspection → Test Live URL for the sitemap and representative pages.
4. Import the verified GSC property into Ahrefs and Bing if desired.
5. Run Screaming Frog, PageSpeed/Lighthouse, and Rich Results Test against the
   representative templates; use Trends for content demand, not technical
   indexation.

Sitemap submission is a discovery hint. A successful fetch and technically
indexable page do not guarantee indexing or ranking; Google schedules those
decisions independently.
