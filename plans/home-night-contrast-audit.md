# Home Night Contrast Audit and Repair Plan

Date: 2026-08-23
Scope: Home `/` in `night` cockpit phase, especially the Hero boundary, Quest Log strip, and Build Glimpses band.
Sources: user screenshot, runtime computed styles, `PRODUCT.md`, `DESIGN.md`, and `design-system.md`.

## Audit health score

| Dimension | Score | Key finding |
|---|---:|---|
| Accessibility | 2/4 | Three foreground roles fall below practical readability because surface tokens are used as text. |
| Performance | 3/4 | No new contrast-related cost; the existing Three.js `Clock` warning remains tracked by Home performance work. |
| Responsive design | 3/4 | Desktop has no horizontal overflow; mobile must be revalidated after repair. |
| Theming | 2/4 | Night remapping reveals a systemic foreground/surface role collision in scenic dark components. |
| Anti-patterns | 4/4 | The repair needs no new visual grammar, card, gradient text, or off-brand effect. |
| **Total** | **14/20** | **Good, with release-blocking night contrast defects.** |

Anti-pattern verdict: the interface remains project-specific and intentional; the failure is a semantic-token cascade bug, not an aesthetic direction problem.

## Verified findings

### P1 — Quest Log labels disappear

- Location: `.questlog .hud-chip` in `app/globals.css`.
- Evidence: night computed foreground resolves near `rgb(31, 49, 36)` over `rgba(22, 36, 31, .44)`; only the accent icons remain obvious.
- Cause: `color: var(--cream)` treats a phase-remapped surface token as fixed foreground. Borders and hard shadows also inherit the inverted `--ink` role.
- Repair: assign palette-stable foreground/frame aliases inside the permanently dark Quest Log component.

### P1 — Build Glimpses heading and band invert together

- Location: `.glimpse-band` and `.glimpse-band .section-head h2`.
- Evidence: the heading resolves near `rgb(31, 49, 36)`. The lower band gradient resolves from dark pine into phase `--ink`, which is cream in night mode, producing a washed light field beneath dark copy.
- Cause: fixed dark scenery is composed from dynamic page text/surface aliases.
- Repair: keep the theatrical band shell on immutable palette pine/ink/cream roles while preserving the phase-aware card surfaces inside it.

### P1 — Hero scroll cue is nearly invisible

- Location: `.scroll-cue`.
- Evidence: its foreground resolves near `rgb(21, 41, 40)` at 80% opacity over the night mountain scene.
- Cause: `var(--parchment)` is a dynamic page surface in night mode, not a scenic foreground.
- Repair: use the immutable parchment foreground token for the cue.

### P2 — Dark-component frame roles are inconsistent

- Location: Quest Log borders/shadows and outer Glimpses shell/slide frame.
- Impact: night mode produces pale hard frames where the established component grammar expects deep-ink framing.
- Repair: scope immutable frame tokens to these intentionally dark components; do not change phase-aware content-card surfaces.

## Repair acceptance criteria

1. Quest Log labels, Hero scroll cue, and Build Glimpses heading are clearly visible in night mode.
2. The Glimpses outer band stays deep pine-to-ink in every phase; its inner cards may continue following application phase surfaces.
3. Desktop and 375 px night screenshots show no clipping or horizontal overflow.
4. Morning regression preserves the existing visual hierarchy.
5. No dependency, new hex color, markup, animation, or unrelated route change is introduced.
6. Production build passes without touching the active development server's `.next` directory.

## Implementation map

- `app/globals.css`: replace dynamic surface aliases only where they are incorrectly used as foreground/frame roles in `.scroll-cue`, `.questlog`, and the fixed dark shell of `.glimpse-band`.
- `TASKS.md`: track the repair through validation.
- `validation/home-night-contrast-2026-08-23/`: retain before/after desktop and mobile evidence.

## Post-repair re-audit

| Dimension | Score | Result |
|---|---:|---|
| Accessibility | 4/4 | Quest Log text measures 11.90:1; Glimpses heading measures 10.60:1–13.68:1 across its fixed dark gradient. |
| Performance | 3/4 | CSS-only token correction adds no runtime work; the existing Three.js warning remains out of scope and tracked. |
| Responsive design | 4/4 | Desktop and 375 px night layouts have no horizontal overflow or clipped labels. |
| Theming | 4/4 | Fixed scenic shells now use immutable palette roles; phase-aware page/card surfaces still switch normally. |
| Anti-patterns | 4/4 | No new visual pattern, dependency, color, or motion was introduced. |
| **Total** | **19/20** | **Excellent for the audited Home night scope.** |

Final evidence:

- Before: `validation/home-night-contrast-2026-08-23/before-home-fold-night.png`
- Night desktop: `validation/home-night-contrast-2026-08-23/after-desktop-night.png`
- Night mobile 375 px: `validation/home-night-contrast-2026-08-23/after-mobile-night.png`
- Morning regression: `validation/home-night-contrast-2026-08-23/after-desktop-morning-regression.png`
- Production build: passed in an isolated clone, leaving the active development server's `.next` directory untouched.

Status: repaired and validated.
