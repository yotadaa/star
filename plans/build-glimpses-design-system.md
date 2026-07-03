
Melihat implementasi section **"Build Glimpses"** ini dibanding token & komponen yang sudah kita tetapkan, ada beberapa gap. Saya breakdown per elemen:

## 1. Background section — belum konsisten dengan skema warna
**Kondisi sekarang**: hijau gelap solid flat, terpotong tegas dari hero mountain scene di atasnya.
**Masalah**: tidak ada di token manapun (`--dusk-top/mid/warm`, dll) — ini warna baru yang tidak tercatat.
**Perbaikan**: gunakan gradient turunan dari `--dusk-top → --dusk-mid` (atau `--olive-dark` kalau memang mau hijau gelap, tapi harus dari token yang sudah ada, bukan hijau baru). Transisi dari scene mountain harus smooth, bukan cut tegas — beri gradient blend di ujung atas section.

## 2. Eyebrow label "// BUILD GLIMPSES" — font salah
**Kondisi sekarang**: terlihat pakai font sans biasa.
**Aturan token**: label/eyebrow harus pakai **Silkscreen** (pixel font asli), sama seperti "// SAVE FILE" di About dan "// QUEST BOARD" di Projects.
**Perbaikan**: pastikan class `font-silkscreen` diterapkan konsisten di semua eyebrow label lintas halaman — ini section satu-satunya yang kelihatan miss.

## 3. Card carousel (browser mockup) — melanggar aturan shadow & border
**Kondisi sekarang**: rounded corner + soft blurred shadow (diffuse, mengambang).
**Aturan design-system kita** (§ Quest Card / project card style): border **2px solid `var(--ink)`** + shadow **hard-offset `6px 6px 0 var(--ink)`**, bukan shadow blur lembut.
**Perbaikan**: ganti card frame carousel jadi border tegas + hard shadow — ini yang paling mencolok bedanya, section lain (Projects, Quest card) sudah benar pakai hard-shadow, tapi carousel ini masih "shadow generik".

## 4. Tag "RESEARCH WEB" pada card aktif → jadikan RarityTag
**Kondisi sekarang**: teks oranye kecil polos, tidak ada shape/badge.
**Perbaikan**: pakai komponen `RarityTag` yang sudah dibuat (badge sudut-terpotong, border sesuai warna kategori — mis. RESEARCH = `--olive`, PERSONAL = `--terracotta`, dst). Ini juga menyamakan visual dengan tag tier di Projects (`TIER S · AI TOOLING`) yang formatnya mirip tapi beda styling.

## 5. Navigasi dot indicator — tidak pixel-style
**Kondisi sekarang**: dot bulat polos + pill oranye untuk active state — standar carousel generik.
**Perbaikan**: ganti jadi kotak kecil (square, bukan circle) sesuai bahasa "node" yang sudah dipakai di Journey Log timeline (`--gold` kotak untuk active/current). Ini juga selaras dengan komponen `CurrentMarker` yang sudah kita buat — pattern "kotak = posisi sekarang" bisa dipakai ulang di sini.

## 6. Tombol prev/next (‹ ›) — tidak match PixelButton
**Kondisi sekarang**: circle button soft, tanpa border tegas/shadow offset.
**Perbaikan**: pakai `PixelButton` yang sudah dibuat — border 2px + press-state saat diklik. Saat ini tombol carousel terlihat "polos" dibanding tombol lain di situs (CTA hero, filter Projects) yang sudah pixel-style.

## 7. HUD badge row ("GITHUB — 57 REPO PUBLIK" dst) — kontras rendah
**Kondisi sekarang**: pill gelap di atas background gelap (dark-on-dark), border tipis nyaris tak terlihat.
**Perbaikan**: ini persis kandidat komponen `HudStatusStrip`/`HudChip` yang sudah kita spesifikasikan (§1.1 report) — pastikan pakai background `--parchment` atau minimal border `--gold` supaya kebaca di atas dark section, bukan border abu-abu gelap seperti sekarang.

## 8. Card non-aktif (kiri/kanan, terpotong) — belum ada state jelas
**Kondisi sekarang**: hanya dipotong/dim tanpa treatment lain.
**Perbaikan**: opsional tapi selaras gamifikasi — beri sedikit desaturate/opacity turun lebih jelas untuk menegaskan "bukan yang sedang dipilih", dan saat card tengah berganti (klik dot/panah), terapkan animasi seperti `UnlockCard` (scale-up + border flash) supaya perpindahan slide terasa seperti "membuka item baru", bukan slide statis.

---

### Ringkas — prioritas perbaikan
| Prioritas | Item |
|---|---|
| Tinggi | #3 (card shadow/border), #6 (tombol prev/next), #7 (HUD badge kontras) |
| Sedang | #4 (RarityTag pada tag kategori), #5 (dot indicator jadi kotak) |
| Rendah/opsional | #1 (gradient transisi bg), #8 (state non-aktif + unlock animation) |

Section ini sebenarnya paling "keluar jalur" dari design system kita dibanding section lain di screenshot sebelumnya — kemungkinan besar carousel ini dibangun sebelum token/komponen gamifikasi difinalisasi. Mau saya siapkan versi kode React-nya (mengganti carousel ini pakai `PixelButton`, `RarityTag`, `HudStatusStrip` yang sudah ada)?