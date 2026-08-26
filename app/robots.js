import { absoluteUrl } from "@/lib/seo";

export default function robots() {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/api/",
        "/manage",
        "/blog/admin",
        "/forbidden",
        "/redirect",
      ],
    },
    sitemap: absoluteUrl("/sitemap.xml"),
  };
}
