import Link from "next/link";
import { notFound } from "next/navigation";
import { auth } from "@/auth";
import BlogEngagement from "@/components/blog/BlogEngagement";
import BlogPostRenderer from "@/components/blog/BlogPostRenderer";
import BlogReadMetrics from "@/components/blog/BlogReadMetrics";
import { BlogReadingTrail, BlogRecentRail } from "@/components/blog/BlogReadingCompass";
import PageHeader from "@/components/PageHeader";
import { PixelButton, SpriteIcon } from "@/components/claude";
import { getBlogPostBySlug, listBlogPostSummaries } from "@/lib/backend/featureStore";
import { commentActorToken } from "@/lib/backend/blogEngagementAuth";
import { actorKeyForEmail } from "@/lib/backend/routeAuth";
import {
  buildBlogArticleSeo,
  formatArticleDate,
  serializeStructuredData,
} from "@/lib/blog/articleSeo";
import { buildBlogReadingContext } from "@/lib/blog/readingContext";
import { pageMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const { post } = await getBlogPostBySlug(slug);
  if (!post) {
    return {
      title: "Blog entry not found",
      robots: { index: false, follow: false },
    };
  }
  const articleSeo = buildBlogArticleSeo(post);
  return pageMetadata({
    title: articleSeo.seoTitle,
    description: articleSeo.seoDescription,
    path: articleSeo.path,
    type: "article",
    images: articleSeo.image ? [articleSeo.image] : undefined,
    publishedTime: articleSeo.publishedTime,
    modifiedTime: articleSeo.modifiedTime,
    authors: [articleSeo.authorUrl],
    section: articleSeo.section,
    tags: articleSeo.tags,
    titleSuffix: "Mukhtada",
    absoluteTitle: true,
    language: articleSeo.language,
  });
}

export default async function BlogPostPage({ params }) {
  const { slug } = await params;
  const [{ post }, { posts }, session] = await Promise.all([
    getBlogPostBySlug(slug),
    listBlogPostSummaries({ limit: 48 }),
    auth(),
  ]);
  if (!post) notFound();
  const actorKey = actorKeyForEmail(session?.user?.email);
  const viewerToken = actorKey ? commentActorToken(actorKey) : undefined;
  const canModerate = session?.user?.role === "owner";
  const articleSeo = buildBlogArticleSeo(post);
  const publishedLabel = formatArticleDate(articleSeo.publishedTime, articleSeo.language);
  const modifiedLabel = articleSeo.modifiedTime !== articleSeo.publishedTime
    ? formatArticleDate(articleSeo.modifiedTime, articleSeo.language)
    : null;
  const isIndonesian = articleSeo.language.toLowerCase().startsWith("id");
  const { recentPosts, relatedPosts } = buildBlogReadingContext(post, posts, {
    recentLimit: 4,
    relatedLimit: 3,
  });

  return (
    <div className="page-wrap blog-post-page">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: serializeStructuredData(articleSeo.structuredData),
        }}
      />
      <article className="blog-post-article" lang={articleSeo.language}>
        <div className="blog-reading-layout">
          <div className="blog-post-column">
            <PageHeader label="// ARTICLE" title={post.title}>
              {post.excerpt}
            </PageHeader>

            <dl className="blog-post-meta hardcard" aria-label="Article details">
              <div>
                <dt className="sr-only">Status</dt>
                <dd><SpriteIcon id="icon-blog-page" size={15} /> {post.status}</dd>
              </div>
              {publishedLabel ? (
                <div>
                  <dt className="sr-only">Published</dt>
                  <dd><time dateTime={articleSeo.publishedTime}>{publishedLabel}</time></dd>
                </div>
              ) : null}
              {modifiedLabel ? (
                <div>
                  <dt className="sr-only">
                    {isIndonesian ? "Terakhir diperbarui" : "Last updated"}
                  </dt>
                  <dd>
                    {isIndonesian ? "Diperbarui" : "Updated"}{" "}
                    <time dateTime={articleSeo.modifiedTime}>{modifiedLabel}</time>
                  </dd>
                </div>
              ) : null}
              <div>
                <dt className="sr-only">Author</dt>
                <dd>By <Link href={articleSeo.authorUrl}>{articleSeo.authorName}</Link></dd>
              </div>
              <div className="blog-post-meta-reading">
                <dt className="sr-only">Article readership</dt>
                <dd>
                  <BlogReadMetrics
                    slug={post.slug}
                    estimatedReadTime={post.readTime}
                    initialStats={post.readingStats}
                  />
                </dd>
              </div>
            </dl>

            <div id="blog-article-content">
              <BlogPostRenderer blocks={post.blocks} sourceHref={post.sourceHref} />
            </div>
          </div>

          <BlogRecentRail posts={recentPosts} />
        </div>

        <div className="blog-post-tail">
          <BlogReadingTrail items={relatedPosts} />

          <BlogEngagement
            slug={post.slug}
            initialUpvoteCount={post.upvoteCount}
            viewerToken={viewerToken}
            canModerate={canModerate}
          />

          <div className="blog-post-actions">
            <PixelButton as="a" href={post.sourceHref || "/blog"} className="blog-source-link">
              <SpriteIcon id="icon-portal-ring" size={15} />
              Open source
            </PixelButton>
            <Link href="/blog" className="blog-back-link">Back to all articles</Link>
          </div>
        </div>
      </article>
    </div>
  );
}
