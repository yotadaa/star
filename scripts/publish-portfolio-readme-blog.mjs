import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { ConvexHttpClient } from "convex/browser";
import { makeFunctionReference } from "convex/server";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const readmePath = path.join(root, "README.md");
const slug = "mukhtadas-portfolio";
const repositoryUrl = "https://github.com/yotadaa/star";
const listBlogAdmin = makeFunctionReference("bridge:listBlogAdmin");
const createBlog = makeFunctionReference("bridge:createBlog");
const updateBlog = makeFunctionReference("bridge:updateBlog");
const createFileUploadUrl = makeFunctionReference("bridge:createFileUploadUrl");
const commitFile = makeFunctionReference("bridge:commitFile");
const getFile = makeFunctionReference("bridge:getFile");
const findFileBySourceKey = makeFunctionReference("bridge:findFileBySourceKey");

const imageAssets = new Map([
  [
    "validation/hero-entities-2026-07-30/desktop-sunset.png",
    {
      sourceKey: "blog:mukhtadas-portfolio:home-sunset",
      fileName: "home-sunset.png",
      caption: "The Home page at sunset, with its mountain landscape, quest prompt, and pixel interface.",
    },
  ],
  [
    "validation/convex-world-chat/desktop-live.png",
    {
      sourceKey: "blog:mukhtadas-portfolio:world-chat",
      fileName: "world-chat.jpg",
      caption: "World Chat stays over the current page and receives live updates from Convex.",
    },
  ],
  [
    "validation/manage-world-chat-nala-seo/nala-live/desktop-happy-live.png",
    {
      sourceKey: "blog:mukhtadas-portfolio:nala-live",
      fileName: "nala-live.jpg",
      caption: "Nala answers a player-progress question with a tool-grounded numeric response.",
    },
  ],
  [
    "validation/manage-world-chat-nala-seo/manage-unlocked/desktop-nala-config.png",
    {
      sourceKey: "blog:mukhtadas-portfolio:manage-nala",
      fileName: "manage-nala.jpg",
      caption: "The owner workbench exposes Nala's configuration without exposing the OpenRouter key.",
    },
  ],
]);

function cleanInline(value) {
  return String(value || "")
    .replace(/!\[([^\]]*)\]\([^)]+\)/g, "$1")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/`([^`]+)`/g, "$1")
    .replace(/\*\*([^*]+)\*\*/g, "$1")
    .replace(/\*([^*]+)\*/g, "$1")
    .replace(/\s+/g, " ")
    .trim();
}

function isSpecialLine(lines, index) {
  const line = lines[index] || "";
  if (!line.trim()) return true;
  if (/^#{1,6}\s+/.test(line)) return true;
  if (/^```/.test(line)) return true;
  if (/^>\s?/.test(line)) return true;
  if (/^!\[[^\]]*\]\([^)]+\)\s*$/.test(line)) return true;
  if (/^\s*(?:[-+*]|\d+\.)\s+/.test(line)) return true;
  return /^\s*\|/.test(line) && /^\s*\|?\s*:?-{3,}/.test(lines[index + 1] || "");
}

function parseTableRow(line) {
  return line
    .trim()
    .replace(/^\|/, "")
    .replace(/\|$/, "")
    .split("|")
    .map((cell) => cleanInline(cell));
}

export function readPortfolioReadmeBlocks(markdown = fs.readFileSync(readmePath, "utf8")) {
  const lines = markdown.replace(/\r\n/g, "\n").split("\n");
  const blocks = [];
  let index = 0;

  while (index < lines.length) {
    const line = lines[index];
    if (!line.trim()) {
      index += 1;
      continue;
    }

    const heading = line.match(/^(#{1,6})\s+(.+)$/);
    if (heading) {
      if (heading[1].length > 1) blocks.push({ type: "heading", text: cleanInline(heading[2]) });
      index += 1;
      continue;
    }

    if (line.startsWith("```")) {
      const code = [];
      index += 1;
      while (index < lines.length && !lines[index].startsWith("```")) {
        code.push(lines[index]);
        index += 1;
      }
      blocks.push({ type: "code", text: code.join("\n").trimEnd() });
      index += 1;
      continue;
    }

    const image = line.match(/^!\[([^\]]*)\]\(([^)]+)\)\s*$/);
    if (image) {
      const asset = imageAssets.get(image[2]);
      if (!asset) throw new Error(`README image is not mapped to a Convex Blog asset: ${image[2]}`);
      const sourcePath = path.join(root, image[2]);
      if (!fs.existsSync(sourcePath)) throw new Error(`README screenshot is missing: ${sourcePath}`);
      blocks.push({
        type: "image",
        assetKey: asset.sourceKey,
        alt: cleanInline(image[1]),
        text: asset.caption,
      });
      index += 1;
      continue;
    }

    if (line.startsWith(">")) {
      const quote = [];
      while (index < lines.length && lines[index].startsWith(">")) {
        quote.push(lines[index].replace(/^>\s?/, ""));
        index += 1;
      }
      blocks.push({ type: "quote", text: cleanInline(quote.join(" ")) });
      continue;
    }

    if (/^\s*\|/.test(line) && /^\s*\|?\s*:?-{3,}/.test(lines[index + 1] || "")) {
      const rows = [parseTableRow(line)];
      index += 2;
      while (index < lines.length && /^\s*\|/.test(lines[index])) {
        rows.push(parseTableRow(lines[index]));
        index += 1;
      }
      blocks.push({ type: "table", text: "README table", rows });
      continue;
    }

    if (/^\s*(?:[-+*]|\d+\.)\s+/.test(line)) {
      const items = [];
      while (index < lines.length) {
        const item = lines[index].match(/^\s*((?:[-+*])|(\d+\.))\s+(.+)$/);
        if (!item) break;
        const prefix = item[2] || "";
        const parts = [item[3]];
        index += 1;
        while (
          index < lines.length &&
          lines[index].trim() &&
          !/^\s*(?:[-+*]|\d+\.)\s+/.test(lines[index]) &&
          !isSpecialLine(lines, index)
        ) {
          parts.push(lines[index].trim());
          index += 1;
        }
        items.push(`${prefix}${prefix ? " " : ""}${cleanInline(parts.join(" "))}`);
        while (index < lines.length && !lines[index].trim()) index += 1;
      }
      blocks.push({ type: "list", text: items.join("\n") });
      continue;
    }

    const paragraph = [line.trim()];
    index += 1;
    while (index < lines.length && !isSpecialLine(lines, index)) {
      paragraph.push(lines[index].trim());
      index += 1;
    }
    blocks.push({ type: "paragraph", text: cleanInline(paragraph.join(" ")) });
  }

  return blocks;
}

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

