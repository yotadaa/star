import "server-only";
import { absoluteUrl, SITE_URL } from "@/lib/seo";
import {
  INDEXNOW_KEY_PATH,
  submitIndexNowUrls,
  validateIndexNowKey,
} from "@/lib/indexNowCore.mjs";

export function configuredIndexNowKey() {
  return validateIndexNowKey(process.env.INDEXNOW_API_KEY);
}
export async function submitConfiguredIndexNow(urls, options = {}) {
  return await submitIndexNowUrls({
    key: configuredIndexNowKey(),
    siteOrigin: SITE_URL,
    urls,
    keyPath: INDEXNOW_KEY_PATH,
    fetchImpl: options.fetchImpl,
    timeoutMs: options.timeoutMs,
  });
}

export async function notifyBlogChange({ post, previousPost = null }) {
  const wasPublic = ["published", "archived"].includes(previousPost?.status);
  const isPublicChange = ["published", "archived"].includes(post?.status);
  if (!wasPublic && !isPublicChange) {
    return { ok: true, skipped: true, reason: "draft-only" };
  }

  const paths = ["/blog"];
  if (previousPost?.slug) paths.push(`/blog/${encodeURIComponent(previousPost.slug)}`);
  if (post?.slug) paths.push(`/blog/${encodeURIComponent(post.slug)}`);

  try {
    return await submitConfiguredIndexNow(paths.map((path) => absoluteUrl(path)));
  } catch (error) {
    const result = {
      ok: false,
      code: error?.code || "INDEXNOW_ERROR",
      ...(error?.status ? { status: error.status } : {}),
    };
    console.warn("[indexnow] Blog URL notification failed", result);
    return result;
  }
}
