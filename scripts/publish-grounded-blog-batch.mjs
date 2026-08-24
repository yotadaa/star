import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { ConvexHttpClient } from "convex/browser";
import { makeFunctionReference } from "convex/server";
import { completeBlogSeoData } from "./blog-seo-data.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const defaultBatchPath = path.join(
  root,
  "scripts",
  "blog-batches",
  "six-grounded-blogs-2026-08-24.json",
);
const supportedBlockTypes = new Set([
  "heading",
  "paragraph",
  "quote",
  "list",
  "code",
  "image",
  "divider",
  "table",
  "icon",
]);

const listBlogAdmin = makeFunctionReference("bridge:listBlogAdmin");
const createBlog = makeFunctionReference("bridge:createBlog");
const updateBlog = makeFunctionReference("bridge:updateBlog");
const createFileUploadUrl = makeFunctionReference("bridge:createFileUploadUrl");
const commitFile = makeFunctionReference("bridge:commitFile");
const getFile = makeFunctionReference("bridge:getFile");
const findFileBySourceKey = makeFunctionReference("bridge:findFileBySourceKey");

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
    if (
      (value.startsWith('"') && value.endsWith('"'))
      || (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    if (process.env[key] === undefined) process.env[key] = value;
  }
}

function readJson(relativeOrAbsolutePath) {
  const absolutePath = path.isAbsolute(relativeOrAbsolutePath)
    ? relativeOrAbsolutePath
    : path.join(root, relativeOrAbsolutePath);
  const relative = path.relative(root, absolutePath);
  if (relative.startsWith("..") || path.isAbsolute(relative)) {
    throw new Error(`Batch path escapes the repository: ${relativeOrAbsolutePath}`);
  }
  return {
    absolutePath,
    value: JSON.parse(fs.readFileSync(absolutePath, "utf8")),
  };
}

function sha256(bytes) {
  return crypto.createHash("sha256").update(bytes).digest("hex");
}

function detectContentType(bytes) {
  if (
    bytes.length >= 8
    && bytes.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]))
  ) {
    return "image/png";
  }
  if (bytes.length >= 3 && bytes[0] === 255 && bytes[1] === 216 && bytes[2] === 255) {
    return "image/jpeg";
  }
  if (
    bytes.length >= 12
    && bytes.subarray(0, 4).toString("ascii") === "RIFF"
    && bytes.subarray(8, 12).toString("ascii") === "WEBP"
  ) {
    return "image/webp";
  }
  throw new Error("Batch Blog assets must be PNG, JPEG, or WebP images");
}

function validateBatch(batch) {
  if (!batch || !Array.isArray(batch.articles) || batch.articles.length === 0) {
    throw new Error("Grounded Blog batch must contain at least one article");
  }
  const slugs = new Set();
  const assetKeys = new Set();

  for (const article of batch.articles) {
    if (!article?.slug || !article?.payloadPath || !Array.isArray(article.assets)) {
      throw new Error("Every batch article needs slug, payloadPath, and assets");
    }
    if (slugs.has(article.slug)) throw new Error(`Duplicate batch slug: ${article.slug}`);
    slugs.add(article.slug);

    for (const asset of article.assets) {
      if (!asset?.assetKey || !asset?.sourcePath || !asset?.fileName || !asset?.evidenceKind) {
        throw new Error(`Incomplete asset configuration for ${article.slug}`);
      }
      if (!asset.assetKey.startsWith(`blog:${article.slug}:`)) {
        throw new Error(`Asset key does not belong to ${article.slug}: ${asset.assetKey}`);
      }
      if (assetKeys.has(asset.assetKey)) throw new Error(`Duplicate asset key: ${asset.assetKey}`);
      assetKeys.add(asset.assetKey);
    }
  }
}

