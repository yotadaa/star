import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { ConvexHttpClient } from "convex/browser";
import { makeFunctionReference } from "convex/server";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const slug = "stok-toko-project-review";
const repositoryUrl = "https://github.com/yotadaa/shop-management";
const sourceRoot = path.join(root, "docs", "blogs", "stok-toko-review");
const listBlogAdmin = makeFunctionReference("bridge:listBlogAdmin");
const createBlog = makeFunctionReference("bridge:createBlog");
const updateBlog = makeFunctionReference("bridge:updateBlog");
const createFileUploadUrl = makeFunctionReference("bridge:createFileUploadUrl");
const commitFile = makeFunctionReference("bridge:commitFile");
const getFile = makeFunctionReference("bridge:getFile");
const findFileBySourceKey = makeFunctionReference("bridge:findFileBySourceKey");

const imageAssets = [
  {
    source: "WhatsApp Image 2026-08-23 at 15.53.17(2).jpeg",
    sourceKey: `blog:${slug}:catalog`,
    fileName: "stok-toko-catalog.jpeg",
  },
  {
    source: "WhatsApp Image 2026-08-23 at 15.53.17(1).jpeg",
    sourceKey: `blog:${slug}:checkout`,
    fileName: "stok-toko-checkout.jpeg",
  },
  {
    source: "WhatsApp Image 2026-08-23 at 15.53.13.jpeg",
    sourceKey: `blog:${slug}:transaction-detail`,
    fileName: "stok-toko-transaction-detail.jpeg",
  },
  {
    source: "WhatsApp Image 2026-08-23 at 15.53.15(1).jpeg",
    sourceKey: `blog:${slug}:barcode-scanner`,
    fileName: "stok-toko-barcode-scanner.jpeg",
  },
  {
    source: "WhatsApp Image 2026-08-23 at 15.53.17.jpeg",
    sourceKey: `blog:${slug}:assistant`,
    fileName: "stok-toko-assistant.jpeg",
  },
  {
    source: "WhatsApp Image 2026-08-23 at 15.53.16(2).jpeg",
    sourceKey: `blog:${slug}:shopping-lists`,
    fileName: "stok-toko-shopping-lists.jpeg",
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

export const stokTokoReviewBlogPayload = {
  title: "Stok Toko: Review atas Kasir Android yang Memilih Offline Dulu",
  slug,
  excerpt:
    "Review teknis aplikasi Android native untuk katalog, kasir, daftar belanja, scanner barcode, dan asisten stok, dibangun dengan Kotlin, Jetpack Compose, serta Room.",
  status: "published",
  tags: ["Android", "Kotlin", "Jetpack Compose", "Room"],
  readTime: "8 min baca",
  coverTone: "research",
  sourceHref: repositoryUrl,
  blocks: [
    {
      type: "paragraph",
      text: "Warung tidak membutuhkan aplikasi yang berhenti bekerja ketika sinyal ikut hilang. Stok Toko mengambil batas yang lebih masuk akal: katalog, kasir, riwayat transaksi, daftar belanja, dan percakapan asisten tinggal di satu perangkat Android. Kamera membaca barcode di perangkat, sementara fitur AI diarahkan ke endpoint OpenAI-compatible yang dapat dipilih sendiri oleh pemilik toko.",
    },
    {
      type: "paragraph",
      text: "Data utama masuk ke Room dan SQLite, layar mengikuti perubahan lewat Kotlin Flow, lalu operasi yang menyentuh stok dibungkus dalam transaksi database. Setelah membaca kode dan menelusuri hasil tangkapan aplikasinya, saya paling suka cara alur kerja yang terpisah tetap memakai sumber data yang sama. Efek kaca memberi karakter; hubungan antarlayar membuat prototipe ini meyakinkan.",
    },
    { type: "divider", text: "" },
    { type: "heading", text: "Katalog yang dipakai untuk bekerja" },
    {
      type: "paragraph",
      text: "Layar Produk langsung memperlihatkan hal yang dicari staf toko: nama barang, harga, jumlah stok, gambar, serta label tersedia atau menipis. Pencarian, filter status, filter kategori, menu edit, pengarsipan, impor-ekspor CSV, dan laporan stok berada di jalur yang sama. Status juga tidak diserahkan pada warna saja; teks Tersedia, Stok Menipis, dan Stok Habis tetap terbaca.",
    },
    {
      type: "paragraph",
      text: "Scanner memproses EAN-13, EAN-8, Code 128, Code 39, dan QR pada single-thread executor. Hasil pertama menutup jalur analisis berikutnya agar frame kamera tidak terus dibaca setelah kode ditemukan. Pengguna tetap mendapat input manual ketika kemasan rusak atau kamera sulit mengunci kode.",
    },
    {
      type: "image",
      assetKey: `blog:${slug}:catalog`,
      alt: "Layar Produk Stok Toko menampilkan kolom pencarian, filter status dan kategori, serta daftar barang dengan harga dan label stok",
      text: "Katalog menyatukan pencarian, filter, status stok, harga, dan pintasan tambah barang dalam satu layar.",
    },
    {
      type: "image",
      assetKey: `blog:${slug}:barcode-scanner`,
      alt: "Layar Scanner Stok Toko dengan pratinjau kamera, bingkai barcode, tombol kamera, dan kolom Manual Entry",
      text: "Jalur scanner tetap menyediakan input manual; kegagalan kamera tidak memutus pekerjaan kasir.",
    },
    {
      type: "paragraph",
      text: "Di bawah antarmuka itu, ItemEntity menyimpan stok sebagai stockInPcs, ambang stok rendah, SKU, barcode, lokasi, harga modal, dan harga jual. Skema Room sudah mencapai versi 7 dengan migrasi berurutan sejak versi pertama, sehingga perubahan data diperlakukan sebagai pekerjaan produksi sebelum pengguna sungguhan menyimpan katalog.",
    },
    { type: "heading", text: "Kasir adalah ujian sebenarnya" },
    {
      type: "paragraph",
      text: "Banyak prototipe inventori terlihat selesai sampai tombol bayar ditekan. Stok Toko meneruskan alurnya. Kasir dapat mencari barang, mengubah jumlah, memasukkan barcode secara manual, menghitung subtotal, menerima pembayaran, dan membuka riwayat transaksi. Ketika order diselesaikan, repository memeriksa ketersediaan tiap item, mengurangi stok, menulis sale beserta barisnya, lalu mencatat inventory event di dalam satu transaksi Room.",
    },
    {
      type: "paragraph",
      text: "DAO memakai decrementStockIfAvailable untuk menolak penjualan ketika stok sudah berubah. Jika satu item gagal, CheckoutStockException membatalkan seluruh transaksi. Detail transaksi kemudian menampilkan barang, kuantitas, subtotal, keuntungan, dan total bayar; kasir tidak perlu merekonstruksi transaksi dari angka stok yang tersisa.",
    },
    {
      type: "image",
      assetKey: `blog:${slug}:checkout`,
      alt: "Layar Order Stok Toko berisi tiga barang, kontrol jumlah, subtotal, total, dan tombol Selesaikan Order",
      text: "Mode kasir menjaga informasi yang dibutuhkan tetap dekat dengan tindakan: jumlah, harga, total, lalu penyelesaian order.",
    },
    {
      type: "image",
      assetKey: `blog:${slug}:transaction-detail`,
      alt: "Dialog Detail Transaksi Stok Toko menampilkan waktu, tiga baris barang, subtotal, keuntungan, dan total bayar",
      text: "Riwayat transaksi menyimpan konteks penjualan, termasuk harga per baris dan keuntungan.",
    },
    { type: "heading", text: "Offline-first yang terlihat di kode" },
    {
      type: "table",
      text: "Implementasi utama Stok Toko",
      rows: [
        ["Bagian", "Implementasi saat ini"],
        ["UI", "Kotlin dan Jetpack Compose Material 3"],
        ["Data", "Room/SQLite schema v7 dengan Flow dan migrasi 1 sampai 7"],
        ["Kamera", "CameraX dengan ML Kit Barcode Scanning"],
        ["AI", "Klien OpenAI-compatible melalui HttpURLConnection dan tool katalog lokal"],
        ["Gambar", "Coil untuk foto produk"],
        ["Validasi visual", "Paparazzi route snapshots dan tangkapan runtime"],
      ],
    },
    { type: "heading", text: "Asisten yang dibatasi oleh data toko" },
    {
      type: "paragraph",
      text: "Asisten memakai pola tool calling yang konkret. Model dapat meminta katalog, detail produk, isi kategori, barang menipis, atau ringkasan stok. Fungsi tool itu berjalan terhadap daftar produk lokal, lalu hasilnya dikirim kembali ke model untuk menyusun jawaban berbahasa Indonesia. Prompt sistemnya memerintahkan asisten meminta klarifikasi ketika data tidak ada.",
    },
    {
      type: "paragraph",
      text: "Percakapan dan sesi disimpan di Room. Saat riwayat membesar, ChatCompactionPolicy mempertahankan 24 pesan terbaru dan membuat ringkasan dari pesan lama setelah perkiraan konteks melewati ambang yang ditentukan. Endpoint, model, API key, mode kompatibilitas, pajak, dan pecahan uang dapat diubah lewat pengaturan aplikasi.",
    },
    {
      type: "image",
      assetKey: `blog:${slug}:assistant`,
      alt: "Layar Asisten Stok Toko menjawab lokasi dua produk Sunlight dan menampilkan kartu barang terkait",
      text: "Jawaban lokasi menyebut SKU, rak, dan produk terkait dari katalog yang sama dengan layar Produk.",
    },
    { type: "heading", text: "Glass dipakai sebagai lapisan navigasi" },
    {
      type: "paragraph",
      text: "Arah visualnya mengambil inspirasi dari Liquid Glass, lalu menyesuaikannya untuk Android. Haze dan material transparan dipakai pada navigation chrome serta overlay, sedangkan kartu produk, form, dan gelembung chat tetap opak. Teks panjang tetap nyaman dibaca; pada Android sebelum API 31, komponen bersama memakai fill pengganti tanpa blur.",
    },
    {
      type: "paragraph",
      text: "Ruang belanja juga tidak dipaksakan masuk ke keranjang kasir. Pengguna dapat membuat beberapa daftar, memilih tanggal, menambah barang katalog, lalu menandai belanja selesai. Order melayani penjualan di meja kasir, sedangkan Belanja menyimpan pekerjaan pengadaan.",
    },
    {
      type: "image",
      assetKey: `blog:${slug}:shopping-lists`,
      alt: "Layar Belanja Stok Toko menampilkan dua keranjang tersimpan, filter tanggal, dan tombol Tambah Keranjang",
      text: "Daftar belanja dipersistenkan terpisah dari order kasir, lengkap dengan status dan tanggal pembaruan.",
    },
    { type: "divider", text: "" },
    { type: "heading", text: "Utang teknis yang masih kelihatan" },
    {
      type: "paragraph",
      text: "Orkestrasi aplikasi masih terlalu terpusat. MainActivity.kt menampung sekitar 1.468 baris, mengoleksi banyak Flow di root, memegang state rute, serta menghubungkan hampir semua callback layar. StokTokoRepository.kt juga sudah melewati 1.200 baris. Membagi state per layar ke ViewModel dan use case akan mengurangi area perubahan setiap kali satu fitur berkembang.",
    },
    {
      type: "list",
      text: [
        "Dokumentasi arsitektur masih menyebut Hilt, DataStore, dan Navigation Compose, sedangkan build saat ini membuat repository secara langsung, menyimpan pengaturan di tabel Room, dan memakai state rute manual.",
        "Tabel FTS4 sudah tersedia, tetapi pencarian antarmuka masih banyak memakai filter list di memori dan syncItemFts membangun ulang indeks setelah perubahan katalog.",
        "PRD menjanjikan faktor konversi pcs, renteng, dan box. Entity saat ini memiliki stockInPcs serta unitLabel, belum kolom conversionFactor yang diperlukan untuk konversi penuh.",
        "API key untuk endpoint AI ikut disimpan sebagai string di tabel pengaturan Room. Jika build produksi memakai key rahasia, penyimpanannya perlu dipindahkan ke mekanisme yang dilindungi Android Keystore.",
        "Autentikasi peran, sinkronisasi antarkasir, dan QRIS memang berada di luar build ini. Batas single-device perlu dipertahankan dengan sadar atau diubah lewat proyek sinkronisasi tersendiri.",
      ].join("\n"),
    },
    {
      type: "quote",
      text: "Pekerjaan berikutnya sebaiknya memperkecil pusat orkestrasi dan menyamakan dokumentasi dengan runtime, bukan menambah layar baru sebelum fondasinya lebih mudah dirawat.",
    },
    { type: "heading", text: "Penilaian akhir" },
    {
      type: "paragraph",
      text: "Stok Toko sudah melewati tahap demo UI. Katalog, penjualan, riwayat, scanner, daftar belanja, pengaturan, dan chat terhubung ke data yang bertahan setelah aplikasi ditutup. Detail kecil seperti transaksi stok atomik, migrasi schema, analyzer kamera di thread terpisah, dan fallback input manual menunjukkan perhatian pada penggunaan sehari-hari.",
    },
    {
      type: "paragraph",
      text: "Saya akan mempertahankan arah lokalnya. Untuk warung dengan satu perangkat kasir, Room bukan solusi sementara; ia cocok dengan masalah yang dipilih. Jalan menuju rilis juga sudah jelas: pecah state holder, tuntaskan model satuan, pakai FTS untuk pencarian besar, uji migrasi dengan data lama, lalu putuskan apakah toko sasaran memang membutuhkan sinkronisasi. Tidak semua aplikasi inventori perlu berubah menjadi SaaS.",
    },
  ],
};

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
    "Katalog yang dipakai untuk bekerja",
    "Kasir adalah ujian sebenarnya",
    "Offline-first yang terlihat di kode",
    "Asisten yang dibatasi oleh data toko",
    "Utang teknis yang masih kelihatan",
    "Penilaian akhir",
  ]) {
    if (!headings.has(expected)) throw new Error(`Missing review section: ${expected}`);
  }
}

