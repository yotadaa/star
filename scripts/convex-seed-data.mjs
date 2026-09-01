import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { caelestiaBlogPayload } from "./publish-caelestia-blog.mjs";
import { genbiRebrandingBlogPayload } from "./publish-genbi-rebranding-blog.mjs";
import { portfolioReadmeBlogPayload } from "./publish-portfolio-readme-blog.mjs";
import { stokTokoReviewBlogPayload } from "./publish-stok-toko-review-blog.mjs";
import { tnksWebBookingBlogPayload } from "./publish-tnks-web-booking-blog.mjs";
import { gpt6AstraRumorBlogPayload } from "./publish-gpt-6-astra-rumor-blog.mjs";
import { oxAlphaInvestigationBlogPayload } from "./publish-ox-alpha-investigation-blog.mjs";
import { dshStuckInstallationBlogPayload } from "./publish-dsh-stuck-installation-blog.mjs";
import { completeBlogSeoData } from "./blog-seo-data.mjs";

const SHARDS = ["s1", "s2", "s3"];
const GROUNDED_BLOG_PAYLOAD_PATHS = [
  "validation/harness-more-important-than-model-2026-08-24/payload.json",
  "validation/bid-slot-websites-2026-08-24/payload.json",
  "validation/xiaomi-xring-o3-2026-08-24/payload.json",
  "validation/why-100-agent-skills-can-be-worse-than-5-2026-08-24/payload.json",
  "validation/model-switch-prompt-cache-2026-08-24/payload.json",
  "validation/claude-compact-quality-2026-08-24/payload.json",
  "validation/claude-code-limit-burn-2026-08-24/payload.json",
  "validation/niu-lai-worst-animation-human-made-2026-08-24/payload.json",
  "validation/anthropic-watermark-removers-2026-08-24/payload.json",
  "validation/x-original-content-rewards-repost-economy-2026-08-24/payload.json",
  "validation/moltbook-ai-agents-social-network-2026-08-24/payload.json",
  "validation/human-made-ai-slop-selling-point-2026-08-24/payload.json",
  "validation/instagram-real-content-labeled-ai-2026-08-24/payload.json",
  "validation/ox-alpha-glm-5-3-flash-investigation-2026-08-27/payload.json",
  "validation/ox-alpha-anonymous-preview-2026-08-28/payload.json",
  "validation/openai-plus-five-hour-limit-2026-08-30/payload.json",
  "validation/codex-limit-grace-removed-2026-08-30/payload.json",
  "validation/openai-bel-rumor-investigation-2026-08-28/payload.json",
  "validation/free-portfolio-stack-nextjs-convex-r2-vercel-2026-08-30/payload.json",
  "validation/cloudflare-workers-vs-vercel-nextjs-free-2026-08-30/payload.json",
  "validation/open-source-tools-2026-stack-that-works-together-2026-08-30/payload.json",
  "validation/hacktoberfest-2026-english/payload.json",
  "validation/hacktoberfest-2026-indonesian/payload.json",
  "validation/nodejs-26-nextjs-en-2026-08-31/payload.json",
  "validation/nodejs-26-nextjs-id-2026-08-31/payload.json",
  "validation/webmcp-nextjs-agent-ready-en-2026-08-31/payload.json",
  "validation/webmcp-nextjs-agent-ready-id-2026-08-31/payload.json",
  "validation/google-august-2026-spam-update-ai-content-2026-09-01/payload.json",
  "validation/did-google-august-2026-spam-update-target-ai-content-2026-09-01/payload.json",
];

function readGroundedBlogPayloads() {
  return GROUNDED_BLOG_PAYLOAD_PATHS.map((relativePath) => {
    const payload = JSON.parse(fs.readFileSync(path.resolve(relativePath), "utf8"));
    if (!payload.slug) throw new Error(`Grounded blog payload has no slug: ${relativePath}`);
    return { id: `blog-${payload.slug}`, ...payload };
  });
}

function routedId(shardId, namespace, sourceId) {
  return `${shardId}_${crypto.createHash("sha256").update(`${namespace}:${sourceId}`).digest("hex").slice(0, 32)}`;
}

