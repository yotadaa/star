import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { ConvexHttpClient } from "convex/browser";
import { makeFunctionReference } from "convex/server";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const slug = "genbi-rebranding";
const repositoryUrl = "https://github.com/GenBI-Jambi/genbi-rebranding";
const sourceRoot = path.join(root, "docs", "blogs", "genbi-rebranding");
const listBlogAdmin = makeFunctionReference("bridge:listBlogAdmin");
const createBlog = makeFunctionReference("bridge:createBlog");
const updateBlog = makeFunctionReference("bridge:updateBlog");
const createFileUploadUrl = makeFunctionReference("bridge:createFileUploadUrl");
const commitFile = makeFunctionReference("bridge:commitFile");
const getFile = makeFunctionReference("bridge:getFile");
const findFileBySourceKey = makeFunctionReference("bridge:findFileBySourceKey");

const imageAssets = [
  {
    source: "Pasted image.png",
    sourceKey: `blog:${slug}:home`,
    fileName: "genbi-home.png",
  },
  {
    source: "Pasted image (2).png",
    sourceKey: `blog:${slug}:about`,
    fileName: "genbi-about.png",
  },
  {
    source: "Pasted image (3).png",
    sourceKey: `blog:${slug}:team`,
    fileName: "genbi-team.png",
  },
  {
    source: "Pasted image (7).png",
    sourceKey: `blog:${slug}:news`,
    fileName: "genbi-news.png",
  },
  {
    source: "Pasted image (6).png",
    sourceKey: `blog:${slug}:events`,
    fileName: "genbi-events.png",
  },
  {
    source: "Pasted image (4).png",
    sourceKey: `blog:${slug}:achievements`,
    fileName: "genbi-achievements.png",
  },
  {
    source: "Pasted image (8).png",
    sourceKey: `blog:${slug}:news-editor`,
    fileName: "genbi-news-editor.png",
  },
];

function loadLocalEnv() {
  const envPath = path.join(root, ".env.local");
  if (!fs.existsSync(envPath)) return;

  for (const rawLine of fs.readFileSync(envPath, "utf8").split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) continue;
    const separator = line.indexOf("=");
    if (separator < 1) continue;
    const key = line.slice(0, separator).trim();
    let value = line.slice(separator + 1).trim();
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    if (process.env[key] === undefined) process.env[key] = value;
  }
}

