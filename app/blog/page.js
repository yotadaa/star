import { auth } from "@/auth";
import BlogPostList from "@/components/blog/BlogPostList";
import EditablePageCaption from "@/components/EditablePageCaption";
import PageHeader from "@/components/PageHeader";
import { PixelButton, SpriteIcon } from "@/components/claude";
import { listAboutEntries, listBlogPosts } from "@/lib/backend/featureStore";
import { BLOG_PAGE_SIZE, blogPageCount, blogPageHref } from "@/lib/blog/pagination";
import { publicPageCopy } from "@/lib/data";
import { pageMetadata } from "@/lib/seo";
import { redirect } from "next/navigation";

const BLOG_DESCRIPTION = publicPageCopy.blog.metadataDescription;

function pageNumber(value) {
  const parsed = Number.parseInt(String(value || "1"), 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 1;
}

export async function generateMetadata({ searchParams }) {
  const params = await searchParams;
  const page = pageNumber(params?.page);
  return pageMetadata({
    title: page > 1 ? `${publicPageCopy.blog.metadataTitle} — Page ${page}` : publicPageCopy.blog.metadataTitle,
    description: page > 1 ? `Browse page ${page} of ${BLOG_DESCRIPTION}` : BLOG_DESCRIPTION,
    path: blogPageHref(page),
    tags: publicPageCopy.blog.keywords,
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
  const totalPages = blogPageCount(posts.length);
  if (requestedPage > totalPages) redirect(blogPageHref(totalPages));
  const canManageBlog = session?.user?.role === "owner";
  const fallbackCaption = publicPageCopy.blog.caption;
  const blogCaption = entries.find((entry) => entry.entryKey === "blog-caption")?.body || fallbackCaption;

  return (
    <div className="page-wrap blog-page">
      <PageHeader label={publicPageCopy.blog.label} title={publicPageCopy.blog.title}>
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
