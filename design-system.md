# Design System Addendum — Gamification Layer

Dokumen ini adalah **tambahan** di atas token yang sudah ditetapkan di
`components/NUMBER-RATIONALE.md` (skema warna, Fraunces/Silkscreen/Nunito,
--ease-pixel, dsb — tidak diulang di sini, hanya dipatuhi). Isinya adalah
spesifikasi komponen baru untuk mendukung `report.md`.

> Semua nilai warna baru di bawah **harus dikonfirmasi** sebelum dipakai —
> ditandai `[ASUMSI]` jika belum ada di token asli. Jangan menambah hex baru
> tanpa konfirmasi, sesuai aturan brief.

---

## 1. Token Tambahan (Rarity & Status)

Dibutuhkan untuk item 2.2 (rarity tag), 3.2 (tier color), 2.6 (medal).
Skema di bawah **[ASUMSI, MOHON DIKONFIRMASI]** — dipetakan dari palet yang
sudah ada agar tidak keluar dari skema 1/2 yang ditetapkan:

| Rarity/Tier | Warna dipakai | Sumber token |
|---|---|---|
| S / EPIC / Gold medal | `--gold` (#f0b23a) | sudah ada di skema 1 |
| A / RARE / Silver medal | `--olive` (#5c7a41) | sudah ada |
| COMMON / Bronze medal | `--terracotta` (#c9552f) | sudah ada |
| Locked / belum tercapai | `--ink` @ 30% opacity | derivasi dari --ink |

Tidak ada hex baru — seluruhnya remap dari token skema 1 yang sudah disetujui.
Jika proyek final memakai skema 2 (custom, belum didefinisikan di brief),
mapping ini harus diulang setelah skema 2 final ditentukan.

---

## 2. Komponen: HUD Status Strip

**Dipakai di**: Home (1.1), Research (4.2)

```
Struktur:
<div class="hud-strip" role="status">
  <span class="hud-chip"><Icon/> Label</span>
  ...
</div>
```

- Layout: flex row, gap 12px, wrap di mobile.
- Chip: pill kecil, border 1.5px solid var(--ink), background var(--parchment),
  padding 6px 12px, font Silkscreen 11px uppercase.
- Icon: 14x14px, monoline, warna sesuai konteks (gold untuk level/stat utama).
- **State hover**: tidak interaktif (murni display), kecuali dijadikan link →
  maka pakai state di §5.
- **Kegunaan**: representasi status pemain/statistik ringkas, reusable untuk
  Home badge row dan Research stat-chip (4.2) tanpa komponen terpisah.

---

## 3. Komponen: XP Scroll Bar

**Dipakai di**: Global (1.2)

```
Struktur:
<div class="xp-bar-track" aria-hidden="true">
  <div class="xp-bar-fill" style="width: {scrollPercent}%" />
</div>
```

- Posisi: `position: fixed; top: 0; left: 0; right: 0; height: 3px; z-index: 60`
  (di atas navbar pill yang biasanya z-index 50).
- Track background: var(--ink) @ 10% opacity.
- Fill: linear-gradient kiri→kanan `var(--sunset) → var(--gold)`.
- Transition width: `transform` (bukan `width`) untuk performa —
  gunakan `scaleX` dengan `transform-origin: left`.
- Reduce-motion: jika `prefers-reduced-motion`, hilangkan transition, update
  instan (tetap tampil, hanya animasinya dimatikan).
- **Kegunaan**: indikator progres membaca halaman, bahasa visual "XP terisi".

---

## 4. Komponen: Rarity Tag

**Dipakai di**: About Experience Card (2.2), Achievement Medal (2.6)

```
Struktur:
<span class="rarity-tag rarity-{epic|rare|common}">TIER LABEL</span>
```

- Posisi absolute: `top: 12px; left: 12px` di dalam card yang sudah
  `position: relative` (Experience card, Achievement card).
- Bentuk: pixel-corner badge — sudut dipotong 3px (clip-path polygon)
  bukan border-radius biasa, supaya konsisten dengan tone pixel-game.
- Border: 1.5px solid warna rarity terkait (lihat §1).
- Font: Silkscreen 10px, letter-spacing 0.5px, uppercase.
- **State**: statis, tidak ada animasi kecuali saat first-reveal (lihat §7
  unlock animation) supaya tidak berbenturan dua animasi sekaligus.
- **Kegunaan**: diferensiasi cepat nilai/bobot antar card tanpa perlu baca teks.

---

## 5. Komponen: Interactive Press State (Button/Pill)

**Dipakai di**: Global — semua CTA, filter pill, nav pill (1.4, 3.1)

```css
.btn-pixel {
  transition: transform 80ms var(--ease-pixel), box-shadow 80ms var(--ease-pixel);
}
.btn-pixel:active {
  transform: translate(2px, 2px);
  box-shadow: 2px 2px 0 var(--ink); /* dikurangi dari default 6px 6px 0 */
}
.btn-pixel:focus-visible {
  outline: 2px dashed var(--gold);
  outline-offset: 2px;
}
```

- Filter pill tambahan saat **menjadi aktif** (bukan sedang ditekan):
  `animation: pill-select 150ms var(--ease-pixel);` → keyframe scale
  `1 → 1.08 → 1`.
- **Kegunaan**: feedback taktil dasar; wajib ada di semua elemen clickable,
  bukan opsional — ini fondasi "game-feel" paling murah.

---

## 6. Komponen: "Kamu di sini" Marker

**Dipakai di**: About — Journey Log (2.3)

```
Struktur (tambahan pada node terakhir):
<div class="timeline-node is-current">
  <span class="pulse-ring" aria-hidden="true"></span>
  <span class="current-label">◉ KAMU DI SINI</span>
</div>
```

- `.pulse-ring`: box 20x20px, border 2px solid var(--gold), border-radius 4px
  (kotak sedikit rounded, konsisten arahan "corner agak rounded" di brief),
  `animation: pulse-soft 2.2s ease-in-out infinite`.
- Keyframe pulse-soft: `opacity 0.6→0→0.6`, `scale 1→1.4→1` — **halus**, bukan
  berkedip cepat (brief eksplisit minta ini untuk aksesibilitas & tone "warm").
- Wajib dibungkus reduce-motion check (matikan animasi, tampilkan ring statis).
- Label: Silkscreen 10px, warna --terracotta, posisi di kanan node.
- **Kegunaan**: penanda posisi "sekarang" di linimasa, satu-satunya node yang
  boleh punya animasi looping (node lain statis).

---

## 7. Komponen: Unlock Reveal Animation

**Dipakai di**: About & Projects cards, dipicu IntersectionObserver (2.7)

```css
@keyframes unlock-reveal {
  0%   { opacity: 0; transform: scale(0.92) translateY(8px); }
  60%  { opacity: 1; transform: scale(1.02) translateY(0); border-color: var(--gold); }
  100% { transform: scale(1); }
}
.card-unlock {
  animation: unlock-reveal 380ms var(--ease-pixel) forwards;
}
```

- Trigger: `IntersectionObserver` native (threshold 0.2), one-time per elemen
  (unobserve setelah trigger — jangan replay tiap scroll naik-turun).
- Border color flash memakai transisi border-color terpisah, durasi 200ms,
  kembali ke `var(--ink)` setelah animasi selesai.
- **Kegunaan**: menggantikan reveal-on-scroll generik dengan versi yang
  terasa seperti "item baru terbuka" — dipakai di Experience card, Achievement
  card, Project card.

---

## 8. Komponen: Toast Notification

**Dipakai di**: Global event feedback (6.1)

```
Struktur:
<div class="toast-stack" aria-live="polite">
  <div class="toast">
    <Icon/>
    <span>Pesan singkat</span>
  </div>
</div>
```

- Posisi: `position: fixed; bottom: 24px; right: 24px; z-index: 70`.
- Style: background var(--ink), text var(--cream), border-radius 8px
  (rounded, bukan pixel-hard-corner — toast harus terasa "lembut/notifikasi",
  beda kelas dari card konten), padding 12px 16px, font Nunito 13px.
- Masuk: slide-up + fade 250ms; keluar otomatis setelah 3.5s, slide-down + fade.
- Maks 1 toast tampil bersamaan (queue, bukan stack menumpuk) — supaya tidak
  mengganggu.
- **Trigger yang direkomendasikan (minimal set, bisa ditambah nanti)**:
  1. Mencapai node terakhir Journey Log → "🏆 Kamu sudah mengikuti seluruh perjalanan!"
  2. Klik "salin email/kontak" (jika ada) → "📋 Disalin ke clipboard"
- **Kegunaan**: satu-satunya elemen yang benar-benar event-driven — prioritas
  tinggi karena paling menegaskan "sistem", bukan dekorasi.

---

## 9. Komponen: Contact Card Portal Hover

**Dipakai di**: Contact (5.1, 5.2)

```css
.portal-card {
  transition: transform 150ms var(--ease-pixel), box-shadow 150ms var(--ease-pixel);
}
.portal-card:hover {
  transform: translate(-3px, -3px);
  box-shadow: 6px 6px 0 var(--card-accent); /* var per warna card: biru/hitam/hijau/oranye/ungu */
}
```

- `--card-accent` per card = warna dominan card itu sendiri (biru untuk
  LinkedIn, hijau untuk Scholar, dst) — bukan token baru, ambil dari background
  gradient yang sudah dipakai tiap card.
- Klik → ripple flash: `<span class="ripple">` di-inject di titik klik (offsetX/Y
  dari event), scale 0→4, opacity 0.5→0, durasi 400ms, lalu navigasi ke link
  (delay window.open ~150ms agar ripple sempat terlihat sebagian).
- **Kegunaan**: transisi keluar situs yang terasa seperti "membuka portal",
  konsisten dengan tema "pilih kanal" di judul section Contact.

---

## 10. Komponen: Locked Slot (Next Quest Teaser)

**Dipakai di**: Research (4.3)

```
Struktur:
<div class="locked-slot">
  <LockIcon/>
  <span>Publikasi berikutnya — in progress</span>
</div>
```

- Border: dashed 2px var(--ink) @ 40% opacity, background transparent.
- Icon lock: monoline 20px, warna sama dengan border.
- Font: Silkscreen 11px, warna --ink @ 50%.
- Tidak ada hover state (bukan elemen interaktif, murni teaser).
- **Kegunaan**: mengisi ruang kosong grid Research dengan pola "locked
  achievement slot", memberi rasa akan-ada-progres-lanjutan.

---

## 11. Aturan Aksesibilitas untuk Semua Komponen Gamifikasi

Wajib dipatuhi lintas §2–§10, mengikuti FASE 3.3 & FASE 5.3 di brief teknis:

1. Semua animasi loop (pulse ring, sweep reflection, toast) **harus** dimatikan
   total saat `prefers-reduced-motion: reduce` — bukan diperlambat, tapi
   dihentikan (tampilkan state akhir statis).
2. Semua elemen custom (rarity tag, locked slot, HUD chip) yang murni
   dekoratif diberi `aria-hidden="true"` bila tidak menambah informasi baru;
   yang menyampaikan info (mis. toast) wajib `aria-live="polite"`.
3. Custom cursor (§ report 6.2) **wajib** punya fallback: nonaktif otomatis
   pada device dengan `pointer: coarse` (touch), jangan disembunyikan paksa
   tanpa fallback cursor bawaan.
4. Semua efek `:active`/press-state juga harus punya padanan `:focus-visible`
   agar navigasi keyboard tetap dapat feedback yang setara (lihat §5).

---

## 12. Ringkasan Pemetaan Komponen → Section

| Komponen | Halaman | Item di report.md |
|---|---|---|
| HUD Status Strip | Home, Research | 1.1, 4.2 |
| XP Scroll Bar | Global | 1.2 |
| Rarity Tag | About, Projects (tier) | 2.2, 3.2 |
| Press State | Global | 1.4, 3.1 |
| "Kamu di sini" Marker | About | 2.3 |
| Unlock Reveal | About, Projects | 2.7 |
| Toast Notification | Global | 6.1 |
| Portal Hover Card | Contact | 5.1, 5.2 |
| Locked Slot | Research | 4.3 |
| Medal Icon | About (Achievements) | 2.6 |

---

## Catatan Kepatuhan Brief

- Tidak ada dependency npm baru diperkenalkan di dokumen ini — semua efek
  (pulse, unlock, toast, ripple) dapat dibangun dengan Framer Motion / CSS
  murni yang sudah ada di stack yang diizinkan.
- Semua warna baru bersifat **remap dari token existing**, ditandai
  `[ASUMSI, MOHON DIKONFIRMASI]` di §1 — belum final sampai dikonfirmasi
  pemilik proyek, terutama karena skema warna final proyek disebut akan
  memakai "skema 2" yang belum didefinisikan nilainya di brief asli.
- Dokumen ini adalah **spesifikasi desain**, bukan hasil implementasi/build —
  tidak ada klaim "sudah dijalankan/diuji".
