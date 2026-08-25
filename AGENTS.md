# Workflow Implementasi - Lapisan Gamifikasi "MB · NST"

> Dokumen ini adalah **prosedur kerja**, bukan spesifikasi desain. Spesifikasi
> ada di `report.md` (apa) dan `design-system.md` (bagaimana bentuknya).
> Dokumen ini mengatur **urutan, validasi, dan batas** - siapa/apa pun yang
> mengeksekusi (agent AI atau developer manusia) wajib mengikuti fase di
> bawah secara berurutan, tidak boleh lompat ke IMPLEMENT sebelum PLAN &
> CONFIRM selesai.

**Prinsip inti (non-negotiable):**

1. **Evidence-first** - setiap keputusan desain/implementasi harus bisa
   ditunjuk sumbernya (baris/bagian di `report.md`, `design-system.md`, atau
   `PRODUCT.md`). Tidak ada keputusan "karena rasanya bagus".
2. **Validated action** - tidak ada task yang ditandai selesai tanpa lolos
   Validation Gate (§5). Self-report tanpa checklist tidak dihitung selesai.
3. **Plan before act** - setiap task besar dipecah jadi task-plan tertulis
   (§4) sebelum kode ditulis. Task tanpa acceptance criteria tidak boleh
   dieksekusi.
4. **No silent assumption** - apa pun yang ditandai `[ASUMSI]` di
   `design-system.md` §1 (token warna rarity/tier) **wajib** dikonfirmasi
   pemilik proyek sebelum dipakai di kode produksi (lihat §6).
5. **Visual evidence over self-report** - "task selesai" tidak berarti apa-apa
   tanpa bukti visual. Setiap komponen yang diklaim selesai wajib disertai
   screenshot hasil render nyata (bukan deskripsi tekstual, bukan asumsi
   "seharusnya sudah benar berdasarkan kode"). Lihat §5 untuk prosedurnya.

---

## 0. Hierarki Sumber Kebenaran

Kalau ada konflik antar dokumen, urutan otoritas dari tinggi ke rendah:

| Prioritas | Dokumen | Isi | Boleh dioverride oleh? |
|---|---|---|---|
| 1 | `PRODUCT.md` | Brand personality, anti-reference, prinsip desain, target a11y | Hanya konfirmasi eksplisit pemilik proyek |
| 2 | `design-system.md` + `components/NUMBER-RATIONALE.md` | Token, struktur komponen, aturan a11y teknis | `PRODUCT.md`, konfirmasi pemilik proyek |
| 3 | `report.md` | Daftar penyesuaian gamifikasi, alasan, letak, prioritas | §1 dan §2 di atas |
| 4 | `TASKS.md` | Status kerja aktif/selesai | Update terus, bukan sumber desain |

Jika sebuah task di `report.md` bertentangan dengan `PRODUCT.md` (mis. anti-reference
"emoji-based gamification" vs pemakaian emoji sebagai icon di beberapa item report),
**PRODUCT.md menang** - icon emoji di report harus dibaca sebagai placeholder
konsep, bukan instruksi literal pakai emoji di produksi. Catat penyesuaian ini
di log keputusan (§7).

---

## 1. Guardrail Desain (Hard Rules)

Guardrail ini berlaku di **semua** fase, tidak bisa di-skip demi kecepatan.
Sumber: `PRODUCT.md` §Anti-references, `report.md` §8, `design-system.md`
Catatan Kepatuhan Brief & §11.

### 1.1 Larangan Keras (DO NOT)

- ❌ Jangan menambah dependency npm baru tanpa konfirmasi eksplisit pemilik
  proyek - semua efek (pulse, unlock, toast, ripple) harus dibangun dari
  Framer Motion / CSS murni yang sudah ada di stack.
- ❌ Jangan menambah hex color baru - semua warna baru harus **remap** dari
  token existing (lihat tabel `design-system.md` §1), dan tabel itu sendiri
  masih berstatus `[ASUMSI, MOHON DIKONFIRMASI]` sampai disetujui.
- ❌ Jangan membuat data fiktif: no fake XP/level backend, no fabricated
  achievement, no angka repo/sitasi palsu, no rarity yang tidak berdasar dari
  data nyata (assignment rarity di 2.2 harus mengikuti bobot pengalaman asli,
  bukan acak).
- ❌ Jangan menambah audio/sound feedback tanpa toggle mute eksplisit -
  di luar scope kecuali item terpisah dengan konfirmasi.
- ❌ Jangan menambah modal full-screen "level up" atau popup yang memutus
  alur baca - feedback harus non-blocking (toast).
- ❌ Jangan pakai emoji sebagai elemen gamifikasi permanen di produksi -
  `PRODUCT.md` eksplisit melarang "emoji-based gamification"; emoji di
  `report.md` adalah shorthand konsep saat drafting, bukan output final.
  Ganti dengan icon monoline/pixel sesuai `design-system.md`.
- ❌ Jangan pakai gradient/glow ala AI SaaS generik atau glass card -
  anti-reference eksplisit di `PRODUCT.md`.
- ❌ Jangan replay animasi unlock/reveal setiap kali elemen masuk-keluar
  viewport - one-time trigger, unobserve setelah trigger (`design-system.md` §7).
- ❌ Jangan biarkan toast menumpuk - queue, maksimal 1 tampil bersamaan
  (`design-system.md` §8).
- ❌ Jangan menyembunyikan custom cursor tanpa fallback di device
  `pointer: coarse` (`design-system.md` §11.3).

### 1.2 Kewajiban Aksesibilitas (MUST)

- ✅ Semua animasi loop (pulse ring, sweep, toast) **berhenti total** (bukan
  diperlambat) saat `prefers-reduced-motion: reduce`, tampilkan state akhir
  statis.
- ✅ Setiap efek `:active`/press-state punya padanan `:focus-visible` yang
  setara untuk navigasi keyboard.
- ✅ Elemen dekoratif murni (rarity tag, locked slot, HUD chip) →
  `aria-hidden="true"`. Elemen yang menyampaikan info baru (toast) →
  `aria-live="polite"`.
