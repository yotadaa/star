# Validation: Anthropic Added Invisible AI Watermarks. Removers Arrived Before the Detector

## Result

- Slug: `anthropic-watermark-removers`
- Language / POV: English (`en-US`), third person.
- Status: `published` at `2026-08-24T22:24:11+07:00`.
- Article section / cover tone: `AI Investigation` / `research`.
- Thesis: current remover projects can demonstrably clean Unicode and file metadata and can attempt heavy rewriting, but no opened evidence proves that they defeat Claude's undisclosed text-watermark detector.
- Boundary: Anthropic has not published the detector or enough implementation detail for a public Claude-specific pass/fail test. Guillaume Meyer's two-million-impression figure is attributed as his claim and never treated as usage or efficacy.

## Research Gate

- Seven sources were opened directly, read, and captured in the in-app browser.
- Source classes: Anthropic first-party guidance; European Commission first-party policy; one direct open-source repository; one peer-reviewed ICML paper; Google DeepMind technical comparison; one named security report; one named as-told-to interview.
- Every used source has one full-page screenshot under `sources/`. W03 also has a bounded 1265×712 evidence capture used in the payload.
- All nine unique article URLs returned HTTP 200 after redirects on 2026-08-24. The count includes repeated CTA destinations only once.
- The claim and terminology ledgers preserve the main uncertainty: Google's SynthID is a comparison, not an identification of Anthropic's system.
- Research Gate: passed before drafting, recorded in `claim-ledger.md`.

## Editorial checks

- Markdown draft: 1,456 words, 7 headings, 9 URLs.
- Reading estimate: `8 min read`, calculated as ceiling of 1,456 / 200 words per minute.
- Grounded-blog audit command:

  `python /home/tada/.codex/skills/write-grounded-blogs/scripts/audit_blog.py validation/anthropic-watermark-removers-2026-08-24/draft.md --third-person`

- Audit result: 0 hard findings, 0 warnings.
- Banned-word and generic-ending scan: no matches in `draft.md` or `payload.json`.
- Claim audit: disputed chronology and reach remain attributed; no sentence says that the remover defeats Claude.
- Source audit: all direct article links reopened or rechecked after drafting; all returned 200.
- Editorial audit: the opening contains Anthropic's private-detector/public-remover contradiction; pros and cons receive separate evidence; the ending resolves the verification question and points to two source-chain destinations.

## Native payload checks

- `payload.json` parses with `jq`.
- Native blocks: 40 total; 2 images; supported types only (`paragraph`, `heading`, `image`, `table`, `list`).
- Required editorial fields are present. `seoTitle` is 53 characters; `seoDescription` is 153 characters.
- Featured image identity, alt text, and intrinsic size match the first image block.
- Image blocks contain durable asset keys and no local path, signed URL, delivery URL, or `src`.
- Published status includes the shared batch publication time.

## Visual checks

| Asset | Identity | Dimensions | SHA-256 | Review |
|---|---|---:|---|---|
| Feature | `blog:anthropic-watermark-removers:feature-ink-signal` | 1672×941 | `87450d67821f605abc8a88233cd84f7871f7d1494f4310dc2c4ef1768a257081` | Accepted at original size. Tactile paper, misregistered ink, and visible wear; no text, logos, fake UI, fake source document, glossy 3D, or unsupported factual scene. |
| Evidence | `blog:anthropic-watermark-removers:evidence-repository-limits` | 1265×712 | `f3031bd860954ee9856a29ac4de099ac2bc221b7916df18d2cc744dd12531cbf` | Accepted at original size. Repository identity, operation layers, and limitation text are legible and tightly bounded. |

The feature was generated from the recorded art direction without reference-image input. Collected source captures remain private research material except the single bounded, attributed repository excerpt.

## Publication result

The shared publisher stored both keyed images, published the article, and reused both assets on the duplicate run. The route passed canonical, `index, follow`, one-H1, two-JSON-LD, intrinsic-image, title-suffix, and desktop/mobile overflow checks. Batch evidence is in `validation/six-internet-culture-blogs-2026-08-24/`.