function validatePayload(payload, article, { requireStorage = false } = {}) {
  if (payload.slug !== article.slug || payload.status !== "published") {
    throw new Error(`Published payload identity is invalid for ${article.slug}`);
  }
  if (!payload.title?.trim() || !payload.excerpt?.trim() || !payload.sourceHref?.trim()) {
    throw new Error(`Required visible metadata is missing for ${article.slug}`);
  }
  if (!payload.seoTitle?.trim() || payload.seoTitle.length > 70) {
    throw new Error(`seoTitle is missing or too long for ${article.slug}`);
  }
  if (!payload.seoDescription?.trim() || payload.seoDescription.length > 180) {
    throw new Error(`seoDescription is missing or too long for ${article.slug}`);
  }
  if (
    payload.language !== "en-US"
    || !payload.articleSection?.trim()
    || !payload.author?.id
    || !payload.author?.name
    || !payload.author?.url
  ) {
    throw new Error(`Editorial identity is incomplete for ${article.slug}`);
  }
  if (!Number.isFinite(Date.parse(payload.publishedAt))) {
    throw new Error(`publishedAt is invalid for ${article.slug}`);
  }
  if (!Array.isArray(payload.blocks) || payload.blocks.length === 0) {
    throw new Error(`Native blocks are missing for ${article.slug}`);
  }
  for (const block of payload.blocks) {
    if (!supportedBlockTypes.has(block.type)) {
      throw new Error(`Unsupported block type for ${article.slug}: ${block.type}`);
    }
  }

  const images = payload.blocks.filter((block) => block.type === "image");
  const expectedKeys = new Set(article.assets.map((asset) => asset.assetKey));
  if (images.length !== expectedKeys.size) {
    throw new Error(
      `Expected ${expectedKeys.size} image blocks for ${article.slug}, received ${images.length}`,
    );
  }
  for (const image of images) {
    if (!expectedKeys.has(image.assetKey)) {
      throw new Error(`Unexpected Blog image for ${article.slug}: ${image.assetKey || "missing"}`);
    }
    if (!image.alt?.trim() || !image.text?.trim()) {
      throw new Error(`Image alt text or caption is missing for ${image.assetKey}`);
    }
    if (image.src) throw new Error(`Stored Blog image cannot persist src: ${image.assetKey}`);
    if (requireStorage && !image.storageId) {
      throw new Error(`Stored Blog image lacks storageId: ${image.assetKey}`);
    }
  }
}

function loadArticle(article) {
  const payloadRecord = readJson(article.payloadPath);
  const payload = payloadRecord.value;
  const assets = article.assets.map((asset) => {
    const sourcePath = path.isAbsolute(asset.sourcePath)
      ? asset.sourcePath
      : path.join(root, asset.sourcePath);
    const relative = path.relative(root, sourcePath);
    if (relative.startsWith("..") || path.isAbsolute(relative)) {
      throw new Error(`Asset path escapes the repository: ${asset.sourcePath}`);
    }
    if (!fs.existsSync(sourcePath)) throw new Error(`Blog asset is missing: ${sourcePath}`);
    const bytes = fs.readFileSync(sourcePath);
    return {
      ...asset,
      sourcePath,
      bytes,
      checksum: sha256(bytes),
      contentType: detectContentType(bytes),
    };
  });
  return { payload, payloadPath: payloadRecord.absolutePath, assets };
}

