# Validation

Validated on 24 August 2026, Asia/Jakarta. Package status: published.

## Editorial result

- Visible title: `Why Are Some Claude Code Users Suddenly Burning Through Their Limits Faster?`
- Slug: `why-claude-code-users-hit-limits-faster`
- Thesis: a faster-looking limit can come from four separate meters—plan allowance, context occupancy, tool attribution, or prompt-cache state—and a useful regression report must identify which one moved.
- Evidence boundary: current reports justify investigation but do not prove a universal or secret reduction in subscription limits. Issue #82863 documents a plausible client-side context-accounting failure, while the official 2.1.222 changelog confirms a narrower `/usage` MCP-attribution defect.
- Pros and cons: the draft weighs continuity against accumulated context, MCP retrieval against persistent tool output, large context windows against heavier late turns, and cache savings against prefix fragility.
- Read-time rule: 2,001 audited prose words at 225 words per minute, rounded up to `9 min read`.

## Research and source captures

- Source-ledger rows: 11.
- Claim-ledger rows: 14.
- Used sources: five GitHub user reports, two Anthropic Support articles, three first-party Claude Code documentation/repository pages, and the official changelog.
- Source-capture files: 12 JPEG captures—one for every used source plus one bounded changelog crop used in the article.
- Every used destination returned HTTP 200 in the final link check.
- Community claims remain attributed as reports; issue dates, versions, missing controls, and causal limits are explicit near the relevant claims.

## Media checks

| Asset | Role | Dimensions | SHA-256 | Payload key | Inspection |
|---|---|---:|---|---|---|
| `assets/claude-code-four-meters-feature.png` | Original feature illustration | 1672 × 941 | `728d25cdc860ddb5e4c98ed2211479ba5ba907f1d2b23333c59935088ba1d760` | `blog:why-claude-code-users-hit-limits-faster:feature-four-meters` | Passed; no logo, fake interface, legible claim, number, or watermark |
| `sources/S10-crop-usage-mcp-attribution.png` | Bounded first-party changelog evidence | 1280 × 720 | `16c42b89f6c16508417274a9581b0c82ff223d90a0869dac7df547b734e39e21` | `blog:why-claude-code-users-hit-limits-faster:evidence-usage-attribution-fix` | Passed; repository identity, version, and full attribution-fix line are visible |

The evidence caption states the exact boundary: the changelog describes how `/usage` assigned MCP server share and does not say total plan quota was overcharged.

## Draft and payload checks

The grounded-blog audit command:

```sh
python /home/tada/.codex/skills/write-grounded-blogs/scripts/audit_blog.py \
  validation/claude-code-limit-burn-2026-08-24/draft.md --third-person
```

Final result:

- 2,001 words
- 10 Markdown headings
- 11 external URLs
- 0 hard findings
- 0 warnings

Native-payload validation:

- Valid JSON with 46 supported native blocks: 32 paragraphs, 9 headings, 2 lists, 2 images, and 1 comparison table.
- `status: "published"`; truthful `publishedAt: "2026-08-24T21:31:50+07:00"`.
- Featured-image identity matches the first image block.
- Both images have stable asset keys, descriptive alt text, and positive intrinsic dimensions.
- SEO title: 45 characters, within the 70-character repository limit.
- SEO description: 135 characters, within the 180-character repository limit.
- `language`, full author identity, article section, source URL, cover tone, tags, and read time are explicit.
- Title metadata contains no author suffix; the route appends `· Mukhtada`.
- The rejected generic research-note language is absent from this article.

## Convex, SEO, and build checks

- `npm run convex:typecheck`: passed (`tsc --noEmit`).
- `npm run convex:seed:build`: passed with 18 blog posts and deterministic content SHA-256 `14781e884dbd444e407318cc9bb0f95436647bd5fdcab55ce19fcdd28f9410d5`.
- First publisher run: the corrected `/compact` post was updated with two reused assets; this article was created with two uploaded assets.
- Duplicate publisher run: both posts were updated, all four assets were reused, and zero uploads occurred.
- `npm run blog:seo-data:verify-images`: 63 encoded files matched checked-in dimensions.
- `npm run blog:seo-data`: 18 records and 63 image blocks passed with zero missing SEO fields.
- `npm run build`: passed; `/blog/[slug]`, sitemap, robots, and social routes built successfully.

## Render checks

The in-app browser validated the local route against the live Convex data.

| Gate | Desktop | Mobile 375 px |
|---|---|---|
| H1 matches visible title | Passed | Passed |
| Document title suffix | `· Mukhtada` | `· Mukhtada` |
| Canonical | Production slug URL | Production slug URL |
| Robots | `index, follow` | `index, follow` |
| JSON-LD scripts | 2 | 2 |
| Measured content images | 2, natural dimensions match | 2, natural dimensions match |
| Horizontal overflow | None | None (`360 < 375`) |
| Rejected phrases | Absent | Absent |

Keyboard validation focused the article's issue #82863 link. It matched `:focus-visible` and rendered a 2 px dashed teal outline.

Visual evidence:

- `routes/desktop-default.jpg`
- `routes/mobile-default.jpg`
- `routes/desktop-focus-visible.jpg`
- `routes/compact-corrected-desktop.jpg`
