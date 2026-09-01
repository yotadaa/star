import Link from "next/link";
import BlogPostCard from "@/components/blog/BlogPostCard";
import { listBlogPostSummaries } from "@/lib/backend/featureStore";
import { getBlogFeaturedImage } from "@/lib/blog/featuredImage";

function publicBlogSummary(post) {
  const featuredImage = getBlogFeaturedImage(post);
  return {
    slug: post.slug,
    title: post.title,
    excerpt: post.excerpt,
    status: post.status,
    tags: Array.isArray(post.tags) ? post.tags : [],
    publishedAt: post.publishedAt,
    datePublished: post.datePublished,
    readTime: post.readTime,
    upvoteCount: Math.max(0, Number(post.upvoteCount || 0)),
    readingStats: post.readingStats,
    ...(featuredImage ? { featuredImage } : {}),
  };
}

function FeaturedBlogShell({ children, loading = false }) {
  return (
    <section
      className="section-band alt"
      id="featured-blog"
      aria-labelledby="featured-blog-title"
      aria-busy={loading ? "true" : undefined}
    >
      <div className="content">
        <div className="section-head">
          <span className="pixel-label">// Featured Blog Posts</span>
          <h2 id="featured-blog-title">Recent articles and technical notes</h2>
          <p>Writing on web development, AI tooling, open-source software, research, and the decisions behind real projects.</p>
        </div>
        {children}
        <div className="home-cta">
          <Link href="/blog" className="btn primary" data-testid="cta-blog">Read all articles</Link>
        </div>
      </div>
    </section>
  );
}

export function FeaturedBlogFallback() {
  return (
    <FeaturedBlogShell loading>
      <div className="featured-blog-reserved-space" aria-hidden="true" />
    </FeaturedBlogShell>
  );
}

export default async function FeaturedBlogSection() {
  const { posts } = await listBlogPostSummaries({ limit: 3 });
  const recentPosts = posts
    .filter((post) => post.status === "published")
    .slice(0, 3)
    .map(publicBlogSummary);

  return (
    <FeaturedBlogShell>
      {recentPosts.length > 0 && (
        <div className="blog-grid">
          {recentPosts.map((post) => (
            <BlogPostCard key={post.slug} post={post} headingLevel="h3" />
          ))}
        </div>
      )}
    </FeaturedBlogShell>
  );
}
