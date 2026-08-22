# World Chat, Nala Management, and SEO Implementation Plan

Date: 2026-08-23

Status: in progress

## 1. Requested outcome

This work extends the current Convex migration without reopening the retired
Supabase path.

1. World Chat gains threaded replies. The reply control sits at the right side
   of an active message and the composer shows the selected parent before send.
2. World Chat gains soft deletion. Only the authenticated owner account,
   `mukhtadanasution@gmail.com`, can call the public deletion route.
3. Nala stops returning deterministic answer templates. Every successful answer
   comes from `https://openrouter.ai/api/v1/chat/completions` with the server-only
   `NALA_KEY` credential.
4. Nala keeps its six existing expressions. Pending, success, empty-result,
   navigation, greeting, and error states choose a matching sprite through a
   deterministic server contract.
5. `/manage` becomes the private data cockpit. It contains World Chat moderation
   and Nala configuration tabs and is not added to public navigation.
6. `/manage` is temporarily renderable without a page-level auth redirect while
   its visual states are inspected. Write endpoints remain owner-only throughout.
   The final phase applies `requireOwner()` before the task is complete.
7. Public routes gain crawl and sharing metadata, a generated sitemap, robots
   rules, grounded structured data, and canonical URLs. Private and utility
   routes are excluded.

## 2. Evidence and source hierarchy

### Project sources

- `PRODUCT.md`: warm, mechanical, exploratory personality; no generic AI SaaS
  visuals, fake metrics, emoji gamification, or inaccessible motion.
- `DESIGN.md`: current Verdant Dusk tokens, hard-card geometry, typography,
  overlay rules, current Convex schema, auth gaps, UI-data map, and validation
  contract.
- `design-system.md`: press/focus behavior, toast behavior, component structure,
  reduced-motion rules, and token-only color use.
- `AGENTS.md`: evidence-first workflow, no new dependency without approval,
  no new color, no fabricated data, multi-viewport screenshots, and decision log.
- `docs/convex-migration.md`: Convex is the current system of record; the old
  Supabase databases are inaccessible; Nala persistence was deliberately
  deferred; World Chat is a direct reactive Convex read plus protected server
  write.
- `plans/ai-npc-plan/implementation-plan.md`: six Nala expressions, tool-grounded
  responses, non-destructive actions, short answer style, and separation from
  World Chat.
- `plans/next-plan-1/implementation-plan.md`: single-owner auth model and
  owner-only World Chat moderation.
- Referenced Codex task `01a02976-2b67-7270-92c3-c7ff40fbf113`: confirms commit
  `713f686`, deterministic recovery, reactive chat cutover, and deliberate Nala
  persistence deferral.

### External primary sources

- OpenRouter Chat Completions API:
  `https://openrouter.ai/docs/api/api-reference/chat/create-a-chat-completion`
- OpenRouter tool calling:
  `https://openrouter.ai/docs/guides/features/tool-calling`
- OpenRouter Auto Router:
  `https://openrouter.ai/docs/guides/routing/routers/auto-router`
- Next.js metadata and OG images:
  `https://nextjs.org/docs/15/app/getting-started/metadata-and-og-images`
- Next.js sitemap convention:
  `https://nextjs.org/docs/app/api-reference/file-conventions/metadata/sitemap`
- Google Search metadata controls:
  `https://developers.google.com/search/docs/crawling-indexing/special-tags`
- Google sitemap guidance:
  `https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap`
- Google ProfilePage structured data:
  `https://developers.google.com/search/docs/appearance/structured-data/profile-page`

## 3. Decisions made from the evidence

### 3.1 No package additions

The installed stack already provides Next.js route handlers, Auth.js, Convex,
React, and the project component library. OpenRouter is called with native
`fetch`. The `package.json` dependency lists must remain unchanged.

The Convex agent component is not added. The migration plan deferred it, and
`AGENTS.md` requires explicit approval for a new dependency. This scope only
needs a bounded tool-calling loop, not a general agent runtime.

### 3.2 World Chat deletion remains a soft delete

The existing schema already models `active` and `deleted`. Deletion patches the
row, records the owner key and timestamp, and immediately removes it from public
reactive queries. No public hard-delete function is introduced.

