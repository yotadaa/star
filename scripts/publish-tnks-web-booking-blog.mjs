import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { ConvexHttpClient } from "convex/browser";
import { makeFunctionReference } from "convex/server";
import { completeBlogSeoData } from "./blog-seo-data.mjs";

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
  title: "E-Ticket TNKS: Reviewing a Mountaineering Booking from Route Selection to Check-out",
  slug,
  excerpt:
    "A technical review of the Laravel 11 e-ticketing system for Kerinci Seblat National Park, covering gate capacity, group records, payments, tickets, and its mobile API.",
  status: "published",
  tags: ["Laravel", "PHP", "Booking System", "Research"],
  readTime: "9 min read",
  coverTone: "research",
  sourceHref: repositoryUrl,
  blocks: [
    {
      type: "paragraph",
      text: "A mountaineering booking is not an online-store checkout. The system must know who enters the park, when the group returns, which gates they use, whether capacity remains, and whom to contact when plans change. E-Ticket TNKS carries that information through one workflow, from reservation to ticket and on-site status.",
    },
    {
      type: "paragraph",
      text: "I reviewed the struktur3 branch at commit 8226ff4, including its web and API routes, controllers, models, migrations, and four supplied screenshots. The captured site still warns that it is under development and that data will be reset at launch. This review covers a work in progress, not a finished service with every issue resolved.",
    },
    { type: "divider", text: "" },
    { type: "heading", text: "The Home page puts field conditions first" },
    {
      type: "paragraph",
      text: "The landing page does more than sell a photograph of Mount Kerinci. Beside the booking action, it shows the number of hikers currently in the area, the weather, and the mountain status. A destination gallery follows, then a breakdown of Indonesian and international visitors. The order works: prospective hikers see that field conditions can affect the trip before choosing a package.",
    },
    {
      type: "image",
      assetKey: `blog:${slug}:home-hero`,
      alt: "E-Ticket TNKS Home page with Mount Kerinci, a Book Ticket button, current hiker count, weather, and mountain status",
      text: "The Hero places the booking action beside three changing operational facts: active hikers, weather, and Mount Kerinci's status.",
    },
    {
      type: "image",
      assetKey: `blog:${slug}:home-destination-stats`,
      alt: "Lower section of the E-Ticket TNKS Home page showing Lake Gunung Tujuh and Indonesian and international hiker totals",
      text: "The destination gallery and visitor totals continue the context below the Hero without interrupting the path to booking.",
    },
    {
      type: "paragraph",
      text: "Blade and Bootstrap 5 produce the server-rendered interface. HomepageController gathers destinations, hiker statistics, and weather data before returning the view. The result is easy to follow, although some CSS still lives directly in Blade files and will become harder to maintain as the public site grows.",
    },
    { type: "heading", text: "Booking is built as a sequence of decisions" },
    {
      type: "paragraph",
      text: "Users choose a destination and package, then set the dates, Indonesian and international visitor counts, and entry and exit gates. After sign-in, the group leader needs a verified profile and must be at least 17. The system rejects past dates, reversed ranges, bookings more than a month ahead, undersized groups, and schedule conflicts for individual hikers.",
    },
    {
      type: "image",
      assetKey: `blog:${slug}:destination-list`,
      alt: "E-Ticket TNKS destination selection page with cards for Mount Kerinci and Lake Gunung Tujuh",
      text: "The destination list separates Mount Kerinci from Lake Gunung Tujuh before users enter package details.",
    },
    {
      type: "image",
      assetKey: `blog:${slug}:kerinci-packages`,
      alt: "Mount Kerinci tour-package page with a mountain panorama and options for general and student groups",
      text: "The Mount Kerinci detail page gives the destination room to breathe, then separates general packages from school and university group packages.",
    },
    {
      type: "paragraph",
      text: "After accepting the terms, each group member is linked to a verified profile. Hikers under 17 must attach parental permission before continuing. The form also records emergency numbers and carried equipment, calculates the charge per hiker, and moves the booking to payment inside a database transaction.",
    },
    {
      type: "table",
      text: "Rules enforced in the booking flow",
      rows: [
        ["Area", "Rule visible in the code"],
        ["Ownership", "API booking queries are always scoped to the signed-in user"],
        ["Group leader", "Verified profile and a minimum age of 17"],
        ["Schedule", "No past dates, valid date order, and no more than one month ahead"],
        ["Group", "The package minimum and gate requirements must be met"],
        ["Capacity", "Paid bookings count against each entry date and gate"],
        ["Members", "No duplicates or overlapping bookings for the same hiker"],
        ["Payment", "An administrator verifies QRIS or bank-transfer evidence before issuing a ticket"],
      ],
    },
    {
      type: "paragraph",
      text: "A booking moves through approval, form completion, payment, hike confirmation, check-in, check-out, and completion. An approved payment creates a ticket code and triggers an invoice email. The administrator's scanner finds that code and opens the correct booking record.",
    },
    { type: "heading", text: "Administrators handle the work after a ticket is booked" },
    {
      type: "paragraph",
      text: "The admin panel manages destinations, photographs, gates, packages and prices, bookings, payment evidence, visitor profiles, administrator accounts, roles, permissions, calendars, logs, and revenue and visitor reports. Each route checks roles and permissions instead of relying on one admin flag for the entire menu.",
    },
    {
      type: "list",
      text: [
        "Operators can prioritize bookings that are waiting for payment verification.",
        "Payments are accepted or rejected manually; the result changes the booking status and is sent by email.",
        "A ticket code takes field staff to the relevant group details.",
        "Revenue and visitor reports can be downloaded from permission-protected areas.",
      ].join("\n"),
    },
    {
      type: "paragraph",
      text: "The same repository provides an API for a mobile app. Laravel Sanctum protects profiles and bookings, while public endpoints expose destinations, packages, tickets, events, gates, and capacity. Google sign-in and email verification are also available. Sharing one data model across web and mobile is sensible, but duplicating rules across two controllers is already becoming expensive.",
    },
    { type: "heading", text: "What already works well" },
    {
      type: "paragraph",
      text: "The project's strength is its grasp of the domain. Bookings use UUIDs, group members have separate records, tickets distinguish Indonesian and international visitors, gates store daily limits, and hike status is separate from payment status. Several form operations run inside database transactions, while API queries ensure users can only read their own bookings.",
    },
    {
      type: "quote",
      text: "The strongest work in this repository is not the Hero page. Its value appears when field rules become data, validation, and statuses that staff can use.",
    },
    { type: "divider", text: "" },
    { type: "heading", text: "Technical debt that should not climb with the hikers" },
    {
      type: "paragraph",
      text: "The web booking controller has reached 817 lines, and the API version adds another 475. Both calculate capacity, find scheduling conflicts, manage hikers, and process payments through similar paths. Duplicate rules are manageable while the feature set is small. Once a limit changes on the web and is missed in the API, users get two behaviors for the same booking.",
    },
    {
      type: "list",
      text: [
        "The gk_bookings migration links id_tiket to gk_tiket_pendakis, while the model, validation, and controller treat it as a gk_paket_tikets ID. The foreign key and application relation should agree before new migrations run elsewhere.",
        "The capacity check reads bookings first, then creates a draft in a transaction without locking the gate quota. Two concurrent requests can still see the same remaining places.",
        "MidtransController stores sandbox credentials in source and does not appear connected to an active route. Move those credentials to the environment before reusing the adapter.",
        "LoggerMiddleware stores almost every request field except the password. Booking forms contain personal data and files, so logging needs an allowlist and sensitive-value redaction.",
        "The two available tests are still framework examples. Capacity calculations, status transitions, booking ownership, payments, and schedule conflicts have no regression coverage.",
        "The README is six lines long. Running the app, preparing the database, choosing a branch, and configuring weather, email, OAuth, storage, and payments still depend on team knowledge.",
      ].join("\n"),
    },
    {
      type: "paragraph",
      text: "I would start with a BookingService shared by web and API, explicit status enums, and tests for quotas and payments. Blade cleanup, page-level style extraction, and mobile integration can follow. The order matters: a destination-card bug hurts presentation, while a quota bug can admit a group that should have been rejected.",
    },
    { type: "heading", text: "Final assessment" },
    {
      type: "paragraph",
      text: "E-Ticket TNKS handles much more than the four screenshots reveal. Destination selection is only the front door. Behind it sit hiker identities, age rules, gate capacity, nationality-based pricing, parental permission, payment evidence, email, ticket codes, and the sequence of field operations.",
    },
    {
      type: "paragraph",
      text: "I would preserve that operational model and pause new public features for now. Unify the booking rules, lock capacity calculations, repair the database relation, redact logs, and write tests that follow a hiker from draft to completion. Once that foundation is stable, the web and mobile apps can grow without drifting apart.",
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
    "The Home page puts field conditions first",
    "Booking is built as a sequence of decisions",
    "Administrators handle the work after a ticket is booked",
    "What already works well",
    "Technical debt that should not climb with the hikers",
    "Final assessment",
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
  const publishPayload = completeBlogSeoData(
    attachStorageIds(tnksWebBookingBlogPayload, uploads.storedByAssetKey),
  );
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
