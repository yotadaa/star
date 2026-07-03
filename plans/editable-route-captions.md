# Editable Route Captions

### Task: Extend Editable Header Caption to primary content routes

- Sumber spesifikasi: user request (2026-07-04), `plans/blog-implementation/implementation-plan.md` §4, `plans/blog-implementation/blog-editor-mockup.html` section "Editable Header Caption", `PRODUCT.md` Design Principles 2 and 5.
- Halaman/letak persis: caption directly below the `PageHeader` title on `/about`, `/projects`, `/research`, and `/contact`; the second profile paragraph below the About header is editable separately.
- Elemen & struktur: reuse `EditablePageCaption` inside `PageHeader` and for the About `intro` record; retain each route's current copy as the factual fallback; persist by route-specific `entry_key` through the existing owner-only `/api/about/entries` endpoint.
- Dependency baru dibutuhkan?: TIDAK.
- Token warna baru dibutuhkan?: TIDAK.
- Butuh konfirmasi data (rarity/medal/dsb)?: TIDAK; the user explicitly requested the feature and existing caption copy remains unchanged.
- Acceptance criteria:
  1. Visitors see the current caption without edit controls on all four routes.
  2. An authenticated owner sees the pencil trigger and can save a route-specific caption to Supabase.
  3. Saved captions are read from `public.about_entries` and survive a route reload.
  4. Editing the About `intro` record preserves its existing affiliation/location payload.
  5. Controls remain keyboard accessible, preserve the existing focus-visible treatment, and produce no horizontal overflow at 375px.
  6. No dependency, color token, schema, or fabricated content is added.
- Guardrail relevan dari `AGENTS.md` §1: no new dependency, no new color, no fabricated data, WCAG keyboard access, no mobile overflow.
- Screenshot evidence:
  - New route render/visitor guard: `screenshots/editable-route-captions-2026-07-04/contact-sheet.png` plus the individual desktop/mobile captures in the same folder.
  - About second paragraph: `screenshots/editable-route-captions-2026-07-04/about-desktop-second-paragraph.png` and `about-mobile-second-paragraph.png`.
  - Existing reusable owner state: `screenshots/blog-redesign-2026-07-03/blog-caption-saved.png`.
  - Persistence: `PUT /api/about/entries` returned `200` for all four keys across `s1`, `s2`, and `s3`; unauthenticated `PUT` returned `401`.
- Temuan triase (jika ada):
  - P4 fixed: the first Research/Contact captures were taken before existing reveal animations completed; recaptured after target cards reached their visible state.
  - No P0-P3 findings. DOM checks reported `scrollWidth === clientWidth` and zero edit triggers for the visitor session on all four routes at desktop and mobile widths.
- Status: done.