### 3.3 Replies store a relation, not a copied body

`worldChatMessages.replyToId` is optional and references another message. The
public query resolves the parent into a compact reply object. It does not store a
second copy of the parent body. If the parent is deleted, its content disappears
from replies as well instead of surviving as an unmoderated quote.

### 3.4 Nala is live-only on successful responses

The current local factual templates caused the reported offline/template
behavior. They are removed from the success path. Missing keys, disabled config,
timeouts, provider errors, malformed completions, and exhausted tool loops return
an honest API error. The widget renders its existing confused pose and a retry
message. It never labels a template as a live model answer.

### 3.5 Nala stays grounded through forced first-tool selection

The server infers the first required read-only portfolio tool from the question
and forces that tool on the first OpenRouter turn. Tool results are executed by
the application and returned with the matching `tool_call_id`. Later turns may
use `tool_choice: auto`. The loop is capped at three model turns and parallel
tool calls are disabled for predictable state and cost.

This follows OpenRouter's documented tool sequence and prevents a portfolio fact
answer from bypassing the repository data tools.

### 3.6 Nala settings are persisted, but conversations are not

A singleton `nalaSettings` table stores operational configuration:

- `configKey`: fixed `primary`
- `enabled`: boolean kill switch
- `model`: OpenRouter model or router slug
- `systemPromptSupplement`: owner-authored extra instructions
- `temperature`: clamped to 0 through 2
- `maxTokens`: clamped to 64 through 1200
- `updatedAt`, `updatedByKey`, and `schemaVersion`

The API key is never stored in Convex or returned to the client. Conversation
persistence remains outside this request because the old history is unavailable
and the Convex migration explicitly deferred that architecture.

If no settings row exists, runtime defaults are returned without fabricating a
database record:

- enabled: `true`
- model: persisted `/manage` value, seeded from `NALA_MODEL` or
  `nvidia/nemotron-3-ultra-550b-a55b:free`
- temperature: `0.25`
- max tokens: `620`
- prompt supplement: empty

### 3.7 `/manage` visual direction

The route is a dense owner workstation, not a marketing dashboard:

- parchment work surface inside the existing dark shell
- hard two-pixel borders and offset shadows
- Silkscreen for telemetry, labels, and tabs
- Fraunces only for the page title
- Nunito for controls and content
- no gradients, glow, glass cards, emoji, fake charts, or decorative metrics
- asymmetrical desktop layout with a narrow status rail and broad work panel
- one-column mobile stack with no horizontal scrolling
- all controls have visible focus and pressed states

The route is absent from `navLinks`, TopNav, UtilityBar, command palette, footer,
and Nala navigation suggestions.

### 3.8 SEO boundary

The canonical production origin is read from `NEXT_PUBLIC_SITE_URL`, with the
verified live portfolio origin `https://me.mukhtada.my.id` as its fallback.

The sitemap contains:

- `/`
- `/about`
- `/projects`
- `/research`
- `/contact`
- `/blog`
- each published Convex blog slug, with the existing local factual fallback if
  Convex is unavailable during build

The sitemap excludes `/manage`, `/blog/admin`, `/forbidden`, `/redirect`, API
routes, auth callbacks, and unpublished blog entries.

Robots rules allow the public site, advertise `/sitemap.xml`, and disallow the
private/utility route families. `/manage` also exports `noindex, nofollow`
metadata and requires an owner session in the final phase.

Structured data is limited to facts in `lib/data.js`: `WebSite`, `ProfilePage`,
and `Person`, with public same-as links. No ratings, fake review counts, fake
dates, or invented employment claims are emitted.

## 4. Target request and trust flows

### World Chat send and reply

```text
browser selects active parent
  -> POST /api/chat/messages { body, replyToId? }
  -> Auth.js session required
  -> featureStore validates body and parent id shape
  -> protected Convex bridge action
  -> internal mutation verifies active parent and prevents self-reference
  -> insert active message
  -> public Convex subscription refreshes every open client
```

### World Chat owner deletion

