# Blog View and Reading Analytics Plan — 2026-08-28

Status: `completed`

Target evidence: `validation/blog-view-reading-analytics-2026-08-28/`

## 0. Outcome and scope

Add honest, privacy-conscious Blog engagement metrics without replacing the
existing editorial reading estimate.

The current `readTime` field is content metadata such as `9 min read`; it is not
measured behavior. The implementation will keep it and label it as an estimate.
Three new metrics will be collected separately:

1. **Views** — one counted view per anonymous browser, article slug and UTC day,
   recorded only after the article is visibly open for at least three seconds.
2. **Engaged reads** — a counted view that reaches both 30 seconds of active,
   visible reading time and 25% article progress. It can transition only once.
3. **Average active read time** — total bounded active time from engaged reads
   divided by engaged-read count. Public UI withholds the average until at least
   five engaged reads exist, avoiding a misleading one-reader average.

Completion at 90% progress will be retained as an owner-facing diagnostic, not a
public badge. No historic traffic will be invented or backfilled; counters start
at zero when the feature goes live.

Out of scope for this unit: geographic analytics, referrers, user-agent storage,
IP storage, ad attribution, cross-site tracking, per-user profiles, third-party
analytics, ranking articles by traffic, and adding volatile counts to JSON-LD.

## 1. Evidence from the current code

- `convex/schema.ts` stores editorial `readTime` and `upvoteCount`, but has no
  view, session or measured reading fields.
- `/blog/[slug]` renders `post.readTime` under the accessible label “Estimated
  reading time.” No client currently observes reading progress.
- Blog detail already mounts a client engagement component and has a Convex
  provider, so a small client tracker can reuse the existing architecture.
- Anonymous upvotes already use a random HttpOnly, SameSite=Lax browser token;
  only its SHA-256 digest reaches Convex, and no IP address is stored.
- `scripts/import-convex-seed.mjs` imports `blogPosts` with `--replace`. Analytics
  counters stored directly on `blogPosts` could therefore be erased by a later
  seed import. Analytics must use separate tables that are not seed-managed.
- Published Blog list/detail queries are bounded at 100 rows. An indexed stats
  lookup per returned slug remains bounded at the current scale and avoids an
  unbounded scan.
- `PRODUCT.md` forbids fake dashboard metrics. Every displayed number must come
  from recorded events, and zero must remain zero.

## 2. Metric contract

### 2.1 Counted view

A page load does not immediately count. The client waits until all conditions
hold:

- JavaScript has mounted on `/blog/[slug]`;
- the document is visible and the window has focus;
- the article has remained open for three seconds;
- Global Privacy Control and Do Not Track are not enabled.

The server then records at most one view for the tuple
`(slug, per-post reader hash, UTC day)`. Reloads and additional tabs on the same
day do not inflate the public count. A new UTC day can count a new view.

The UI will call this number “views,” with the measurement boundary documented
in the validation file. It is not called “unique people”: clearing cookies,
changing devices, and privacy settings make that claim impossible.

### 2.2 Active reading time

The browser accumulates time only while the document is visible and focused.
It sends a heartbeat every 15 seconds and a final bounded update with
`fetch(..., { keepalive: true })` during page exit where supported.

Server rules:

- accept only integer deltas between 1 and 20,000 ms;
- accept progress only as integer basis points from 0 through 10,000;
- use server time for all timestamps;
- cap one browser/article/day at 60 minutes of accumulated active time;
- keep `maxProgressBps` monotonic;
- increment `engagedReadCount` only on the first transition across 30 seconds
  and 25% progress;
- increment `completionCount` only on the first transition across 90% progress;
- once engaged, add later bounded deltas to `totalEngagedReadMs` transactionally.

Client values remain estimates and can be manipulated. Bounds, deduplication and
the wording “active read time” prevent the UI from promising laboratory accuracy.

### 2.3 Public formatting

- Article header: `Estimated: 9 min · 124 views · 38 engaged reads · 4m 12s avg`.
- Fewer than five engaged reads: omit the average; do not show `0s avg`.
- Blog cards and reading rails: show only the compact pair
  `9 min estimated · 124 views`, plus the existing vote label where space allows.
- Owner/admin table: show views, engaged reads, average active time, and
  completion rate with a `since <date>` boundary.