export const genbiRebrandingBlogPayload = {
  title: "GenBI Jambi: Saat Rebranding Tumbuh Menjadi Sistem Kerja Organisasi",
  slug,
  excerpt:
    "Review proyek situs GenBI Provinsi Jambi yang berkembang menjadi CMS, direktori anggota, presensi, poin aktivitas, katalog buku, dan keuangan berbasis peran.",
  status: "published",
  tags: ["PHP", "CMS", "SSR", "Community Platform"],
  readTime: "10 min baca",
  coverTone: "research",
  sourceHref: repositoryUrl,
  blocks: [
    {
      type: "paragraph",
      text: "Nama repositorinya genbi-rebranding, tetapi isi cabang ssr sudah jauh melampaui pekerjaan mengganti warna dan tipografi. Situs yang terlihat publik memang mendapat wajah baru. Di bawahnya ada CMS berita, direktori anggota, prestasi, agenda, buku, presensi, poin aktivitas, pengaturan situs, dan modul keuangan dengan akses berbeda untuk wilayah, UNJA, serta UIN.",
    },
    {
      type: "paragraph",
      text: "Review ini memakai snapshot yang disediakan bersama tujuh tangkapan layar unik. Saya membaca riwayat Git, routes, model, migration, test, dan halaman PHP yang membentuk hasil di official.genbijambi.com. Karena itu, angka di artikel ini menggambarkan snapshot tersebut, bukan klaim yang akan selalu benar setelah repositorinya bergerak lagi.",
    },
    {
      type: "image",
      assetKey: `blog:${slug}:home`,
      alt: "Halaman depan situs GenBI Provinsi Jambi dengan navigasi putih, kolase kegiatan berlapis biru, dan judul Bersama GenBI tumbuh dan berdampak untuk Jambi",
      text: "Beranda memakai dokumentasi kegiatan sebagai latar utama, lalu memberi jalan langsung ke profil organisasi, berita, dan video.",
    },
    { type: "divider", text: "" },
    { type: "heading", text: "Nama repositorinya sudah terlalu sempit" },
    {
      type: "paragraph",
      text: "Snapshot ini memuat 247 commit. Riwayatnya dimulai pada 6 Mei 2026 dan mencapai 18 Agustus 2026; 165 commit tercatat atas akun yotadaa, sedangkan sisanya berasal dari Aziz Alhadiid. Perubahannya hadir sedikit demi sedikit. CMS berita masuk lebih dulu, lalu SSR, tema, presensi, GenBI Poin, buku, dan keuangan. Pola itu terasa seperti perangkat kerja yang mengikuti kebutuhan pengurus, bukan paket fitur yang ditentukan sekali di awal.",
    },
    {
      type: "quote",
      text: "Saya menilai proyek ini dari satu hal: kebutuhan organisasi terus masuk ke kode, dan repositorinya cukup lentur untuk menampungnya. Kelenturan itu berguna, tetapi sekarang mulai menagih biaya perawatan.",
    },
    {
      type: "table",
      text: "Snapshot teknis GenBI rebranding",
      rows: [
        ["Bagian", "Isi snapshot yang direview"],
        ["Tampilan publik", "PHP server-rendered views, Tailwind CSS, dan JavaScript progresif"],
        ["Fondasi backend", "Router, Request, Response, ViewRenderer, migration runner, dan PDO buatan sendiri"],
        ["Rute publik", "30 deklarasi untuk halaman, detail konten, formulir, sitemap, dan feed"],
        ["Rute admin", "97 deklarasi untuk konten, anggota, komentar, presensi, poin, buku, serta pengaturan"],
        ["Rute keuangan", "56 deklarasi untuk wilayah, komisariat UNJA, komisariat UIN, dan anggota"],
        ["Jejak perubahan data", "45 migration pada aplikasi PHP utama"],
        ["Test yang tersedia", "33 file test PHP dan 2 file test JavaScript"],
      ],
    },
    {
      type: "paragraph",
      text: "Angka route dan file test tidak otomatis membuat codebase sehat. Angka tersebut memberi ukuran yang lebih jujur: ini sudah menjadi aplikasi organisasi dengan banyak pintu masuk, bukan microsite kampanye.",
    },
    { type: "heading", text: "Identitas visualnya tenang dan mudah dikenali" },
    {
      type: "paragraph",
      text: "Tema default mengunci warna biru Bank Indonesia, permukaan putih kebiruan, teks gelap, Inter untuk antarmuka, dan Source Serif 4 untuk judul. Kartu memakai sudut lunak serta bayangan tipis. ThemeRegistry juga menyediakan sepuluh tema terang dan sepuluh tema gelap sebagai pilihan tambahan, lengkap dengan skrip pemeriksa kontras. Saya suka keputusan mengunci template GenBI; admin boleh bereksperimen tanpa menghilangkan identitas resmi.",
    },
    {
      type: "image",
      assetKey: `blog:${slug}:about`,
      alt: "Halaman Tentang GenBI Provinsi Jambi dengan hero kolase biru serta bagian Tentang, Visi, dan Misi pada latar putih",
      text: "Halaman Tentang menjaga isi organisasi tetap sederhana. Tipografi serif memisahkan judul dari teks penjelas tanpa ornamen berlebih.",
    },
    {
      type: "image",
      assetKey: `blog:${slug}:team`,
      alt: "Direktori Tim GenBI Jambi dengan pencarian, filter divisi, kampus dan tahun, serta kartu anggota",
      text: "Direktori anggota memuat pencarian, tiga filter, pilihan grid atau list, dan data 200 anggota pada tangkapan yang diberikan.",
    },
    {
      type: "paragraph",
      text: "Kolase hero yang sama membuat perpindahan halaman terasa konsisten. Pada halaman dalam, ukurannya juga mengambil ruang cukup besar sebelum pengguna mencapai data. Saya akan mempertahankan kolasenya, lalu memendekkan hero untuk direktori yang sering dibuka berulang seperti Tim, Berita, dan Prestasi.",
    },
    { type: "heading", text: "Konten publik punya bentuk yang sesuai pekerjaannya" },
    {
      type: "paragraph",
      text: "Berita tidak dipaksa menjadi grid kartu yang padat. Halamannya memakai daftar editorial dengan gambar kecil, kategori, tanggal, ringkasan, dan tombol detail. Tangkapan layar mencatat 94 berita, jadi pilihan ini masuk akal; mata dapat memindai judul tanpa berhadapan dengan 12 gambar besar sekaligus.",
    },
    {
      type: "image",
      assetKey: `blog:${slug}:news`,
      alt: "Halaman Berita GenBI Jambi dengan pencarian dan daftar editorial berisi foto kecil, kategori, tanggal, judul, ringkasan, serta tombol Detail",
      text: "Daftar Berita memberi ruang lebih banyak pada judul dan ringkasan daripada thumbnail.",
    },
    {
      type: "paragraph",
      text: "Agenda memilih kartu karena tanggal, lokasi, dan status kegiatan perlu terlihat bersamaan. Prestasi memakai dua kolom yang memberi porsi besar pada foto dan nama penerima. Dua halaman itu berbagi bahasa visual, tetapi tidak menyalin susunan Berita mentah-mentah.",
    },
    {
      type: "image",
      assetKey: `blog:${slug}:events`,
      alt: "Halaman Agenda dan kegiatan GenBI Jambi dengan kolom pencarian serta tiga kartu event yang menampilkan tanggal, lokasi, status, dan tombol Detail",
      text: "Tangkapan Agenda menampilkan enam kegiatan dan menandai kegiatan lampau langsung pada gambar kartu.",
    },
    {
      type: "image",
      assetKey: `blog:${slug}:achievements`,
      alt: "Halaman Prestasi GenBI Jambi dalam tampilan grid dua kolom dengan foto pencapaian, kategori, tahun, judul, ringkasan, dan nama anggota",
      text: "Prestasi memusatkan perhatian pada bukti foto dan nama anggota. Tangkapan yang diberikan mencatat 35 entri.",
    },
    { type: "heading", text: "CMS-nya dekat dengan halaman yang diterbitkan" },
    {
      type: "paragraph",
      text: "Editor berita memperlihatkan hubungan antara kerja admin dan hasil publik. Judul, ringkasan, isi, kategori, status komentar, tanggal terbit, featured photo, dan image block berada di satu layar. Editor.js menyimpan isi sebagai blok, sehingga gambar dapat masuk ke alur artikel alih-alih selalu diperlakukan sebagai sampul.",
    },
    {
      type: "image",
      assetKey: `blog:${slug}:news-editor`,
      alt: "Panel admin GenBI CMS pada halaman Edit News dengan editor judul, ringkasan dan isi, menu Quick Insert, pengaturan publikasi, serta navigasi fitur di sisi kiri",
      text: "Editor berita menyatukan penulisan blok dengan metadata publikasi dan tetap memperlihatkan seluruh area CMS di sidebar.",
    },
    {
      type: "paragraph",
      text: "Halaman publik merender HTML awal melalui ViewRenderer. JavaScript kemudian memeriksa penanda data-ssr dan hanya memasang pencarian, filter, modal, komentar, atau kontrol lain yang perlu hidup di browser. Keputusan ini menjaga konten tetap terbaca tanpa menunggu aplikasi klien membangun ulang seluruh halaman.",
    },
    { type: "heading", text: "Bagian operasional mengubah skala proyek" },
    {
      type: "paragraph",
      text: "Begitu presensi, poin anggota, dan keuangan masuk, proyek ini berhenti menjadi etalase semata. Route admin melindungi area kerja dengan AuthMiddleware, CsrfMiddleware, dan RoleMiddleware. Modul keuangan memakai login serta pemeriksaan peran tersendiri, lalu memisahkan transaksi wilayah, komisariat UNJA, komisariat UIN, dan tampilan anggota.",
    },
    {
      type: "list",
      text: [
        "Prestasi dapat menerima kiriman melalui token publik yang memiliki masa berlaku dan status pencabutan.",
        "Presensi mencatat event, submission, daftar anggota, persetujuan manual, dan hubungan aktivitas dengan GenBI Poin.",
        "Admin mengelola berita, komentar, agenda, anggota, program utama, galeri foto, buku, identitas situs, topbar, footer, kontak, serta tema.",
        "Keuangan menyimpan kegiatan, pemasukan, pengeluaran, alokasi dana, sumber dana, profil bendahara, dan bukti transaksi untuk unit yang berbeda.",
      ].join("\n"),
    },
    {
      type: "paragraph",
      text: "Lapisan SEO juga dikerjakan di server. Repo memiliki canonical URL, Open Graph, Twitter Card, structured data, RSS, sitemap index, serta sitemap terpisah untuk halaman, berita, event, prestasi, dan gambar. Ini detail yang mudah hilang ketika perhatian habis pada CMS.",
    },
    { type: "heading", text: "Keamanan tidak ditunda sampai belakang" },
    {
      type: "paragraph",
      text: "Commit pertama di snapshot sudah menyebut autentikasi, CSRF, dan hardening. Kode saat ini menambah header CSP, X-Frame-Options, Referrer-Policy, serta Permissions-Policy. Password memakai password_hash dan password_verify; login serta komentar memiliki throttle. Repo juga menyimpan audit keamanan dan test untuk sanitizer, token, middleware, model, route HEAD, SEO, serta pengaturan.",
    },
    {
      type: "paragraph",
      text: "Saya tetap tidak akan membaca jumlah test sebagai jaminan aman. Yang dapat dibuktikan dari snapshot ialah batas keamanan hadir di kode dan punya test khusus. Audit produksi, konfigurasi server, permission upload, dan data nyata tetap memerlukan pemeriksaan di lingkungan tempat situs berjalan.",
    },
    { type: "divider", text: "" },
    { type: "heading", text: "Dua arsitektur membuat arah berikutnya kabur" },
    {
      type: "paragraph",
      text: "Cabang ssr menyimpan aplikasi PHP MVC utama di root sekaligus satu aplikasi Laravel lengkap di laravel-app. Riwayat akhir Juli mencatat percobaan migrasi ke Laravel, penyelesaian paritas, lalu penggabungan kembali ke cabang SSR. Eksperimen itu wajar. Menjaga dua pohon aplikasi setelah fitur terus bertambah akan membuat perbaikan keamanan, view, dan route mudah berbeda tanpa sengaja.",
    },
    {
      type: "list",
      text: [
        "Pilih satu runtime produksi. Custom PHP masuk akal untuk hosting cPanel yang terbatas, sedangkan Laravel memberi konvensi yang lebih jelas jika lingkungan server mendukungnya.",
        "Tarik aturan transaksi keuangan yang berulang ke service bersama. Controller Wilayah memiliki 871 baris; controller UNJA dan UIN masing-masing mendekati 700 baris.",
        "Pecah view dan model terbesar. Halaman buku publik sudah 990 baris, sementara beberapa model dan controller melewati 500 baris.",
        "Kurangi artefak build yang disimpan ganda. Source JavaScript, folder dist, stylesheet minified, dan arsip ZIP berada dalam repo yang sama.",
      ].join("\n"),
    },
    {
      type: "quote",
      text: "Pilihan arsitektur berikutnya harus mengurangi sumber kebenaran. Salinan aplikasi ketiga hanya akan menambah pekerjaan sinkronisasi.",
    },
    { type: "heading", text: "Penilaian akhir" },
    {
      type: "paragraph",
      text: "Rebrand ini bekerja karena identitas visual tidak berdiri sendiri. Beranda, Tentang, Tim, Prestasi, Agenda, Berita, dan CMS memakai bahasa tipografi serta warna yang sama, sementara bentuk daftar berubah mengikuti jenis datanya. Tangkapan layar terlihat seperti satu produk, bukan kumpulan template yang ditempelkan ke database.",
    },
    {
      type: "paragraph",
      text: "Keputusan teknis terbaiknya ada pada SSR dan progressive enhancement. Konten utama keluar dari server, sedangkan JavaScript menangani interaksi yang memang membutuhkannya. Saya akan mempertahankan pola itu dan modul operasional yang sudah dipakai. Pekerjaan berikutnya ialah memilih satu fondasi backend, membagi file besar, serta menyatukan aturan yang kini berulang di tiga jalur keuangan.",
    },
    {
      type: "paragraph",
      text: "Nama genbi-rebranding boleh tetap tinggal di GitHub sebagai catatan awal. Deskripsi proyeknya perlu berubah. Snapshot ini sudah merekam sistem kerja digital GenBI Provinsi Jambi, lengkap dengan sisi publik yang rapi dan dapur admin yang cukup serius untuk dirawat sebagai produk jangka panjang.",
    },
  ],
};

