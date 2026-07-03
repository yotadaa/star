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
        Native block editor untuk CMS blog. Publish menyimpan ke shard Supabase yang dipilih round-robin.
      </PageHeader>
      <BlockEditorPreview />
    </div>
  );
}
