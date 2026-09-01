# Hero Ambient Life continuation

- **Date:** 2026-09-01
- **Route:** `/` — Hero cockpit
- **Source:** user-supplied `Hero Ambient Life — Feature Spec`
- **Architecture review:** Sol Extra High, read-only, before implementation
- **Status:** rabbit removal validated — Sol Extra High final verdict READY

## Scope decision

The already validated Tier 1 grass, independent cloud drift, and night cloud
relocation remain unchanged. This continuation adds the two remaining behaviors
that have a verified place in the current scene without expanding WebGL:

1. one decorative ground-fauna slot (cat at noon only); and
2. one night firefly encounter rendered as a stable 2–3-sprite cluster.

Concurrency is structural: at most one interactive airborne encounter plus at
most one decorative ground encounter. Child sprites inside a sparrow pair or
firefly cluster are one logical encounter, not additional encounters.

The following proposal items remain deliberately deferred:

- watchtower/lighthouse, smoke, and lamp — the current scene has no approved
  structural anchor, and the earlier owner decision excluded the watchtower;
- water ripple and boat — the scene has no body of water;
- sky breathing — optional continuous full-surface motion with no dependency on
  the requested fauna;
- ambient audio — requires a separate explicit product decision and mute UX.

## Owner adjustment — remove morning rabbit

- **Source:** explicit user request on 2026-09-01: “remove the rabbit then
  commit and push”.
- **Production change:** delete the rabbit SVG branch and render ground fauna
  only for the noon cat. Morning, sunset, and night render no ground root.
- **Acceptance criteria:** no `rabbit` production reference remains; morning
  reports zero fauna roots; noon reports exactly one pointer-inert,
  `aria-hidden` cat; sunset/night remain zero; no overflow, dependency,
  renderer, lifecycle, or color-token change.
- **Validation:** production build, deterministic phase DOM counts, noon visual
  screenshot at desktop/mobile, reduced-motion cat state, Sol Extra High final
  diff review, then a scoped commit and push.
- **Status:** validated — Sol Extra High READY, no P0–P3 findings

## Task 1 — Night firefly cluster

- **Source specification:** supplied feature spec Tier 2, Firefly cluster
- **Exact location:** `HeroEntityLayer`, existing night airborne encounter
- **Structure:** preserve the scalar encounter, single motion root, one focus
  target, one WAAPI flight, and one dodge lifecycle. Store a stable
  `clusterSize` on firefly encounter creation and render 2–3 decorative sprite
  children inside the existing button.
- **Dependency required?:** no
- **New color token required?:** no
- **Acceptance criteria:**
  1. Night selection is one explicit `1/6` firefly branch and `5/6` bat branch;
     firefly cannot re-enter through a fallback pool.
  2. A firefly encounter contains exactly 2 or 3 visual sprites but exactly one
     focusable target and one accessible label.
  3. Click, tap, Enter, and Space still create one spark/dodge and resume the
     original flight without a position jump.
  4. Overlay, offscreen, hidden-tab, focus, phase-change, and reduced-motion
     behavior retain the validated lifecycle invariants.
  5. Cluster child loops stop for reduced motion and pause with the layer.
- **Guardrails:** no render-time randomness; no array rewrite; no new texture,
  draw call, dependency, hex color, audio, score, or reward.
- **Screenshot evidence:**
  `validation/hero-ambient-life-2026-09-01/firefly/`
- **Status:** validated after mobile focus/evidence remediation

## Task 2 — Decorative ground fauna

- **Source specification:** supplied feature spec Tier 2, Ground fauna; explicit
  owner adjustment removes the morning rabbit and retains the noon cat
- **Exact location:** foreground meadow within `AmbientLife`
- **Structure:** one `aria-hidden` ground encounter root using inline SVG pixel
  geometry and a CSS transform/opacity timeline. Noon maps to cat; morning,
  sunset, and night render no ground encounter.
- **Dependency required?:** no
- **New color token required?:** no
- **Acceptance criteria:**
  1. Exactly zero or one ground encounter exists, so total logical encounters
     never exceed two.
  2. Motion walks slowly, pauses once, then exits; it uses transform/opacity
     only and has no JS timer, RAF, listener, WebGL call, or image request.
  3. The lane remains below the Hero copy/CTA and inside the meadow at 1440,
     768, and 375 px with zero horizontal overflow.
  4. The encounter is nonfocusable, pointer-inert, and hidden from assistive
     technology.
  5. Offscreen/overlay/hidden states pause it; reduced motion retains one static
     visible frame with no running animation.
- **Guardrails:** existing color tokens only; no asset, audio, fabricated data,
  UI card, or full-surface `will-change`.
- **Screenshot evidence:**
  `validation/hero-ambient-life-2026-09-01/ground-fauna/`
- **Status:** validated

## Validation matrix

- Build and diff: `npm run build`, `git diff --check`, scoped dependency diff.
- Selection boundary: injected rolls around `1/6`; stable cluster size 2 or 3.
- Interaction: pointer, touch, Enter, Space, focus hold, blur resume, phase
  change while focused.
- Lifecycle: overlay, offscreen, hidden tab, repeated pause/resume, runtime
  reduced-motion change; no animation or DOM-count leaks.
- Visual: desktop 1440 and mobile 375; noon cat, morning/sunset/night without
  ground fauna, night firefly cluster, focused cluster, post-dodge, and reduced
  motion.
- Geometry: no fauna/copy/CTA overlap; no horizontal overflow.
- Performance: no package/lock change, no new image request, zero WebGL scene or
  draw-call change, bounded DOM additions (one fauna root, at most three cluster
  children).

## Sol guardrails adopted

1. Do not convert `HeroEntityLayer` to an encounter array.
2. Keep parent flight/dodge transform ownership unchanged.
3. Child sprites are decorative and pointer-inert.
4. Random species/cluster values are generated once during encounter creation.
5. A phase change may restart ground ambience but must never queue missed
   cycles.
6. Firefly and ground-fauna changes are independently reversible.

## Final review

Sol Extra High reviewed the live source and assertion-bearing evidence twice
after implementation. The first pass closed the original mobile-envelope and
evidence gaps but found a post-dodge navigation/resume P2. The compact firefly
dodge now derives a navigation-safe vertical band and falls back to horizontal
movement when that band is narrow. All four input paths then passed full-cycle
post-dodge geometry plus measured blur continuity and WAAPI resumption. Final
verdict: **READY**, with no P0–P3 findings remaining.

The later owner-requested rabbit removal received a separate Sol Extra High
review after the production branch, SVG, historical rabbit screenshots, and
validation fixtures were updated. Final adjustment verdict: **READY**, with no
P0–P3 findings; the noon cat and lifecycle contract remain intact.
