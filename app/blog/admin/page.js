import BlogAdminTable from "@/components/blog/BlogAdminTable";
import PageHeader from "@/components/PageHeader";
import { listBlogPosts } from "@/lib/backend/featureStore";
import requireOwner from "@/lib/requireOwner";

export const metadata = {
  title: "Blog Admin",
};

export default async function BlogAdminPage() {
  await requireOwner();
  const { posts, source, warnings } = await listBlogPosts({ includeDrafts: true });

  return (
    <div className="page-wrap blog-admin-page">
      <PageHeader label="// OWNER CMS" title="Blog Admin">
        The owner session is verified. This table reads from Convex and keeps a factual local fallback for backend outages.
      </PageHeader>
      <BlogAdminTable posts={posts} source={source} warnings={warnings} />
    </div>
  );
}
