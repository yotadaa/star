import { listBlogPosts } from "@/lib/backend/featureStore";
import { absoluteUrl } from "@/lib/seo";
import { renderUrlSet, sitemapResponse } from "@/lib/sitemapXml";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  const { posts } = await listBlogPosts({ limit: 100 });
  const entries = posts
    .filter((post) => post.status === "published" && post.slug)
    .map((post) => {
      const updatedAt = Number(post.updatedAt);
      const hasKnownTimestamp = Number.isFinite(updatedAt) && updatedAt >= Date.UTC(2020, 0, 1);
      return {
        url: absoluteUrl(`/blog/${encodeURIComponent(post.slug)}`),
        ...(hasKnownTimestamp ? { lastModified: new Date(updatedAt).toISOString() } : {}),
        changeFrequency: "monthly",
        priority: 0.7,
      };
    });

  const response = sitemapResponse(renderUrlSet(entries));
  response.headers.set("Cache-Control", "no-store, max-age=0");
  return response;
}
