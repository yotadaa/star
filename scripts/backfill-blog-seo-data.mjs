import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { ConvexHttpClient } from "convex/browser";
import { makeFunctionReference } from "convex/server";
import {
  BLOG_IMAGE_DIMENSIONS,
  blogImageKey,
  blogSeoDataForSlug,
} from "./blog-seo-data.mjs";
import { fetchImageDimensions } from "./image-dimensions.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const listBlogAdmin = makeFunctionReference("bridge:listBlogAdmin");
const updateBlog = makeFunctionReference("bridge:updateBlog");
const args = new Set(process.argv.slice(2));
const apply = args.has("--apply");
const printDimensions = args.has("--print-dimensions");
const verifyDimensions = args.has("--verify-dimensions");
const reportJson = args.has("--report-json");

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

function fail(message) {
  throw new Error(`BLOG_SEO_DATA_INVALID: ${message}`);
}

function positiveInteger(value) {
  const number = Number(value);
  return Number.isInteger(number) && number > 0 ? number : null;
}

function validHttpUrl(value) {
  try {
    const url = new URL(String(value || ""));
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

function durableImage(image = {}) {
  const width = positiveInteger(image.width);
  const height = positiveInteger(image.height);
  return {
    ...(image.storageId ? { storageId: image.storageId } : {}),
    ...(image.assetKey ? { assetKey: String(image.assetKey).trim() } : {}),
    ...(!image.storageId && !image.assetKey && image.src ? { src: String(image.src).trim() } : {}),
    alt: String(image.alt || image.text || "").trim(),
    ...(width ? { width } : {}),
    ...(height ? { height } : {}),
  };
}

function durableBlock(block = {}) {
  return {
    type: block.type,
    text: String(block.text || ""),
    ...(Array.isArray(block.rows) ? { rows: block.rows } : {}),
    ...(block.storageId ? { storageId: block.storageId } : {}),
    ...(block.assetKey ? { assetKey: String(block.assetKey).trim() } : {}),
    ...(!block.storageId && !block.assetKey && block.src ? { src: String(block.src).trim() } : {}),
    ...(block.alt ? { alt: String(block.alt).trim() } : {}),
    ...(positiveInteger(block.width) ? { width: positiveInteger(block.width) } : {}),
    ...(positiveInteger(block.height) ? { height: positiveInteger(block.height) } : {}),
  };
}

function enrichPost(post) {
  const editorial = blogSeoDataForSlug(post.slug);
  if (!editorial) fail(`${post.slug} is missing from BLOG_SEO_RECORDS`);
  if (!editorial.seoTitle || editorial.seoTitle.length > 70) fail(`${post.slug} has an invalid seoTitle`);
  if (!editorial.seoDescription || editorial.seoDescription.length > 180) fail(`${post.slug} has an invalid seoDescription`);
  if (!/^[a-z]{2,3}(?:-[A-Z]{2})?$/.test(editorial.language)) fail(`${post.slug} has an invalid language`);
  if (!editorial.author?.id || !editorial.author?.name || !validHttpUrl(editorial.author?.url)) {
    fail(`${post.slug} has an invalid author`);
  }
  if (!editorial.articleSection) fail(`${post.slug} has no articleSection`);

  const blocks = (post.blocks || []).map((block, index) => {
    const cleaned = durableBlock(block);
    if (block.type !== "image") return cleaned;
    const key = blogImageKey(block);
    const dimensions = BLOG_IMAGE_DIMENSIONS[key];
    if (!key) fail(`${post.slug} image ${index + 1} has no durable key or source`);
    if (!dimensions) fail(`${post.slug} image ${index + 1} has no measured dimensions for ${key}`);
    if (!cleaned.alt) fail(`${post.slug} image ${index + 1} has no alt text`);
    return {
      ...cleaned,
      width: dimensions.width,
      height: dimensions.height,
    };
  });

  const featuredSource = editorial.featuredImageKey
    ? blocks.find((block) => blogImageKey(block) === editorial.featuredImageKey)
    : null;
  if (post.status === "published" && !featuredSource) {
    fail(`${post.slug} has no matching featured image for ${editorial.featuredImageKey || "missing key"}`);
  }

  return {
    seoTitle: editorial.seoTitle,
    seoDescription: editorial.seoDescription,
    language: editorial.language,
    author: editorial.author,
    articleSection: editorial.articleSection,
    ...(featuredSource ? { featuredImage: durableImage(featuredSource) } : {}),
    blocks,
  };
}

function comparableCurrent(post) {
  return {
    seoTitle: post.seoTitle,
    seoDescription: post.seoDescription,
    language: post.language,
    author: post.author,
    articleSection: post.articleSection,
    ...(post.featuredImage ? { featuredImage: durableImage(post.featuredImage) } : {}),
    blocks: (post.blocks || []).map(durableBlock),
  };
}

function assertPostComplete(post) {
  const expected = enrichPost(post);
  if (JSON.stringify(comparableCurrent(post)) !== JSON.stringify(expected)) {
    fail(`${post.slug} does not match the checked-in SEO data manifest`);
  }
  if (!positiveInteger(post.dateModified)) fail(`${post.slug} has no machine dateModified`);
  if (post.status === "published") {
    const published = positiveInteger(post.datePublished);
    if (!published) fail(`${post.slug} has no machine datePublished`);
    if (post.dateModified < published) fail(`${post.slug} dateModified is earlier than datePublished`);
    if (!post.featuredImage?.src || !validHttpUrl(post.featuredImage.src)) {
      fail(`${post.slug} featured image does not resolve to an HTTP URL`);
    }
  }
}

function auditRow(post) {
  const imageBlocks = (post.blocks || []).filter((block) => block.type === "image");
  return {
    slug: post.slug,
    status: post.status,
    seoTitleLength: post.seoTitle.length,
    seoDescriptionLength: post.seoDescription.length,
    language: post.language,
    author: post.author.name,
    articleSection: post.articleSection,
    imageCount: imageBlocks.length,
    measuredImageCount: imageBlocks.filter((block) => positiveInteger(block.width) && positiveInteger(block.height)).length,
    featuredImage: post.featuredImage
      ? `${post.featuredImage.width}x${post.featuredImage.height}`
      : null,
    datePublished: post.datePublished ? new Date(post.datePublished).toISOString() : null,
    dateModified: new Date(post.dateModified).toISOString(),
  };
}

async function mapWithConcurrency(items, limit, mapper) {
  const results = new Array(items.length);
  let cursor = 0;
  async function worker() {
    while (cursor < items.length) {
      const index = cursor;
      cursor += 1;
      results[index] = await mapper(items[index], index);
    }
  }
  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, () => worker()));
  return results;
}

