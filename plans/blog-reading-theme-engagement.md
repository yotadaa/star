# Blog Reading, Theme, and Engagement Implementation Plan

Status: `done`
Requested: 2026-08-23
Primary evidence target: `validation/blog-reading-theme-engagement-2026-08-23/`

## 0. Outcome and evidence boundary

This batch repairs the published Blog reading surface, extends the existing cockpit phase control to the whole application, hardens editor image ingestion, and adds real Blog engagement. It does not redesign the established visual language, install a Markdown/Mermaid/image package, accept arbitrary HTML, fabricate engagement, or turn comments into a general social profile system.

Evidence sources, in priority order:

1. `PRODUCT.md`: warm, curious, mechanical, proof-first portfolio; no generic glass/glow/emoji treatment.
2. `DESIGN.md`: existing public shell, Blog grid/detail/editor, management workbench, phase names, and responsive behavior.
3. `design-system.md`: existing color/type/spacing primitives, hard borders/shadows, accessibility, reduced-motion, and fixed-shell constraints.
4. Current rendered screenshots supplied by the owner: invisible list markers and raw `flowchart LR` code.
5. Current code/data contracts: `components/blog/*`, `scripts/publish-portfolio-readme-blog.mjs`, `components/site/SiteProvider.jsx`, `convex/schema.ts`, and Blog/file bridge routes.
6. Primary platform references: Mermaid flowchart grammar for the bounded supported subset, Convex transactional/index rules, and MDN browser image/dialog APIs.

No new npm dependency or new literal color is required. Every visual value must use an existing custom property or `color-mix()` derived from those properties.

## 1. Discovery record

| Requested item | Verified cause | Planned repair |
|---|---|---|
| List discs are absent | Tailwind reset removes list markers; renderer emits only `<ul>` and stores some ordered markers as text | Infer ordered vs unordered content, use semantic `<ol>/<ul>`, strip stored numeric prefixes, restore marker styling |
| Flowchart does not render | Every code block is rendered as `<pre>` and the publication parser drops fence language | Detect `flowchart`/`graph` content, parse the project-used Mermaid subset, render a responsive SVG, keep a truthful unsupported fallback |
| Every `.md` word should be highlighted | Publisher removes inline backticks/links/emphasis; existing stored filename text survives | Add a safe inline tokenizer and automatic `.md` token highlighting; preserve inline Markdown on future publish runs |
| Image cannot be enlarged | Article and carousel images are non-interactive `<img>` elements | Reuse a client native-dialog preview for both image paths |
| Theme only changes Hero | Phase is local React state handed to Hero; no root theme attribute or semantic token remap exists | Synchronize a validated phase to `<html data-cockpit-phase>` and remap semantic application tokens per phase |
| Uploaded images are not compressed | Editor posts the original `File`; server accepts browser metadata without signature limits | Quality-first browser conversion plus server size/type/signature validation |
| No Blog upvote | No engagement table, mutation, API, or UI exists | Transactional vote toggle keyed by a hashed HttpOnly browser token; reactive aggregate count |
| No Blog comments | No comment schema, identity rules, API, or UI exists | Authenticated, session-derived, plain-text comments with indexed query, cooldown, and soft deletion |

## 2. Data and trust model

### 2.1 Existing-table evolution

- Add optional `upvoteCount` to populated `blogPosts`, so old rows remain valid during deployment.
- Add `blogVotes` with `postId`, `voterHash`, `createdAt`, and `schemaVersion`; enforce one row by looking up the composite `by_postId_and_voterHash` index inside the toggle mutation.
- Add `blogComments` with `postId`, opaque `actorKey`, session-derived `authorName`, plain `body`, `status`, creation/deletion audit fields, and `schemaVersion`.
- Index active comments by post/status/time and recent comments by actor/time. No unbounded scan or `.filter()` query is allowed.
- Keep API keys, raw session identifiers, cookie tokens, and IP addresses out of Convex.

### 2.2 Upvote identity

- A Next route owns an HttpOnly, `SameSite=Lax` random browser token.
- Only its SHA-256 digest crosses the server bridge and enters Convex.
- `POST` toggles the vote and patches `blogPosts.upvoteCount` in the same Convex mutation, so the row and count cannot diverge halfway through.
- A bounded process-local request window adds basic burst control; it is not presented as a globally distributed rate limiter.

### 2.3 Comment identity and moderation

