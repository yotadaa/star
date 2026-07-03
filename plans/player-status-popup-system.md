# Sistem Popup: Inventory · Achievement · Mission

Dokumen ini adalah lanjutan dari `report.md` dan `design-system.md`.
Isinya: konsep, struktur data, dan spesifikasi UI untuk 3 popup baru yang
saling terhubung lewat satu **sistem poin (Player Points / PP)**.

---

## 0. Konsep Inti — Kenapa 3 Popup Ini Perlu Terhubung

Achievement dan Mission sama-sama point-based, tapi beda fungsi:

- **Achievement** = *retroaktif*. Hal yang **sudah** dicapai (published di
  Sinta 5, dapat sitasi, jadi VP English Club). Statusnya cuma dua: locked
  / unlocked. Sekali unlock, ya sudah, poin masuk permanen.
- **Mission** = *progresif*. Hal yang **sedang** berjalan menuju target
  (mis. "capai 10 project publik", "kumpulkan 10 sitasi"). Punya progress
  bar, bisa naik pelan-pelan, reward poin cair saat target tercapai.
- **Inventory** = *representasi hasil*. Bukan sistem poin baru, tapi
  **galeri item yang sudah di-unlock** lewat Achievement & Mission — cara
  visual untuk "memamerkan" pencapaian sebagai benda yang bisa dikoleksi.

Jadi alurnya satu arah:
```
Achievement unlocked  ─┐
                        ├─→ +Poin ke total PP ─→ Level naik
Mission selesai        ─┘
         │
         └─→ memicu 1 item baru muncul di Inventory
```

Inventory **tidak** punya sumber poin sendiri — dia murni etalase dari apa
yang sudah dibuka lewat dua sistem lainnya. Ini penting supaya user tidak
bingung "kenapa ada 3 tempat poin berbeda".

---

## 1. Sistem Poin (Player Points — PP)

- Satu angka global: **Total PP** = jumlah semua Achievement unlocked +
  semua Mission selesai.
- Level pemain diturunkan dari Total PP (bukan input manual), contoh
  threshold (perlu dikonfirmasi/disesuaikan dengan jumlah achievement riil):

| Level | Label | PP Dibutuhkan |
|---|---|---|
| 1 | Fresh Explorer | 0 |
| 2 | Fullstack Apprentice | 15 |
| 3 | Fullstack Adventurer | 35 |
| 4 | Systems Builder | 60 |
| 5 | Research Voyager | 90 |

- Total PP & level ini yang dipakai untuk mengisi `HudChip` "Level:
  Fullstack Explorer" di Home (item report 1.1) — jadi sekarang datanya
  **bukan teks statis**, tapi hasil hitung dari Achievement + Mission.
- Level-up memicu **Toast** ("🎉 Level naik ke Systems Builder!") lewat
  `useToast()` yang sudah dibuat.

---

## 2. ACHIEVEMENT — Struktur & Contoh Konten

### 2.1 Skema data

```ts
type Achievement = {
  id: string;
  title: string;              // "Terindeks Sinta 5"
  description: string;        // konteks singkat
  points: number;              // +6
  rarity: "epic" | "rare" | "common"; // pakai RarityTag yang sudah ada
  unlocked: boolean;
  unlockedAt?: string;          // ISO date, buat sort "terbaru"
  category: "research" | "web" | "community" | "competition";
  icon: string;                 // key ke sprite icons-sprite.svg
};
```

### 2.2 Contoh isi (dipetakan dari konten About/Research yang sudah ada)

| Achievement | Poin | Rarity | Kategori |
|---|---|---|---|
| Terindeks Sinta 5 (publikasi pertama) | +6 | rare | research |
| 4 Publikasi Ilmiah Terindeks Scholar | +10 | epic | research |
| Sitasi pertama diterima | +3 | common | research |
| h-index mencapai 2 | +5 | rare | research |
| Finalis OSN-P Informatika | +8 | epic | competition |
| Peserta PEDAS (Pesta Data Nasional) | +5 | rare | competition |
| Peserta DIGDAYA X Hackathon | +5 | rare | competition |
| Jadi Mentor Study Club (±30 mahasiswa) | +6 | rare | community |
| Terpilih jadi Vice President English Club | +8 | epic | community |
| Publikasi Committee JICEST | +4 | common | community |
| Repo GitHub publik tembus 50+ | +5 | rare | web |
| Deploy proyek fullstack pertama (E-Ticket TNKS) | +6 | rare | web |

