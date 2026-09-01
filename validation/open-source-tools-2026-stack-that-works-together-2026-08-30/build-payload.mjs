import fs from "node:fs";
import path from "node:path";

const packageDir = path.dirname(new URL(import.meta.url).pathname);
const markdown = fs.readFileSync(path.join(packageDir, "draft.md"), "utf8");

const images = new Map([
  [
    "blog:open-source-tools-2026-stack-that-works-together:feature-toolbench",
    {
      width: 1672,
      height: 941,
      alt: "A worn wooden workbench holding a steel toolbox, magnifying glass, index cards, external drive, network cable, caliper, notebook, and terminal printout.",
    },
  ],
  [
    "blog:open-source-tools-2026-stack-that-works-together:evidence-opencode-terminal",
    {
      width: 1824,
      height: 1488,
      alt: "OpenCode terminal interface showing a coding request, repository searches, file reads, a clarification prompt, model details, and command controls.",
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

function tableDescription(header) {
  if (header[0] === "Layer") {
    return "A coherent open-source stack organized by repeated job and principal tradeoff";
  }
  if (header[0] === "Project") {
    return "Current project licenses and the practical boundary attached to each selection";
  }
  return "Comparison table";
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
      const header = tableCells(line);
      const rows = [header];
      index += 2;
      while (index < lines.length && lines[index].trim().startsWith("|")) {
        rows.push(tableCells(lines[index].trim()));
        index += 1;
      }
      blocks.push({ type: "table", text: tableDescription(header), rows });
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
  "blog:open-source-tools-2026-stack-that-works-together:feature-toolbench";
const featured = images.get(featuredAssetKey);

const payload = {
  title: "Open-Source Tools for 2026: A Stack That Works Together",
  slug: "open-source-tools-2026-stack-that-works-together",
  excerpt:
    "Eleven open-source tools can form one durable 2026 stack across code search, Python, documents, analytics, agents, sync, and backup—if their boundaries stay visible.",
  status: "published",
  publishedAt: "2026-08-30T22:31:00+07:00",
  tags: ["Open Source", "Developer Tools", "AI Agents", "Data Tools", "Self-Hosting"],
  readTime: "11 min read",
  coverTone: "research",
  sourceHref: "https://www.github-trending-archives.com/d/2026-08-29",
  seoTitle: "11 Open-Source Tools for a Practical 2026 Stack",
  seoDescription:
    "Compare 11 open-source tools for 2026 across code search, Python, documents, analytics, AI agents, sync, backup, licenses, permissions, and tradeoffs.",
  language: "en-US",
  author: {
    id: "https://me.mukhtada.my.id/#person",
    name: "Mukhtada Billah NST",
    url: "https://me.mukhtada.my.id/",
  },
  articleSection: "Research Note",
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
    hasPublishedAt: Object.hasOwn(payload, "publishedAt"),
    blocks: payload.blocks.length,
    images: payload.blocks.filter((block) => block.type === "image").length,
    headings: payload.blocks.filter((block) => block.type === "heading").length,
    tables: payload.blocks.filter((block) => block.type === "table").length,
    lists: payload.blocks.filter((block) => block.type === "list").length,
  }),
);
