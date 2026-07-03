import { auth } from "@/auth";
import BlogPostList from "@/components/blog/BlogPostList";
import EditablePageCaption from "@/components/EditablePageCaption";
import PageHeader from "@/components/PageHeader";
import { PixelButton, SpriteIcon } from "@/components/claude";
import { listAboutEntries, listBlogPosts } from "@/lib/backend/featureStore";

export const metadata = {
  title: "Blog - Mukhtada Billah NST",
  description: "Lore entries dan dev log Mukhtada Billah NST.",
};

export const dynamic = "force-dynamic";

export default async function BlogPage() {
  const session = await auth();
  const [{ posts, source, warnings }, { entries }] = await Promise.all([listBlogPosts(), listAboutEntries()]);
  const canManageBlog = session?.user?.role === "owner";
  const fallbackCaption = "Catatan proses riset, web build, dan community work. Konten membaca CMS Supabase lebih dulu, lalu fallback ke data lokal yang sudah ada.";
  const blogCaption = entries.find((entry) => entry.entryKey === "blog-caption")?.body || fallbackCaption;

  return (
    <div className="page-wrap blog-page">
      <PageHeader label="// LORE ENTRIES" title="Blog">
        <EditablePageCaption
          entryKey="blog-caption"
          title="Blog caption"
          initialText={blogCaption}
          canManage={canManageBlog}
        />
      </PageHeader>

      {canManageBlog && (
        <div className="blog-admin-access hardcard" aria-label="Akses CMS Blog">
          <div>
            <span className="pixel-label">// CMS ACCESS</span>
            <p>{source === "supabase" ? "CMS Supabase aktif" : "Mode baca cadangan lokal"} · {posts.length} entry</p>
          </div>
          <div className="blog-admin-access-actions">
            <PixelButton as="a" href="/blog/admin">
              <SpriteIcon id="icon-admin-shield" size={15} />
              Kelola CMS
            </PixelButton>
            <PixelButton as="a" href="/blog/admin/new" className="blog-new-button">
              <SpriteIcon id="icon-editor-blocks" size={15} />
              Tulis Baru
            </PixelButton>
          </div>
        </div>
      )}

      {warnings?.length > 0 && (
        <p className="backend-warning" role="status">
          Sebagian shard CMS belum merespons, konten lokal faktual tetap dipakai sebagai cadangan baca.
        </p>
      )}

      <BlogPostList posts={posts} canManageBlog={canManageBlog} />
    </div>
  );
}
