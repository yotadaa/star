# Komponen Gamifikasi - React

Implementasi dari `report.md` dan `design-system.md`. Semua komponen memakai
**CSS variable proyek + React/CSS native** tanpa dependency baru.

## Prasyarat

1. Token warna/font (`--gold`, `--ink`, `--cream`, `font-silkscreen`,
   `font-fraunces`, `font-nunito`, `--ease-pixel`, dst) **sudah didefinisikan**
   sebagai CSS variable & Tailwind font family di `globals.css` /
   `tailwind.config` proyekmu - komponen ini hanya *memakai* token itu, tidak
   mendefinisikan ulang.
2. Jika pakai App Router Next.js: tambahkan `"use client"` di baris pertama
   tiap file (semua komponen di sini interaktif/pakai hook).

## Struktur

```
components/
  HudStatusStrip.jsx   → HUD strip status pemain (item report 1.1)
  XpScrollBar.jsx       → progress bar scroll = XP (item 1.2)
  RarityTag.jsx         → badge TIER S/A/COMMON (item 2.2, 3.2)
  PixelButton.jsx        → tombol/pill dgn press-state (item 1.4, 3.1)
  CurrentMarker.jsx      → marker "kamu di sini" di Journey Log (item 2.3)
  UnlockCard.jsx          → wrapper unlock-reveal animation (item 2.7)
  Toast.jsx               → sistem notifikasi event-driven (item 6.1)
  PortalCard.jsx           → contact card hover+ripple (item 5.1, 5.2)
  LockedSlot.jsx            → teaser slot terkunci Research (item 4.3)
hooks/
  useInViewOnce.js          → IntersectionObserver sekali-trigger
```

## Contoh pemakaian cepat

```jsx
// layout.jsx (root)
import { ToastProvider, XpScrollBar } from "@/components";

export default function RootLayout({ children }) {
  return (
    <ToastProvider>
      <XpScrollBar />
      {children}
    </ToastProvider>
  );
}
```

```jsx
// Home hero badge row
import { HudStatusStrip } from "@/components";

<HudStatusStrip
  items={[
    { label: "Jambi, ID" },
    { label: "Level: Fullstack Explorer", accent: "gold" },
    { label: "Streak: 4 publikasi aktif", accent: "gold" },
  ]}
/>
```

```jsx
// Experience card (About)
import { UnlockCard, RarityTag } from "@/components";

<UnlockCard
  as="article"
  className="relative border-2 p-6"
  style={{ borderColor: "var(--ink)", boxShadow: "6px 6px 0 var(--ink)" }}
>
  <RarityTag rarity="epic" label="EPIC" />
  <h3>Vice President - English Club</h3>
  ...
</UnlockCard>
```

```jsx
// Journey Log - node terakhir
import { CurrentMarker } from "@/components";

{items.map((item, i) => (
  <li key={item.id}>
    {i === items.length - 1 ? <CurrentMarker /> : <StaticNode />}
    ...
  </li>
))}
```

```jsx
// Trigger toast - mis. saat mencapai node terakhir Journey Log
import { useToast } from "@/components";

const { showToast } = useToast();
useEffect(() => {
  if (reachedLastNode) {
    showToast("Kamu sudah mengikuti seluruh perjalanan!");
  }
}, [reachedLastNode]);
```

```jsx
// Contact page
import { PortalCard } from "@/components";

<PortalCard
  href="https://linkedin.com/in/mukhtada-nasution-893aaa246"
  accent="#2f6fa8"
  title="Let's Connect"
  description="Terhubung secara profesional"
  cta="Buka LinkedIn ↗"
/>
```

```jsx
// Research grid - slot terakhir
import { LockedSlot } from "@/components";

<LockedSlot label="Publikasi berikutnya - in progress" />
```

## Catatan integrasi

- **Custom cursor** (item report 6.2) dipasang lewat CSS global karena tidak
  perlu komponen React.
- **Command palette (item 6.3)** tetap hidup di shell situs; komponen batch ini
  hanya menambah aset/indikator gamifikasi yang mendukungnya.
- **Skill Tree berjenjang** (item 2.4) masih memakai grid skill yang ada, lalu
  diperkuat dengan meter progres agar tidak mengubah struktur besar halaman.

## Aksesibilitas (wajib dipatuhi saat integrasi)

Animasi komponen dikendalikan lewat CSS dan menghormati
`prefers-reduced-motion` dari `globals.css`. Pastikan aturan reduced-motion itu
tidak dihapus saat kamu kustomisasi lebih lanjut.
