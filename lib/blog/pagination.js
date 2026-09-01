export const BLOG_PAGE_SIZE = 10;

export function blogPageHref(page) {
  return page > 1 ? `/blog?page=${page}` : "/blog";
}

export function blogPageCount(postCount) {
  return Math.max(1, Math.ceil(Math.max(0, Number(postCount) || 0) / BLOG_PAGE_SIZE));
}
