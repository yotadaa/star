import BlockEditorPreview from "@/components/blog/BlockEditorPreview";
import PageHeader from "@/components/PageHeader";
import requireOwner from "@/lib/requireOwner";

export const metadata = {
  title: "New Blog Entry - Mukhtada Billah NST",
};

export default async function NewBlogPostPage() {
  await requireOwner();

  return (
    <div className="page-wrap blog-editor-page">
      <PageHeader label="// NEW LORE ENTRY" title="Tulis Baru">
        Preview editor block. Autosave dan publish akan aktif setelah stack CMS dikonfirmasi.
      </PageHeader>
      <BlockEditorPreview />
    </div>
  );
}
