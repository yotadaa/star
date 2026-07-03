# Auth + Utility Bar + Route States Extension

Extension ini menutup bagian Login pada `implementation-plan.md` dan
menyesuaikan navigasi berdasarkan arahan pemilik proyek tanggal 2026-07-03.

### Task: Utility bar terpisah untuk Chat dan Login

- Sumber spesifikasi: `plans/next-plan-1/implementation-plan.md` §1.5, §2.2,
  §5; arahan user 2026-07-03.
- Halaman/letak persis: global, fixed di kiri atas; navbar utama tetap di atas
  dan hanya berisi identitas, route utama, theme, player status, command.
- Elemen & struktur: `<nav class="utility-bar">` dengan tombol chat dan state
  login/avatar; ikon dari SVG sprite.
- Dependency baru dibutuhkan?: TIDAK.
- Token warna baru dibutuhkan?: TIDAK.
- Butuh konfirmasi data?: TIDAK.
- Acceptance criteria:
  1. Chat dan Login tidak lagi berada di IslandNav.
  2. Utility bar tidak bertabrakan dengan IslandNav atau overflow pada
     viewport 390px dan 1440px.
  3. Semua tombol keyboard-reachable dan punya focus-visible.
- Guardrail relevan: AGENTS.md §1.1 no emoji/no new color; §1.2 keyboard,
  contrast, mobile overflow.
- Status: validated.

### Task: Google Auth.js

- Sumber spesifikasi: `plans/next-plan-1/implementation-plan.md` §1 dan §6;
  arahan user 2026-07-03 beserta credential Google OAuth.
- Halaman/letak persis: root provider, `/api/auth/[...nextauth]`, utility bar,
  gate Chat/Inventory, dan server guard `/blog/admin/*`.
- Elemen & struktur: Auth.js v5, Google provider, JWT session, role owner hanya
  bila email cocok dengan `OWNER_EMAIL`.
- Dependency baru dibutuhkan?: YA, `next-auth`; dikonfirmasi eksplisit lewat
  permintaan "setup google auth config".
- Token warna baru dibutuhkan?: TIDAK.
- Butuh konfirmasi data?: `OWNER_EMAIL` belum tersedia; role owner tetap
  disabled sampai env tersebut diisi.
- Acceptance criteria:
  1. Credential disimpan server-side di `.env.local` dan tidak terlacak git.
  2. Endpoint `/api/auth/providers` mengembalikan provider Google tanpa
     membocorkan client secret.
  3. Login memakai Authorization Code flow Auth.js dan session cookie.
  4. Non-owner tidak dapat merender route admin di server.
- Guardrail relevan: AGENTS.md §1.1 dependency harus terkonfirmasi; plan §6
  server role check dan secrets server-only.
- Status: validated.

### Task: Route state 404, 403, dan redirect aman

- Sumber spesifikasi: `design-system.md` §5, §11; `PRODUCT.md` Design
  Principles 2, 4, 5; arahan user 2026-07-03.
- Halaman/letak persis: `app/not-found.js`, `/forbidden`, `/redirect`.
- Elemen & struktur: reusable `RouteStatePage`, hard border + hard offset
  shadow, token existing, SVG sprite icon, CTA `PixelButton`.
- Dependency baru dibutuhkan?: TIDAK.
- Token warna baru dibutuhkan?: TIDAK.
- Butuh konfirmasi data?: TIDAK.
- Acceptance criteria:
  1. Unknown route memberi HTTP 404 dan route-state yang konsisten.
  2. `/forbidden` memberi halaman 403-style dan jalan pulang yang jelas.
  3. `/redirect?to=<route-key>` hanya menerima allowlist internal; input lain
     kembali ke Home sehingga tidak menjadi open redirect.
  4. Route-state keyboard accessible dan tidak overflow di mobile.
- Guardrail relevan: AGENTS.md §1.1 no emoji/no new hex; §1.2 a11y.
- Status: validated.