async function measureCurrentImages(posts, convexUrl) {
  const storageHost = new URL(convexUrl).host;
  const images = posts.flatMap((post) => (post.blocks || [])
    .filter((block) => block.type === "image")
    .map((block) => ({
      slug: post.slug,
      key: blogImageKey(block),
      src: block.src,
      stored: Boolean(block.storageId || block.assetKey),
    })));
  const missingSource = images.find((image) => !image.key || !validHttpUrl(image.src));
  if (missingSource) fail(`${missingSource.slug} has an image without a fetchable source`);
  for (const image of images) {
    if (!BLOG_IMAGE_DIMENSIONS[image.key]) fail(`${image.slug} has an image missing from the dimension manifest`);
    const source = new URL(image.src);
    if (source.protocol !== "https:") fail(`${image.slug} image source must use HTTPS`);
    if (image.stored && source.host !== storageHost) {
      fail(`${image.slug} stored image resolved outside the configured Convex host`);
    }
    if (!image.stored && image.src !== image.key) {
      fail(`${image.slug} external image does not match its checked-in source key`);
    }
  }

  const measured = await mapWithConcurrency(images, 4, async (image) => {
    const dimensions = await fetchImageDimensions(image.src);
    return [image.key, { width: dimensions.width, height: dimensions.height }];
  });
  const byKey = {};
  for (const [key, dimensions] of measured) {
    if (byKey[key] && JSON.stringify(byKey[key]) !== JSON.stringify(dimensions)) {
      fail(`${key} resolves to conflicting dimensions`);
    }
    byKey[key] = dimensions;
  }
  return Object.fromEntries(Object.entries(byKey).sort(([left], [right]) => left.localeCompare(right)));
}