- ✅ Gamifikasi tidak boleh bergantung hanya pada warna - rarity/tier harus
  tetap terbaca lewat label teks, bukan warna saja.
- ✅ Target WCAG 2.1 AA kontras teks & akses keyboard di semua komponen baru.
- ✅ Tidak ada horizontal overflow akibat elemen baru (HUD strip, XP bar,
  toast) di breakpoint mobile.

---

## 2. Alur Kerja (6 Fase)

```
DISCOVER → PLAN → CONFIRM → IMPLEMENT → VALIDATE (screenshot + triase) → LOG
   ↑                                                                       │
   └───────────────────────── revisi jika gate gagal ─────────────────────┘
```

### Fase 1 - DISCOVER (baca sebelum tulis kode)

Tujuan: memastikan agent/dev punya konteks lengkap sebelum membuat keputusan apa pun.

1. Baca `PRODUCT.md` penuh - catat brand personality & anti-reference.
2. Baca `design-system.md` penuh - catat token, struktur komponen per §,
   dan semua item `[ASUMSI]`.
3. Baca `report.md` penuh - catat per item: elemen, fungsi, letak, alasan.
4. Baca `TASKS.md` - cek task aktif yang mungkin overlap (mis. "Improve Home
   performance" bisa konflik dengan penambahan parallax sprite 1.3 atau
   custom cursor 6.2 - keduanya menambah beban render).
5. Hasil fase ini: daftar mentah semua item kerja + flag konflik/ambiguitas.
   **Tidak boleh menulis kode di fase ini.**

**Gate keluar Fase 1**: daftar item report.md × mapping komponen
(`design-system.md` §12) sudah lengkap 1:1, tidak ada item report yang tidak
punya komponen padanan, dan tidak ada komponen yang tidak punya item report
sumber.

---

### Fase 2 - PLAN (pecah jadi task-plan terstruktur)

Setiap item report.md diubah jadi entri task memakai **Template Task** (§4).
Urutan prioritas mengikuti `report.md` §7 (Quick win → Medium → Higher
effort), **kecuali** ada dependency teknis yang memaksa urutan lain (contoh:
XP Scroll Bar 1.2 butuh z-index di atas navbar pill - pastikan token
`z-index` navbar sudah fix sebelum implement 1.2).

Output Fase 2: file/board task (bisa ekstensi dari `TASKS.md`) berisi semua
task dengan status `planned`, masing-masing sudah punya acceptance criteria.

**Gate keluar Fase 2**: setiap task punya (a) sumber referensi, (b) letak
persis, (c) acceptance criteria terukur, (d) daftar guardrail §1 yang relevan
dicentang sebagai "akan dipatuhi".

---

### Fase 3 - CONFIRM (checkpoint wajib untuk item beresiko)

Sebelum implementasi dimulai, task berikut **wajib** dikonfirmasi pemilik
proyek - implementasi tanpa konfirmasi ini dianggap pelanggaran guardrail:

| Item | Alasan wajib konfirmasi |
|---|---|
| Tabel warna rarity/tier (`design-system.md` §1) | Ditandai `[ASUMSI]` eksplisit di sumber |
| Skema warna final: skema 1 vs skema 2 | Skema 2 disebut "belum didefinisikan di brief" |
| Assignment rarity per experience card (2.2) | Menentukan bobot COMMON/RARE/EPIC per entri butuh input pemilik data, bukan tebakan agent |
| Assignment medal tier per achievement (2.6) | Sama alasan - nasional vs sekolah harus dikonfirmasi pemetaannya, bukan diasumsikan dari judul |
| Command palette (6.3): status saat ini fungsional/dekoratif? | Report menandai ini sebagai kemungkinan "broken promise" - perlu verifikasi kondisi aktual sebelum di-scope sebagai bug-fix vs fitur baru |
| Skill Tree berjenjang (2.4) vs alternatif progress bar (2.5) | Perubahan struktural - pilih salah satu di awal, jangan kerjakan dua-duanya |

Jika pemilik proyek belum merespons, task terkait **tetap `blocked`**, tidak
boleh masuk Fase 4 dengan asumsi default dari agent.

---

### Fase 4 - IMPLEMENT (satu komponen per siklus)

Aturan eksekusi:

1. Satu komponen/task per siklus commit - jangan gabung beberapa item
   report.md jadi satu perubahan besar (memudahkan validasi & rollback).
2. Ikuti urutan: **Global dulu, baru per-halaman** - karena beberapa
   komponen global (Press State §5, XP Bar §3, Toast §8) dipakai lintas
   halaman; membangunnya lebih dulu mencegah rework.
   - Urutan disarankan: `Press State (1.4/3.1)` → `XP Scroll Bar (1.2)` →
     `Toast system (6.1)` → baru masuk ke komponen per-halaman
     (`Rarity Tag`, `Journey marker`, `Portal hover`, dst).
3. Setiap komponen dibangun mengikuti struktur HTML/CSS persis seperti di
   `design-system.md` (class name, posisi, unit ukuran) - jangan improvisasi
   struktur baru tanpa alasan teknis yang dicatat.
4. Reduced-motion & focus-visible **ditulis bersamaan** dengan animasi utama,
   bukan ditambahkan belakangan sebagai "task terpisah".
5. Setelah satu komponen selesai, jangan lanjut ke komponen berikutnya
   sebelum lolos Fase 5.

---

### Fase 5 - VALIDATE (Validation Gate)

Validasi dilakukan **per komponen**, bukan sekali di akhir proyek, dan **tidak
boleh berbasis self-report tekstual saja**. Prosedurnya dibagi tiga langkah:
(5.1) ambil screenshot, (5.2) analisis screenshot terhadap checklist, (5.3)
triase & perbaiki. Task tidak boleh ditandai `done` di `TASKS.md` sebelum
ketiga langkah ini selesai dan semua baris checklist ✅.

#### 5.1 Ambil Screenshot (wajib, sebelum menandai apa pun selesai)

