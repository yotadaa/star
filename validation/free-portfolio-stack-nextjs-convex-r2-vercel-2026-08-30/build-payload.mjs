import fs from "node:fs";
import path from "node:path";

const packageDir = path.dirname(new URL(import.meta.url).pathname);
const markdown = fs.readFileSync(path.join(packageDir, "draft.md"), "utf8");

const images = new Map([
  [
    "blog:free-portfolio-stack-nextjs-convex-r2-vercel:feature-workbench-stack",
    {
      width: 1672,
      height: 941,
      alt: "A wooden workbench with printed portfolio pages, an index-card box, and a metal media case connected by black cords.",
    },
  ],
  [
    "blog:free-portfolio-stack-nextjs-convex-r2-vercel:evidence-r2-checkout",
    {
      width: 1430,
      height: 894,
      alt: "Cloudflare R2 documentation stating that an R2 subscription and checkout are required before use and that usage is billed monthly.",
    },
  ],
  [
    "blog:free-portfolio-stack-nextjs-convex-r2-vercel:evidence-r2-free-tier",
    {
      width: 1430,
      height: 894,
      alt: "Cloudflare R2 documentation showing 10 GB-month storage, one million Class A operations, ten million Class B operations, and free Internet egress in the Standard free tier.",
    },
  ],
  [
    "blog:free-portfolio-stack-nextjs-convex-r2-vercel:evidence-live-portfolio",
    {
      width: 1425,
      height: 891,
      alt: "The live Mukhtada portfolio home page with a navigation bar, centered introduction, and two call-to-action buttons.",
    },
  ],
]);

function cleanCaption(line) {
  return line.replace(/^\*/, "").replace(/\*$/, "").trim();
}

function tableCells(line) {
  return line
    .replace(/^\|/, "")
    .replace(/\|$/, "")
    .split("|")
    .map((cell) => cell.trim());
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
      blocks.push({
        type: "image",
        assetKey,
        alt: markdownAlt || image.alt,
        width: image.width,
        height: image.height,
        text: caption,
      });
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
      blocks.push({
        type: "table",
        text: "Current free-plan allowances and the boundary attached to each layer",
        rows,
      });
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
      if (
        next.startsWith("## ")
        || next.startsWith("```")
        || next.startsWith("|")
        || next.startsWith("![")
        || /^\d+\.\s+/.test(next)
      ) break;
      paragraph.push(next);
      index += 1;
    }
    blocks.push({ type: "paragraph", text: paragraph.join(" ") });
  }

  return blocks;
}

const blocks = parseBlocks(markdown);
const featuredAssetKey =
  "blog:free-portfolio-stack-nextjs-convex-r2-vercel:feature-workbench-stack";
const featured = images.get(featuredAssetKey);

const payload = {
  title: "A Portfolio Stack That Can Stay at $0: Next.js, Convex, R2, and Vercel",
  slug: "free-portfolio-stack-nextjs-convex-r2-vercel",
  excerpt:
    "Next.js, Vercel, Convex, and R2 can keep portfolio infrastructure at $0, while R2 billing, a production domain, and free-tier limits still matter.",
  status: "published",
  publishedAt: "2026-08-30T18:35:45+07:00",
  tags: ["Next.js", "Convex", "Cloudflare R2", "Vercel", "Portfolio"],
  readTime: "10 min read",
  coverTone: "research",
  sourceHref: "https://vercel.com/templates/next.js/next-js-convex-template",
  seoTitle: "Free Portfolio Stack: Next.js, Convex, R2, and Vercel",
  seoDescription:
    "Build a $0 portfolio infrastructure stack with Next.js, Vercel, Convex, and R2. Compare free limits, R2 billing, domain setup, tradeoffs, and SEO.",
  language: "en-US",
  author: {
    id: "https://me.mukhtada.my.id/#person",
    name: "Mukhtada Billah NST",
    url: "https://me.mukhtada.my.id/",
  },
  articleSection: "Technical Case Study",
  featuredImage: {
    assetKey: featuredAssetKey,
    alt: featured.alt,
    width: featured.width,
    height: featured.height,
  },
  blocks,
};

fs.writeFileSync(
  path.join(packageDir, "payload.json"),
  `${JSON.stringify(payload, null, 2)}\n`,
);

console.log(
  JSON.stringify({
    slug: payload.slug,
    status: payload.status,
    blocks: payload.blocks.length,
    images: payload.blocks.filter((block) => block.type === "image").length,
    headings: payload.blocks.filter((block) => block.type === "heading").length,
  }),
);
