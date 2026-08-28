import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const here = path.dirname(fileURLToPath(import.meta.url));
const payload = JSON.parse(await fs.readFile(path.join(here, "payload.json"), "utf8"));
const draft = await fs.readFile(path.join(here, "draft.md"), "utf8");
const errors = [];
const supported = new Set(["heading", "paragraph", "quote", "list", "code", "image", "divider", "table", "icon"]);
const expectedImages = new Map([
  ["blog:openai-bel-rumor-one-source-no-confirmation:feature-source-gap", "assets/feature-bel-source-gap.png"],
  ["blog:openai-bel-rumor-one-source-no-confirmation:evidence-original-bel-post", "assets/evidence-original-bel-post.jpg"],
  ["blog:openai-bel-rumor-one-source-no-confirmation:claim-status-matrix", "assets/claim-status-matrix.png"]
]);

const assert = (condition, message) => {
  if (!condition) errors.push(message);
};

assert(payload.status === "published", "status must be published");
assert(Number.isFinite(Date.parse(payload.publishedAt)), "publishedAt must be a valid publication time");
assert(payload.language === "en-US", "language must be en-US");
assert(payload.articleSection === "AI Investigation", "articleSection must be AI Investigation");
assert(payload.author?.id === "https://me.mukhtada.my.id/#person", "author id mismatch");
assert(payload.author?.name === "Mukhtada Billah NST", "author name mismatch");
assert(payload.author?.url === "https://me.mukhtada.my.id/", "author url mismatch");
assert(payload.seoTitle.length <= 70, "seoTitle exceeds 70 characters");
assert(payload.seoDescription.length <= 180, "seoDescription exceeds 180 characters");
assert(!/Mukhtada/i.test(payload.seoTitle), "seoTitle must not include author suffix");
assert(/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(payload.slug), "slug is not lowercase kebab-case");
assert(/^#\s+[^#]/m.test(draft), "draft is missing an H1");
assert((draft.match(/^#\s+/gm) || []).length === 1, "draft must contain exactly one H1");
assert(!/<(?:script|div|img|p|table|iframe)\b/i.test(draft), "raw HTML found in draft");

for (const [index, block] of payload.blocks.entries()) {
  assert(supported.has(block.type), `unsupported block type at ${index}: ${block.type}`);
  if (block.type === "image") {
    assert(Boolean(block.assetKey), `image ${index} missing assetKey`);
    assert(Boolean(block.alt?.trim()), `image ${index} missing alt`);
    assert(Number.isInteger(block.width) && block.width > 0, `image ${index} missing width`);
    assert(Number.isInteger(block.height) && block.height > 0, `image ${index} missing height`);
    assert(!block.src && !block.storageId, `image ${index} must remain provider-neutral`);
  }
  if (block.type === "table") {
    assert(Array.isArray(block.rows) && block.rows.length >= 2, `table ${index} missing rows`);
  }
}

const imageBlocks = payload.blocks.filter((block) => block.type === "image");
assert(imageBlocks.length === 3, `expected 3 image blocks, got ${imageBlocks.length}`);
assert(imageBlocks[0]?.assetKey === "blog:openai-bel-rumor-one-source-no-confirmation:feature-source-gap", "first image is not the feature asset");
assert(imageBlocks.every((block) => expectedImages.has(block.assetKey)), "payload contains an unexpected image key");

const decoded = [];
for (const block of imageBlocks) {
  const relative = expectedImages.get(block.assetKey);
  const metadata = await sharp(path.join(here, relative)).metadata();
  assert(metadata.width === block.width, `${relative} width mismatch`);
  assert(metadata.height === block.height, `${relative} height mismatch`);
  decoded.push({ assetKey: block.assetKey, file: relative, width: metadata.width, height: metadata.height, format: metadata.format });
}

const wordCount = (draft
  .replace(/```[\s\S]*?```/g, " ")
  .replace(/`[^`]+`/g, " ")
  .replace(/https?:\/\/[^\s)\]}>"']+/g, " ")
  .replace(/!\[[^\]]*\]\([^)]*\)/g, " ")
  .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
  .match(/\b[\w'-]+\b/g) || []).length;
const measuredReadMinutes = Math.ceil(wordCount / 225);
assert(payload.readTime === `${measuredReadMinutes} min read`, `readTime mismatch: expected ${measuredReadMinutes} min read`);

const sourceUrls = [...new Set([...draft.matchAll(/https?:\/\/[^\s)\]}>"']+/g)].map((match) => match[0]))];
const sourceFiles = [];
async function walk(directory) {
  for (const entry of await fs.readdir(directory, { withFileTypes: true })) {
    const item = path.join(directory, entry.name);
    if (entry.isDirectory()) await walk(item);
    else sourceFiles.push(path.relative(here, item));
  }
}
await walk(path.join(here, "sources"));
const sourceScreenshotFiles = sourceFiles.filter((file) => /\.(?:png|jpe?g|webp)$/i.test(file));
for (const file of sourceScreenshotFiles) {
  try {
    const metadata = await sharp(path.join(here, file)).metadata();
    assert(Boolean(metadata.width && metadata.height), `${file} has invalid dimensions`);
  } catch (error) {
    errors.push(`${file} failed to decode: ${error.message}`);
  }
}

const result = {
  errors,
  counts: {
    words: wordCount,
    measuredReadMinutes,
    blocks: payload.blocks.length,
    headings: payload.blocks.filter((block) => block.type === "heading").length,
    paragraphs: payload.blocks.filter((block) => block.type === "paragraph").length,
    images: imageBlocks.length,
    tables: payload.blocks.filter((block) => block.type === "table").length,
    sourceUrls: sourceUrls.length,
    sourceScreenshots: sourceScreenshotFiles.length,
    decodedSourceScreenshots: sourceScreenshotFiles.length
  },
  seo: { titleLength: payload.seoTitle.length, descriptionLength: payload.seoDescription.length },
  decodedImages: decoded,
  sourceUrls
};

console.log(JSON.stringify(result, null, 2));
if (errors.length) process.exitCode = 1;
