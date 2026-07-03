import BlogPostList from "@/components/blog/BlogPostList";
import PageHeader from "@/components/PageHeader";
import { HudStatusStrip, SpriteIcon } from "@/components/claude";
import { listBlogPosts } from "@/lib/backend/featureStore";

export const metadata = {
  title: "Blog - Mukhtada Billah NST",
  description: "Lore entries dan dev log Mukhtada Billah NST.",
};

export const dynamic = "force-dynamic";

export default async function BlogPage() {
  const { posts, source, warnings } = await listBlogPosts();

  return (
    <div className="page-wrap blog-page">
      <PageHeader label="// LORE ENTRIES" title="Blog">
        Catatan proses riset, web build, dan community work. Konten membaca CMS Supabase lebih dulu, lalu fallback ke data lokal yang sudah ada.
      </PageHeader>

      {/* <HudStatusStrip
        className="blog-status-strip"
        items={[
          { icon: <SpriteIcon id="icon-blog-page" size={14} />, label: "/blog public", accent: "gold" },
          {
            icon: <SpriteIcon id={source === "supabase" ? "icon-database-online" : "icon-database-offline"} size={14} />,
            label: source === "supabase" ? "CMS live" : "Local fallback",
            accent: "aurora",
          },
          { icon: <SpriteIcon id="icon-editor-blocks" size={14} />, label: `${posts.length} entries`, accent: "ink" },
        ]}
      /> */}

      {warnings?.length > 0 && (
        <p className="backend-warning" role="status">
          Sebagian shard CMS belum merespons, konten lokal faktual tetap dipakai sebagai cadangan baca.
        </p>
      )}

      <BlogPostList posts={posts} />
    </div>
  );
}
