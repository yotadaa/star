import { buildNativePayload } from "../build-native-blog-payload.mjs";

const packageDir = import.meta.dirname;
const slug = "nodejs-26-lts-nextjs-panduan-upgrade";
const images = {
  [`blog:${slug}:feature-runtime-workbench`]: {
    width: 1672,
    height: 941,
    alt: "Dua komputer ringkas berlabel Node 24 LTS dan Node 26 Current berada di meja pengujian dengan hasil build dan stopwatch.",
  },
  [`blog:${slug}:evidence-compatibility-probe`]: {
    width: 1600,
    height: 900,
    alt: "Grafik batang membandingkan satu build Next.js bersih, HTTP 200 lokal pertama, dan snapshot memori server pada Node 24.20.0 dan Node 26.7.0.",
  },
};

const payload = buildNativePayload(packageDir, {
  title: "Node.js 26 LTS untuk Next.js: Apa yang Rusak, Apa yang Berubah, dan Kapan Upgrade",
  slug,
  excerpt: "Node.js 26 dapat membangun dan menjalankan proyek Next.js saat ini, tetapi status LTS, API yang dihapus, dukungan Vercel, runtime Convex, dan uji route tetap menentukan waktu produksi.",
  publishedAt: "2026-08-31T23:03:00+07:00",
  tags: ["Node.js 26", "Next.js", "JavaScript", "Vercel", "Convex"],
  sourceHref: "https://nodejs.org/en/blog/release/v26.0.0",
  seoTitle: "Node.js 26 LTS untuk Next.js: Panduan Upgrade",
  seoDescription: "Uji Node.js 26 dengan Next.js: tanggal LTS, Temporal, API yang dihapus, perbandingan Node 24, batas Vercel dan Convex, serta rencana upgrade.",
  language: "id-ID",
  articleSection: "Technical Case Study",
  featuredAssetKey: `blog:${slug}:feature-runtime-workbench`,
  images,
});
console.log(JSON.stringify({ slug: payload.slug, blocks: payload.blocks.length, readTime: payload.readTime }, null, 2));
