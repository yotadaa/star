"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import RequireLoginGate from "@/components/auth/RequireLoginGate";
import { PixelButton, SpriteIcon } from "@/components/claude";
import { compressBlogImage, formatImageBytes } from "@/lib/blog/compressImage";
import BlogPostRenderer from "./BlogPostRenderer";

const BLOCK_TYPES = [
  { type: "heading", label: "Heading", icon: "icon-heading" },
  { type: "paragraph", label: "Paragraph", icon: "icon-editor-blocks" },
  { type: "quote", label: "Quote", icon: "icon-quote" },
  { type: "list", label: "Bullet list", icon: "icon-list" },
  { type: "table", label: "Table", icon: "icon-table" },
  { type: "icon", label: "Icon line", icon: "icon-star-level" },
  { type: "code", label: "Code block", icon: "icon-code" },
  { type: "image", label: "Image", icon: "icon-image" },
  { type: "divider", label: "Divider", icon: "icon-divider" },
];

const DEFAULT_AUTHOR = {
  id: "https://me.mukhtada.my.id/#person",
  name: "Mukhtada Billah NST",
  url: "https://me.mukhtada.my.id/",
};

function imageReference(image = {}) {
  return String(image.assetKey || image.storageId || image.src || "").trim();
}

function featuredImageForBlocks(blocks, existing) {
  const existingReference = imageReference(existing);
  const isMeasuredImage = (block) => (
    block.type === "image"
    && Number(block.width) > 0
    && Number(block.height) > 0
    && (block.storageId || block.assetKey || block.src)
  );
  const image = blocks.find((block) => (
    isMeasuredImage(block) && existingReference && imageReference(block) === existingReference
  )) || blocks.find(isMeasuredImage);
  if (!image) return undefined;
  return {
    ...(image.storageId ? { storageId: image.storageId } : {}),
    ...(image.assetKey ? { assetKey: image.assetKey } : {}),
    ...(!image.storageId && !image.assetKey && image.src ? { src: image.src } : {}),
    alt: image.alt || image.text || "Article image",
    width: Math.floor(Number(image.width)),
    height: Math.floor(Number(image.height)),
  };
}

