import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { pathToFileURL } from "node:url";
import { buildSeedTables, expectedSeedCounts } from "./convex-seed-data.mjs";

const root = process.cwd();
const outputDir = path.join(root, ".migration", "convex-seed");
const sourceFiles = [
  "README.md",
  "lib/data.js",
  "scripts/publish-caelestia-blog.mjs",
  "scripts/publish-genbi-rebranding-blog.mjs",
  "scripts/publish-portfolio-readme-blog.mjs",
  "scripts/publish-stok-toko-review-blog.mjs",
  "scripts/publish-tnks-web-booking-blog.mjs",
  "scripts/publish-gpt-6-astra-rumor-blog.mjs",
  "scripts/publish-ox-alpha-investigation-blog.mjs",
  "scripts/publish-dsh-stuck-installation-blog.mjs",
  "scripts/blog-payloads/dsh-stuck-installation.json",
  "scripts/blog-seo-data.mjs",
  "scripts/image-dimensions.mjs",
  "scripts/backfill-blog-seo-data.mjs",
  "scripts/convex-seed-data.mjs",
  "scripts/build-convex-seed.mjs",
  "validation/hero-entities-2026-07-30/desktop-sunset.png",
  "validation/convex-world-chat/desktop-live.png",
  "validation/manage-world-chat-nala-seo/nala-live/desktop-happy-live.png",
  "validation/manage-world-chat-nala-seo/manage-unlocked/desktop-nala-config.png",
  "docs/blogs/stok-toko-review/WhatsApp Image 2026-08-23 at 15.53.17(2).jpeg",
  "docs/blogs/stok-toko-review/WhatsApp Image 2026-08-23 at 15.53.17(1).jpeg",
  "docs/blogs/stok-toko-review/WhatsApp Image 2026-08-23 at 15.53.13.jpeg",
  "docs/blogs/stok-toko-review/WhatsApp Image 2026-08-23 at 15.53.15(1).jpeg",
  "docs/blogs/stok-toko-review/WhatsApp Image 2026-08-23 at 15.53.17.jpeg",
  "docs/blogs/stok-toko-review/WhatsApp Image 2026-08-23 at 15.53.16(2).jpeg",
  "docs/blogs/genbi-rebranding/Pasted image.png",
  "docs/blogs/genbi-rebranding/Pasted image (2).png",
  "docs/blogs/genbi-rebranding/Pasted image (3).png",
  "docs/blogs/genbi-rebranding/Pasted image (4).png",
  "docs/blogs/genbi-rebranding/Pasted image (6).png",
  "docs/blogs/genbi-rebranding/Pasted image (7).png",
  "docs/blogs/genbi-rebranding/Pasted image (8).png",
  "docs/blogs/tnks-web-booking/Pasted image.png",
  "docs/blogs/tnks-web-booking/Pasted image (2).png",
  "docs/blogs/tnks-web-booking/Pasted image (3).png",
  "docs/blogs/tnks-web-booking/Pasted image (5).png",
  "docs/blogs/gpt-6-astra-rumor/generated/featured-astra-rumor-archive.jpg",
  "docs/blogs/gpt-6-astra-rumor/generated/rumor-chain-visualization.jpg",
  "docs/blogs/gpt-6-astra-rumor/source/00-chris-earlier-unnamed-hint.jpg",
  "docs/blogs/gpt-6-astra-rumor/source/01-leo-first-explicit-gpt6-rumor.jpg",
  "docs/blogs/gpt-6-astra-rumor/source/02-the-information-astra-report.jpg",
  "docs/blogs/gpt-6-astra-rumor/source/03-openai-astra-math-announcement.jpg",
  "docs/blogs/gpt-6-astra-rumor/source/04-leo-astra-next-week-rumor.jpg",
  "docs/blogs/gpt-6-astra-rumor/source/05-openai-astra-critical-cyber-statement.jpg",
  "docs/blogs/gpt-6-astra-rumor/source/06-leo-astra-delay-retraction.jpg",
  "docs/blogs/gpt-6-astra-rumor/source/07-tibo-codex-will-have-astra.jpg",
  "docs/blogs/gpt-6-astra-rumor/source/08-openai-latest-astra-status.jpg",
  "docs/blogs/ox-alpha-investigation/generated/featured-ox-alpha-trail.png",
  "docs/blogs/ox-alpha-investigation/generated/tokenizer-fingerprint.png",
  "docs/blogs/ox-alpha-investigation/generated/serving-layer-trace.png",
  "docs/blogs/ox-alpha-investigation/source/01-openrouter-model-card.jpg",
  "docs/blogs/ox-alpha-investigation/source/02-fingerprint-archive.jpg",
  "docs/blogs/ox-alpha-investigation/source/03-full-deepswe-run.jpg",
  "docs/blogs/ox-alpha-investigation/source/04-deepswe-leaderboard.jpg",
  "docs/blogs/dsh-problem-stuck-installation/image-1.png",
  "docs/blogs/dsh-problem-stuck-installation/image-2.png",
  "docs/blogs/dsh-problem-stuck-installation/generated/dsh-package-runner-feature.png",
  "docs/blogs/dsh-problem-stuck-installation/generated/dsh-command-wrapper-bridge.png",
];

function fail(message) {
  throw new Error(`CONVEX_SEED_INVALID: ${message}`);
}

function sha256(value) {
  return crypto.createHash("sha256").update(value).digest("hex");
}

