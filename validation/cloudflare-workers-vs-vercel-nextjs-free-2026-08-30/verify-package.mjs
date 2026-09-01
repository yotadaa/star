import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { readImageDimensions } from "../../scripts/image-dimensions.mjs";

const packageDir = path.dirname(new URL(import.meta.url).pathname);
const payload = JSON.parse(fs.readFileSync(path.join(packageDir, "payload.json"), "utf8"));
const errors = [];
const expect = (condition, message) => { if (!condition) errors.push(message); };

expect(payload.slug === "cloudflare-workers-vs-vercel-nextjs-free", "slug mismatch");
expect(payload.status === "published", "package must be publishable");
expect(Number.isFinite(Date.parse(payload.publishedAt)), "publishedAt must be valid");
expect(payload.seoTitle.length <= 70, "SEO title exceeds 70 characters");
expect(payload.seoDescription.length <= 180, "SEO description exceeds 180 characters");
expect(payload.language === "en-US", "language must be en-US");
expect(payload.articleSection === "Research Note", "section mismatch");
expect(payload.author?.id === "https://me.mukhtada.my.id/#person", "author identity mismatch");
expect(payload.author?.name === "Mukhtada Billah NST", "author name mismatch");

const allowedTypes = new Set(["heading", "paragraph", "quote", "list", "code", "image", "divider", "table", "icon"]);
for (const [index, block] of payload.blocks.entries()) {
  expect(allowedTypes.has(block.type), `unsupported block type at ${index}`);
  expect(typeof block.text === "string" && block.text.trim(), `missing block text at ${index}`);
}

const serialized = JSON.stringify(payload);
expect(!serialized.includes('"src"'), "payload persists src");
expect(!serialized.includes("storageId"), "payload persists storageId");
expect(!/research note:/i.test(serialized), "payload contains research-note ending");

const expectedAssets = new Map([
  ["blog:cloudflare-workers-vs-vercel-nextjs-free:feature-two-paths", { file: "assets/nextjs-two-paths-feature.png", width: 1672, height: 941, sha256: "9a2b881e51b92b3401daa2b7915b969728219c779ec25344f8a337e7a60990fa" }],
  ["blog:cloudflare-workers-vs-vercel-nextjs-free:evidence-vinext-default", { file: "assets/vinext-guidance-reconstruction.png", width: 1600, height: 900, sha256: "7e3f5df2b8474ca0cd0880b570cccf718d68154c8cb8b2f4300a472d8cdc7829" }],
  ["blog:cloudflare-workers-vs-vercel-nextjs-free:comparison-boundaries", { file: "assets/free-tier-boundaries.png", width: 1600, height: 1000, sha256: "376583c3d9615714e473076438912ef8bdf488f998121984c56826e8e4082f5e" }],
]);

const imageBlocks = payload.blocks.filter((block) => block.type === "image");
expect(imageBlocks.length === expectedAssets.size, "image-block count mismatch");
expect(imageBlocks[0]?.assetKey === payload.featuredImage?.assetKey, "first image does not match featuredImage");

for (const block of imageBlocks) {
  const expected = expectedAssets.get(block.assetKey);
  expect(Boolean(expected), `unexpected image key ${block.assetKey}`);
  expect(Boolean(block.alt?.trim()), `missing alt for ${block.assetKey}`);
  expect(Boolean(block.text?.trim()), `missing caption for ${block.assetKey}`);
  if (!expected) continue;
  const filePath = path.join(packageDir, expected.file);
  expect(fs.existsSync(filePath), `missing image ${expected.file}`);
  if (!fs.existsSync(filePath)) continue;
  const bytes = fs.readFileSync(filePath);
  const dimensions = readImageDimensions(bytes);
  const sha256 = crypto.createHash("sha256").update(bytes).digest("hex");
  expect(dimensions.width === expected.width && dimensions.height === expected.height, `encoded dimensions mismatch for ${expected.file}`);
  expect(block.width === expected.width && block.height === expected.height, `payload dimensions mismatch for ${expected.file}`);
  expect(sha256 === expected.sha256, `checksum mismatch for ${expected.file}`);
}

expect(payload.featuredImage?.alt === imageBlocks[0]?.alt, "featuredImage alt does not match the first image");
expect(payload.featuredImage?.width === imageBlocks[0]?.width && payload.featuredImage?.height === imageBlocks[0]?.height, "featuredImage dimensions do not match first image");

const requiredFiles = ["assignment.md", "terminology-ledger.md", "claim-ledger.md", "source-ledger.md", "visual-ledger.md", "seo-intent.md", "hook-scorecard.md", "draft.md", "payload.json", "build-payload.mjs", "feature-prompt.md"];
for (const file of requiredFiles) expect(fs.existsSync(path.join(packageDir, file)), `missing package file ${file}`);

const sourceCaptures = fs.readdirSync(path.join(packageDir, "sources")).filter((file) => /\.(?:png|jpe?g|webp)$/i.test(file)).length;
expect(sourceCaptures >= 14, `expected at least 14 source captures, received ${sourceCaptures}`);

const byType = Object.fromEntries([...allowedTypes].map((type) => [type, payload.blocks.filter((block) => block.type === type).length]).filter(([, count]) => count > 0));
console.log(JSON.stringify({ errors, slug: payload.slug, status: payload.status, blocks: payload.blocks.length, byType, assets: expectedAssets.size, sourceCaptures, seoTitleLength: payload.seoTitle.length, seoDescriptionLength: payload.seoDescription.length }, null, 2));
if (errors.length) process.exitCode = 1;
