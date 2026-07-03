# Implementation Plan — Login · World Chat · Inventory Management · Blog CMS

Dokumen ini melanjutkan `report.md`, `design-system.md`, dan `PRODUCT.md`.
Empat fitur baru ini mengubah portofolio dari **situs statis** menjadi
**aplikasi full-stack ringan** — jadi sebelum bicara komponen UI, perlu
disepakati dulu arsitektur & keputusan teknis yang belum pernah dibahas
di dokumen sebelumnya.

> Mengikuti aturan anti-halusinasi di brief awal: bagian **§0** di bawah
> berisi keputusan yang **butuh konfirmasi eksplisit darimu** sebelum
> implementasi dimulai, karena menambah dependency & infra baru di luar
> stack yang sebelumnya diizinkan (three.js, r3f, framer-motion, tailwind).

---

## 0. Keputusan Arsitektur (WAJIB DIKONFIRMASI SEBELUM MULAI)

Portofolio ini sebelumnya murni presentational (Next.js + data statis).
Keempat fitur baru butuh: **autentikasi**, **database**, **realtime
messaging**, dan **rich text storage**. Tidak ada dari ini yang bisa
dibangun cuma dengan Framer Motion + Tailwind.

### 0.1 Stack yang diusulkan (bukan keputusan final — pilih salah satu per baris)

| Kebutuhan | Opsi A (paling simpel) | Opsi B | Catatan |
|---|---|---|---|
| Auth (Google login) | **Auth.js (NextAuth v5)** | Clerk | Auth.js gratis, self-host, native Next.js. Clerk lebih cepat setup tapi ada biaya di skala tertentu. |
| Database | **Supabase (Postgres)** | Neon + Prisma | Supabase kasih Postgres + Realtime + Storage dalam satu paket → cocok untuk chat & blog sekaligus. |
| Realtime chat | **Supabase Realtime** (kalau pakai Supabase) | Pusher / Ably | Kalau sudah pakai Supabase untuk DB, pakai Realtime bawaannya — hindari nambah 1 layanan lagi. |
| Rich text / block editor | **Tiptap** (berbasis ProseMirror) | Editor.js | Tiptap lebih matang untuk React, banyak contoh block-based (heading, image, quote, code). |
| Hosting gambar upload (blog cover, dsb) | Supabase Storage | Cloudinary | Ikut §Database kalau pakai Supabase. |

**Rekomendasi saya: Opsi A di semua baris (Auth.js + Supabase + Tiptap)**
karena paling sedikit vendor terpisah (Supabase menangani DB + Realtime +
Storage sekaligus), dan Auth.js native ke Next.js App Router yang sudah
dipakai.

### 0.2 Yang perlu kamu putuskan sebelum saya lanjut ke kode

1. Setuju pakai **Auth.js + Supabase + Tiptap**? Atau ada preferensi lain
   (mis. sudah py Firebase)?
2. Google OAuth butuh **Google Cloud Console project** (Client ID/Secret) —
   kamu yang generate, saya tidak bisa membuatkan kredensial ini.
3. Supabase butuh akun + project baru (gratis di tier awal) — sama, perlu
   dibuat manual olehmu, saya hanya bisa menulis skema & kode integrasinya.
4. **Siapa yang boleh kelola Blog & Inventory?** Asumsi saya: hanya kamu
   (owner/admin, single-user), bukan multi-author. Pengunjung yang login
   Google hanya bisa **chat**, tidak bisa nulis blog atau nambah item
   inventory orang lain. Perlu dikonfirmasi ini benar.

Sisa dokumen ini saya tulis dengan asumsi Opsi A + poin 4 di atas, ditandai
`[ASUMSI]` di tiap bagian relevan.

---

## 1. FITUR: Login (Google OAuth)

### 1.1 Tujuan
Satu pintu masuk yang dipakai bersama oleh World Chat (siapa saja yang
login boleh chat) dan Inventory Management (hanya owner yang boleh tambah
item — dibedakan lewat role, bukan sistem login terpisah).

### 1.2 User flow
```
Pengunjung klik "Login untuk Chat" (dari panel World Chat)
   → redirect Google OAuth consent screen
   → callback ke /api/auth/callback/google
   → session dibuat (JWT/cookie via Auth.js)
   → user kembali ke halaman asal, avatar+nama muncul di navbar
```