Agent **wajib** menangkap bukti visual nyata dari hasil render, bukan
menyimpulkan dari kode saja. Gunakan tooling browser automation yang sudah
tersedia di stack (mis. Playwright/Puppeteer lewat skrip Node, atau devtools
screenshot di browser yang dijalankan agent) untuk mengambil:

- **Multi-viewport**: minimal desktop (≥1280px) dan mobile (375px); tambahkan
  tablet (768px) jika komponen berada di area yang diketahui rawan overflow
  (HUD strip, XP bar - lihat §1.2).
- **Multi-state**: default, `:hover`/`:focus-visible` (untuk item interaktif
  di 3.3, 9, cursor kustom 6.2), state "setelah trigger" untuk animasi
  one-time (2.3, unlock reveal), dan state `prefers-reduced-motion: reduce`
  (emulasikan lewat DevTools/Playwright `page.emulateMedia`) untuk memastikan
  animasi loop benar-benar berhenti, bukan cuma diperlambat.
- **Multi-halaman** kalau komponen global (Press State, XP Bar, Toast)
  dipakai di beberapa halaman - screenshot tiap halaman yang memakainya,
  jangan asumsikan konsisten dari satu contoh saja.

Simpan tiap screenshot dengan nama yang bisa ditelusuri ke task, mis.
`validation/2.3-kamu-di-sini/mobile-default.png`,
`.../desktop-reduced-motion.png`. Path ini dicatat di field "Screenshot
evidence" pada Template Task (§4).

#### 5.2 Analisis Screenshot terhadap Checklist

Agent membaca ulang tiap screenshot **secara visual**, dibandingkan poin per
poin dengan checklist gate di bawah dan dengan spesifikasi di `report.md` /
`design-system.md`. Untuk hal yang tidak bisa dipastikan lewat mata saja
(kontras angka pasti, nilai computed style, class name yang benar-benar
terpasang), lengkapi dengan pemeriksaan terprogram (ekstrak computed style /
DOM lewat skrip yang sama yang mengambil screenshot, atau tool aksesibilitas
seperti axe-core) - **screenshot untuk kebenaran visual, ekstraksi DOM/style
untuk kebenaran numerik**, jangan menebak angka kontras dari mata.

**Gate Fungsional**
- [ ] Elemen muncul tepat di letak yang disebut di `report.md`.
- [ ] Struktur HTML/class sesuai `design-system.md` untuk komponen ini.
- [ ] Tidak ada data yang di-fabricate (angka, rarity, medal - semua
      berdasar data nyata/terkonfirmasi, lihat Fase 3).

**Gate Guardrail (§1)**
- [ ] Tidak ada dependency baru ditambahkan (cek `package.json` diff = 0
      untuk npm packages).
- [ ] Tidak ada hex color baru di luar token yang dikonfirmasi.
- [ ] Tidak ada emoji permanen di markup produksi.
- [ ] Tidak ada modal blocking / audio ditambahkan.

**Gate Aksesibilitas**
- [ ] `prefers-reduced-motion: reduce` diuji manual - animasi loop berhenti,
      state akhir statis tetap tampil.
- [ ] Navigasi keyboard (Tab) mencapai elemen interaktif baru dan
      `:focus-visible` terlihat setara dengan `:active`.
- [ ] `aria-hidden`/`aria-live` dipasang sesuai kategori elemen (§1.2).
- [ ] Cek kontras teks komponen baru terhadap background (target AA).
- [ ] Diuji di viewport mobile - tidak ada horizontal scroll baru.
- [ ] Jika ada hover-only interaction (3.3, 9), pastikan ada padanan
      touch (tap-hold atau tap-to-reveal), bukan fitur yang hilang di mobile.

**Gate Performa** (relevan karena ada task aktif "Improve Home performance"
di `TASKS.md`)
- [ ] Komponen baru di Home (HUD strip 1.1, XP bar 1.2, sprite parallax 1.3)
      tidak menambah beban render yang memperparah lag hero yang sudah
      tercatat sebagai isu aktif - ukur sebelum/sesudah jika memungkinkan.

Asumsikan sejak awal bahwa satu batch screenshot **akan** menunjukkan lebih
dari satu masalah sekaligus (mis. sekaligus overflow mobile, kontras kurang,
dan posisi meleset dari spesifikasi). Itu bukan tanda proses gagal - itu
alasan langkah 5.3 ada. Jangan berhenti di temuan pertama; catat **semua**
penyimpangan yang terlihat di setiap screenshot sebelum masuk ke triase.

#### 5.3 Triase & Perbaikan (saat screenshot menunjukkan banyak masalah)

Ketika satu putaran screenshot menghasilkan beberapa temuan sekaligus, agent
memutuskan urutan perbaikan pakai prioritas berikut - **dari atas ke bawah**,
bukan berdasar mana yang paling mudah diperbaiki dulu:

| Prioritas | Kategori | Contoh | Tindakan |
|---|---|---|---|
| P0 - Blocker guardrail | Melanggar larangan keras §1.1 (hex baru, dependency baru, emoji produksi, modal blocking) | Warna rarity ternyata pakai hex baru di luar token | **Wajib** diperbaiki sebelum lanjut apa pun; jika perbaikannya butuh token baru → eskalasi ke Fase 3 CONFIRM, jangan tebak sendiri |
| P1 - Fungsional gagal | Elemen tidak muncul di letak yang benar, data ternyata fabricated, struktur HTML menyimpang dari `design-system.md` | Rarity tag muncul di posisi berbeda dari report.md §2.2 | Perbaiki dalam siklus task ini juga, sebelum re-screenshot |
| P2 - Aksesibilitas gagal | Reduced-motion tidak berhenti, fokus keyboard tidak terlihat, kontras di bawah AA, overflow mobile | Toast tidak berhenti animasi saat reduced-motion aktif | Perbaiki dalam siklus task ini juga - ini bagian dari acceptance criteria (§4), bukan opsional |
| P3 - Performa | Render tambahan memperparah isu "Improve Home performance" yang sudah aktif | XP bar scroll listener bikin jank di hero Home | Perbaiki jika penyebabnya jelas dari komponen ini; jika perlu investigasi lebih luas (bukan hanya komponen ini), catat sebagai temuan terpisah di `TASKS.md` - jangan diam-diam melebarkan scope task saat ini (lihat §8) |
| P4 - Kosmetik minor | Spasi 1-2px, warna sedikit meleset dari token yang sama, alignment sub-pixel | Padding tag 6px vs 8px di desain | Perbaiki kalau perbaikannya trivial (satu baris CSS) di siklus yang sama; kalau tidak trivial, catat di `TASKS.md` bagian "Someday" alih-alih memaksakan perbaikan yang berisiko menyentuh komponen lain |