function compactInventoryName(name) {
  const raw = String(name || "")
    .replace(/^(Scroll|Artifact|Medal|Key):\s*/i, "")
    .replace(/\s*\([^)]{24,}\)/g, "")
    .trim();
  const known = [
    [/Analisis Prediktif Tren Pendidikan/i, "KNN Education"],
    [/Prototype Sistem Informasi Terintegrasi/i, "E-Ticket TNKS"],
    [/Integrasi Agrowisata dan UMKM/i, "Virtual Tour UMKM"],
    [/Analisis Implementasi Algoritma Genetika/i, "GA Scheduler"],
    [/Nara\s*-/i, "Nara"],
    [/GenBI CMS/i, "GenBI CMS"],
    [/Word AI Draft/i, "Word AI Add-in"],
    [/IDR\/USD/i, "IDR/USD Forecast"],
    [/4 Publikasi/i, "4 Scholar Publications"],
    [/Vice President/i, "VP English Club"],
    [/Repo GitHub/i, "50+ GitHub Repos"],
    [/Finalis OSN-P/i, "OSN-P Finalist"],
    [/DIGDAYA/i, "DIGDAYA Hackathon"],
    [/PEDAS/i, "PEDAS National"],
    [/JICEST/i, "JICEST Committee"],
    [/Sitasi pertama/i, "First Citation"],
    [/h-index/i, "h-index 2"],
  ];
  for (const [pattern, label] of known) {
    if (pattern.test(raw)) return label;
  }
  return raw.length > 24 ? `${raw.slice(0, 23).trim()}...` : raw;
}

function cleanBlocks(blocks) {
  const allowedTypes = new Set(["heading", "paragraph", "quote", "list", "code", "image", "divider", "table", "icon"]);
  return Array.isArray(blocks)
    ? blocks
      .map((block) => {
        const type = allowedTypes.has(block?.type) ? block.type : "paragraph";
        return {
          type,
          text: String(block?.text || "").trim(),
          ...(type === "table" && Array.isArray(block?.rows)
            ? { rows: block.rows.map((row) => row.map((cell) => String(cell || "").trim())) }
            : {}),
          ...(type === "image" && block?.assetKey ? { assetKey: String(block.assetKey).trim() } : {}),
          ...(type === "image" && block?.src ? { src: String(block.src).trim() } : {}),
          ...(type === "image" && block?.alt ? { alt: String(block.alt).trim() } : {}),
          ...(type === "image" && Number(block?.width) > 0 ? { width: Math.floor(Number(block.width)) } : {}),
          ...(type === "image" && Number(block?.height) > 0 ? { height: Math.floor(Number(block.height)) } : {}),
        };
      })
      .filter((block) => block.type === "divider" || block.text || block.assetKey || block.src || block.rows?.length)
    : [];
}

function inventorySeeds(data) {
  return [
    ...data.publications.map((publication, index) => ({
      seedKey: `publication-${index}`,
      sourceId: publication.href,
      type: "scroll",
      icon: "icon-scroll",
      name: compactInventoryName(publication.title),
      fullName: publication.title,
      description: `${publication.venue} · ${publication.year}`,
      rarity: publication.citedBy > 1 ? "rare" : "common",
      acquiredAt: publication.year,
      linkTo: publication.href,
    })),
    ...data.featuredQuests.slice(0, 6).map((quest, index) => ({
      seedKey: `quest-${index}`,
      sourceId: quest.href,
      type: "artifact",
      icon: "icon-artifact-vase",
      name: compactInventoryName(quest.title),
      fullName: quest.title,
      description: quest.desc,
      rarity: quest.featured ? "rare" : "common",
      acquiredAt: quest.tier,
      linkTo: quest.href,
    })),
    ...data.achievements.map((achievement, index) => ({
      seedKey: `achievement-${index}`,
      sourceId: `${achievement.title}-${achievement.year}`,
      type: "medal",
      icon: "icon-trophy",
      name: compactInventoryName(achievement.title),
      fullName: achievement.title,
      description: `${achievement.org} · ${achievement.year}`,
      rarity: achievement.medal === "gold" ? "epic" : achievement.medal === "silver" ? "rare" : "common",
      acquiredAt: achievement.year,
      linkTo: undefined,
    })),
  ];
}

