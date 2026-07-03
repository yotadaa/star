import { notFound } from "next/navigation";
import BlockEditorPreview from "@/components/blog/BlockEditorPreview";
import PageHeader from "@/components/PageHeader";
import { blogPosts } from "@/lib/data";
import requireOwner from "@/lib/requireOwner";

export function generateStaticParams() {
  return blogPosts.map((post) => ({ id: post.id }));
}

export async function generateMetadata({ params }) {
  const { id } = await params;
  const post = blogPosts.find((item) => item.id === id);
  return {
    title: post ? `Edit ${post.title} - Blog Admin` : "Edit Blog",
  };
}

export default async function EditBlogPostPage({ params }) {
  await requireOwner();
  const { id } = await params;
  const post = blogPosts.find((item) => item.id === id);
  if (!post) notFound();

  return (
    <div className="page-wrap blog-editor-page">
      <PageHeader label="// EDIT LORE ENTRY" title={`Edit: ${post.title}`}>
        Route edit sudah tersedia. Penyimpanan masih menunggu backend CMS.
      </PageHeader>
      <BlockEditorPreview post={post} />
    </div>
  );
}
