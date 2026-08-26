# Blog image ALT remediation

## Scope

Resolve Bing Webmaster's `Alt attribute for images is missing` warning on public Blog article pages without weakening screen-reader semantics.

## Evidence

- Production HTML contains no `<img>` without an `alt` attribute.
- Bing is treating crawler-visible `alt=""` values as missing.
- The empty values come from the player avatar, dormant lightbox copies, and related-article cover images. Article image payloads already have descriptive alt text.

## Implementation

1. Give the player/profile avatars accurate labels while retaining redundant/decorative accessibility hiding where appropriate.
2. Give fullscreen preview images an enlarged-view description derived from the original image alt text.
3. Reuse featured-image descriptions for `Read next`, Blog grid, and Blog list covers.
4. Add a dependency-free rendered-HTML audit that fails on absent or empty Blog image alt attributes.

## Acceptance criteria

- Every server-rendered `<img>` on `/blog` and every published `/blog/{slug}` route has a non-empty `alt` attribute.
- Article images preserve their existing editorial descriptions.
- Redundant images remain excluded from the accessibility tree through their existing labelled ancestors or `aria-hidden` wrappers.
- Fullscreen preview images expose meaningful alt text when the dialog opens.
- Production build and rendered Blog route audit pass.
- Desktop and 375 px mobile screenshots show no layout regression.

## Status

`complete`
