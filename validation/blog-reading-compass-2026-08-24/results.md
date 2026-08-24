# Blog reading compass validation

Validated 2026-08-24 against `/blog/anthropic-watermark-removers`.

## Outcome

- Wide desktop: two real recent articles flank the body in 172 px sticky rails. The rails end before the in-flow recommendation section.
- All viewports: `Read next` uses shared-tag count and publication recency to select three real posts.
- Tablet/mobile: the rails are absent, the complete trail remains, and the document has zero horizontal overflow.
- Keyboard: recommendation links expose a visible dashed `:focus-visible` outline and meet the 44 px minimum target.
- Performance: summary payload 22,675 bytes versus the rejected 328,953-byte full-list path (about 93% smaller).
- Runtime: clean fresh-tab console, successful Convex development push, TypeScript check, production build, and HTTP 200 production smoke.

## Evidence

- `desktop-top.png`
- `desktop-reading-trail.png`
- `desktop-focus.png`
- `tablet-reading-trail.png`
- `mobile-reading-trail.png`

The connected browser had no reduced-motion emulation capability. The scoped hover/press transforms have an explicit `prefers-reduced-motion: reduce` terminal-state override and were validated statically; no reduced-motion screenshot is claimed.

## Existing out-of-scope observation

The global Nala FAB still occupies a small fixed lower-right area on 375 px Blog pages. This predates the reading compass and is already tracked in `TASKS.md` Someday; the new component did not modify the widget.