- Zero is rendered honestly. No popularity adjective, trend arrow or fabricated
  comparison is added.

## 3. Data model

### Task A — Add seed-safe analytics tables

Exact files: `convex/schema.ts`, `convex/validators.ts`,
`convex/migrationAudit.ts`.

Add `blogReadStats`:

```text
slug                 string
viewCount            number
engagedReadCount     number
totalEngagedReadMs   number
completionCount      number
startedAt            number
updatedAt            number
schemaVersion        number
```

Index: `by_slug` on `slug`.

Add `blogReadWindows`:

```text
slug                 string
readerHash           string
dayKey               string        // YYYY-MM-DD UTC
viewRecordedAt       number
activeReadMs         number
maxProgressBps       number
engagedAt            optional number
completedAt          optional number
lastActiveAt         number
schemaVersion        number
```

Indexes:

- `by_slug_and_readerHash_and_dayKey` for the transactional upsert;
- `by_lastActiveAt` for bounded retention cleanup.

Use slug rather than a `blogPosts` ID so records survive the repository's
current `blogPosts --replace` seed import. Slug changes need an explicit analytics
migration; the CMS must not silently split history.

Acceptance criteria:

1. Existing populated tables continue to validate; no required field is added
   to `blogPosts`.
2. Every read path uses an index. No analytics function uses `.filter()` or an
   unbounded `.collect()`.
3. Seed build/import still handles only its existing content tables and cannot
   erase either analytics table.
4. Migration audit reports analytics row counts without enforcing fabricated
   seed counts.

New dependency: **none**. New color token: **none**.

### Task B — Implement bounded Convex functions

Exact files: new `convex/blogAnalytics.ts`, `convex/bridge.ts`, generated Convex
types through normal codegen.

Functions:

- public or bridged `getPublicStats(slug)` returning normalized numeric values;
- bounded `listPublicStats(slugs)` for cards/rails, accepting at most 100 clean
  slugs and performing indexed lookups only;
- internal `recordReadingWindow` mutation that validates a published Blog slug,
  upserts the daily window, and updates aggregates in the same transaction;
- internal bounded retention mutation for expired windows.

The mutation must treat retries as idempotent at the state-transition level:
view, engaged-read and completion counts can each increment only once per daily
window. It must never decrement or accept a negative delta.

Concurrency boundary: a single aggregate row per article is acceptable for the
portfolio's current traffic. If live logs show repeated OCC conflicts, pause and
redesign with an approved sharded-counter strategy; do not add a dependency or
hand-roll shards pre-emptively.

Acceptance criteria:

1. First qualifying event creates one daily window and increments one view.
2. Duplicate starts, reloads and retry delivery do not increment view twice.
3. The engaged and completed transitions each happen once.
4. Missing, draft and archived slugs return `BLOG_POST_NOT_FOUND` without a
   stats write.
5. Public return validators expose aggregates only, never reader hashes/windows.

### Task C — Add retention

Exact files: new `convex/crons.ts` and the internal cleanup function in
`convex/blogAnalytics.ts`.

Run a daily cleanup of `blogReadWindows` older than 90 days. Each invocation uses
`by_lastActiveAt`, deletes at most 200 rows, and schedules/continues bounded work
when another page is required. Aggregate stats remain; per-browser hashes and
daily windows expire.

Acceptance criteria:

1. Cleanup never scans the full table.
2. Recent windows remain untouched.
3. Aggregate counters survive cleanup.
4. A development fixture proves more than one batch finishes without crossing
   Convex read/write limits.

## 4. Server and privacy boundary

### Task D — Reuse anonymous identity safely

Exact files: extract shared helpers from
`app/api/blog/posts/[id]/upvote/route.js` into a new server-only module such as
`lib/backend/blogReaderIdentity.js`.

Retain the existing `mb_blog_voter` cookie name so current upvote identity is not
reset. Derive a separate per-article analytics digest with
`HMAC-SHA256(AUTH_SECRET, token + slug + purpose)`. The same database hash must
not link one reader's activity across different articles.

Never persist or return:

- the raw UUID cookie;
- IP address;
- user agent or device fingerprint;
- referrer or query string;
- authenticated email/account ID.

