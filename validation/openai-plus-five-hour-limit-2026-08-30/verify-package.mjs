import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { readImageDimensions } from "../../scripts/image-dimensions.mjs";

const packageDir = path.dirname(new URL(import.meta.url).pathname);
const payloadPath = path.join(packageDir, "payload.json");
const payload = JSON.parse(fs.readFileSync(payloadPath, "utf8"));
const errors = [];

const expect = (condition, message) => {
  if (!condition) errors.push(message);
};

expect(payload.slug === "openai-plus-five-hour-limit-explained", "slug mismatch");
expect(payload.status === "published", "package must be publishable");
expect(
  payload.publishedAt === "2026-08-30T16:36:01+07:00",
  "publishedAt must match the authorized publication decision",
);
expect(payload.seoTitle.length <= 70, "SEO title exceeds 70 characters");
expect(
  payload.seoDescription.length <= 180,
  "SEO description exceeds 180 characters",
);
expect(payload.language === "en-US", "language must be en-US");
expect(
  payload.author?.id === "https://me.mukhtada.my.id/#person",
  "author identity mismatch",
);
expect(payload.articleSection === "AI Investigation", "section mismatch");

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
  expect(typeof block.text === "string", `missing block text at ${index}`);
}

const serialized = JSON.stringify(payload);
expect(!serialized.includes('"src"'), "payload persists src");
expect(!serialized.includes("storageId"), "payload persists storageId");

const expectedAssets = new Map([
  [
    "blog:openai-plus-five-hour-limit-explained:feature-window-weekly-plan",
    {
      file: "assets/five-hour-window-weekly-plan-feature.png",
      width: 1672,
      height: 941,
      sha256:
        "8210e6ca2c44f2c2fc2ebad140dddd8d381657954ff1a36a18ae76c23b086a5d",
    },
  ],
  [
    "blog:openai-plus-five-hour-limit-explained:evidence-tibo-announcement",
    {
      file: "assets/tibo-five-hour-announcement-evidence.png",
      width: 625,
      height: 535,
      sha256:
        "a57b09626349c8b47840bce9cf16551336f2c4138c2e94b14c49a69ed946b27b",
    },
  ],
]);

const imageBlocks = payload.blocks.filter((block) => block.type === "image");
expect(imageBlocks.length === expectedAssets.size, "image-block count mismatch");
const featuredBlock = imageBlocks.find(
  (block) => block.assetKey === payload.featuredImage?.assetKey,
);
expect(Boolean(featuredBlock), "featuredImage does not match an image block");
if (featuredBlock) {
  expect(payload.featuredImage.alt === featuredBlock.alt, "featuredImage alt mismatch");
  expect(
    payload.featuredImage.width === featuredBlock.width &&
      payload.featuredImage.height === featuredBlock.height,
    "featuredImage dimensions mismatch",
  );
}

for (const block of imageBlocks) {
  const expected = expectedAssets.get(block.assetKey);
  expect(Boolean(expected), `unexpected image key ${block.assetKey}`);
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
  expect(block.alt.trim().length > 0, `missing alt for ${expected.file}`);
  expect(block.text.trim().length > 0, `missing caption for ${expected.file}`);
}

const expectedSources = [
  "S00-user-supplied-tibo-discovery.png",
  "S01-original-tibo-announcement.png",
  "S02-tibo-no-five-hour-test.png",
  "S03-openai-forum-tibo-role.png",
  "S04-openai-pricing-five-hour-window.png",
  "S05-openai-pricing-shared-window.png",
  "S06-9to5mac-announcement-chronology.png",
  "S07-openai-community-plus-user-observation.png",
  "S08-openai-community-interruption-report.png",
];

for (const source of expectedSources) {
  expect(
    fs.existsSync(path.join(packageDir, "sources", source)),
    `missing source capture ${source}`,
  );
}

const byType = Object.fromEntries(
  [...allowedTypes]
    .map((type) => [
      type,
      payload.blocks.filter((block) => block.type === type).length,
    ])
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
      sourceCaptures: expectedSources.length,
      seoTitleLength: payload.seoTitle.length,
      seoDescriptionLength: payload.seoDescription.length,
    },
    null,
    2,
  ),
);

if (errors.length > 0) process.exitCode = 1;
