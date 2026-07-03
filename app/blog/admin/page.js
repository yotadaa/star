import BlogAdminTable from "@/components/blog/BlogAdminTable";
import PageHeader from "@/components/PageHeader";
import { blogPosts } from "@/lib/data";
import requireOwner from "@/lib/requireOwner";

export const metadata = {
  title: "Blog Admin - Mukhtada Billah NST",
};

export default async function BlogAdminPage() {
  await requireOwner();

  return (
    <div className="page-wrap blog-admin-page">
      <PageHeader label="// OWNER CMS" title="Blog Admin">
        Session owner sudah diverifikasi. Penyimpanan draft dan publish masih menunggu database CMS.
      </PageHeader>
      <BlogAdminTable posts={blogPosts} />
    </div>
  );
}
