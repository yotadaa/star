# Hero WebGL Failure Fallback

## Task: Hero scene — graceful WebGL capability and context-loss fallback

- Sumber spesifikasi: `PRODUCT.md` prinsip 1, 2, dan 5; `DESIGN.md` §7.1; `design-system.md` §11; dokumentasi resmi React Three Fiber `Canvas` dan MDN `webglcontextlost`.
- Halaman/letak persis: Home, scenic layer di dalam `.hero-canvas`, di belakang entity dan Hero copy.
- Elemen & struktur: pertahankan scene R3F yang ada untuk browser yang dapat membuat WebGL context; sediakan komposisi DOM dekoratif dengan aset lokal yang sama untuk browser tanpa WebGL atau context yang hilang.
- Dependency baru dibutuhkan?: TIDAK.
- Token warna baru dibutuhkan?: TIDAK; fallback hanya memakai token dan `color-mix()` yang sudah ada.
- Butuh konfirmasi data?: TIDAK; tidak ada data, skor, rarity, atau copy baru.

## Diagnosis

`ParallaxScene` langsung memasang `<Canvas>`. Pada browser yang melaporkan WebGL disabled/sandboxed, Three.js melempar saat membuat `WebGLRenderer`, sehingga Next.js menampilkan runtime overlay dan Hero tidak dapat digunakan. `Canvas.fallback` hanya menjadi child fallback elemen `<canvas>` dan tidak menutup seluruh jalur kegagalan renderer; dokumentasi R3F juga menyarankan error boundary untuk GPU/driver failure.

## Implementasi

1. Uji kemampuan membuat context WebGL sebelum memasang R3F.
2. Jangan memasang listener pointer/scroll parallax ketika jalur statis aktif.
3. Tambahkan static scenic fallback bertema morning/noon/sunset/night memakai aset `sun`, `moon`, `cloud`, `mountains`, `forest-hills`, dan `meadow` yang sudah ada.
4. Pasang React error boundary sebagai pertahanan terhadap race/resource failure setelah preflight. Jangan memasukkan scene penuh ke `Canvas.fallback`: pada R3F 9.6.1 prop itu menjadi child `<canvas>` tersembunyi dan akan menduplikasi DOM/aset di jalur WebGL normal.
5. Dengarkan `webglcontextlost` langsung pada canvas (event tidak bubble), lalu unmount scene dan pertahankan fallback statis tanpa retry loop.
6. Sediakan override diagnostik development-only `?hero-renderer=static` dan `?hero-renderer=context-loss` agar jalur fallback final dapat diuji visual tanpa mengubah konfigurasi GPU pengguna; production mengabaikannya.

## Acceptance criteria

1. Browser tanpa WebGL tidak memasang R3F Canvas dan tidak memunculkan Next.js error overlay.
2. Fallback tetap mengisi seluruh Hero, memakai aset lokal nyata, mengikuti empat phase, dan tidak menghalangi Hero copy, CTA, entity layer, atau navigation.
3. Context loss setelah renderer terbentuk mengganti scene ke fallback tanpa retry loop.
4. Browser dengan WebGL tetap merender scene R3F yang sama.
5. Fallback dekoratif tersembunyi dari accessibility tree, tidak bergerak, dan tidak membuat horizontal overflow di desktop atau 375 px.
6. Tidak ada dependency maupun warna hex baru.
7. Production build lulus; visual normal dan fallback diperiksa pada desktop serta mobile.

## Guardrail relevan

- Progressive enhancement tidak boleh mengorbankan copy atau kontrol.
- Aset nyata tetap dipakai; tidak ada panel placeholder.
- Reduced motion berakhir pada komposisi statis.
- Tidak ada dependency, data fiktif, emoji, gradient/glow generik, atau token warna baru.

## Validation

- Screenshot evidence: `validation/hero-webgl-fallback-2026-08-23/`
- Functional checks: Canvas normal, forced static fallback, context-loss transition, no horizontal overflow.
- Temuan triase:
  - P3 fixed: `Canvas.fallback` sempat menduplikasi seluruh static scene sebagai child `<canvas>` pada jalur normal; prop dihapus setelah inspeksi source R3F 9.6.1 dan DOM browser.
  - P4 fixed: fallback mobile diberi geometry khusus agar landscape mengisi Hero tanpa seam atau horizontal overflow.
- Status: done
