"use client";

import Link from "next/link";
import { RarityTag, SpriteIcon } from "@/components/claude";
import { getBlogFeaturedImage } from "@/lib/blog/featuredImage";

export default function BlogPostCard({ post, canManageBlog = false }) {
  const featuredImage = getBlogFeaturedImage(post);

  return (
    <article className={`blog-card hardcard blog-card-${post.coverTone}`}>
      <Link href={`/blog/${post.slug}`} className="blog-card-cover" aria-label={`Baca ${post.title}`}>
        <span className="blog-cover-fallback" aria-hidden="true">
          <SpriteIcon id="icon-blog-page" size={34} />
        </span>
        {featuredImage && (
          <img
            className="blog-cover-image"
            src={featuredImage.src}
            alt=""
            aria-hidden="true"
            loading="lazy"
            decoding="async"
            onError={(event) => {
              event.currentTarget.hidden = true;
            }}
          />
        )}
      </Link>
      <div className="blog-card-body">
        <RarityTag rarity="common" label={post.status === "local-preview" ? "LOCAL PREVIEW" : post.status} className="blog-status-tag" />
        <div className="blog-card-tags" aria-label="Tags">
          {(post.tags || []).map((tag) => (
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
          <span>{Math.max(0, Number(post.upvoteCount || 0))} dukungan</span>
        </div>
        <div className="blog-card-actions">
          <Link href={`/blog/${post.slug}`}>Baca</Link>
          {canManageBlog && <Link href={`/blog/admin/${post.id}/edit`}>Edit</Link>}
        </div>
      </div>
    </article>
  );
}
