export const PUBLIC_PORTFOLIO_ROUTES = new Set([
  "/",
  "/about",
  "/blog",
  "/contact",
  "/projects",
  "/research",
]);

export function isPublicPortfolioPath(pathname) {
  const path = String(pathname || "").split(/[?#]/, 1)[0] || "/";
  return PUBLIC_PORTFOLIO_ROUTES.has(path) || path.startsWith("/blog/");
}
