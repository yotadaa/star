# Implementation Plan — Nala, NPC Assistant

Dokumen ini merencanakan fitur prioritas terbaru: **Nala**, karakter NPC
pixelated (female) yang menjawab pertanyaan pengunjung tentang portofolio,
memakai LLM via **OpenRouter** dengan **tool calling**. Dokumen ini
melanjutkan konvensi `gamification-system-overview.md` — anggap ini
**Fase 13**, ditambahkan ke peta deliverable setelah selesai.

Status semua keputusan di bawah: **draft, butuh konfirmasi** kecuali
ditandai lain. Tidak ada yang dieksekusi sebelum §10 disetujui.

---

## 1. Kenapa Nala, dan Kenapa Ini Beda dari World Chat

Project ini sudah punya rencana **World Chat** (Fase 7, `implementation-plan.md`
lama) — chat publik antar-pengunjung, login-gated Google, realtime. **Nala
bukan itu.** Supaya tidak tabrakan konsep maupun UI, perbedaannya ditegaskan
di sini:

| | World Chat (Fase 7) | Nala (Fase 13, dokumen ini) |
|---|---|---|
| Sifat | Chat antar-manusia (pengunjung ↔ pengunjung) | Chat manusia ↔ AI assistant |
| Butuh login | Ya, Google OAuth | Tidak — publik, siapa saja bisa tanya |
| Isi | Bebas, perlu moderasi | Terbatas pada info portofolio (proof asli) |
| Tujuan | Komunitas/social proof | Navigasi & tanya-jawab cepat |
| Lokasi UI | Pill "CHAT" pojok kiri-atas (lihat player-hud) | **Floating button baru, pojok kanan-bawah** (§2) |

