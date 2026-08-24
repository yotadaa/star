# Validation: When Instagram Calls a Real Human “AI”

## Result

- Slug: `instagram-real-content-labeled-ai`
- Language / POV: English (`en-US`), third person.
- Status: `published` at `2026-08-24T22:24:11+07:00`.
- Article section / cover tone: `Community Story` / `editorial`.
- Thesis: Instagram's AI badge can reflect a provenance signal, self-disclosure, or minor AI-assisted edit; it should not be read as proof that a model authored the whole work.
- Boundary: the 2026 handmade-work cases are named Business Insider reports supported by publication screenshots, not forensic reproductions. The article does not claim a measured revenue loss or that every flagged file was untouched by AI-affiliated software.

## Research Gate

- Eight sources were opened directly, read, and captured in the in-app browser.
- Source classes: Meta first-party policy; Content Authenticity Initiative first-party tooling docs; PetaPixel's reproducible 2024 edit test; Associated Press and TechCrunch reporting; Business Insider's named creator interviews; specialist reporting on the distinct profile-level `AI Creator` feature.
- Every used source has one full-page screenshot under `sources/`. I02 also has a bounded 1265×712 Meta policy capture used in the payload.
- All eight unique article URLs returned HTTP 200 after redirects on 2026-08-24.
- Terminology separates `Made with AI`, `AI info`, the optional `AI Creator` profile label, Content Credentials, and a reported false positive.
- Research Gate: passed before drafting, recorded in `claim-ledger.md`.

## Editorial checks

- Markdown draft: 1,592 words, 8 headings, 10 URL occurrences.
- Reading estimate: `8 min read`, calculated as ceiling of 1,592 / 200 words per minute.
- Grounded-blog audit command:

  `python /home/tada/.codex/skills/write-grounded-blogs/scripts/audit_blog.py validation/instagram-real-content-labeled-ai-2026-08-24/draft.md --third-person`

- Audit result: 0 hard findings, 0 warnings.
- Banned-word and generic-ending scan: no matches in `draft.md` or `payload.json`.
- Claim audit: Littley, Lugrin, and McGrady remain attributed to Business Insider; the PetaPixel speck-removal result is identified as a 2024 single-workflow test.
- Source audit: all direct article links reopened or rechecked after drafting; all returned 200.
- Editorial audit: the hook distinguishes a reported physical-photo case from Meta's verified policy admission; pros and cons are explicit; the CTA asks for the signal and preserves a creator work trail without promising a successful appeal.

## Native payload checks

- `payload.json` parses with `jq`.
- Native blocks: 45 total; 2 images; supported types only (`paragraph`, `heading`, `image`, `table`).
- Required editorial fields are present. `seoTitle` is 45 characters; `seoDescription` is 152 characters.
- Featured image identity, alt text, and intrinsic size match the first image block.
- Image blocks contain durable asset keys and no local path, signed URL, delivery URL, or `src`.
- Published status includes the shared batch publication time.

## Visual checks

| Asset | Identity | Dimensions | SHA-256 | Review |
|---|---|---:|---|---|
| Feature | `blog:instagram-real-content-labeled-ai:feature-contact-sheet-stamp` | 1672×941 | `d7e5f0d8046111849012d2d258e1072e8ac63bfa96787ad85aa94110f1b588c2` | Accepted at original size. Rough contact sheet, torn paint, tape, and dry stamp ink; no face, text, logo, fake Instagram UI, glossy 3D, or synthetic product-lighting cues. |
| Evidence | `blog:instagram-real-content-labeled-ai:evidence-meta-minor-edits` | 1265×712 | `53dc48c06102190d58f3b885cbae8197d6776e295056e0d24569c65f105f3f90` | Accepted at original size. Meta's July update and its minor-retouching admission are legible; the capture contains enough source context without reproducing the full page. |

The feature was generated from the recorded art direction without reference-image input. Collected reporting screenshots remain private research material except the single bounded, attributed Meta policy excerpt.

## Publication result

The shared publisher stored both keyed images, published the article, and reused both assets on the duplicate run. The route passed canonical, `index, follow`, one-H1, two-JSON-LD, intrinsic-image, title-suffix, and desktop/mobile overflow checks. Batch evidence is in `validation/six-internet-culture-blogs-2026-08-24/`.
