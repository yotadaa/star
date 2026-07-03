import BlogPostList from "@/components/blog/BlogPostList";
import PageHeader from "@/components/PageHeader";
import { HudStatusStrip, SpriteIcon } from "@/components/claude";
import { blogPosts } from "@/lib/data";

export const metadata = {
  title: "Blog - Mukhtada Billah NST",
  description: "Lore entries dan dev log Mukhtada Billah NST.",
};

export default function BlogPage() {
  return (
    <div className="page-wrap blog-page">
      <PageHeader label="// LORE ENTRIES" title="Blog">
        Catatan proses riset, web build, dan community work. CMS backend belum aktif; konten di bawah adalah local preview dari data portofolio yang sudah ada.
      </PageHeader>

      <HudStatusStrip
        className="blog-status-strip"
        items={[
          { icon: <SpriteIcon id="icon-blog-page" size={14} />, label: "/blog public", accent: "gold" },
          { icon: <SpriteIcon id="icon-database-offline" size={14} />, label: "CMS pending", accent: "aurora" },
          { icon: <SpriteIcon id="icon-editor-blocks" size={14} />, label: "Block editor preview", accent: "ink" },
        ]}
      />

      <BlogPostList posts={blogPosts} />
    </div>
  );
}