export const portfolioReadmeBlogPayload = {
  title: "Mukhtada's Portfolio",
  slug,
  excerpt:
    "An Indonesian-language record of fullstack work, AI experiments, data research, publications, and community projects, presented as a factual game world.",
  status: "published",
  tags: ["Portfolio", "Next.js", "Convex", "AI"],
  readTime: "11 min baca",
  coverTone: "research",
  sourceHref: repositoryUrl,
  blocks: readPortfolioReadmeBlocks(),
};

function validatePayload(payload, { requireStorage = false } = {}) {
  const images = payload.blocks.filter((block) => block.type === "image");
  if (images.length !== imageAssets.size) {
    throw new Error(`Expected ${imageAssets.size} image blocks, received ${images.length}`);
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
    "A portfolio that behaves like a place",
    "World Chat",
    "Nala",
    "The owner room",
    "Beneath the scenery",
    "The Convex schema",
    "Run the cabin locally",
    "The design contract",
    "Honest edges",
  ]) {
    if (!headings.has(expected)) throw new Error(`Missing README section: ${expected}`);
  }
}

function detectContentType(bytes) {
  if (bytes.length >= 8 && bytes.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]))) {
    return "image/png";
  }
  if (bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) {
    return "image/jpeg";
  }
  throw new Error("README Blog assets must be PNG or JPEG images");
}

async function uploadImageAssets(client, secret, actor) {
  const storedByAssetKey = new Map();
  let uploaded = 0;
  let reused = 0;

  for (const [readmeSource, asset] of imageAssets) {
    const sourcePath = path.join(root, readmeSource);
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
        throw new Error(`Convex upload failed for ${readmeSource}: ${uploadResponse.status}`);
      }
      const upload = await uploadResponse.json();
      if (!upload.storageId) throw new Error(`Convex did not return a storage ID for ${readmeSource}`);

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
          readmeSource,
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

export async function publishPortfolioReadmeBlog() {
  loadLocalEnv();
  validatePayload(portfolioReadmeBlogPayload);

  const convexUrl = String(process.env.CONVEX_CLOUD_URL || "").trim().replace(/\/+$/, "");
  const secret = process.env.CONVEX_INTERNAL_API_KEY;
  if (!convexUrl) throw new Error("CONVEX_CLOUD_URL is not configured");
  if (!secret) throw new Error("CONVEX_INTERNAL_API_KEY is not configured");

  const client = new ConvexHttpClient(convexUrl);
  const actor = {
    key: "repository-content:portfolio-readme",
    email: String(process.env.OWNER_EMAIL || "mukhtadanasution@gmail.com").trim().toLowerCase(),
    name: "Mukhtada Billah NST",
    role: "backend",
  };
  const uploads = await uploadImageAssets(client, secret, actor);
  const publishPayload = attachStorageIds(portfolioReadmeBlogPayload, uploads.storedByAssetKey);
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
    throw new Error("Portfolio README Blog publish verification failed");
  }
  const publishedImages = post.blocks.filter(
    (block) => block.type === "image" && block.storageId && block.assetKey && block.src?.startsWith("https://"),
  );
  if (publishedImages.length !== imageAssets.size) {
    throw new Error("Published post is missing rendered image blocks");
  }

  console.log(`${existing ? "Updated" : "Created"} Blog post: ${post.slug}`);
  console.log(
    `Blocks: ${post.blocks.length}; images: ${publishedImages.length}; uploads: ${uploads.uploaded}; reused: ${uploads.reused}; source: ${post.sourceHref}`,
  );
  return post;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  await publishPortfolioReadmeBlog();
}
