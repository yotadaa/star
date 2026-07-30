# Implementation Plan — Player HUD Widget (Avatar · Level · Status Bar)

Lanjutan dari `implementation-plan.md`, `popup-system-design.md`, dan
`PRODUCT.md`. Fokus: mengembangkan widget kecil pojok kiri-atas yang sudah
ada (toggle "Chat" + avatar/nama) jadi **Player HUD** — kartu status
karakter ala RPG corner-widget, dengan avatar pixelated, level, dan bar
status.

---

## 0. Keputusan Penting Dulu — "Health Bar" Tidak Boleh Jadi Angka Karangan

`PRODUCT.md` eksplisit melarang **"fake dashboard metrics"** dan
**"decorative game mechanics that imply data the portfolio does not
actually have."** HP/health bar di game biasanya representasi fiktif
(nyawa karakter) — kalau ditaruh di sini apa adanya, dia jadi angka
kosong tanpa makna nyata, melanggar prinsip #1 & #3 di `PRODUCT.md`
("turn labels into systems", "use real proof as the reward").

**Jadi bar ini saya rancang ulang maknanya, bentuknya tetap "HP bar",
tapi datanya nyata**:

> **Nama fitur: "System Integrity"** — bar yang menunjukkan **progres
> level saat ini** (PP yang sudah dikumpulkan di level ini ÷ PP yang
> dibutuhkan untuk naik ke level berikutnya), dari sistem Player Points
> yang sudah dirancang di `popup-system-design.md` §1.

Kenapa ini tetap "terasa" seperti HP bar:
- Visualnya identik (bar horizontal, warna berubah, border pixel).
- Bar terisi penuh → "naik level" (bukan "mati/reset" seperti HP asli) —
  jadi framing-nya lebih tepat "energy/charge bar" daripada "nyawa", tapi
  tetap dalam bahasa RPG yang sudah dipakai di seluruh situs.
- Semua angka di baliknya **bisa ditelusuri balik** ke Achievement/Mission
  yang benar-benar ada — sama seperti prinsip Inventory yang sudah
  disepakati sebelumnya.

`[ASUMSI, MOHON DIKONFIRMASI]`: kalau kamu tetap mau istilah "HP" murni
dekoratif (bukan progres level), saya perlu tahu representasi nyata apa
yang mau dipetakan ke situ — supaya tidak melanggar aturan anti-fake-metric
di brand guideline sendiri. Dokumen ini saya lanjutkan dengan asumsi
"System Integrity = level progress" karena paling langsung punya makna.

---

## 1. Konsep Widget — 2 State

### 1.1 State Collapsed (default, seperti screenshot yang kamu kasih)

```
┌──────────┐ ┌────────────────────────┐
│ 💬 Chat  │ │ [avatar] Mukhtada B N. │  ← existing, akan diupgrade
└──────────┘ └────────────────────────┘
```

Tetap 2 pill terpisah (Chat toggle & Player chip) — **tidak digabung
jadi 1**, supaya fungsinya tetap jelas terpisah (satu buka World Chat,
satu buka Player HUD). Yang berubah: pill kedua sekarang avatar
**pixelated** + badge level kecil menempel di pojok avatar (bukan cuma
foto polos seperti sekarang).

### 1.2 State Expanded (BARU — klik pill avatar/nama)

```
┌───────────────────────────────────┐
│  [avatar     ]  Mukhtada B. NST     │
│  [pixelated  ]  Lv.4 · Fullstack     │
│  [64x64      ]  Adventurer            │
│                                        │
│  System Integrity                      │
│  ▓▓▓▓▓▓▓▓░░░░░░  42/60 PP ke Lv.5       │
│                                          │
│  🏺 9 item · 🏆 7 achievement · 3 misi aktif │  ← ringkasan, klik → buka popup Inventory/Achievement/Mission
└───────────────────────────────────┘
```

- Muncul sebagai card kecil melayang di bawah pill (popover), bukan
  modal penuh — konsisten dengan World Chat yang juga panel kecil,
  bukan modal besar.
- Baris ringkasan paling bawah adalah **shortcut**, klik salah satu
  angka → langsung buka tab terkait di popup Inventory/Achievement/
  Mission yang sudah didesain di `popup-system-design.md` — supaya
  Player HUD ini jadi pusat navigasi status, bukan widget terpisah
  yang tidak nyambung ke sistem lain.