> **[BUTUH KONFIRMASI #1]** — Screenshot Home terbaru menunjukkan widget
> pojok kiri-atas: pill "CHAT" + pill avatar "MUKHTADA B NASUTION". Perlu
> dipastikan pill "CHAT" itu memang untuk World Chat (Fase 7), bukan
> pengganti Nala — supaya dua sistem chat ini tidak saling menutupi makna
> satu sama lain di mata pengunjung. Rekomendasi: beri label yang jelas beda
> secara visual/tekstual (mis. ikon chat generik untuk World Chat vs ikon
> kepala Nala untuk assistant), dan pertimbangkan microcopy singkat saat
> pertama kali FAB Nala muncul: "Bukan World Chat — ini Nala, pemandu quest."

---

## 2. Penempatan & Struktur UI

### 2.1 Lokasi Floating Button

**Keputusan: pojok kanan-bawah (`bottom: 24px; right: 24px`)**, alasan:

1. Pojok kiri-atas sudah padat (navbar pill, widget Chat/Player HUD dari
   Fase 9, XP Scroll Bar di paling atas). Menambah elemen di sana akan
   melanggar prinsip "quiet" di `design-system.md`.
2. Pojok kanan-bawah adalah convention universal untuk assistant/chat
   widget — tidak butuh onboarding tambahan bagi pengunjung baru.
3. Satu-satunya elemen lain yang memakai pojok kanan-bawah adalah **Toast**
   (`design-system.md` §8, `bottom:24px; right:24px; z-index:70`). Ini
   butuh koordinasi eksplisit (§2.4), bukan dihindari — memindah Toast ke
   pojok lain akan memutus konsistensi dengan sistem lain yang sudah
   dipakai (achievement/level-up toast, dsb).

### 2.2 Spesifikasi Tombol (Collapsed State)

```
Struktur:
<button class="nala-fab" aria-label="Buka Nala, pemandu quest" aria-haspopup="dialog">
  <svg><!-- potret Nala, expression sesuai state --></svg>
  <span class="nala-fab-badge" hidden><!-- dot notifikasi tip proaktif --></span>
</button>
```

- Ukuran: 64×64px, bentuk **pixel-corner square** (clip-path sudut
  dipotong 6px), bukan lingkaran — konsisten dengan Rarity Tag (§4
  `design-system.md`), bukan bentuk chat-bubble generik.
- Background: `var(--gold)`, border 2px solid `var(--ink)`.
- Shadow: hard-offset `6px 6px 0 var(--ink)` (token yang sama dipakai
  `PixelButton`), berkurang jadi `2px 2px 0` + `translate(2px,2px)` saat
  `:active` — reuse §5 `design-system.md` apa adanya, jangan definisikan
  ulang.
- Isi tombol: potret bust Nala (bukan ikon generik chat-bubble) — svg
  `nala-idle.svg` sebagai default, ganti ke `nala-thinking.svg` selama
  panel menunggu jawaban model, balik ke `nala-idle.svg` saat panel
  tertutup.
- **Idle motion**: bob halus `translateY(0 → -3px)` 2.6s ease-in-out
  infinite, dimatikan total saat `prefers-reduced-motion`.
- **Badge notifikasi**: dot kecil `var(--terracotta)`, muncul untuk tip
  proaktif event-driven (lihat §7.4) — bukan dekorasi, tidak boleh muncul
  tanpa event nyata (selaras prinsip anti-fake-metric `PRODUCT.md`).

### 2.3 Panel Percakapan (Expanded State)

- Desktop: card mengambang, lebar 380px, tinggi maks 560px, anchor di atas
  FAB (`bottom: 100px; right: 24px`), border 2px `var(--ink)`, shadow
  hard-offset besar `8px 8px 0 var(--ink)`, sudut pixel-corner sama seperti
  card lain di situs.
- Mobile (`<640px`): full-height bottom sheet, slide-up, menutupi FAB
  selama terbuka.
- Struktur internal:
  1. **Header** — potret Nala (48px, expression = state terakhir),
     `NALA` (Silkscreen), subtitle `PEMANDU QUEST` (Silkscreen 10px,
     `var(--ink)` 60%), tombol tutup pixel-corner kanan-atas.
  2. **Thread** — scrollable, tiap bubble Nala didampingi potret mini
     (24px) di kiri; bubble pengunjung rata kanan tanpa potret.
  3. **Quick-prompt chips** — muncul di atas input, maks 3, style sama
     dengan filter pill (§5 `design-system.md`), hilang otomatis setelah
     pesan pertama terkirim tapi bisa muncul lagi kontekstual (§7.3).
  4. **Input bar** — text input placeholder `Tanya Nala...` (Silkscreen),
     tombol kirim pixel-corner kecil, disabled state saat menunggu balasan.
- **Typing indicator**: 3 titik pixel memantul, fallback `···` statis saat
  reduced-motion.

### 2.4 Koordinasi dengan Toast

Aturan eksplisit supaya dua elemen pojok kanan-bawah tidak bertabrakan:

- Saat FAB Nala collapsed & visible → Toast stack offset jadi
  `bottom: calc(24px + 64px + 12px)` (tinggi FAB + gap), bukan `24px`.
- Saat panel Nala terbuka (desktop) → FAB tetap terlihat di baliknya
  (panel anchor di atasnya), offset toast tetap sama seperti di atas.
- Saat panel Nala terbuka penuh layar (mobile) → Toast **tidak tampil**
  selama panel terbuka; event yang men-trigger toast di-queue dan tampil
  begitu panel ditutup (jangan hilang begitu saja).

---

## 3. Sistem Karakter — Ekspresi & Pose

**6 ekspresi/pose** dipilih agar cukup untuk memetakan seluruh siklus
percakapan tool-calling tanpa berlebihan (brief eksplisit minta "warm,
tactile, tidak novelty-heavy"):

| # | File | Dipakai saat | Deskripsi visual |
|---|---|---|---|
| 1 | `nala-idle.svg` | Default, panel tertutup, sedang menunggu input | Senyum tenang, mata titik, tanpa aksesori tambahan |
| 2 | `nala-thinking.svg` | Tool call sedang berjalan / model memproses | Mata kanan menyipit, glyph gear kecil melayang |
| 3 | `nala-happy.svg` | Jawaban berhasil, terutama saat menyebut proof asli (project/publikasi/achievement) | Mata melengkung ^ ^, mulut lebar, sparkle kecil, blush lebih jelas |
| 4 | `nala-confused.svg` | Tidak ada data yang cocok / tool return kosong | Alis-mata kanan terangkat asimetris, glyph tanda tanya |
| 5 | `nala-greeting.svg` | Pesan pembuka saat panel pertama kali dibuka per sesi | Melambai (lengan kecil terangkat), senyum lebar |
| 6 | `nala-pointing.svg` | Menyarankan navigasi ke section/halaman lain (`navigate_to`) | Lengan terentang ke samping, isyarat "ke arah sana" |

Detail teknis aset (lihat file terpisah di §12):

- Format: SVG pixel-grid asli (bukan raster di-downsample) — grid
  22×27 unit, `shape-rendering: crispEdges`, `<rect>` per baris piksel
  (bukan `<path>`), supaya tetap tajam di skala berapa pun sesuai bahasa
  "pixel-game" situs.
- Palet: **seluruhnya remap dari token existing**, tidak ada hex baru —
  konsisten dengan aturan `design-system.md` §1:
  - Rambut & aksesori kepala → `--terracotta`
  - Kulit → `--cream`
  - Vest/kerah → `--olive`, trim & emblem → `--gold`
  - Outline, mata, mulut → `--ink`
  - Blush → `--terracotta` (dot kecil)
- Semua file memakai custom property `--nala-*` yang alias ke token asli
  (`--nala-ink: var(--ink)`, dst.) — kalau butuh override warna Nala
  spesifik nanti (tanpa mengubah token global), tinggal ubah alias-nya di
  satu tempat.
- **[ASUMSI, MOHON DIKONFIRMASI]**: gaya rambut kuncir dua (twin-tail) +
  vest dipilih untuk kesan "quest guide" ringan, bukan representasi wajah
  siapa pun. Kalau ada preferensi desain karakter lain (rambut/aksesori
  beda), tinggal ganti bagian fringe/pigtail di generator tanpa mengubah
  struktur badan/vest.
- Pose tambahan **tidak** dibuat dulu (mis. duduk, berlari) — 6 di atas
  sudah menutup seluruh state percakapan yang teridentifikasi; tambah
  pose lain hanya kalau ada state baru yang butuh dibedakan visual.

---

## 4. Arsitektur

```
Browser (NalaWidget)
   │  POST /api/nala/chat  { message, history, page_context }
   ▼
Next.js Route Handler (/api/nala/chat)
   │  1. Susun system prompt (§6) + history + tools schema (§5)
   │  2. Panggil OpenRouter /chat/completions dengan tools
   ▼
OpenRouter (model dikonfigurasi via env, contoh: satu model yang support
tool calling — model spesifik **butuh dikonfirmasi**, lihat §10)
   │  Jika model minta tool_call →
   ▼
Route Handler mengeksekusi tool secara lokal (bukan model yang eksekusi):
   - baca `data/projects.json`, `data/publications.json`, `data/about.json`
     (sumber yang sama dipakai Mission auto-calc, Fase 5 — no data ganda)
   - hasil tool dikirim balik ke OpenRouter sebagai `tool` message
   │
   ▼
Model menyusun balasan akhir (teks) → Route Handler tentukan `expression`
dari jenis balasan (§7.2) → response dikirim ke browser:
   { reply, expression, suggested_chips, action? }
```

- **Tidak butuh Supabase** untuk versi awal Nala — semua tool baca dari
  `data/*.json` statis yang sudah ada di repo (sama seperti Mission
  auto-calc Fase 5). Tool yang butuh data dinamis (blog post publik)
  ditambah belakangan setelah backend Blog CMS (Implementation Plan #1)
  live — lihat §11 fase rollout.
- **Tidak butuh login** — Nala publik, berbeda dari World Chat.
- Streaming: direkomendasikan pakai streaming response (SSE) supaya teks
  muncul progresif dan terasa "hidup", tapi ini **opsional untuk MVP**,
  bisa non-streaming dulu di iterasi pertama.

---

## 5. Definisi Tools (Function Calling)

Semua tool **read-only** — Nala tidak pernah menulis data (tidak bisa
tambah item inventory, publish blog, dsb). Ini pagar keras, konsisten
dengan model single-owner (`gamification-system-overview.md` §11 poin 3).

Format schema mengikuti spesifikasi tool-calling OpenAI-compatible yang
didukung OpenRouter:

```json
[
  {
    "type": "function",
    "function": {
      "name": "get_profile_summary",
      "description": "Ambil ringkasan bio, brand personality, dan fokus terkini Mukhtada. Panggil ini untuk pertanyaan umum 'siapa kamu' / 'tentang Mukhtada'.",
      "parameters": { "type": "object", "properties": {}, "required": [] }
    }
  },
  {
    "type": "function",
    "function": {
      "name": "search_projects",
      "description": "Cari proyek berdasarkan kata kunci dan/atau tag stack (mis. 'AI tooling', 'fullstack', 'data science'). Selalu panggil ini sebelum menyebut detail proyek spesifik - jangan pernah mengarang nama/stack proyek.",
      "parameters": {
        "type": "object",
        "properties": {
          "query": { "type": "string", "description": "Kata kunci bebas" },
          "tags": { "type": "array", "items": { "type": "string" } }
        },
        "required": []
      }
    }
  },
  {
    "type": "function",
    "function": {
      "name": "get_project_detail",
      "description": "Ambil detail lengkap satu proyek (deskripsi, stack, link repo/demo, rarity tier) berdasarkan id dari hasil search_projects.",
      "parameters": {
        "type": "object",
        "properties": { "project_id": { "type": "string" } },
        "required": ["project_id"]
      }
    }
  },
  {
    "type": "function",
    "function": {
      "name": "search_publications",
      "description": "Cari publikasi/riset (judul, venue, tahun, sitasi, link Scholar). Sumber data sama dengan yang dipakai Mission Research - tidak boleh mengarang angka sitasi.",
      "parameters": {
        "type": "object",
        "properties": { "query": { "type": "string" } },
        "required": []
      }
    }
  },
  {
    "type": "function",
    "function": {
      "name": "get_player_stats",
      "description": "Ambil Player Points (PP) dan level Mukhtada saat ini beserta breakdown Achievement/Mission aktif - dipakai untuk pertanyaan tentang 'level berapa sekarang' atau 'achievement apa aja'.",
      "parameters": { "type": "object", "properties": {}, "required": [] }
    }
  },
  {
    "type": "function",
    "function": {
      "name": "get_contact_channels",
      "description": "Ambil daftar kanal kontak resmi (LinkedIn, Scholar, GitHub, email) berikut link portal-nya.",
      "parameters": { "type": "object", "properties": {}, "required": [] }
    }
  },
  {
    "type": "function",
    "function": {
      "name": "search_blog_posts",
      "description": "Cari artikel blog yang sudah publik (bukan draft). Hanya tersedia setelah backend Blog CMS live - lihat status fase.",
      "parameters": {
        "type": "object",
        "properties": { "query": { "type": "string" }, "category": { "type": "string" } },
        "required": []
      }
    }
  },
  {
    "type": "function",
    "function": {
      "name": "navigate_to",
      "description": "Instruksikan UI untuk scroll/pindah ke section atau halaman tertentu. Panggil ini saat jawaban akan lebih jelas kalau pengunjung melihat langsung section-nya, dan sertakan pose 'pointing' pada balasan.",
      "parameters": {
        "type": "object",
        "properties": {
          "route": { "type": "string", "description": "mis. /about, /projects, /research, /contact" },
          "anchor": { "type": "string", "description": "opsional, id elemen di halaman tsb" }
        },
        "required": ["route"]
      }
    }
  },
  {
    "type": "function",
    "function": {
      "name": "copy_to_clipboard",
      "description": "Salin teks (mis. alamat email) ke clipboard pengunjung dan picu Toast konfirmasi yang sudah ada di sistem.",
      "parameters": {
        "type": "object",
        "properties": { "text": { "type": "string" } },
        "required": ["text"]
      }
    }
  }
]
```

Catatan desain tool:

- **Tidak ada tool tulis/aksi berbahaya** — tidak ada `send_email`,
  `add_inventory_item`, `create_post`, dsb.
- `navigate_to` dan `copy_to_clipboard` adalah satu-satunya tool yang
  punya efek samping di browser, dan keduanya non-destruktif.
- Setiap tool fakta (`search_projects`, `search_publications`,
  `get_player_stats`, `get_contact_channels`, `search_blog_posts`) **wajib**
  dipanggil sebelum model menyatakan fakta spesifik apa pun tentang
  proyek/publikasi/statistik — ini dipaksa lewat instruksi system prompt
  (§6), bukan lewat pembatasan teknis tool itu sendiri.

---

## 6. Panduan System Prompt

Prinsip yang **wajib** ada di system prompt Nala (diturunkan langsung dari
`PRODUCT.md` — anti fabricated achievements/numbers adalah pelanggaran
paling serius yang bisa dilakukan Nala):

1. Nala adalah pemandu quest di portofolio Mukhtada — nada hangat, ringkas,
   tidak berlebihan memakai jargon game (label game harus terasa seperti
   sistem, bukan gimmick, sesuai Design Principle #1).
2. **Tidak pernah menyebut angka, nama proyek, judul publikasi, atau
   achievement tanpa memanggil tool terkait lebih dulu.** Kalau tool
   mengembalikan kosong/tidak cocok, jawab jujur ("belum ada datanya")
   dengan ekspresi `confused`, lalu arahkan ke `get_contact_channels`
   sebagai fallback ("boleh tanya langsung ke Mukhtada").
3. Tidak menjawab pertanyaan di luar cakupan portofolio (opini pribadi,
   topik tidak terkait) — tolak dengan sopan, tetap pakai persona.
4. Selalu Bahasa Indonesia kecuali pengunjung menulis dalam Bahasa Inggris
   (ikuti bahasa pengunjung).
5. Jawaban ringkas (2-4 kalimat per balasan) — panel chat kecil, bukan
   tempat esai panjang; untuk detail lebih, arahkan `navigate_to` ke
   halaman terkait.

---

## 7. Alur Interaksi & State Machine

### 7.1 Diagram state (ringkas)

```
closed → [klik FAB] → open:greeting (sekali per sesi)
open:greeting → [user kirim pesan] → open:thinking
open:thinking → [tool_call diperlukan] → open:thinking (loop, maks 3x)
open:thinking → [jawaban final siap] → open:reply(expression sesuai §7.2)
open:reply → [user kirim pesan baru] → open:thinking
open:* → [klik tutup / klik luar (desktop)] → closed
```

### 7.2 Pemetaan hasil → ekspresi

| Hasil | Ekspresi |
|---|---|
| Tool sukses, jawaban berisi proof konkret (proyek/publikasi/achievement) | `happy` |
| Tool dipanggil, sedang menunggu | `thinking` |
| Tool kosong / tidak ada match | `confused` |
| Jawaban menyertakan `navigate_to` | `pointing` |
| Pesan pembuka sesi | `greeting` |
| Semua kasus lain (jawaban netral/informatif biasa) | `idle` |

### 7.3 Quick-prompt chips (contoh awal, bukan daftar final)

- "Ceritain proyek AI tooling-nya"
- "Publikasi apa aja yang sudah terbit?"
- "Level & achievement sekarang berapa?"
- "Gimana cara hubungi Mukhtada?"

Chip kontekstual muncul lagi setelah balasan `pointing` (mis. "Bawa saya
ke sana" sebagai chip konfirmasi eksplisit — `navigate_to` **tidak**
langsung jalan otomatis tanpa konfirmasi pengunjung, supaya tidak terasa
seperti situs yang tiba-tiba mengambil alih scroll).

### 7.4 Tip proaktif (badge notifikasi FAB)

Dipicu event nyata saja (selaras prinsip Toast §8 `design-system.md` —
event-driven, bukan dekorasi):

- Pengunjung mencapai node "kamu di sini" di Journey Log (About) dan idle
  >8 detik → badge muncul, isi draft pesan: "Mau tau proyek yang lagi
  aku kerjain sekarang?"
- Pengunjung scroll sampai akhir halaman Contact tanpa klik kanal apa pun
  → badge: "Butuh bantuan milih kanal kontak?"

**[BUTUH KONFIRMASI #2]** — daftar trigger proaktif di atas contoh awal,
perlu direview supaya tidak terasa mengganggu ("interrupting" bertentangan
dengan Design Principle #4 "motion tactile tapi tenang").

---

## 8. Aksesibilitas

Mengikuti §11 `design-system.md` apa adanya, plus tambahan khusus Nala:

- Panel adalah `role="dialog"` `aria-modal` (mobile) / non-modal panel
  (desktop) dengan `aria-labelledby` ke judul "Nala".
- Thread pesan `aria-live="polite"` supaya screen reader mengumumkan
  balasan baru tanpa memotong yang sedang dibaca.
- FAB dan semua chip/tombol punya `:focus-visible` yang sama seperti
  §5 `design-system.md` — bisa dioperasikan penuh via keyboard (Tab ke
  FAB → Enter buka panel → Tab ke input).
- Idle-bob & typing indicator wajib nonaktif saat `prefers-reduced-motion`.
- Ekspresi Nala (SVG) diberi `aria-hidden="true"` di dalam bubble pesan
  (dekoratif, teks balasan yang membawa informasi) — potret di header
  panel dan FAB diberi `alt`/`aria-label` teks singkat.

---

## 9. Data & Privasi

- Riwayat percakapan **default: session-only**, disimpan di memori
  client (tidak dikirim ke storage permanen) untuk MVP.
- **[BUTUH KONFIRMASI #3]** — apakah percakapan Nala perlu disimpan
  (mis. tabel `nala_conversations` di Supabase, anonim per sesi) untuk
  tujuan analitik/perbaikan konten ke depan? Ini terkait langsung ke
  pertanyaan Privacy Policy yang sudah tercatat di
  `gamification-system-overview.md` §11 poin 7 — sebaiknya diputuskan
  bersamaan, bukan terpisah.
- Rate limit per sesi (mis. maks N pesan/menit) perlu ditentukan untuk
  mencegah penyalahgunaan biaya OpenRouter — nilai pasti **butuh
  konfirmasi** (§10).

---

## 10. Daftar Konfirmasi yang Dibutuhkan

1. Kejelasan pill "CHAT" pojok kiri-atas vs FAB Nala baru (§1).
2. Review daftar trigger tip proaktif (§7.4) — approve / revisi / hapus.
3. Kebijakan penyimpanan riwayat chat (§9), digabung dengan keputusan
   Privacy Policy yang sudah tertunda.
4. Model OpenRouter spesifik yang dipakai (nama model + fallback model
   kalau tool-calling gagal), termasuk budget/rate limit per sesi.
5. Streaming response — MVP non-streaming dulu atau langsung SSE?
6. Style rambut/aksesori karakter Nala (§3) — approve asumsi kuncir dua +
   vest, atau revisi arah desain.
7. Apakah `search_blog_posts` masuk MVP (tunggu backend Blog live) atau
   dihilangkan dulu dari tool list sampai siap?

---

## 11. Urutan Kerja yang Disarankan

1. Konfirmasi §10 dulu (terutama poin 1, 4, 6 — mempengaruhi UI & biaya).
2. Bangun 6 SVG ekspresi final (revisi dari draft di §12 kalau poin 6
   berubah) + `NalaFab`, `NalaPanel` sebagai komponen React reusable,
   mengikuti pola `react/components/*` yang sudah ada.
3. Bangun `/api/nala/chat` dengan tool set MVP (tanpa `search_blog_posts`
   dan `copy_to_clipboard`-toast-integration dulu jika Toast belum tersedia
   di route yang sama).
4. Uji seluruh state machine §7 pakai data `data/*.json` yang sudah nyata
   ada (bukan dummy) — pastikan tidak ada tool yang mengembalikan hasil
   mengarang.
5. Tambahkan `search_blog_posts` setelah backend Blog CMS (Implementation
   Plan #1) live.
6. Evaluasi tip proaktif (§7.4) setelah live beberapa minggu — matikan
   trigger yang terasa mengganggu berdasarkan feedback nyata, bukan
   asumsi di awal.

---

## 12. Deliverable Terkait Dokumen Ini

| File | Isi |
|---|---|
| `implementation-plan.md` | Dokumen ini |
| `nala-idle.svg`, `nala-happy.svg`, `nala-thinking.svg`, `nala-confused.svg`, `nala-greeting.svg`, `nala-pointing.svg` | 6 ekspresi/pose karakter, pixel-grid SVG, palet remap token existing |
| `mockup.html` | Preview interaksi FAB → panel → percakapan dummy, seluruh 6 ekspresi didemonstrasikan, termasuk koordinasi Toast §2.4 |