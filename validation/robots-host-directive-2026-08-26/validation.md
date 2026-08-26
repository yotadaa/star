# robots.txt Host directive validation

Date: 2026-08-26

## Result

- Removed Next.js metadata field `host`, which generated Bing's unsupported `Host: https://me.mukhtada.my.id` line.
- Preserved the wildcard user agent, root allow rule, five private-route disallow rules, and absolute sitemap URL.
- Rendered production-mode `/robots.txt` returns HTTP 200 with no `Host:` directive.

Rendered response:

```text
User-Agent: *
Allow: /
Disallow: /api/
Disallow: /manage
Disallow: /blog/admin
Disallow: /forbidden
Disallow: /redirect

Sitemap: https://me.mukhtada.my.id/sitemap.xml
```

## Checks

- `npm run convex:typecheck`: passed.
- `npm run build`: passed.
- Exact HTTP response assertions: passed.
- `git diff --check`: passed.
- The in-app browser declined to open the raw `text/plain` localhost route with `ERR_BLOCKED_BY_CLIENT`; no visual claim depends on a screenshot.
