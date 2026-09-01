# Validation

- Package: `validation/openai-plus-five-hour-limit-2026-08-30/`
- Slug: `openai-plus-five-hour-limit-explained`
- Status: `published`
- Published at: `2026-08-30T16:36:01+07:00`
- Live URL: `https://me.mukhtada.my.id/blog/openai-plus-five-hour-limit-explained`
- Research cutoff: 30 August 2026, 23:59 Asia/Jakarta (UTC+7)
- Language / POV: `en-US`, third person
- Article section: `AI Investigation`

## Research Gate

- Result: **passed for the bounded thesis**.
- Central answer: OpenAI restored a five-hour allowance window for Plus across
  Codex and ChatGPT Work on Aug. 25. Official pricing measures variable usage
  inside that window and retains a separate weekly layer; it does not grant
  five literal hours of active work.
- Boundary: no universal message quota, exact account-level reset algorithm,
  or fixed compute amount is public. Community interruption reports conflict
  with OpenAI's documented active-turn continuation language and were not
  independently reproduced.
- Used sources: 8 public sources across 7 distinct URLs.
- Source captures: 9 PNG files, including the user-supplied discovery lead and
  two views of the live OpenAI pricing source.
- Original source chain: direct Aug. 24 PT / Aug. 25 WIB X announcement, direct
  July policy-feedback post, first-party OpenAI role and pricing records,
  independent 9to5Mac chronology, and attributable user observations.
- No search-result snippet carries an article claim.

## Editorial validation

- Draft: `draft.md`
- Deterministic draft audit: **0 hard findings, 1 warning**.
- Reported draft words: 1,396; payload audit text: 1,493 words including
  JSON metadata and native-block content.
- Read-time rule: 225 words per minute, rounded up → `7 min read`.
- Headings: 7 native article headings after the H1.
- Source links: 9 Markdown links across 7 distinct URLs in the draft.
- Hook score: selected combination 10/10 under the project heuristic.
- CTA: links to the current official pricing page and directs readers to the
  account usage dashboard or Codex `/status`.
- Generic research-note ending: absent.

The remaining `uniform_sentence_rhythm` warning was reviewed after an
anti-slop pass. Most flagged groups are Markdown table rows, image captions,
or sentences split around inline links by the mechanical parser. The opening's
two short verdict sentences were combined. Further changes would flatten the
chronology or make the table less scannable, so the warning is retained as a
reviewed false positive rather than suppressed.

The payload audit also reported zero hard findings. Its “few headings” warning
is a JSON-auditor limitation: the payload contains seven supported `heading`
blocks, but the audit script counts only Markdown heading syntax.

## Native payload

- Payload: `payload.json`
- JSON parse: passed with `jq empty`.
- Native blocks: 31 total.
  - 20 paragraphs
  - 7 headings
  - 2 images
  - 1 table
  - 1 list
- Allowed block types only: passed.
- Provider-neutral media: passed; no `src` or `storageId` is persisted.
- `featuredImage`: present and verified against the matching feature image
  block for asset key, alt text, width, and height. Both public assets are
  registered in the shared SEO image manifest.
- `publishedAt`: `2026-08-30T16:36:01+07:00`, set only after the project owner
  explicitly authorized upload.
- SEO title: 54 characters, limit 70.
- SEO description: 152 characters, limit 180.
- Package verifier: `node verify-package.mjs` → **0 errors**.

## Visual validation

### V01 — feature

- Asset key: `blog:openai-plus-five-hour-limit-explained:feature-window-weekly-plan`
- Path: `assets/five-hour-window-weekly-plan-feature.png`
- Encoded dimensions: 1672×941 PNG.
- SHA-256: `8210e6ca2c44f2c2fc2ebad140dddd8d381657954ff1a36a18ae76c23b086a5d`.
- Rights: original generated editorial still life.
- Visual inspection: passed. The image is a restrained overhead still life
  with paper texture, an unlabeled timer, a blank weekly grid, and one amber
  strip. It contains no logo, readable text, fake UI, fake document, factual
  number, person, watermark, glossy gradient, or science-fiction styling.

### V02 — announcement evidence

- Asset key: `blog:openai-plus-five-hour-limit-explained:evidence-tibo-announcement`
- Path: `assets/tibo-five-hour-announcement-evidence.png`
- Encoded dimensions: 625×535 PNG.
- SHA-256: `a57b09626349c8b47840bce9cf16551336f2c4138c2e94b14c49a69ed946b27b`.
- Rights basis: minimal attributed public-source quotation for explanatory
  commentary, requested by the project owner as real in-article evidence.
- Visual inspection: passed after recapture. The final crop shows Tibo,
  `@thsottiaux`, the complete announcement, the Aug. 25 timestamp, and the
  engagement row. The earlier truncated crop was replaced. The logged-in
  account sidebar, reply composer, replies, and unrelated panels are absent.
- Alt and caption: present, descriptive, and non-duplicative.

## Source-capture review

- `S01` and `S02`: complete X author identity, post text, timestamp, and source
  context; no logged-in account or reply composer.
- `S03`: OpenAI Forum identity and Sottiaux's Head of Codex role are visible.
- `S04` and `S05`: official pricing source captures the variable message table
  and shared-window footnote.
- `S06`: 9to5Mac publisher, headline, byline, Pacific timestamp, and opening
  chronology are visible.
- `S07` and `S08`: OpenAI Developer Community identity, public usernames, and
  the relevant firsthand observations are visible; no private account state is
  present.
- Source screenshots remain research evidence except for the explicitly
  declared `V02` crop.

## Publication and repository gates

- Shared SEO manifest: registered the feature and evidence dimensions.
- Deterministic Convex seed: registered the payload and both public assets;
  regenerated seed version `convex-seed-v2-472fd6c091bc` with 29 Blog records.
- Explicit batch manifest:
  `scripts/blog-batches/openai-codex-five-hour-limits-2026-08-30.json`.
- First publisher run: `created`, 31 blocks, 2 images, 2 uploaded assets.
- Exact publisher rerun: `updated`, 31 blocks, 2 images, 0 uploads and 2 reused
  assets. This passed the duplicate/asset-idempotency gate.
- IndexNow: HTTP 202 on both runs; the batch submitted the two article URLs and
  the Blog index, with the key location on the public site.
- `npm run convex:typecheck`: passed.
- `npm run convex:seed:build`: passed with 29 Blog records.
- `npm run build`: passed.
- Post-publish SEO audit: 29 records and 85 image blocks, with zero missing SEO
  fields; all 85 encoded image files matched their declared dimensions.
- Commit/push: not performed because this publication request did not ask for a
  Git handoff.

## Live route validation

- HTTP response: 200.
- Metadata: canonical, description, Open Graph, Twitter title, and
  `BlogPosting` JSON-LD match the payload; the document title ends in
  `· Mukhtada`.
- Images: both article images load with descriptive alt text and exact intrinsic
  dimensions; modal copies also have descriptive `Enlarged view:` alt text.
- Layout: no document-level horizontal overflow at desktop or 375 px mobile;
  the comparison table remains inside its own horizontal scroll container.
- Keyboard: the first Tab stop exposes the visible `Skip to main content` link
  with a 2 px focus outline.
- Reduced motion: the production stylesheet globally reduces animations and
  transitions to one near-instant iteration and disables smooth scrolling. The
  selected in-app Browser exposes viewport control but not media emulation, so
  no reduced-motion screenshot is claimed.
- Desktop evidence: `live-desktop.png`.
- Mobile evidence: `live-mobile-375.png`.