Respect `navigator.globalPrivacyControl === true` and
`navigator.doNotTrack === "1"` by disabling writes while still allowing the
public aggregate query. Add a concise visible disclosure near the article
metrics: “Anonymous reading stats; no IP or account stored.” This is a product
privacy design, not a legal-compliance claim.

Acceptance criteria:

1. Cookie stays HttpOnly, Secure in production, SameSite=Lax and path `/`.
2. Analytics hashes differ between two slugs for the same raw browser token.
3. Neither API responses nor Convex public queries expose the digest.
4. DNT/GPC browser tests produce zero tracking requests.

### Task E — Add the reading endpoint

Exact file: new `app/api/blog/posts/[id]/reading/route.js`, plus
`lib/backend/featureStore.js` and bridge functions.

Contract:

```json
POST /api/blog/posts/{slug}/reading
{
  "activeMsDelta": 15000,
  "progressBps": 4200
}
```

The route must use the shared HttpOnly token, require a same-origin request,
limit payload bytes, apply the existing process-local request window, normalize
the slug, and return the aggregate public stats with `Cache-Control: private,
no-store`.

The API is deliberately not used from crawlers or server rendering. Prefetching
a Blog link cannot create a view.

Acceptance criteria:

1. Cross-origin POST returns 403.
2. Oversized/malformed payloads return bounded 4xx errors.
3. Large time deltas, negative values, floats and out-of-range progress cannot
   alter counters.
4. A normal 15-second heartbeat round-trip updates Convex and returns normalized
   stats.
5. Rate limiting prevents heartbeat floods without rejecting the expected
   15-second cadence.

## 5. Reader interface

### Task F — Add one lightweight client tracker

Exact files: new `components/blog/BlogReadMetrics.jsx` and
`app/blog/[slug]/page.js`.

The component owns both tracking and the reactive stats presentation. It uses
one timer, pauses on `visibilitychange`/blur, resumes on focus, derives progress
from a labelled article-content boundary, and cleans every listener/timer on
unmount. React Strict Mode must not create duplicate timers or starts.

No scroll handler may write on every frame. Progress is sampled at the heartbeat
boundary or through a passive listener that only updates an in-memory value.

Acceptance criteria:

1. A three-second focused view creates one counted view.
2. Hidden/background time does not increase active time.
3. Progress is monotonic and reaches 90% near the article's true end, excluding
   recommendations and comments.
4. Navigation/unmount stops timers and attempts only one bounded final update.
5. Reduced-motion mode has no new animation; the component is informational.
6. Tracking failure never blocks or breaks article reading.

### Task G — Present the metrics without dashboard theatre

Exact files: `app/blog/[slug]/page.js`, `components/blog/BlogPostCard.jsx`,
`components/blog/BlogPostList.jsx`, `components/blog/BlogReadingCompass.jsx`,
`components/blog/BlogAdminTable.jsx`, and scoped Blog CSS in `app/globals.css`.

Reuse the existing inline article metadata and hardcard vocabulary. Do not add a
chart, glowing counter, animated number, modal, toast, emoji, new literal color,
or a repeated analytics dashboard.

Acceptance criteria:

1. Estimated time and measured time are never conflated in copy or accessible
   labels.
2. Detail page exposes views and engaged reads; average appears only at the
   five-read sample gate.
3. Cards/rails remain compact and do not repeat every metric.
4. Admin shows all four aggregates and the measurement start date.
5. Screen readers receive one coherent “Article readership” description rather
   than punctuation-only fragments.
6. 1440 px, 768 px and 375 px layouts have no horizontal overflow; text remains
   readable at 200% zoom.
7. Existing votes, comments, canonical metadata and `BlogPosting` JSON-LD remain
   unchanged.

## 6. Seed and publishing safety

### Task H — Keep analytics out of authoring payloads

Do not add view/read fields to `blogInput`, grounded Blog payloads, batch
manifests, SEO backfill data or automation-writer contracts. Agents and authors
must never submit or seed engagement values.

Content create/update functions must not patch analytics. The analytics tables
are owned only by the reading mutation. A slug-edit guard must either migrate
both stats tables transactionally or reject changing a slug that has analytics;
the initial implementation should reject and require an explicit owner migration
to avoid silently losing history.

Acceptance criteria:

