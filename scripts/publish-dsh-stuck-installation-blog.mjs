import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { ConvexHttpClient } from "convex/browser";
import { makeFunctionReference } from "convex/server";
import { completeBlogSeoData } from "./blog-seo-data.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const payloadPath = path.join(root, "scripts", "blog-payloads", "dsh-stuck-installation.json");
const sourceRoot = path.join(root, "docs", "blogs", "dsh-problem-stuck-installation");
const slug = "deepseek-harness-npx-stuck-pnpm-dlx-wrapper";
const listBlogAdmin = makeFunctionReference("bridge:listBlogAdmin");
const createBlog = makeFunctionReference("bridge:createBlog");
const updateBlog = makeFunctionReference("bridge:updateBlog");
const createFileUploadUrl = makeFunctionReference("bridge:createFileUploadUrl");
const commitFile = makeFunctionReference("bridge:commitFile");
const getFile = makeFunctionReference("bridge:getFile");
const findFileBySourceKey = makeFunctionReference("bridge:findFileBySourceKey");

const imageAssets = [
  {
    source: "generated/dsh-package-runner-feature.png",
    sourceKey: "blog:" + slug + ":featured-runner-workbench",
    fileName: "dsh-package-runner-feature.png",
    kind: "generated-editorial",
  },
  {
    source: "image-1.png",
    sourceKey: "blog:" + slug + ":source-npx-stall",
    fileName: "dsh-npx-stalled-prompt.png",
    kind: "user-source-evidence",
  },
  {
    source: "image-2.png",
    sourceKey: "blog:" + slug + ":source-npm-verbose",
    fileName: "dsh-npm-verbose-fetches.png",
    kind: "user-source-evidence",
  },
  {
    source: "generated/dsh-command-wrapper-bridge.png",
    sourceKey: "blog:" + slug + ":supporting-command-bridge",
    fileName: "dsh-command-wrapper-bridge.png",
    kind: "generated-editorial",
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

export const dshStuckInstallationBlogPayload = JSON.parse(
  fs.readFileSync(payloadPath, "utf8"),
);

function sha256(value) {
  return crypto.createHash("sha256").update(value).digest("hex");
}

function detectContentType(bytes) {
  const pngSignature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  if (bytes.length >= pngSignature.length && bytes.subarray(0, pngSignature.length).equals(pngSignature)) {
    return "image/png";
  }
  throw new Error("DeepSeek Harness Blog assets must be PNG images");
}

function validateSourceEvidence() {
  const hashes = new Set();
  for (const asset of imageAssets) {
    const sourcePath = path.join(sourceRoot, asset.source);
    if (!fs.existsSync(sourcePath)) {
      throw new Error("DeepSeek Harness Blog image is missing: " + sourcePath);
    }
    const bytes = fs.readFileSync(sourcePath);
    detectContentType(bytes);
    hashes.add(sha256(bytes));
  }
  if (hashes.size !== imageAssets.length) {
    throw new Error("Every DeepSeek Harness Blog image must be unique");
  }
}

function validatePayload(payload, { requireProviderNeutral = false } = {}) {
  if (payload.slug !== slug || payload.status !== "published") {
    throw new Error("DeepSeek Harness Blog identity or status is invalid");
  }
  if (payload.blocks.length !== 46) {
    throw new Error("Expected 46 native blocks, received " + payload.blocks.length);
  }

  const images = payload.blocks.filter((block) => block.type === "image");
  if (images.length !== imageAssets.length) {
    throw new Error("Expected " + imageAssets.length + " image blocks, received " + images.length);
  }
  if (images[0]?.assetKey !== "blog:" + slug + ":featured-runner-workbench") {
    throw new Error("The generated package-runner workbench must remain the featured image");
  }

  const expectedKeys = new Set(imageAssets.map((asset) => asset.sourceKey));
  for (const image of images) {
    if (!expectedKeys.has(image.assetKey)) {
      throw new Error("Invalid Convex image asset key: " + (image.assetKey || "missing"));
    }
    if (requireProviderNeutral && image.storageId) {
      throw new Error("Legacy Convex storage ID must not be persisted for " + image.assetKey);
    }
    if (image.src) {
      throw new Error("Image payload must not persist a storage URL: " + image.assetKey);
    }
    if (!image.alt?.trim() || !image.text?.trim()) {
      throw new Error("Image alt text or caption is missing for " + image.assetKey);
    }
  }

  const expectedHeadings = [
    "The quiet prompt was not the whole diagnosis",
    "npx and pnpm dlx are temporary runners, not permanent installs",
    "A pinned wrapper made dsh discoverable",
    "The profile survived because it lived somewhere else",
    "A successful bootstrap can still fail in the plugin tree",
    "The safer repair order names the failing layer",
    "The working result was small, and deliberately limited",
  ];
  const headings = new Set(
    payload.blocks.filter((block) => block.type === "heading").map((block) => block.text),
  );
  for (const heading of expectedHeadings) {
    if (!headings.has(heading)) throw new Error("Missing article section: " + heading);
  }

  const prose = payload.blocks
    .flatMap((block) => [block.text, ...(block.rows || []).flat()])
    .filter(Boolean)
    .join("\n");
  if (/\b(?:I|we|you)\b/i.test(prose)) {
    throw new Error("DeepSeek Harness article must remain in third-person point of view");
  }
  if (!prose.includes("does not reveal why") || !prose.includes("observed result")) {
    throw new Error("The article must preserve its evidence boundary");
  }
  if (!prose.includes('exec pnpm dlx @deepseek-ai/dsh@0.1.1-rc.2 "$@"')) {
    throw new Error("The pinned wrapper command is missing");
  }
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
    if (existing?.storage_provider !== "r2" || !existing?.url || existing.sha256 !== checksum) {
      const upload = await client.action(createFileUploadUrl, {
        secret,
        actor,
        sha256: checksum,
        contentType,
      });
      const uploadResponse = await fetch(upload.url, {
        method: upload.method,
        headers: {
          "Content-Type": contentType,
          "Cache-Control": "public, max-age=31536000, immutable",
        },
        body: bytes,
      });
      if (!uploadResponse.ok) {
        throw new Error(
          "R2 upload failed for " + asset.source + ": " + uploadResponse.status,
        );
      }

      const fileId = await client.action(commitFile, {
        secret,
        r2Key: upload.key,
        sha256: checksum,
        access: "public",
        sourceKey: asset.sourceKey,
        originalName: asset.fileName,
        contentType,
        sizeBytes: bytes.length,
        metadata: {
          purpose: "blog-image-block",
          blogSlug: slug,
          evidenceKind: asset.kind,
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

    if (stored?.storage_provider !== "r2" || !stored?.source_key || !stored?.url) {
      throw new Error("R2 storage verification failed for " + asset.sourceKey);
    }
    storedByAssetKey.set(asset.sourceKey, stored);
  }

  return { storedByAssetKey, uploaded, reused };
}

function attachStoredAssetKeys(payload, storedByAssetKey) {
  return {
    ...payload,
    blocks: payload.blocks.map((block) => {
      if (block.type !== "image") return block;
      const stored = storedByAssetKey.get(block.assetKey);
      if (stored?.storage_provider !== "r2" || !stored?.source_key) {
        throw new Error("Missing uploaded file for " + block.assetKey);
      }
      const { storageId: _legacyStorageId, src: _legacyUrl, ...rest } = block;
      return { ...rest, assetKey: stored.source_key };
    }),
  };
}

export async function publishDshStuckInstallationBlog() {
  loadLocalEnv();
  validateSourceEvidence();
  validatePayload(dshStuckInstallationBlogPayload);

  const convexUrl = String(process.env.CONVEX_CLOUD_URL || "").trim().replace(/\/+$/, "");
  const secret = process.env.CONVEX_INTERNAL_API_KEY;
  if (!convexUrl) throw new Error("CONVEX_CLOUD_URL is not configured");
  if (!secret) throw new Error("CONVEX_INTERNAL_API_KEY is not configured");

  const client = new ConvexHttpClient(convexUrl);
  const actor = {
    key: "research-blog:dsh-stuck-installation",
    email: String(process.env.OWNER_EMAIL || "mukhtadanasution@gmail.com").trim().toLowerCase(),
    name: "Mukhtada Billah NST",
    role: "backend",
  };
  const uploads = await uploadImageAssets(client, secret, actor);
  const publishPayload = completeBlogSeoData(
    attachStoredAssetKeys(
      dshStuckInstallationBlogPayload,
      uploads.storedByAssetKey,
    ),
  );
  validatePayload(publishPayload, { requireProviderNeutral: true });

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
    throw new Error("DeepSeek Harness Blog publish verification failed");
  }
  const publishedImages = post.blocks.filter(
    (block) => block.type === "image"
      && block.storageId
      && block.assetKey
      && block.src?.startsWith("https://"),
  );
  if (publishedImages.length !== imageAssets.length) {
    throw new Error("Published DeepSeek Harness post is missing rendered image blocks");
  }

  console.log((existing ? "Updated" : "Created") + " Blog post: " + post.slug);
  console.log(
    "Blocks: " + post.blocks.length
      + "; images: " + publishedImages.length
      + "; uploads: " + uploads.uploaded
      + "; reused: " + uploads.reused
      + "; source: " + post.sourceHref,
  );
  return post;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  await publishDshStuckInstallationBlog();
}
