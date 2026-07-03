import { SpriteIcon } from "@/components/claude";

export default function BlogPostRenderer({ blocks = [] }) {
  return (
    <div className="blog-renderer">
      {blocks.map((block, index) => {
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
        return <p key={`${block.type}-${index}`}>{block.text}</p>;
      })}
    </div>
  );
}