Aturan tambahan triase:

1. **Perbaiki P0-P2 sebelum menandai task apa pun `validated`.** P3/P4 boleh
   dicatat sebagai temuan terpisah kalau perbaikannya berisiko melebarkan
   scope task saat ini - tapi harus dicatat, tidak boleh diam-diam diabaikan.
2. **Batasi siklus screenshot→analisis→perbaikan maksimal 3 putaran** untuk
   satu komponen. Kalau setelah 3 putaran masih ada temuan P0/P1 yang belum
   selesai, ini sinyal spesifikasi ambigu atau task terlalu besar - hentikan,
   eskalasi ke Fase 3 (CONFIRM) atau pecah task jadi lebih kecil, jangan terus
   coba-coba tanpa batas.
3. **Setelah tiap perbaikan, ambil screenshot ulang** (regresi check) untuk
   memastikan perbaikan tidak merusak gate yang sebelumnya sudah lolos (mis.
   memperbaiki overflow mobile tapi jadi merusak focus-visible desktop).
4. **Jangan memperbaiki temuan di luar scope komponen yang sedang dikerjakan**
   meskipun terlihat di screenshot yang sama (mis. sambil validasi Toast,
   terlihat bug lama di Navbar) - catat sebagai item baru di `TASKS.md`
   bagian "Someday" per §8, jangan sekalian diperbaiki di siklus ini.

Jika ada satu baris gate gagal dan belum diperbaiki → task kembali ke status
`in-progress`, **tidak** lanjut ke komponen berikutnya.

---

### Fase 6 - LOG (jejak keputusan)

Setiap task yang lolos Fase 5:

1. Update `TASKS.md`: pindahkan dari Active → Done, dengan tanggal, mengikuti
   format yang sudah dipakai di file (`~~judul~~ (tanggal)`).
2. Catat di changelog/commit message: item report.md nomor berapa, sumber
   desain-nya di `design-system.md` bagian mana, dan path screenshot final
   yang jadi bukti lolos gate (§5.1).
3. Jika selama implementasi ada penyimpangan dari spesifikasi (mis. warna
   diganti karena kontras gagal AA), catat **alasan + evidence** (hasil test
   kontras, screenshot sebelum/sesudah), jangan diam-diam diubah.
4. Jika ada temuan P3/P4 (§5.3) yang sengaja tidak diperbaiki di siklus ini,
   catat sebagai item baru di `TASKS.md` bagian "Someday" dengan referensi
   screenshot yang menunjukkan temuannya - jangan hilang begitu saja setelah
   task ditandai `done`.

---

## 3. Diagram Alur Singkat

```
report.md item ──┐
design-system §  ──┼──> DISCOVER ──> PLAN (Template §4) ──> [ASUMSI?] ──yes──> CONFIRM (blocked sampai dijawab)
PRODUCT.md rules ─┘                                              │no
                                                                   ▼
                                                              IMPLEMENT
                                                                   │
                                                                   ▼
                                                    ┌── VALIDATE ─────────────────────┐
                                                    │ 5.1 screenshot (multi-viewport/  │
                                                    │     multi-state)                 │
                                                    │ 5.2 analisis vs checklist gate    │
                                                    │ 5.3 triase P0→P4, perbaiki,       │
                                                    │     re-screenshot (maks 3 putaran)│
                                                    └───────────────┬──────────────────┘
                                                          fail ─────┤  pass
                                                                    │   │
                                                                    │   ▼
                                                                    │  LOG → TASKS.md
                                                                    └──> kembali ke IMPLEMENT
```

---

## 4. Template Task (wajib diisi sebelum IMPLEMENT)

Salin blok ini untuk setiap item report.md sebelum mulai coding:

```
### Task: [nomor & nama item report.md, mis. "2.3 - Kamu di Sini Marker"]

- Sumber spesifikasi: report.md §2.3, design-system.md §6
- Halaman/letak persis: [salin letak dari report.md]
- Elemen & struktur: [salin struktur dari design-system.md, jangan improvisasi]
- Dependency baru dibutuhkan?: TIDAK (default) / YA → berhenti, eskalasi ke CONFIRM
- Token warna baru dibutuhkan?: TIDAK (default) / YA → berhenti, eskalasi ke CONFIRM
- Butuh konfirmasi data (rarity/medal/dsb)?: [ya/tidak + apa yang perlu dikonfirmasi]
- Acceptance criteria:
  1. [kriteria fungsional terukur]
  2. [kriteria a11y terukur]
  3. [kriteria guardrail terukur]
- Guardrail relevan dari §1: [list nomor larangan/kewajiban yang berlaku]
- Screenshot evidence: [path folder validation/<task>/..., viewport & state yang dicakup]
- Temuan triase (jika ada): [daftar P0-P4 dari §5.3 + status masing-masing: fixed / deferred ke TASKS.md]
- Status: planned / blocked / in-progress / validated / done
```

---

## 5. Matriks Prioritas (dari report.md §7 - dipatuhi, tidak diurutkan ulang tanpa alasan)