async function uploadAssets(client, secret, actor, article, assets) {
  const storedByAssetKey = new Map();
  let uploaded = 0;
  let reused = 0;

  for (const asset of assets) {
    const existing = await client.action(findFileBySourceKey, {
      secret,
      sourceKey: asset.assetKey,
    });
    let stored = existing;

    if (!existing?.storage_id || !existing?.url || existing.metadata?.sha256 !== asset.checksum) {
      const uploadUrl = await client.action(createFileUploadUrl, { secret, actor });
      const response = await fetch(uploadUrl, {
        method: "POST",
        headers: { "Content-Type": asset.contentType },
        body: asset.bytes,
      });
      if (!response.ok) {
        throw new Error(`Convex upload failed for ${asset.sourcePath}: ${response.status}`);
      }
      const upload = await response.json();
      if (!upload.storageId) throw new Error(`Convex omitted storageId for ${asset.assetKey}`);

      const fileId = await client.action(commitFile, {
        secret,
        storageId: upload.storageId,
        sourceKey: asset.assetKey,
        originalName: asset.fileName,
        contentType: asset.contentType,
        sizeBytes: asset.bytes.length,
        metadata: {
          purpose: "blog-image-block",
          blogSlug: article.slug,
          evidenceKind: asset.evidenceKind,
          sourcePath: path.relative(root, asset.sourcePath),
          sha256: asset.checksum,
        },
        actor,
      });
      stored = await client.action(getFile, { secret, id: fileId });
      uploaded += 1;
    } else {
      reused += 1;
    }

    if (!stored?.storage_id || !stored?.url) {
      throw new Error(`Convex storage verification failed for ${asset.assetKey}`);
    }
    storedByAssetKey.set(asset.assetKey, stored);
  }

  return { storedByAssetKey, uploaded, reused };
}

function attachStorageIds(payload, storedByAssetKey) {
  return {
    ...payload,
    blocks: payload.blocks.map((block) => {
      if (block.type !== "image") return block;
      const stored = storedByAssetKey.get(block.assetKey);
      if (!stored?.storage_id) throw new Error(`Uploaded asset is missing: ${block.assetKey}`);
      return { ...block, storageId: stored.storage_id };
    }),
  };
}

async function publishArticle(client, secret, article) {
  const loaded = loadArticle(article);
  validatePayload(loaded.payload, article);
  const actor = {
    key: `research-blog:${article.slug}`,
    email: String(process.env.OWNER_EMAIL || "mukhtadanasution@gmail.com")
      .trim()
      .toLowerCase(),
    name: "Mukhtada Billah NST",
    role: "backend",
  };
  const uploads = await uploadAssets(client, secret, actor, article, loaded.assets);
  const publishPayload = completeBlogSeoData(
    attachStorageIds(loaded.payload, uploads.storedByAssetKey),
  );
  validatePayload(publishPayload, article, { requireStorage: true });

  const posts = await client.action(listBlogAdmin, { secret, limit: 200 });
  const existing = posts.find((post) => post.slug === article.slug);
  const post = existing
    ? await client.action(updateBlog, {
        secret,
        id: existing.id,
        payload: publishPayload,
        actor,
      })
    : await client.action(createBlog, { secret, payload: publishPayload, actor });

  const storedImages = (post?.blocks || []).filter(
    (block) => block.type === "image"
      && block.storageId
      && block.assetKey
      && block.src?.startsWith("https://"),
  );
  if (
    !post
    || post.slug !== article.slug
    || post.status !== "published"
    || storedImages.length !== article.assets.length
  ) {
    throw new Error(`Published Blog verification failed for ${article.slug}`);
  }

  return {
    slug: article.slug,
    action: existing ? "updated" : "created",
    blocks: post.blocks.length,
    images: storedImages.length,
    uploads: uploads.uploaded,
    reused: uploads.reused,
  };
}

export async function publishGroundedBlogBatch(batchPath = defaultBatchPath) {
  loadLocalEnv();
  const { value: batch } = readJson(batchPath);
  validateBatch(batch);

  const convexUrl = String(process.env.CONVEX_CLOUD_URL || "").trim().replace(/\/+$/, "");
  const secret = process.env.CONVEX_INTERNAL_API_KEY;
  if (!convexUrl) throw new Error("CONVEX_CLOUD_URL is not configured");
  if (!secret) throw new Error("CONVEX_INTERNAL_API_KEY is not configured");

  const client = new ConvexHttpClient(convexUrl);
  const results = [];
  for (const article of batch.articles) {
    results.push(await publishArticle(client, secret, article));
  }
  console.log(JSON.stringify({ batch: batch.name || path.basename(batchPath), results }, null, 2));
  return results;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  await publishGroundedBlogBatch(process.argv[2] || defaultBatchPath);
}
