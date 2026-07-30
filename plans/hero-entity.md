# Report: Hero Add-On — Siklus Waktu + "Menara Pandang" Shooting Gallery

Addendum khusus untuk **Home / Hero section**, di atas fondasi yang sudah ada
(parallax layer mouse-interacted, sprite berjalan, firefly three.js, glass-window
kabin). Fokus dokumen ini: dua ide baru yang diminta —
(1) hero bisa berganti **pagi/siang/sore/malam**, dan
(2) **menara pandang (watchtower)** di sisi kanan yang bisa "menembak" entitas
terbang (burung/kelelawar) saat diklik. Mockup kerja ada di `mockup.html`
(extend dari `index.html` asli, tidak mengubah section lain).

> Status: ini **spesifikasi + prototipe fungsional**, bukan versi final siap-produksi.
> Semua warna baru & keputusan desain yang belum ada di token asli ditandai
> `[ASUMSI, MOHON DIKONFIRMASI]`, sesuai aturan brief.

---

## 1. Kenapa ide ini cocok dengan tema situs

Situs ini sudah membingkai diri sebagai "game/quest" (SAVE FILE, Quest Log,
Journey Log, dsb) tapi — seperti dicatat di `report.md` sebelumnya — mekaniknya
masih murni kosmetik. Ide "hero jadi mini-game" ini pas karena:

- **Watchtower** = elemen environment yang natural untuk dunia pixel-pastoral
  yang sudah ada (gunung, hutan, sprite karakter berjalan) — bukan elemen asing.
- **Menembak entitas terbang** = satu-satunya bagian situs yang benar-benar
  *interaktif secara langsung* (bukan hover/scroll), cocok jadi "hook" pertama
  yang dilihat pengunjung begitu halaman terbuka.
- **Siklus waktu** memberi alasan naratif untuk variasi visual (kelelawar malam
  vs burung siang) sekaligus membuat hero terasa "hidup" tiap kali dikunjungi
  ulang (auto-sync ke jam lokal browser), tanpa menambah beban cerita.

Prinsip yang dipegang: ini tetap **easter egg opsional**, bukan gate konten.
Pengunjung yang scroll langsung tanpa menyadari game ini tetap dapat semua
informasi CV secara normal.

---

## 2. Sistem Siklus Waktu (Time-of-Day)

### 2.1 4 State
| State | Trigger jam lokal (auto) | Nuansa langit | Entitas terbang |
|---|---|---|---|
| `time-pagi` | 05:00–10:59 | Biru lembut → peach, matahari rendah di kiri | Burung |
| `time-siang` | 11:00–14:59 | Biru cerah, matahari tinggi & terang | Burung |
| `time-sore` | 15:00–17:59 | Gradient dusk yang **sudah ada** di kode asli (ungu→oranye) | Burung |
| `time-malam` | 18:00–04:59 | Navy gelap, bintang penuh, bulan | Kelelawar |

- **Auto-detect**: `new Date().getHours()` saat load menentukan state awal —
  jadi hero pengunjung siang hari akan terlihat "siang" tanpa aksi apa pun.
- **Toggle manual**: pill kecil `PAGI / SIANG / SORE / MALAM` di atas hero
  (posisi: di bawah navbar pill, tengah) untuk demo/preview dan agar pengunjung
  iseng bisa "main-main" — ini juga jadi ajakan implisit untuk coba interaksi.
- **Transisi**: `background` di-crossfade 1.2–1.4s (bukan cut instan), bintang
  fade in/out mengikuti state, posisi & warna matahari/bulan (`.sun-moon`)
  ikut bertransisi horizontal (matahari "bergerak" pagi→sore secara simbolik).
- Gradient `time-sore` **memakai token dusk yang sudah ada** (tidak ada hex baru).
  Gradient `pagi`, `siang`, `malam` = **`[ASUMSI, MOHON DIKONFIRMASI]`** — warna
  di mockup dipilih agar tetap dalam keluarga warna hangat/pastel situs, tapi
  belum resmi ada di token; perlu dikonfirmasi sebelum dianggap final (lihat §6).