function slugify(value) {
  return String(value || "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function newBlock(type = "paragraph") {
  if (type === "heading") return { type, text: "New subheading" };
  if (type === "quote") return { type, text: "An important note from the build process." };
  if (type === "list") return { type, text: "First point\nSecond point" };
  if (type === "code") return { type, text: "const quest = 'build';" };
  if (type === "image") return { type, text: "", src: "", alt: "" };
  if (type === "table") return { type, text: "Table", rows: [["Column 1", "Column 2"], ["Value", "Value"]] };
  if (type === "icon") return { type, text: "Important milestone" };
  if (type === "divider") return { type, text: "" };
  return { type, text: "" };
}

export default function BlockEditorPreview({ post }) {
  const router = useRouter();
  const surfaceRef = useRef(null);
  const [title, setTitle] = useState(post?.title ?? "");
  const [excerpt, setExcerpt] = useState(post?.excerpt ?? "");
  const [slug, setSlug] = useState(post?.slug ?? "");
  const [tags, setTags] = useState(post?.tags?.join(", ") ?? "");
  const [status, setStatus] = useState(post?.status === "published" ? "published" : "draft");
  const [sourceHref, setSourceHref] = useState(post?.sourceHref ?? "/blog");
  const [seoTitle, setSeoTitle] = useState(post?.seoTitle ?? post?.title ?? "");
  const [seoDescription, setSeoDescription] = useState(post?.seoDescription ?? post?.excerpt ?? "");
  const [language, setLanguage] = useState(post?.language ?? "en-US");
  const [articleSection, setArticleSection] = useState(post?.articleSection ?? "Blog");
  const [authorId, setAuthorId] = useState(post?.author?.id ?? DEFAULT_AUTHOR.id);
  const [authorName, setAuthorName] = useState(post?.author?.name ?? DEFAULT_AUTHOR.name);
  const [authorUrl, setAuthorUrl] = useState(post?.author?.url ?? DEFAULT_AUTHOR.url);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [activeMenu, setActiveMenu] = useState(null);
  const [bubble, setBubble] = useState(null);
  const [blocks, setBlocks] = useState(
    post?.blocks?.length
      ? post.blocks
      : [
          { type: "paragraph", text: "" },
        ]
  );
  const [saveState, setSaveState] = useState({ status: "idle", message: "Saved locally" });
  const isPersisted = Boolean(post?.id && post?.status !== "local-preview");
  const endpoint = isPersisted ? `/api/blog/posts/${post.id}` : "/api/blog/posts";
  const method = isPersisted ? "PATCH" : "POST";

  useEffect(() => {
    if (!post?.slug) setSlug(slugify(title));
  }, [post?.slug, title]);

  const previewPost = useMemo(
    () => ({
      ...post,
      title: title || "Untitled Lore",
      excerpt,
      slug,
      tags: tags.split(",").map((tag) => tag.trim()).filter(Boolean),
      status,
      sourceHref,
      seoTitle,
      seoDescription,
      language,
      articleSection,
      author: {
        id: authorId,
        name: authorName,
        url: authorUrl,
      },
      blocks,
    }),
    [articleSection, authorId, authorName, authorUrl, blocks, excerpt, language, post, seoDescription, seoTitle, slug, sourceHref, status, tags, title]
  );

  function insertBlock(afterIndex, type) {
    setBlocks((items) => {
      const next = [...items];
      next.splice(afterIndex + 1, 0, newBlock(type));
      return next;
    });
    setActiveMenu(null);
  }

  function updateBlock(index, patch) {
    setBlocks((items) => items.map((item, itemIndex) => (itemIndex === index ? { ...item, ...patch } : item)));
  }

  function removeBlock(index) {
    setBlocks((items) => (items.length > 1 ? items.filter((_, itemIndex) => itemIndex !== index) : [{ type: "paragraph", text: "" }]));
  }

  function applyBubble(action) {
    const selection = window.getSelection();
    const text = selection?.toString();
    if (!text) return;
    if (action === "bold") document.execCommand("bold");
    if (action === "italic") document.execCommand("italic");
    if (action === "link") document.execCommand("createLink", false, "#");
    if (action === "heading") document.execCommand("formatBlock", false, "h2");
    if (action === "quote") document.execCommand("formatBlock", false, "blockquote");
  }

  function handleSelection() {
    const selection = window.getSelection();
    if (!selection || !selection.toString().trim() || !surfaceRef.current?.contains(selection.anchorNode)) {
      setBubble(null);
      return;
    }
    const rect = selection.getRangeAt(0).getBoundingClientRect();
    setBubble({
      top: rect.top + window.scrollY - 48,
      left: rect.left + window.scrollX + rect.width / 2,
    });
  }

  async function savePost(nextStatus = status) {
    setSaveState({ status: "saving", message: "Saving to Convex..." });

    const savedBlocks = blocks.filter(
      (block) => block.type === "divider" || block.text || block.src || block.storageId || block.assetKey || block.rows?.length,
    );
    const payload = {
      title: title || "Untitled Lore",
      excerpt,
      slug: slug || slugify(title),
      tags: tags.split(",").map((tag) => tag.trim()).filter(Boolean),
      status: nextStatus,
      sourceHref,
      seoTitle: seoTitle || title || "Untitled Lore",
      seoDescription: seoDescription || excerpt,
      language,
      articleSection,
      author: {
        id: authorId,
        name: authorName,
        url: authorUrl,
      },
      readTime: post?.readTime ?? "4 min read",
      coverTone: post?.coverTone ?? "research",
      featuredImage: featuredImageForBlocks(savedBlocks, post?.featuredImage),
      blocks: savedBlocks,
    };

    try {
      const response = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify(payload),
      });
      const data = await response.json();
      if (!response.ok || !data.ok) {
        throw new Error(data.message || data.error || "Save failed");
      }
      setStatus(nextStatus);
      setSaveState({ status: "saved", message: `Saved via ${data.source}` });
      router.refresh();
      if (!isPersisted && data.post?.id) router.push(`/blog/admin/${data.post.id}/edit`);
    } catch (error) {
      setSaveState({ status: "error", message: error.message });
    }
  }

  return (
    <RequireLoginGate
      title="Sign in to the system"
      description="The block editor requires owner authentication before it can save to the CMS."
    >
      <section className="medium-editor" aria-label="Blog block editor">
        <div className="medium-editor-topbar">
          <span className="medium-editor-save-state">
            <span className={`medium-editor-led ${saveState.status}`} aria-hidden="true" />
            {saveState.message}
          </span>
          <div className="medium-editor-actions">
            <button type="button" className="settings-link" onClick={() => setSettingsOpen((open) => !open)}>
              Story settings
            </button>
            <PixelButton type="button" className="blog-publish-button" onClick={() => savePost("draft")} disabled={saveState.status === "saving"}>
              Save draft
            </PixelButton>
            <PixelButton type="button" className="blog-publish-button" onClick={() => savePost("published")} disabled={saveState.status === "saving"}>
              Publish
            </PixelButton>
          </div>
        </div>

        {settingsOpen && (
          <div className="story-settings-drawer hardcard">
            <label>
              Slug
              <input value={slug} onChange={(event) => setSlug(slugify(event.target.value))} placeholder="generated-from-title" />
            </label>
            <label>
              Tags
              <input value={tags} onChange={(event) => setTags(event.target.value)} placeholder="research, data" />
            </label>
            <label>
              Source
              <input value={sourceHref} onChange={(event) => setSourceHref(event.target.value)} placeholder="/blog" />
            </label>
            <label>
              Language
              <input value={language} onChange={(event) => setLanguage(event.target.value)} placeholder="en-US" />
            </label>
            <label>
              Article section
              <input value={articleSection} onChange={(event) => setArticleSection(event.target.value)} placeholder="Project Review" />
            </label>
            <label>
              Author
              <input value={authorName} onChange={(event) => setAuthorName(event.target.value)} placeholder="Author name" />
            </label>
            <label className="story-settings-wide">
              Author ID
              <input value={authorId} onChange={(event) => setAuthorId(event.target.value)} placeholder="https://example.com/#person" />
            </label>
            <label className="story-settings-wide">
              Author URL
              <input type="url" value={authorUrl} onChange={(event) => setAuthorUrl(event.target.value)} placeholder="https://example.com/" />
            </label>
            <label>
              Status
              <select value={status} onChange={(event) => setStatus(event.target.value)}>
                <option value="draft">Draft</option>
                <option value="published">Published</option>
              </select>
            </label>
            <label className="story-settings-wide">
              Excerpt
              <textarea rows={3} value={excerpt} onChange={(event) => setExcerpt(event.target.value)} placeholder="Short article summary..." />
            </label>
            <label className="story-settings-wide">
              SEO title
              <input value={seoTitle} maxLength={70} onChange={(event) => setSeoTitle(event.target.value)} placeholder="Search title, up to 70 characters" />
            </label>
            <label className="story-settings-wide">
              SEO description
              <textarea rows={3} value={seoDescription} maxLength={180} onChange={(event) => setSeoDescription(event.target.value)} placeholder="Search description, up to 180 characters" />
            </label>
          </div>
        )}

        <div className="writing-surface" ref={surfaceRef} onMouseUp={handleSelection} onKeyUp={handleSelection}>
          <textarea
            className="title-input"
            value={title}
            rows={1}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="Article title..."
            aria-label="Article title"
          />
          <p className="subtitle-hint">Type "/" or select "+" beside an empty row to insert a block.</p>

          <div className="editor-body">
            {blocks.map((block, index) => (
              <div className={`writer-block-row writer-block-${block.type}`} key={`${block.type}-${index}`}>
                <button
                  type="button"
                  className="block-plus"
                  onClick={() => setActiveMenu(activeMenu === index ? null : index)}
                  aria-label={`Add a block after row ${index + 1}`}
                >
                  <SpriteIcon id="icon-plus" size={13} />
                </button>

                {activeMenu === index && (
                  <div className="block-insert-menu">
                    {BLOCK_TYPES.map((item) => (
                      <button key={item.type} type="button" onClick={() => insertBlock(index, item.type)}>
                        <SpriteIcon id={item.icon} size={14} />
                        {item.label}
                      </button>
                    ))}
                  </div>
                )}

                <BlockInput block={block} onChange={(patch) => updateBlock(index, patch)} />
                <button type="button" className="writer-block-remove" onClick={() => removeBlock(index)} aria-label={`Delete block ${index + 1}`}>
                  <SpriteIcon id="icon-trash" size={13} />
                </button>
              </div>
            ))}
          </div>
        </div>

        {bubble && (
          <div className="editor-bubble-toolbar" style={{ top: bubble.top, left: bubble.left }}>
            {[
              ["bold", "icon-bold", "Bold"],
              ["italic", "icon-italic", "Italic"],
              ["link", "icon-link", "Link"],
              ["heading", "icon-heading", "Heading"],
              ["quote", "icon-quote", "Quote"],
            ].map(([action, icon, label]) => (
              <button key={action} type="button" onMouseDown={(event) => event.preventDefault()} onClick={() => applyBubble(action)} title={label}>
                <SpriteIcon id={icon} size={13} />
              </button>
            ))}
          </div>
        )}

        <details className="medium-preview">
          <summary>Preview render</summary>
          <BlogPostRenderer blocks={previewPost.blocks} />
        </details>
      </section>
    </RequireLoginGate>
  );
}