| Tier | Item | Effort | Catatan eksekusi |
|---|---|---|---|
| Quick win | 1.4 Button press state | Rendah | Kerjakan pertama - dipakai semua CTA/pill lain |
| Quick win | 3.2 Tier color differentiation | Rendah | Tidak butuh token baru - remap dari §1 setelah dikonfirmasi |
| Quick win | 3.4 / 4.2 Count-up stat & stat-chip | Rendah | Manual `requestAnimationFrame`, bukan lib `react-countup` |
| Quick win | 5.1 Contact card hover lift | Rendah | Warna aksen ambil dari gradient card existing, bukan token baru |
| Quick win | 2.3 "Kamu di sini" marker | Rendah | Wajib reduced-motion check sejak awal (§1.2) |
| Medium | 1.2 Scroll progress XP bar | Sedang | Pastikan z-index di atas navbar pill (lihat §2 Fase 2) |
| Medium | 2.2 Rarity tag Experience card | Sedang | **Blocked** sampai Fase 3 (assignment rarity) dikonfirmasi |
| Medium | 2.6 Medal icon Achievement | Sedang | **Blocked** sampai Fase 3 (assignment medal) dikonfirmasi |
| Medium | 6.1 Toast notification (versi sederhana) | Sedang | Mulai dari 1–2 trigger saja sesuai report, jangan over-scope |
| Tinggi/opsional | 2.4 Skill Tree berjenjang | Tinggi | Pilih vs 2.5 di Fase 3, jangan kerjakan dua-duanya |
| Tinggi/opsional | 3.3 Card hover reveal detail | Tinggi | Wajib padanan touch (tap-hold) |
| Tinggi/opsional | 6.2 Custom cursor | Tinggi | Wajib fallback `pointer: coarse` (§1.2) |
| Tinggi/opsional | 6.3 Command palette fungsional | Tinggi | **Verifikasi dulu** status aktual sebelum di-scope (lihat Fase 3) |

---

## 6. Protokol Eskalasi untuk Item `[ASUMSI]`

1. Saat DISCOVER/PLAN menemukan item bertanda `[ASUMSI]` atau butuh data
   yang tidak ada di dokumen (rarity, medal tier, skema warna final),
   task **otomatis** berstatus `blocked`, bukan `planned`.
2. Tulis pertanyaan konfirmasi spesifik (bukan pertanyaan terbuka), contoh
   yang benar: *"Experience card 'Vice President' - apakah rarity EPIC
   sesuai bobot organisasi, atau ada mapping lain yang diinginkan?"*
   - bukan *"warna apa yang mau dipakai?"*.
3. Jangan pernah default ke asumsi sendiri untuk item berdampak data/branding
   hanya karena ingin lanjut jalan. Item non-blocking (mis. detail animasi
   timing yang sudah dispesifikasikan angka pastinya di design-system.md)
   tidak perlu eskalasi - itu bukan `[ASUMSI]`, itu sudah spesifikasi final.
4. Setelah dikonfirmasi, catat jawaban di §7 (Log Keputusan) sebelum lanjut
   IMPLEMENT - konfirmasi lisan/chat yang tidak dicatat dianggap belum ada.
5. Temuan dari analisis screenshot (§5.2-5.3) yang ternyata butuh keputusan
   desain baru (bukan sekadar bug teknis) - mis. layout ternyata harus
   diubah struktural untuk memperbaiki overflow - mengikuti protokol yang
   sama: `blocked` sampai dikonfirmasi, bukan diputuskan sepihak oleh agent.

---

## 7. Log Keputusan

Gunakan tabel ini untuk mencatat setiap konfirmasi/penyimpangan dari spesifikasi asal (isi seiring proyek berjalan):

