# Contact and Research Night Contrast — Polish Plan

Date: 2026-08-23

### Task: Repair remaining night-mode foreground role collisions

- Sumber spesifikasi: `PRODUCT.md` (WCAG 2.1 AA, token-only brand palette), `DESIGN.md`, `design-system.md`, supplied Contact/Research screenshots, and live computed styles.
- Halaman/letak persis:
  - Contact `/contact`: CTA labels inside all five fixed-color Portal Cards.
  - Research `/research`: locked publication slot.
  - Shared footer: copyright line on every public route.
- Root cause classification:
  - Contact CTA: conceptual token misalignment — a fixed white button surface inherits phase-remapped `--ink`.
  - Research locked slot: one-off light-theme RGBA values bypass the phase token system.
  - Footer copyright: scope mismatch — Footer sits outside `.site-main`, so `--ink-soft` remains the light-theme base value while the footer background follows night phase.
- Dependency baru dibutuhkan?: TIDAK.
- Token warna baru dibutuhkan?: TIDAK. Reuse `--palette-ink`, `--ink`, and `--phase-footer-ink`.
- Acceptance criteria:
  1. Every Contact CTA label is clearly readable on its white pill in night mode.
  2. Research locked-slot icon, label, and dashed boundary are visible while retaining an intentionally pending/quiet state.
  3. Shared footer copyright meets body-text contrast in night and remains readable in morning.
  4. Contact and Research pass desktop and 375 px visual checks with no horizontal overflow.
  5. No layout, markup, dependency, new hex color, motion, or unrelated feature change is introduced.
  6. Production build passes in isolation from the active development server.
- Evidence folder: `validation/contact-research-night-contrast-2026-08-23/`.
- Validation results:
  - Contact CTA foreground is fixed palette ink and measures 12.88:1 against the darkest possible 90%-white composite, rising to 16.08:1 against white.
  - Research locked-slot label measures 8.26:1 against its composited night surface; its dashed border follows the same phase ink at a quieter 48% mix.
  - Footer copyright measures 6.45:1 on the night footer and remains readable in morning by deriving from `--phase-footer-ink` rather than `.site-main` aliases.
  - Desktop Contact/Research and 375 px Contact/Research screenshots show the repaired labels without horizontal overflow (`documentElement.scrollWidth` 360 px inside the 375 px viewport).
  - Morning Contact and Research retain their hierarchy and deliberately quiet locked state.
  - `npm run build` passed in an isolated clone, leaving the active development server untouched.
- Final evidence:
  - `after-contact-desktop-night.png`
  - `after-contact-mobile-night.png`
  - `after-research-desktop-night.png`
  - `after-research-mobile-night.png`
  - `after-contact-desktop-morning-regression.png`
  - `after-research-desktop-morning-regression.png`
- Triage: all scoped P1/P2 contrast failures fixed; no new P0-P2 findings.
- Status: done.
