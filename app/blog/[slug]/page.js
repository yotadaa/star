import Link from "next/link";
import { notFound } from "next/navigation";
import { auth } from "@/auth";
import BlogEngagement from "@/components/blog/BlogEngagement";
import BlogPostRenderer from "@/components/blog/BlogPostRenderer";
import PageHeader from "@/components/PageHeader";
import { PixelButton, SpriteIcon } from "@/components/claude";
import { getBlogPostBySlug } from "@/lib/backend/featureStore";
import { commentActorToken } from "@/lib/backend/blogEngagementAuth";
import { actorKeyForEmail } from "@/lib/backend/routeAuth";
import { pageMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const { post } = await getBlogPostBySlug(slug);
  if (!post) {
    return {
      title: "Blog entry tidak ditemukan",
      robots: { index: false, follow: false },
    };
  }
  return pageMetadata({
    title: post.title,
    description: post.excerpt,
    path: `/blog/${encodeURIComponent(post.slug)}`,
    type: "article",
  });
}

export default async function BlogPostPage({ params }) {
  const { slug } = await params;
  const [{ post, source }, session] = await Promise.all([getBlogPostBySlug(slug), auth()]);
  if (!post) notFound();
  const actorKey = actorKeyForEmail(session?.user?.email);
  const viewerToken = actorKey ? commentActorToken(actorKey) : undefined;
  const canModerate = session?.user?.role === "owner";

  return (
    <article className="page-wrap blog-post-page">
      <PageHeader label="// LORE ENTRY" title={post.title}>
        {post.excerpt}
      </PageHeader>

      <div className="blog-post-meta hardcard">
        <span><SpriteIcon id="icon-blog-page" size={15} /> {post.status}</span>
        <span>{post.publishedAt}</span>
        <span>{post.readTime}</span>
        <span><SpriteIcon id={source === "convex" ? "icon-database-online" : "icon-database-offline"} size={15} /> {source}</span>
      </div>

      <BlogPostRenderer blocks={post.blocks} sourceHref={post.sourceHref} />

      <BlogEngagement
        slug={post.slug}
        initialUpvoteCount={post.upvoteCount}
        viewerToken={viewerToken}
        canModerate={canModerate}
      />

      <div className="blog-post-actions">
        <PixelButton as="a" href={post.sourceHref || "/blog"} className="blog-source-link">
          <SpriteIcon id="icon-portal-ring" size={15} />
          Buka sumber
        </PixelButton>
        <Link href="/blog" className="blog-back-link">Kembali ke Blog</Link>
      </div>
    </article>
  );
}