### 2.2 Kenapa auto + manual, bukan salah satu saja
Auto-detect membuat pengalaman terasa personal ("situs tahu ini sudah malam"),
tapi jika hanya auto, pengunjung yang browsing siang hari tidak akan pernah
melihat versi malam yang justru versi paling dramatis (bintang + kelelawar).
Toggle manual menyelesaikan ini tanpa memaksa autoplay siklus otomatis yang
bisa mengganggu pembacaan teks (hero berubah sendiri saat dibaca = buruk).

---

## 3. Menara Pandang (Watchtower)

- **Posisi**: kanan hero, `right: 4%`, dari lantai (`bottom:0`) ke atas — sejajar
  level visual dengan pohon/hills di layer sekitar, memakai `data-depth="0.18"`
  agar ikut parallax mouse yang sudah ada (bergerak sedikit lebih dekat ke
  viewer dibanding hills, lebih jauh dibanding sprite karakter foreground).
- **Konstruksi visual**: 100% CSS (2 kaki penyangga bersilang, 2 palang brace,
  kabin kotak dengan jendela menyala `--gold`, atap segitiga, bendera kecil
  berkibar, siluet penjaga kecil di kabin) — pixel-flat, konsisten dengan gaya
  pohon (`.tree`) dan sprite (`.sprite`) yang sudah dibangun murni dari div+CSS
  di kode asli. **Tidak perlu aset gambar untuk versi dasar ini.**
- **Fungsi naratif**: sumber "tembakan" — proyektil kecil (titik `--gold`
  bercahaya) melesat dari jendela kabin menuju titik klik saat entitas
  ditembak, memberi kesan tembakan datang dari menara, bukan dari kursor.
- **Kenapa statis (tidak ikut goyang seperti pohon)**: struktur buatan manusia
  di dunia pixel biasanya digambar lebih kaku dibanding elemen organik (pohon,
  rumput) — bendera saja yang berkibar, supaya ada kontras "hidup vs buatan".

---

## 4. Entitas Terbang & Mekanik "Tembak"

### 4.1 Entitas berbeda per waktu — bukan sekadar burung vs kelelawar

Ide pengembangan: tiap 4 state waktu (§2.1) punya **entitas khasnya sendiri**,
bukan cuma "burung siang hari, kelelawar malam hari" yang biner. Ini membuat
toggle waktu punya alasan lebih kuat untuk dicoba semua state (tiap state =
"koleksi" visual berbeda), dan selaras dengan bahasa rarity/tier yang sudah
dipakai di `design-system.md` §1 (Experience card, Achievement medal).

| Waktu | Entitas | Perilaku terbang | Nilai skor & alasan |
|---|---|---|---|
| **Pagi** | Kupu-kupu (2 varian warna acak) | Lintasan pelan, banyak "meliuk" naik-turun (amplitudo sinus lebih besar, kecepatan lebih lambat) — kesan baru bangun, santai | 1 poin — paling umum/mudah, muncul paling sering |
| **Siang** | Burung kecil (pipit/gereja) | Lintasan cepat & lurus, amplitudo kecil, kadang muncul **2 sekaligus** membentuk formasi renggang | 1 poin, tapi **bonus +1** jika kedua burung dalam satu formasi kena dalam <1.5 detik ("combo") |
| **Sore** | Burung migrasi formasi-V (3–5 unit bergerak bersama sebagai satu grup) | Bergerak sebagai satu unit (1 hit-area gabungan atau leader+follower), melintas lebih tinggi di langit, laju sedang | 3 poin — menembak satu formasi sekaligus terasa lebih "berharga", eventnya juga lebih jarang muncul |
| **Malam** | Kelelawar (kadang diselingi kunang-kunang raksasa langka) | Kelelawar: lintasan zig-zag patah-patah (bukan sinus halus — lebih erratic, gerak "lompat" tiap ~400ms). Kunang-kunang: melayang pelan, jarang muncul | Kelelawar 2 poin (lebih sulit dibidik karena erratic); kunang-kunang 5 poin — ditandai `RARE` di HUD, memakai warna `--gold` berpendar lebih kuat sebagai isyarat "langka" |

