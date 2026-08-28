# Blog View and Reading Analytics Validation — 2026-08-28

## Result

Status: **passed** for the configured application deployment and local built UI.

The Blog now preserves its editorial reading estimate while reporting measured
views, qualified engaged reads and a public average active time only after five
engaged reads. Completion is visible only in the owner table. No traffic was
backfilled and all validation fixtures were removed.

## Measurement boundary

- A view is recorded after three active, visible seconds and deduplicated by
  anonymous browser, article slug and UTC day.
- Engagement requires at least 30 seconds of active time plus 25% article
  progress.
- Completion requires 90% article progress and is owner-only.
- Active time is capped at 60 minutes per browser/article/day.
- DNT or Global Privacy Control disables writes.
- The raw cookie, IP address, user agent, referrer and account identity are not
  sent to Convex. Its stored HMAC changes by article slug.
- Anonymous daily windows expire after 90 days; aggregate counts remain.

These are approximate product metrics, not unique-person, billing or audited
analytics claims.

## Programmatic gates

| Gate | Result |
|---|---|
| `npm run blog:analytics:verify` | Passed transition, duplicate, cap, privacy-policy, copy, seed-boundary, image-alt and JSON-LD checks |
| `npm run convex:typecheck` | Passed after Convex code generation |
| `npm run build` | Passed; `/api/blog/posts/[id]/reading` and `/blog/[slug]` compiled |
| Configured Convex push | Passed against `dev:impartial-basilisk-364`, the deployment selected by this workspace's environment |
| Convex function smoke | `blogAnalytics:getPublicStats` returned normalized zero stats for a published slug |
| Request contract | Cross-origin 403; malformed/invalid 400; oversized 413; missing post 404; thirteenth request in one minute 429 |
| Cookie contract | Existing `mb_blog_voter`; HttpOnly; SameSite=Lax; path `/`; Secure in production mode |
| View deduplication | Two same-day deliveries for one slug/browser kept `viewCount` at 1 |
| Identity isolation | The same cookie produced independent daily windows for two slugs |
| Engagement gate | Five synthetic readers exposed a 35,200 ms public average; one reader kept the public average null while the owner value remained available |
| Retention | 205 expired windows were removed in a bounded 200-row pass plus scheduled continuation; aggregates remained |
| Seed replacement | `npm run convex:seed:import` preserved both analytics tables and the 27 Blog records |
| Upvote regression | Existing anonymous vote toggled 0 → 1 → 0 with the extracted identity helper |
| Final fixture audit | `blogReadStats: 0`, `blogReadWindows: 0`; no synthetic traffic left behind |
| Convex reviewer gate | Validators, internal write boundary, indexed reads, bounded batches, scheduled cleanup and slug guard passed review |

The Convex CLI was also invoked with `deploy`, but `.env.local` contains a
development deploy key and the CLI explicitly ignored `--prod`. This evidence
therefore does not claim a separate production Convex deployment. It does prove
the functions are installed on the deployment this local application is
configured to use.

## Browser and layout gates

| State | Evidence | Result |
|---|---|---|
| Desktop duplicate visit | `desktop-deduped.png` | One same-day view after reload; no overflow |
| Desktop engaged transition | `desktop-engaged.png` | One view and one engaged read after active time and progress thresholds |
| Article end | `desktop-article-end.png` | Progress reached 99.42%; recommendations remained outside the article boundary |
| Tablet 768 px | `tablet-metrics.png` | Metadata wraps without horizontal overflow |
| Mobile 375 px | `mobile-metrics.png` | Metadata width remains inside the viewport; no missing image alt attributes |
| 200%-equivalent reflow | `desktop-200-percent-equivalent-reflow.png` | 720 CSS-pixel viewport reflows without horizontal overflow |

The in-app browser ignored zoom keyboard commands, so the reflow capture is
accurately labelled 200%-equivalent rather than a native zoom assertion. The
component introduces no animation, so reduced-motion behavior is static by
construction.

## Honest limitations

- `/blog/admin` redirected the validation browser to
  `/forbidden?reason=login`. No authentication bypass was introduced. Admin
  analytics were validated through the protected bridge query, component
  contract, typecheck and production build, but not claimed as a logged-in
  browser screenshot.
- The in-app browser reported the article tab as visible even when another
  browser tab was selected. Hidden-tab behavior therefore was not counted as a
  browser pass. The pure tracker-policy regression directly verifies that a
  hidden or unfocused document is inactive.
- The same browser surface could not set DNT or GPC. Their no-write decision is
  covered by the pure policy regression and the fact that the component exits
  before installing timers or issuing fetches when either signal is present.

## Evidence files

- `desktop-deduped.png`
- `desktop-engaged.png`
- `desktop-article-end.png`
- `tablet-metrics.png`
- `mobile-metrics.png`
- `desktop-200-percent-equivalent-reflow.png`

`desktop-metrics.png` is retained as the initial desktop render but is not used
for the deduplication claim because its screenshot paint preceded the DOM count
update observed in the same run.
