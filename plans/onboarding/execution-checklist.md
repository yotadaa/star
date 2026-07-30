# Onboarding Character Execution Checklist

## Task: Onboarding Base Character + Fashion Layers

- Sumber spesifikasi: user request 2026-07-04, `PRODUCT.md`, `design-system.md`, `gamification-system-overview.md`, `report.md`, `AGENTS.md`.
- Halaman/letak persis: `plans/onboarding/onboarding.html`.
- Elemen & struktur: asset kit `96x128` PNG transparan, base male/female, animation frames, Nala-style expressive pose frames, image-generation detailed preset sprites, category layers, and static mockup.
- Dependency baru dibutuhkan?: TIDAK.
- Token warna baru dibutuhkan?: TIDAK untuk CSS. PNG memakai palet yang dipetakan dari token existing (`--ink`, `--cream`, `--parchment`, `--gold`, `--aurora`, `--moss`, `--coral`).
- Butuh konfirmasi data?: TIDAK; ini aset onboarding/fashion, bukan data faktual portfolio.

## Discover Notes

- `plans/onboarding` belum ada sebelum task ini.
- Active task `Improve Home performance` tetap diperhatikan: aset onboarding disimpan di plan folder, tidak dimasukkan ke Home runtime.
- Base body wajib adult, non-sexual, semi-nude sebagai mannequin dengan undergarment minimal.
- Fashion system harus layerable; semua PNG produksi memakai canvas sama.
- Pose ekspresif mengikuti cakupan `plans/ai-npc-plan/implementation-plan.md`: `idle`, `thinking`, `happy`, `confused`, `greeting`, `pointing`.
- Preview utama wajib memakai detailed sprites hasil image generation untuk preset fashion; fallback layerable dipakai hanya saat user mengubah category menjadi custom.

## Acceptance Criteria

1. Male dan female base memiliki idle front/back/side, walk front/back/side, sit floor, dan sit chair.
2. Male dan female base memiliki state ekspresif `idle`, `thinking`, `happy`, `confused`, `greeting`, `pointing`.
3. Ada 3 complete fashion sets (`field-researcher`, `campus-organizer`, `night-coder`) yang mencakup seluruh kategori.
4. Setiap complete fashion set memiliki frame pose ekspresif precomposed di `assets/poses/{gender}/{set}/{pose}/frame-00..03.png`.
5. Setiap complete fashion set memiliki detailed image-generation frame pose ekspresif di `assets/detail/poses/{gender}/{set}/{pose}/frame-00..03.png`.
6. Ada independent items untuk seluruh kategori yang diminta user.
7. Mockup static `onboarding.html` memperlihatkan animasi hidup, expressive pose switching, per-category fashion adjustment, dan freeze saat reduced-motion.
8. Screenshot evidence desktop/mobile/reduced-motion tersedia.
9. Tidak ada dependency baru, modal blocking, audio, atau emoji-as-icon tambahan.

## Validation Evidence

- Reference images: `plans/onboarding/assets/reference/`
- Generated previews: `plans/onboarding/assets/previews/`
- Expressive fashion poses: `plans/onboarding/assets/poses/`
- Detailed image-generation fashion poses: `plans/onboarding/assets/detail/poses/`
- Final screenshots:
  - `validation/onboarding-character/desktop-full.png`
  - `validation/onboarding-character/mobile-full.png`
  - `validation/onboarding-character/desktop-reduced-motion.png`
  - `validation/onboarding-character/interaction-focus-pointing.png`
  - `validation/onboarding-character/desktop-pointing-detail.png`
- Browser audit:
  - Broken images: 0.
  - Horizontal overflow desktop/mobile: 0.
  - Buttons: 45, all with shared `:focus-visible` rule.
  - Reduced motion: `#detailLayer` stayed on `frame-00.png`.
  - Preset preview source: `#detailLayer` uses `assets/detail/poses/...`; `#baseLayer` fallback is hidden.
  - Emoji-like production text: false.
- Asset audit:
  - Base PNG frames: 112.
  - Item layer PNG frames: 46.
  - Expressive fashion pose PNG frames: 144.
  - Detailed image-generation pose PNG frames: 144.
  - Detailed image-generation source sheets: 2.
  - Preview/reference/contact files: 17 previews + 2 references.
  - Production PNG validation errors: 0.
  - Detailed PNG validation errors: 0.

## Checklist

- [x] DISCOVER: read required guidance files and inspect `plans/onboarding`.
- [x] PLAN: write implementation plan and this checklist.
- [x] IMPLEMENT: generate image references.
- [x] IMPLEMENT: generate aligned production assets.
- [x] IMPLEMENT: generate Nala-style expressive poses for each fashion set.
- [x] IMPLEMENT: extract detailed image-generation expressive pose sprites and use them as preset preview.
- [x] IMPLEMENT: build static `onboarding.html` showcase.
- [x] VALIDATE: capture desktop/mobile/reduced-motion screenshots and run DOM/image checks.
- [x] LOG: update this checklist and `TASKS.md`.

## Triage Log

- P1 fixed: hidden expression layer in non-idle expressive poses had no `src` and was flagged by the browser audit as a broken image. Added a transparent placeholder source for inactive layers and reran the screenshot/audit set.
- P1 fixed: the first showcase used deterministic Pillow placeholder sprites as the primary character even though detailed image-generation references existed. Generated detailed fashion expressive sheets, extracted them into transparent `96x128` frames, and updated the showcase preset preview to use `assets/detail/poses/...`.
- No deferred P3/P4 findings from this task.

## Status

- Done on 2026-07-04.