- Creation requires an Auth.js session. Author email/name is derived server-side; request JSON cannot choose an author.
- Public data exposes the display name and text, never email or actor key.
- Body is normalized plain text, trimmed, and length-bounded. React text rendering remains escaped.
- An indexed recent-comment lookup enforces a short cooldown.
- The owner and the original authenticated actor may soft-delete. Deleted rows are omitted from public queries and retained for moderation history.

## 3. Task plans

### Task A — Blog semantic prose and inline Markdown

- Source: owner bug list; screenshots; `DESIGN.md` Blog detail/editor; `design-system.md` typography/accessibility.
- Exact location: `BlogPostRenderer`, publication parser, and Blog prose CSS.
- Structure: safe React-node inline tokenizer for links, emphasis, inline code, and `.md` filename tokens; semantic ordered/unordered lists; real table head/body; labelled code blocks.
- Dependency/color confirmation: no dependency; no new color.
- Acceptance criteria:
  1. Unordered items show disc markers and ordered items show decimal markers without duplicating stored numeric prefixes.
  2. `.md` filenames are consistently highlighted in existing and newly published prose, headings, lists, tables, and captions.
  3. Supported inline links reject unsafe schemes; no `dangerouslySetInnerHTML` is introduced.
  4. Table first rows use `<th scope="col">`; mobile wrapping/overflow remains controlled.
- Relevant guardrails: no fabricated content, no package, existing tokens only, focus-visible links, no horizontal page overflow.
- Screenshot evidence: desktop/mobile article list, inline Markdown, table, and code states.
- Status: `validated`.

### Task B — Bounded flowchart renderer

- Source: owner screenshot; real portfolio README flowchart; Mermaid primary documentation.
- Exact location: Blog code blocks whose trimmed first line begins `flowchart` or `graph`.
- Supported input: `LR`, `RL`, `TD`, `TB`, `BT`; square/rounded/decision labels; `-->`, `<-->`, `---`, `-.->`, and `==>` links used by the documented subset.
- Structure: pure parser + accessible SVG figure; marker definitions; visible title/direction; screen-reader edge summary. Unknown syntax returns an explicit unsupported-diagram code fallback rather than inventing a diagram.
- Dependency/color confirmation: no Mermaid runtime or dependency; existing tokens only.
- Acceptance criteria:
  1. The published architecture example becomes a legible diagram on desktop and mobile.
  2. Text and arrows remain within the figure viewport; horizontal scrolling is contained inside the figure only if unavoidable.
  3. Diagram has a descriptive accessible name and equivalent edge text.
  4. Malformed input cannot inject markup or crash the article.
- Relevant guardrails: no dependency, no unsafe SVG/HTML injection, reduced-motion static by design.
- Screenshot evidence: desktop/mobile diagram plus programmatic malformed-input fallback test.
- Status: `validated`.

### Task C — Blog image preview

- Source: owner bug list; `DESIGN.md` hardcard interaction language; MDN `<dialog>` behavior.
- Exact location: standalone image blocks and every active image in Blog carousels.
- Structure: image inside a labelled button, native modal dialog, full-size image constrained to viewport, caption/position label, explicit close control, backdrop click, native Escape/cancel, focus return.
- Dependency/color confirmation: no dependency; existing tokens only.
- Acceptance criteria:
  1. Mouse, keyboard, and touch can open the active image.
  2. Close button, Escape, and backdrop close it; focus returns to the opener.
  3. Portrait and landscape assets fit within 92vw/88dvh without distortion.
  4. Reduced-motion mode has no entrance/exit transform animation.
- Relevant guardrails: non-fabricated captions, visible focus, accessible dialog label, no overflow.
- Screenshot evidence: desktop open, mobile open, keyboard focus, reduced-motion.
- Status: `validated`.

### Task D — Whole-application cockpit phase scheme

- Source: owner bug list; `DESIGN.md` environmental phase section; existing `cockpit-phase` storage contract.
- Exact location: root `<html>`, `.site-main`, public content surfaces, management workbench, and stable cockpit navigation accents.
- Structure: validate stored phases, reflect the state as `data-cockpit-phase`, derive semantic page/ink/surface/accent aliases from existing palette tokens, and let all routes inherit them. Cockpit chrome remains a dark legibility anchor but its signal accent follows the phase.
- Dependency/color confirmation: no dependency; no new literal colors.
- Acceptance criteria:
  1. Every phase visibly changes Blog, About/Projects/Research/Contact, and `/manage`, not only Home scenery.
  2. Refresh restores the selected phase without hydration errors.
  3. Text, borders, buttons, code, tables, diagrams, and forms remain readable in all four phases.
  4. Theme switching creates no layout shift or motion in reduced-motion mode.
