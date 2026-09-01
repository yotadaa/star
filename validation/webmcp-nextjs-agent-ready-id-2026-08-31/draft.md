# WebMCP vs MCP: Cara Membuat Website Next.js Agent-Ready Tanpa Screen Scraping

Browser agent sudah dapat mengoperasikan website dengan membaca DOM, mencari tombol, mengekliknya, menunggu perubahan halaman, lalu mengulang proses tersebut. Setiap langkah meminta model menafsirkan kembali antarmuka yang dibuat untuk manusia.

WebMCP memberi jalur lain. Website dapat mendeklarasikan tool bernama, menjelaskan input dengan JSON Schema, menghubungkannya ke logika aplikasi yang sama dengan UI, lalu mengembalikan hasil yang dibatasi. Agent tidak perlu menebak apakah label “AI” merupakan filter, tautan navigasi, atau sekadar badge.

Batasnya tetap jelas. [WebMCP merupakan proposed standard dan masih eksperimental](https://developer.chrome.com/docs/ai/webmcp). Chrome menyediakannya melalui origin trial Chrome 149 atau flag pengembangan lokal. Website yang memakai WebMCP tetap membutuhkan semantic HTML, kontrol aksesibel, URL stabil, dan perilaku browser biasa.

![Antarmuka portfolio pada laptop terhubung dengan benang ke lima tab indeks fisik berlabel Search, Filter, Project, Research, dan Contact, di samping stempel read-only.](asset://blog:webmcp-vs-mcp-nextjs-agent-ready-id:feature-tool-index)

*WebMCP menambahkan jalur machine-readable ke logika produk yang sudah ada; antarmuka untuk manusia tetap menjadi fondasinya.*

## WebMCP dan MCP menyelesaikan masalah discovery yang berbeda

MCP umumnya menghubungkan agent client ke server yang telah dikonfigurasi. Server tersebut dapat mengekspos tools dan resources tanpa mengharuskan agent membuka halaman web tertentu. Pola ini cocok untuk integrasi repository, database, tool lokal, dan layanan remote.

WebMCP menempelkan tools pada dokumen yang sedang aktif. [Draft Community Group saat ini mendefinisikan `document.modelContext.registerTool()`](https://webmachinelearning.github.io/webmcp/) untuk tool JavaScript serta tool deklaratif pada form HTML. Browser agent menemukan tools setelah mengunjungi halaman. State halaman, UI yang terlihat, dan implementasi tool dapat berbagi lifecycle yang sama.

| Pertanyaan | WebMCP | MCP |
|---|---|---|
| Di mana tools berada? | Dokumen web aktif | Server lokal atau remote yang dikonfigurasi |
| Bagaimana tools ditemukan? | Client mengunjungi website | Client terhubung ke MCP server |
| Batas state alami | Halaman dan sesi browser saat ini | Resource server dan scope integrasi |
| Kekuatan utama | Pemakaian aplikasi web untuk manusia dengan lebih andal | Akses yang dapat dipakai ulang di luar satu halaman |
| Kendala utama | Dukungan browser eksperimental dan discovery setelah kunjungan | Instalasi, kredensial, transport, dan izin server |

Namanya dapat menimbulkan salah tafsir. Spesifikasi WebMCP menyatakan browser bebas meneruskan tool halaman ke agent melalui MCP, function calling proprietari, atau mekanisme lain. Protokol MCP pada jalur browser-agent bukan syarat dari proposal ini.

## Lima tool untuk portfolio Next.js

Portfolio `me.mukhtada.my.id` kini mendeklarasikan lima tool kecil. Empat merupakan lookup global yang read-only. Satu tool hanya tersedia ketika halaman Projects dan grid yang terlihat sedang terpasang.

![Diagram lima tool WebMCP: empat lookup publik read-only dan satu filter proyek yang dapat dikembalikan.](asset://blog:webmcp-vs-mcp-nextjs-agent-ready-id:evidence-tool-surface)

*Batas tool tidak mencakup draft, pengiriman pesan, navigasi otomatis, atau akses lintas origin.*

| Tool | Input | Output atau efek yang terlihat |
|---|---|---|
| `search_blog` | keyword dan kategori opsional | maksimal lima ringkasan artikel terbit |
| `get_project` | judul proyek persis | satu proyek publik dan URL terverifikasi |
| `find_research` | judul paper persis | satu publikasi dan URL yang diusulkan |
| `get_contact_channels` | tanpa input | channel publik; tidak mengirim pesan |
| `filter_projects` | enum tipe dan kategori | grid terlihat berubah dan mengembalikan jumlah kartu |

Daftar tersebut sengaja tidak memiliki `send_contact_message`. Website ini menyediakan channel kontak, bukan message composer dengan tahap konfirmasi. Nama tool yang menyiratkan pengiriman akan menjanjikan fungsi yang tidak dimiliki produk. `get_contact_channels` hanya mengembalikan pilihan dan secara eksplisit menyatakan `messageSent: false`.

Navigasi juga dibatasi. Tool research dan project mengembalikan URL milik katalog repository dengan `navigationPerformed: false`. Browser client atau pengguna dapat menentukan apakah URL tersebut akan dibuka. Tool tidak menerima tujuan URL dari caller.

## Progressive enhancement pada client layer utama

Tool global dipasang di dalam client provider yang sudah ada. Sebuah hook kecil memeriksa `document.modelContext?.registerTool`. Bila API tidak tersedia, hook tidak merender UI, tidak menghasilkan error produksi, dan tidak mengubah website.

Setiap registrasi memperoleh `AbortController`. Unmount, perpindahan ke route privat, atau replay effect pada React Strict Mode akan membatalkan registrasi. Fungsi execute disimpan dalam ref sehingga render React biasa tidak menumpuk nama tool duplikat.

```js
useEffect(() => {
  if (!enabled || !document.modelContext?.registerTool) return;

  const controller = new AbortController();
  document.modelContext.registerTool(
    { ...definition, execute: (input, options) => run(input, options.signal) },
    { signal: controller.signal },
  );

  return () => controller.abort();
}, [definition, enabled]);
```

Kode lengkap juga mengubah hasil menjadi teks JSON biasa, memakai error code yang stabil, dan membatasi output 1.500 karakter. Hasil pencarian tidak dapat membanjiri context agent.

## Pencarian Blog tidak boleh mewarisi akses owner

API Blog yang sudah ada memahami sesi. Owner yang login dapat meminta draft. Memakai endpoint itu untuk WebMCP berpotensi membocorkan judul atau excerpt yang belum diterbitkan kepada agent di browser pengelola situs.

Route khusus `/api/webmcp/blog-search` mengunci batas tersebut pada server. Route selalu meminta data terbit, menolak parameter asing seperti `includeDrafts`, membatasi field output, menghapus body dan ID internal, mengembalikan maksimal lima baris, serta memakai `Cache-Control: no-store`.

Request anonim dan request dengan cookie menghasilkan byte respons yang sama untuk query yang sama. Request dengan `includeDrafts=true` memperoleh HTTP 400. Sifat endpoint tersebut lebih kuat daripada berharap setiap caller selalu mengingat `credentials: "omit"`; endpoint memang tidak memiliki jalur untuk meminta draft.

Excerpt Blog tetap diperlakukan sebagai konten tidak tepercaya. Definisi tool memakai `untrustedContentHint`, dan respons diserialisasi sebagai data biasa, bukan HTML. [Panduan keamanan WebMCP dari Chrome](https://developer.chrome.com/docs/ai/webmcp/secure-tools) menyarankan hint itu untuk user-generated atau externally sourced content, serta `readOnlyHint` untuk tool yang tidak mengubah state.

## Satu selector mengendalikan grid dan tool

`filter_projects` didaftarkan di dalam `ProjectsGrid`, bukan provider global. Posisi ini memberi tool akses ke React setter dan daftar proyek yang sama dengan kontrol yang terlihat. Keluar dari `/projects` otomatis menghapus tool tersebut.

Klik tombol manual maupun panggilan tool menggunakan pure selector yang sama:

```js
export function selectProjects(projects, filters) {
  return projects.filter((project) =>
    (filters.type === "All" || project.type === filters.type) &&
    (filters.category === "All" || project.category === filters.category)
  );
}
```

Tool menerima enum, bukan teks bebas. Pasangan yang tidak valid tidak mengubah filter. Pasangan valid di-commit secara sinkron sebelum handler selesai, sehingga `visibleCount` menggambarkan grid yang sudah tampil.

![Halaman Projects pada portfolio asli difilter ke tipe AI dan kategori All, menampilkan dua kartu proyek yang cocok.](asset://blog:webmcp-vs-mcp-nextjs-agent-ready-id:evidence-live-filter)

*Selector yang sama menghasilkan dua kartu proyek AI pada desktop dan mobile tanpa horizontal overflow.*

## Cakupan bukti kompatibilitas

Implementasi memiliki lima definisi tool unik. Setiap schema menolak properti tambahan; nama tool dan parameter berada di bawah batas rekomendasi Chrome sebesar 30 karakter; deskripsi di bawah 500 karakter; dan output dibatasi 1.500 karakter.

Mock model-context mendaftarkan tool, memanggilnya, membaca hasil JSON yang dibatasi, lalu memastikan lifecycle signal menghapus registrasi. Endpoint published-only mempertahankan respons yang sama pada request anonim dan request dengan cookie. Browser biasa yang tidak memiliki `document.modelContext` tetap merender halaman Projects tanpa warning atau console error terkait WebMCP.

Pemilihan tool oleh agent native memerlukan client Chrome 149 dengan origin trial WebMCP aktif. Sebelum client tersebut masuk ke permukaan pengujian, tidak ada dasar untuk memberi persentase pada pemilihan `search_blog`, penanganan confirmation, atau konsistensi interpretasi schema antar-agent. Uji native yang lengkap mencakup discovery, direct invocation, prompt ambigu, perubahan state cepat, dan confirmation UI.

## Pilihan keamanan yang lebih penting daripada demo

[Chrome menyebut prompt injection sebagai risiko yang belum terselesaikan pada sistem agentic](https://developer.chrome.com/docs/ai/webmcp/secure-tools). Tool terstruktur mengurangi langkah menebak DOM, tetapi deskripsi dan output tool tetap masuk ke context agent.

Lima batas menjaga surface portfolio tetap sempit:

1. **Tanpa cross-origin exposure.** Registrasi tidak mengatur `exposedTo`; kebijakan same-origin default tetap berlaku.
2. **Tanpa konten privat.** Pencarian Blog memakai endpoint published-only dan tidak memiliki fallback ke API owner.
3. **Tanpa aksi irreversible.** Satu-satunya mutation mengubah dua filter yang terlihat dan dapat segera dikembalikan.
4. **Tanpa tujuan dari caller.** URL project dan research berasal dari katalog repository yang telah diperiksa.
5. **Tanpa aksi kontak diam-diam.** Tool hanya menampilkan channel, tanpa popup, `mailto:`, analytics mutation, atau pengiriman pesan.

Write tool di masa depan memerlukan desain terpisah. Posting komentar, mengirim form, menyalin teks privat, mengunduh file, atau mengubah account state tidak boleh mewarisi asumsi keamanan lookup read-only.

## Keterbatasan saat ini dan jadwal challenge

WebMCP client harus mengunjungi website sebelum menemukan tools. Pola ini berbeda dari direktori integrasi umum. Chrome juga menjelaskan bahwa API tersebut terutama dirancang untuk workflow browser lokal dengan manusia tetap berada dalam alur. Antarmuka kompleks mungkin membutuhkan refactor state.

Perkembangannya cepat. [OpenAI WebMCP Challenge](https://openai.com/webmcp-challenge/) membuka submission pada 25 Agustus 2026 dan menutupnya pada 3 September pukul 13.00 PT, setara 4 September pukul 03.00 WIB. Pengumuman pemenang direncanakan pada 23 September, tetapi tanggal itu dapat berubah sesuai volume submission. Aplikasi lama juga dapat ditambahkan dukungan WebMCP; peserta tidak harus membuat produk baru.

Implementasi Next.js yang tahan perubahan sebaiknya menjaga surface eksperimental tetap kecil. Registrasi tool berada di balik satu hook. Business logic tetap berada pada modul biasa yang dapat diuji. Browser tanpa dukungan tetap menerima website lengkap. Bila proposal berubah, pelepasan provider cukup menonaktifkan WebMCP tanpa membongkar portfolio.

Untuk toolchain agent yang lebih luas, [Open-Source Tools for 2026](/blog/open-source-tools-2026-stack-that-works-together) membahas lapisan pendukungnya. [Why 100 Agent Skills Can Be Worse Than 5](/blog/why-100-agent-skills-can-be-worse-than-5) menjelaskan mengapa katalog tool yang lebih kecil dapat lebih mudah dirutekan secara tepat.