- **Konsistensi teknis**: semua entitas tetap dibangun dari elemen `.wing`/
  bentuk serupa (clip-path berbeda per jenis) + animasi kepak/kepak-sayap
  dengan `wingflap` yang durasinya disesuaikan (kupu-kupu lebih lambat ~0.5s,
  burung/kelelawar tetap ~0.3s) — bukan sistem sprite terpisah dari nol,
  supaya biaya implementasi tetap rendah.
- **Formasi-V (sore)** cukup dibangun sebagai 1 wrapper berisi 3–5 child
  `.quarry` dengan offset posisi relatif tetap; hit-area bisa disederhanakan
  jadi 1 target gabungan (klik di mana saja dalam wrapper = kena semua) agar
  tidak terlalu sulit di mobile, atau dibuat per-individu jika ingin lebih
  menantang — pilihan ini **perlu dikonfirmasi** sebelum implementasi final.
- **Rarity kunang-kunang malam** sengaja jarang (mis. 1 dari 6 kemunculan malam)
  supaya related ke pola "locked/rare slot" yang sudah ada di §1 dan §10
  `design-system.md` — memberi insentif kecil untuk mengunjungi hero saat
  malam/toggle ke malam, bukan cuma dekorasi acak.
- Muncul dari sisi kiri **atau** kanan layar (acak), lintasan tiap jenis punya
  kurva berbeda (lihat tabel), lalu keluar layar dan hilang — entitas baru
  muncul setelah jeda 0.9–2.3 detik (kecuali kunang-kunang, jeda lebih panjang
  karena statusnya langka).
- Ukuran hit-area diperbesar khusus di device `pointer:coarse` (touch) agar
  tetap mudah di-tap di mobile tanpa mengubah ukuran visual sprite — berlaku
  untuk semua jenis entitas, termasuk formasi-V.
- **Catatan konsistensi tema**: kupu-kupu & burung kecil sengaja **tidak**
  diberi konotasi "diburu" yang keras (tidak ada darah/hancur), animasi "kena"
  tetap sama untuk semua jenis — jatuh halus + fade + partikel gold, seperti
  "ditandai/dikoleksi", bukan disakiti. Ini penting terutama untuk kupu-kupu
  yang di banyak budaya dianggap elemen lembut/estetik, bukan target buruan.

### 4.2 Alur klik → tembak
1. Pengunjung klik/tap entitas yang sedang terbang.
2. Titik tembak dihitung dari posisi entitas saat itu; proyektil kecil dari
   jendela menara meluncur ke titik itu (~160ms, garis lurus via transition
   `left/top`, bukan animasi berat).
3. Saat proyektil "kena", entitas dapat class `.hit` → animasi jatuh (`rotate`
   + `translateY` + fade, 550ms), lalu dilepas dari DOM.
4. Ledakan partikel kecil (6 titik menyebar radial, 380ms) muncul di titik
   kena — feedback visual instan, bukan sekadar entitas hilang begitu saja.
5. Skor bertambah **sesuai nilai entitas** (lihat tabel §4.1: 1/2/3/5 poin),
   ditampilkan di HUD chip kanan atas hero. Dua opsi tampilan skor:
   - **Sederhana**: satu angka total, `🎯 N POIN` (cukup untuk versi ringan).
   - **Detail**: total poin + hitungan per jenis kecil di bawahnya saat hover
     HUD (mis. "🦋×3 🐦×2 🦇×1"), untuk yang mau kesan "koleksi" lebih terasa —
     opsional, tandai sebagai fase lanjutan.
