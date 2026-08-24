import { SpriteIcon } from "@/components/claude";
import { isRenderableBlogImageSource } from "@/lib/blog/featuredImage";
import BlogFlowchart from "./BlogFlowchart";
import BlogImageCarousel from "./BlogImageCarousel";
import BlogImagePreview from "./BlogImagePreview";
import BlogInlineText from "./BlogInlineText";

function groupConsecutiveImages(blocks) {
  const grouped = [];
  let index = 0;

  while (index < blocks.length) {
    if (blocks[index]?.type !== "image") {
      grouped.push({ ...blocks[index], sourceIndex: index });
      index += 1;
      continue;
    }

    const startIndex = index;
    const images = [];
    while (index < blocks.length && blocks[index]?.type === "image") {
      images.push(blocks[index]);
      index += 1;
    }
    grouped.push(
      images.length > 1
        ? { type: "image-carousel", images, sourceIndex: startIndex }
        : { ...images[0], sourceIndex: startIndex },
    );
  }

  return grouped;
}

function BlogCodeText({ children }) {
  return String(children || "").split(/([\w./-]+\.md)\b/gi).map((part, index) => (
    /\.md$/i.test(part)
      ? <span className="blog-markdown-file" key={`${part}-${index}`}>{part}</span>
      : part
  ));
}

export default function BlogPostRenderer({ blocks = [], sourceHref }) {
  return (
    <div className="blog-renderer">
      {groupConsecutiveImages(blocks).map((block, index) => {
        if (block.type === "image-carousel") {
          return <BlogImageCarousel images={block.images} sourceHref={sourceHref} key={`image-carousel-${block.sourceIndex}`} />;
        }
        if (block.type === "heading") {
          return <h2 key={`${block.type}-${index}`}><BlogInlineText baseHref={sourceHref}>{block.text}</BlogInlineText></h2>;
        }
        if (block.type === "quote") {
          return (
            <blockquote key={`${block.type}-${index}`}>
              <SpriteIcon id="icon-editor-blocks" size={18} />
              <span><BlogInlineText baseHref={sourceHref}>{block.text}</BlogInlineText></span>
            </blockquote>
          );
        }
        if (block.type === "list") {
          const items = String(block.text || "")
            .split(/\n+/)
            .map((item) => item.trim())
            .filter(Boolean);
          const ordered = items.length > 0 && items.every((item) => /^\d+[.)]\s+/.test(item));
          const List = ordered ? "ol" : "ul";
          return (
            <List key={`${block.type}-${index}`}>
              {items.map((item, itemIndex) => {
                const value = ordered ? item.replace(/^\d+[.)]\s+/, "") : item.replace(/^[-+*]\s+/, "");
                return <li key={`${item}-${itemIndex}`}><BlogInlineText baseHref={sourceHref}>{value}</BlogInlineText></li>;
              })}
            </List>
          );
        }
        if (block.type === "code") {
          if (/^\s*(?:flowchart|graph)\s+(?:LR|RL|TD|TB|BT)\b/i.test(String(block.text || ""))) {
            return <BlogFlowchart source={block.text} key={`${block.type}-${index}`} />;
          }
          return (
            <figure className="blog-code-block" key={`${block.type}-${index}`}>
              <figcaption>Code excerpt</figcaption>
              <pre><code><BlogCodeText>{block.text}</BlogCodeText></code></pre>
            </figure>
          );
        }
        if (block.type === "image") {
          const source = String(block.src || "").trim();
          const canRender = isRenderableBlogImageSource(source);
          const description = String(block.alt || block.text || "").trim();
          return (
            <figure className={`blog-renderer-image${canRender ? " has-image" : ""}`} key={`${block.type}-${index}`}>
              {canRender ? (
                <BlogImagePreview
                  src={source}
                  alt={description}
                  caption={block.text}
                />
              ) : (
                <SpriteIcon id="icon-image" size={28} />
              )}
              {block.text ? <figcaption><BlogInlineText baseHref={sourceHref}>{block.text}</BlogInlineText></figcaption> : null}
            </figure>
          );
        }
        if (block.type === "divider") {
          return <hr key={`${block.type}-${index}`} />;
        }
        if (block.type === "table") {
          const rows = Array.isArray(block.rows) && block.rows.length ? block.rows : [["Column 1", "Column 2"], ["Value", "Value"]];
          return (
            <div className="blog-table-shell" key={`${block.type}-${index}`} tabIndex={0} role="region" aria-label={block.text || "Article data table"}>
              <table className="blog-renderer-table">
                {block.text ? <caption><BlogInlineText baseHref={sourceHref}>{block.text}</BlogInlineText></caption> : null}
                <thead>
                  <tr>
                    {rows[0].map((cell, cellIndex) => (
                      <th scope="col" key={`${cell}-${cellIndex}`}><BlogInlineText baseHref={sourceHref}>{cell}</BlogInlineText></th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {rows.slice(1).map((row, rowIndex) => (
                    <tr key={`row-${rowIndex + 1}`}>
                      {row.map((cell, cellIndex) => <td key={`${cell}-${cellIndex}`}><BlogInlineText baseHref={sourceHref}>{cell}</BlogInlineText></td>)}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          );
        }
        if (block.type === "icon") {
          return (
            <p className="blog-renderer-iconline" key={`${block.type}-${index}`}>
              <SpriteIcon id="icon-star-level" size={18} />
              <span><BlogInlineText baseHref={sourceHref}>{block.text}</BlogInlineText></span>
            </p>
          );
        }
        return <p key={`${block.type}-${index}`}><BlogInlineText baseHref={sourceHref}>{block.text}</BlogInlineText></p>;
      })}
    </div>
  );
}