### 1.3 Requirements teknis
- `next-auth` (Auth.js v5) dengan provider `GoogleProvider`.
- Environment variables: `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`,
  `AUTH_SECRET`, `NEXTAUTH_URL`.
- Session strategy: **JWT** (bukan database session) supaya tidak perlu
  tabel session terpisah — cukup simpan `user.email`, `user.name`,
  `user.image`, `user.role` di token.
- **Role assignment**: satu email spesifik (emailmu) di-hardcode di
  `.env` sebagai `OWNER_EMAIL` → saat login, kalau `session.user.email
  === OWNER_EMAIL`, role = `"owner"`, selain itu `"visitor"`.
  `[ASUMSI, MOHON DIKONFIRMASI]` — ini pendekatan single-owner paling
  sederhana, tanpa tabel roles terpisah di database.

### 1.4 Skema data
Tidak butuh tabel `users` manual — Auth.js dengan JWT strategy tidak
menyimpan user ke DB kecuali kita mau riwayat siapa saja pernah login
(opsional, untuk moderasi chat — lihat §2.6).

```sql
-- opsional, hanya jika mau audit trail siapa pernah login (rekomendasi: ya, untuk moderasi chat)
create table public.chat_users (
  id uuid primary key default gen_random_uuid(),
  email text unique not null,
  name text not null,
  avatar_url text,
  role text not null default 'visitor', -- 'visitor' | 'owner'
  is_banned boolean not null default false,
  first_seen_at timestamptz not null default now(),
  last_seen_at timestamptz not null default now()
);
```

### 1.5 UI
- Navbar: state belum login → tombol kecil "Login" (pakai `PixelButton`
  varian pill). State sudah login → avatar bulat kecil + nama, klik untuk
  dropdown "Logout".
- Trigger login **hanya muncul saat dibutuhkan** (buka panel Chat, atau
  coba tambah item Inventory) — bukan tombol besar permanen di navbar,
  supaya tidak terasa seperti "harus daftar" sebelum lihat portofolio.
  Sesuai prinsip brand: visitor datang untuk *browsing*, bukan transaksi.

### 1.6 Komponen React baru
| Komponen | Fungsi |
|---|---|
| `AuthProvider.jsx` | wrapper `SessionProvider` dari next-auth di root layout |
| `LoginButton.jsx` | tombol trigger `signIn("google")`, styled `PixelButton` |
| `UserAvatarMenu.jsx` | avatar + dropdown logout, muncul di navbar setelah login |
| `useCurrentUser.js` (hook) | wrapper `useSession()`, kembalikan `{ user, role, isLoading }` |
| `RequireLoginGate.jsx` | wrapper generic: render children kalau sudah login, kalau belum tampilkan CTA login inline (dipakai di Chat input & Inventory "add item" button) |

---

## 2. FITUR: World / Global Chat (ala RPG)

### 2.1 Konsep
Bukan chat privat/DM — ini **satu ruang obrolan publik** ala "world chat"
di game MMO: siapa pun yang login bisa kirim pesan, semua yang buka panel
chat lihat pesan yang sama secara realtime. Cocok dengan metafora
"cockpit/quest journey" — pengunjung terasa seperti pemain lain yang
lewat di dunia yang sama.

### 2.2 User flow
```
Klik ikon Chat di navbar (ikon baru, bubble chat pixel)
   → panel slide-in dari kanan (bukan modal penuh — biar tetap bisa
     scroll halaman sambil chat terbuka, seperti chat widget game)
   → belum login: lihat history pesan (read-only) + CTA "Login untuk ikut chat"
   → sudah login: input text di bawah, kirim pesan muncul realtime ke semua yang online
```

### 2.3 Requirements teknis
- Tabel `chat_messages` di Supabase Postgres.
- Supabase Realtime channel `world-chat` — subscribe ke `INSERT` event
  di tabel `chat_messages`, broadcast ke semua client yang connect.
- Rate limiting: max 1 pesan / 3 detik per user (dicek di client **dan**
  di server/RLS policy, client-side saja tidak cukup untuk mencegah spam).
