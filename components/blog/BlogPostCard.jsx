import Link from "next/link";
import { RarityTag, SpriteIcon } from "@/components/claude";

export default function BlogPostCard({ post }) {
  return (
    <article className={`blog-card hardcard blog-card-${post.coverTone}`}>
      <Link href={`/blog/${post.slug}`} className="blog-card-cover" aria-label={`Baca ${post.title}`}>
        <SpriteIcon id="icon-blog-page" size={34} />
      </Link>
      <div className="blog-card-body">
        <RarityTag rarity="common" label={post.status === "local-preview" ? "LOCAL PREVIEW" : post.status} className="blog-status-tag" />
        <div className="blog-card-tags" aria-label="Tags">
          {post.tags.map((tag) => (
            <span key={tag}>{tag}</span>
          ))}
        </div>
        <h2>
          <Link href={`/blog/${post.slug}`}>{post.title}</Link>
        </h2>
        <p>{post.excerpt}</p>
        <div className="blog-card-meta">
          <span>{post.publishedAt}</span>
          <span>{post.readTime}</span>
        </div>
      </div>
    </article>
  );
}