- Relevant guardrails: token-only color, WCAG AA target, no gradient/glow/glass addition, no overflow.
- Screenshot evidence: all four phases on a Blog detail, night management desktop, sunset tablet, mobile theme cycle.
- Status: `validated`.

### Task E — Quality-first editor image compression

- Source: owner backend request; current editor/file route; MDN `createImageBitmap()` and canvas `toBlob()`.
- Exact location: Blog editor upload handler and `/api/backend/files`.
- Structure: JPEG/PNG/WebP allowlist; EXIF-aware browser decode; at most 2560 px longest edge; high-quality WebP encode; keep original when already smaller or conversion is unsupported; server validates maximum byte size, declared type, and file signature before storage.
- Dependency/color confirmation: no dependency; no visual token addition.
- Acceptance criteria:
  1. Oversized test image is downscaled and uploaded as WebP with dimensions and byte reduction reported.
  2. A small already-efficient image is not enlarged or replaced by a larger payload.
  3. Unsupported/malformed/SVG/GIF payloads receive clear 4xx responses and never reach storage commit.
  4. Failed conversion falls back safely to a valid allowed original instead of losing the edit.
- Relevant guardrails: no package, no silent quality-destroying resize, no trust in client MIME alone.
- Screenshot/evidence: editor status output plus upload route probes and stored metadata response.
- Status: `validated`.

### Task F — Blog upvotes

- Source: owner extension request; existing Convex Blog contract.
- Exact location: Blog post schema/functions/bridge/API and detail/list presentation.
- Structure: browser-token GET state and POST toggle; reactive aggregate count; compact ledger-style action next to article engagement.
- Dependency/color confirmation: no dependency; existing tokens only.
- Acceptance criteria:
  1. First toggle creates one vote and increments once; second removes it and decrements without becoming negative.
  2. Repeated same-browser requests cannot create duplicate rows.
  3. Public Blog payloads always expose a numeric count, falling back to zero for old rows.
  4. Button has pressed state, count label, loading/error states, and visible keyboard focus.
- Relevant guardrails: no fake seed votes, no PII persistence, transactional count, no hover-only state.
- Screenshot/evidence: API round-trip, database audit, desktop/mobile voted/unvoted states.
- Status: `validated`.

### Task G — Blog comments

- Source: owner extension request; Auth.js owner/session rules; Convex index/security rules.
- Exact location: Blog comment schema/functions/bridge/API and detail page after article body.
- Structure: ruled comment ledger, authenticated composer, character counter, sign-in call to action, live active-comment list, owner/author delete controls.
- Dependency/color confirmation: no dependency; existing tokens only.
- Acceptance criteria:
  1. Anonymous users can read comments but cannot post; the UI offers the existing Google sign-in path.
  2. Authenticated comments use server-derived author data and appear reactively in chronological order.
  3. Empty, oversized, rapid-repeat, invalid-post, and forged-author requests fail deterministically.
  4. Authorized deletion removes the row from the public query without hard-deleting audit data.
- Relevant guardrails: no raw HTML, no exposed email/actor key, bounded query, focus-visible controls, mobile-safe composer.
- Screenshot/evidence: signed-out mobile, signed-in/owner desktop if session available, API authorization probes, database audit.
- Status: `validated`.

### Task H — Validation, documentation, and delivery

- Source: `AGENTS.md` validation/log phases and the owner’s explicit evaluation request.
- Exact location: automated checks, live development deployment, rendered pages, `DESIGN.md`, `TASKS.md`, decision log, git history.
- Acceptance criteria:
  1. `npm run convex:typecheck`, dev Convex push, production build, and focused parser/API tests pass.
  2. Desktop 1440+, tablet 768, mobile 375, keyboard/focus, and reduced-motion evidence is captured and visually reviewed.
  3. All P0–P2 findings are fixed and re-captured; P3/P4 findings are either fixed or recorded with evidence.
  4. Each coherent unit is committed; only intended files are staged; final branch is pushed.
- Status: `done`.

## 4. Implementation order and deployment safety

1. Renderer semantics, inline tokens, diagram, and preview (front-end-only, no schema risk).
2. Root phase scheme (global visual regression boundary).
3. Client compression and server upload validation (write-path hardening).
4. Convex schema first, then engagement validators/functions/bridge/API/UI.
5. Convex code generation/typecheck and development deployment before API smoke tests.
6. Production build with the development server stopped to avoid `.next` contention.
7. Browser evidence, P0–P4 triage, documentation/log updates, scoped commits, and push.