export function buildSeedTables(data) {
  const sourceBlogPosts = [
    ...data.blogPosts,
    {
      id: "blog-caelestia-island-suite",
      publishedAt: "2026-08-23",
      ...caelestiaBlogPayload,
    },
    {
      id: "blog-mukhtadas-portfolio",
      publishedAt: "2026-08-23",
      ...portfolioReadmeBlogPayload,
    },
    {
      id: "blog-stok-toko-project-review",
      publishedAt: "2026-08-23",
      ...stokTokoReviewBlogPayload,
    },
    {
      id: "blog-genbi-rebranding",
      publishedAt: "2026-08-23",
      ...genbiRebrandingBlogPayload,
    },
    {
      id: "blog-e-ticket-tnks-project-review",
      publishedAt: "2026-08-23",
      ...tnksWebBookingBlogPayload,
    },
    {
      id: "blog-gpt-6-astra-rumor-origin",
      publishedAt: "2026-08-24",
      ...gpt6AstraRumorBlogPayload,
    },
    {
      id: "blog-ox-alpha-api-left-a-trail",
      publishedAt: "2026-08-24",
      ...oxAlphaInvestigationBlogPayload,
    },
    {
      id: "blog-deepseek-harness-npx-stuck-pnpm-dlx-wrapper",
      publishedAt: "2026-08-24",
      ...dshStuckInstallationBlogPayload,
    },
    ...readGroundedBlogPayloads(),
  ];
  const blogPosts = sourceBlogPosts.map((post, index) => {
    const shard = SHARDS[index % SHARDS.length];
    const status = post.status === "published" ? "published" : "draft";
    const completed = completeBlogSeoData(
      { ...post, status },
      { requirePublishedImage: status === "published" },
    );
    const publishedAt = status === "published" && Number.isFinite(Date.parse(post.publishedAt))
      ? Date.parse(post.publishedAt)
      : undefined;
    return {
      legacyId: routedId(shard, "blog", post.id),
      legacyShardId: shard,
      slug: completed.slug,
      title: completed.title,
      excerpt: completed.excerpt || "",
      status,
      tags: completed.tags || [],
      ...(publishedAt ? { publishedAt } : {}),
      publishedAtLabel: publishedAt ? new Date(publishedAt).toISOString() : "Draft",
      readTime: completed.readTime || "4 min read",
      coverTone: completed.coverTone || "research",
      sourceHref: completed.sourceHref || "/blog",
      seoTitle: completed.seoTitle,
      seoDescription: completed.seoDescription,
      language: completed.language,
      author: completed.author,
      articleSection: completed.articleSection,
      ...(completed.featuredImage ? { featuredImage: completed.featuredImage } : {}),
      blocks: cleanBlocks(completed.blocks),
      createdAt: publishedAt ?? index + 1,
      updatedAt: publishedAt ?? index + 1,
      schemaVersion: 2,
    };
  });

  const inventoryItems = inventorySeeds(data).map((item, index) => {
    const shard = SHARDS[index % SHARDS.length];
    return {
      legacyId: routedId(shard, "inventory", item.seedKey),
      legacyShardId: shard,
      sourceKey: item.sourceId || item.seedKey,
      sourceId: item.sourceId,
      type: item.type,
      name: item.name,
      fullName: item.fullName,
      description: item.description || "",
      rarity: item.rarity || "common",
      icon: item.icon || "icon-artifact-vase",
      acquiredAt: item.acquiredAt || "Unlocked",
      ...(item.linkTo ? { linkTo: item.linkTo } : {}),
      status: "unlocked",
      metadata: {},
      createdAt: index,
      updatedAt: index,
      schemaVersion: 1,
    };
  });

  const intro = {
    legacyId: routedId("s1", "about", "intro"),
    legacyShardId: "s1",
    entryKey: "intro",
    title: "About Mukhtada",
    body:
      "I am Mukhtada Billah NSTs, an Information Systems student at the University of Jambi who enjoys turning research into products that work in practice. I focus on full-stack web development, AI tooling, and data science. I also enjoy teaching, writing research, and building useful things for the community.",
    payload: { affiliation: data.profile.affiliation, location: data.profile.location, type: "profile-intro" },
    status: "public",
    createdAt: 0,
    updatedAt: 0,
    schemaVersion: 1,
  };

  const captions = [
    ["about-caption", "About caption", `${data.profile.affiliation} · ${data.profile.location}`],
    ["projects-caption", "Projects caption", "Selected work across web development, AI, and data science. Filter by type or category, or browse all 57 repositories on GitHub."],
    ["research-caption", "Research caption", "Published, indexed research with verified Google Scholar citations."],
    ["blog-caption", "Blog caption", "Notes on research, web builds, and community work, stored and synchronized through Convex."],
    ["contact-caption", "Contact caption", "Have a project, a research question, or simply want to say hello? Choose the channel that suits you."],
  ].map(([entryKey, title, body], index) => ({
    entryKey,
    title,
    body,
    payload: { type: "page-caption" },
    status: "public",
    createdAt: index + 1,
    updatedAt: index + 1,
    schemaVersion: 1,
  }));

  const contactChannels = data.socials.map((channel, index) => {
    const shard = SHARDS[index % SHARDS.length];
    return {
      legacyId: routedId(shard, "contact", channel.key),
      legacyShardId: shard,
      channelKey: channel.key,
      label: channel.label,
      sub: channel.sub,
      cta: channel.cta,
      href: channel.href,
      tone: channel.tone,
      sortOrder: index,
      active: true,
      createdAt: index,
      updatedAt: index,
      schemaVersion: 1,
    };
  });

  return { blogPosts, inventoryItems, contentEntries: [intro, ...captions], contactChannels };
}

export const expectedSeedCounts = {
  blogPosts: 40,
  inventoryItems: 14,
  contentEntries: 6,
  contactChannels: 5,
};
