import assert from "node:assert/strict";
import { writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright-core";

const here = path.dirname(fileURLToPath(import.meta.url));
const baseUrl = process.env.STAR_BASE_URL || "http://127.0.0.1:3123";

function attribute(tag, name) {
  const match = tag.match(new RegExp(`\\s${name}\\s*=\\s*(?:"([^"]*)"|'([^']*)'|([^\\s>]+))`, "i"));
  return match?.[1] ?? match?.[2] ?? match?.[3] ?? "";
}

function metaContent(html, name) {
  for (const match of html.matchAll(/<meta\b[^>]*>/gi)) {
    if (attribute(match[0], "name").toLowerCase() === name.toLowerCase()) {
      return attribute(match[0], "content");
    }
  }
  return "";
}

function documentTitle(html) {
  return html.match(/<title\b[^>]*>([\s\S]*?)<\/title>/i)?.[1]?.replace(/\s+/g, " ").trim() || "";
}

function jsonLd(html) {
  return [...html.matchAll(/<script\b[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)]
    .map((match) => JSON.parse(match[1]));
}

async function pageHtml(pathname) {
  const response = await fetch(`${baseUrl}${pathname}`);
  assert.equal(response.status, 200, `${pathname} must return HTTP 200`);
  return response.text();
}

const metadataRows = [
  ["/", 160],
  ["/about", 160],
  ["/blog/did-google-august-2026-spam-update-target-ai-content", 160],
  ["/blog/changing-ai-model-mid-session-cost", 160],
  ["/blog/ox-alpha-was-glm-5-3-flash", 160],
];

const metadata = [];
for (const [pathname, limit] of metadataRows) {
  const html = await pageHtml(pathname);
  const title = documentTitle(html);
  const description = metaContent(html, "description");
  assert.ok(description.length > 0 && description.length <= limit, `${pathname} description is ${description.length} characters`);
  metadata.push({ pathname, title, titleLength: title.length, description, descriptionLength: description.length });

  if (pathname.includes("ox-alpha-was-glm-5-3-flash")) {
    assert.ok(title.length <= 60, `Ox Alpha document title is ${title.length} characters`);
    const graph = jsonLd(html).flatMap((value) => value?.["@graph"] || value);
    const posting = graph.find((value) => value?.["@type"] === "BlogPosting");
    assert.equal(posting?.description, description, "BlogPosting and meta descriptions must remain aligned");
    assert.equal(
      posting?.headline,
      "Ox Alpha Was GLM-5.3-Flash: What Z.ai Confirmed and What It Didn't",
      "The visible editorial headline must not be shortened with the SEO title",
    );
  }
}

const sitemapBlogXml = await pageHtml("/sitemap-blog.xml");
const paginationSitemapUrls = [...sitemapBlogXml.matchAll(/<loc>([^<]+\?page=\d+)<\/loc>/g)]
  .map((match) => match[1].replace("&amp;", "&"));
assert.deepEqual(paginationSitemapUrls, [
  "https://me.mukhtada.my.id/blog?page=2",
  "https://me.mukhtada.my.id/blog?page=3",
  "https://me.mukhtada.my.id/blog?page=4",
]);

const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({ viewport: { width: 1280, height: 900 } });
const page = await context.newPage();

async function articleHrefs(slug) {
  await page.goto(`${baseUrl}/blog/${slug}`, { waitUntil: "networkidle", timeout: 60_000 });
  return page.locator("#blog-article-content a").evaluateAll((links) => links.map((link) => link.href));
}

const instagramLinks = await articleHrefs("instagram-real-content-labeled-ai");
const moltbookLinks = await articleHrefs("moltbook-ai-agents-social-network");
const portfolioLinks = await articleHrefs("mukhtadas-portfolio");
const redirectLinks = {
  instagram: instagramLinks.filter((href) => href.includes("415163d053ed915042a04f1ec3d9eafa")),
  moltbook: moltbookLinks.filter((href) => href.includes("69855ab843a5597577120aac99efde9a")),
  portfolio: portfolioLinks.filter((href) => {
    const pathname = new URL(href).pathname;
    return pathname.endsWith("/tree/main/validation/convex-world-chat")
      || pathname.endsWith("/tree/main/validation/manage-world-chat-nala-seo");
  }),
};

assert.deepEqual(redirectLinks.instagram, [
  "https://apnews.com/article/meta-adds-labels-to-ai-imagery-deepfakes-415163d053ed915042a04f1ec3d9eafa",
]);
assert.deepEqual(redirectLinks.moltbook, [
  "https://apnews.com/article/moltbook-autonomous-ai-agents-openclaw-69855ab843a5597577120aac99efde9a",
]);
assert.equal(redirectLinks.portfolio.length, 2);
assert.ok(redirectLinks.portfolio.every((href) => href.includes("/tree/main/") && !href.includes("/blob/main/")));

const directLinkStatuses = await Promise.all(
  [...redirectLinks.instagram, ...redirectLinks.moltbook, ...redirectLinks.portfolio].map(async (url) => {
    const response = await fetch(url, {
      redirect: "manual",
      headers: { "user-agent": "Mozilla/5.0 (compatible; StarSeoAudit/1.0)" },
    });
    return { url, status: response.status, location: response.headers.get("location") || "" };
  }),
);
assert.ok(directLinkStatuses.every(({ status, location }) => status === 200 && !location));

const caelestiaRequests = [];
page.on("request", (request) => caelestiaRequests.push(request.url()));
await page.goto(`${baseUrl}/blog/caelestia-island-suite`, { waitUntil: "networkidle", timeout: 60_000 });
const caelestia = await page.evaluate(() => ({
  previewCount: document.querySelectorAll(".blog-image-preview-trigger img").length,
  optimizedPreviews: [...document.querySelectorAll(".blog-image-preview-trigger img")]
    .every((image) => image.src.includes("/_next/image?") && image.srcset.includes("/_next/image?")),
  dialogImageCount: document.querySelectorAll(".blog-image-preview-dialog img").length,
  firstPreviewAlt: document.querySelector(".blog-image-preview-trigger img")?.alt,
}));
assert.equal(caelestia.previewCount, 6);
assert.equal(caelestia.optimizedPreviews, true);
assert.equal(caelestia.dialogImageCount, 0, "Fullscreen images must not mount before their dialog opens");
assert.ok(caelestia.firstPreviewAlt);
assert.equal(caelestiaRequests.filter((url) => url.startsWith("https://raw.githubusercontent.com/")).length, 0);

const firstPreview = page.locator(".blog-image-preview-trigger").first();
await firstPreview.focus();
await firstPreview.press("Enter");
await page.locator(".blog-image-preview-dialog[open]").waitFor();
assert.equal(await page.locator(".blog-image-preview-dialog img").count(), 1);
assert.ok((await page.locator(".blog-image-preview-dialog img").getAttribute("src")).includes("/_next/image?"));
await page.locator(".blog-image-preview-dialog[open] .blog-image-preview-shell header button").click();
assert.equal(await firstPreview.evaluate((element) => document.activeElement === element), true);

await browser.close();

const results = {
  metadata,
  paginationSitemapUrls,
  redirectLinks,
  directLinkStatuses,
  caelestia: {
    ...caelestia,
    rawClientRequests: caelestiaRequests.filter((url) => url.startsWith("https://raw.githubusercontent.com/")),
  },
};
await writeFile(path.join(here, "seo-audit.json"), `${JSON.stringify(results, null, 2)}\n`);
console.log(JSON.stringify(results, null, 2));