---

## 2. Avatar Pixelated

### 2.1 Dua opsi teknik (pilih salah satu, perlu dikonfirmasi)

| Opsi | Cara | Kelebihan | Kekurangan |
|---|---|---|---|
| **A. Pixelate foto asli** | Downsample foto profil asli ke grid kecil (mis. 16×16px) lewat `<canvas>`, lalu upscale dengan `image-rendering: pixelated` (CSS native, tanpa library) | Tetap benar-benar foto Mukhtada — representasi asli, bukan avatar generik | Perlu 1x proses generate di build-time atau saat upload foto, hasil pixelated harus dicek tetap "kenal" (readable sebagai wajah) |
| **B. Pixel-art avatar generatif** | Buat avatar bergaya pixel-art dari elemen sederhana (warna kulit, rambut, aksesoris) mirip karakter game, bukan dari foto asli | Konsisten sepenuhnya dengan tema pixel-game, tidak tergantung kualitas foto asli | Tidak representasi wajah asli — lebih ke "karakter game", bukan "foto profil" |

**Rekomendasi saya: Opsi A** — karena `PRODUCT.md` menekankan *"real proof
as the reward"* dan menghindari yang terasa generik/template. Avatar yang
tetap foto asli (dipixelate) terasa lebih personal & "builder-researcher
yang nyata", dibanding avatar generik ala game character creator.

### 2.2 Implementasi teknis Opsi A (tanpa dependency baru)

```js
// generate sekali saat build atau saat foto di-upload, hasilnya disimpan sebagai asset statis
function pixelateImage(sourceCanvas, pixelSize = 16) {
  const w = sourceCanvas.width, h = sourceCanvas.height;
  const ctx = sourceCanvas.getContext("2d");
  // downsample ke ukuran kecil
  ctx.drawImage(sourceCanvas, 0, 0, pixelSize, pixelSize);
  // upscale balik ke ukuran tampil, browser otomatis blur — matikan smoothing:
  ctx.imageSmoothingEnabled = false;
  ctx.drawImage(sourceCanvas, 0, 0, pixelSize, pixelSize, 0, 0, w, h);
}
```
```css
.player-avatar img { image-rendering: pixelated; }
```

- Proses ini **dilakukan sekali** (bukan realtime tiap render) — hasil
  pixelated disimpan sebagai file statis terpisah (`avatar-pixelated.png`),
  supaya tidak ada overhead canvas processing tiap kali widget dibuka.
- Ukuran render: 40px (collapsed pill) dan 64px (expanded card), sama
  source file, beda `width`/`height` CSS.

### 2.3 Badge level menempel di avatar
- Badge kecil (angka level, background `--gold`, border `--ink`) di
  pojok kanan-bawah avatar, style sama seperti level indicator umum di
  game (World of Warcraft-style corner badge) — **bukan** emoji, pakai
  teks angka pixel font (Silkscreen).

---

## 3. System Integrity Bar

### 3.1 Sumber data & rumus

```js
// dari sistem Player Points yang sudah dirancang (popup-system-design.md §1)
const currentLevelFloor = levelThresholds[currentLevelIndex];      // mis. 60 PP untuk masuk Lv.4
const nextLevelCeiling = levelThresholds[currentLevelIndex + 1];    // mis. 90 PP untuk Lv.5
const progressInLevel = totalPP - currentLevelFloor;                  // PP yang terkumpul di level ini
const neededForNextLevel = nextLevelCeiling - currentLevelFloor;       // total PP dibutuhkan level ini
const integrityPercent = (progressInLevel / neededForNextLevel) * 100;
```

- Ini **turunan langsung** dari data Achievement+Mission yang sama
  dipakai di popup Player Status — tidak ada sumber data baru,
  tidak ada angka yang di-input manual terpisah.
- Label di bawah bar: `"42/60 PP ke Lv.5"` — **selalu tampilkan angka
  mentah**, bukan cuma persentase, supaya jelas ini bukan metrik
  abstrak/karangan (transparansi data, sesuai semangat anti-fake-metric).

### 3.2 Visual
- Bar segmented pixel (10-12 kotak kecil), bukan gradient smooth — sama
  bahasa visual dengan progress bar Mission (`popup-system-design.md`
  §3.4).
