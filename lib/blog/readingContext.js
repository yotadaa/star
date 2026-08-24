function normalizedTags(post) {
  return Array.isArray(post?.tags)
    ? post.tags.map((tag) => String(tag || "").trim()).filter(Boolean)
    : [];
}

function publishedTimestamp(post) {
  for (const value of [post?.datePublished, post?.publishedAt]) {
    if (typeof value === "number" && Number.isFinite(value) && value > 0) return value;
    const parsed = Date.parse(String(value || ""));
    if (Number.isFinite(parsed) && parsed > 0) return parsed;
  }
  return 0;
}

function readablePost(post) {
  const status = String(post?.status || "").toLowerCase();
  return status === "published" || status === "local-preview";
}

export function buildBlogReadingContext(currentPost, posts, { recentLimit = 2, relatedLimit = 3 } = {}) {
  const currentSlug = String(currentPost?.slug || "");
  const seenSlugs = new Set();
  const candidates = [];

  (Array.isArray(posts) ? posts : []).forEach((post, sourceIndex) => {
    const slug = String(post?.slug || "").trim();
    if (!slug || slug === currentSlug || seenSlugs.has(slug) || !readablePost(post)) return;
    seenSlugs.add(slug);
    candidates.push({ post, sourceIndex, publishedAt: publishedTimestamp(post) });
  });

  const byRecency = [...candidates].sort((left, right) => {
    return right.publishedAt - left.publishedAt || left.sourceIndex - right.sourceIndex;
  });
  const recentPosts = byRecency.slice(0, Math.max(0, recentLimit)).map((candidate) => candidate.post);
  const currentTags = new Map(normalizedTags(currentPost).map((tag) => [tag.toLocaleLowerCase(), tag]));

  const rankedRelated = candidates
    .map((candidate) => {
      const matchingTags = normalizedTags(candidate.post).filter((tag) => currentTags.has(tag.toLocaleLowerCase()));
      return { ...candidate, matchingTags };
    })
    .sort((left, right) => {
      return right.matchingTags.length - left.matchingTags.length
        || right.publishedAt - left.publishedAt
        || left.sourceIndex - right.sourceIndex;
    });

  const relatedPosts = rankedRelated
    .slice(0, Math.max(0, relatedLimit))
    .map(({ post, matchingTags }) => ({ post, matchingTags }));

  return { recentPosts, relatedPosts };
}
