# Remove unsupported robots.txt Host directive

Status: complete

## Evidence

- Bing Webmaster Tools reports `Host: https://me.mukhtada.my.id` as unrecognized syntax.
- Bing's robots.txt documentation describes `User-agent`, `Allow`, `Disallow`, optional crawler-specific directives, and `Sitemap`; it does not define `Host`.
- RFC 9309 defines standard crawler groups and `allow`/`disallow` rules; `Host` is not a standard rule.

## Change

- Remove the `host` field from the Next.js robots metadata route.
- Keep the absolute `Sitemap` declaration as the canonical discovery hint.

## Acceptance criteria

- Rendered `/robots.txt` contains no `Host:` line.
- Existing allow/disallow paths are unchanged.
- The sitemap remains `https://me.mukhtada.my.id/sitemap.xml`.
- Typecheck, production build, local rendered response, and Bingbot crawl checks pass.
