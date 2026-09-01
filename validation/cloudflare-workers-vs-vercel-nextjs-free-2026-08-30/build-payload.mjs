import fs from "node:fs";
import path from "node:path";

const packageDir = path.dirname(new URL(import.meta.url).pathname);
const markdown = fs.readFileSync(path.join(packageDir, "draft.md"), "utf8");

const images = new Map([
  [
    "blog:cloudflare-workers-vs-vercel-nextjs-free:feature-two-paths",
    {
      width: 1672,
      height: 941,
      alt: "A kraft project folder connected by black cords to a paper routing tray and a padded equipment case on a worn workbench.",
    },
  ],
  [
    "blog:cloudflare-workers-vs-vercel-nextjs-free:evidence-vinext-default",
    {
      width: 1600,
      height: 900,
      alt: "Diagram showing Cloudflare's Next.js guidance moving from an OpenNext-centered path to beta vinext for new projects, while retaining OpenNext for existing deployments that cannot migrate.",
    },
  ],
  [
    "blog:cloudflare-workers-vs-vercel-nextjs-free:comparison-boundaries",
    {
      width: 1600,
      height: 1000,
      alt: "Two-column comparison of Cloudflare Workers Free and Vercel Hobby across traffic, compute, server bundle, builds, and plan policy.",
    },
  ],
]);

function cleanCaption(line) {
  return line.replace(/^\*/, "").replace(/\*$/, "").trim();
}

function tableCells(line) {
  return line.replace(/^\|/, "").replace(/\|$/, "").split("|").map((cell) => cell.trim());
}

function isTableDivider(line) {
  return /^\|?(?:\s*:?-{3,}:?\s*\|)+\s*$/.test(line);
}

function parseBlocks(source) {
  const lines = source.split(/\r?\n/);
  const blocks = [];
  let index = 0;

  while (index < lines.length) {
    const line = lines[index].trim();
    if (!line || /^#\s+/.test(line)) {
      index += 1;
      continue;
    }
    if (line.startsWith("## ")) {
      blocks.push({ type: "heading", text: line.slice(3).trim() });
      index += 1;
      continue;
    }
    if (line.startsWith("```")) {
      const code = [];
      index += 1;
      while (index < lines.length && !lines[index].trim().startsWith("```")) {
        code.push(lines[index]);
        index += 1;
      }
      blocks.push({ type: "code", text: code.join("\n").trim() });
      index += 1;
      continue;
    }
    const imageMatch = line.match(/^!\[(.+?)\]\(asset:\/\/(.+?)\)$/);
    if (imageMatch) {
      const [, markdownAlt, assetKey] = imageMatch;
      const image = images.get(assetKey);
      if (!image) throw new Error(`Unknown image asset: ${assetKey}`);
      let cursor = index + 1;
      while (cursor < lines.length && !lines[cursor].trim()) cursor += 1;
      const captionLine = lines[cursor]?.trim() || "";
      const caption = /^\*.+\*$/.test(captionLine) ? cleanCaption(captionLine) : "";
      blocks.push({ type: "image", assetKey, alt: markdownAlt || image.alt, width: image.width, height: image.height, text: caption });
      index = caption ? cursor + 1 : index + 1;
      continue;
    }
    if (line.startsWith("|") && lines[index + 1] && isTableDivider(lines[index + 1].trim())) {
      const rows = [tableCells(line)];
      index += 2;
      while (index < lines.length && lines[index].trim().startsWith("|")) {
        rows.push(tableCells(lines[index].trim()));
        index += 1;
      }
      blocks.push({ type: "table", text: "Current free-plan boundaries for Next.js deployment", rows });
      continue;
    }
    if (/^\d+\.\s+/.test(line)) {
      const items = [];
      while (index < lines.length && /^\d+\.\s+/.test(lines[index].trim())) {
        items.push(lines[index].trim());
        index += 1;
      }
      blocks.push({ type: "list", text: items.join("\n") });
      continue;
    }
    const paragraph = [line];
    index += 1;
    while (index < lines.length && lines[index].trim()) {
      const next = lines[index].trim();
      if (next.startsWith("## ") || next.startsWith("```") || next.startsWith("|") || next.startsWith("![") || /^\d+\.\s+/.test(next)) break;
      paragraph.push(next);
      index += 1;
    }
    blocks.push({ type: "paragraph", text: paragraph.join(" ") });
  }
  return blocks;
}

const blocks = parseBlocks(markdown);
const featuredAssetKey = "blog:cloudflare-workers-vs-vercel-nextjs-free:feature-two-paths";
const featured = images.get(featuredAssetKey);
const payload = {
  title: "Cloudflare Workers vs Vercel for Free Next.js: The Tradeoff Changed",
  slug: "cloudflare-workers-vs-vercel-nextjs-free",
  excerpt: "Cloudflare Workers Free and Vercel Hobby reward different Next.js workloads. The decisive tradeoffs are vinext compatibility, server headroom, traffic meters, and plan policy.",
  status: "published",
  publishedAt: "2026-08-30T22:30:00+07:00",
  tags: ["Next.js", "Cloudflare Workers", "Vercel", "vinext", "OpenNext"],
  readTime: "8 min read",
  coverTone: "research",
  sourceHref: "https://developers.cloudflare.com/workers/framework-guides/web-apps/nextjs/",
  seoTitle: "Cloudflare Workers vs Vercel for Free Next.js",
  seoDescription: "Compare Cloudflare Workers Free and Vercel Hobby for Next.js: vinext compatibility, static traffic, function limits, build quotas, plan policy, pros, and cons.",
  language: "en-US",
  author: {
    id: "https://me.mukhtada.my.id/#person",
    name: "Mukhtada Billah NST",
    url: "https://me.mukhtada.my.id/",
  },
  articleSection: "Research Note",
  featuredImage: { assetKey: featuredAssetKey, alt: featured.alt, width: featured.width, height: featured.height },
  blocks,
};

fs.writeFileSync(path.join(packageDir, "payload.json"), `${JSON.stringify(payload, null, 2)}\n`);
console.log(JSON.stringify({ slug: payload.slug, status: payload.status, blocks: payload.blocks.length, images: payload.blocks.filter((block) => block.type === "image").length, headings: payload.blocks.filter((block) => block.type === "heading").length }));
