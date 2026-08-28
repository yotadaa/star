import { auth } from "@/auth";
import BlogPostList from "@/components/blog/BlogPostList";
import EditablePageCaption from "@/components/EditablePageCaption";
import PageHeader from "@/components/PageHeader";
import { PixelButton, SpriteIcon } from "@/components/claude";
import { listAboutEntries, listBlogPosts } from "@/lib/backend/featureStore";
import { pageMetadata } from "@/lib/seo";
import { redirect } from "next/navigation";

const BLOG_PAGE_SIZE = 10;
const BLOG_DESCRIPTION =
  "Notes on research, web development, AI tooling, and community work by Mukhtada Billah NST.";

function pageNumber(value) {
  const parsed = Number.parseInt(String(value || "1"), 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 1;
}

function pageHref(page) {
  return page > 1 ? `/blog?page=${page}` : "/blog";
}

export async function generateMetadata({ searchParams }) {
  const params = await searchParams;
  const page = pageNumber(params?.page);
  return pageMetadata({
    title: page > 1 ? `Blog — Page ${page}` : "Blog",
    description: page > 1 ? `${BLOG_DESCRIPTION} Page ${page}.` : BLOG_DESCRIPTION,
    path: pageHref(page),
  });
}

export const dynamic = "force-dynamic";

export default async function BlogPage({ searchParams }) {
  const params = await searchParams;
  const requestedPage = pageNumber(params?.page);
  const session = await auth();
  const [{ posts, source, warnings }, { entries }] = await Promise.all([
    listBlogPosts({ limit: 100 }),
    listAboutEntries(),
  ]);
  const totalPages = Math.max(1, Math.ceil(posts.length / BLOG_PAGE_SIZE));
  if (requestedPage > totalPages) redirect(pageHref(totalPages));
  const canManageBlog = session?.user?.role === "owner";
  const fallbackCaption = "Notes on research, web builds, and community work. Content is stored in Convex with a factual local fallback when the backend is unavailable.";
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
        <div className="blog-admin-access hardcard" aria-label="Blog CMS access">
          <div>
            <span className="pixel-label">// CMS ACCESS</span>
            <p>{source === "convex" ? "Convex CMS online" : "Local fallback mode"} · {posts.length} entries</p>
          </div>
          <div className="blog-admin-access-actions">
            <PixelButton as="a" href="/blog/admin">
              <SpriteIcon id="icon-admin-shield" size={15} />
              Manage CMS
            </PixelButton>
            <PixelButton as="a" href="/blog/admin/new" className="blog-new-button">
              <SpriteIcon id="icon-editor-blocks" size={15} />
              New article
            </PixelButton>
          </div>
        </div>
      )}

      {warnings?.length > 0 && (
        <p className="backend-warning" role="status">
          Convex is not responding, so the factual local copy is being used as a reading fallback.
        </p>
      )}

      <BlogPostList
        posts={posts}
        canManageBlog={canManageBlog}
        initialPage={requestedPage}
        pageSize={BLOG_PAGE_SIZE}
      />
    </div>
  );
}
