import Link from "next/link";
import { notFound } from "next/navigation";
import BlogPostRenderer from "@/components/blog/BlogPostRenderer";
import PageHeader from "@/components/PageHeader";
import { PixelButton, SpriteIcon } from "@/components/claude";
import { getBlogPostBySlug } from "@/lib/backend/featureStore";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const { post } = await getBlogPostBySlug(slug);
  return {
    title: post ? `${post.title} - Blog` : "Blog",
    description: post?.excerpt,
  };
}

export default async function BlogPostPage({ params }) {
  const { slug } = await params;
  const { post, source } = await getBlogPostBySlug(slug);
  if (!post) notFound();

  return (
    <article className="page-wrap blog-post-page">
      <PageHeader label="// LORE ENTRY" title={post.title}>
        {post.excerpt}
      </PageHeader>

      <div className="blog-post-meta hardcard">
        <span><SpriteIcon id="icon-blog-page" size={15} /> {post.status}</span>
        <span>{post.publishedAt}</span>
        <span>{post.readTime}</span>
        <span><SpriteIcon id={source === "supabase" ? "icon-database-online" : "icon-database-offline"} size={15} /> {source}</span>
      </div>

      <BlogPostRenderer blocks={post.blocks} />

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
