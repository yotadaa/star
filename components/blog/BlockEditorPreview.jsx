"use client";

import RequireLoginGate from "@/components/auth/RequireLoginGate";
import { PixelButton, SpriteIcon } from "@/components/claude";
import BlogPostRenderer from "./BlogPostRenderer";

const toolbar = [
  { label: "H1", title: "Heading 1" },
  { label: "H2", title: "Heading 2" },
  { label: "B", title: "Bold" },
  { label: "I", title: "Italic" },
  { label: "Quote", title: "Quote" },
  { label: "Code", title: "Code" },
  { label: "Image", title: "Image" },
  { label: "Line", title: "Divider" },
];

export default function BlockEditorPreview({ post }) {
  return (
    <RequireLoginGate
      title="Login ke System"
      description="Editor block akan aktif setelah Auth.js, Supabase, dan editor production dikonfirmasi."
    >
      <section className="block-editor-preview hardcard" aria-label="Editor preview">
        <header className="block-editor-header">
          <div>
            <span className="pixel-label">// BLOCK EDITOR</span>
            <input value={post?.title ?? "Judul post baru"} readOnly aria-label="Judul post" />
          </div>
          <PixelButton className="blog-publish-button">
            <SpriteIcon id="icon-blog-page" size={15} />
            Publish
          </PixelButton>
        </header>

        <div className="block-editor-toolbar" aria-label="Toolbar editor">
          {toolbar.map((item) => (
            <button key={item.title} type="button" title={item.title}>
              {item.label}
            </button>
          ))}
        </div>

        <BlogPostRenderer blocks={post?.blocks ?? [
          { type: "heading", text: "Draft baru" },
          { type: "paragraph", text: "Area ini adalah preview struktur editor. Implementasi Tiptap menunggu konfirmasi dependency." },
        ]} />

        <footer className="block-editor-footer">
          <span><SpriteIcon id="icon-database-offline" size={14} /> Autosave belum aktif</span>
          <span>Slug: {post?.slug ?? "auto-dari-judul"}</span>
        </footer>
      </section>
    </RequireLoginGate>
  );
}
