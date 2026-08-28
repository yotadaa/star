# Validation

Research cutoff: **28 August 2026, 11:20 WIB (Asia/Jakarta, UTC+7)**.

## Handoff

- Title: `The OpenAI “Bel” Rumor: One Source, No Confirmation`
- Slug: `openai-bel-rumor-one-source-no-confirmation`
- Language / POV: English (`en-US`), third person
- Section: `AI Investigation`
- Status: `published`; `publishedAt` is `2026-08-28T11:28:27+07:00`
- Package: `validation/openai-bel-rumor-investigation-2026-08-28/`
- Thesis: the public Bel roadmap traces to one self-described X scoop. OpenAI
  confirms Astra and operational Stargate training capacity, but not Bel, Doug,
  a 10T-parameter run, or the alleged lineage.
- Boundary: the lack of public confirmation does not prove that an internal
  codename or run is impossible.

## Package counts

| Measure | Result |
|---|---:|
| Draft words | 1,574 |
| Read time | 7 min at 225 words/minute, rounded up |
| Used sources | 16 |
| Discovery / boundary records | 5 |
| Article source URLs | 16 |
| Source screenshot files | 47 |
| Source screenshots decoded | 47 / 47 |
| Generated feature images | 1 |
| Real evidence images in payload | 1 |
| Deterministic factual graphics | 1 |
| Native blocks | 36 |
| Native headings | 8 |
| Native paragraphs | 24 |
| Native images | 3 |
| Native tables | 1 |
| SEO title length | 45 characters |
| SEO description length | 147 characters |

## Research and source audit

- The source-origin workstream recovered the exact public chain:
  `@synthwavedd` at 02:00:01 WIB, a Reddit repost 9m17s later, Adit's rewrite at
  07:08:16 WIB, and Adit's explicit source credit five seconds later.
- The supplied S00 screenshot was measured at 480×791 and hashed. It remains
  private research material.
- The earliest source says `>10T total parameters`; the article never converts
  that into training tokens.
- OpenAI's Astra, GPT-4.5, RL-status, and Stargate pages were opened in the
  in-app Browser and captured. The lead agent also opened every central source.
- Reuters independently confirms the Stargate 4.5GW agreement and the Opus 5
  launch, but neither Reuters article confirms Bel.
- Anthropic's public Opus 5 release and Amazon compute agreement are used only
  as counterevidence to the implied inactivity. They are not presented as proof
  that Anthropic can match Astra.
- Reposts and downstream articles remain one source chain, not corroboration.
- `claim-ledger.md` contains 30 claim rows, including title promises, the CTA,
  rejected transformations, and the explicit unknowns.

Research Gate: **PASS**. The central answer is bounded and useful even though
Bel remains unverified.

## Chronology audit

- X timestamps were normalized from public status IDs to UTC and WIB; displayed
  local times match the Browser captures.
- Wccftech's 25 August EDT timestamp falls after Leo's 19:00 UTC post and does
  not predate the source.
- Stargate commitment, under-development capacity, planned capacity, and live
  workloads are kept in separate timeline states.
- OpenAI's 18 August RL-status publication precedes the 26 August Bel post and
  limits “near-term launch” language without disproving a separate pretrain.

Chronology audit: **PASS**.

## Editorial and anti-slop audit

Command:

```sh
python3 /home/tada/.codex/skills/write-grounded-blogs/scripts/audit_blog.py validation/openai-bel-rumor-investigation-2026-08-28/draft.md --third-person --json
```

Result: **0 hard findings**, **1 warning**. The sole warning is the heuristic
`uniform_sentence_rhythm`. It was manually reviewed after the anti-slop pass;
the reported clusters come from short factual boundary sentences, image
captions, abbreviations such as GPT-4.5, and the Markdown verdict table. The
article itself varies paragraph and sentence length and does not repeat a
single promotional cadence.

The anti-slop pass made four surgical changes:

1. replaced a demonstrative “whole story” kicker with the concrete five-hour
   mutation;
2. replaced a generic distribution/evidence antithesis with the specific source
   boundary at Leo;
3. removed importance-flagging around the Stargate fact and stated the missing
   link directly;
4. removed a formulaic “stronger conclusion” frame from the Anthropic verdict.

The pass did not alter a fact, date, number, link, attribution, claim status, or
section order. The earned closing line and the “effective rhetoric, unusable
measurement” sentence were retained as deliberate voice.

The banned-phrase scan found no generic research-note ending, source-count
boilerplate, AI-image disclaimer, generic intro phrase, or catalogued overused
AI lexicon.

Editorial audit: **PASS**.

## Payload and semantic audit

Commands:

```sh
node validation/openai-bel-rumor-investigation-2026-08-28/build-payload.mjs
node validation/openai-bel-rumor-investigation-2026-08-28/verify-package.mjs
jq empty validation/openai-bel-rumor-investigation-2026-08-28/payload.json
```