6. Milestone poin (bukan lagi hitungan tembakan mentah — mis. 10/30/60 poin)
   memicu **toast** singkat di pojok kanan-bawah — reuse pola toast dari
   `design-system.md` §8. Tambahan: toast khusus **saat kunang-kunang langka
   berhasil ditembak** ("✨ Langka! Kunang-kunang raksasa berhasil ditandai"),
   terpisah dari milestone angka, karena ini event "unlock" bukan sekadar
   akumulasi skor.

### 4.3 Kenapa tidak dibuat jadi "game sungguhan" (nyawa, game-over, dst.)
Sengaja **tanpa** sistem nyawa/skor tersimpan/leaderboard — ini murni
*ambient interactive detail*, bukan fitur inti portofolio. Menambah state
permanen (localStorage skor, dsb.) berisiko:
- Mengalihkan fokus dari tujuan utama halaman (menunjukkan kredibilitas & karya).
- Menambah kompleksitas tanpa manfaat CV yang jelas.
Skor di HUD sengaja **reset setiap reload** — cukup untuk sensasi "main-main
sebentar", tidak butuh persistensi.

---

## 5. Aksesibilitas & Guardrail

Mengikuti aturan FASE 3.3/5.3 yang sudah dipegang di `design-system.md`:

1. **`prefers-reduced-motion`**: entitas tidak diberi animasi terbang lintasan
   (muncul diam di satu titik, tetap bisa diklik), proyektil dilewati (hit
   langsung terdaftar tanpa animasi lintasan), ledakan partikel & jatuh entitas
   tetap boleh tampil karena durasinya singkat dan merupakan *hasil aksi user*
   bukan animasi ambient looping — tapi jika ingin lebih ketat, ini juga bisa
   dipotong jadi fade-out polos saja (opsional, tandai untuk dikonfirmasi).
2. **Tidak menghalangi konten**: seluruh elemen game (`sky-hunt-layer`,
   watchtower) diberi `aria-hidden="true"` karena murni dekoratif, tidak
   membawa informasi yang perlu dibaca screen reader. HUD skor pakai
   `aria-live="polite"` supaya tidak mengganggu tapi tetap terumumkan bila mau.
3. **Tidak memblokir scroll/baca**: layer entitas `pointer-events` hanya aktif
   di elemen entitas itu sendiri, bukan di seluruh hero — klik di area kosong
   hero tetap bisa dipakai untuk parallax/scroll seperti biasa.
4. **Kontras & ukuran tap touch**: watchtower & entitas tetap terlihat di
   breakpoint mobile (watchtower diperkecil & digeser, hit-area entitas
   diperbesar khusus touch) — lihat media query `pointer:coarse` di mockup.
5. **Tidak ada audio** ditambahkan (mengikuti larangan di `report.md` §8 —
   tidak menambah audio feedback tanpa toggle mute eksplisit).

---

## 6. Token Warna Baru yang Perlu Dikonfirmasi

Mengikuti aturan `design-system.md` (tidak boleh menambah hex tanpa konfirmasi),
berikut daftar yang dipakai di prototipe dan **belum resmi**:

| Kebutuhan | Nilai di mockup | Status |
|---|---|---|
| Gradient langit `pagi` | `#6f97b8 → #a7c4d4 → #f2d9b0 → #f7b169` | `[ASUMSI]` |
| Gradient langit `siang` | `#3f7fb0 → #6fa8cf → #bfe0ee → #eaf6f6` | `[ASUMSI]` |
| Gradient langit `malam` | `#0b0917 → #191233 → #241733 → #33234a` | `[ASUMSI]` |
| Warna bulan | `#fdfdfd → #c9d3e0` | `[ASUMSI]` |
| Siluet kelelawar | `#221727` | `[ASUMSI]` |
| Menara (atap, kabin, kaki) | remap dari `--olive-dark`, `--olive-deep`, `--terracotta-dark`, `--gold` | sudah ada, tidak baru |

`time-sore` sengaja memakai gradient dusk asli 1:1 tanpa perubahan, jadi state
ini sudah "aman" dipakai sebagai default tanpa menunggu konfirmasi warna baru.

