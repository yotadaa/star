import fs from "node:fs";
import path from "node:path";

function tableCells(line) {
  return line.replace(/^\|/, "").replace(/\|$/, "").split("|").map((cell) => cell.trim());
}

function isTableDivider(line) {
  return /^\|?(?:\s*:?-{3,}:?\s*\|)+\s*$/.test(line);
}

function cleanCaption(line) {
  return line.replace(/^\*/, "").replace(/\*$/, "").trim();
}

export function parseNativeBlocks(markdown, images) {
  const lines = markdown.split(/\r?\n/);
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
      index += 1;
      blocks.push({ type: "code", text: code.join("\n") });
      continue;
    }
    const imageMatch = line.match(/^!\[(.+?)\]\(asset:\/\/(.+?)\)$/);
    if (imageMatch) {
      const [, markdownAlt, assetKey] = imageMatch;
      const image = images[assetKey];
      if (!image) throw new Error(`Unknown image asset: ${assetKey}`);
      let cursor = index + 1;
      while (cursor < lines.length && !lines[cursor].trim()) cursor += 1;
      const captionLine = lines[cursor]?.trim() || "";
      const caption = /^\*.+\*$/.test(captionLine) ? cleanCaption(captionLine) : image.caption;
      blocks.push({ type: "image", assetKey, alt: markdownAlt || image.alt, width: image.width, height: image.height, text: caption || "Editorial image." });
      index = /^\*.+\*$/.test(captionLine) ? cursor + 1 : index + 1;
      continue;
    }
    if (line.startsWith("|") && lines[index + 1] && isTableDivider(lines[index + 1].trim())) {
      const rows = [tableCells(line)];
      index += 2;
      while (index < lines.length && lines[index].trim().startsWith("|")) {
        rows.push(tableCells(lines[index].trim()));
        index += 1;
      }
      blocks.push({ type: "table", text: rows[0].join(" / "), rows });
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

export function buildNativePayload(packageDir, config) {
  const markdown = fs.readFileSync(path.join(packageDir, "draft.md"), "utf8");
  const blocks = parseNativeBlocks(markdown, config.images);
  const featured = config.images[config.featuredAssetKey];
  if (!featured) throw new Error(`Missing featured image ${config.featuredAssetKey}`);
  const payload = {
    title: config.title,
    slug: config.slug,
    excerpt: config.excerpt,
    status: "published",
    publishedAt: config.publishedAt,
    tags: config.tags,
    readTime: `${Math.max(1, Math.ceil(markdown.split(/\s+/).filter(Boolean).length / 225))} min read`,
    coverTone: config.coverTone || "research",
    sourceHref: config.sourceHref,
    seoTitle: config.seoTitle,
    seoDescription: config.seoDescription,
    language: config.language,
    author: {
      id: "https://me.mukhtada.my.id/#person",
      name: "Mukhtada Billah NST",
      url: "https://me.mukhtada.my.id/",
    },
    articleSection: config.articleSection,
    featuredImage: { assetKey: config.featuredAssetKey, alt: featured.alt, width: featured.width, height: featured.height },
    blocks,
  };
  fs.writeFileSync(path.join(packageDir, "payload.json"), `${JSON.stringify(payload, null, 2)}\n`);
  return payload;
}
