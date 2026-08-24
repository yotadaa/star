# Six grounded Blogs: publication and route validation

Validated on 24 August 2026 in Asia/Jakarta.

## Publication decision

The user's request to put real evidence images into these Blogs authorizes this batch's bounded, attributed editorial excerpts. Only one evidence crop and one original feature illustration are public in each article. The remaining browser screenshots stay research/validation artifacts. Captions link to the originating source and distinguish first-party claims, independent measurements, community reports, and local experiment results.

All six payloads use the real publication timestamp `2026-08-24T20:36:48+07:00`. The first publisher run created six posts and uploaded 12 assets. The duplicate-run check updated the same six posts, uploaded zero files, and reused all 12 stored assets.

## Route checks

Every page was rendered against the local production build at an explicit 1440 × 1000 desktop viewport and 375 × 900 mobile layout viewport. Desktop evidence is 1440 × 1000. Mobile evidence is cropped to the rendered 375-pixel layout width and is 375 × 712.

| Slug | H1 | Document title | Canonical | Robots | JSON-LD scripts | Overflow |
|---|---|---|---|---|---:|---:|
| `harness-more-important-than-model` | The Harness Is Becoming More Important Than the Model | Why the Agent Harness Can Matter More Than the Model · Mukhtada | `/blog/harness-more-important-than-model` | `index, follow` | 2 | 0 px |
| `pay-to-rank-websites-attention-auction` | Pay-to-Rank Websites Sell a Spectacle, Not a Stable Ad Slot | Pay-to-Rank Websites: What Advertisers Are Really Buying · Mukhtada | `/blog/pay-to-rank-websites-attention-auction` | `index, follow` | 2 | 0 px |
| `xiaomi-xring-o3-official-claims-pros-cons` | Xiaomi XRING O3 Is Official. Its Benchmark Case Isn’t. | Xiaomi XRING O3: Official Claims, Benefits, and Limits · Mukhtada | `/blog/xiaomi-xring-o3-official-claims-pros-cons` | `index, follow` | 2 | 0 px |
| `why-100-agent-skills-can-be-worse-than-5` | Why 100 Agent Skills Can Be Worse Than 5 | Why 100 Agent Skills Can Be Worse Than 5 · Mukhtada | `/blog/why-100-agent-skills-can-be-worse-than-5` | `index, follow` | 2 | 0 px |
| `changing-ai-model-mid-session-cost` | Changing AI Models Mid-Session Can Cost More Than Staying on the Expensive Model | When Switching Claude Models Mid-Session Costs More · Mukhtada | `/blog/changing-ai-model-mid-session-cost` | `index, follow` | 2 | 0 px |
| `does-compact-make-claude-code-worse` | Does /compact Secretly Make Claude Code Worse? | Does /compact Make Claude Code Worse? A Controlled Test · Mukhtada | `/blog/does-compact-make-claude-code-worse` | `index, follow` | 2 | 0 px |

Each canonical resolves from `https://me.mukhtada.my.id`. Every route rendered exactly two non-decorative article images with the recorded intrinsic dimensions and non-empty alt text. Mobile checks found zero image overflow on all six pages.

## Accessibility and interaction

- Keyboard focus was exercised on a real article link. The focused anchor retained its destination and rendered a `2px` solid `rgb(69, 184, 164)` outline. Evidence: `routes/does-compact-make-claude-code-worse/desktop-focus.jpg`.
- The batch adds content data and stored images, not a new animated component. Existing global reduced-motion rules remain unchanged; no new loop, transition, hover-only disclosure, audio, or modal was introduced by these payloads.
- Both desktop and mobile captures show the H1, excerpt, publication metadata, author, read time, backend source, and beginning of the native article flow without horizontal overflow.

## Command gates

- `npm run convex:typecheck`: pass.
- `npm run convex:seed:build`: pass; 17 Blog posts, content SHA-256 `c7851b613361248694cf9f8ef1a0fbddfe3b02f06aec39554589fc4f2e055086`.
- `npm run blog:seo-data:verify-images`: pass after publication; 61 encoded files match the checked-in dimensions.
- `npm run blog:seo-data`: pass; 17 records, 61 image blocks, zero missing SEO fields and zero pending updates.
- `npm run build`: pass; `/blog/[slug]` remains a dynamic server route.

The first pre-publication image-manifest run reported the 12 batch assets as unused because they had not yet been uploaded. That expected ordering condition disappeared after the idempotent publisher assigned their Convex storage identities.