1. Publishing and republishing an article leaves its stats unchanged.
2. `npm run convex:seed:build` remains deterministic without analytics rows.
3. Development seed import proves stats survive `blogPosts --replace`.
4. Blog agents have no parameter through which they can fabricate view/read
   metrics.

## 7. Validation and delivery

### Programmatic matrix

- Convex schema/codegen/typecheck and a real development push.
- Focused analytics script covering view dedupe, bounded deltas, engaged and
  completion transitions, missing/draft rejection, slug isolation, retention
  batching and aggregate math.
- API probes for same-origin, malformed/oversized bodies, rate limits and cookie
  attributes.
- Seed-replace regression proving analytics tables survive.
- Existing upvote round-trip proving the shared identity helper did not change
  vote behavior.
- Production build and built-server Blog smoke.

### Browser matrix

- Desktop 1440+, tablet 768 and mobile 375.
- First view, duplicate tab/reload, 30-second engaged transition, 90% progress,
  hidden-tab pause, DNT/GPC no-write state, and five-read average gate.
- Keyboard focus, 200% zoom, reduced motion and document overflow checks.
- Screenshots plus DOM/computed-state assertions under
  `validation/blog-view-reading-analytics-2026-08-28/`.

### Live rollout

1. Deploy optional-safe schema and functions to development.
2. Run all mutation and seed-survival fixtures, then remove test windows/stats.
3. Build and validate the UI locally.
4. Deploy code before enabling production validation.
5. Open one real published article; the validation visit is a genuine view and
   remains counted rather than being silently deleted.
6. Confirm a second same-day visit does not increase view count.
7. Inspect Convex logs for validator, rate-limit or OCC errors.
8. Capture final route evidence, update `TASKS.md`, commit the coherent work
   unit, and push only when explicitly authorized.

## 8. Risks and decisions

| Risk | Decision |
|---|---|
| Seed replacement erases counters | Separate slug-keyed analytics tables, excluded from seed import |
| Reloads/bots inflate views | Three-second visible gate plus browser/article/day dedupe; acknowledge that JS bots can still count |
| Background tabs inflate time | Accumulate only while visible and focused; cap deltas and daily total server-side |
| Client fabricates time/progress | Treat metrics as approximate, enforce strict bounds and monotonic transitions |
| Tiny samples produce absurd averages | Public average hidden until five engaged reads |
| One reader linked across articles | Per-slug HMAC digest; no global analytics identity stored |
| Analytics rows grow forever | Delete per-browser windows after 90 days; retain aggregate totals |
| Hot-article counter contention | Start with one stats row at portfolio scale; redesign only if logs show OCC conflicts |
| Slug edit splits history | Reject analytics-bearing slug changes until an explicit migration path is run |

## 9. Definition of done

The feature is done only when a real published Blog route shows an honest
estimated reading time, view count, engaged-read count and gated average active
time; duplicate same-day views do not inflate the count; hidden tabs do not add
time; privacy signals disable writes; seed imports preserve stats; no P0–P2
accessibility/security issue remains; and all automated plus multi-viewport gates
have evidence. A counter that merely increments on server render is not accepted
as a completed reading-analytics feature.

## 10. Execution record

Completed on 2026-08-28. The implementation follows the metric, privacy,
retention, seed-safety and presentation contracts above. The configured Convex
deployment received the optional-safe tables and functions, all synthetic
analytics fixtures were removed, and its final audit returned zero analytics
rows before real traffic.

Programmatic gates passed for transaction transitions, duplicate views,
per-slug identity isolation, public average gating, daily time caps, retention
continuation, seed replacement, request validation and rate limiting, cookie
attributes, the existing upvote flow, image alt text, JSON-LD stability,
TypeScript and the production Next.js build.

Visual evidence covers desktop, tablet, mobile, the engaged transition, the
true article-end boundary and a 200%-equivalent narrow-width reflow. The
authenticated admin route correctly redirected the unauthenticated validation
session, so its visual state was not bypassed or claimed; its data join and
component were instead covered by typecheck/build and direct admin-stat query
validation. The in-app browser could not emulate a genuinely hidden document,
DNT or GPC; those no-write/inactive decisions are covered by the extracted pure
policy regression rather than a false browser claim. Full evidence and exact
commands are recorded in
`validation/blog-view-reading-analytics-2026-08-28/validation.md`.
