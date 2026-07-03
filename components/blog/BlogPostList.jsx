"use client";

import { useMemo, useState } from "react";
import { PixelButton } from "@/components/claude";
import BlogPostCard from "./BlogPostCard";

export default function BlogPostList({ posts }) {
  const tags = useMemo(() => ["Semua", ...Array.from(new Set(posts.flatMap((post) => post.tags)))], [posts]);
  const [activeTag, setActiveTag] = useState("Semua");
  const visiblePosts = activeTag === "Semua" ? posts : posts.filter((post) => post.tags.includes(activeTag));

  return (
    <section className="blog-list-section" aria-label="Lore entries">
      <div className="blog-filter-row" role="tablist" aria-label="Filter tag blog">
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

      <div className="blog-grid">
        {visiblePosts.map((post) => (
          <BlogPostCard key={post.id} post={post} />
        ))}
      </div>
    </section>
  );
}
