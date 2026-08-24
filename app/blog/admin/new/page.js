import BlockEditorPreview from "@/components/blog/BlockEditorPreview";
import PageHeader from "@/components/PageHeader";
import requireOwner from "@/lib/requireOwner";

export const metadata = {
  title: "New Blog Entry",
};

export default async function NewBlogPostPage() {
  await requireOwner();

  return (
    <div className="page-wrap blog-editor-page">
      <PageHeader label="// NEW LORE ENTRY" title="New Article">
        A native block editor for the Blog CMS. Publishing writes to Convex through the authenticated owner path.
      </PageHeader>
      <BlockEditorPreview />
    </div>
  );
}