```text
/manage delete control
  -> DELETE /api/chat/messages?id=<convex-id>
  -> Auth.js owner role required
  -> protected Convex bridge action
  -> internal softDelete mutation rechecks owner/backend role
  -> status=deleted + audit fields
  -> message and quoted content disappear from public subscriptions
```

### Nala live response

```text
Nala widget
  -> POST /api/nala/chat
  -> rate and input bounds
  -> protected bridge reads singleton Nala config
  -> NALA_KEY checked only on server
  -> OpenRouter call with forced first portfolio tool
  -> application executes read-only tool
  -> tool result returned to OpenRouter
  -> model returns final text
  -> server assigns expression/action/chips from verified tool outcome
  -> widget renders text as plain React content and switches sprite
```

### Nala owner configuration

```text
/manage Nala tab
  -> GET or PUT /api/manage/nala
  -> Auth.js owner role required
  -> protected Convex bridge
  -> internal read/upsert
  -> response includes keyConfigured boolean, never the key
```

## 5. Database changes

### 5.1 `worldChatMessages`

Add:

```text
replyToId?: Id<"worldChatMessages">
```

No migration is required for existing rows because the field is optional. New
reply inserts validate that the parent exists, is active, and is not the new row.
The query resolves at most 40 parents, matching the existing bounded result set.

### 5.2 `nalaSettings`

Add table and index:

```text
nalaSettings
  configKey: string
  enabled: boolean
  model: string
  systemPromptSupplement: string
  temperature: number
  maxTokens: number
  updatedAt: number
  updatedByKey: string
  schemaVersion: number

index by_configKey(configKey)
```

Only internal query/mutation functions touch the table. Public clients cannot
write it directly.

## 6. File-level implementation map

### Convex and backend

- `convex/schema.ts`: optional reply relation and `nalaSettings` table.
- `convex/validators.ts`: reply object/message validators and Nala settings
  input/public validators.
- `convex/worldChat.ts`: reply-aware public serializer, parent validation,
  reply insert, owner admin list if needed, and idempotent soft deletion.
- `convex/nalaSettings.ts`: internal read/upsert with defaults and value clamps.
- `convex/bridge.ts`: protected chat delete and Nala get/update actions.
- `lib/backend/featureStore.js`: reply-aware send, delete adapter, Nala config
  adapters.
- `lib/backend/routeAuth.js`: reuse the current owner role; no new auth scheme.
- `app/api/chat/messages/route.js`: accept `replyToId`; add owner-only `DELETE`.
- `app/api/manage/nala/route.js`: owner-only GET and PUT.

### Public World Chat

- `components/world-chat/WorldChatPanel.jsx`: reply button on the message header,
  quoted-parent display, cancellable reply composer state, payload update, and
  keyboard/focus behavior.
- `app/globals.css`: token-only reply UI, compact right-side action, mobile wrap,
  and no new animation loop.

### Nala runtime

- `lib/nala/tools.js`: remove duplicate schema key, validate tool names, and add
  deterministic first-tool arguments.
- `lib/nala/assistant.js`: `NALA_KEY`, persisted settings, timeout, bounded
  OpenRouter tool loop, live-only success, and deterministic expression output.
- `app/api/nala/chat/route.js`: correct status mapping and provider-safe errors.
- `components/nala/NalaWidget.jsx`: live provider labels, honest offline copy,
  stable expression rendering, and no template/source ambiguity.
- `.env.example`: document `NALA_KEY`, optional `NALA_MODEL`, public site origin,
  and optional Google verification token without exposing local values.

### Management route

- `app/manage/page.js`: server page, initially renderable, finally guarded by
  `requireOwner()`.
- `app/manage/ManageCockpit.jsx`: accessible tabs, World Chat moderation list,
  Nala settings form, status rail, confirmation step, live feedback, and no
  public navigation entry.
- `app/manage/layout.js`: private route title plus `noindex, nofollow`.
- `app/globals.css`: design-system-aligned desktop, tablet, mobile, focus,
  loading, empty, error, saved, disabled, and deletion states.

### SEO and crawlability

- `lib/siteUrl.js`: canonical origin normalization used by metadata routes.
- `app/layout.js`: metadata base, title template, authorship, Open Graph,
  Twitter, robots defaults, optional verification, and grounded JSON-LD.
