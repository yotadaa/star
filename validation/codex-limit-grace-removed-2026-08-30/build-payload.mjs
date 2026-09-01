import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const packageDir = path.dirname(fileURLToPath(import.meta.url));
const draftPath = path.join(packageDir, "draft.md");
const payloadPath = path.join(packageDir, "payload.json");
const markdown = fs.readFileSync(draftPath, "utf8").trim();
const chunks = markdown.split(/\n{2,}/);
const title = chunks.shift().replace(/^#\s+/, "");

const imageSpecs = {
  "assets/codex-limit-boundary-feature.png": {
    assetKey: "blog:codex-five-hour-limit-active-turns:feature-boundary-counter",
    width: 1672,
    height: 941,
    caption:
      "The brass stop separates a still-moving mechanism from the paper beyond it—the difference between finishing one turn and starting another.",
  },
  "assets/evidence-community-aug27-immediate-stop.jpg": {
    assetKey: "blog:codex-five-hour-limit-active-turns:evidence-community-immediate-stop",
    width: 1265,
    height: 720,
    caption:
      "The public post documents one immediate-stop observation and a recollection of earlier behavior. It does not establish prevalence or an announced policy.",
  },
};

const blocks = [];
for (let index = 0; index < chunks.length; index += 1) {
  const chunk = chunks[index].trim();
  if (!chunk) continue;

  if (chunk.startsWith("## ")) {
    blocks.push({ type: "heading", text: chunk.slice(3) });
    continue;
  }

  const imageMatch = chunk.match(/^!\[([^\]]+)\]\(([^)]+)\)$/);
  if (imageMatch) {
    const [, alt, file] = imageMatch;
    const spec = imageSpecs[file];
    if (!spec) throw new Error(`Missing image specification for ${file}`);
    let caption = spec.caption;
    const next = chunks[index + 1]?.trim() ?? "";
    if (/^\*[^*].*\*$/.test(next)) {
      caption = next.slice(1, -1);
      index += 1;
    }
    blocks.push({
      type: "image",
      text: caption,
      assetKey: spec.assetKey,
      alt,
      width: spec.width,
      height: spec.height,
    });
    continue;
  }

  if (chunk.startsWith("|")) {
    const rows = chunk
      .split("\n")
      .filter((line) => !/^\|(?:\s*:?-+:?\s*\|)+$/.test(line))
      .map((line) =>
        line
          .slice(1, -1)
          .split("|")
          .map((cell) => cell.trim()),
      );
    blocks.push({
      type: "table",
      text:
        rows[0]?.[0] === "Date"
          ? "Public reports before and after the alleged August behavior change"
          : "Observed boundary behaviors and the claims they can support",
      rows,
    });
    continue;
  }

  if (/^\d+\.\s/.test(chunk)) {
    blocks.push({ type: "list", text: chunk });
    continue;
  }

  blocks.push({ type: "paragraph", text: chunk.replace(/\n/g, " ") });
}

const payload = {
  title,
  slug: "codex-five-hour-limit-active-turns",
  excerpt:
    "Recent reports say some Codex tasks stop at the five-hour boundary, while OpenAI still promises conditional active-turn completion.",
  status: "published",
  publishedAt: "2026-08-30T16:36:01+07:00",
  tags: ["Codex", "Usage Limits", "AI Agents", "Product Policy"],
  readTime: "8 min read",
  coverTone: "research",
  sourceHref: "https://learn.chatgpt.com/docs/pricing",
  seoTitle: "Codex Five-Hour Limit: Why Are Some Runs Stopping?",
  seoDescription:
    "Recent Codex hard-stop reports conflict with OpenAI's active-turn promise. The evidence points to an enforcement mismatch, not a declared policy removal.",
  language: "en-US",
  author: {
    id: "https://me.mukhtada.my.id/#person",
    name: "Mukhtada Billah NST",
    url: "https://me.mukhtada.my.id/",
  },
  articleSection: "AI Investigation",
  featuredImage: {
    assetKey: imageSpecs["assets/codex-limit-boundary-feature.png"].assetKey,
    alt: "A worn mechanical counter feeds a paper strip into a brass stop beside a spool of thread and a blue pencil",
    width: 1672,
    height: 941,
  },
  blocks,
};

fs.writeFileSync(payloadPath, `${JSON.stringify(payload, null, 2)}\n`);
console.log(`Wrote ${payloadPath} with ${blocks.length} native blocks.`);
