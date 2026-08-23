# Hero Night Copy Contrast — Implementation Plan

### Task: Repair night-phase Hero foreground contrast

- Sumber spesifikasi: `PRODUCT.md` (legibility, WCAG 2.1 AA, token-only palette), `DESIGN.md` (Home Hero copy remains unboxed and legible), `design-system.md` (Verdant Dusk token system), and the supplied 2026-08-23 night screenshot.
- Halaman/letak persis: Home `/`, centered copy stack inside the scenic Hero.
- Elemen & struktur: Preserve `HeroGlassPanel` markup, typefaces, hierarchy, and plain/unboxed composition. Introduce semantic foreground aliases only inside `.hero-copy`; do not alter the scene, layout, or CTA structure.
- Dependency baru dibutuhkan?: TIDAK.
- Token warna baru dibutuhkan?: TIDAK. Reuse immutable `--palette-*` tokens and existing `--sky-6`.
- Butuh konfirmasi data?: tidak.
- Acceptance criteria:
  1. In night phase, the complete headline and lede are immediately readable against the scene; the italic phrase retains its pale-gold emphasis.
  2. Morning/light phase retains the existing hierarchy, spacing, and color behavior.
  3. Desktop and 375 px screenshots show no clipping, overlap, or horizontal overflow; the static foreground declarations add no motion behavior.
  4. No dependency, markup, scene, or unrelated theme changes are introduced, and the production build passes.
- Guardrail relevan: token-only colors; no gradients/glow/card added; preserve reduced-motion behavior; WCAG 2.1 AA target; visual evidence required.
- Screenshot evidence: `validation/hero-night-copy-contrast-2026-08-23/` (`desktop-night.png`, `mobile-night.png`, `desktop-morning-regression.png`).
- Temuan triase:
  - P1 — the night phase remapped legacy `--cream`/`--parchment` aliases to dark surface colors, making foreground copy disappear. Fixed with Hero-scoped semantic foreground aliases whose night values point to immutable palette colors.
  - P0/P2 — none. No dependency, token, markup, overflow, or interaction changes were introduced.
- Validation:
  - Desktop night computed title `rgb(245, 236, 216)`, emphasis `rgb(242, 223, 166)`, and lede `rgb(234, 221, 192)`; all were visibly present over the night scene.
  - Mobile night at 375 px retained the same foreground colors and measured `documentElement.scrollWidth` at 360 px inside the 375 px viewport (no horizontal overflow).
  - Morning regression retained the pre-fix palette values and visual hierarchy.
  - Browser console contained no new application error; only the pre-existing Three.js `Clock` deprecation warning associated with the already-tracked Home performance work.
  - `npm run build` passed in an isolated clone so the active Next.js development server and its `.next` directory were not disturbed.
- Status: done.
