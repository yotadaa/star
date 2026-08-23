# Mukhtada's Portfolio Blog validation

Date: 2026-08-23

## Published data

- Development deployment: `impartial-basilisk-364`.
- Slug: `mukhtadas-portfolio`.
- Source: Convex.
- Matching rows: 1.
- Content: 95 native blocks, including 20 headings, 46 paragraphs, 6 lists,
  15 code blocks, 3 tables, 1 quote, and 4 image blocks.
- Image persistence: every image block stores a Convex `_storage` ID and a
  stable `blog:mukhtadas-portfolio:*` asset key. The public query resolves the
  current URL with `ctx.storage.getUrl`; the URL is not the stored source of
  truth.
- First storage publisher run: 4 uploads. Repeat result: 0 uploads and 4
  checksum-matched reuses; the Blog row updated in place with no duplicate
  slug or file row.
- Deterministic seed: 5 Blog posts, 14 Inventory items, 6 Content entries,
  and 5 Contact channels.
- Seed content SHA-256: `619099a654b6ff278855e8e3ad9f87d1b015dd787703db17ed6f77ece7d3ed8c`.

## Convex environment regression

- Application/runtime/config sources contain no reference to the removed
  public-prefixed Convex URL variable.
- Server queries and actions use `ConvexHttpClient` with the normalized
  `.convex.cloud` value from `CONVEX_CLOUD_URL`.
- The server root layout passes the same public deployment address to
  `ConvexReactClient`; the client component no longer reads a server env
  variable from its bundle.
- `CONVEX_HTTP_URL` remains the separate `.convex.site` HTTP Actions origin.
- A configured trailing slash is removed before Convex clients build API
  paths. This fixed the empty HTTP client response observed during validation.
- `/api/blog/posts` returned HTTP 200 with `source: convex`; the detail route
  returned HTTP 200 from the isolated production server.
- `npx convex dev --once` added the `files.by_sourceKey` index and pushed all
  updated functions. The CLI-generated legacy public env lines were removed
  from ignored `.env.local` immediately after each push.

## Image and viewport checks

Desktop viewport requested at 1280×900; effective document width was 1265px:

- Four figures and four decoded images.
- Every `src` resolved to
  `impartial-basilisk-364.eu-west-1.convex.cloud/api/storage/...`; no image
  used `/assets/blog/` or another project-file path.
- Intrinsic sizes: 1280×900, 1265×712, 1425×990, and 1440×1000.
- Every image has non-empty alt text and `loading="lazy"`.
- Rendered image width: 756px.
- Document `scrollWidth` equals `clientWidth` at 1265px.

Mobile viewport requested at 375×812; effective document width was 360px:

- Four figures and four decoded images.
- All four URLs resolved from the same Convex Storage deployment; no local
  Blog asset path was present.
- Rendered image width: 316px for every image.
- Document and body `scrollWidth` equal `clientWidth` at 360px.
- Three tables remain inside the page width.
- Blog index and detail both fit without horizontal page overflow.

Reduced-motion adds no special state for these static image blocks. Existing
global motion behavior was not changed.

## Visual evidence

- `desktop.png`: article header and first image.
- `desktop-image-1.png` through `desktop-image-4.png`: every README image and
  caption at desktop width.
- `mobile.png`: article header at 375px.
- `index-desktop.png` and `index-mobile.png`: published article on the Blog
  index.

## Triaged findings

- P1 functional: the renamed environment contract made `convex/nextjs`
  server helpers fall back to local content. Fixed by using an explicit
  server `ConvexHttpClient` and passing the cloud URL from the server layout.
- P1 functional: the new cloud URL ended with `/`, which produced an empty
  client response. Fixed by normalizing trailing slashes at every client and
  publisher boundary.
- P1 functional: the first image mapping copied four binaries into
  `public/assets/blog/`. Replaced it with idempotent Convex Storage uploads,
  `_storage` references in blocks, an indexed asset-key fallback for seed
  imports, and editor uploads through the existing protected file route. The
  temporary public copies were deleted.
- Convex review finding: a publisher interruption between replacing a blob and
  updating its Blog row could leave an old `storageId` in the block. The read
  path now falls back to the indexed asset key whenever that ID no longer
  resolves, and returns the replacement ID and URL.
- Evidence-only: full-page capture repeated the sticky navigation while
  stitching, and in-app clip coordinates did not select the requested mobile
  block. Those misleading artifacts were discarded. Final evidence uses
  stable viewport captures plus DOM assertions for all four mobile images.
- The shared development `.next` directory was concurrently inconsistent, so
  the final production build and server were run from an isolated snapshot.
  The isolated build passed.

## Final gates

- `npm run convex:typecheck`: passed.
- `npx convex dev --once`: passed; schema/index/functions pushed.
- `npm run convex:seed:build`: passed twice with the same content checksum.
- `npm run blog:publish:portfolio`: passed twice; second run reused all four
  Convex files and updated the existing row.
- Isolated `npm run build`: passed.
- Production detail/API/Convex Storage HTTP checks: passed.
- Desktop and mobile visual review: passed.
- No dependency or color token added.