- Moderasi dasar: `is_owner_only_delete` — hanya `role: owner` (kamu) yang
  bisa hapus pesan siapa pun (lewat tombol hapus muncul saat hover, cuma
  untuk owner).
- Panjang pesan maksimal 280 karakter (batas wajar untuk world chat,
  bukan platform chat serius).
- Profanity/spam filter dasar: `[ASUMSI, MOHON DIKONFIRMASI]` — apakah
  perlu filter kata kasar otomatis? Kalau ya, saya rekomendasikan library
  ringan seperti `bad-words` untuk pass pertama, bukan solusi custom.

### 2.4 Skema data

```sql
create table public.chat_messages (
  id uuid primary key default gen_random_uuid(),
  user_email text not null references chat_users(email),
  user_name text not null,
  user_avatar text,
  content text not null check (char_length(content) <= 280),
  created_at timestamptz not null default now(),
  is_deleted boolean not null default false
);

-- Row Level Security (WAJIB, supaya visitor tidak bisa insert as user lain)
alter table chat_messages enable row level security;

create policy "anyone can read non-deleted messages"
  on chat_messages for select
  using (is_deleted = false);

create policy "authenticated users can insert their own message"
  on chat_messages for insert
  with check (auth.jwt() ->> 'email' = user_email);

create policy "only owner can soft-delete"
  on chat_messages for update
  using (auth.jwt() ->> 'email' = current_setting('app.owner_email', true));
```

### 2.5 UI — RPG framing (bukan chat generik)

Supaya tidak jatuh ke "emoji-based gamification" atau "decorative game
mechanics" yang dilarang di `PRODUCT.md`, framing RPG di sini harus
fungsional:

- Tiap baris pesan diberi **rarity border tipis** berdasarkan role
  pengirim: owner = border `--gold` (seperti "GM/dev" di game), visitor
  biasa = border `--ink` standar. Ini informasi asli (siapa yang bicara),
  bukan dekorasi kosong.
- Nama pengirim ditampilkan sebagai `Nama · Lv.1 Visitor` — level ini
  **bisa** ditarik dari sistem Player Points kalau user itu juga sudah
  achievement/mission progress (lihat `popup-system-design.md`), tapi
  untuk visitor baru (belum pernah interaksi lain), defaultnya `Lv.1
  Visitor` — bukan angka fiktif.
- Placeholder input: `"Ketik pesan ke semua penjelajah..."` — bahasa RPG
  tapi tetap jelas fungsinya (sesuai prinsip PRODUCT.md #5: aksesibel,
  tidak norak).
- Indikator online count kecil di header panel: `"🟢 3 penjelajah online"`
  — ini **harus** angka asli dari jumlah koneksi realtime aktif, bukan
  angka dikarang (Supabase Realtime Presence API bisa hitung ini).

### 2.6 Moderasi & keamanan (jangan dilewatkan)

1. RLS policy di atas mencegah user kirim pesan atas nama orang lain.
2. Sanitize input (escape HTML) sebelum render — cegah XSS lewat pesan chat.
3. Owner dapat tombol "Ban user" (set `is_banned = true` di `chat_users`) —
   dicek di RLS policy insert (`and not exists (select 1 from chat_users
   where email = auth.jwt()->>'email' and is_banned = true)`).
4. Auto-scroll ke pesan terbaru, tapi **jangan** auto-scroll kalau user
   sedang scroll ke atas baca history lama (deteksi `scrollTop` sebelum
   auto-scroll — UX dasar chat app).

### 2.7 Komponen React baru
| Komponen | Fungsi |
|---|---|
| `WorldChatPanel.jsx` | container slide-in panel + toggle open/close |
| `ChatMessageList.jsx` | list pesan + auto-scroll logic |
| `ChatMessageItem.jsx` | 1 baris pesan, pakai rarity border sesuai role |
| `ChatInput.jsx` | textarea + tombol kirim, dibungkus `RequireLoginGate` |
| `useWorldChat.js` (hook) | subscribe Supabase Realtime channel, expose `{ messages, sendMessage, onlineCount }` |
| `useRateLimit.js` (hook) | cegah kirim pesan terlalu cepat, disable tombol kirim sementara |

---

## 3. FITUR: Inventory Management (Login Required, Owner-Only Add)