**Poin ditentukan berdasarkan bobot usaha/dampak** — bukan angka acak:
common (2–4 poin) untuk partisipasi, rare (5–8) untuk kontribusi nyata
dengan hasil terukur, epic (8–12) untuk pencapaian dengan validasi eksternal
(terindeks, terpilih lewat seleksi, publikasi resmi).

### 2.3 State locked

Achievement yang belum tercapai tetap **ditampilkan** (bukan disembunyikan)
tapi silhouette gelap + poin disamarkan (`+??`), supaya:
1. User tahu ada target yang bisa dikejar (bukan cuma yang sudah lewat).
2. Memberi rasa "masih ada lebih banyak untuk ditemukan" — sesuai pola
   locked-slot yang sudah kita desain di Research (item report 4.3).

Contoh locked achievement yang relevan ke depan:
`"Publikasi ke-5 terindeks" — +6 poin — 🔒 belum tercapai`.

---

## 3. MISSION — Struktur & Contoh Konten

Beda dari Achievement: mission punya **progress numerik**, bukan
boolean unlocked/locked.

### 3.1 Skema data

```ts
type Mission = {
  id: string;
  title: string;                 // "Reach 10 Public Projects"
  description: string;
  target: number;                  // 10
  current: number;                  // dihitung otomatis dari data real (lihat §3.3)
  points: number;                    // reward saat current >= target
  status: "active" | "completed";
  category: "web" | "research" | "community";
};
```

### 3.2 Contoh isi

| Mission | Progress saat ini* | Target | Reward |
|---|---|---|---|
| Reach 10 Public Projects Featured | 6/10 | 10 | +8 |
| Kumpulkan 10 Sitasi di Scholar | 5/10 | 10 | +10 |
| Publikasi ke-5 di Sinta/Scholar | 4/5 | 5 | +6 |
| Tembus 60 Repo Publik GitHub | 57/60 | 60 | +4 |
| Selesaikan h-index 3 | 2/3 | 3 | +6 |

*_Angka current di sini contoh ilustratif berdasar data About/Research yang
sudah ada di situs (5 sitasi, 57 repo, 4 publikasi, h-index 2) — sebaiknya
di-generate otomatis dari `data/` yang sudah kamu simpan (lihat §3.3), bukan
di-input manual dua kali supaya tidak drift dari angka asli di halaman lain.

### 3.3 Sumber data otomatis (penting — hindari data ganda)

Jangan hardcode angka mission terpisah dari data yang sudah dipakai di
halaman Projects/Research. Ambil dari satu sumber:

```ts
// contoh derivasi otomatis, bukan input manual
const missions = [
  {
    id: "m-projects-10",
    title: "Reach 10 Public Projects Featured",
    current: projectsData.length,       // dari data/projects.json yang sudah ada
    target: 10,
    points: 8,
  },
  {
    id: "m-citations-10",
    title: "Kumpulkan 10 Sitasi di Scholar",
    current: researchData.totalCitations, // dari data/research.json
    target: 10,
    points: 10,
  },
];
```

Ini juga menjawab kekhawatiran "jangan mengarang data" dari brief awal —
mission harus mencerminkan angka nyata di `data/`, bukan angka fiktif.

### 3.4 Progress bar visual

Pakai styling segmented-bar pixel (bukan gradient smooth), konsisten dengan
gaya "quest log" — 10 kotak kecil, terisi sesuai rasio current/target,
warna `--gold` untuk terisi, `--ink @ 15%` untuk kosong.

---

## 4. INVENTORY — Konsep & Struktur

Ini bagian yang paling perlu "dipikirkan" karena tidak ada padanan
langsung di konten portofolio biasa. Berikut pendekatan yang saya
rekomendasikan:

### 4.1 Metafora: Inventory = "Artifact yang Dikoleksi dari Quest"

Setiap Achievement/Mission yang selesai **otomatis melahirkan 1 item**
di Inventory. Item ini bukan data baru — dia representasi visual dari
achievement/mission yang sama, tapi dikelompokkan berdasarkan **jenis
artifact**, bukan kronologis:

| Jenis Item | Diisi dari | Icon/visual | Contoh |
|---|---|---|---|
| 📜 **Scroll** (riset/tulisan) | Achievement/Mission kategori `research` | gulungan kertas | "Scroll: Analisis Prediktif Tren Pendidikan (KNN)" |
| 🛠️ **Tool** (skill/stack dikuasai) | Skill Tree yang sudah level tertentu | ikon alat | "Tool: Laravel — Mastery Lv.3" |
| 🏺 **Artifact** (proyek jadi) | Achievement/Mission kategori `web` | guci/artefak | "Artifact: E-Ticket TNKS" |
| 🎖️ **Medal** (kompetisi/organisasi) | Achievement kategori `competition`/`community` | medali (sudah ada svg: medal-gold/silver/bronze) | "Medal: Finalis OSN-P Informatika" |
| 🔑 **Key** (milestone level-up) | Otomatis saat naik level (§1) | kunci pixel | "Key: Level 3 Unlocked" |

