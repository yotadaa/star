import { listBlogPosts } from "@/lib/backend/featureStore";
import { blogPageCount, blogPageHref } from "@/lib/blog/pagination";
import { absoluteUrl } from "@/lib/seo";
import { renderUrlSet, sitemapResponse } from "@/lib/sitemapXml";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  const { posts } = await listBlogPosts({ limit: 100 });
  const publishedPosts = posts.filter((post) => post.status === "published" && post.slug);
  const articleEntries = publishedPosts
    .map((post) => {
      const updatedAt = Number(post.dateModified ?? post.updatedAt);
      const hasKnownTimestamp = Number.isFinite(updatedAt) && updatedAt >= Date.UTC(2020, 0, 1);
      return {
        url: absoluteUrl(`/blog/${encodeURIComponent(post.slug)}`),
        ...(hasKnownTimestamp ? { lastModified: new Date(updatedAt).toISOString() } : {}),
        changeFrequency: "monthly",
        priority: 0.7,
      };
    });
  const paginationEntries = Array.from(
    { length: Math.max(0, blogPageCount(publishedPosts.length) - 1) },
    (_, index) => ({
      url: absoluteUrl(blogPageHref(index + 2)),
      changeFrequency: "weekly",
      priority: 0.6,
    }),
  );
  const entries = [...paginationEntries, ...articleEntries];

  const response = sitemapResponse(renderUrlSet(entries));
  response.headers.set("Cache-Control", "no-store, max-age=0");
  return response;
}
