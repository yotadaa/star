# Execution Checklist — Hero Entities yang Dapat Disentuh

**Status:** validated
**Plan:** `plans/hero-entity-implementation-plan.md`

## Discovery and decision record

- [x] Seluruh markdown root dibaca: `AGENTS.md`, `PRODUCT.md`, `design-system.md`, `report.md`, `TASKS.md`, `README.md`, `dev-history.md`, dan `gamification-system-overview.md`.
- [x] `plans/hero-entity.md` dibaca kembali sebelum checklist dibuat.
- [x] Implementasi saat ini di Home, SiteProvider, ParallaxScene, CSS, dan package manifest diinventarisasi.
- [x] Override pemilik dicatat: tanpa watchtower; sentuh → spark → entity kabur.
- [x] Aset yang dikecualikan dicatat: watchtower, projectile, crosshair, HUD/score assets.
- [x] Tidak ada dependency baru atau token CSS baru direncanakan.

## Sprite resource gate

- [x] Generate dan inspeksi `butterfly-terracotta` dengan 4 pose.
- [x] Generate dan inspeksi `butterfly-moss` dengan 4 pose.
- [x] Generate dan inspeksi `sparrow` dengan 4 pose.
- [x] Generate dan inspeksi `migration-v` dengan 4 pose.
- [x] Generate dan inspeksi `bat` dengan 4 pose.
- [x] Generate dan inspeksi `firefly` dengan 4 pose.
- [x] Chroma key dihapus; alpha dan background hijau tidak tersisa di runtime assets.
- [x] Semua sheet dikemas kembali menjadi satu strip horizontal 4 frame WebP yang konsisten.
- [x] Dimensi, ukuran file, transparansi, dan frame order diverifikasi untuk semua resource.

## Implementation gate

- [x] `components/HeroEntityLayer.jsx` membatasi jumlah encounter dan membersihkan timeout/observer/animation saat unmount.
- [x] Scheduler hanya aktif saat Hero ada di viewport dan pause saat tidak terlihat.
- [x] Mapping phase/entity dan varians pasangan/rare sesuai plan.
- [x] Tidak ada score, combo, toast, projectile, watchtower, atau hit state kekerasan.
- [x] Pointer/touch/Enter/Space menggunakan handler tunggal yang idempoten.
- [x] Spark dekoratif muncul pada sentuhan dan entity pindah keluar layar pada motion normal.
- [x] Empty space Hero tetap dapat menerima scroll/pointer; layer tidak memblokir CTA.
- [x] Coarse-pointer target minimal 48 × 48 px tanpa memperbesar gambar pixel.
- [x] Fokus keyboard terlihat dan label tombol spesifik untuk jenis entity.
- [x] Reduced motion menonaktifkan loop flight/flap dan memakai state interaksi statis aman.
- [x] `app/page.js` memasang layer di atas canvas namun di bawah Hero copy.
- [x] `app/globals.css` hanya memakai token yang ada, tanpa literal hex baru pada feature ini.

## Validation gate

- [x] `npm run build` berhasil.
- [x] Desktop 1280px, fase pagi: screenshot default dan setelah interaksi.
- [x] Desktop 1280px, fase siang: screenshot pasangan pipit.
- [x] Desktop 1280px, fase sore: screenshot formasi V.
- [x] Desktop 1280px, fase malam: screenshot kelelawar dan kunang-kunang.
- [x] Mobile 375px: screenshot default serta sentuh; tidak ada horizontal overflow dan CTA tidak tertutup.
- [x] Keyboard: Tab fokus jelas; Enter dan Space memberi satu flee/spark, tanpa aksi ganda.
- [x] Reduced motion: screenshot dan inspeksi membuktikan tidak ada loop flight/flap.
- [x] Screenshot final diperiksa visual terhadap palet, layering, clipping, dan readability.
- [x] Tidak ada dependency yang berubah pada `package.json`.
- [x] Tidak ada P0/P1/P2 terbuka. P3/P4, bila ada, dicatat terpisah.

## Log completion

- [x] Bukti ditulis ke `validation/hero-entities-2026-07-30/`.
- [x] Checklist diperbarui dengan hasil aktual.
- [x] Log keputusan `AGENTS.md` dan `TASKS.md` diperbarui sesuai hasil validasi.