function sha256(bytes) {
  return crypto.createHash("sha256").update(bytes).digest("hex");
}

function validateSourceEvidence() {
  const hashes = new Set();
  for (const asset of imageAssets) {
    const sourcePath = path.join(sourceRoot, asset.source);
    if (!fs.existsSync(sourcePath)) throw new Error(`GenBI screenshot is missing: ${sourcePath}`);
    hashes.add(sha256(fs.readFileSync(sourcePath)));
  }
  if (hashes.size !== imageAssets.length) {
    throw new Error("The selected GenBI Blog screenshots must be unique");
  }
}

function validatePayload(payload, { requireStorage = false } = {}) {
  const images = payload.blocks.filter((block) => block.type === "image");
  if (images.length !== imageAssets.length) {
    throw new Error(`Expected ${imageAssets.length} image blocks, received ${images.length}`);
  }
  for (const image of images) {
    if (!image.assetKey?.startsWith(`blog:${slug}:`)) {
      throw new Error(`Invalid Convex image asset key: ${image.assetKey || "missing"}`);
    }
    if (requireStorage && !image.storageId) {
      throw new Error(`Missing Convex storage ID for ${image.assetKey}`);
    }
    if (image.src) throw new Error(`Image payload must not persist a storage URL: ${image.assetKey}`);
    if (!image.alt?.trim()) throw new Error(`Missing alt text for ${image.assetKey}`);
  }

  const headings = new Set(payload.blocks.filter((block) => block.type === "heading").map((block) => block.text));
  for (const expected of [
    "Nama repositorinya sudah terlalu sempit",
    "Identitas visualnya tenang dan mudah dikenali",
    "Konten publik punya bentuk yang sesuai pekerjaannya",
    "CMS-nya dekat dengan halaman yang diterbitkan",
    "Bagian operasional mengubah skala proyek",
    "Dua arsitektur membuat arah berikutnya kabur",
    "Penilaian akhir",
  ]) {
    if (!headings.has(expected)) throw new Error(`Missing review section: ${expected}`);
  }
}

