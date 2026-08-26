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
          alt={image.alt || `Featured image for ${post.title}`}
          loading="lazy"
          decoding="async"
          width={image.width}
          height={image.height}
        />
      ) : null}
    </span>
  );
}

export function BlogRecentRail({ posts }) {
  if (!posts?.length) return null;

  return (
    <aside className="blog-recent-rail" aria-labelledby="blog-recent-title">
      <div className="blog-recent-list">
        <header className="blog-recent-list-head">
          <h2 id="blog-recent-title">Recent articles</h2>
          <Link href="/blog">View all</Link>
        </header>
        <ol>
          {posts.map((post, index) => (
            <li key={post.slug}>
              <Link href={`/blog/${post.slug}`}>
                <span className="blog-recent-number" aria-hidden="true">{String(index + 1).padStart(2, "0")}</span>
                <span className="blog-recent-copy">
                  <span className="blog-recent-title">{post.title}</span>
                  <span className="blog-recent-meta">{post.readTime} · {voteLabel(post)}</span>
                </span>
                <SpriteIcon id="icon-chevron-up" size={14} className="blog-recent-arrow" aria-hidden="true" />
              </Link>
            </li>
          ))}
        </ol>
      </div>
    </aside>
  );
}

function topicLabel(item) {
  return item.matchingTags?.[0] || item.post.tags?.[0] || "Latest";
}

export function BlogReadingTrail({ items }) {
  if (!items?.length) return null;

  return (
    <section className="blog-reading-trail" aria-labelledby="blog-reading-trail-title">
      <header className="blog-reading-trail-head">
        <div>
          <h2 id="blog-reading-trail-title">Read next</h2>
          <p>Articles sharing this post&apos;s topics, followed by the latest entries.</p>
        </div>
        <Link href="/blog" className="blog-reading-trail-all">View all articles</Link>
      </header>

      <div className="blog-reading-trail-carousel" role="list" aria-label="Related articles">
        {items.map((item) => (
          <article className="blog-reading-card" role="listitem" key={item.post.slug}>
            <Link href={`/blog/${item.post.slug}`}>
              <ReadingCover post={item.post} className="is-carousel" />
              <span className="blog-reading-card-body">
                <span className="blog-reading-topic">{topicLabel(item)}</span>
                <span className="blog-reading-card-title">{item.post.title}</span>
                <span className="blog-reading-card-excerpt">{item.post.excerpt}</span>
                <span className="blog-reading-card-meta">{item.post.readTime} · {voteLabel(item.post)}</span>
              </span>
            </Link>
          </article>
        ))}
      </div>
    </section>
  );
}
