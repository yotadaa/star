import path from "node:path";
import { buildNativePayload } from "../build-native-blog-payload.mjs";

const packageDir = path.dirname(new URL(import.meta.url).pathname);
const slug = "did-google-august-2026-spam-update-target-ai-content";

const payload = buildNativePayload(packageDir, {
  title: "Did Google's August 2026 Spam Update Target AI Content?",
  slug,
  excerpt:
    "Google confirmed a global spam update on August 18–21 but did not name AI content as a target. The policy, volatility data, and diagnostic limits point to a narrower answer.",
  publishedAt: "2026-09-01T01:39:25+07:00",
  tags: ["Google Search", "Spam Update", "AI Content", "SEO", "Search Console"],
  coverTone: "research",
  sourceHref: "https://status.search.google.com/incidents/LEubPCm2octf2uMqCFKE",
  seoTitle: "Did Google's August 2026 Spam Update Target AI?",
  seoDescription:
    "Google did not name AI content as a target of its August 2026 spam update. This evidence-led guide separates policy, SERP volatility, speculation, and diagnosis.",
  language: "en-US",
  articleSection: "AI Investigation",
  featuredAssetKey: `blog:${slug}:feature-fact-versus-speculation`,
  images: {
    [`blog:${slug}:feature-fact-versus-speculation`]: {
      alt: "An official August 18–21 timeline is separated from three speculative target claims by a magnifying glass marked evidence",
      caption:
        "Google's public record supplies the dates, global scope, and update label. A claim about a specific target needs additional evidence.",
      width: 1600,
      height: 900,
    },
    [`blog:${slug}:diagnostic-evidence-flow`]: {
      alt: "A five-step diagnostic flow moves from marking the timeline through Search Console segmentation and technical checks to one measured change",
      caption:
        "The sequence keeps the graph, possible causes, and corrective action separate so one change does not erase evidence for another.",
      width: 1600,
      height: 1000,
    },
  },
});

console.log(JSON.stringify({ slug: payload.slug, blocks: payload.blocks.length, readTime: payload.readTime }));
