"use client";

import Link from "next/link";
import { useEffect, useId, useMemo, useRef, useState } from "react";
import { PixelButton, SpriteIcon } from "@/components/claude";
import { getBlogFeaturedImage } from "@/lib/blog/featuredImage";
import BlogPostCard from "./BlogPostCard";

const PRIMARY_TOPIC_LIMIT = 3;

function primaryTag(post) {
  return post.tags?.[0] || "Lore";
}

function rankTopics(posts) {
  const topics = new Map();
  let firstSeen = 0;

  posts.forEach((post) => {
    const postTopics = new Set();

    (post.tags || []).forEach((value) => {
      const topic = String(value || "").trim();
      if (!topic || postTopics.has(topic)) return;
      postTopics.add(topic);

      if (!topics.has(topic)) {
        topics.set(topic, { name: topic, count: 0, firstSeen: firstSeen++ });
      }
      topics.get(topic).count += 1;
    });
  });

  return Array.from(topics.values()).sort((left, right) => {
    return right.count - left.count || left.firstSeen - right.firstSeen || left.name.localeCompare(right.name);
  });
}

export default function BlogPostList({ posts, canManageBlog = false }) {
  const [items, setItems] = useState(posts);
  const [actionState, setActionState] = useState("");
  const [activeTag, setActiveTag] = useState("All");
  const [showMoreTopics, setShowMoreTopics] = useState(false);
  const [topicQuery, setTopicQuery] = useState("");
  const [view, setView] = useState("list");
  const moreTopicsId = useId();
  const moreTopicsButtonRef = useRef(null);
  const primaryTopicsRef = useRef(null);
  const rankedTopics = useMemo(() => rankTopics(items), [items]);
  const featuredTopics = useMemo(() => rankedTopics.slice(0, PRIMARY_TOPIC_LIMIT).map((topic) => topic.name), [rankedTopics]);
  const primaryTopics = useMemo(() => {
    if (showMoreTopics || activeTag === "All" || featuredTopics.includes(activeTag)) return featuredTopics;
    return [...featuredTopics.slice(0, Math.max(0, PRIMARY_TOPIC_LIMIT - 1)), activeTag];
  }, [activeTag, featuredTopics, showMoreTopics]);
  const primaryTopicSet = useMemo(() => new Set(primaryTopics), [primaryTopics]);
  const moreTopics = useMemo(() => rankedTopics.filter((topic) => !primaryTopicSet.has(topic.name)), [primaryTopicSet, rankedTopics]);
  const filteredMoreTopics = useMemo(() => {
    const query = topicQuery.trim().toLocaleLowerCase();
    if (!query) return moreTopics;
    return moreTopics.filter((topic) => topic.name.toLocaleLowerCase().includes(query));
  }, [moreTopics, topicQuery]);
  const visiblePosts = useMemo(
    () => (activeTag === "All" ? items : items.filter((post) => (post.tags || []).includes(activeTag))),
    [activeTag, items]
  );
  const hasMoreTopics = rankedTopics.length > PRIMARY_TOPIC_LIMIT;

  useEffect(() => {
    if (activeTag !== "All" && !rankedTopics.some((topic) => topic.name === activeTag)) {
      setActiveTag("All");
    }
  }, [activeTag, rankedTopics]);

  useEffect(() => {
    if (showMoreTopics) return;
    const rail = primaryTopicsRef.current;
    const selectedTopic = rail?.querySelector('[aria-pressed="true"]');
    if (!rail || !selectedTopic) return;

    const railBounds = rail.getBoundingClientRect();
    const topicBounds = selectedTopic.getBoundingClientRect();
    if (topicBounds.left < railBounds.left) rail.scrollLeft += topicBounds.left - railBounds.left;
    if (topicBounds.right > railBounds.right) rail.scrollLeft += topicBounds.right - railBounds.right;
  }, [activeTag, primaryTopics, showMoreTopics]);

  function selectTopic(topic) {
    setActiveTag(topic);
  }

  function toggleMoreTopics() {
    if (showMoreTopics) setTopicQuery("");
    setShowMoreTopics(!showMoreTopics);
  }

  function closeMoreTopics() {
    setShowMoreTopics(false);
    setTopicQuery("");
    requestAnimationFrame(() => moreTopicsButtonRef.current?.focus());
  }

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
        <div className="blog-toolbar-head">
          <div className="blog-filter-summary">
            <span className="pixel-label">// FILTER ARTICLES</span>
            <span className="blog-filter-result" role="status" aria-live="polite">
              {visiblePosts.length} {visiblePosts.length === 1 ? "article" : "articles"} · {activeTag === "All" ? "All topics" : activeTag}
            </span>
          </div>

          <div className="toolbar-right">
            {actionState && <span className="blog-toolbar-status">{actionState}</span>}
            <div className="blog-view-toggle" role="group" aria-label="Change Blog layout">
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

        <div className="blog-filter-primary-row">
          <div ref={primaryTopicsRef} className="cat-filters blog-filter-primary" role="group" aria-label="Frequent Blog topics">
            {["All", ...primaryTopics].map((tag) => (
              <PixelButton
                key={tag}
                className="blog-filter-button"
                selected={activeTag === tag}
                onClick={() => selectTopic(tag)}
                aria-pressed={activeTag === tag}
              >
                {tag}
              </PixelButton>
            ))}
          </div>

          {hasMoreTopics && (
            <button
              ref={moreTopicsButtonRef}
              type="button"
              className={`pixel-button blog-more-topics-button ${showMoreTopics ? "selected" : ""}`}
              onClick={toggleMoreTopics}
              aria-expanded={showMoreTopics}
              aria-controls={moreTopicsId}
              aria-label={showMoreTopics ? "Hide more Blog topics" : `Show ${moreTopics.length} more Blog topics`}
            >
              <span>More</span>
              <span className="blog-more-topics-copy">topics</span>
              <span aria-hidden="true">· {moreTopics.length}</span>
              <SpriteIcon id="icon-chevron-up" size={13} className="blog-more-topics-chevron" />
            </button>
          )}
        </div>

        {showMoreTopics && (
          <div
            id={moreTopicsId}
            className="blog-more-topics"
            onKeyDown={(event) => {
              if (event.key === "Escape") closeMoreTopics();
            }}
          >
            <label className="blog-topic-search">
              <span>Find a topic</span>
              <input
                type="search"
                value={topicQuery}
                onChange={(event) => setTopicQuery(event.target.value)}
                placeholder={`Search ${moreTopics.length} topics`}
                autoComplete="off"
              />
            </label>

            <div className="cat-filters blog-more-topic-list" role="group" aria-label="More Blog topics">
              {filteredMoreTopics.map((topic) => (
                <PixelButton
                  key={topic.name}
                  className="blog-filter-button"
                  selected={activeTag === topic.name}
                  onClick={() => selectTopic(topic.name)}
                  aria-pressed={activeTag === topic.name}
                >
                  {topic.name}
                </PixelButton>
              ))}
              {filteredMoreTopics.length === 0 && (
                <p className="blog-topic-empty" role="status">No matching topics.</p>
              )}
            </div>
          </div>
        )}
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
                      alt={featuredImage.alt || `Featured image for ${post.title}`}
                      aria-hidden="true"
                      loading="lazy"
                      decoding="async"
                      width={featuredImage.width}
                      height={featuredImage.height}
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