### 3.1 Klarifikasi penting vs desain Inventory sebelumnya

Di `popup-system-design.md` §4, Inventory didesain **read-only untuk
pengunjung** — item muncul otomatis dari Achievement/Mission yang
selesai (auto-generated, bukan input manual).

Permintaan baru ("bisa tambah items ke inventori, require login") berarti
kita menambah **mode kelola manual**, di atas mekanisme auto-generate yang
sudah ada. Ini saya rangkai jadi dua sumber item yang digabung:

```
Inventory (yang dilihat pengunjung)
   ├── Auto-generated items  ← dari Achievement/Mission selesai (read-only, sistem)
   └── Manual items          ← ditambah owner lewat form "Tambah Item" (butuh login + role owner)
```

`[ASUMSI, MOHON DIKONFIRMASI]`: saya asumsikan **hanya kamu (owner)** yang
boleh menambah item manual — bukan sembarang pengunjung yang login lewat
Google. Kalau maksudnya visitor juga boleh "menyimpan" item ke inventory
pribadi mereka (semacam wishlist/koleksi personal per-user), itu desain
yang beda total (butuh tabel per-user inventory) — tolong konfirmasi mana
yang dimaksud sebelum saya lanjut ke kode.

Dokumen ini saya lanjutkan dengan asumsi **owner-only manual add**, karena
paling konsisten dengan sifat portofolio single-owner.

### 3.2 User flow (owner)
```
Login sebagai owner → buka popup Inventory (dari navbar) →
tombol "+ Tambah Item" muncul (hanya untuk role owner) →
form: nama, tipe (scroll/tool/artifact/medal/key), rarity, deskripsi,
link opsional, upload icon/gambar opsional →
submit → item baru muncul di grid Inventory + toast "Item baru ditambahkan"
```

### 3.3 Skema data

```sql
create table public.inventory_items (
  id uuid primary key default gen_random_uuid(),
  source text not null default 'manual', -- 'manual' | 'auto'
  type text not null check (type in ('scroll','tool','artifact','medal','key')),
  name text not null,
  description text,
  rarity text not null check (rarity in ('epic','rare','common')),
  icon_url text,
  link_url text,
  source_achievement_id text, -- nullable, hanya diisi kalau source = 'auto'
  created_at timestamptz not null default now(),
  created_by text not null -- email owner
);

alter table inventory_items enable row level security;

create policy "anyone can read inventory"
  on inventory_items for select
  using (true);

create policy "only owner can insert/update/delete"
  on inventory_items for all
  using (auth.jwt() ->> 'email' = current_setting('app.owner_email', true));
```

### 3.4 Requirements teknis
- Form pakai validasi client (react-hook-form + zod, **ini dependency
  baru** — alternatif tanpa lib tambahan: native form validation HTML5 +
  manual check, lebih sesuai batasan "no new dependency tanpa konfirmasi".
  Rekomendasi saya: pakai native validation dulu, upgrade ke
  react-hook-form kalau form makin kompleks).
- Upload icon: Supabase Storage bucket `inventory-icons`, max 1 file,
  ukuran maks 500KB, tipe `image/png` atau `image/svg+xml` (biar konsisten
  gaya monoline icon yang sudah ada).
- Setelah submit, invalidate cache/refetch grid inventory (kalau pakai
  React Query — juga dependency baru, alternatif: manual refetch pakai
  `useState` + refetch function, cukup untuk skala data sekecil ini).

### 3.5 UI
- Tombol "+ Tambah Item" **hanya render kalau `role === 'owner'`** —
  pengunjung biasa yang login tetap tidak lihat tombol ini sama sekali
  (bukan cuma disabled, supaya tidak membingungkan visitor kenapa ada
  tombol yang tidak bisa mereka pakai).
- Form modal terpisah dari modal Inventory utama (buka di atas, backdrop
  ganda) atau ganti tab Inventory jadi mode "edit" — rekomendasi saya:
  **inline form di atas grid**, bukan modal-di-atas-modal (lebih sederhana
  secara UX & implementasi).
- Item manual & auto **ditampilkan dalam grid yang sama**, tidak
  dipisah section — bedanya cuma badge kecil "Manual" vs tidak ada badge
  untuk yang auto (opsional, supaya kamu sendiri bisa bedain saat kelola).