- `app/sitemap.js`: static public routes plus published blog routes.
- `app/robots.js`: public allow, private disallow, sitemap location.
- `app/manifest.js`: name, short name, start URL, display, and existing brand
  theme colors.
- `app/opengraph-image.js`: generated branded share card using only current
  palette values and grounded identity text.
- public route pages: specific descriptions, canonical paths, Open Graph route
  URLs, and blog Article metadata where source dates are valid.

## 7. Ordered task templates

### Task A: World Chat reply relation and owner moderation

- Source: user request; `DESIGN.md` sections 9.1, 11.3, 11.4, 13, 14, 16;
  `docs/convex-migration.md` section 7; prior World Chat plan section 2.
- Exact location: global World Chat overlay and `/manage` World Chat tab.
- New dependency: no.
- New color token: no.
- Confirmation data: no. Owner email is explicit in the request and current auth.
- Acceptance criteria:
  1. A signed-in visitor can reply to an active chat message and the reply appears
     reactively with parent author/body context.
  2. Reply UI is reachable by keyboard, visible at the message header right edge,
     cancellable, and remains inside 375 px width.
  3. Deleted parent content no longer appears in the public feed or reply quotes.
  4. Anonymous and visitor DELETE calls receive 401/403; owner and protected
     backend paths succeed.
  5. No hard delete, fabricated message, new package, new color, or emoji.
- Evidence folder: `validation/manage-world-chat-nala-seo/world-chat/`.
- Validation result: Convex accepted a real reply relation, rejected a visitor
  soft delete with `CHAT_FORBIDDEN`, accepted the owner soft delete, removed
  deleted parent content from a child reply, and returned the database to its
  original single active row. Anonymous HTTP checks returned GET 200, POST 401,
  and DELETE 401. Desktop/mobile/focus evidence is stored in
  `validation/manage-world-chat-nala-seo/world-chat/`; mobile measured 375 px
  viewport width with no document overflow and focus computed to a 2 px aurora
  outline.
- Status: validated.

### Task B: Live OpenRouter Nala and expression contract

- Source: user request; current Nala plan sections 3 through 9; `DESIGN.md` 9.2,
  12, 13, and 16; OpenRouter first-party API/tool docs.
- Exact location: global Nala overlay and `/api/nala/chat`.
- New dependency: no.
- New color token: no.
- Confirmation data: no. `NALA_KEY` was explicitly supplied as the credential
  name. Model choice remains owner-configurable.
- Acceptance criteria:
  1. A successful API result reports `source: openrouter` and never
     `local-factual`.
  2. The credential comes only from `process.env.NALA_KEY` and is absent from
     browser bundles, logs, Convex, and JSON responses.
  3. Every factual answer completes at least one server-executed portfolio tool.
  4. Tool loops stop after three model turns and provider calls time out.
  5. greeting, thinking, happy, confused, pointing, and idle have explicit,
     testable state transitions; reduced motion stops sprite/dot loops.
  6. Provider/key/config failures show honest UI copy and a confused pose.
- Evidence folder: `validation/manage-world-chat-nala-seo/nala-live/`.
- Validation result: real project API calls returned `source: openrouter` through
  `nvidia/nemotron-3-ultra-550b-a55b:free`. The model remains owner-editable in
  `/manage`; its exact slug is persisted in Convex, while the server-only key never
  enters that table. Because the free endpoint occasionally returned an HTTP 200
  with no completion, the provider adapter retries that specific empty response at
  most twice before showing an honest failure. The forced Player Stats tool returned the grounded Level 4,
  71 PP, and 19 PP-to-next-level values with `happy`; Contact returned
  `pointing`; an unmatched project returned `confused`. A disabled config
  returned HTTP 503 and the widget rendered its confused sprite with explicit
  no-template failure copy. Desktop greeting/thinking/live and mobile
  live/empty/error screenshots are stored in
  `validation/manage-world-chat-nala-seo/nala-live/`.
- Status: validated.

### Task C: Nala settings persistence and owner API

- Source: user request for a Nala config tab; Convex migration trust boundary;
  Convex expert/reviewer requirements.