---

## 7. Prompt Generasi Aset (opsional, jika ingin versi sprite lebih detail)

Versi di `mockup.html` **100% CSS/div**, tanpa aset gambar apa pun — ini
direkomendasikan sebagai baseline karena nol dependency & konsisten dengan
teknik pohon/sprite yang sudah ada. Namun jika ke depannya ingin upgrade ke
sprite bergambar (misalnya untuk detail bulu/animasi kepak yang lebih halus),
berikut prompt siap pakai untuk tiap aset. Semua prompt menjaga gaya **flat
pixel-game warm-pastoral** yang sudah jadi identitas situs — bukan pixel-art
8-bit generik, dan bukan realistis.

### 7.1 Sprite burung (siklus terbang, 3 frame)
```
Flat vector pixel-art sprite sheet of a small stylized bird in flight,
3-frame wing-flap cycle (wings up / mid / down), side profile, facing right.
Warm muted palette: terracotta body (#c9552f), cream belly (#fbeedd), ink
outline (#2c1e1a) 2px consistent stroke weight. Chunky flat shapes, no gradients,
no shading, no anti-aliasing softness — hard geometric edges like a cozy
indie game asset. Transparent background. Square canvas, bird occupies ~70%
of frame, consistent size across all 3 frames for easy CSS sprite-swap animation.
```

### 7.2a Sprite kupu-kupu (versi pagi, 2 varian warna, 3 frame)
```
Flat vector pixel-art sprite sheet of a small stylized butterfly, 3-frame
wing-flap cycle (wings open / half-closed / open), top-down or slight side
angle, symmetrical wings. Two color variants: variant A warm terracotta-gold
(#c9552f + #f0b23a spots), variant B soft olive-cream (#5c7a41 + #fbeedd
spots). Chunky flat shapes, consistent 2px ink outline (#2c1e1a), no
gradients, no realistic vein detail — simple geometric wing shapes, cozy
indie-game tone matching a golden-morning meadow scene. Transparent
background, square canvas, same scale across frames.
```

### 7.2b Sprite burung kecil siang hari (pipit, 3 frame, siap dipakai berpasangan)
```
Flat vector pixel-art sprite sheet of a tiny sparrow-like bird in flight,
3-frame wing-flap cycle, side profile facing right, compact rounded body.
Palette: warm cream body (#fbeedd), terracotta wing accent (#c9552f), ink
outline 2px (#2c1e1a). Flat shapes only, no gradients, bright and simple —
reads clearly at small size (~24px) since it may appear in pairs on screen
at once. Transparent background, square canvas, consistent scale.
```

### 7.2c Formasi burung migrasi (sore, kelompok V, single composite frame)
```
Flat vector pixel-art illustration of 4 small birds flying together in a
V-formation, side/three-quarter view, silhouette style against a warm dusk
sky. Single unified ink-outlined silhouette color (#2c1e1a) with a subtle
sunset-orange rim highlight (#e8734a) on the wing edges only, no gradients
inside the body fill. Flat, minimal detail — designed to read as one cohesive
group shape rather than 4 separate detailed birds. Transparent background,
wide horizontal canvas (formation is wider than tall).
```

### 7.2d Kunang-kunang raksasa (malam, entitas langka)
```
Flat vector pixel-art sprite of a single large stylized firefly / glowing
light-bug, side view, gently rounded body. Dark ink-purple body (#221727),
with a prominent warm gold glowing abdomen tip (#f0b23a) rendered as a solid
flat shape (the glow/blur halo will be added separately via CSS box-shadow,
so keep the sprite itself flat and crisp, no baked-in blur). Small simple
wings, 2px ink outline. Transparent background, square canvas, slightly
larger proportions than the bat sprite to read as a "rare/special" entity.
```