- Warna: terisi `--gold`, kosong `--ink @ 15%`.
- **Bukan** berubah warna jadi merah saat "rendah" seperti HP game asli
  (itu akan menyiratkan makna "bahaya/kritis" yang tidak relevan di
  sini) — tetap `--gold` di semua level pengisian, konsisten dengan
  makna "progress", bukan "nyawa terancam".

### 3.3 Animasi saat naik level
- Saat `totalPP` bertambah (achievement/mission baru selesai) dan bar
  terisi penuh → reset ke 0 di level baru + **Toast** ("🎉 Level naik ke
  Systems Builder!", reuse dari `useToast()` yang sudah dibuat) + bar
  di widget ini pulse sebentar (`border-color` flash ke `--gold`,
  sama pola dengan `UnlockCard` unlock-reveal yang sudah ada).

---

## 4. Baris Ringkasan (Item / Achievement / Misi Aktif)

- 3 angka kecil dengan ikon SVG (bukan emoji): `icon-artifact` (jumlah
  item Inventory), `icon-medal-outline` (jumlah Achievement unlocked),
  `icon-target` (jumlah Mission aktif — **ikon baru**, lihat §6).
- Semua angka ini **fetch dari sumber data yang sama** dengan popup
  Inventory/Achievement/Mission — widget ini tidak pernah punya data
  sendiri yang terpisah, murni "ringkasan" dari state yang sudah ada.
- Klik salah satu → trigger buka popup terkait pada tab yang sesuai
  (reuse komponen `PlayerStatusPopup` dari `popup-system-design.md` §6).

---

## 5. States & Edge Cases

| Kondisi | Perilaku |
|---|---|
| Data belum termuat (loading) | Tampilkan skeleton pixel (kotak abu-abu berkedip halus, dimatikan saat `prefers-reduced-motion`), bukan widget kosong tiba-tiba muncul |
| Level 1 (belum ada achievement) | Bar tampil kosong dengan label `"0/15 PP ke Lv.2"` — tetap jujur, bukan disembunyikan |
| Sudah level maksimum (Lv.5, tidak ada threshold berikutnya) | Bar tampil penuh permanen, label berubah jadi `"Level maksimum tercapai"`, bukan pecahan aneh (mis. div by zero) |
| Widget di mobile (viewport sempit) | Collapsed state: avatar+badge level saja tanpa nama teks (hemat ruang), expanded state tetap full card tapi lebar menyesuaikan viewport |

---

## 6. Aset SVG Tambahan

Belum ada di sprite sebelumnya:
1. `icon-target` — untuk "misi aktif" di baris ringkasan
2. `icon-pixel-face` — fallback avatar generik kalau foto asli belum
   di-upload (state kosong sebelum owner set foto), monoline sederhana

---

## 7. Komponen React Baru

| Komponen | Fungsi |
|---|---|
| `PlayerHUD.jsx` | wrapper collapsed pill (avatar+badge level), trigger expand |
| `PlayerHUDCard.jsx` | popover expanded — avatar besar, nama, level, integrity bar, ringkasan |
| `IntegrityBar.jsx` | bar segmented pixel, reusable (styling sama dengan Mission progress bar) |
| `LevelBadge.jsx` | badge angka level, dipakai menempel di avatar & di HUD strip lain |
| `usePlayerProgress.js` | **sudah direncanakan** di `popup-system-design.md` §6 — dipakai ulang di sini, bukan hook baru |

---

## 8. Ringkasan Hal yang Perlu Dikonfirmasi

1. Setuju reframing "HP bar" → **"System Integrity" = progres level**
   (bar terisi dari data Achievement+Mission asli), bukan angka
   dekoratif? (§0)
2. Avatar: pilih **Opsi A** (pixelate foto asli) atau **Opsi B**
   (avatar generatif pixel-art, bukan foto asli)? (§2.1)
3. Kalau Opsi A: foto sumber yang mana yang dipakai untuk di-pixelate
   (perlu file asli resolusi cukup untuk hasil pixelate yang masih
   jelas)?
4. Layout collapsed tetap **2 pill terpisah** (Chat & Player), bukan
   digabung jadi 1 — setuju dengan pemisahan ini? (§1.1)