# Gamification System Overview — Portofolio MB · NST

Dokumen ini adalah **peta menyeluruh** dari seluruh pembahasan gamifikasi
portofolio Mukhtada Billah NST (`mukhtada.nst`), dari audit awal sampai
rencana fitur full-stack terbaru. Isinya rekap kronologis + status tiap
deliverable, supaya siapa pun (termasuk kamu sendiri beberapa minggu ke
depan) bisa masuk ke titik manapun dari project ini tanpa harus scroll
ulang seluruh percakapan.

---

## 0. Konteks Produk (Fondasi Semua Keputusan)

Dari `PRODUCT.md` yang sudah ada sejak awal:

- **Metafora inti**: portofolio sebagai "quest journey" — Mukhtada
  ditampilkan sebagai builder-researcher lewat lensa RPG cockpit.
- **Brand personality**: warm, mechanical, exploratory — tactile, sedikit
  pixelated, research-aware, tetap polished (bukan noisy/novelty-heavy).
- **Anti-references** (paling sering jadi rujukan sepanjang project ini):
  hindari gradient AI-SaaS generik, fake dashboard metrics, static game
  labels tanpa feedback, emoji-based gamification, achievement/citation/
  repo count yang dikarang.
- **5 Design Principles** yang jadi pemeriksa tiap fitur baru:
  1. Ubah label jadi sistem (kalau halaman bilang "quest/tier/journey/
     achievement", harus ada state/progress/feedback asli).
  2. Identitas dulu sebelum novelty (Fraunces, Silkscreen, Nunito,
     Verdant Dusk, hard-offset card tetap bahasa inti).
  3. Proof asli sebagai reward (screenshot proyek, GitHub, publikasi,
     timeline — bukan angka fiktif).
  4. Motion tactile tapi tenang (press state, unlock reveal, pulse,
     ripple — tidak mengganggu baca).
  5. Dunia tetap aksesibel (keyboard focus, kontras, reduced-motion,
     tanpa horizontal overflow).

Token desain dasar (dari `components/NUMBER-RATIONALE.md`, tidak diulang
detail di sini): warna Verdant Dusk (`--dusk-top`, `--sunset`, `--gold`,
`--terracotta`, `--olive`, dst), font Fraunces (display) / Silkscreen
(UI-pixel) / Nunito (body), easing `--ease-pixel`.

---

## 1. Fase Audit — "Apa yang Perlu Ditambah untuk Gamifikasi Nyata"

**Trigger**: kamu minta audit elemen gamifikasi berdasarkan screenshot
5 halaman (Home, About, Projects, Research, Contact).

**Temuan utama**: situs sudah punya *label* game (quest, tier, journey,
skill tree) tapi belum punya *sistem* di baliknya — semua kosmetik,
belum ada state/progress/feedback.

**Output**:
- `report.md` — audit per halaman + rekomendasi lintas-halaman, dengan
  prioritas Quick Win / Medium / Higher Effort. Contoh item: XP scroll
  bar, rarity tag di project card, "kamu di sini" marker di Journey Log,
  toast notification system, custom cursor, command palette.
- `design-system.md` — spesifikasi teknis 10 komponen baru (HUD Status
  Strip, XP Scroll Bar, Rarity Tag, Press State, Current Marker, Unlock
  Reveal, Toast, Portal Hover Card, Locked Slot) + token rarity yang
  di-remap dari palet existing (tidak ada hex baru).

---

## 2. Fase Aset Visual — SVG Icon Set

**Trigger**: minta SVG untuk elemen-elemen di `design-system.md`, lalu
revisi eksplisit **"jangan bikin ascii/emoji untuk icons dan logos"**.

**Output**:
- `svg/icons-sprite.svg` — sprite `<symbol>` monoline `currentColor`
  (star-level, flame-streak, pin, lock, marker-current, trophy,
  clipboard, chevron-up, portal-ring, compass, command).
- `svg/medal-gold.svg`, `medal-silver.svg`, `medal-bronze.svg`.
- `svg/badge-rarity-shape.svg` — bentuk badge sudut-terpotong.
- `svg/cursor-pixel-arrow.svg`, `svg/cursor-pixel-crosshair.svg`.

Aturan yang dipegang sejak titik ini dan konsisten ke semua deliverable
berikutnya: **tidak ada emoji sebagai icon/logo di manapun** — semua
ikon SVG monoline buatan sendiri.

---

## 3. Fase Komponen React

**Trigger**: minta reusable component dari `design-system.md`, project
berbasis React (Next.js, App Router).

**Output** (`react/components/*`, `react/hooks/*`):
`HudStatusStrip`, `XpScrollBar`, `RarityTag`, `PixelButton`,
`CurrentMarker`, `UnlockCard` + `useInViewOnce`, `Toast`
(`ToastProvider`/`useToast`), `PortalCard`, `LockedSlot`, plus barrel
`index.js` dan `README.md` cara pakai. Semua pakai Tailwind + Framer
Motion saja (stack yang sudah diizinkan brief awal), tidak ada dependency
baru, semua hormat `prefers-reduced-motion`.

---

## 4. Review Implementasi Nyata vs Design System

Sepanjang project, beberapa kali kamu kirim **screenshot implementasi
riil** dari localhost, dan saya audit kesesuaiannya ke `design-system.md`:

- **Section "Build Glimpses" (Home)** — carousel card ditemukan pakai
  shadow blur lembut + rounded corner (melanggar aturan hard-offset
  shadow), tag "RESEARCH WEB" belum jadi `RarityTag`, dot indicator
  belum pixel-style, tombol prev/next belum pakai `PixelButton`.
- **Navbar** — nav label ditemukan pakai font sans standar, bukan
  Silkscreen (padahal tombol CTA di bawahnya sudah benar); direkomendasi
  turunkan ukuran font Silkscreen untuk nav item, bukan ganti font.

Pola kerja di fase ini: kamu kirim screenshot → saya bandingkan ke token/
komponen yang sudah disepakati → kasih daftar penyesuaian dengan
prioritas Tinggi/Sedang/Rendah.

---

## 5. Sistem Popup: Inventory · Achievement · Mission

**Trigger**: kamu minta rancangan 3 popup baru, point-based, dengan
permintaan eksplisit "coba pikirin untuk inventory" (belum ada konsep
jelas).

**Output**: `popup-system-design.md`

Konsep inti yang jadi fondasi semua fitur setelahnya:
- **Player Points (PP)** — satu sistem poin global, level diturunkan
  dari total PP (bukan input manual).
- **Achievement** = retroaktif (locked/unlocked, poin permanen sekali
  unlock). Contoh: "Terindeks Sinta 5" +6, "4 Publikasi Scholar" +10.
- **Mission** = progresif (progress bar menuju target, reward cair saat
  selesai). **Wajib dihitung otomatis dari `data/` yang sudah ada**
  (jumlah repo, sitasi, publikasi) — bukan angka input manual terpisah,
  supaya tidak ada data ganda yang bisa drift.
- **Inventory** = **bukan sumber poin sendiri** — murni etalase item
  yang lahir otomatis dari Achievement/Mission yang selesai, dikelompokkan
  jadi 5 jenis: Scroll (riset), Tool (skill), Artifact (proyek), Medal
  (kompetisi/organisasi), Key (milestone level-up). Item bisa diklik →
  link ke sumber asli (Scholar/GitHub/project card).

Spesifikasi UI: 1 modal 3-tab (bukan 3 popup terpisah), header ringkasan
PP/Level selalu tampil di semua tab. Daftar komponen React & aset SVG
tambahan yang dibutuhkan (backpack, scroll, tool, artifact, key icons)
juga sudah didaftar tapi **belum digenerate** (ditawarkan, belum diminta).

---

## 6. Review Navbar (Lanjutan)

**Trigger**: review screenshot Home terbaru, fokus ke navbar pill.

**Temuan**: struktur & spacing sudah oke, tapi (1) font nav item masih
sans bukan Silkscreen, (2) belum ada trigger ikon untuk popup Inventory/
Achievement/Mission yang baru dirancang, (3) opsional: badge level mini
di navbar sebagai preview sebelum popup dibuka.

---

## 7. Implementation Plan Besar #1 — Login · World Chat · Inventory Mgmt · Blog CMS

**Trigger**: kamu minta 4 fitur baru sekaligus: world/global chat
(Google-only login), tambah item ke inventory (login-gated), route
`/blog` dengan block-level editor kelola.

**Output**: `implementation-plan.md` + `feature-mockup.html`

Poin arsitektur paling penting (§0 dokumen ini): portofolio berubah dari
**statis** ke **full-stack**, sehingga perlu keputusan stack baru yang
**secara eksplisit ditandai butuh konfirmasi**, bukan diasumsikan diam-diam:
- Stack yang diusulkan: **Auth.js (Google OAuth) + Supabase (Postgres +
  Realtime + Storage) + Tiptap (block editor)**.
- Model **single-owner**: hanya kamu yang kelola Blog & Inventory manual;
  visitor yang login Google hanya bisa ikut World Chat.
- Skema SQL lengkap + Row Level Security policy untuk `chat_messages`,
  `inventory_items`, `blog_posts`.
- World Chat dirancang dengan framing RPG fungsional (bukan dekoratif):
  border rarity per role pengirim, level asli dari sistem PP, online
  count dari Presence API asli — bukan angka dikarang.
- Fase implementasi berurutan (setup infra → login → blog publik → blog
  admin → inventory manual-add → world chat, disengaja realtime
  dikerjakan paling akhir karena paling kompleks).
- 7 poin eksplisit yang **wajib dikonfirmasi** sebelum eksekusi (persetujuan
  stack, siapa generate kredensial, model single-owner, filter kata kasar
  chat, desain inventory owner-only vs personal-per-visitor, struktur
  route blog, kebutuhan privacy policy).

`feature-mockup.html`: 1 file statis, tab untuk Login (Google-only),
World Chat (locked → login → panel aktif), Inventory Management (form
tambah item inline, owner-only), Blog CMS (3 sub-tab: publik/admin/
editor).

**Revisi kecil menyusul**: copy headline login "Masuk ke Dunia MB·NST"
ditandai "cringe" oleh kamu → diganti "Login ke System" + eyebrow
"// SYSTEM ACCESS", supaya bahasa konsisten dengan "SYSTEM ONLINE — SAVE
FILE" yang sudah dipakai di Home.

**Revisi besar menyusul**: mockup awal masih pakai emoji sebagai icon
(navbar, chat header, item inventory) → di-generate ulang total pakai
SVG sprite monoline offline (compass, backpack, chat, command, lock, key,
scroll, artifact, tool, medal-outline) — konsisten dengan aturan sejak
Fase 2.

---

## 8. Implementation Plan Besar #2 — Penyesuaian Blog & Editable Header Caption

**Trigger**: kamu upload kode nyata yang sudah jalan (`page.js`,
`PageHeader.jsx`) dan minta penyesuaian: grid/list view, kontrol
kategori, tombol tambah artikel, halaman tulis & edit artikel (block
editor), tombol edit/hapus saat login, dan **fitur lintas-route**: caption
di bawah header semua halaman (bukan cuma Blog) bisa diedit dengan block
editor rich.

**Output**: `blog-editor-implementation-plan.md` + `blog-editor-mockup.html`

Poin desain paling signifikan: **`PageHeaderEditable`** — wrapper baru
di atas `PageHeader.jsx` yang sudah ada (tanpa mengubah komponen aslinya),
dipakai ulang di 6 route (`/`, `/about`, `/projects`, `/research`,
`/blog`, `/contact`), dengan sumber data terpusat 1 tabel
`page_captions` (bukan hardcode per `page.js`). Toolbar caption sengaja
dibatasi (bold/italic/link saja) — judul `<h1>` sengaja **tidak** dibuat
editable untuk menjaga stabilitas SEO/navigasi.

Permission matrix eksplisit: visitor login (bukan owner) tetap tidak
dapat privilege apa pun di Blog/caption — konsisten dengan model
single-owner dari Implementation Plan #1.

**Revisi besar menyusul (paling substansial di seluruh project)**: kamu
tegaskan feel editor tidak boleh seperti form kotak ala Word — harus
**seamless ala Medium**, setiap baris punya kontrol sendiri (bukan
toolbar block permanen di atas). Editor dirombak total:
- Judul & body ditulis langsung di halaman (`contentEditable`), tanpa
  border/box pembatas, max-width ~680px center.
- Insert block ("+") hanya muncul saat hover di margin kiri baris
  kosong → popover kontekstual (Heading/Quote/Bullet/Code/Image/Divider).
- Formatting (bold/italic/link/heading/quote) **hanya** lewat bubble
  toolbar mengambang saat teks di-select — tidak ada toolbar permanen.
- Slug/tags/status/cover dipindah ke drawer "Pengaturan cerita" yang
  collapsed by default.
- Dicatat implementasinya native didukung Tiptap (`BubbleMenu` +
  `FloatingMenu`/custom node-view), tidak perlu dependency tambahan.

---

## 9. Player HUD Widget — Avatar · Level · "System Integrity" Bar

**Trigger**: kamu tunjuk widget kecil pojok kiri-atas (toggle Chat +
avatar/nama) dan minta ditambah health bar, level, dan foto profil
pixelated.

**Output**: `player-hud-implementation-plan.md` + `player-hud-mockup.html`

Keputusan paling penting (§0 dokumen itu): **"health bar" di-reframe
ulang maknanya** supaya tidak melanggar prinsip anti-fake-metric
`PRODUCT.md`. Nama fitur jadi **"System Integrity"** — bar yang
merepresentasikan **progres level asli** (PP terkumpul di level ini ÷
PP dibutuhkan ke level berikutnya) dari sistem Player Points yang sama
dipakai di Fase 5 — bukan angka "nyawa" fiktif. Bar selalu menampilkan
angka mentah (`"42/60 PP"`), tidak cuma persentase, untuk transparansi.

Avatar pixelated: 2 opsi didokumentasikan (A: pixelate foto asli via
canvas downsample + `image-rendering: pixelated`, direkomendasikan
karena selaras prinsip "real proof"; B: avatar generatif pixel-art,
tidak representasi wajah asli) — **belum diputuskan**, ditandai perlu
konfirmasi.

Widget punya 2 state: collapsed (pill kecil, avatar+badge level) dan
expanded (popover card: avatar besar, nama, level, System Integrity bar,
ringkasan 3 angka — Item/Achievement/Misi aktif — yang masing-masing
jadi shortcut ke tab terkait di popup dari Fase 5). Termasuk skenario
edge case: level 1 (belum ada achievement), level maksimum (bar penuh
permanen, bukan div-by-zero), dan animasi level-up yang trigger toast +
pulse bar.

---

## 10. Peta Semua Deliverable

| # | File | Jenis | Ringkasan Isi |
|---|---|---|---|
| 1 | `report.md` | Audit | Rekomendasi gamifikasi per halaman + prioritas |
| 2 | `design-system.md` | Spek teknis | 10 komponen dasar gamifikasi |
| 3 | `svg/icons-sprite.svg` + medal/badge/cursor svg | Aset | Icon monoline, tanpa emoji |
| 4 | `react/components/*`, `react/hooks/*`, `README.md` | Kode | 9 komponen + 1 hook siap pakai |
| 5 | `popup-system-design.md` | Spek fitur | Inventory/Achievement/Mission + sistem PP |
| 6 | `implementation-plan.md` | Rencana besar | Login, World Chat, Inventory Mgmt, Blog CMS |
| 7 | `feature-mockup.html` | Mockup | Preview 4 fitur di atas, 1 file interaktif |
| 8 | `blog-editor-implementation-plan.md` | Rencana besar | Blog grid/list, CRUD artikel, caption global |
| 9 | `blog-editor-mockup.html` | Mockup | Blog list, editor Medium-style, caption editor |
| 10 | `player-hud-implementation-plan.md` | Rencana fitur | Avatar pixel, level, System Integrity bar |
| 11 | `player-hud-mockup.html` | Mockup | Widget pojok kiri-atas, collapsed & expanded |

---

## 11. Semua Keputusan yang Masih Menunggu Konfirmasi Kamu

Dikumpulkan dari seluruh dokumen di atas, supaya tidak tercecer:

**Arsitektur & stack** (`implementation-plan.md` §0, §8)
1. Setuju Auth.js + Supabase + Tiptap sebagai stack?
2. Kamu generate Google OAuth credentials & buat project Supabase sendiri.
3. Model single-owner dikonfirmasi: hanya kamu kelola Blog & Inventory.
4. Perlu filter kata kasar otomatis di World Chat, atau moderasi manual saja?
5. Inventory manual-add: benar-benar owner-only, atau visitor juga boleh
   punya koleksi personal (desain data beda total)?
6. Struktur route `/blog` publik vs `/blog/admin` privat — bukan `/blog`
   langsung jadi admin panel?
7. Perlu halaman Privacy Policy terpisah sebelum login Google live ke publik?

**Blog & caption global** (`blog-editor-implementation-plan.md` §11)
8. Filter kategori Blog tetap single-select atau multi-select seperti Projects?
9. Search box artikel — masuk batch ini atau fase 2?
10. Judul halaman (`<h1>`) sengaja tidak dibuat editable, hanya caption —
    setuju batasan ini?
11. Toolbar caption dibatasi bold/italic/link saja — cukup, atau perlu
    lebih lengkap?
12. Halaman `/blog/[slug]` (baca detail) sepertinya belum ada di kode —
    perlu dikonfirmasi ini memang belum dibangun.

**Player HUD** (`player-hud-implementation-plan.md` §8)
13. Setuju reframing "HP bar" → "System Integrity" (progres level asli)?
14. Avatar: Opsi A (pixelate foto asli) atau Opsi B (avatar generatif)?
15. Kalau Opsi A: foto sumber resolusi cukup yang mana yang dipakai?
16. Layout collapsed tetap 2 pill terpisah (Chat & Player) — setuju?

**Rarity & warna** (`design-system.md` §1, masih berlaku ke semua fitur baru)
17. Skema warna rarity masih remap dari skema 1 — perlu diulang kalau
    proyek final pindah ke "skema 2" yang disebut di brief paling awal
    tapi belum pernah didefinisikan nilainya.

---

## 12. Urutan Kerja yang Disarankan Selanjutnya

Berdasarkan ketergantungan antar fitur yang sudah dipetakan di seluruh
dokumen:

1. **Putuskan dulu semua item di §11** — terutama stack (poin 1-2) karena
   Fase 6-9 semuanya bergantung ke ini jalan duluan.
2. Bangun fondasi: Supabase project + Auth.js Google login + skema tabel
   (`chat_users`, `chat_messages`, `inventory_items`, `blog_posts`,
   `page_captions`).
3. Blog publik dulu (`/blog`, `/blog/[slug]`) sebelum admin — paling
   independen dari fitur lain.
4. Baru lanjut ke Inventory manual-add, lalu World Chat (paling kompleks,
   realtime + moderasi, sengaja dikerjakan terakhir).
5. Player HUD bisa dibangun paralel kapan saja setelah sistem Player
   Points (§5) punya data asli untuk dihitung — secara teknis tidak
   bergantung ke Blog/Chat/Inventory selesai duluan.