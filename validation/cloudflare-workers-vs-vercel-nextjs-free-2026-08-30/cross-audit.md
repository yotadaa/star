# Independent cross-audit

Date: 30 August 2026

## Verdict

**PASS for publication preparation.** The corrected draft is internally consistent, source-adjacent, third-person, and publication-payload ready. The embedded Cloudflare documentation screenshot was replaced by a project-owned deterministic reconstruction before publication.

## Claim checks

| Area | Verification | Result |
|---|---|---|
| Cloudflare recommendation change | The exact first-party commit, [`86bc28d`](https://github.com/cloudflare/cloudflare-docs/commit/86bc28dddc8c6c64cece0a553e6846eb499dc764), is dated 25 August 2026 and replaces the OpenNext-centered guide with vinext as the recommended starting path. | Pass; the article now describes a documentation/recommendation change, not a measured quality result. |
| vinext versus OpenNext | Cloudflare's current guides call vinext the default for new projects and retain an OpenNext path for existing deployments. The vinext repository describes OpenNext as more mature and safer where broad compatibility matters. | Pass; benefits and compatibility risk are both present. |
| Workers Free CPU | Cloudflare documents 10 ms of active CPU per HTTP request. Network, database, KV, and other waiting time is not CPU time; this is not a 10 ms wall-clock timeout. Cloudflare also says authentication, SSR, and large-payload workloads typically use 10–20 ms. | Pass; the article no longer implies that ordinary SSR necessarily fits the free CPU allowance. |
| Static asset routing | Cloudflare Static Assets are free and unlimited only when the Worker does not run. A `run_worker_first` route can consume the Worker allowance and return 429 after the daily limit, including for an asset request. | Pass; the exception appears next to the benefit. |
| Bundle-size comparison | Cloudflare's 3 MB Worker limit is measured after gzip compression. Vercel's standard 250 MB Function limit is explicitly uncompressed. Neither number is repository size. | Pass; the table says `Server bundle` and preserves the different measurement bases. |
| Vercel CDN metering | Vercel states that static assets and functions both incur CDN Requests, surfaced as Edge Requests. | Pass; the static-delivery tradeoff is stated and linked beside the claim. |
| Vercel Hobby policy | Vercel restricts Hobby to non-commercial personal use. Its fair-use examples explicitly include advertising, payment requests, product or service promotion, paid site work, and affiliate linking as the site's primary purpose. | Pass; the article does not treat a technically fitting workload as policy-eligible by default. |
| Cloudflare plan-policy comparison | Cloudflare's Self-Serve Subscription Agreement and product pricing do not state the Vercel-style personal/non-commercial-only condition. Other service and product rules still apply. | Pass; the article uses the bounded wording “not labeled personal non-commercial,” not a blanket legal conclusion. |
| Allowance exhaustion | Vercel says that, in most cases, an exhausted Hobby feature becomes unavailable until 30 days have passed; some features use a different period. Cloudflare's Worker-request allowance resets at midnight UTC. Consistent CPU overrun can terminate an invocation. | Pass; reset and failure behavior are no longer flattened into a generic monthly-versus-daily claim. |
| Initial domains | Cloudflare documents `workers.dev`; Vercel documents generated `.vercel.app` deployment URLs. | Pass; a purchased custom domain is presented as optional for the first deployment. |

The detailed evidence trail remains in `claim-ledger.md`, `source-ledger.md`, and `terminology-ledger.md`. Every external URL used in the article was checked during this audit; all 26 unique article URLs returned HTTP 200.

## Package corrections made

1. Replaced the unsupported article-section value with the repository-approved `Research Note` taxonomy value in the assignment, builder, verifier, and regenerated payload. This metadata does not add a research-note section to the article prose.
2. Added the exact Cloudflare documentation commit and narrowed the opening claim to what its diff establishes.
3. Corrected the bundle-size terminology to `3 MB compressed Worker` versus `250 MB standard uncompressed function` and renamed the comparison row from application size to server bundle.
4. Added the 10–20 ms CPU context from Cloudflare's own limits page and removed the unsupported suggestion that a generic small CRUD application would fit the 10 ms boundary.
5. Made the static-asset `run_worker_first` exception explicit.
6. Added source-adjacent links to the main comparison table and to the plan-policy, generated-domain, and limit-exhaustion claims.
7. Added primary-source ledger entries for the exact Cloudflare commit, Vercel fair-use rules, Vercel generated URLs, and Cloudflare self-serve terms.
8. Softened the verdict from “exact Next.js fidelity” to first-party integration and adapter-specific compatibility risk.
9. Updated and re-rendered the deterministic free-tier comparison graphic so its labels match the corrected prose and measurement bases.
10. Regenerated `payload.json` after the corrections.

## Editorial and payload gates

- The article is third-person subject-matter prose. It contains no first-person investigation narrative, methodology narration, evidence-collection diary, cutoff note, or research note at the end.
- Pros and cons are balanced for both providers, and the recommendation is conditional on workload and plan eligibility.
- The grounded-writing audit found no hard errors or warnings after a small opening-sentence cadence correction.
- The anti-slop audit reported no flagged slop patterns, no hype closer, and no formulaic contrast marker.
- No internal citation artifacts, tool references, `utm_source` parameters, or placeholder evidence markers remain in the draft or payload.
- The payload is `status: "draft"`, omits `publishedAt`, uses the approved `Research Note` taxonomy value, and contains 36 native blocks: 8 headings, 23 paragraphs, 1 list, 3 images, and 1 table.
- SEO metadata is within the package verifier's bounds: title length 45 and description length 159.
- All three image blocks have descriptive alt text and provider-neutral `assetKey` references; none contains a temporary local path, `src`, or storage identifier.
- The generated feature image, deterministic comparison graphic, and bounded source screenshot were visually inspected. The chart is readable and matches the corrected table; the feature image is clearly conceptual rather than evidence; the source image is captioned and adjacent to the claim it supports.

## Final verifier

`verify-package.mjs` completed with zero errors:

- slug: `cloudflare-workers-vs-vercel-nextjs-free`
- status: `draft`
- assets: 3
- saved source captures: 18
- verifier errors: 0

## Publication-stage checks

R2 upload resolution, asset-key reuse, idempotent mutation, IndexNow, and desktop/mobile rendered-page validation are recorded by the authorized publication run.

## Scope protection

No shared scripts, manifests, Convex data, publication state, commits, or remote branches were changed by this cross-audit. All corrections are confined to this validation package.