### 3.6 Komponen React baru
| Komponen | Fungsi |
|---|---|
| `InventoryGrid.jsx` | grid gabungan item manual + auto (update dari desain sebelumnya) |
| `AddItemForm.jsx` | form tambah item, hanya render untuk owner |
| `InventoryItemCard.jsx` | 1 card item, klik expand detail |
| `useInventory.js` (hook) | fetch semua item dari Supabase, expose `addItem()`, `deleteItem()` |

---

## 4. FITUR: Blog dengan CMS (Block-Level Editor) — Route `/blog`

### 4.1 Struktur route

```
/blog                    → daftar semua post published (publik, tanpa login)
/blog/[slug]              → baca 1 post (publik)
/blog/admin                → dashboard kelola post (butuh login + role owner)
/blog/admin/new             → editor buat post baru
/blog/admin/[id]/edit        → editor edit post existing
```

`[ASUMSI, MOHON DIKONFIRMASI]`: kamu bilang "1 route lagi /blog untuk
kelola blog" — saya asumsikan maksudnya `/blog` untuk baca (publik) dan
sub-route `/blog/admin` untuk kelola (privat), bukan `/blog` itu sendiri
langsung jadi halaman admin. Kalau ternyata `/blog` memang dimaksudkan
sebagai admin panel saja (blog publiknya di halaman lain), tolong
dikonfirmasi supaya routing-nya tidak salah bikin.

### 4.2 Requirements teknis — Editor

- **Tiptap** (ProseMirror-based) sebagai block editor — mendukung block:
  Heading (H1-H3), Paragraph, Bullet/Numbered list, Blockquote, Code block,
  Image, Divider, Link.
- Auto-save draft setiap 5 detik (debounced) ke `content_json` (simpan
  format JSON Tiptap, bukan HTML mentah — supaya bisa re-render/edit lagi
  dengan struktur block utuh).
- Render publik pakai Tiptap's `generateHTML()` dari JSON yang sama, jadi
  satu sumber data untuk edit & tampil.
- Slug auto-generate dari judul (`kebab-case`), dengan cek duplikat.
- Status post: `draft` / `published` — draft tidak muncul di `/blog`
  publik, hanya terlihat di `/blog/admin`.
- Cover image upload (opsional per post) ke Supabase Storage bucket `blog-covers`.

### 4.3 Skema data

```sql
create table public.blog_posts (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  title text not null,
  excerpt text,
  cover_image_url text,
  content_json jsonb not null,      -- struktur block Tiptap
  status text not null default 'draft' check (status in ('draft','published')),
  tags text[] default '{}',
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  author_email text not null
);

alter table blog_posts enable row level security;

create policy "anyone can read published posts"
  on blog_posts for select
  using (status = 'published');

create policy "owner can read all (termasuk draft) and manage"
  on blog_posts for all
  using (auth.jwt() ->> 'email' = current_setting('app.owner_email', true));
```

### 4.4 UI — `/blog` (publik)

- List post: card style sama dengan Quest Card yang sudah ada (border
  hard-offset), tapi framing-nya "Lore Entries" atau "Dev Log" — konsisten
  bahasa quest/journey, bukan "Blog Post" generik. Contoh eyebrow:
  `// LORE ENTRIES`.
- Tiap card: cover image (kalau ada), judul, excerpt, tanggal publish, tags.
- Filter by tag (reuse pola `PixelButton` pill filter dari halaman Projects).

### 4.5 UI — `/blog/admin` (privat, owner-only)

- Table/list semua post (draft + published) dengan status badge.
- Tombol "+ Tulis Baru" → `/blog/admin/new`.
- Tiap row: Edit, Preview, Publish/Unpublish toggle, Delete (dengan
  confirm dialog).
- **Route guard**: middleware Next.js cek session + role sebelum render
  halaman manapun di bawah `/blog/admin` — redirect ke `/` kalau bukan owner.

### 4.6 UI — Editor (`/blog/admin/new` & `/edit`)

**Revisi penting**: editor **bukan** kotak terbatas dengan toolbar block
permanen di atas (pola form biasa) — feel yang diminta adalah **seamless
writing surface ala Medium**: judul & isi ditulis langsung di halaman,
tanpa border/box yang membatasi area menulis, dan kontrol block muncul
kontekstual, bukan selalu tampil.

