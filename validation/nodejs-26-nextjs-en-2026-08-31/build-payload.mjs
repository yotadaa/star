import { buildNativePayload } from "../build-native-blog-payload.mjs";

const packageDir = import.meta.dirname;
const slug = "nodejs-26-lts-nextjs-upgrade-guide";
const images = {
  [`blog:${slug}:feature-runtime-workbench`]: {
    width: 1672,
    height: 941,
    alt: "Two compact computers labeled Node 24 LTS and Node 26 Current sit on a worn test bench with build printouts and a stopwatch.",
  },
  [`blog:${slug}:evidence-compatibility-probe`]: {
    width: 1600,
    height: 900,
    alt: "Bar chart comparing one clean Next.js build, first local HTTP 200, and a server memory snapshot under Node 24.20.0 and Node 26.7.0.",
  },
};

const payload = buildNativePayload(packageDir, {
  title: "Node.js 26 LTS for Next.js: What Breaks, What Changes, and When to Upgrade",
  slug,
  excerpt: "Node.js 26 builds and starts a current Next.js project, but LTS timing, removed internals, Vercel support, Convex runtimes, and route tests still determine the production date.",
  publishedAt: "2026-08-31T23:02:00+07:00",
  tags: ["Node.js 26", "Next.js", "JavaScript", "Vercel", "Convex"],
  sourceHref: "https://nodejs.org/en/blog/release/v26.0.0",
  seoTitle: "Node.js 26 LTS for Next.js: Upgrade Guide",
  seoDescription: "Test Node.js 26 with Next.js: LTS date, Temporal, removed APIs, Node 24 comparison, Vercel and Convex limits, compatibility matrix, and upgrade plan.",
  language: "en-US",
  articleSection: "Technical Case Study",
  featuredAssetKey: `blog:${slug}:feature-runtime-workbench`,
  images,
});
console.log(JSON.stringify({ slug: payload.slug, blocks: payload.blocks.length, readTime: payload.readTime }, null, 2));
