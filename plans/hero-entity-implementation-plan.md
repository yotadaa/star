# Implementation Plan — Hero Entities yang Dapat Disentuh

**Status:** validated
**Tanggal:** 2026-07-30
**Sumber:** `plans/hero-entity.md` §§2, 4, 5, 7; `PRODUCT.md`; `design-system.md`; `report.md`; implementasi saat ini di `app/page.js`, `components/ParallaxScene.jsx`, `components/site/SiteProvider.jsx`, dan `app/globals.css`.

## 1. Keputusan ruang lingkup

Dokumen sumber semula mendeskripsikan menara pandang, proyektil, tembakan, skor, HUD, dan toast. Arahan pemilik proyek yang lebih baru menggantikannya sebagai berikut:

| Area dokumen sumber | Keputusan implementasi | Alasan / bukti |
| --- | --- | --- |
| Menara pandang | **Tidak diimplementasikan.** Tidak ada aset, CSS, atau markup watchtower. | Arahan eksplisit: “kecualikan watch tower”. |
| Tembak, proyektil, target/crosshair | **Tidak diimplementasikan.** | Interaksi diganti menjadi sentuhan yang ramah terhadap satwa. |
| Klik/tap entity | Sentuhan, klik, Enter, atau Space menghasilkan spark kecil di lokasi entity; entity lalu menjauh ke arah tepi layar dan dibuang dari DOM. | Arahan eksplisit: “will spark on touch … entity akan menjauh kabur seperti binatang yang kabur”. |
| Skor, combo, milestone, HUD, toast | **Tidak diimplementasikan.** | Nilai skor dalam dokumen adalah data permainan fiktif dan tidak dibutuhkan oleh interaksi baru. |
| Fase waktu | **Memakai sistem yang sudah ada** (`morning`, `noon`, `sunset`, `night`) dari `SiteProvider`; tidak membuat toggle atau token langit kedua. | `SiteProvider` sudah menyimpan fase manual; `ParallaxScene` sudah merender empat tema. |

Tidak ada dependency baru, audio, emoji gamifikasi, gradient/glow UI baru, data fiktif, atau perubahan di luar Hero.

## 2. Tujuan dan acceptance criteria

Lapisan entity akan menjadi detail ambient opsional di atas kanvas Hero: satu grup entity aktif pada satu waktu, mudah disentuh, tidak menghalangi CTA atau scroll, dan tetap tenang ketika reduced motion aktif.

1. Tiap fase memakai entity yang tepat: kupu-kupu pagi, pipit siang, formasi migrasi sore, serta kelelawar atau kunang-kunang langka malam.
2. Kedua varian kupu-kupu tersedia dan pemilihannya acak; pipit kadang memakai formasi pasangan; kunang-kunang muncul dengan peluang 1/6 pada fase malam.
3. Semua **enam** aset entity mempunyai empat frame kepak/gerak yang berbeda (`> 3`), dikemas sebagai satu sprite sheet transparan dan di-animate dengan CSS `steps(4)`.
4. Interaksi pointer, touch, dan keyboard memicu satu spark dekoratif dan flight/flee keluar layar—tanpa efek kekerasan, tembakan, skor, atau toast.
5. Area kosong Hero tetap tidak menangkap pointer event; target touch minimum 48 × 48 px; CTA dan salinan Hero selalu berada di atas layer entity.
6. `prefers-reduced-motion: reduce` menghentikan spawn/flight/sprite loop. Entity statis tetap dapat difokuskan dan disentuh; aksinya hanya memberi state akhir statis/spark singkat, lalu digantikan tanpa lintasan kabur.
7. Resource hanya mulai dijadwalkan ketika Hero terlihat, membatalkan timer/animasi saat keluar viewport atau unmount, dan tidak menambah render loop React/Three.js per frame.

## 3. Resource manifest yang akan dihasilkan

Lokasi runtime: `public/assets/hero-entities/`. Semua sprite akhir transparan WebP, satu baris empat frame dengan ukuran target `1024 × 256` (empat sel 256 × 256). Saat ditampilkan, CSS akan menurunkan ukurannya dan memakai `background-size: 400% 100%` dengan tiga perpindahan posisi untuk empat cell; browser cukup meminta satu file per entity.

| ID / file runtime | Fase | Frame 0 → 3 | Penggunaan visual | Ukuran tampilan target |
| --- | --- | --- | --- | --- |
| `butterfly-terracotta.webp` | morning | sayap terbuka → tiga-perempat → rapat → tiga-perempat | Varian A | 52 × 52 px |
| `butterfly-moss.webp` | morning | sayap terbuka → tiga-perempat → rapat → tiga-perempat | Varian B | 52 × 52 px |
| `sparrow.webp` | noon | sayap atas → tengah → bawah → tengah | Satu pipit atau sepasang | 42 × 42 px per pipit |
| `migration-v.webp` | sunset | kepak serempak atas → tengah → bawah → tengah | Satu grup V, bukan lima tombol terpisah | 136 × 58 px |
| `bat.webp` | night | sayap terangkat → setengah → terbuka rendah → setengah | Entity malam umum | 54 × 44 px |
| `firefly.webp` | night (rare) | sayap atas → tengah → bawah → tengah; abdomen terang tetap datar | Entity malam langka, tanpa badge/HUD | 58 × 58 px |

