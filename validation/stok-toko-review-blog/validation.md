# Stok Toko project review Blog validation

Date: 2026-08-23

## Published data and image ownership

- `npm run blog:publish:stok-toko` updated `stok-toko-project-review` with 32 native blocks and six image blocks.
- Final publisher run uploaded no duplicates and reused all six existing Convex Storage records (`uploads: 0; reused: 6`).
- The publisher requires every image block to have an `assetKey` and `storageId`, rejects a persisted `src`, and resolves the temporary delivery URL from Convex at read time.
- The rendered article reported `convex` as its source. Both carousel images and both standalone images decoded from Convex delivery URLs in the production render.

## Writing review

- Draft source: current Kotlin, Compose, Room schema/migrations, scanner worker, repository code, tests, PRD, feature notes, design notes, and the six supplied runtime captures.
- `anti-ai-slop-writing` pass: 1,003 words; banned-term scan clear; no em dash or exclamation-mark dependence.
- `anti-slop` pass: removed a meta opening and two redundant section summaries. Technical claims and caveats were unchanged.
- The review separates implemented behavior from planned or incomplete work, including the oversized root orchestration files, documentation/runtime drift, incomplete unit conversion, in-memory search path, local AI-key storage, and intentionally absent multi-device features.

## Automated checks

- `npm run convex:typecheck`: passed.
- `npm run build`: passed; `/blog/[slug]` first-load JavaScript is 108 kB.
- `npm run convex:seed:build`, repeated twice: byte-stable content hash `4641b3daabdf12b54d3c47692604b7f341da3047f617918091cbaf3588745613` in the combined working tree. Counts were Blog 7, Inventory 14, Content 6, Contact 5; the seventh Blog entry belongs to a separate GenBI work unit present in the shared workspace.
- The nested Android repository test task could not start under the available JDK 25 because its Gradle wrapper requires JDK 17. No Android source was changed by this Blog task.

## Browser and accessibility checks

- Production detail route and Blog listing returned HTTP 200, included the new title, and did not render the error page.
- Consecutive image blocks formed two carousel regions. Previous/next controls, `1 / 2` counters, and direct-selection dots updated the active image without modifying the stored block schema.
- Desktop, 1365×900 viewport: portrait images rendered at approximately 275×612 px; page content width was 1,350 px and scroll width was 1,350 px.
- Mobile, 375×812 viewport: portrait images rendered at approximately 248×552 px; page content width was 360 px and scroll width was 360 px.
- All six supplied screenshots decoded: four through the two carousel groups and two as standalone figures.
- Keyboard focus on a carousel control produced a visible 2 px dashed gold outline. Buttons retain native button semantics, disabled bounds, accessible labels, `aria-controls`, and a polite live viewport.
- Carousel images measured `animation-name: none`, `animation-duration: 0s`, and `transition-duration: 0s`; the component does not depend on motion to reveal content. The reduced-motion rule also removes any control transition.

## Visual evidence

- `desktop-top.png`: desktop title, excerpt, metadata, and opening copy.
- `desktop-content.png`: bounded desktop portrait image with caption and carousel controls.
- `mobile-top.png`: mobile title and opening layout with no horizontal overflow.
- `mobile-content.png`: bounded mobile portrait image, caption, controls, counter, and dots.

## Triage

- P1 fixed: public Convex query transport returned HTTP 404 in this environment. The server-only Blog adapter now retries through the protected bridge action before considering static fallback, so the published post remains sourced from Convex.
- P2 fixed: unbounded portrait images dominated the article. Standalone and carousel images now share a `min(68vh, 640px)` cap and remain centered.
- P2 fixed: related consecutive screenshots previously appeared as separate tall figures. They now render as keyboard-accessible carousels while the editor and persisted image-block format remain unchanged.
- No P0 guardrail issues, new dependency, new hex color, emoji control, or horizontal overflow were found.