```
   (Judul artikel... — font besar, langsung di halaman, bukan input di dalam box)

   Ketik "/" atau klik "+" di kiri baris kosong untuk menyisipkan block.

+  Mulai menulis paragraf di sini, selebar bacaan nyaman (max-width ~680px,
   center), tanpa border sekeliling area teks...

   [select sebagian teks] → muncul bubble toolbar mengambang tepat di atas
   seleksi: Bold / Italic / Link / Heading / Quote — hilang lagi saat klik
   di luar seleksi.

   [hover di kiri baris kosong] → muncul tombol "+" kecil (bukan permanen),
   klik → popover kecil: Heading, Quote, Bullet list, Code block, Image,
   Divider — mirip pola insert-block Notion, tapi trigger-nya per-baris
   bukan toolbar tetap di atas.

   ⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯
   ● Tersimpan otomatis · 2 detik lalu        Pengaturan cerita | Simpan Draft | Publish
```

- **Judul**: elemen `<textarea>`/`contentEditable` besar (font Fraunces,
  ~36-40px) langsung di halaman, bukan `<input>` di dalam header box —
  perilakunya seperti judul artikel Medium: auto-grow, Enter pindah ke
  paragraf pertama.
- **Body**: satu writing surface `contentEditable` lebar terbatas
  (max-width ~680px, di-center) tanpa border/background berbeda dari
  halaman — menyatu dengan latar, bukan "kotak form di atas kartu".
- **Insert block ("+")**: tombol kecil muncul **hanya saat hover** di
  margin kiri baris yang sedang kosong/aktif (bukan toolbar block yang
  selalu tampil di atas seperti draft sebelumnya) — klik membuka popover
  kecil dekat baris tersebut berisi pilihan block (Heading, Quote, Bullet
  list, Code block, Image, Divider).
- **Format teks (bold/italic/link/heading/quote)**: **hanya** muncul lewat
  bubble toolbar mengambang saat ada teks ter-select, tepat di atas seleksi
  — ini satu-satunya tempat untuk formatting inline, tidak ada tombol
  format permanen di layar.
- **Meta (slug/tags/status/cover)**: dipindah ke **drawer "Pengaturan
  cerita"** yang collapsed by default, dibuka lewat link kecil di topbar
  — supaya area menulis utama benar-benar bersih dari form-field, sesuai
  arahan "tidak dibatasi oleh box". Slug tetap auto-generate dari judul
  seperti draft sebelumnya, ditampilkan di dalam drawer ini.
- **Topbar**: hanya berisi indikator autosave (kiri) + link "Pengaturan
  cerita", tombol "Simpan Draft", tombol "Publish" (kanan) — tidak ada
  elemen lain yang bersaing secara visual dengan area menulis.
- Implementasi Tiptap: ini pola **bubble menu + floating "+" per node**
  yang memang didukung native oleh Tiptap (`BubbleMenu` extension untuk
  toolbar seleksi, `FloatingMenu`/custom node-view untuk tombol "+" per
  baris kosong) — tidak butuh library tambahan di luar Tiptap yang sudah
  direncanakan di §0.1.

### 4.7 Komponen React baru
| Komponen | Fungsi |
|---|---|
| `BlogPostCard.jsx` | card list publik `/blog` |
| `BlogPostList.jsx` | grid + filter tag |
| `BlogPostRenderer.jsx` | render `content_json` → HTML (dipakai di halaman baca) |
| `BlogAdminTable.jsx` | tabel kelola post di `/blog/admin` |
| `BlockEditor.jsx` | writing surface full-bleed (Tiptap `contentEditable`, tanpa wrapper box) |
| `EditorBubbleToolbar.jsx` | toolbar mengambang saat teks di-select (bold/italic/link/heading/quote) |
| `BlockInsertMenu.jsx` | tombol "+" per-baris + popover pilihan block |
| `StorySettingsDrawer.jsx` | drawer collapsed berisi slug/tags/status/cover |
| `useAutosave.js` (hook) | debounce save ke Supabase tiap perubahan |
| `useBlogPosts.js` (hook) | fetch/list/create/update/delete post |

---

