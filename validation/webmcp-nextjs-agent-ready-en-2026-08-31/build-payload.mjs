import { buildNativePayload } from "../build-native-blog-payload.mjs";

const packageDir = import.meta.dirname;
const slug = "webmcp-vs-mcp-nextjs-agent-ready";
const images = {
  [`blog:${slug}:feature-tool-index`]: {
    width: 1672,
    height: 941,
    alt: "A laptop portfolio interface is connected by thread to five physical index tabs labeled Search, Filter, Project, Research, and Contact, beside a read-only stamp.",
  },
  [`blog:${slug}:evidence-tool-surface`]: {
    width: 1600,
    height: 900,
    alt: "Diagram of five WebMCP tools: four read-only public lookups and one reversible project filter.",
  },
  [`blog:${slug}:evidence-live-filter`]: {
    width: 1265,
    height: 720,
    alt: "The live portfolio Projects page filtered to AI and All categories, showing two matching project cards.",
  },
};

const payload = buildNativePayload(packageDir, {
  title: "WebMCP vs MCP: Making a Next.js Website Agent-Ready Without Screen Scraping",
  slug,
  excerpt: "A five-tool WebMCP layer gives browser agents structured access to published Blog summaries, projects, research, contacts, and visible filters without exposing drafts or sending messages.",
  publishedAt: "2026-08-31T23:04:00+07:00",
  tags: ["WebMCP", "MCP", "Next.js", "AI Agents", "Web Standards"],
  sourceHref: "https://developer.chrome.com/docs/ai/webmcp",
  seoTitle: "WebMCP vs MCP for Next.js: Agent-Ready Website Guide",
  seoDescription: "Add WebMCP to Next.js with structured tools, safe published-only search, visible state updates, lifecycle cleanup, security boundaries, and MCP comparison.",
  language: "en-US",
  articleSection: "Technical Case Study",
  featuredAssetKey: `blog:${slug}:feature-tool-index`,
  images,
});
console.log(JSON.stringify({ slug: payload.slug, blocks: payload.blocks.length, readTime: payload.readTime }, null, 2));
