import { notFound } from "next/navigation";
import BlockEditorPreview from "@/components/blog/BlockEditorPreview";
import PageHeader from "@/components/PageHeader";
import { getBlogPostById } from "@/lib/backend/featureStore";
import requireOwner from "@/lib/requireOwner";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }) {
  const { id } = await params;
  const { post } = await getBlogPostById(id);
  return {
    title: post ? `Edit ${post.title}` : "Edit Blog",
  };
}

export default async function EditBlogPostPage({ params }) {
  await requireOwner();
  const { id } = await params;
  const { post, source } = await getBlogPostById(id);
  if (!post) notFound();

  return (
    <div className="page-wrap blog-editor-page">
      <PageHeader label="// EDIT LORE ENTRY" title={`Edit: ${post.title}`}>
        This editor reads from {source}; updates are available for posts already stored in Convex.
      </PageHeader>
      <BlockEditorPreview post={post} />
    </div>
  );
}
