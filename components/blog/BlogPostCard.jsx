"use client";

import Link from "next/link";
import { RarityTag, SpriteIcon } from "@/components/claude";
import { formatArticleDate, toIsoDate } from "@/lib/blog/articleSeo";
import { getBlogFeaturedImage } from "@/lib/blog/featuredImage";
import { compactReadingLabel } from "@/lib/blog/readingMetrics.mjs";

export default function BlogPostCard({ post, canManageBlog = false, headingLevel = "h2" }) {
  const featuredImage = getBlogFeaturedImage(post);
  const Heading = headingLevel === "h3" ? "h3" : "h2";
  const publishedIso = toIsoDate(post.datePublished ?? post.publishedAt);
  const publishedLabel = formatArticleDate(publishedIso) || post.publishedAt;

  return (
    <article className={`blog-card hardcard blog-card-${post.coverTone || "research"}`}>
      <Link href={`/blog/${post.slug}`} className="blog-card-cover" aria-label={`Read ${post.title}`}>
        <span className="blog-cover-fallback" aria-hidden="true">
          <SpriteIcon id="icon-blog-page" size={34} />
        </span>
        {featuredImage && (
          <img
            className="blog-cover-image"
            src={featuredImage.src}
            alt={featuredImage.alt || `Featured image for ${post.title}`}
            aria-hidden="true"
            loading="lazy"
            decoding="async"
            width={featuredImage.width}
            height={featuredImage.height}
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
        <Heading className="blog-card-title">
          <Link href={`/blog/${post.slug}`}>{post.title}</Link>
        </Heading>
        <p>{post.excerpt}</p>
        <div className="blog-card-meta">
          {publishedLabel && <time dateTime={publishedIso}>{publishedLabel}</time>}
          <span>{compactReadingLabel(post)}</span>
          <span>{Math.max(0, Number(post.upvoteCount || 0))} votes</span>
        </div>
        <div className="blog-card-actions">
          <Link href={`/blog/${post.slug}`}>Read article</Link>
          {canManageBlog && <Link href={`/blog/admin/${post.id}/edit`}>Edit</Link>}
        </div>
      </div>
    </article>
  );
}
