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
  title: "Stok Toko: Reviewing an Android POS That Chose Offline First",
  slug,
  excerpt:
    "A technical review of a native Android app for catalog management, checkout, shopping lists, barcode scanning, and stock assistance, built with Kotlin, Jetpack Compose, and Room.",
  status: "published",
  tags: ["Android", "Kotlin", "Jetpack Compose", "Room"],
  readTime: "8 min read",
  coverTone: "research",
  sourceHref: repositoryUrl,
  blocks: [
    {
      type: "paragraph",
      text: "A small shop does not need an app that stops working when the signal disappears. Stok Toko draws a more practical boundary: the catalog, checkout, transaction history, shopping lists, and assistant conversations stay on one Android device. The camera reads barcodes locally, while the AI feature connects to an OpenAI-compatible endpoint chosen by the shop owner.",
    },
    {
      type: "paragraph",
      text: "Core data lives in Room and SQLite, screens observe changes through Kotlin Flow, and stock mutations run inside database transactions. After reading the code and reviewing the application captures, I found the shared data model more convincing than any single screen. The glass treatment gives it character; the links between workflows make the prototype credible.",
    },
    { type: "divider", text: "" },
    { type: "heading", text: "A catalog built for daily work" },
    {
      type: "paragraph",
      text: "The Products screen immediately shows what shop staff need: item name, price, stock count, image, and availability label. Search, status and category filters, editing, archiving, CSV import and export, and stock reports all sit in the same workflow. Status does not rely on color alone; the Indonesian labels Tersedia, Stok Menipis, and Stok Habis remain readable as text.",
    },
    {
      type: "paragraph",
      text: "The scanner processes EAN-13, EAN-8, Code 128, Code 39, and QR formats on a single-thread executor. The first result closes subsequent analysis so camera frames are not processed after a code is found. Manual entry remains available when packaging is damaged or the camera cannot lock onto a code.",
    },
    {
      type: "image",
      assetKey: `blog:${slug}:catalog`,
      alt: "Stok Toko Products screen with search, status and category filters, and an item list with prices and stock labels",
      text: "The catalog combines search, filters, stock status, pricing, and the add-item shortcut on one screen.",
    },
    {
      type: "image",
      assetKey: `blog:${slug}:barcode-scanner`,
      alt: "Stok Toko Scanner screen with a camera preview, barcode frame, camera control, and Manual Entry field",
      text: "The scanner still offers manual entry, so a camera failure does not stop checkout work.",
    },
    {
      type: "paragraph",
      text: "Under the interface, ItemEntity stores stockInPcs, the low-stock threshold, SKU, barcode, location, cost, and selling price. The Room schema has reached version 7 through sequential migrations, treating data changes as production work before real users commit their catalogs to the app.",
    },
    { type: "heading", text: "Checkout is the real test" },
    {
      type: "paragraph",
      text: "Many inventory prototypes look complete until the payment button is pressed. Stok Toko carries the workflow through. A cashier can find items, change quantities, enter a barcode manually, calculate the subtotal, accept payment, and open transaction history. Completing an order checks every item's availability, decreases stock, writes the sale and its line items, and records an inventory event inside one Room transaction.",
    },
    {
      type: "paragraph",
      text: "The DAO uses decrementStockIfAvailable to reject a sale when stock has already changed. If one item fails, CheckoutStockException rolls back the entire transaction. Transaction details then show items, quantities, subtotal, profit, and amount paid, so the cashier does not have to reconstruct a sale from the remaining stock count.",
    },
    {
      type: "image",
      assetKey: `blog:${slug}:checkout`,
      alt: "Stok Toko Order screen with three items, quantity controls, subtotal, total, and a Complete Order button",
      text: "Checkout keeps the necessary information close to the action: quantity, price, total, and order completion.",
    },
    {
      type: "image",
      assetKey: `blog:${slug}:transaction-detail`,
      alt: "Stok Toko Transaction Details dialog showing time, three line items, subtotal, profit, and amount paid",
      text: "Transaction history preserves the context of each sale, including line-item prices and profit.",
    },
    { type: "heading", text: "Offline first, visible in the code" },
    {
      type: "table",
      text: "Stok Toko implementation overview",
      rows: [
        ["Area", "Current implementation"],
        ["UI", "Kotlin and Jetpack Compose Material 3"],
        ["Data", "Room/SQLite schema v7 with Flow and migrations 1 through 7"],
        ["Camera", "CameraX with ML Kit Barcode Scanning"],
        ["AI", "An OpenAI-compatible client over HttpURLConnection with local catalog tools"],
        ["Images", "Coil for product photographs"],
        ["Visual validation", "Paparazzi route snapshots and runtime captures"],
      ],
    },
    { type: "heading", text: "An assistant bounded by store data" },
    {
      type: "paragraph",
      text: "The assistant uses a concrete tool-calling pattern. The model can request the catalog, product details, a category, low-stock items, or a stock summary. Those tools run against the local product list, then return their result to the model for a response in Indonesian. The system prompt tells the assistant to ask for clarification when the data is missing.",
    },
    {
      type: "paragraph",
      text: "Conversations and sessions are stored in Room. As history grows, ChatCompactionPolicy keeps the latest 24 messages and summarizes older ones after the estimated context crosses its threshold. The endpoint, model, API key, compatibility mode, tax, and currency denominations can all be changed in application settings.",
    },
    {
      type: "image",
      assetKey: `blog:${slug}:assistant`,
      alt: "Stok Toko Assistant screen answering where two Sunlight products are located and showing related item cards",
      text: "The location answer cites SKUs, shelves, and related products from the same catalog used by the Products screen.",
    },
    { type: "heading", text: "Glass is reserved for navigation layers" },
    {
      type: "paragraph",
      text: "The visual direction takes inspiration from Liquid Glass and adapts it for Android. Haze and transparent materials appear in navigation chrome and overlays, while product cards, forms, and chat bubbles remain opaque. Long text stays readable, and devices below Android API 31 receive a solid fallback without blur.",
    },
    {
      type: "paragraph",
      text: "Procurement is not forced into the checkout cart. Users can create several shopping lists, choose dates, add catalog items, and mark a trip complete. Orders serve counter sales, while Shopping records restocking work.",
    },
    {
      type: "image",
      assetKey: `blog:${slug}:shopping-lists`,
      alt: "Stok Toko Shopping screen with two saved lists, a date filter, and an Add Cart button",
      text: "Shopping lists persist separately from checkout orders, with their own status and update date.",
    },
    { type: "divider", text: "" },
    { type: "heading", text: "Technical debt that remains visible" },
    {
      type: "paragraph",
      text: "Application orchestration is still too centralized. MainActivity.kt contains roughly 1,468 lines, collects many Flows at the root, owns route state, and connects almost every screen callback. StokTokoRepository.kt has also passed 1,200 lines. Moving screen state into ViewModels and use cases would reduce the surface area touched whenever one feature changes.",
    },
    {
      type: "list",
      text: [
        "The architecture documentation still names Hilt, DataStore, and Navigation Compose, while the current build constructs the repository directly, stores settings in Room, and uses manual route state.",
        "An FTS4 table exists, but much of the interface search still filters an in-memory list, and syncItemFts rebuilds the index after catalog changes.",
        "The PRD promises conversion factors for pieces, strips, and boxes. The current entity has stockInPcs and unitLabel, but not the conversionFactor required for full unit conversion.",
        "The API key for the AI endpoint is stored as a string in the Room settings table. If a production build uses a secret key, it should move to storage protected by Android Keystore.",
        "Role-based authentication, multi-cashier sync, and QRIS are outside this build. The single-device boundary should remain explicit or change through a separate synchronization project.",
      ].join("\n"),
    },
    {
      type: "quote",
      text: "The next pass should shrink the orchestration center and align the documentation with the runtime before adding more screens.",
    },
    { type: "heading", text: "Final assessment" },
    {
      type: "paragraph",
      text: "Stok Toko has moved beyond a UI demo. Catalog, sales, history, scanner, shopping lists, settings, and chat all connect to data that survives after the app closes. Atomic stock transactions, schema migrations, a camera analyzer on its own thread, and manual-entry fallbacks show attention to daily use.",
    },
    {
      type: "paragraph",
      text: "I would keep the local-first direction. For a shop with one checkout device, Room is not a temporary compromise; it fits the chosen problem. The release path is clear: split the state holders, finish the unit model, use FTS for larger catalogs, test migrations against old data, then decide whether the target shops need synchronization. Not every inventory app needs to become SaaS.",
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
    "A catalog built for daily work",
    "Checkout is the real test",
    "Offline first, visible in the code",
    "An assistant bounded by store data",
    "Technical debt that remains visible",
    "Final assessment",
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
