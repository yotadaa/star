import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { readImageDimensions } from "../../scripts/image-dimensions.mjs";

const packageDir = path.dirname(new URL(import.meta.url).pathname);
const payload = JSON.parse(fs.readFileSync(path.join(packageDir, "payload.json"), "utf8"));
const errors = [];
const expect = (condition, message) => {
  if (!condition) errors.push(message);
};

expect(payload.slug === "free-portfolio-stack-nextjs-convex-r2-vercel", "slug mismatch");
expect(payload.status === "published", "package must be publishable");
expect(Number.isFinite(Date.parse(payload.publishedAt)), "publishedAt must be valid");
expect(payload.seoTitle.length <= 70, "SEO title exceeds 70 characters");
expect(payload.seoDescription.length <= 180, "SEO description exceeds 180 characters");
expect(payload.language === "en-US", "language must be en-US");
expect(payload.articleSection === "Technical Case Study", "section mismatch");
expect(payload.author?.id === "https://me.mukhtada.my.id/#person", "author identity mismatch");
expect(payload.author?.name === "Mukhtada Billah NST", "author name mismatch");

const allowedTypes = new Set([
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

for (const [index, block] of payload.blocks.entries()) {
  expect(allowedTypes.has(block.type), `unsupported block type at ${index}`);
  expect(typeof block.text === "string" && block.text.trim(), `missing block text at ${index}`);
}

const serialized = JSON.stringify(payload);
expect(!serialized.includes('"src"'), "payload persists src");
expect(!serialized.includes("storageId"), "payload persists storageId");
expect(!serialized.includes("Research note:"), "payload contains forbidden research-note ending");

const expectedAssets = new Map([
  [
    "blog:free-portfolio-stack-nextjs-convex-r2-vercel:feature-workbench-stack",
    {
      file: "assets/portfolio-stack-workbench-feature.png",
      width: 1672,
      height: 941,
      sha256: "129ffa8a2f9a0c38d662fcf838679c6679a5368414b83b5b577d6807276646f1",
    },
  ],
  [
    "blog:free-portfolio-stack-nextjs-convex-r2-vercel:evidence-live-portfolio",
    {
      file: "assets/live-portfolio-home.jpg",
      width: 1425,
      height: 891,
      sha256: "b541df746f7ee3977a2d112d7edbc7c27648622f87e974089ef459f6c96aa638",
    },
  ],
  [
    "blog:free-portfolio-stack-nextjs-convex-r2-vercel:evidence-r2-free-tier",
    {
      file: "assets/r2-free-tier-evidence.jpg",
      width: 1430,
      height: 894,
      sha256: "573fc49c98b5369d3cee039dc0271d41364033763ddf271214c069c5904ad998",
    },
  ],
  [
    "blog:free-portfolio-stack-nextjs-convex-r2-vercel:evidence-r2-checkout",
    {
      file: "assets/r2-checkout-evidence.jpg",
      width: 1430,
      height: 894,
      sha256: "5f7ab82495c7d1f850ddc59255c4da66ad4baaa9d80654310fb7a62461725d48",
    },
  ],
]);

const imageBlocks = payload.blocks.filter((block) => block.type === "image");
expect(imageBlocks.length === expectedAssets.size, "image-block count mismatch");
expect(
  imageBlocks[0]?.assetKey === payload.featuredImage?.assetKey,
  "first image does not match featuredImage",
);

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
  expect(
    dimensions.width === expected.width && dimensions.height === expected.height,
    `encoded dimensions mismatch for ${expected.file}`,
  );
  expect(
    block.width === expected.width && block.height === expected.height,
    `payload dimensions mismatch for ${expected.file}`,
  );
  expect(sha256 === expected.sha256, `checksum mismatch for ${expected.file}`);
}

expect(
  payload.featuredImage?.alt === imageBlocks[0]?.alt,
  "featuredImage alt does not match the first image",
);
expect(
  payload.featuredImage?.width === imageBlocks[0]?.width
    && payload.featuredImage?.height === imageBlocks[0]?.height,
  "featuredImage dimensions do not match the first image",
);

const requiredPackageFiles = [
  "assignment.md",
  "terminology-ledger.md",
  "claim-ledger.md",
  "source-ledger.md",
  "visual-ledger.md",
  "seo-intent.md",
  "hook-scorecard.md",
  "draft.md",
  "payload.json",
  "build-payload.mjs",
  "feature-prompt.md",
];
for (const file of requiredPackageFiles) {
  expect(fs.existsSync(path.join(packageDir, file)), `missing package file ${file}`);
}

const sourceCaptureCount = fs
  .readdirSync(path.join(packageDir, "sources"))
  .filter((file) => /\.(?:png|jpe?g|webp)$/i.test(file)).length;
expect(sourceCaptureCount === 26, `expected 26 source captures, received ${sourceCaptureCount}`);

const byType = Object.fromEntries(
  [...allowedTypes]
    .map((type) => [type, payload.blocks.filter((block) => block.type === type).length])
    .filter(([, count]) => count > 0),
);

console.log(
  JSON.stringify(
    {
      errors,
      slug: payload.slug,
      status: payload.status,
      blocks: payload.blocks.length,
      byType,
      assets: expectedAssets.size,
      sourceCaptures: sourceCaptureCount,
      seoTitleLength: payload.seoTitle.length,
      seoDescriptionLength: payload.seoDescription.length,
    },
    null,
    2,
  ),
);

if (errors.length > 0) process.exitCode = 1;
