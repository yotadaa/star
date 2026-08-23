# GenBI rebranding Blog validation

Date: 2026-08-23

## Published result

- Route: `/blog/genbi-rebranding`
- Source link: `https://github.com/GenBI-Jambi/genbi-rebranding`
- Payload: 40 native Blog blocks, including 8 headings, 7 image blocks, 1 table, 2 quotes, 2 lists, and 2 dividers
- Images: 7 unique PNG files in Convex Storage. `Pasted image (4).png` and `Pasted image (5).png` had the same SHA-256, so the latter was omitted.
- Persistent image fields: every image block has a distinct `storageId` and `assetKey`; no block persists `src`. Public reads resolve seven HTTPS URLs on the Convex deployment host.

## Evidence and writing gate

- Read the supplied Git snapshot, current root PHP MVC app, Laravel copy, route files, migrations, tests, theme registry, progress log, commit history, and all eight captures.
- Verified snapshot-bound article counts before writing: 247 commits, 165 commits under `yotadaa`, 45 root-app migrations, 33 PHP test files, 2 JavaScript test files, and 30/97/56 public/admin/finance route declarations.
- `anti-ai-slop-writing` banned-term scan: no matches.
- `unslop` audit: 1,275 words, no em dash, parenthetical aside, exclamation mark, generic conclusion opener, unsupported metric, or invented outcome.
- The article includes direct criticism of the dual PHP/Laravel trees, repeated finance-controller logic, large files, and tracked build artifacts.

## Storage and data gate

- First publisher run: `uploads: 7; reused: 0`.
- Second publisher run: `uploads: 0; reused: 7`.
- Public API readback: source `convex`, status `published`, 40 blocks, 7 images, 7 unique storage IDs.
- Downloaded all seven resolved image URLs. Each returned HTTP 200 with `image/png`, and each downloaded SHA-256 matched its supplied source PNG.
- No image URL points to `localhost`, `127.0.0.1`, or a project `public/` path.

## Build and deterministic seed gate

- `npm run convex:typecheck`: passed.
- Two `npm run convex:seed:build` runs produced the same content hash: `4641b3daabdf12b54d3c47692604b7f341da3047f617918091cbaf3588745613`.
- Seed counts: 7 Blog, 14 Inventory, 6 Content, and 5 Contact rows. The in-progress Stok Toko entry remains present.
- Isolated `npm run build`: passed; `/blog/[slug]` remains a dynamic server-rendered route.

## Visual and accessibility gate

### Desktop, 1280 x 900

- Document `scrollWidth` and `clientWidth` both measured 1,265 px. No horizontal overflow.
- The title, excerpt, Convex source label, opening paragraphs, and first image render in the initial viewport.
- Both two-image galleries reached state `2 / 2`; the Team and Prestasi captures decoded at their natural width of 1,920 px with the expected alt text.
- Screenshot evidence: `desktop-top.png`, `desktop-content.png`.

### Mobile, 375 x 812

- Document `scrollWidth` and `clientWidth` both measured 360 px. No horizontal overflow.
- Each gallery measured 320 px wide. The table measured 320 px and did not exceed its container.
- Current images rendered at 316 px inside 320 px parents. Every observed image decoded at natural width 1,920 px from the Convex host.
- `Buka sumber` and `Kembali ke Blog` accepted keyboard focus and showed a 2 px focus outline.
- The Blog renderer and its descendants had no computed animation or transition. The carousel CSS also removes its button transition under `prefers-reduced-motion: reduce`, so the new post adds no motion that can continue in reduced-motion mode.
- Screenshot evidence: `mobile-top.png`, `mobile-content.png`.

## Visual triage

- P0 guardrail: none.
- P1 functional: none.
- P2 accessibility: none.
- P3 performance: none observed; image elements use lazy loading and async decode through the existing renderer.
- P4 cosmetic: the shared Blog metadata row prints the full ISO publication timestamp. This predates the GenBI payload and is deferred to `TASKS.md` Someday with `desktop-top.png` and `mobile-top.png` as evidence.

Status: validated
