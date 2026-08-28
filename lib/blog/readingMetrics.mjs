export function normalizedReadingStats(value, slug = "") {
  return {
    slug: String(value?.slug || slug),
    viewCount: Math.max(0, Math.floor(Number(value?.viewCount || 0))),
    engagedReadCount: Math.max(0, Math.floor(Number(value?.engagedReadCount || 0))),
    averageActiveReadMs: Number.isFinite(value?.averageActiveReadMs)
      ? Math.max(0, Math.floor(value.averageActiveReadMs))
      : null,
  };
}

export function estimatedReadLabel(readTime) {
  const value = String(readTime || "").trim().replace(/\s+read$/i, "");
  return `${value || "Reading time not set"} estimated`;
}

export function viewLabel(value) {
  const count = Math.max(0, Math.floor(Number(value || 0)));
  return `${count.toLocaleString("en-US")} ${count === 1 ? "view" : "views"}`;
}

export function engagedReadLabel(value) {
  const count = Math.max(0, Math.floor(Number(value || 0)));
  return `${count.toLocaleString("en-US")} engaged ${count === 1 ? "read" : "reads"}`;
}

export function activeReadDuration(value) {
  if (!Number.isFinite(value) || value < 0) return null;
  const totalSeconds = Math.max(0, Math.round(value / 1_000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  if (!minutes) return `${seconds}s`;
  return seconds ? `${minutes}m ${seconds}s` : `${minutes}m`;
}

export function compactReadingLabel(post) {
  const stats = normalizedReadingStats(post?.readingStats, post?.slug);
  return `${estimatedReadLabel(post?.readTime)} · ${viewLabel(stats.viewCount)}`;
}

export function publicReadershipLabel(readTime, statsValue) {
  const stats = normalizedReadingStats(statsValue);
  const parts = [
    estimatedReadLabel(readTime),
    viewLabel(stats.viewCount),
    engagedReadLabel(stats.engagedReadCount),
  ];
  const average = activeReadDuration(stats.averageActiveReadMs);
  if (average) parts.push(`${average} average active read time`);
  return parts.join(", ");
}