### 7.2 Sprite kelelawar (versi malam, 3 frame)
```
Flat vector pixel-art sprite sheet of a small stylized bat in flight,
3-frame wing-flap cycle, side profile, facing right. Dark muted purple-black
palette (#221727 body) with a single warm gold accent (#f0b23a) for the eye
only. Chunky flat shapes, hard ink outline 2px (#2c1e1a), no gradients, no
realistic bat anatomy — friendly/cute silhouette, not scary. Transparent
background. Same canvas size and bat scale as the companion bird sprite set,
for drop-in replacement in the same animation system.
```

### 7.3 Menara pandang (watchtower), versi ilustrasi detail
```
Flat vector illustration of a small wooden watchtower / lookout tower, cozy
indie-game art style, side view. Crossed wooden support legs (olive-brown
#22301a), small square cabin with a single glowing window (gold #f0b23a
warm light), triangular roof (#33461f), tiny fabric flag on top. Thick
consistent ink outline (#2c1e1a) 3px, flat color fills only, no gradients,
no photorealism, warm pastoral fantasy tone matching a golden-hour village
scene. Transparent background, vertical composition, tower occupies full
height of frame.
```

### 7.4 Ikon crosshair / bidikan (opsional custom cursor saat hover entitas)
```
Minimal flat pixel-style crosshair icon, thin gold (#f0b23a) circular ring
with 4 short tick marks (top/bottom/left/right), small solid center dot,
2px consistent stroke, no gradient, no glow blur baked into the image (glow
will be added via CSS drop-shadow separately). Transparent background,
32x32px canvas, centered.
```

### 7.5 Partikel percikan kena tembak (hit spark)
```
Small flat pixel-style spark/burst particle, single 4-pointed star shape,
solid warm gold fill (#f0b23a) with a thin ink outline (#2c1e1a), no
gradient, no motion blur baked in (animation handled via CSS). Transparent
background, tiny 16x16px canvas, designed to be duplicated and scattered
radially for a burst effect.
```

**Catatan penggunaan prompt**: semua prompt di atas ditulis untuk tool generate
gambar apa pun yang tersedia di alur kerja Mukhtada — hasilnya perlu diverifikasi
manual agar konsisten dengan `--ease-pixel` timing dan ukuran token existing
sebelum dipakai menggantikan versi CSS murni di mockup.

---

## 8. Ringkasan Perubahan di `mockup.html` (relatif ke `index.html`)

| Bagian | Perubahan |
|---|---|
| CSS `:root` / hero | Tambah class `.time-pagi/.time-siang/.time-sore/.time-malam` (crossfade background), `.sun-moon` menggantikan `.sun` statis |
| Markup hero | Tambah `.time-toggle` (4 tombol), `.hunt-hud` (skor), `.watchtower`, `.sky-hunt-layer` (kontainer entitas dinamis) |
| JS baru | `initTimeOfDay()` — auto-detect jam + toggle manual; `initSkyHunt()` — spawn entitas **sesuai jenis per waktu** (kupu-kupu/burung/formasi-V/kelelawar+kunang-kunang langka), animasi lintasan berbeda per jenis, deteksi klik, proyektil, ledakan partikel, skor berbobot, toast milestone & toast rare-catch |
| Tidak diubah | Semua section di luar hero (`quests`, `about`/journey, `research`, `contact`, footer) — sengaja dibiarkan identik agar mockup tetap bisa dibuka utuh sebagai preview 1 halaman |
| Dependency baru | **Tidak ada** — semua dibangun dari CSS + vanilla JS + `requestAnimationFrame`, konsisten dengan aturan "no new dependency without confirmation" |

---

## Catatan Kepatuhan

Dokumen ini adalah **spesifikasi desain + prototipe kerja**, bukan build final.
Warna baru di §6 wajib dikonfirmasi pemilik proyek sebelum dianggap resmi.
Tidak ada aset gambar eksternal, audio, atau dependency npm baru yang
diperkenalkan — seluruh interaksi di `mockup.html` berjalan dari CSS + vanilla
JavaScript yang sudah kompatibel dengan stack yang diizinkan di brief awal.