async function main() {
  loadLocalEnv();
  const convexUrl = String(process.env.CONVEX_CLOUD_URL || "").trim().replace(/\/+$/, "");
  const secret = process.env.CONVEX_INTERNAL_API_KEY;
  if (!convexUrl) fail("CONVEX_CLOUD_URL is not configured");
  if (!secret) fail("CONVEX_INTERNAL_API_KEY is not configured");

  const client = new ConvexHttpClient(convexUrl);
  const posts = await client.action(listBlogAdmin, { secret, limit: 100 });
  if (!posts.length) fail("Convex returned no Blog records");
  const duplicate = posts.map((post) => post.slug).find((slug, index, slugs) => slugs.indexOf(slug) !== index);
  if (duplicate) fail(`duplicate slug returned by Convex: ${duplicate}`);

  if (printDimensions || verifyDimensions) {
    const dimensions = await measureCurrentImages(
      posts.filter((post) => post.status === "published"),
      convexUrl,
    );
    if (printDimensions) console.log(JSON.stringify(dimensions, null, 2));
    if (verifyDimensions) {
      for (const [key, measured] of Object.entries(dimensions)) {
        const expected = BLOG_IMAGE_DIMENSIONS[key];
        if (!expected || expected.width !== measured.width || expected.height !== measured.height) {
          fail(`${key} measured ${measured.width}x${measured.height}, expected ${expected ? `${expected.width}x${expected.height}` : "no manifest entry"}`);
        }
      }
      const unused = Object.keys(BLOG_IMAGE_DIMENSIONS).filter((key) => !dimensions[key]);
      if (unused.length) fail(`dimension manifest has ${unused.length} unused entries: ${unused.join(", ")}`);
      console.log(`Image audit passed: ${Object.keys(dimensions).length} encoded files match the checked-in dimensions.`);
    }
    return;
  }

  if (reportJson) {
    for (const post of posts) assertPostComplete(post);
    console.log(JSON.stringify(posts.map(auditRow), null, 2));
    return;
  }

  const changes = posts
    .map((post) => ({ post, target: enrichPost(post) }))
    .filter(({ post, target }) => JSON.stringify(comparableCurrent(post)) !== JSON.stringify(target));

  console.log(`${apply ? "Apply" : "Dry run"}: ${changes.length} of ${posts.length} Blog records require SEO data updates.`);
  for (const { post } of changes) console.log(`- ${post.slug}`);

  if (apply) {
    const actor = {
      key: "maintenance:blog-seo-data-v2",
      email: String(process.env.OWNER_EMAIL || "mukhtadanasution@gmail.com").trim().toLowerCase(),
      name: "Mukhtada Billah NST",
      role: "backend",
    };
    for (const { post, target } of changes) {
      const updated = await client.action(updateBlog, {
        secret,
        id: post.id,
        payload: target,
        actor,
      });
      if (!updated) fail(`${post.slug} disappeared during update`);
    }
  }

  const finalPosts = apply
    ? await client.action(listBlogAdmin, { secret, limit: 100 })
    : posts;
  if (apply || changes.length === 0) {
    for (const post of finalPosts) assertPostComplete(post);
    const imageCount = finalPosts.reduce(
      (count, post) => count + post.blocks.filter((block) => block.type === "image").length,
      0,
    );
    console.log(`Audit passed: ${finalPosts.length} records, ${imageCount} image blocks, zero missing SEO fields.`);
  }
}

await main();