| Tanggal | Item | Pertanyaan/Isu | Keputusan | Sumber otorisasi |
|---|---|---|---|---|
| 2026-07-03 | PlayerStatusPopup PP/rarity/threshold | `plans/player-status-popup-system.md` menandai skala poin, threshold level, dan mapping item sebagai asumsi yang perlu konfirmasi. | Implement memakai nilai plan sebagai arahan eksplisit, tetapi semua progress mission tetap dihitung dari `lib/data.js` dan ikon emoji diganti sprite monoline sesuai `PRODUCT.md`. | Permintaan user: "implement all the plan in plans/" |
| 2026-07-03 | Google Auth.js dependency dan OAuth credential | Plan §0 memblokir dependency/credential auth sampai dikonfirmasi. | Tambah `next-auth` untuk Google login. Credential hanya disimpan di `.env.local`; role owner tidak diberikan sampai `OWNER_EMAIL` diisi eksplisit. | Permintaan user: "setup google auth config" beserta credential OAuth |
| 2026-07-03 | Static export vs OAuth callback | `output: "export"` tidak dapat menghasilkan route handler Auth.js `/api/auth/[...nextauth]`. | Default build diubah menjadi Next.js server build. Artifact HTML statis lama tetap ada, tetapi build baru memerlukan runtime Node agar Google OAuth berfungsi. | Build failure evidence: Next.js menolak dynamic auth route saat static export |
| 2026-07-03 | Supabase round-robin backend setup | Direct `psql` to `db.<project-ref>.supabase.co` reached the host but rejected `.env.local` `DB_PASSWORD` for user `postgres`; regional pooler fallback rejected the tenant/user. | Backend adapter/routes/schema are implemented and `.env.local` can be synced from local docs, but remote schema application remains blocked until the correct Supabase database connection/password is supplied. | Validation evidence: `npm run supabase:setup` failed with password auth; `/api/backend/records` create showed schema missing on an uninitialized shard. |
| 2026-07-03 | Supabase feature migration resolved | User reset the Supabase database password and confirmed all three projects use the same password. | Applied schema and seed data to all three `public` schemas; Blog, Chat, Inventory, About, and Contact APIs now read from Supabase with no schema warnings. Tables live in `public`; `private` only stores the backend app-key helper. | Validation evidence: `npm run supabase:setup`, `npm run supabase:seed`, `/api/backend/health`, `/api/blog/posts`, `/api/chat/messages`, and screenshots in `screenshots/backend-feature-2026-07-03/`. |
| 2026-07-04 | Player HUD plan assumptions | The plan asks to confirm System Integrity semantics, avatar option, and the two-action collapsed layout. | Treat the request to implement the complete plan as approval of its recommended real-data System Integrity model and separate Chat/HUD actions. Use the real user-provided profile image crop for the static pixel avatar, retain a generated SVG fallback, and preserve auth actions inside the HUD card. Final multi-viewport and reduced-motion evidence is in `screenshots/player-hud-2026-07-04/`. | User request: "implementasikan player-hud-implementation-plan"; validation: `plans/player-hud-implementation-plan/execution-checklist.md`. |
| 2026-07-04 | Nala AI NPC persistence and model fallback | `plans/ai-npc-plan/implementation-plan.md` says Nala MVP can avoid Supabase, but the user explicitly requested database migration; OpenRouter env was not present locally. | Added `public.nala_conversations` and `public.nala_messages` to all shards for backend-only conversation storage. `/api/nala/chat` is OpenRouter-ready when env exists and otherwise uses deterministic factual tools from local/backend data, with no fabricated portfolio facts. Fixed validation issues found in screenshots: tokenized search, user `tool_payload`, mobile FAB overlap, and desktop thread auto-scroll. | User request: "Sepertinya kita akan butuh migrasi database"; validation: `npm run supabase:setup`, DB readback of `s2_3f06ffe585b0440ca478fd328f897fbc`, `npm run build`, and screenshots in `screenshots/ai-npc-nala-2026-07-04/`. |
| 2026-07-30 | Hero entity interaction and motion | `plans/hero-entity.md` requested watchtower shooting; the user explicitly replaced it with direct touch → spark. The user then required natural motion, click-only activation, and a nearby dodge rather than fleeing. | Excluded watchtower, crosshair, projectile, score, and toast. Generated six optimized 4-frame transparent WebP sheets. Replaced uncorrelated CSS waypoint drift with a continuous species curve compiled to one cancellable `Element.animate()` sequence; direct rAF transform updates caused Hero/WebGL screenshot tearing and were removed. Hover has no state effect; click/tap or Enter/Space sparks, dodges within the Hero, then resumes flight. | User requests in this task; validation: `npm run build`, native-animation state/position checks, keyboard/focus/reduced-motion checks, and screenshots in `validation/hero-entities-2026-07-30/`. |
| 2026-07-30 | Supabase shard `s1` migration | Project ref `bmidlseqfflcswamyhtd` had not received the backend schema and its Realtime channel could not join before the project became reachable. | Applied the existing idempotent `docs/supabase/schema.sql` to `s1` atomically. The security advisor then identified mutable search paths in two source functions, so both functions now explicitly set `search_path = public, pg_temp`; the final advisor result has no warnings. | User request: "s1 havent been migrated yet,migrate it"; validation: live DB assertions for chat table/RLS/trigger/publication plus a `SUBSCRIBED` WebSocket client on `chat:public`. |
| 2026-08-22 | Convex offline migration and World Chat cutover | The legacy Supabase databases were declared inaccessible, so old chat, events, files, generic records, and Nala history could not be trusted or reconstructed. | Recovered only repository-auditable data through a deterministic JSONL/checksum seed script, then generated/backfilled Convex tables with `@convex-dev/migrations`. Replaced Supabase runtime adapters and polling/Broadcast chat with a reactive Convex subscription. Nala persistence remains disabled pending the separate Convex Agent decision. Production import remains an explicit cutover step. | User requests: "act that the old database can no longer accessible" and "lets migrate... use migration script when generating tables"; validation: `npm run convex:migrate`, `npm run convex:typecheck`, `npm run build`, two-client reactive smoke/cleanup, and `validation/convex-world-chat/`. |
| 2026-08-23 | World Chat moderation and live configurable Nala | The user required replies, deletion restricted to `mukhtadanasution@gmail.com`, live OpenRouter-only Nala, six response expressions, and an initially unlocked then owner-locked `/manage`. The user later selected `nvidia/nemotron-3-ultra-550b-a55b:free` while keeping the model editable. | Added same-table reply relations with deleted-parent redaction, idempotent owner/backend soft deletion, a singleton Convex Nala config without the API key, bounded factual tool calls, numeric grounding, honest provider failures, and the responsive hardcard management workbench. Conversation persistence remains disabled; the temporary validation chat row was soft-deleted after evidence capture. | User requests in this task; live model/API/auth checks, `npm run convex:typecheck`, repeated production builds, and screenshots in `validation/manage-world-chat-nala-seo/`. |
| 2026-08-23 | Nala provider reliability and cross-model compatibility | A captured mobile failure duplicated the user prompt on manual retry, and Nemotron could serialize tool markup instead of prose. The owner then required compatibility with every configurable model. | Moved factual tool selection/execution entirely server-side and send every configured OpenRouter chat model plain verified context instead of requiring provider function calling. Added one bounded transient retry, invalid-route/tool-markup guards, a public route allowlist, and a retry-in-place UI that keeps one user turn. Navigation is a real link. | User screenshot and explicit “compatible with all the models” request; API/type/build checks and screenshots in `validation/nala-reliability-2026-08-23/`. |
| 2026-08-23 | Public SEO origin and unknown Blog timestamps | The serving portfolio origin was uncertain between the apex and `me` subdomain, and migrated published Blog rows reported `updatedAt: 0`. | Verified `https://me.mukhtada.my.id` serves the portfolio and made it the canonical fallback. Added sitemap, robots, manifest, SVG icon, generated social image, per-route metadata, and repository-grounded `WebSite`/`ProfilePage`/`Person` JSON-LD. Unknown timestamps omit `lastmod` instead of producing a false 1970 date; all private/state/API routes remain outside the sitemap. | Live HTTP origin check; primary Next.js/Google documentation; production-response assertions and `validation/manage-world-chat-nala-seo/seo/`. |
| 2026-08-23 | Caelestia README Blog and image block persistence | The user requested a new Blog post from the current Caelestia Island Suite README and required real image rendering. The existing `image` block stored only a caption and rendered an icon placeholder; a runtime-only post would also be deleted by the next table-scoped seed replacement. | Extended the backward-compatible block validator with optional `src` and `alt`, added owner-editor URL/alt/caption controls, rendered responsive lazy images, and published the README as 54 native blocks with six commit-pinned screenshots. Added an idempotent bridge publisher and included the same payload in the deterministic four-post seed without rerunning destructive import. | User request; `npm run convex:typecheck`, Convex push/readback, repeat publisher, deterministic seed hash, isolated production build, and screenshots in `validation/caelestia-island-suite-blog/`. |
| 2026-08-23 | Portfolio README Blog, Convex image storage, and renamed environment boundary | The user requested the current guided-tour README as a Blog post, required every block image to be uploaded to Convex instead of copied into the project, changed the Convex environment names to `CONVEX_CLOUD_URL` and `CONVEX_HTTP_URL`, and explicitly prohibited restoring the removed public-prefixed variable. | Published 95 native blocks and preserved the five-post deterministic seed with stable image asset keys. The publisher uploads four screenshots to Convex Storage, deduplicates by SHA-256, and stores `_storage` IDs; Blog reads resolve fresh URLs and recover through the indexed asset key after an interrupted replacement. The owner block editor now uploads images through the protected file route. Server and browser clients use the normalized cloud URL, while the `.convex.site` HTTP Actions origin remains distinct. | User requests in this task; official Convex storage/client documentation via Context7; two publisher runs (4 uploaded, then 4 reused), Convex push, API readback, deterministic seed hash, type/build gates, and desktop/mobile evidence in `validation/mukhtadas-portfolio-blog/`. |
| 2026-08-23 | GenBI Jambi rebranding project review | The supplied source contained a full Git snapshot and eight showcase PNG files, while the Blog requires storage-backed image blocks. Two Prestasi captures were byte-identical, and the repository had grown beyond a visual rebrand into public content, CMS, attendance, points, books, and role-separated finance features. | Published an evidence-based 40-block Indonesian review with seven unique images. Each image is checksum-deduplicated in Convex Storage and persisted through `storageId` plus `assetKey`; no project path or durable storage URL is stored in the payload. The prose was drafted with `anti-ai-slop-writing`, reviewed with `unslop`, and keeps concrete criticism of the dual PHP/Laravel source trees and repeated finance code. | User request; repository and screenshot audit; two publisher runs (7 uploaded, then 7 reused); API/file checksum readback; stable seven-post seed; type/build gates; desktop/mobile evidence in `validation/genbi-rebranding-blog/`. |
| 2026-08-23 | Blog reader, whole-app phases, image ingestion, and engagement | The owner reported missing list markers, raw flowchart source, unmarked `.md` filenames, non-interactive images, Hero-only themes, uncompressed editor images, and absent upvote/comment features. | Added safe structured inline rendering and a bounded SVG flowchart subset, native-dialog image inspection, semantic phase aliases inherited by all routes, quality-first WebP compression with server signature checks, transactional anonymous-browser votes, and authenticated soft-deletable comments. No dependency, color literal, raw HTML, seed vote, or active test comment was left behind. | User request; Mermaid/Convex/MDN primary documentation, Convex reviewer/security passes, API mutation-and-cleanup probes, and desktop/375 px evidence in `validation/blog-reading-theme-engagement-2026-08-23/`. |
| 2026-08-24 | GPT-6 Astra rumor chronology and evidence boundary | The user requested the first person behind the GPT-6 Astra rumor, but an absolute first across deleted, private, and unindexed posts cannot be proven. The earliest vague GPT-6-adjacent hint and the earliest explicit GPT-6 claim also predated the first public Astra/GPT-6 connection. The user then required English prose, a stronger hook/CTA, and removal of meta captions about generated or leaked imagery. | Published the qualified result instead of collapsing three events: Chris posted an unnamed hint first, Leo supplied the earliest traceable explicit GPT-6 rumor, and The Information's three-reporter report supplied the earliest traceable Astra/GPT-6 link. The final 42-block English story opens on the unsupported details that accumulated around a real model and closes with a three-source verification CTA. Nine Browser captures and two editorial images live in Convex Storage through stable asset keys; captions describe their narrative role without generation/leak disclaimers, and Blog blocks persist no project path or delivery URL. | User research/Blog request and revision; dated X sources, The Information, first-party OpenAI posts, idempotent publisher runs, stable nine-post seed, type/build gates, and desktop/375 px evidence in `validation/gpt-6-astra-rumor-blog/`. |
| 2026-08-24 | English site and Blog reader polish | The user required every `/blog/[slug]` surface and then the whole website to use English, while screenshots and official Indonesian project/publication titles still contain factual source-language text. The image preview label also needed to become an icon and article tables needed a visual upgrade. | Translated shared, admin, player, Nala, management, fallback, and published-article copy while preserving proper names and explicitly identified source quotations. Known legacy Convex captions/contact labels are normalized at the read boundary without replacing an owner-authored English biography, and the deterministic seed is now English. Reused the existing sprite/token system for a 44 px fullscreen control and semantic hardcard tables with local mobile scrolling; added no dependency or color literal. | User request; `impeccable` polish/brand review and `anti-slop` prose review; live slug-scoped Convex publisher readback; seed/type/build gates; desktop/375 px evidence and measured DOM/CSS results in `validation/blog-english-reader-polish-2026-08-24/`. |
| 2026-08-24 | Ox Alpha provider identity and evidence weighting | The anonymous OpenRouter preview exposed several technical clues, but no primary source named its exact checkpoint. Early community benchmark headlines also used a 10-task sample before the full 113-task run completed. | Published the evidence-calibrated conclusion: Z.ai is the likely upstream operator and the trail points strongly to the GLM-5 family, while the exact checkpoint remains unproven. The article distinguishes direct evidence, technical fingerprinting, inference, and rumor; three generated illustrations are separate from four linked source captures. Seven assets persist by `storageId` plus stable `assetKey`. | User request in the referenced Ox Alpha task; OpenRouter/DeepSWE/archived technical evidence; repeated zero-upload publisher run; stable ten-post seed; type/build gates; tested desktop/mobile carousels in `validation/ox-alpha-investigation-blog/`. |
| 2026-08-24 | DeepSeek Harness stuck-installation evidence boundary | The supplied record showed `npx @deepseek-ai/dsh web` going quiet after the install prompt, but it did not expose the resolver's internal wait. The current profile also differs from the historical plugin tree that later failed. | Published a bounded 46-block case study that reports the machine-specific `pnpm dlx` result without calling `npx` generally broken, pins the discoverable wrapper to tested release `0.1.1-rc.2`, and separates shell-job, package-runner, profile, and plugin failures. Two supplied captures carry source evidence; two original illustrations carry no factual burden. All four assets persist by `storageId` plus stable `assetKey`. | User request; direct local artifacts; official DeepSeek Harness/npm/pnpm/Bash/Open Design sources; zero-finding editorial audit; repeated zero-upload publisher run; stable eleven-post seed; type/build gates; desktop/375 px evidence in `validation/dsh-stuck-installation-blog-2026-08-24/`. |
| 2026-08-26 | Convex File Storage to Cloudflare R2 cutover | The configured deploy key was development-only; the exact storage inventory showed 69 public Blog assets, zero private attachments, and seven additional Blog images that were external GitHub URLs rather than Convex objects. Cloudflare control-plane inspection was unavailable, but the bucket-scoped S3 credentials passed read/write checks. | Migrated only `dev:impartial-basilisk-364` into one private R2 bucket using content-addressed keys and stable same-origin signed redirects. Every target was fully downloaded and SHA-256/size verified before activation; all 69 Convex IDs/blobs remain for rollback. Rewrote Blog documents to `assetKey` while preserving the seven external sources. Production remains an explicit separate migration. | User requests: "oke lets migrate, migrate also all previous files and re-write database pointing to those files" and "after all done,commit the changes"; validation: durable pre-cutover export, 69/69 verified jobs, exact 66,351,372-byte R2 reconciliation, type/build/write/read gates, and `validation/convex-r2-migration-2026-08-26/`. |
| 2026-08-26 | R2 public delivery correction | The owner clarified that the portfolio origin has no file storage and supplied the bucket's development public URL. Enabling `r2.dev` also makes the whole bucket public, so same-bucket signed URLs cannot provide a private-file boundary. The local ISP resolver maps this hostname to a block page, while Cloudflare DNS and direct edge validation return the correct object. | Configured development `R2_PUBLIC_DOMAIN` and resolve all verified public media directly to content-addressed URLs on it. Keep `/api/media/{fileId}` only for backward-compatible redirects. Reject private uploads with `R2_PRIVATE_BUCKET_NOT_CONFIGURED` until a distinct non-public bucket is available. Recommend `media.mukhtada.my.id` for production to avoid the provider hostname and local DNS filtering. | User-supplied `R2_PUBLIC_DOMAIN`; live 21-post query returned 89 direct URLs and zero same-origin media URLs; R2 edge returned HTTP 200 with matching content type, byte size, SHA-256, and immutable cache headers; desktop/mobile evidence in `validation/r2-public-domain-2026-08-26/`. |