- Exact location: `nalaSettings`, protected bridge, `/api/manage/nala`, Nala tab.
- New dependency: no.
- New color token: no.
- Confirmation data: no. Defaults are operational configuration, visible and
  editable by the owner, not portfolio claims.
- Acceptance criteria:
  1. GET/PUT reject anonymous and non-owner sessions.
  2. Values are trimmed and clamped on the server and again in Convex.
  3. Settings survive reload and affect the next Nala request.
  4. UI reveals only whether the key is configured.
  5. Disabled Nala returns 503 and the widget does not show a fake answer.
- Evidence folder: `validation/manage-world-chat-nala-seo/nala-config/`.
- Validation result: server and Convex both reject non-owner writes; numeric
  values are clamped, the disabled state returns HTTP 503, the key is reduced to
  a configured/not-configured flag, and the persisted model is read on the next
  Nala request.
- Status: validated.

### Task D: `/manage` cockpit, unlocked review phase

- Source: user request; `DESIGN.md` visual grammar and page framework.
- Exact location: `/manage`, without a public nav link.
- New dependency: no.
- New color token: no.
- Acceptance criteria:
  1. Direct URL renders at 1440, 768, and 375 px without horizontal overflow.
  2. Tabs use buttons with `aria-selected`, keyboard focus, and visible states.
  3. World Chat rows use real reactive messages; empty/loading/error states are
     truthful.
  4. Nala form uses labels, constraints, save feedback, and expression legend.
  5. No public navigation surface links to `/manage`.
  6. Write APIs remain owner-only even before the page guard is installed.
- Evidence folder: `validation/manage-world-chat-nala-seo/manage-unlocked/`.
- Validation result: desktop, tablet, and 375 px screenshots show the real
  reactive chat count, editable Nemotron model slug, all six expression states,
  keyboard focus, and no horizontal overflow. The page had no public nav entry,
  while anonymous management API writes still returned 401.
- Status: validated.

### Task E: Final `/manage` auth lock

- Source: explicit user phase instruction; existing `requireOwner()` pattern.
- Exact location: `/manage` server page and metadata boundary.
- New dependency: no.
- New color token: no.
- Acceptance criteria:
  1. No session redirects to `/forbidden?reason=login`.
  2. Visitor role redirects to `/forbidden?reason=role`.
  3. Owner session renders the cockpit.
  4. Route metadata is `noindex, nofollow`; route remains absent from sitemap and
     navigation.
  5. Direct write API tests still enforce the same owner boundary.
- Evidence folder: `validation/manage-world-chat-nala-seo/manage-locked/`.
- Validation result: an anonymous document request returns HTTP 307 with
  `location: /forbidden?reason=login`; anonymous Nala configuration and chat
  deletion requests independently return HTTP 401. The server page calls the
  same `requireOwner()` guard as Blog Admin before reading its configuration,
  and Auth.js assigns `owner` only to `mukhtadanasution@gmail.com`.
- Status: validated.

### Task F: Public SEO and indexing contract

- Source: added user request; Next.js and Google primary docs; grounded content
  from `lib/data.js` and published Blog data.
- Exact location: root metadata files and each public route.
- New dependency: no.
- New color token: no. The generated OG card reuses current exact palette values.
- Confirmation data: no. Production fallback domain is already allowlisted in
  `next.config.js`; an environment override is supported.
- Acceptance criteria:
  1. `/sitemap.xml` is valid XML and lists every public static route plus only
     published blog slugs with absolute canonical URLs.
  2. `/robots.txt` advertises the sitemap and excludes private/API routes.
  3. Public pages have unique titles, descriptions, and canonical links.
  4. Open Graph and Twitter tags resolve to an accessible generated image.
  5. JSON-LD parses and contains only repository-backed Person/ProfilePage/WebSite
     fields.
  6. `/manage`, Blog admin, forbidden, redirect, and API paths are not in the
     sitemap.
  7. Production build succeeds without depending on a live Convex response,
     because published Blog sitemap data retains the factual local fallback.
