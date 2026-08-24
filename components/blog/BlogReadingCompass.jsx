import Link from "next/link";
import { SpriteIcon } from "@/components/claude";
import { getBlogFeaturedImage } from "@/lib/blog/featuredImage";

function voteLabel(post) {
  const count = Math.max(0, Number(post?.upvoteCount || 0));
  return `${count} ${count === 1 ? "vote" : "votes"}`;
}

function ReadingCover({ post, className = "" }) {
  const image = getBlogFeaturedImage(post);

  return (
    <span className={`blog-reading-cover ${className}`.trim()} aria-hidden="true">
      <span className="blog-reading-cover-fallback">
        <SpriteIcon id="icon-blog-page" size={26} />
      </span>
      {image ? (
        <img
          src={image.src}
          alt=""
          loading="lazy"
          decoding="async"
          width={image.width}
          height={image.height}
        />
      ) : null}
    </span>
  );
}

export function BlogRecentRail({ post, side, index }) {
  if (!post) return null;

  return (
    <aside className={`blog-recent-rail is-${side}`} aria-label={`Recent article ${index}`}>
      <Link href={`/blog/${post.slug}`} className="blog-recent-card">
        <span className="blog-recent-index">Recent {String(index).padStart(2, "0")}</span>
        <ReadingCover post={post} />
        <span className="blog-recent-title">{post.title}</span>
        <span className="blog-recent-meta">{post.readTime} · {voteLabel(post)}</span>
        <span className="blog-recent-action">
          <SpriteIcon id="icon-chevron-up" size={14} aria-hidden="true" />
          Read article
        </span>
      </Link>
    </aside>
  );
}

function topicLabel(item) {
  return item.matchingTags?.[0] || item.post.tags?.[0] || "Latest";
}

export function BlogReadingTrail({ items }) {
  if (!items?.length) return null;
  const [featured, ...compactItems] = items;

  return (
    <section className="blog-reading-trail" aria-labelledby="blog-reading-trail-title">
      <header className="blog-reading-trail-head">
        <div>
          <h2 id="blog-reading-trail-title">Read next</h2>
          <p>Articles sharing this post&apos;s topics, followed by the latest entries.</p>
        </div>
        <Link href="/blog" className="blog-reading-trail-all">View all articles</Link>
      </header>

      <div className="blog-reading-trail-layout">
        <article className="blog-reading-trail-feature">
          <Link href={`/blog/${featured.post.slug}`}>
            <ReadingCover post={featured.post} className="is-featured" />
            <span className="blog-reading-trail-feature-body">
              <span className="blog-reading-topic">{topicLabel(featured)}</span>
              <span className="blog-reading-feature-title">{featured.post.title}</span>
              <span className="blog-reading-feature-excerpt">{featured.post.excerpt}</span>
              <span className="blog-reading-feature-meta">{featured.post.readTime} · {voteLabel(featured.post)}</span>
            </span>
          </Link>
        </article>

        {compactItems.length ? (
          <div className="blog-reading-trail-compact-list">
            {compactItems.map((item, index) => (
              <article className="blog-reading-trail-compact" key={item.post.slug}>
                <Link href={`/blog/${item.post.slug}`}>
                  <span className="blog-reading-trail-number" aria-hidden="true">{String(index + 2).padStart(2, "0")}</span>
                  <span className="blog-reading-trail-compact-copy">
                    <span className="blog-reading-topic">{topicLabel(item)}</span>
                    <span className="blog-reading-compact-title">{item.post.title}</span>
                    <span className="blog-reading-compact-meta">{item.post.readTime} · {voteLabel(item.post)}</span>
                  </span>
                  <SpriteIcon id="icon-chevron-up" size={16} className="blog-reading-trail-arrow" aria-hidden="true" />
                </Link>
              </article>
            ))}
          </div>
        ) : null}
      </div>
    </section>
  );
}