> Catatan: mulai berlaku dokumen ini, entri baru di tabel di atas untuk task
> yang melewati Fase 5 sebaiknya menyertakan referensi path screenshot yang
> jadi bukti (kolom "Keputusan" atau catatan tambahan), khususnya untuk
> penyimpangan yang ditemukan lewat analisis visual (§5.3).

---

## 8. Yang Tidak Boleh Diubah oleh Workflow Ini

Untuk menjaga workflow ini tidak jadi celah untuk melonggarkan aturan:

- Workflow ini **tidak** memberi wewenang untuk menambah scope baru di luar
  `report.md` §1–§6. Ide baru → dicatat sebagai item baru di `TASKS.md`
  bagian "Someday", bukan langsung diimplementasi. Ini termasuk temuan P3/P4
  atau bug di luar scope yang terlihat saat analisis screenshot (§5.3).
- Workflow ini **tidak** menggantikan `report.md` §8 (Yang Tidak
  Direkomendasikan Ditambah) - daftar itu tetap berlaku penuh.
- Fase CONFIRM (§3) **tidak boleh** dilewati dengan alasan "menghemat waktu",
  termasuk saat perbaikan hasil triase screenshot (§5.3) ternyata butuh
  keputusan desain baru.
- Proses screenshot (§5.1-5.3) **tidak** menggantikan checklist manual gate
  di §5.2 - screenshot adalah bukti pendukung dan alat temuan bug, bukan
  pengganti pengecekan terprogram untuk hal numerik (kontras, computed style).


