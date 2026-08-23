import { absoluteUrl } from "@/lib/seo";
import { renderSitemapIndex, sitemapResponse } from "@/lib/sitemapXml";

export const dynamic = "force-static";

export function GET() {
  return sitemapResponse(renderSitemapIndex([
    { url: absoluteUrl("/sitemap-pages.xml") },
    { url: absoluteUrl("/sitemap-blog.xml") },
  ]));
}
