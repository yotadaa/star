import assert from "node:assert/strict";
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";

const packageDir = path.dirname(new URL(import.meta.url).pathname);
const read = (name) => fs.readFileSync(path.join(packageDir, name), "utf8");
const payload = JSON.parse(read("payload.json"));
const draft = read("draft.md");
const sourceLedger = read("source-ledger.md");
const claimLedger = read("claim-ledger.md");

assert.equal(payload.status, "published");
assert.ok(Number.isFinite(Date.parse(payload.publishedAt)));
assert.equal(payload.readTime, "11 min read");
assert.equal(payload.articleSection, "Research Note");
assert.ok(payload.seoTitle.length <= 70);
assert.ok(payload.seoDescription.length <= 180);
assert.ok(payload.excerpt.length <= 180);

const imageBlocks = payload.blocks.filter((block) => block.type === "image");
assert.equal(imageBlocks.length, 2);
for (const block of imageBlocks) {
  assert.ok(block.assetKey.startsWith(`blog:${payload.slug}:`));
  assert.ok(block.alt.length >= 40);
  assert.ok(block.width > 0 && block.height > 0);
  assert.ok(block.text.length > 0);
  assert.equal(Object.hasOwn(block, "src"), false);
  assert.equal(Object.hasOwn(block, "storageId"), false);
}

const featured = imageBlocks.find(
  (block) => block.assetKey === payload.featuredImage.assetKey,
);
assert.ok(featured);
assert.deepEqual(
  {
    assetKey: featured.assetKey,
    alt: featured.alt,
    width: featured.width,
    height: featured.height,
  },
  payload.featuredImage,
);

const forbiddenBodyPatterns = [
  /\b(?:i|we|you|your|our|ours|my|me)\b/i,
  /research note/i,
  /this (?:investigation|article|research)/i,
  /sources? (?:were|was) (?:checked|gathered)/i,
  /methodolog|screenshot|ledger|cutoff/i,
];
for (const pattern of forbiddenBodyPatterns) {
  assert.equal(pattern.test(draft), false, `Forbidden body pattern: ${pattern}`);
}

const links = [...draft.matchAll(/https:\/\/[^\s)]+/g)].map((match) => match[0]);
const uniqueLinks = new Set(links);
const sourceRows = [...sourceLedger.matchAll(/^\| S\d+/gm)];
const claimRows = [...claimLedger.matchAll(/^\| C\d+/gm)];
assert.equal(uniqueLinks.size, 23);
assert.equal(sourceRows.length, 23);
assert.equal(claimRows.length, 22);

const sourceDir = path.join(packageDir, "sources");
const sourceScreenshots = fs
  .readdirSync(sourceDir)
  .filter((name) => name.endsWith(".png"));
assert.equal(sourceScreenshots.length, 24);
for (const name of sourceScreenshots) {
  assert.ok(fs.statSync(path.join(sourceDir, name)).size > 50_000);
}

const assets = [
  {
    name: "feature-open-source-toolbench.png",
    sha256: "71632f0fc6a178fac47e4fb20914b7c7200121a386d9b2f9a271661c3d46119f",
  },
  {
    name: "evidence-opencode-terminal-ui.png",
    sha256: "14b01372a2589a120ab0d6a0510868e71bceadcbd1f1278fb099d700a03912cb",
  },
];
for (const asset of assets) {
  const bytes = fs.readFileSync(path.join(packageDir, "assets", asset.name));
  assert.equal(crypto.createHash("sha256").update(bytes).digest("hex"), asset.sha256);
}

const counts = {
  words: draft.trim().split(/\s+/).length,
  claims: claimRows.length,
  sources: sourceRows.length,
  sourceScreenshots: sourceScreenshots.length,
  articleImages: imageBlocks.length,
  nativeBlocks: payload.blocks.length,
  headings: payload.blocks.filter((block) => block.type === "heading").length,
  paragraphs: payload.blocks.filter((block) => block.type === "paragraph").length,
  lists: payload.blocks.filter((block) => block.type === "list").length,
  tables: payload.blocks.filter((block) => block.type === "table").length,
  uniqueLinks: uniqueLinks.size,
};

console.log(JSON.stringify({ verdict: "PASS", status: payload.status, counts }));
