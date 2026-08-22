import { listBlogPosts } from "@/lib/backend/featureStore";
import { absoluteUrl } from "@/lib/seo";

export const revalidate = 3600;

const PUBLIC_ROUTES = [
  { path: "/", changeFrequency: "monthly", priority: 1 },
  { path: "/about", changeFrequency: "monthly", priority: 0.8 },
  { path: "/projects", changeFrequency: "weekly", priority: 0.9 },
  { path: "/research", changeFrequency: "monthly", priority: 0.8 },
  { path: "/blog", changeFrequency: "weekly", priority: 0.8 },
  { path: "/contact", changeFrequency: "yearly", priority: 0.6 },
];

export default async function sitemap() {
  const { posts } = await listBlogPosts({ limit: 100 });
  const blogEntries = posts
    .filter((post) => post.status === "published" && post.slug)
    .map((post) => {
      const updatedAt = Number(post.updatedAt);
      const hasKnownTimestamp = Number.isFinite(updatedAt) && updatedAt >= Date.UTC(2020, 0, 1);
      return {
        url: absoluteUrl(`/blog/${encodeURIComponent(post.slug)}`),
        ...(hasKnownTimestamp ? { lastModified: new Date(updatedAt) } : {}),
        changeFrequency: "monthly",
        priority: 0.7,
      };
    });

  return [
    ...PUBLIC_ROUTES.map(({ path, ...entry }) => ({
      url: absoluteUrl(path),
      ...entry,
    })),
    ...blogEntries,
  ];
}
