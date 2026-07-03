"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import RequireLoginGate from "@/components/auth/RequireLoginGate";
import { PixelButton, SpriteIcon } from "@/components/claude";
import BlogPostRenderer from "./BlogPostRenderer";

const toolbar = [
  { label: "H2", title: "Heading", type: "heading" },
  { label: "P", title: "Paragraph", type: "paragraph" },
  { label: "Quote", title: "Quote", type: "quote" },
];

export default function BlockEditorPreview({ post }) {
  const router = useRouter();
  const [title, setTitle] = useState(post?.title ?? "Judul post baru");
  const [excerpt, setExcerpt] = useState(post?.excerpt ?? "");
  const [slug, setSlug] = useState(post?.slug ?? "");
  const [tags, setTags] = useState(post?.tags?.join(", ") ?? "");
  const [status, setStatus] = useState(post?.status === "published" ? "published" : "draft");
  const [sourceHref, setSourceHref] = useState(post?.sourceHref ?? "/blog");
  const [blocks, setBlocks] = useState(post?.blocks?.length ? post.blocks : [
    { type: "heading", text: "Draft baru" },
    { type: "paragraph", text: "Tulis catatan proses, keputusan teknis, dan bukti kerja di sini." },
  ]);
  const [saveState, setSaveState] = useState({ status: "idle", message: "Ready" });
  const endpoint = post?.storage?.shardId ? `/api/blog/posts/${post.id}` : "/api/blog/posts";
  const method = post?.storage?.shardId ? "PATCH" : "POST";

  const previewPost = useMemo(
    () => ({
      ...post,
      title,
      excerpt,
      slug,
      tags: tags.split(",").map((tag) => tag.trim()).filter(Boolean),
      status,
      sourceHref,
      blocks,
    }),
    [blocks, excerpt, post, slug, sourceHref, status, tags, title]
  );

  function addBlock(type) {
    setBlocks((items) => [...items, { type, text: type === "heading" ? "Subjudul baru" : "Paragraf baru" }]);
  }

  function updateBlock(index, patch) {
    setBlocks((items) => items.map((item, itemIndex) => (itemIndex === index ? { ...item, ...patch } : item)));
  }

  function removeBlock(index) {
    setBlocks((items) => items.filter((_, itemIndex) => itemIndex !== index));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setSaveState({ status: "saving", message: "Menyimpan ke shard..." });

    const payload = {
      title,
      excerpt,
      slug,
      tags: tags.split(",").map((tag) => tag.trim()).filter(Boolean),
      status,
      sourceHref,
      readTime: post?.readTime ?? "4 min baca",
      coverTone: post?.coverTone ?? "research",
      blocks,
    };

    try {
      const response = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await response.json();
      if (!response.ok || !data.ok) {
        throw new Error(data.message || data.error || "Save failed");
      }
      setSaveState({ status: "saved", message: `Saved via ${data.source}` });
      router.refresh();
      if (data.post?.slug) router.push(`/blog/admin/${data.post.id}/edit`);
    } catch (error) {
      setSaveState({ status: "error", message: error.message });
    }
  }

  return (
    <RequireLoginGate
      title="Login ke System"
      description="Editor block membutuhkan autentikasi owner sebelum menyimpan ke CMS."
    >
      <form className="block-editor-preview hardcard" aria-label="Blog block editor" onSubmit={handleSubmit}>
        <header className="block-editor-header">
          <div>
            <span className="pixel-label">// BLOCK EDITOR</span>
            <input value={title} onChange={(event) => setTitle(event.target.value)} aria-label="Judul post" />
          </div>
          <PixelButton className="blog-publish-button" disabled={saveState.status === "saving"}>
            <SpriteIcon id="icon-blog-page" size={15} />
            {saveState.status === "saving" ? "Saving" : status === "published" ? "Publish" : "Save Draft"}
          </PixelButton>
        </header>

        <div className="block-editor-meta">
          <label>
            Slug
            <input value={slug} onChange={(event) => setSlug(event.target.value)} placeholder="auto-dari-judul" />
          </label>
          <label>
            Tags
            <input value={tags} onChange={(event) => setTags(event.target.value)} placeholder="Research, Web" />
          </label>
          <label>
            Source
            <input value={sourceHref} onChange={(event) => setSourceHref(event.target.value)} placeholder="/blog" />
          </label>
          <label>
            Status
            <select value={status} onChange={(event) => setStatus(event.target.value)}>
              <option value="draft">Draft</option>
              <option value="published">Published</option>
            </select>
          </label>
          <label className="block-editor-wide">
            Excerpt
            <textarea rows={3} value={excerpt} onChange={(event) => setExcerpt(event.target.value)} />
          </label>
        </div>

        <div className="block-editor-toolbar" aria-label="Toolbar editor">
          {toolbar.map((item) => (
            <button key={item.title} type="button" title={item.title} onClick={() => addBlock(item.type)}>
              {item.label}
            </button>
          ))}
        </div>

        <div className="block-editor-workbench">
          <div className="block-editor-fields" aria-label="Editable blocks">
            {blocks.map((block, index) => (
              <div className="block-editor-row" key={`${block.type}-${index}`}>
                <label>
                  Type
                  <select value={block.type} onChange={(event) => updateBlock(index, { type: event.target.value })}>
                    <option value="heading">Heading</option>
                    <option value="paragraph">Paragraph</option>
                    <option value="quote">Quote</option>
                  </select>
                </label>
                <label className="block-editor-block-text">
                  Text
                  <textarea rows={block.type === "heading" ? 2 : 4} value={block.text} onChange={(event) => updateBlock(index, { text: event.target.value })} />
                </label>
                <button type="button" className="block-editor-remove" onClick={() => removeBlock(index)} aria-label={`Hapus block ${index + 1}`}>
                  X
                </button>
              </div>
            ))}
          </div>
          <div className="block-editor-live-preview" aria-label="Live preview">
            <span className="pixel-label">// LIVE PREVIEW</span>
            <BlogPostRenderer blocks={previewPost.blocks} />
          </div>
        </div>

        <footer className="block-editor-footer">
          <span><SpriteIcon id={saveState.status === "saved" ? "icon-database-online" : "icon-database-offline"} size={14} /> {saveState.message}</span>
          <span>Slug: {slug || "auto-dari-judul"}</span>
        </footer>
      </form>
    </RequireLoginGate>
  );
}