Result: **0 package errors**.

- Only supported native block types are present.
- The route supplies one visible H1 from `title`; all eight body headings render
  as H2, with no skipped level.
- The first image block is the intended featured image.
- All three image blocks have provider-neutral asset keys, descriptive alt text,
  captions, measured width, and measured height.
- The payload contains no raw HTML, `storageId`, `src`, fake date, or author
  suffix inside `seoTitle`.
- `status` is `published`; `publishedAt` records the owner's publication decision.
- The CTA points readers to the original source and asks whether later evidence
  leaves that chain.

The payload audit script reports 0 hard findings and two mechanical warnings:
the same sentence-rhythm heuristic and zero Markdown headings because JSON
native `heading` blocks are not parsed as Markdown headings. `verify-package`
independently counted eight valid native heading blocks.

Semantic audit: **PASS**.

## Link audit

All 16 external URLs used in article prose were opened in the in-app Browser
during this investigation and mapped to source-ledger entries. The internal
link `/blog/gpt-6-astra-rumor-origin` was verified against its existing
repository publisher record. No search snippet is cited as evidence.

Link audit: **PASS at the research cutoff**. Live pages can change and should be
rechecked immediately before publication.

## Visual and image audit

- `feature-bel-source-gap.png`: 1672×941 PNG,
  SHA-256 `e1d7065432681df2f52c1329b990926afeac9ed3f3b05c11ce838f009d9af1cf`.
  Full-resolution inspection found no readable accidental text, logo,
  watermark, fake source, malformed object, star/galaxy motif, or glossy AI UI.
- `evidence-original-bel-post.jpg`: 1265×500 JPEG,
  SHA-256 `38b78d175d67d6caf95639faa1f67a9632b6f9a77e3b28ea519ff2d466cc2308`.
  The unaltered crop keeps the account handle, complete post text, timestamp,
  and engagement context.
- `claim-status-matrix.png`: 1600×1080 PNG,
  SHA-256 `a82f133c20d6be297a44a43ba4b835a8a4a2be11aaa66d332d574bc4da247862`.
  It is reproducible from `claim-matrix-data.json` and
  `build-claim-matrix.mjs`; every row matches the accessible native table.
- All 47 research screenshots and all three payload assets decoded
  successfully.

Visual audit: **PASS for publication**.

## Unresolved claims

- Whether Bel exists, finished pretraining, or is an OpenAI codename.
- Whether Doug is an internal model and whether it relates to Astra or GPT-6.
- Any Bel parameter count, architecture, token count, training compute, or
  checkpoint.
- The alleged GPT-4.5 size equivalence.
- Any model-level connection between Stargate workloads and Bel.
- OpenAI's or Anthropic's alleged private competitive beliefs and a 2027 plan.

These are visible boundaries in the article, not hidden caveats.

## Publication outcome

- The owner explicitly authorized upload on 28 August 2026. That decision also
  approved the bounded, attributed X evidence crop for this article.
- Convex typecheck: passed.
- Deterministic seed: `27` Blog records,
  `convex-seed-v2-fdebc9a1c083`.
- Production build: passed.
- First grounded publish: `created`, `36` blocks, `3` images, `3` uploads,
  `0` reused.
- Idempotency rerun: `updated`, `36` blocks, `3` images, `0` uploads,
  `3` reused.
- IndexNow: accepted twice with HTTP `202`; `/blog` and the article URL were
  submitted on each run.
- Final image audit: `81` encoded files match the checked-in dimensions.
- Final SEO audit: `27` records, `81` image blocks, zero missing SEO fields and
  zero required updates.
- Public route: HTTP `200` at
  `https://me.mukhtada.my.id/blog/openai-bel-rumor-one-source-no-confirmation`.
- The route appears in `sitemap-blog.xml`; its canonical URL, Open Graph and
  Twitter titles, published/modified dates, and `BlogPosting` JSON-LD match the
  stored record.
- Server HTML and the live DOM contain descriptive alt text for every article
  image. All three R2 assets expose their measured intrinsic dimensions.
- Desktop render: `live-desktop-1440.png`.
- Mobile render: `live-mobile-375.png`; document width equals client width, so
  the article adds no horizontal page overflow.
- Keyboard focus reached an image-preview trigger, and the live focused control
  exposed a `3px` dashed outline. The dialog's open/close behavior was also
  checked in the live route; no keyboard-activation screenshot is claimed.
- The in-app Browser session did not expose reduced-motion emulation. The
  checked stylesheet removes preview-dialog animation, image-hint transforms,
  reading-card transitions,
  route transitions, and global animation duration under
  `prefers-reduced-motion: reduce`; no reduced-motion screenshot is claimed.

Publication preceded the Git handoff. A later user instruction explicitly
authorized committing and pushing this package with the Blog pagination change.