Detail prompt, palet yang diizinkan, prosedur chroma key, dan kriteria inspeksi ada di `plans/hero-entity-resource-manifest.md`. Tidak ada sprite watchtower, crosshair, proyektil, atau “hit” yang dibuat.

## 4. Desain teknis

### 4.1 Komponen dan ownership state

Tambahkan `components/HeroEntityLayer.jsx` sebagai client component yang menerima `phase` dari halaman Home.

```text
app/page.js
  Hero
    hero-canvas (R3F ParallaxScene, z-index 1)
    HeroEntityLayer (DOM, z-index 4, pointer events hanya pada button entity)
    HeroGlassPanel (copy/CTA, z-index 10)
    scroll-cue (z-index 10)
```

Komponen menyimpan paling banyak satu `activeEncounter` (sebuah entity tunggal atau satu grup V/pasangan) dan daftar spark yang sangat kecil. `IntersectionObserver` pada section Hero menentukan apakah scheduler boleh berjalan. Timer disimpan dalam ref dan selalu dibersihkan. Flight normal sepenuhnya memakai transform CSS; tidak ada `setState` per frame dan tidak ada event listener global untuk animasi.

Saat interaksi, posisi target dibaca sekali dari `getBoundingClientRect()`. Elemen active diberi status `fleeing` yang mengubah transform dengan transisi singkat ke luar sisi terdekat (sedikit naik/turun), sementara spark dirender pada koordinat tersebut. Setelah transisi selesai encounter dibuang dan spawn berikutnya dijadwalkan. Ini mempertahankan GPU-composited `transform`/`opacity`, bukan `left`/`top` per-frame.

### 4.2 Matriks spawn dan gerak

| Fase | Encounter | Interval setelah selesai | Lintasan normal | Flee setelah sentuh |
| --- | --- | --- | --- | --- |
| morning | satu kupu-kupu, varian A/B acak | 2.4–4.0 dtk | pelan, lintasan S lebar | 420 ms ke arah tepi terdekat, naik/turun 8–14vh |
| noon | satu pipit atau pasangan pipit | 2.0–3.4 dtk | cepat dan hampir lurus | 360 ms menjauh horizontal dengan drift vertikal kecil |
| sunset | satu wrapper formasi V | 3.2–5.0 dtk | tinggi dan sedang | 460 ms keluar ke arah flight saat ini |
| night | kelelawar (5/6) atau kunang-kunang (1/6) | 2.4–4.8 dtk | kelelawar bersegmen kecil; kunang-kunang lambat | 400 ms (bat) / 480 ms (firefly) menuju tepi |

Nilai ini adalah timing teknis, bukan skor/data produk. Randomness hanya memvariasikan posisi dan pilihan asset dalam rentang langit atas yang dibatasi, sehingga entity tidak muncul di pusat salinan Hero, di area gunung/foreground, atau di bawah navbar/scroll cue. Pada layar ≤640px, scheduler mengunci lane ke 10% dari tinggi Hero dan mengurangi amplitudo vertikal menjadi 30% agar jalurnya tetap di langit tanpa menutupi kicker, judul, atau CTA.

### 4.3 Interaksi dan aksesibilitas

- Root layer `pointer-events: none`; hanya `<button type="button" class="hero-entity-target">` yang `pointer-events: auto`.
- Tombol memakai label spesifik, contohnya “Sentuh kupu-kupu; ia akan terbang menjauh”. Pasangan pipit dan formasi V adalah satu tombol agar urutan tab singkat dan target mobile luas.
- `onClick`, `onPointerUp`, `onKeyDown` untuk Enter/Space memakai satu handler idempoten; state `fleeing` mencegah spark ganda.
- Spark adalah `<span aria-hidden="true">` murni dekoratif, dibentuk dari CSS pseudo-elements dengan token yang ada; tidak memakai emoji atau aset tambahan.
- `:focus-visible` memakai outline token global dan shadow pixel dari token yang sama seperti tombol existing. Target minimum 48 px pada pointer coarse.
- Saat reduced motion, scheduler hanya menampilkan satu target statis pada lokasi aman. Setelah interaksi, spark tampil statis singkat dan target diganti tanpa animasi perjalanan; `aria-label` tetap menjelaskan aksi secara netral.

### 4.4 CSS dan stacking

Tambahkan blok `HERO ENTITIES` pada `app/globals.css`:

