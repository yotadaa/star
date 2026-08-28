import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const markdown = await fs.readFile(path.join(here, "draft.md"), "utf8");
const lines = markdown.split(/\r?\n/);

const imageMeta = {
  "blog:openai-bel-rumor-one-source-no-confirmation:feature-source-gap": { width: 1672, height: 941 },
  "blog:openai-bel-rumor-one-source-no-confirmation:evidence-original-bel-post": { width: 1265, height: 500 },
  "blog:openai-bel-rumor-one-source-no-confirmation:claim-status-matrix": { width: 1600, height: 1080 }
};

const blocks = [];
let paragraph = [];

function flushParagraph() {
  if (!paragraph.length) return;
  blocks.push({ type: "paragraph", text: paragraph.join(" ").replace(/\s+/g, " ").trim() });
  paragraph = [];
}

for (let index = 0; index < lines.length; index += 1) {
  const line = lines[index];
  if (index === 0 && line.startsWith("# ")) continue;
  if (!line.trim()) {
    flushParagraph();
    continue;
  }

  if (line.startsWith("## ")) {
    flushParagraph();
    blocks.push({ type: "heading", text: line.slice(3).trim() });
    continue;
  }

  const imageMatch = line.match(/^!\[([^\]]+)\]\(([^)]+)\)$/);
  if (imageMatch) {
    flushParagraph();
    const [, alt, assetKey] = imageMatch;
    const size = imageMeta[assetKey];
    if (!size) throw new Error(`Missing image metadata for ${assetKey}`);
    blocks.push({ type: "image", assetKey, alt, width: size.width, height: size.height });
    continue;
  }

  if (line.startsWith("*") && blocks.at(-1)?.type === "image") {
    flushParagraph();
    const captionLines = [line];
    while (!captionLines.at(-1).endsWith("*") || captionLines.length === 1 && captionLines[0].length === 1) {
      index += 1;
      if (index >= lines.length) throw new Error("Unclosed image caption");
      captionLines.push(lines[index]);
    }
    const caption = captionLines.join(" ").replace(/^\*/, "").replace(/\*$/, "").replace(/\s+/g, " ").trim();
    blocks.at(-1).text = caption;
    continue;
  }

  if (line.startsWith("|")) {
    flushParagraph();
    const tableLines = [line];
    while (lines[index + 1]?.startsWith("|")) {
      index += 1;
      tableLines.push(lines[index]);
    }
    const rows = tableLines
      .filter((row) => !/^\|(?:\s*:?-+:?\s*\|)+$/.test(row))
      .map((row) => row.slice(1, -1).split("|").map((cell) => cell.trim()));
    blocks.push({ type: "table", text: "Bel rumor claim verdicts", rows });
    continue;
  }

  paragraph.push(line.trim());
}

flushParagraph();

const payload = {
  title: "The OpenAI “Bel” Rumor: One Source, No Confirmation",
  slug: "openai-bel-rumor-one-source-no-confirmation",
  excerpt: "The viral Bel roadmap traces to one X post. OpenAI confirms Astra and live Stargate training capacity, but not Bel, Doug, 10T parameters, or a GPT-6 lineage.",
  status: "draft",
  tags: ["OpenAI", "Bel", "Astra", "Stargate", "AI Rumors"],
  readTime: "7 min read",
  coverTone: "research",
  sourceHref: "https://x.com/synthwavedd/status/2092326145270456377",
  seoTitle: "OpenAI Bel Rumor: One Source, No Confirmation",
  seoDescription: "The viral Bel roadmap traces to one X post. OpenAI confirms Astra and live Stargate training—but not Bel, Doug, 10T parameters, or a GPT-6 lineage.",
  language: "en-US",
  author: {
    id: "https://me.mukhtada.my.id/#person",
    name: "Mukhtada Billah NST",
    url: "https://me.mukhtada.my.id/"
  },
  articleSection: "AI Investigation",
  blocks
};

await fs.writeFile(path.join(here, "payload.json"), `${JSON.stringify(payload, null, 2)}\n`);
console.log(JSON.stringify({ blocks: blocks.length, images: blocks.filter((block) => block.type === "image").length, headings: blocks.filter((block) => block.type === "heading").length }, null, 2));