function validHref(value) {
  if (value.startsWith("/") || value.startsWith("#")) return true;
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

function validImageSource(value) {
  return value.startsWith("https://");
}

function validAssetKey(value) {
  return /^blog:[a-z0-9-]+:[a-z0-9-]+$/.test(value);
}

function assertUnique(rows, key, table) {
  const values = rows.map((row) => row[key]);
  const duplicate = values.find((value, index) => values.indexOf(value) !== index);
  if (duplicate) fail(`${table}.${key} duplicate: ${duplicate}`);
}

function validate(tables) {
  for (const [table, expected] of Object.entries(expectedSeedCounts)) {
    if (tables[table].length !== expected) fail(`${table} expected ${expected}, got ${tables[table].length}`);
  }
  assertUnique(tables.blogPosts, "slug", "blogPosts");
  assertUnique(tables.inventoryItems, "sourceKey", "inventoryItems");
  assertUnique(tables.contentEntries, "entryKey", "contentEntries");
  assertUnique(tables.contactChannels, "channelKey", "contactChannels");

  for (const post of tables.blogPosts) {
    if (!post.slug || !post.title || !post.excerpt) fail(`blogPosts ${post.slug || "unknown"} has empty required text`);
    if (!validHref(post.sourceHref)) fail(`blogPosts ${post.slug} has invalid sourceHref`);
    if (!post.seoTitle || post.seoTitle.length > 70) fail(`blogPosts ${post.slug} has invalid seoTitle`);
    if (!post.seoDescription || post.seoDescription.length > 180) fail(`blogPosts ${post.slug} has invalid seoDescription`);
    if (!/^[a-z]{2,3}(?:-[A-Z]{2})?$/.test(post.language || "")) fail(`blogPosts ${post.slug} has invalid language`);
    if (!post.author?.id || !post.author?.name || !validHref(post.author?.url || "")) fail(`blogPosts ${post.slug} has invalid author`);
    if (!post.articleSection) fail(`blogPosts ${post.slug} has no articleSection`);
    if (post.status === "published" && (!post.publishedAt || !post.featuredImage)) {
      fail(`blogPosts ${post.slug} lacks a publication date or featured image`);
    }
    if (post.featuredImage && (!post.featuredImage.alt || post.featuredImage.width <= 0 || post.featuredImage.height <= 0)) {
      fail(`blogPosts ${post.slug} has invalid featuredImage metadata`);
    }
    for (const block of post.blocks) {
      if (!["heading", "paragraph", "quote", "list", "code", "image", "divider", "table", "icon"].includes(block.type)) {
        fail(`blogPosts ${post.slug} has unsupported block type ${block.type}`);
      }
      if (
        block.type === "image"
        && (
          !block.alt
          || block.width <= 0
          || block.height <= 0
          || (!validAssetKey(block.assetKey || "") && !validImageSource(block.src || ""))
        )
      ) {
        fail(`blogPosts ${post.slug} has invalid image block`);
      }
      if (block.type === "table" && !block.rows?.length) fail(`blogPosts ${post.slug} has invalid table block`);
      if (!block.text && !["divider", "image"].includes(block.type)) fail(`blogPosts ${post.slug} has empty block`);
    }
  }
  for (const item of tables.inventoryItems) {
    if (!item.name || !item.fullName || !item.sourceKey) fail("inventory item has empty required text");
    if (!["scroll", "tool", "artifact", "medal", "key"].includes(item.type)) fail(`unsupported inventory type ${item.type}`);
    if (!["common", "rare", "epic"].includes(item.rarity)) fail(`unsupported rarity ${item.rarity}`);
    if (item.linkTo && !validHref(item.linkTo)) fail(`inventory ${item.sourceKey} has invalid linkTo`);
  }
  for (const entry of tables.contentEntries) {
    if (!entry.entryKey || !entry.title || !entry.body) fail(`content entry ${entry.entryKey || "unknown"} has empty required text`);
  }
  for (const channel of tables.contactChannels) {
    if (!channel.channelKey || !channel.label || !channel.href) fail("contact channel has empty required text");
    if (!validHref(channel.href)) fail(`contact ${channel.channelKey} has invalid href`);
  }
}

const data = await import(pathToFileURL(path.join(root, "lib", "data.js")).href);
const tables = buildSeedTables(data);
validate(tables);
fs.mkdirSync(outputDir, { recursive: true });

const checksums = {};
for (const [table, rows] of Object.entries(tables)) {
  const body = `${rows.map((row) => JSON.stringify(row)).join("\n")}\n`;
  fs.writeFileSync(path.join(outputDir, `${table}.jsonl`), body);
  checksums[table] = sha256(body);
}

let commit = "unknown";
try {
  commit = execFileSync("git", ["rev-parse", "HEAD"], { cwd: root, encoding: "utf8" }).trim();
} catch {
  // The manifest remains usable outside Git, but records that provenance is unavailable.
}

const contentHash = sha256(Object.entries(checksums).sort().map(([table, checksum]) => `${table}:${checksum}`).join("\n"));
const manifest = {
  version: `convex-seed-v2-${contentHash.slice(0, 12)}`,
  schemaVersion: 2,
  commit,
  generatedAt: new Date().toISOString(),
  sourceFiles,
  counts: expectedSeedCounts,
  checksums,
  contentHash,
};
fs.writeFileSync(path.join(outputDir, "manifest.json"), `${JSON.stringify(manifest, null, 2)}\n`);
fs.writeFileSync(
  path.join(outputDir, "seedManifests.jsonl"),
  `${JSON.stringify({ ...manifest, importedAt: Date.now() })}\n`,
);

console.log(`Convex seed built: ${manifest.version}`);
console.log(`Counts: ${JSON.stringify(manifest.counts)}`);
console.log(`Content SHA-256: ${manifest.contentHash}`);
