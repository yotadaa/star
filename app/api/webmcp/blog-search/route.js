import { NextResponse } from "next/server";
import { listBlogPosts } from "@/lib/backend/featureStore";

export const dynamic = "force-dynamic";

function clean(value, maxLength) {
  return String(value || "").trim().replace(/\s+/g, " ").slice(0, maxLength);
}

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const unsupported = [...searchParams.keys()].filter((key) => !["q", "category"].includes(key));
  if (unsupported.length) {
    return NextResponse.json({ ok: false, error: "INVALID_INPUT" }, { status: 400 });
  }

  const q = clean(searchParams.get("q"), 120).toLowerCase();
  const category = clean(searchParams.get("category"), 60).toLowerCase();
  const { posts } = await listBlogPosts({ includeDrafts: false, limit: 100 });
  const results = posts
    .filter((post) => post.status === "published")
    .filter((post) => {
      const tags = Array.isArray(post.tags) ? post.tags.map((tag) => clean(tag, 40)) : [];
      const text = `${clean(post.title, 180)} ${clean(post.excerpt, 320)} ${tags.join(" ")}`.toLowerCase();
      return (!q || text.includes(q)) && (!category || tags.some((tag) => tag.toLowerCase().includes(category)));
    })
    .slice(0, 5)
    .map((post) => ({
      slug: clean(post.slug, 160),
      title: clean(post.title, 180),
      excerpt: clean(post.excerpt, 320),
      tags: (Array.isArray(post.tags) ? post.tags : []).slice(0, 6).map((tag) => clean(tag, 40)),
      publishedAt: post.publishedAt || post.datePublished || null,
      url: `/blog/${encodeURIComponent(post.slug)}`,
    }));

  return NextResponse.json(
    { ok: true, results },
    { headers: { "Cache-Control": "no-store" } },
  );
}
