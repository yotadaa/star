# Caelestia Island Suite Blog validation

Date: 2026-08-23

## Functional and data checks

- Published slug: `caelestia-island-suite`.
- Convex result: 54 editor-native blocks, including six image blocks.
- Every image block has a pinned HTTPS `src`, non-empty `alt`, and caption.
- Re-running `npm run blog:publish:caelestia` updates the same slug. The Blog
  table remains at four rows with no duplicate keys.
- The deterministic seed builder produced the same content SHA-256 twice:
  `6fd108bcc0712ff6c3c8dff34ee1342d683cc3e460ac56f6bfd72e5cf689f851`.
- Seed output contains four Blog rows; the Caelestia row retains 54 blocks and
  six complete image blocks. The destructive seed import was not rerun.

## Visual checks

- Desktop viewport: 1280x900, effective document width 1265px.
  `scrollWidth` equals `clientWidth`; all six 1920x1080 images load and render
  at 756x425 without distortion.
- Mobile viewport: 375x812, effective document width 360px.
  `scrollWidth` equals `clientWidth`; all six images render at 316px wide and
  the repository table stays at 320px.
- Image captions remain visible and every rendered image has an accessible
  name from its alt text.
- The Blog index exposes a visible `Baca Caelestia Island Suite` link to the
  new detail route.
- Final public-page browser console audit: no warnings or errors.
- Reduced motion: not stateful for this component. Image blocks add no
  animation or transition, so the rendered image state is static under both
  motion preferences.
- Editor screenshot: not captured because the isolated in-app browser had no
  owner session and the route correctly redirected to `/forbidden?reason=login`.
  The image editor fields were verified through the compiled source and full
  production build.

## Triaged findings

- P2: repository table caused horizontal overflow at 375px. Fixed with fixed
  table layout and cell wrapping; recheck passed.
- P2: the compatibility SHA exceeded its list item width at 375px. Fixed with
  list-item overflow wrapping; recheck passed.
- Build environment: another task ran `next dev` against the same workspace
  during validation and raced on `.next`. An isolated snapshot of the exact
  workspace source completed `npm run build` successfully with all 14 static
  pages generated.

## Evidence

- `desktop-blog-list.png`
- `desktop-top.png`
- `desktop-showcase.png`
- `mobile-top.png`
- `mobile-showcase.png`