function BlockInput({ block, onChange }) {
  const [uploadState, setUploadState] = useState({ status: "idle", message: "" });

  async function uploadImage(file) {
    if (!file) return;
    setUploadState({ status: "uploading", message: "Preparing a high-quality compressed image..." });
    try {
      const result = await compressBlogImage(file);
      const form = new FormData();
      form.append("file", result.file);
      form.append("metadata", JSON.stringify({
        purpose: "blog-image-block",
        compression: {
          applied: result.compressed,
          originalBytes: result.originalBytes,
          outputBytes: result.outputBytes,
          originalWidth: result.originalWidth,
          originalHeight: result.originalHeight,
          width: result.width,
          height: result.height,
        },
      }));
      setUploadState({ status: "uploading", message: "Uploading the result to Convex Storage..." });
      const response = await fetch("/api/backend/files", {
        method: "POST",
        credentials: "same-origin",
        body: form,
      });
      const data = await response.json();
      if (!response.ok || !data.ok || !data.file?.storage_id || !data.file?.url) {
        throw new Error(data.message || data.error || "Image upload failed");
      }
      onChange({
        storageId: data.file.storage_id,
        assetKey: undefined,
        src: data.file.url,
        alt: block.alt || file.name,
        width: result.width,
        height: result.height,
      });
      const savings = result.originalBytes - result.outputBytes;
      setUploadState({
        status: "uploaded",
        message: result.compressed
          ? `Saved ${formatImageBytes(result.outputBytes)} · reduced by ${formatImageBytes(savings)} · ${result.width}×${result.height}px`
          : `Original saved at ${formatImageBytes(result.outputBytes)} · ${result.reason}`,
      });
    } catch (error) {
      setUploadState({ status: "error", message: error.message });
    }
  }

  if (block.type === "divider") {
    return (
      <div className="writer-divider" role="separator">
        <span />
      </div>
    );
  }

  if (block.type === "table") {
    const value = block.rows?.map((row) => row.join(" | ")).join("\n") || "";
    return (
      <textarea
        className="writer-table-input"
        value={value}
        rows={3}
        onChange={(event) =>
          onChange({
            text: "Table",
            rows: event.target.value.split(/\n+/).map((row) => row.split("|").map((cell) => cell.trim())),
          })
        }
        placeholder="Column 1 | Column 2&#10;Value | Value"
      />
    );
  }

  const props = {
    value: block.text || "",
    onChange: (event) => onChange({ text: event.target.value }),
    placeholder: block.type === "heading" ? "Subheading..." : block.type === "quote" ? "Quote..." : block.type === "list" ? "One item per line..." : block.type === "code" ? "Paste code..." : block.type === "image" ? "Image caption..." : block.type === "icon" ? "Milestone label..." : "Write here",
  };

  if (block.type === "heading") return <input className="writer-heading-input" {...props} />;
  if (block.type === "quote") return <textarea className="writer-quote-input" rows={2} {...props} />;
  if (block.type === "code") return <textarea className="writer-code-input" rows={4} {...props} />;
  if (block.type === "image") {
    const source = String(block.src || "").trim();
    const canPreview = (source.startsWith("/") && !source.startsWith("//")) || source.startsWith("https://");
    return (
      <div className="writer-image-placeholder">
        {canPreview ? (
          <img
            src={source}
            alt={block.alt || block.text || "Preview image block"}
            loading="lazy"
            decoding="async"
            width={block.width}
            height={block.height}
            onLoad={(event) => {
              const width = event.currentTarget.naturalWidth;
              const height = event.currentTarget.naturalHeight;
              if (width > 0 && height > 0 && (block.width !== width || block.height !== height)) {
                onChange({ width, height });
              }
            }}
          />
        ) : (
          <SpriteIcon id="icon-image" size={18} />
        )}
        <label>
          Upload image
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp"
            disabled={uploadState.status === "uploading"}
            onChange={(event) => uploadImage(event.target.files?.[0])}
          />
        </label>
        <span className={`writer-image-upload-state ${uploadState.status}`} aria-live="polite">
          {uploadState.message}
        </span>
        <label>
          External image URL
          <input
            value={block.src || ""}
            onChange={(event) => onChange({ src: event.target.value, storageId: undefined, assetKey: undefined, width: undefined, height: undefined })}
            placeholder="https://..."
            aria-invalid={Boolean(source) && !canPreview}
          />
        </label>
        <label>
          Alt text
          <input
            value={block.alt || ""}
            onChange={(event) => onChange({ alt: event.target.value })}
            placeholder="Describe the image"
          />
        </label>
        <label>
          Caption
          <input {...props} placeholder="Optional caption" />
        </label>
      </div>
    );
  }
  if (block.type === "icon") {
    return (
      <div className="writer-icon-line">
        <SpriteIcon id="icon-star-level" size={18} />
        <input {...props} />
      </div>
    );
  }
  return <textarea className="writer-paragraph-input" rows={block.type === "list" ? 3 : 1} {...props} />;
}