### 4.2 Kenapa dikelompokkan begini (bukan cuma list flat)

- Portofolio Mukhtada punya 4 domain jelas (riset, web dev, kompetisi,
  organisasi) — mengelompokkan sebagai "jenis artifact" membuat Inventory
  terasa seperti tas RPG beneran (ada slot senjata, slot ramuan, slot
  quest-item), bukan cuma daftar achievement yang diduplikasi.
- Recruiter/pengunjung yang scan cepat Inventory bisa langsung lihat
  "oh, orang ini kuat di riset" dari banyaknya Scroll, tanpa baca semua teks.

### 4.3 Skema data (derived, bukan sumber data baru)

```ts
type InventoryItem = {
  id: string;
  sourceId: string;        // id achievement/mission asal
  type: "scroll" | "tool" | "artifact" | "medal" | "key";
  name: string;
  rarity: "epic" | "rare" | "common";
  acquiredAt: string;
  linkTo?: string;          // opsional: link ke project/publikasi asli
};

// Inventory TIDAK disimpan manual — di-generate:
function buildInventory(achievements, missions) {
  return [
    ...achievements.filter(a => a.unlocked).map(toInventoryItem),
    ...missions.filter(m => m.status === "completed").map(toInventoryItem),
  ];
}
```

### 4.4 Interaksi khusus Inventory: klik item → detail + link keluar

Beda dari Achievement (cuma lihat), item Inventory **boleh diklik** untuk
membuka detail singkat yang link ke sumber asli:
- Scroll → link ke Google Scholar publikasi terkait
- Artifact → link ke project di GitHub / halaman Projects (scroll ke card-nya)
- Medal → tidak perlu link (organisasi/kompetisi biasanya tak punya URL)

Ini membuat Inventory bukan cuma dekorasi, tapi jadi **navigasi alternatif**
ke konten situs — nilai tambah fungsional, bukan cuma estetika.

### 4.5 Rarity & sorting

- Default sort: rarity (epic → rare → common), lalu terbaru.
- Filter tab di dalam popup Inventory: All / Scroll / Tool / Artifact / Medal
  — pakai `PixelButton` varian `as="pill"` yang sudah ada, sama pola dengan
  filter Tipe/Kategori di halaman Projects.

---

## 5. Spesifikasi UI Popup (3-in-1 Modal)

### 5.1 Trigger

- Ikon baru di navbar pill, di sebelah ikon `⌘` yang sudah ada
  (gunakan `icon-command` di sprite sebagai referensi style, buat versi
  baru misal ikon tas/backpack untuk trigger popup ini — **perlu SVG baru**,
  lihat §7).
- Alternatif: 1 ikon trigger membuka modal dengan 3 tab di dalamnya
  (Inventory / Achievement / Mission), bukan 3 ikon terpisah — lebih hemat
  ruang di navbar yang sudah padat (Home/About/Projects/Research/Contact +
  2 ikon existing).

### 5.2 Layout modal

```
┌─────────────────────────────────────────┐
│  [Inventory] [Achievement] [Mission]  ✕ │  ← tab switcher, PixelButton pill
├─────────────────────────────────────────┤
│  Lv.3 Fullstack Adventurer · 42 PP       │  ← HudStatusStrip (ringkasan global)
│  ▓▓▓▓▓▓▓░░░ 42/60 menuju Lv.4            │  ← progress bar ke level berikut
├─────────────────────────────────────────┤
│                                           │
│   [grid item sesuai tab aktif]           │  ← UnlockCard per item, RarityTag
│                                           │
└─────────────────────────────────────────┘
```

- Header ringkasan PP/level **selalu tampil** di ketiga tab — supaya
  koneksi "achievement/mission → poin → level → inventory" terasa nyata,
  bukan 3 fitur terpisah.
- Modal: backdrop blur + card style sama seperti `HeroGlassPanel` yang
  sudah direncanakan di brief awal (konsisten glass-cockpit theme).
- Animasi buka: scale+fade, bukan slide — konsisten `--ease-pixel`.
- Tutup: klik backdrop, tombol ✕, atau tombol `Esc` (wajib untuk aksesibilitas).

### 5.3 Tab Achievement — layout per item

