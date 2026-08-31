import { absoluteUrl } from "@/lib/seo";
import { renderUrlSet, sitemapResponse } from "@/lib/sitemapXml";

export const dynamic = "force-static";

const PUBLIC_ROUTES = [
  { path: "/", changeFrequency: "monthly", priority: 1 },
  { path: "/about", changeFrequency: "monthly", priority: 0.8 },
  { path: "/projects", changeFrequency: "weekly", priority: 0.9 },
  { path: "/research", changeFrequency: "monthly", priority: 0.8 },
  { path: "/blog", changeFrequency: "weekly", priority: 0.8 },
  { path: "/contact", changeFrequency: "yearly", priority: 0.6 },
  { path: "/lore", changeFrequency: "monthly", priority: 0.7 },
];

export function GET() {
  return sitemapResponse(renderUrlSet(PUBLIC_ROUTES.map(({ path, ...entry }) => ({
    url: absoluteUrl(path),
    ...entry,
  }))));
}
