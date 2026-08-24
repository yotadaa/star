"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { PixelButton, SpriteIcon } from "@/components/claude";
import { getBlogFeaturedImage } from "@/lib/blog/featuredImage";
import BlogPostCard from "./BlogPostCard";

function primaryTag(post) {
  return post.tags?.[0] || "Lore";
}

export default function BlogPostList({ posts, canManageBlog = false }) {
  const [items, setItems] = useState(posts);
  const [actionState, setActionState] = useState("");
  const tags = useMemo(() => ["All", ...Array.from(new Set(items.flatMap((post) => post.tags || [])))], [items]);
  const [activeTag, setActiveTag] = useState("All");
  const [view, setView] = useState("list");
  const visiblePosts = activeTag === "All" ? items : items.filter((post) => (post.tags || []).includes(activeTag));

  async function archivePost(post) {
    setActionState(`Archiving ${post.title}...`);
    try {
      const response = await fetch(`/api/blog/posts/${post.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({ status: "archived" }),
      });
      const data = await response.json();
      if (!response.ok || !data.ok) throw new Error(data.message || data.error || "Archive failed");
      setItems((current) => current.filter((item) => item.id !== post.id));
      setActionState(`${post.title} archived`);
    } catch (error) {
      setActionState(error.message);
    }
  }

  return (
    <section className="blog-list-section" aria-label="Lore entries">
      <div className="blog-toolbar">
        <div className="cat-filters" role="tablist" aria-label="Filter Blog categories">
          {tags.map((tag) => (
            <PixelButton
              key={tag}
              className="blog-filter-button"
              selected={activeTag === tag}
              onClick={() => setActiveTag(tag)}
              role="tab"
              aria-selected={activeTag === tag}
            >
              {tag}
            </PixelButton>
          ))}
        </div>

        <div className="toolbar-right">
          {actionState && <span className="blog-toolbar-status">{actionState}</span>}
          <div className="blog-view-toggle" aria-label="Change Blog layout">
            <button
              type="button"
              className={view === "grid" ? "active" : ""}
              onClick={() => setView("grid")}
              aria-pressed={view === "grid"}
              title="Grid view"
            >
              <SpriteIcon id="icon-grid" size={15} />
            </button>
            <button
              type="button"
              className={view === "list" ? "active" : ""}
              onClick={() => setView("list")}
              aria-pressed={view === "list"}
              title="List view"
            >
              <SpriteIcon id="icon-list" size={15} />
            </button>
          </div>

          {canManageBlog && (
            <PixelButton as="a" href="/blog/admin/new" className="blog-new-button">
              <SpriteIcon id="icon-plus" size={14} />
              New article
            </PixelButton>
          )}
        </div>
      </div>

      {view === "grid" ? (
        <div className="blog-grid">
          {visiblePosts.map((post) => (
            <BlogPostCard key={post.id} post={post} canManageBlog={canManageBlog} />
          ))}
        </div>
      ) : (
        <div className="blog-list hardcard">
          {visiblePosts.map((post) => {
            const featuredImage = getBlogFeaturedImage(post);
            return (
              <article className="blog-row" key={post.id}>
                <Link href={`/blog/${post.slug}`} className={`blog-row-thumb blog-row-thumb-${post.coverTone || "research"}`} aria-label={`Read ${post.title}`}>
                  <span className="blog-cover-fallback" aria-hidden="true">
                    <SpriteIcon id="icon-blog-page" size={18} />
                  </span>
                  {featuredImage && (
                    <img
                      className="blog-cover-image"
                      src={featuredImage.src}
                      alt=""
                      aria-hidden="true"
                      loading="lazy"
                      decoding="async"
                      onError={(event) => {
                        event.currentTarget.hidden = true;
                      }}
                    />
                  )}
                </Link>
                <div className="blog-row-content">
                  <h2><Link href={`/blog/${post.slug}`}>{post.title}</Link></h2>
                  <p>{post.excerpt}</p>
                </div>
                <div className="blog-row-meta">{post.readTime} · {primaryTag(post)} · {Math.max(0, Number(post.upvoteCount || 0))} votes</div>
                {canManageBlog && (
                  <div className="blog-row-actions">
                    <Link href={`/blog/admin/${post.id}/edit`} aria-label={`Edit ${post.title}`}>
                      <SpriteIcon id="icon-pencil" size={13} />
                    </Link>
                    <button type="button" aria-label={`Archive ${post.title}`} onClick={() => archivePost(post)}>
                      <SpriteIcon id="icon-trash" size={13} />
                    </button>
                  </div>
                )}
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}