function detectContentType(bytes) {
  if (bytes.length >= 8 && bytes.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]))) {
    return "image/png";
  }
  throw new Error("GenBI Blog assets must be PNG images");
}

async function uploadImageAssets(client, secret, actor) {
  const storedByAssetKey = new Map();
  let uploaded = 0;
  let reused = 0;

  for (const asset of imageAssets) {
    const sourcePath = path.join(sourceRoot, asset.source);
    const bytes = fs.readFileSync(sourcePath);
    const checksum = sha256(bytes);
    const contentType = detectContentType(bytes);
    const existing = await client.action(findFileBySourceKey, {
      secret,
      sourceKey: asset.sourceKey,
    });

    let stored = existing;
    if (!existing?.storage_id || !existing?.url || existing.metadata?.sha256 !== checksum) {
      const uploadUrl = await client.action(createFileUploadUrl, { secret, actor });
      const uploadResponse = await fetch(uploadUrl, {
        method: "POST",
        headers: { "Content-Type": contentType },
        body: bytes,
      });
      if (!uploadResponse.ok) {
        throw new Error(`Convex upload failed for ${asset.source}: ${uploadResponse.status}`);
      }
      const upload = await uploadResponse.json();
      if (!upload.storageId) throw new Error(`Convex did not return a storage ID for ${asset.source}`);

      const fileId = await client.action(commitFile, {
        secret,
        storageId: upload.storageId,
        sourceKey: asset.sourceKey,
        originalName: asset.fileName,
        contentType,
        sizeBytes: bytes.length,
        metadata: {
          purpose: "blog-image-block",
          blogSlug: slug,
          sourcePath: path.relative(root, sourcePath),
          sha256: checksum,
        },
        actor,
      });
      stored = await client.action(getFile, { secret, id: fileId });
      uploaded += 1;
    } else {
      reused += 1;
    }

    if (!stored?.storage_id || !stored?.url) {
      throw new Error(`Convex storage verification failed for ${asset.sourceKey}`);
    }
    storedByAssetKey.set(asset.sourceKey, stored);
  }

  return { storedByAssetKey, uploaded, reused };
}