function detectContentType(bytes) {
  if (bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) {
    return "image/jpeg";
  }
  throw new Error("Stok Toko Blog assets must be JPEG images");
}

async function uploadImageAssets(client, secret, actor) {
  const storedByAssetKey = new Map();
  let uploaded = 0;
  let reused = 0;

  for (const asset of imageAssets) {
    const sourcePath = path.join(sourceRoot, asset.source);
    if (!fs.existsSync(sourcePath)) throw new Error(`Stok Toko screenshot is missing: ${sourcePath}`);
    const bytes = fs.readFileSync(sourcePath);
    const sha256 = crypto.createHash("sha256").update(bytes).digest("hex");
    const contentType = detectContentType(bytes);
    const existing = await client.action(findFileBySourceKey, {
      secret,
      sourceKey: asset.sourceKey,
    });

    let stored = existing;
    if (!existing?.storage_id || !existing?.url || existing.metadata?.sha256 !== sha256) {
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
          sha256,
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

export async function publishStokTokoReviewBlog() {
  loadLocalEnv();
  validatePayload(stokTokoReviewBlogPayload);

  const convexUrl = String(process.env.CONVEX_CLOUD_URL || "").trim().replace(/\/+$/, "");
  const secret = process.env.CONVEX_INTERNAL_API_KEY;
  if (!convexUrl) throw new Error("CONVEX_CLOUD_URL is not configured");
  if (!secret) throw new Error("CONVEX_INTERNAL_API_KEY is not configured");

  const client = new ConvexHttpClient(convexUrl);
  const actor = {
    key: "repository-review:stok-toko",
    email: String(process.env.OWNER_EMAIL || "mukhtadanasution@gmail.com").trim().toLowerCase(),
    name: "Mukhtada Billah NST",
    role: "backend",
  };
  const uploads = await uploadImageAssets(client, secret, actor);
  const publishPayload = attachStorageIds(stokTokoReviewBlogPayload, uploads.storedByAssetKey);
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
    throw new Error("Stok Toko Blog publish verification failed");
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
  await publishStokTokoReviewBlog();
}