## 5. Validation matrix

| Surface | Desktop | Tablet | Mobile | Keyboard | Reduced motion | Programmatic |
|---|---:|---:|---:|---:|---:|---:|
| Lists/inline/table/code | yes | if overflow found | yes | links | static | semantic DOM + unsafe URL cases |
| Flowchart | yes | yes | yes | n/a | static | parser valid/malformed cases |
| Image preview | yes | — | yes | open/close/focus return | yes | dialog attributes |
| Four phase schemes | all four | sunset | cycle | control focus | no transition | root attribute + persistence |
| Image compression | editor | — | editor if practical | file/control focus | n/a | type/signature/size route probes |
| Upvote | both states | — | both states | pressed/focus | n/a | create/remove/dedupe/count |
| Comments | owner/auth if available | — | signed-out/composer | submit/delete | n/a | auth/length/cooldown/delete |

### Recorded results

- Renderer: six list blocks retained native markers; the inspected unordered
  blocks used `disc`, the ordered block used `decimal`, the table exposed column
  headers, 16 visible `.md` tokens were highlighted across prose and code, 24
  repository links rendered safely, and the page had zero document overflow.
- Flowchart: the live README diagram parsed to 9 nodes and 10 edges in a
  940×378 viewBox. Malformed/markup-like input returned `ok: false`. At 375 px,
  the 756 px diagram was contained by a 324 px internal scroller with zero page
  overflow.
- Image preview: desktop and 375 px modal states fit within viewport; the close
  action returned focus to the image trigger. Native dialog supplies Escape;
  CSS removes its transform animation under reduced motion.
- Theme: morning, noon, sunset, and night computed different page/surface/ink
  aliases; night survived navigation from Blog to About. Static source checks
  confirm `/manage` inherits the same `.site-main` phase scope without removing
  its owner guard.
- Compression: browser conversion produced a 2560×1440 WebP at 22.1 KB from a
  3200×1800, 113.8 KB PNG. Fake JPEG, SVG, and over-12-MiB WebP requests returned
  415, 415, and 413 and never reached storage.
- Upvote: GET returned zero/unvoted; POST returned one/voted; the second POST
  returned zero/unvoted. The temporary relation was removed. Cross-origin POST
  returned 403 and a missing post returned 404.
- Comments: anonymous POST returned 401; an authenticated backend validation
  actor created a row, immediate repeat returned the 15-second cooldown, a
  wrong-slug delete failed, and the correct slug soft-deleted the test row.
  Cross-origin and over-4-KiB requests returned 403 and 413.
- Engineering gates: Convex development functions deployed successfully;
  `npm run convex:typecheck` and the final production build passed after all
  temporary harnesses were removed. A direct `next start` smoke returned the
  rendered article/flowchart, zero/unvoted state, and the expected anonymous
  comment 401. `.next/BUILD_ID` and `routes-manifest.json` were present.

## 6. Triage log

Populate during visual validation. A task cannot move to `done` with an unresolved P0, P1, or P2.

| Priority | Finding | Evidence | Resolution |
|---|---|---|---|
| P2 — contrast | Night phase inherited the old light HUD-chip fill, producing cream text on a cream chip outside the Hero. | `themes/desktop-night-about.jpg` first pass | Replaced the inherited hard-coded light fill with phase semantic surface/ink mixes; re-captured final night About state. |
| P2 — responsive | The architecture SVG is wider than a 375 px article column. | `renderer/mobile-flowchart.jpg` | Kept the document at zero overflow and contained horizontal movement inside the labelled diagram canvas (324 px client width). |
| P2 — framework validation | A temporary compression route initially used an underscore-prefixed folder, which Next.js correctly treated as private and returned 404. | Browser 404 inspection | Moved the disposable harness to a non-private path, captured the real browser result, then deleted the route before build. |
| P3 — environment | The available in-app browser had no authenticated Google session; connected Chrome was unavailable. | Browser connector result | Kept `/manage` locked, verified root token inheritance in code and public cross-route screenshots; did not weaken authorization for a cosmetic capture. |
| P4 — content drift | The published portfolio article still said Convex had ten tables after votes/comments were added. | README/runtime comparison | Corrected the source to twelve tables, republished 95 blocks, and rechecked the live article: 16 visible `.md` highlights, 24 safe links, one flowchart, and six lists. |