- Evidence folder: `validation/manage-world-chat-nala-seo/seo/`.
- Validation result: the production server returned HTTP 200 for sitemap,
  robots, manifest, SVG icon, and the 1200×630 PNG share image. `xmllint`
  accepted the sitemap; it contains six public routes and three published Blog
  entries, with no private/API route. All six public page heads expose unique
  descriptions and canonical URLs plus Open Graph/Twitter images. JSON-LD
  parses with `WebSite`, `ProfilePage`, and `Person`. An initial audit exposed
  migrated `updatedAt: 0` values and missing child-route share images; the
  implementation now omits unknown dates and declares the image per route.
- Status: validated.

## 8. Validation matrix

### Code and data

- `git diff -- package.json package-lock.json` shows no dependency addition.
- `npm run convex:typecheck` passes.
- `npx convex dev --once` generates and deploys the updated functions in dev.
- `npm run build` passes.
- Existing migration audit counts remain unchanged except for owner-created Nala
  settings and deliberate chat test rows.
- Test chat rows are removed through the implemented soft-delete path.
- No secret value appears in tracked files or command output.

### API and authorization

- GET chat: 200 anonymous.
- POST chat: 401 anonymous; 201 authenticated.
- POST reply: 400 invalid/deleted parent; 201 valid active parent.
- DELETE chat: 401 anonymous; 403 visitor; 200 owner or protected backend test.
- GET/PUT Nala config: 401 anonymous; 403 visitor; 200 owner.
- POST Nala: 400 empty, 429 rate limit, 503 missing key/disabled, 502 provider
  failure, 200 live completion.
- Invalid Nala tool name is not executed.

### Visual states

Capture and inspect:

- World Chat desktop default, reply selected, reply sent, focus-visible, mobile,
  and reduced motion.
- Nala greeting, thinking, happy, confused, pointing, provider error, mobile, and
  reduced motion.
- `/manage` desktop World Chat tab, desktop Nala tab, delete confirmation, saved
  config, tablet, mobile, keyboard focus, and reduced motion.
- `/manage` final anonymous redirect and owner rendering.
- OG image at its generated metadata route.

### Accessibility

- Tab sequence reaches reply, cancel, composer, management tabs, delete, and Nala
  settings in a logical order.
- Focus-visible is equivalent to the existing pressed-state hierarchy.
- Status changes use `aria-live="polite"`; confirmation controls use explicit
  labels; decorative sprites remain `aria-hidden`.
- All loops stop under `prefers-reduced-motion: reduce`.
- No hover-only information is lost on touch.
- 375 px screenshots and `document.scrollWidth === window.innerWidth` checks show
  no new horizontal overflow.

### SEO output

- Fetch and inspect `/sitemap.xml`, `/robots.txt`, `/manifest.webmanifest`, the
  root page head, each public route head, one Blog detail head, and `/manage`.
- Parse sitemap XML and JSON-LD programmatically.
- Confirm every sitemap URL returns a public 200 in the local production server.
- Confirm canonical host is normalized and contains no localhost in production
  output.

## 9. Triage and rollback

- P0: secret exposure, public owner mutation, new dependency/color, fabricated
  data. Stop and fix before any other work.
- P1: reply relation, delete, live Nala, settings, route guard, or sitemap output
  fails. Fix in the same work unit.
- P2: keyboard, focus, reduced motion, contrast, or overflow failure. Fix before
  validation.
- P3: measurable performance regression. Fix if isolated; otherwise record in
  `TASKS.md` with evidence.
- P4: minor cosmetics. Fix if local and safe; otherwise record with evidence.

Each component gets at most three screenshot, analysis, and repair rounds before
an unresolved P0/P1 is escalated. Database schema changes are additive, so code
rollback does not invalidate existing rows. Nala can be disabled through its
persisted setting without deleting configuration.

## 10. Commit units

1. Plan and evidence record.
2. World Chat reply and moderation backend/UI, after its own validation.
3. Live Nala runtime and settings persistence/API, after API validation.
4. `/manage` visual cockpit, after unlocked multi-viewport validation.
5. Final `/manage` owner lock, after auth validation.
6. SEO/indexing metadata routes and structured data, after crawl validation.
7. Final documentation, task log, decision log, and consolidated regression
   evidence.

No unit is committed as complete before its acceptance criteria and evidence are
recorded.
