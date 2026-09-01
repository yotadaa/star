import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const packageDir = path.dirname(fileURLToPath(import.meta.url));
const payload = JSON.parse(fs.readFileSync(path.join(packageDir, "payload.json"), "utf8"));
const draft = fs.readFileSync(path.join(packageDir, "draft.md"), "utf8");

const expectedAssets = [
  {
    file: "assets/codex-limit-boundary-feature.png",
    sha256: "eb7df147378eb3e9ef5d3a53b816fadada2175ee577517a6841454d623a66c36",
    width: 1672,
    height: 941,
  },
  {
    file: "assets/evidence-community-aug27-immediate-stop.jpg",
    sha256: "d15c8be620636a50f35b8bd2792bfbccda45e1afee7f5620972b211ee80cf9ba",
    width: 1265,
    height: 720,
  },
];

const fail = (message) => {
  throw new Error(message);
};

const readDimensions = (bytes) => {
  if (bytes.subarray(1, 4).toString("ascii") === "PNG") {
    return { width: bytes.readUInt32BE(16), height: bytes.readUInt32BE(20) };
  }
  if (bytes[0] === 0xff && bytes[1] === 0xd8) {
    let offset = 2;
    while (offset + 9 < bytes.length) {
      if (bytes[offset] !== 0xff) {
        offset += 1;
        continue;
      }
      const marker = bytes[offset + 1];
      const segmentLength = bytes.readUInt16BE(offset + 2);
      if (marker >= 0xc0 && marker <= 0xc3) {
        return {
          width: bytes.readUInt16BE(offset + 7),
          height: bytes.readUInt16BE(offset + 5),
        };
      }
      offset += 2 + segmentLength;
    }
  }
  fail("Unsupported image format.");
};

if (payload.status !== "published") fail("Payload must be publishable.");
if (payload.publishedAt !== "2026-08-30T16:36:01+07:00") {
  fail("publishedAt must match the authorized publication decision.");
}
if (payload.title !== draft.match(/^#\s+(.+)$/m)?.[1]) fail("Draft and payload titles differ.");
if (payload.seoTitle.length > 70) fail("SEO title is longer than 70 characters.");
if (payload.seoDescription.length > 180) fail("SEO description is longer than 180 characters.");
if (!Array.isArray(payload.blocks) || payload.blocks.length < 20) fail("Native blocks are missing.");
if (!payload.blocks.some((block) => block.type === "table")) fail("Comparison table is missing.");

const images = payload.blocks.filter((block) => block.type === "image");
if (images.length !== 2) fail(`Expected 2 image blocks; received ${images.length}.`);
for (const image of images) {
  if (!image.alt || image.alt.length < 24) fail(`Weak alt text for ${image.assetKey}.`);
  if (!(image.width > 0 && image.height > 0)) fail(`Missing dimensions for ${image.assetKey}.`);
}

for (const asset of expectedAssets) {
  const bytes = fs.readFileSync(path.join(packageDir, asset.file));
  const digest = crypto.createHash("sha256").update(bytes).digest("hex");
  if (digest !== asset.sha256) fail(`Checksum mismatch for ${asset.file}.`);
  const dimensions = readDimensions(bytes);
  if (dimensions.width !== asset.width || dimensions.height !== asset.height) {
    fail(`Dimension mismatch for ${asset.file}.`);
  }
}

for (const phrase of ["Research note:", "Sources were checked through"]) {
  if (draft.toLowerCase().includes(phrase.toLowerCase())) fail(`Rejected phrase found: ${phrase}`);
}

console.log(
  JSON.stringify(
    {
      status: payload.status,
      slug: payload.slug,
      blocks: payload.blocks.length,
      headings: payload.blocks.filter((block) => block.type === "heading").length,
      images: images.length,
      seoTitleChars: payload.seoTitle.length,
      seoDescriptionChars: payload.seoDescription.length,
      assets: expectedAssets,
    },
    null,
    2,
  ),
);
