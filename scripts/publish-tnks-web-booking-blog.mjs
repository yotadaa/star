import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { ConvexHttpClient } from "convex/browser";
import { makeFunctionReference } from "convex/server";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const slug = "e-ticket-tnks-project-review";
const repositoryUrl = "https://github.com/Project-TNKS-2024/web-etiket-gunung-kerinci";
const sourceRoot = path.join(root, "docs", "blogs", "tnks-web-booking");
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
    sourceKey: `blog:${slug}:home-hero`,
    fileName: "tnks-home-hero.png",
  },
  {
    source: "Pasted image (2).png",
    sourceKey: `blog:${slug}:home-destination-stats`,
    fileName: "tnks-home-destination-stats.png",
  },
  {
    source: "Pasted image (3).png",
    sourceKey: `blog:${slug}:destination-list`,
    fileName: "tnks-destination-list.png",
  },
  {
    source: "Pasted image (5).png",
    sourceKey: `blog:${slug}:kerinci-packages`,
    fileName: "tnks-kerinci-packages.png",
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

export const tnksWebBookingBlogPayload = {
  title: "E-Ticket TNKS: Review Booking Pendakian dari Pilih Jalur sampai Check-out",
  slug,
  excerpt:
    "Review teknis sistem e-ticketing Taman Nasional Kerinci Seblat berbasis Laravel 11, lengkap dengan kapasitas gerbang, data rombongan, pembayaran, tiket, dan API mobile.",
  status: "published",
  tags: ["Laravel", "PHP", "Booking System", "Research"],
  readTime: "9 min baca",
  coverTone: "research",
  sourceHref: repositoryUrl,
  blocks: [
    {
      type: "paragraph",
      text: "Booking pendakian bukan checkout toko daring. Sistem perlu tahu siapa yang masuk, kapan rombongan pulang, gerbang mana yang dipakai, apakah kuotanya masih cukup, dan siapa yang harus dihubungi ketika keadaan berubah. E-Ticket TNKS menampung seluruh urusan itu dalam satu alur sampai tiket dan status kegiatan di lapangan.",
    },
    {
      type: "paragraph",
      text: "Saya membaca branch struktur3 pada commit 8226ff4, routes web dan API, controller, model, migration, serta empat tangkapan layar unik yang disediakan. Situs pada gambar masih memasang pengumuman tahap pengembangan dan reset data saat peluncuran. Jadi ulasan ini menilai build yang sedang dikerjakan, bukan menyebutnya layanan final yang sudah bebas masalah.",
    },
    { type: "divider", text: "" },
    { type: "heading", text: "Beranda mendahulukan keadaan lapangan" },
    {
      type: "paragraph",
      text: "Halaman depan tidak hanya menjual foto Gunung Kerinci. Di samping tombol pemesanan ada jumlah pendaki yang sedang berada di kawasan, cuaca, dan status gunung. Data destinasi kemudian muncul dalam galeri, disusul ringkasan pengunjung WNI serta WNA. Penempatan ini tepat: sebelum memilih paket, calon pendaki melihat bahwa kondisi lapangan dapat memengaruhi perjalanan.",
    },
    {
      type: "image",
      assetKey: `blog:${slug}:home-hero`,
      alt: "Beranda E-Ticket TNKS dengan foto Gunung Kerinci, tombol Pesan Tiket, jumlah pendaki, cuaca, dan status gunung",
      text: "Hero mempertemukan ajakan memesan dengan tiga informasi operasional yang dapat berubah: pendaki aktif, cuaca, dan status Gunung Kerinci.",
    },
    {
      type: "image",
      assetKey: `blog:${slug}:home-destination-stats`,
      alt: "Bagian bawah beranda E-Ticket TNKS yang menampilkan Danau Gunung Tujuh serta ringkasan jumlah pendaki WNI dan WNA",
      text: "Galeri destinasi dan ringkasan pengunjung meneruskan konteks setelah hero tanpa memutus jalur menuju pemesanan.",
    },
    {
      type: "paragraph",
      text: "Blade dan Bootstrap 5 membentuk tampilan server-rendered ini. HomepageController mengambil destinasi, statistik pendaki, dan data cuaca sebelum mengirim view. Hasilnya mudah dipahami, walau sebagian CSS masih tinggal langsung di file Blade dan akan makin sulit dijaga ketika halaman publik bertambah.",
    },
    { type: "heading", text: "Pemesanan dibangun sebagai rangkaian keputusan" },
    {
      type: "paragraph",
      text: "Pengguna memilih destinasi, membuka paket, menentukan tanggal, jumlah WNI dan WNA, serta gerbang masuk dan keluar. Setelah login, ketua rombongan harus memiliki biodata terverifikasi dan berusia sedikitnya 17 tahun. Sistem menolak tanggal lampau, rentang terbalik, pemesanan lebih dari sebulan ke depan, rombongan di bawah jumlah minimum, dan jadwal pendaki yang bertabrakan.",
    },
    {
      type: "image",
      assetKey: `blog:${slug}:destination-list`,
      alt: "Halaman Pilih Destinasi E-Ticket TNKS dengan kartu Gunung Kerinci dan Danau Gunung Tujuh",
      text: "Daftar destinasi memisahkan pilihan Gunung Kerinci dan Danau Gunung Tujuh sebelum pengguna masuk ke detail paket.",
    },
    {
      type: "image",
      assetKey: `blog:${slug}:kerinci-packages`,
      alt: "Halaman paket wisata pendakian Gunung Kerinci dengan panorama gunung serta pilihan paket umum dan rombongan pelajar",
      text: "Detail Gunung Kerinci memberi ruang besar pada kondisi tujuan, lalu membedakan paket umum dari rombongan pelajar atau mahasiswa.",
    },
    {
      type: "paragraph",
      text: "Sesudah syarat dan ketentuan diterima, setiap anggota rombongan dihubungkan ke biodata yang sudah diverifikasi. Pendaki di bawah 17 tahun wajib menyertakan surat izin orang tua sebelum lanjut. Formulir juga menyimpan nomor darurat dan barang bawaan, menghitung tagihan per pendaki, lalu memindahkan booking ke tahap pembayaran dalam transaksi database.",
    },
    {
      type: "table",
      text: "Batas yang diterapkan dalam alur booking",
      rows: [
        ["Bagian", "Aturan yang tampak di kode"],
        ["Kepemilikan", "Query booking API selalu dibatasi ke user yang sedang login"],
        ["Ketua", "Biodata terverifikasi dan usia minimal 17 tahun"],
        ["Jadwal", "Tidak lampau, urutan tanggal benar, maksimal satu bulan ke depan"],
        ["Rombongan", "Jumlah minimum paket dan gerbang harus terpenuhi"],
        ["Kapasitas", "Booking terbayar dihitung per tanggal masuk dan gerbang"],
        ["Anggota", "Tidak boleh ganda atau masuk booking lain pada tanggal yang bertabrakan"],
        ["Pembayaran", "Bukti QRIS atau transfer diverifikasi admin sebelum tiket tersedia"],
      ],
    },
    {
      type: "paragraph",
      text: "Status booking bergerak dari persetujuan, formulir, pembayaran, konfirmasi pendakian, check-in, check-out, hingga selesai. Pembayaran yang disetujui membuat kode tiket dan memicu email berisi invoice. Scanner admin mencari kode itu, lalu membuka data booking yang benar.",
    },
    { type: "heading", text: "Admin memegang pekerjaan setelah tiket dipesan" },
    {
      type: "paragraph",
      text: "Panel admin mengatur destinasi, foto, gerbang, paket dan harga tiket, booking, bukti pembayaran, biodata pengunjung, akun admin, peran, permission, kalender, log, serta rekap pendapatan dan pengunjung. Akses tiap route diperiksa lewat role dan permission, bukan satu flag admin untuk seluruh menu.",
    },
    {
      type: "list",
      text: [
        "Operator dapat memprioritaskan booking yang masih menunggu verifikasi pembayaran.",
        "Pembayaran diterima atau ditolak secara manual; hasilnya mengubah status booking dan dikirim lewat email.",
        "Kode tiket mengantar petugas ke detail rombongan untuk proses lapangan.",
        "Rekap pendapatan dan pengunjung dapat diunduh dari area yang dilindungi permission.",
      ].join("\n"),
    },
    {
      type: "paragraph",
      text: "Repo yang sama juga menyediakan API untuk aplikasi mobile. Laravel Sanctum melindungi profil dan booking; endpoint publik menyajikan destinasi, paket, tiket, event, gerbang, dan kapasitas. Login Google serta verifikasi email ikut tersedia. Memakai model data yang sama untuk web dan mobile merupakan arah yang masuk akal, tetapi duplikasi aturan di dua controller mulai terasa mahal.",
    },
    { type: "heading", text: "Bagian yang sudah kuat" },
    {
      type: "paragraph",
      text: "Kekuatan proyek ini ada pada pemahaman domain. Booking memakai UUID, anggota rombongan punya catatan sendiri, tiket membedakan WNI dan WNA, gerbang menyimpan batas harian, dan status pendakian tidak dicampur dengan status pembayaran. Beberapa operasi formulir dibungkus transaksi database, sementara query API memastikan pengguna hanya membaca booking miliknya.",
    },
    {
      type: "quote",
      text: "Pekerjaan terbaik di repo ini bukan halaman hero. Nilainya muncul ketika aturan lapangan diterjemahkan menjadi data, validasi, dan status yang dapat dipakai petugas.",
    },
    { type: "divider", text: "" },
    { type: "heading", text: "Utang teknis yang tidak boleh ikut naik gunung" },
    {
      type: "paragraph",
      text: "Controller booking web sudah mencapai 817 baris; versi API menambah 475 baris lagi. Keduanya menghitung kapasitas, mencari benturan jadwal, mengurus pendaki, dan memproses pembayaran dengan jalur yang mirip. Selama fiturnya sedikit, salinan aturan masih bisa diikuti. Begitu satu batas berubah di web tetapi terlupa di API, pengguna mendapat dua perilaku untuk booking yang sama.",
    },
    {
      type: "list",
      text: [
        "Migration gk_bookings menghubungkan id_tiket ke gk_tiket_pendakis, sedangkan model, validasi, dan controller memperlakukannya sebagai id gk_paket_tikets. Foreign key dan relasi aplikasi perlu disamakan sebelum migration baru dijalankan di lingkungan lain.",
        "Pemeriksaan kapasitas membaca booking lebih dulu, lalu membuat draft dalam transaksi tanpa lock pada kuota gerbang. Dua permintaan bersamaan masih dapat sama-sama melihat sisa tempat yang sama.",
        "MidtransController menyimpan credential sandbox langsung di source dan belum tampak terhubung ke route aktif. Credential harus pindah ke environment sebelum adapter itu dipakai kembali.",
        "LoggerMiddleware menyimpan hampir seluruh request selain field password. Form booking membawa data pribadi dan file; log perlu daftar field aman serta penyamaran nilai sensitif.",
        "Dua test yang tersedia masih contoh bawaan. Perhitungan kapasitas, transisi status, kepemilikan booking, pembayaran, dan benturan jadwal belum mempunyai jaring regresi.",
        "README hanya enam baris. Menjalankan aplikasi, menyiapkan database, memilih branch, mengatur cuaca, mail, OAuth, storage, dan pembayaran masih bergantung pada pengetahuan tim.",
      ].join("\n"),
    },
    {
      type: "paragraph",
      text: "Saya akan memulai perbaikan dari BookingService yang dipakai web dan API, enum status, serta test untuk kuota dan pembayaran. Setelah itu baru rapikan Blade, pindahkan style per halaman, dan lanjutkan integrasi mobile. Urutannya penting karena bug pada kartu destinasi mengganggu tampilan; bug kuota dapat menerima rombongan yang seharusnya ditolak.",
    },
    { type: "heading", text: "Penilaian akhir" },
    {
      type: "paragraph",
      text: "E-Ticket TNKS sudah menangani lebih banyak pekerjaan daripada yang terlihat pada empat screenshot. Pilihan destinasi hanya pintu depan. Di belakangnya ada identitas pendaki, aturan usia, kapasitas gerbang, harga berdasarkan kewarganegaraan, izin orang tua, bukti pembayaran, email, kode tiket, dan urutan kegiatan di lapangan.",
    },
    {
      type: "paragraph",
      text: "Saya akan mempertahankan model operasional itu dan menahan penambahan fitur publik untuk sementara. Satukan aturan booking, kunci perhitungan kapasitas, betulkan relasi database, redaksi log, lalu tulis test yang mengikuti perjalanan pendaki dari draft sampai selesai. Setelah fondasinya rapi, web dan aplikasi mobile bisa tumbuh tanpa saling menyimpang.",
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
    if (!fs.existsSync(sourcePath)) throw new Error(`TNKS screenshot is missing: ${sourcePath}`);
    hashes.add(sha256(fs.readFileSync(sourcePath)));
  }
  if (hashes.size !== imageAssets.length) {
    throw new Error("The selected TNKS Blog screenshots must be unique");
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
    "Beranda mendahulukan keadaan lapangan",
    "Pemesanan dibangun sebagai rangkaian keputusan",
    "Admin memegang pekerjaan setelah tiket dipesan",
    "Bagian yang sudah kuat",
    "Utang teknis yang tidak boleh ikut naik gunung",
    "Penilaian akhir",
  ]) {
    if (!headings.has(expected)) throw new Error(`Missing review section: ${expected}`);
  }
}

function detectContentType(bytes) {
  if (bytes.length >= 8 && bytes.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]))) {
    return "image/png";
  }
  throw new Error("TNKS Blog assets must be PNG images");
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

export async function publishTnksWebBookingBlog() {
  loadLocalEnv();
  validateSourceEvidence();
  validatePayload(tnksWebBookingBlogPayload);

  const convexUrl = String(process.env.CONVEX_CLOUD_URL || "").trim().replace(/\/+$/, "");
  const secret = process.env.CONVEX_INTERNAL_API_KEY;
  if (!convexUrl) throw new Error("CONVEX_CLOUD_URL is not configured");
  if (!secret) throw new Error("CONVEX_INTERNAL_API_KEY is not configured");

  const client = new ConvexHttpClient(convexUrl);
  const actor = {
    key: "repository-review:tnks-web-booking",
    email: String(process.env.OWNER_EMAIL || "mukhtadanasution@gmail.com").trim().toLowerCase(),
    name: "Mukhtada Billah NST",
    role: "backend",
  };
  const uploads = await uploadImageAssets(client, secret, actor);
  const publishPayload = attachStorageIds(tnksWebBookingBlogPayload, uploads.storedByAssetKey);
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
    throw new Error("TNKS Blog publish verification failed");
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
  await publishTnksWebBookingBlog();
}
