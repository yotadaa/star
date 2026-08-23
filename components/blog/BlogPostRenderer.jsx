import { SpriteIcon } from "@/components/claude";
import { isRenderableBlogImageSource } from "@/lib/blog/featuredImage";
import BlogImageCarousel from "./BlogImageCarousel";

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

export default function BlogPostRenderer({ blocks = [] }) {
  return (
    <div className="blog-renderer">
      {groupConsecutiveImages(blocks).map((block, index) => {
        if (block.type === "image-carousel") {
          return <BlogImageCarousel images={block.images} key={`image-carousel-${block.sourceIndex}`} />;
        }
        if (block.type === "heading") {
          return <h2 key={`${block.type}-${index}`}>{block.text}</h2>;
        }
        if (block.type === "quote") {
          return (
            <blockquote key={`${block.type}-${index}`}>
              <SpriteIcon id="icon-editor-blocks" size={18} />
              <span>{block.text}</span>
            </blockquote>
          );
        }
        if (block.type === "list") {
          return (
            <ul key={`${block.type}-${index}`}>
              {String(block.text || "")
                .split(/\n+/)
                .map((item) => item.trim())
                .filter(Boolean)
                .map((item, itemIndex) => <li key={`${item}-${itemIndex}`}>{item}</li>)}
            </ul>
          );
        }
        if (block.type === "code") {
          return <pre key={`${block.type}-${index}`}><code>{block.text}</code></pre>;
        }
        if (block.type === "image") {
          const source = String(block.src || "").trim();
          const canRender = isRenderableBlogImageSource(source);
          const description = String(block.alt || block.text || "").trim();
          return (
            <figure className={`blog-renderer-image${canRender ? " has-image" : ""}`} key={`${block.type}-${index}`}>
              {canRender ? (
                <img
                  src={source}
                  alt={description}
                  loading="lazy"
                  decoding="async"
                />
              ) : (
                <SpriteIcon id="icon-image" size={28} />
              )}
              {block.text ? <figcaption>{block.text}</figcaption> : null}
            </figure>
          );
        }
        if (block.type === "divider") {
          return <hr key={`${block.type}-${index}`} />;
        }
        if (block.type === "table") {
          const rows = Array.isArray(block.rows) && block.rows.length ? block.rows : [[block.text || "Kolom 1", "Kolom 2"], ["Isi", "Isi"]];
          return (
            <table className="blog-renderer-table" key={`${block.type}-${index}`}>
              <tbody>
                {rows.map((row, rowIndex) => (
                  <tr key={`row-${rowIndex}`}>
                    {row.map((cell, cellIndex) => <td key={`${cell}-${cellIndex}`}>{cell}</td>)}
                  </tr>
                ))}
              </tbody>
            </table>
          );
        }
        if (block.type === "icon") {
          return (
            <p className="blog-renderer-iconline" key={`${block.type}-${index}`}>
              <SpriteIcon id="icon-star-level" size={18} />
              <span>{block.text}</span>
            </p>
          );
        }
        return <p key={`${block.type}-${index}`}>{block.text}</p>;
      })}
    </div>
  );
}