## 5. Navigasi & Integrasi ke Navbar

Menyambung dari review navbar sebelumnya, berikut slot final di
`IslandNav`:

```
[● MB · NST]  Home  About  Projects  Research  Blog  Contact  [🧭][🎒][💬][⌘]  [Avatar/Login]
```

- **Blog** ditambah sebagai nav item baru sejajar Home/About/dst (bukan
  ikon — ini halaman utama, bukan utility popup).
- **🎒 (backpack)** — trigger popup Inventory/Achievement/Mission (dari
  `popup-system-design.md`).
- **💬 (chat bubble)** — trigger panel World Chat (baru, item ini).
- Avatar/Login — paling kanan, state berbeda tergantung status login.
- Mobile: item nav ketiga ke atas (About–Blog) masuk ke hamburger/overflow
  menu, ikon utility (🧭🎒💬⌘) tetap tampil sebagai row terpisah, avatar
  tetap paling kanan.

---

## 6. Keamanan & Privasi (Lintas Fitur)

1. **Server-side role check** di setiap route/API sensitif (`/blog/admin/*`,
   insert `inventory_items`, delete `chat_messages`) — jangan pernah
   percaya cek role yang hanya dilakukan di client (bisa di-bypass lewat
   devtools).
2. **RLS Postgres** sebagai lapisan pertahanan kedua (§2.4, §3.3, §4.3) —
   walaupun API sudah cek role, RLS mencegah akses langsung ke database
   kalau ada celah di layer API.
3. **Environment secrets** (`GOOGLE_CLIENT_SECRET`, `AUTH_SECRET`,
   Supabase service role key) **tidak boleh** ter-expose ke client bundle —
   pastikan hanya dipakai di server components/API routes, bukan diimpor
   ke file yang berjalan di browser.
4. **Data pribadi minimal**: dari Google login, hanya simpan nama, email,
   avatar URL — jangan minta scope tambahan yang tidak perlu (contacts,
   calendar, dll).
5. Cantumkan link kebijakan privasi singkat di dekat tombol login pertama
   kali (`[ASUMSI, MOHON DIKONFIRMASI]` — perlu halaman privacy policy
   terpisah kalau fitur ini live ke publik, terutama karena OAuth Google
   mewajibkan ini untuk app yang keluar dari testing mode).

---

## 7. Fase Implementasi (Urutan Disarankan)

| Fase | Fitur | Alasan urutan |
|---|---|---|
| 1 | Setup infra: Supabase project, Auth.js + Google OAuth | Semua fitur lain bergantung ke ini, harus jalan duluan |
| 2 | Login UI (navbar avatar/login button) | Validasi auth flow end-to-end sebelum bangun fitur di atasnya |
| 3 | Blog publik (`/blog`, `/blog/[slug]`) — tanpa CMS dulu, seed manual lewat Supabase dashboard | Fitur paling independen, tidak butuh chat/inventory jalan duluan |
| 4 | Blog admin + Block editor (`/blog/admin/*`) | Lanjutan natural dari fase 3 |
| 5 | Inventory manual-add (owner only) | Menyambung Inventory popup yang sudah didesain sebelumnya |
| 6 | World Chat (realtime + moderasi) | Paling kompleks (realtime + moderasi), dikerjakan terakhir setelah pola auth+DB sudah stabil dari fase 1-5 |

---

## 8. Ringkasan Semua Hal yang Perlu Dikonfirmasi

1. Setuju stack Auth.js + Supabase + Tiptap? (§0.1)
2. Kamu yang generate Google OAuth credentials & buat project Supabase (§0.2)
3. Konfirmasi single-owner model: hanya kamu yang kelola Blog & Inventory,
   visitor login cuma untuk Chat (§0.2 poin 4)
4. Perlu filter kata kasar otomatis di Chat atau moderasi manual saja? (§2.3)
5. Inventory manual-add: benar owner-only, atau visitor juga boleh
   punya koleksi personal? (§3.1) — ini menentukan skema data yang beda total
6. Konfirmasi struktur route `/blog` (publik) vs `/blog/admin` (privat),
   bukan `/blog` langsung jadi admin panel (§4.1)
7. Perlu halaman Privacy Policy terpisah sebelum fitur login live ke
   publik? (§6 poin 5)