<!-- headroom:rtk-instructions -->
# RTK (Rust Token Killer) - Token-Optimized Commands

When running shell commands, **always prefix with `rtk`**. This reduces context
usage by 60-90% with zero behavior change. If rtk has no filter for a command,
it passes through unchanged — so it is always safe to use.

## Key Commands
```bash
# Git (59-80% savings)
rtk git status          rtk git diff            rtk git log

# Files & Search (60-75% savings)
rtk ls <path>           rtk read <file>         rtk grep <pattern>
rtk find <pattern>      rtk diff <file>

# Test (90-99% savings) — shows failures only
rtk pytest tests/       rtk cargo test          rtk test <cmd>

# Build & Lint (80-90% savings) — shows errors only
rtk tsc                 rtk lint                rtk cargo build
rtk prettier --check    rtk mypy                rtk ruff check

# Analysis (70-90% savings)
rtk err <cmd>           rtk log <file>          rtk json <file>
rtk summary <cmd>       rtk deps                rtk env

# GitHub (26-87% savings)
rtk gh pr view <n>      rtk gh run list         rtk gh issue list

# Infrastructure (85% savings)
rtk docker ps           rtk kubectl get         rtk docker logs <c>

# Package managers (70-90% savings)
rtk pip list            rtk pnpm install        rtk npm run <script>
```

## Rules
- In command chains, prefix each segment: `rtk git add . && rtk git commit -m "msg"`
- For debugging, use raw command without rtk prefix
- `rtk proxy <cmd>` runs command without filtering but tracks usage
<!-- /headroom:rtk-instructions -->