```
┌───────────────────────────┐
│ [RarityTag: EPIC]     +10 │
│ 🏺 4 Publikasi Ilmiah      │
│    Terindeks Scholar       │
│ ✓ Unlocked · Jan 2025      │
└───────────────────────────┘
```
Item locked: sama layout, tapi icon jadi silhouette abu + poin `+??`.

### 5.4 Tab Mission — layout per item

```
┌───────────────────────────┐
│ Kumpulkan 10 Sitasi        │
│ ▓▓▓▓▓░░░░░ 5/10             │
│ Reward: +10 PP saat selesai │
└───────────────────────────┘
```

### 5.5 Tab Inventory — layout per item (grid icon besar)

```
┌───────┐
│  📜   │  ← icon besar sesuai type
│ Scroll │
│ "KNN.."│
└───────┘
```
Klik → expand jadi detail card kecil (nama lengkap, tanggal didapat, link).

### 5.6 Empty/first-visit state

Kalau user baru pertama buka (belum ada progress tersimpan / semua
default), tampilkan state kosong yang tetap informatif, bukan sekadar
"belum ada data":
> "🎒 Inventory masih kosong. Selesaikan mission pertama untuk item pertamamu!"

Konsisten dengan prinsip *empty state = ajakan bertindak* dari panduan desain.

---

## 6. Reusable Component yang Perlu Ditambah

Menyambung dari komponen yang sudah dibuat sebelumnya:

| Komponen baru | Fungsi | Reuse dari yang sudah ada |
|---|---|---|
| `PlayerStatusPopup.jsx` | Modal wrapper + tab switcher + header PP/Level | `PixelButton`, `HudStatusStrip` |
| `AchievementList.jsx` | Grid achievement, locked/unlocked | `RarityTag`, `UnlockCard` |
| `MissionList.jsx` | Grid mission + progress bar | `RarityTag` (utk kategori) |
| `InventoryGrid.jsx` | Grid item + detail expand | `UnlockCard`, `RarityTag` |
| `ProgressBarSegmented.jsx` | Progress bar kotak-kotak pixel (dipakai Mission & header level) | baru, generic |
| `usePlayerProgress.js` (hook) | Hitung Total PP, level, status locked/unlocked dari `data/achievements.json` + `data/missions.json` | — |

Semua trigger unlock (achievement baru / mission selesai / level naik)
wajib memanggil `useToast()` yang sudah ada — supaya user benar-benar
"merasakan" event-nya, bukan cuma lihat angka berubah diam-diam saat
buka popup.

---

## 7. Aset SVG Tambahan yang Dibutuhkan

Belum ada di `icons-sprite.svg` sebelumnya, perlu ditambahkan:

1. `icon-backpack` — trigger navbar untuk buka popup (§5.1)
2. `icon-scroll` — item type Scroll (riset)
3. `icon-tool-wrench` — item type Tool (skill)
4. `icon-artifact-vase` — item type Artifact (proyek)
5. `icon-key` — item type Key (level milestone)
6. `icon-lock-silhouette` — versi "locked" achievement (icon abu, sudah ada
   `icon-lock` tapi ini varian untuk isi card, bukan locked-slot)

Beri tahu saya kalau ingin saya generate SVG-SVG ini sekarang (sprite
tambahan, format sama seperti `icons-sprite.svg` — monoline, currentColor).

---

## 8. Hal yang Perlu Dikonfirmasi (ASUMSI, MOHON DIKONFIRMASI)

1. **Skala poin** di §2.2 dan §3.2 adalah usulan awal saya berdasarkan bobot
   relatif — jumlah pastinya sebaiknya kamu review sendiri (terutama makna
   "Sinta 5" — saya asumsikan ini merujuk ke indeks jurnal Sinta, bukan
   istilah lain).
2. **Threshold level** di §1 (0/15/35/60/90 PP) itu angka ilustratif,
   perlu disesuaikan supaya level terakhir tidak terlalu cepat/lambat
   tercapai berdasarkan total achievement+mission riil yang akan didaftarkan.
3. **Persistensi progress**: mission progress (current count) sebaiknya
   **dihitung otomatis dari data** (§3.3), bukan disimpan manual per user —
   karena ini portofolio publik (bukan aplikasi multi-user dengan akun),
   semua pengunjung akan melihat progress yang sama (progress si pemilik
   portofolio, bukan progress masing-masing pengunjung). Perlu dikonfirmasi
   ini pemahaman yang benar — beda dengan game sungguhan di mana progress
   itu milik tiap pemain.
4. Item Inventory §4.4 yang link keluar ke Scholar/GitHub — pastikan
   URL-nya diambil dari `data/` yang sama dipakai halaman Research/Projects,
   supaya tidak ada link yang dikarang.