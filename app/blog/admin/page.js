import BlogAdminTable from "@/components/blog/BlogAdminTable";
import PageHeader from "@/components/PageHeader";
import { listBlogPosts } from "@/lib/backend/featureStore";
import requireOwner from "@/lib/requireOwner";

export const metadata = {
  title: "Blog Admin - Mukhtada Billah NST",
};

export default async function BlogAdminPage() {
  await requireOwner();
  const { posts, source, warnings } = await listBlogPosts({ includeDrafts: true });

  return (
    <div className="page-wrap blog-admin-page">
      <PageHeader label="// OWNER CMS" title="Blog Admin">
        Session owner sudah diverifikasi. Tabel membaca Supabase lebih dulu dan fallback lokal saat schema belum siap.
      </PageHeader>
      <BlogAdminTable posts={posts} source={source} warnings={warnings} />
    </div>
  );
}
