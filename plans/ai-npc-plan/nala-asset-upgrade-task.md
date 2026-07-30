# Task: Fase 13 - Nala Pixel Asset Upgrade

- Sumber spesifikasi: `plans/ai-npc-plan/implementation-plan.md` §2.2, §2.3, §3, §8, §12; `PRODUCT.md` Brand Personality & Anti-references.
- Halaman/letak persis: `plans/ai-npc-plan/nala-mockup.html`, seluruh potret Nala pada FAB, panel, message bubble, dan sprite sheet.
- Elemen & struktur: enam ekspresi/pose Nala (`idle`, `thinking`, `happy`, `confused`, `greeting`, `pointing`) diganti dari SVG inline menjadi PNG pixel-art transparan reusable di `plans/ai-npc-plan/assets/`.
- Dependency baru dibutuhkan?: TIDAK.
- Token warna baru dibutuhkan?: TIDAK untuk CSS mockup; aset bitmap mengikuti palet visual Nala dari token yang sudah ada.
- Butuh konfirmasi data?: TIDAK; user meminta langsung peningkatan aset dari SVG yang sudah ada.
- Acceptance criteria:
  1. Enam aset `nala-*-pixel.png` tersedia, transparan, dan pose/state sesuai SVG asal.
  2. `nala-mockup.html` tidak lagi menyematkan SVG Nala inline dan memakai aset PNG reusable.
  3. Mockup desktop dan mobile dapat dirender tanpa broken image, overflow horizontal, dependency baru, emoji produksi baru, atau perubahan backend.
  4. Screenshot evidence tersedia untuk source SVG, aset final, mockup desktop, mockup mobile, dan reduced-motion.
- Guardrail relevan: `PRODUCT.md` anti emoji-based gamification, anti generic glow/glass; `design-system.md` §5 press state, §8 toast coordination, §11 reduced-motion/focus-visible; `AGENTS.md` §1 larangan dependency baru dan §5 visual evidence.
- Screenshot evidence:
  - Source SVG check: `validation/ai-npc-plan/svg-source/mockup-current-sprites.png`
  - Final asset sheet: `plans/ai-npc-plan/assets/nala-pixel-contact-sheet.png`
  - Final mockup desktop/mobile/reduced-motion/focus: `validation/ai-npc-plan/final/`
- Temuan triase:
  - P2 fixed: FAB/chip/button focus-visible ring ditambahkan sebelum final screenshot.
  - P2 fixed: mobile collapsed mockup label/coord-note disembunyikan agar FAB dan toast tidak overlap.
- Status: done.