function attachStorageIds(payload, storedByAssetKey) {
  return {
    ...payload,
    blocks: payload.blocks.map((block) => {
      if (block.type !== "image") return block;
      const stored = storedByAssetKey.get(block.assetKey);
      if (!stored?.storage_id) throw new Error(`Missing uploaded file for ${block.assetKey}`);
      return { ...block, storageId: stored.storage_id };
    }),
  };
}

export async function publishGenbiRebrandingBlog() {
  loadLocalEnv();
  validateSourceEvidence();
  validatePayload(genbiRebrandingBlogPayload);

  const convexUrl = String(process.env.CONVEX_CLOUD_URL || "").trim().replace(/\/+$/, "");
  const secret = process.env.CONVEX_INTERNAL_API_KEY;
  if (!convexUrl) throw new Error("CONVEX_CLOUD_URL is not configured");
  if (!secret) throw new Error("CONVEX_INTERNAL_API_KEY is not configured");

  const client = new ConvexHttpClient(convexUrl);
  const actor = {
    key: "repository-review:genbi-rebranding",
    email: String(process.env.OWNER_EMAIL || "mukhtadanasution@gmail.com").trim().toLowerCase(),
    name: "Mukhtada Billah NST",
    role: "backend",
  };
  const uploads = await uploadImageAssets(client, secret, actor);
  const publishPayload = attachStorageIds(genbiRebrandingBlogPayload, uploads.storedByAssetKey);
  validatePayload(publishPayload, { requireStorage: true });
  const posts = await client.action(listBlogAdmin, { secret, limit: 100 });
  const existing = posts.find((post) => post.slug === slug);
  const post = existing
    ? await client.action(updateBlog, {
        secret,
        id: existing.id,
        payload: publishPayload,
        actor,
      })
    : await client.action(createBlog, {
        secret,
        payload: publishPayload,
        actor,
      });

  if (!post || post.slug !== slug || post.status !== "published") {
    throw new Error("GenBI Blog publish verification failed");
  }
  const publishedImages = post.blocks.filter(
    (block) => block.type === "image" && block.storageId && block.assetKey && block.src?.startsWith("https://"),
  );
  if (publishedImages.length !== imageAssets.length) {
    throw new Error("Published post is missing rendered image blocks");
  }

  console.log(`${existing ? "Updated" : "Created"} Blog post: ${post.slug}`);
  console.log(
    `Blocks: ${post.blocks.length}; images: ${publishedImages.length}; uploads: ${uploads.uploaded}; reused: ${uploads.reused}; source: ${post.sourceHref}`,
  );
  return post;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  await publishGenbiRebrandingBlog();
}
