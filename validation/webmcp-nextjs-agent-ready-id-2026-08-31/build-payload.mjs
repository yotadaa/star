import { buildNativePayload } from "../build-native-blog-payload.mjs";

const packageDir = import.meta.dirname;
const slug = "webmcp-vs-mcp-nextjs-agent-ready-id";
const images = {
  [`blog:${slug}:feature-tool-index`]: {
    width: 1672,
    height: 941,
    alt: "Antarmuka portfolio pada laptop terhubung dengan benang ke lima tab indeks fisik berlabel Search, Filter, Project, Research, dan Contact, di samping stempel read-only.",
  },
  [`blog:${slug}:evidence-tool-surface`]: {
    width: 1600,
    height: 900,
    alt: "Diagram lima tool WebMCP: empat lookup publik read-only dan satu filter proyek yang dapat dikembalikan.",
  },
  [`blog:${slug}:evidence-live-filter`]: {
    width: 1265,
    height: 720,
    alt: "Halaman Projects pada portfolio asli difilter ke tipe AI dan kategori All, menampilkan dua kartu proyek yang cocok.",
  },
};

const payload = buildNativePayload(packageDir, {
  title: "WebMCP vs MCP: Cara Membuat Website Next.js Agent-Ready Tanpa Screen Scraping",
  slug,
  excerpt: "Lapisan WebMCP lima tool memberi browser agent akses terstruktur ke Blog terbit, project, research, channel kontak, dan filter yang terlihat tanpa membocorkan draft atau mengirim pesan.",
  publishedAt: "2026-08-31T23:05:00+07:00",
  tags: ["WebMCP", "MCP", "Next.js", "AI Agents", "Web Standards"],
  sourceHref: "https://developer.chrome.com/docs/ai/webmcp",
  seoTitle: "WebMCP vs MCP di Next.js: Panduan Website Agent-Ready",
  seoDescription: "Tambahkan WebMCP ke Next.js dengan tool terstruktur, pencarian published-only, sinkronisasi state, lifecycle cleanup, batas keamanan, dan perbandingan MCP.",
  language: "id-ID",
  articleSection: "Technical Case Study",
  featuredAssetKey: `blog:${slug}:feature-tool-index`,
  images,
});
console.log(JSON.stringify({ slug: payload.slug, blocks: payload.blocks.length, readTime: payload.readTime }, null, 2));
