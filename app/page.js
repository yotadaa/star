import HomePageContent from "@/components/home/HomePageContent";
import { listBlogPostSummaries } from "@/lib/backend/featureStore";
import { getBlogFeaturedImage } from "@/lib/blog/featuredImage";
import { publicPageCopy } from "@/lib/data";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: publicPageCopy.home.metadataTitle,
  description: publicPageCopy.home.metadataDescription,
  path: "/",
  tags: publicPageCopy.home.keywords,
  titleSuffix: "",
  absoluteTitle: true,
});

export const revalidate = 300;

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

export default async function Home() {
  const { posts } = await listBlogPostSummaries({ limit: 3 });
  const recentPosts = posts
    .filter((post) => post.status === "published")
    .slice(0, 3)
    .map(publicBlogSummary);

  return <HomePageContent recentPosts={recentPosts} />;
}
