# Visual ledger

One publishable asset. No chart. The fifteen source screenshots in the first
package remain research references and appear in no block here either.

## Publishable assets

### V01 — Editorial illustration (featured image)

| Field | Value |
|---|---|
| Narrative job | Carry the article's subject in one object: a sealed parcel that moved a real payload while the tag that would say who sent it was left blank. That is the anonymous preview — ten trillion tokens of genuine work under a name that could not be checked against any accountable party. |
| File | `assets/feature-sealed-parcel.jpg` |
| Asset key | `blog:ox-alpha-anonymous-preview:feature-sealed-parcel` |
| Owner / source | Original generated illustration, made in this environment with the `local-imagegen` MCP `generate_image` tool from written art direction. No API key passed; `model` argument omitted as the tool instructions require. |
| Rights status | Original generated illustration. Publishable under `docs/blog-writing-automation-contract.md:145`. Impersonates no screenshot, person, document, result, benchmark or event. |
| Publish | Yes — the only image block, and therefore the featured image. |
| Measured dimensions | **1402 × 1122**, measured from the encoded bytes by walking JPEG SOF markers (`scripts/png-stats.mjs` rejects non-PNG magic and cannot read JPEG). |
| Bytes | 310,024 |
| Magic bytes | `ffd8ffe0` — valid JFIF JPEG |
| SHA-256 | `e3ff0d1f7160dc62b19cb526fef0dd83c5c02f8b8ac7f01325abad9858638b2d` |
| Alt text | A plain kraft-paper parcel bound with coarse twine on a weathered oak counter, a small cream paper label tied to the twine with nothing written on it, an old brass balance scale softly out of focus behind. |
| Caption | The blank label turns the missing supplier identity into the central object: the package arrived, but the accountable party did not. |
| Reject-list inspection | Read back at full resolution with the Read tool. No text, letters, numbers, logos or watermarks — the paper label is blank as directed. No screens, devices or interface elements. No glowing elements, neon, purple-blue gradients or glass panels. No robots, humanoid figures or hands. No fake terminal, dashboard or invented product mark. No advertisement framing. No malformed objects: the twine wraps consistently, the parcel's folds are coherent, and the balance scale's arm and pans are intact. **Clears the gate.** |

### Delivered size differs from the requested size

The art direction asked for `1536x1024`; the service returned **1402 × 1122**.
The delivered bytes are authoritative. Because `completeBlogSeoData()`
(`scripts/blog-seo-data.mjs:310-346`) overwrites every image block's `width` and
`height` from `BLOG_IMAGE_DIMENSIONS`, and `assertPublishable`
(`convex/blog.ts:153-191`) throws `BLOG_PUBLISH_FEATURED_IMAGE_INVALID` unless
the featured block matches `featuredImage` on identity, `width`, `height` and
alt text, both the manifest entry and the payload must carry 1402 × 1122. Any
registration written from the request rather than from the file would fail that
gate.

## No chart, and why

The first package's chart carried Artificial Analysis's two-panel intelligence
and speed measurement. This article is not a performance article, and the
figures its argument rests on do not support an honest chart:

- **C16** supplies one share figure (30.9% of OpenRouter coding-model usage
  through 2026-08-24) with no verified per-competitor breakdown. A bar chart of
  one bar is a decoration, and inventing the other bars would manufacture data.
- **C11** is a genuine two-value disagreement about one quantity ($0.09 per
  Intelligence Index task from Artificial Analysis against $0.045 from Z.ai for
  the same score of 57), but `scripts/bar-chart.mjs` renders a fixed two-panel
  layout and a single two-bar comparison does not fill it. Extending the script
  for one figure pair fails the YAGNI test.
- **C15**'s 3× end-to-end claim has no independent counterpart to plot against;
  its baseline is Z.ai's own first attempt.

The verified figures therefore go into a `table` block, which the renderer emits
with a `<caption>` from the block's `text` and which is readable without images.
A single image block also removes any risk of `groupConsecutiveImages`
(`components/blog/BlogPostRenderer.jsx:8-33`) silently merging two adjacent
images into a carousel.

## Research references — not published

The twelve source captures used by this article live in this package's
`sources/` directory. S01, S02, S05, S06, S08, S09, S11–S15 were copied from
the first package without modification; S16 was captured from the live Pi issue
on 2026-08-28. They are private research evidence, not Blog blocks. Under
`docs/blog-writing-automation-contract.md:145`, no publication rights were
established for those third-party pages, so the article links to them instead of
reproducing them.