- `.hero-entity-layer`, `.hero-entity-encounter`, `.hero-entity-target`, `.hero-entity-sprite`, `.hero-entity-spark`, dan variasi `data-entity`/`data-phase`.
- Sprite dikendalikan oleh satu `@keyframes hero-entity-flap` dengan `steps(4, end)` dan durasi khusus per jenis. Flight normal memakai transform CSS pada wrapper, bukan `background-position` per JavaScript frame.
- `.is-fleeing` mematikan flight normal, memutar transisi satu kali untuk keluar layar, lalu React menghapus node setelah `transitionend` dengan fallback timeout.
- Aturan responsive menurunkan ukuran asset dan mengunci zona aman kiri/kanan agar tidak bertabrakan dengan copy; `@media (pointer: coarse)` memperbesar hit target tanpa membesarkan pixel sprite.
- Aturan reduced motion eksplisit menghapus looping flight dan flap, terlepas dari reset global yang sudah ada.
- Semua warna CSS menggunakan variable eksisting (`--ink`, `--cream`, `--gold`, `--aurora`, `--coral`, `--moss-dark`, `--sky-*`); tidak ada hex literal baru.

## 5. Urutan implementasi

1. Menyimpan plan, resource manifest, dan checklist ini sebelum menyentuh kode.
2. Membuat enam sprite sheet berdasarkan prompt resource manifest, kemudian memeriksa visualnya.
3. Menghilangkan background chroma-key, memotong dan mengemas empat sel yang konsisten menjadi WebP transparan; cek alpha, dimensi, frame count, dan ukuran file.
4. Membuat `HeroEntityLayer.jsx` dengan scheduler yang lifecycle-safe dan data config lokal yang tidak memuat poin/achievement buatan.
5. Memasang layer di `app/page.js` dan menambahkan CSS scoped pada `app/globals.css`.
6. Menjalankan build lalu browser runtime di desktop, mobile, setiap fase waktu, interaksi, keyboard focus, dan reduced motion.
7. Menyimpan screenshot di `validation/hero-entities-2026-07-30/`, meninjau visualnya, memperbaiki temuan P0–P2 bila ada, lalu memperbarui checklist dan log keputusan `AGENTS.md`.

## 6. Risiko dan mitigasi

| Risiko | Mitigasi |
| --- | --- |
| Hasil generator tidak membuat cell frame cukup seragam | Hanya menerima sheet setelah inspeksi. Repack empat quadrant menjadi strip seragam; jika pose tidak terbaca, regenerate aset tersebut, bukan menebak dengan CSS. |
| Tambahan DOM mengganggu hero Three.js yang sudah relatif berat | Maksimum satu encounter, scheduler pause di luar viewport, transform/opacity only, tanpa RAF/React updates per gerak dan tanpa asset network tambahan saat idle. |
| Entity menutupi CTA atau gagal disentuh di mobile | Zona spawn dibatasi, z-index copy lebih tinggi, button memiliki hit-box coarse 48px, dan validasi screenshot 375px. |
| Motion ambient mengganggu pengguna | `prefers-reduced-motion` dirancang sebagai state statis sebelum implementasi dan diuji lewat emulasi browser. |
| Asset generated memunculkan warna/gaya asing | Prompt dibatasi ke token palet eksisting dan inspeksi manual menghapus/reject output yang memakai gradient, bayangan lunak, atau anatomi realistis. |

## 7. Validation gate

Implementasi hanya selesai bila checklist `plans/hero-entity-execution-checklist.md` memiliki seluruh gate P0–P2 yang relevan tercentang, `npm run build` berhasil, dan bukti screenshot final ada. Perubahan tidak akan mengubah dependency atau melibatkan migrasi database.

## 8. Hasil eksekusi dan bukti

- Enam sheet runtime telah dibuat di `public/assets/hero-entities/`; setiap file adalah RGBA WebP `1024 × 256` dengan empat cell. Pemeriksaan alpha mencatat `0` pixel chroma hijau pada seluruh file.
- `HeroEntityLayer` terpasang di atas R3F canvas namun di bawah Hero copy. Tidak ada watchtower, crosshair, projectile, HUD skor, atau toast yang ditambahkan.
- Validasi runtime memakai motion species-specific: `hero-entity-butterfly-flight`, `hero-entity-sparrow-flight`, `hero-entity-migration-flight`, `hero-entity-bat-flight`, dan `hero-entity-firefly-flight`. Mobile memakai sky lane aman dan amplitudo vertikal 30%.
- Bukti visual final: `validation/hero-entities-2026-07-30/desktop-morning.png`, `desktop-noon-pair.png`, `desktop-sunset.png`, `desktop-night-bat.png`, `desktop-night-firefly.png`, `desktop-reduced-motion.png`, `mobile-morning.png`, dan `mobile-interaction.png`.
- `npm run build` selesai sukses pada 2026-07-30. First Load JS Home tetap 130 kB; tidak ada dependency package baru.
