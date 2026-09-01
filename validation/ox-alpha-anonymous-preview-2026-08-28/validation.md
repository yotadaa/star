# Validation

Package: `validation/ox-alpha-anonymous-preview-2026-08-28/`

Live URL: `https://me.mukhtada.my.id/blog/ox-alpha-anonymous-preview`

Status: **published** on 2026-08-28. R2 and Convex publication were authorized
by the user's request to make this exact package another publication. No commit
or push was requested or performed.

## Editorial correction before publication

The supplied package claimed a widened corpus of 34 attributable reports across
eight platforms, but it did not include resolvable permalinks and captures for
that expansion. Publication was narrowed to the corpus that can be audited from
the package:

- 11 attributable user reports from two captured r/opencode threads;
- 4 filed bug reports on 3 public trackers;
- 12 local source screenshots, including a fresh full-page capture of
  `earendil-works/pi` issue 8541 on 2026-08-28.

All unsupported expanded-corpus passages were removed from `draft.md` and
`payload.json`. The claim ledger, source ledger, sentiment method, hook scorecard
and visual ledger were synchronized. The article still carries evidence both for
and against anonymous previews: blind praise is preserved, while data-governance
questions remain scoped as unresolved rather than wrongdoing.

## Final payload

| Item | Result |
|---|---|
| Title | Ten Trillion Tokens Under a Name Nobody Could Check |
| Slug | `ox-alpha-anonymous-preview` |
| Status | `published` |
| `publishedAt` | `2026-08-28T10:47:57+07:00` |
| Native blocks | 36 |
| Headings | 5 payload headings, plus the page H1 |
| Images | 1 |
| Table / quote | 1 / 1 |
| Payload words including table cells | 1,971 |
| `readTime` | `9 min read` |
| Draft audit words | 1,869 |
| Draft links | 10 |
| SEO title length | 51 |
| SEO description length | 154 |

The article contains no generic research-note or cutoff ending.

## Image and accessibility

Featured asset:

- key: `blog:ox-alpha-anonymous-preview:feature-sealed-parcel`
- file: `assets/feature-sealed-parcel.jpg`
- measured dimensions: 1402 × 1122
- bytes: 310,024
- SHA-256: `e3ff0d1f7160dc62b19cb526fef0dd83c5c02f8b8ac7f01325abad9858638b2d`
- live R2 response: HTTP 200, `image/jpeg`

The caption was changed from generator disclosure and an unsupported audience
count to a scene-level narrative caption. Live DOM inspection confirms the Blog
image has descriptive alt text and natural dimensions 1402 × 1122. The
fullscreen image copy also has an `Enlarged view:` alt. Related-card images and
site portraits exposed by the route have non-empty alt attributes as well.

## Editorial audit

Command:

```text
python /home/tada/.codex/skills/write-grounded-blogs/scripts/audit_blog.py validation/ox-alpha-anonymous-preview-2026-08-28/draft.md --third-person
```

Result: **0 hard findings, 1 reviewed warning**. The warning is
`uniform_sentence_rhythm` at `[3, 3, 4]`; inspection shows the audit parser split
the Markdown table values `v4.1.1`, `50.2`, and `65.1` at decimal points. It is a
table-tokenization false positive, not three prose sentences.

## Build and data gates

- `jq empty` for payload and batch manifest: pass.
- JavaScript syntax checks for the touched publisher/seed/SEO modules: pass.
- Payload schema and native-block assertions: pass.
- `npm run convex:typecheck`: pass.
- `npm run convex:seed:build`: pass; 26 Blog records, seed content SHA-256
  `54d1b8f0572d069faa56c17141270f9245da0ca6d7b0555255a18d8891d2e591`.
- `npm run build`: pass; `/blog/[slug]` remains a dynamic route.
- Pre-publication image audit reported the new dimension key as unused because
  the live article did not exist yet. Re-running after publication passed: 78
  encoded files match the manifest.
- `npm run blog:seo-data`: pass; 26 records, 78 image blocks, zero missing SEO
  fields, zero updates required.

## Publisher results

First run:

```json
{
  "slug": "ox-alpha-anonymous-preview",
  "action": "created",
  "blocks": 36,
  "images": 1,
  "uploads": 1,
  "reused": 0,
  "indexNowStatus": 202,
  "indexNowSubmitted": 2
}
```

Second identical run:

```json
{
  "slug": "ox-alpha-anonymous-preview",
  "action": "updated",
  "blocks": 36,
  "images": 1,
  "uploads": 0,
  "reused": 1,
  "indexNowStatus": 202,
  "indexNowSubmitted": 2
}
```

The second run proves asset reuse and no duplicate upload.

## Live route and SEO

Live browser/HTTP checks on 2026-08-28:

- article route: HTTP 200;
- sitemap: HTTP 200 and contains `/blog/ox-alpha-anonymous-preview`;
- canonical: exact live article URL;
- `<title>` and `og:title`: `Ten Trillion Tokens Under a Name Nobody Could Check · Mukhtada`;
- meta robots: `index, follow`;
- OG image: the uploaded R2 asset;
- `BlogPosting` JSON-LD: headline, author, `en-US`, section, keywords,
  `datePublished`, canonical entity URL and measured `ImageObject` all present;
- one H1 and five article H2s in semantic order;
- mobile DOM at requested 375 px: no horizontal overflow
  (`scrollWidth` 360, `innerWidth` 375);
- screenshots: `rendered/live-mobile-375.png`, `rendered/live-desktop.png`, and
  `rendered/live-desktop-viewport-requested-1440-actual-886.png`.

The in-app browser accepted a requested 1440 px override but exposed an actual
886 px inner viewport because the app pane constrains the browser. The artifact
name records that mismatch instead of claiming an unobserved 1440 px render.

## Open IndexNow deployment issue

The publisher POST was acknowledged twice by `api.indexnow.org` with HTTP 202.
However, the public ownership route currently returns:

```text
GET /indexnow-key.txt -> HTTP 503
IndexNow key is unavailable.
```

The local environment is configured and the publisher can read the key, but the
deployed Next.js route cannot. This indicates that `INDEXNOW_API_KEY` is absent
from the Vercel runtime environment. A 202 acknowledgement is not proof of
ownership validation or indexing; the deployment variable must be added and the
route must return HTTP 200 with the exact key before IndexNow can be considered
fully operational.

## Source control

Branch `main`, HEAD `fbe507c`. The working tree already contained unrelated and
prior-task changes. This publication added its package, batch manifest, SEO
record/dimensions, seed registration and expected Blog count. No commit or push
was performed.
