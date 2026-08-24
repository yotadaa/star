import crypto from "node:crypto";
import { caelestiaBlogPayload } from "./publish-caelestia-blog.mjs";
import { genbiRebrandingBlogPayload } from "./publish-genbi-rebranding-blog.mjs";
import { portfolioReadmeBlogPayload } from "./publish-portfolio-readme-blog.mjs";
import { stokTokoReviewBlogPayload } from "./publish-stok-toko-review-blog.mjs";
import { tnksWebBookingBlogPayload } from "./publish-tnks-web-booking-blog.mjs";
import { gpt6AstraRumorBlogPayload } from "./publish-gpt-6-astra-rumor-blog.mjs";

const SHARDS = ["s1", "s2", "s3"];

function routedId(shardId, namespace, sourceId) {
  return `${shardId}_${crypto.createHash("sha256").update(`${namespace}:${sourceId}`).digest("hex").slice(0, 32)}`;
}

function compactInventoryName(name) {
  const raw = String(name || "")
    .replace(/^(Scroll|Artifact|Medal|Key):\s*/i, "")
    .replace(/\s*\([^)]{24,}\)/g, "")
    .trim();
  const known = [
    [/Analisis Prediktif Tren Pendidikan/i, "KNN Pendidikan"],
    [/Prototype Sistem Informasi Terintegrasi/i, "E-Ticket TNKS"],
    [/Integrasi Agrowisata dan UMKM/i, "Virtual Tour UMKM"],
    [/Analisis Implementasi Algoritma Genetika/i, "GA Scheduler"],
    [/Nara\s*-/i, "Nara"],
    [/GenBI CMS/i, "GenBI CMS"],
    [/Word AI Draft/i, "Word AI Add-in"],
    [/IDR\/USD/i, "IDR/USD Forecast"],
    [/4 Publikasi/i, "4 Publikasi Scholar"],
    [/Vice President/i, "VP English Club"],
    [/Repo GitHub/i, "50+ GitHub Repos"],
    [/Finalis OSN-P/i, "Finalis OSN-P"],
    [/DIGDAYA/i, "DIGDAYA Hackathon"],
    [/PEDAS/i, "PEDAS Nasional"],
    [/JICEST/i, "JICEST Committee"],
    [/Sitasi pertama/i, "Sitasi Pertama"],
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
  ];
  const blogPosts = sourceBlogPosts.map((post, index) => {
    const shard = SHARDS[index % SHARDS.length];
    return {
      legacyId: routedId(shard, "blog", post.id),
      legacyShardId: shard,
      slug: post.slug,
      title: post.title,
      excerpt: post.excerpt || "",
      status: "published",
      tags: post.tags || [],
      publishedAt: Number.isFinite(Date.parse(post.publishedAt)) ? Date.parse(post.publishedAt) : index,
      publishedAtLabel: post.publishedAt || "CMS pending",
      readTime: post.readTime || "4 min baca",
      coverTone: post.coverTone || "research",
      sourceHref: post.sourceHref || "/blog",
      blocks: cleanBlocks(post.blocks),
      createdAt: 0,
      updatedAt: 0,
      schemaVersion: 1,
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
    title: "Tentang Mukhtada",
    body:
      "Aku Mukhtada Billah NSTs - mahasiswa Sistem Informasi Universitas Jambi yang senang mengubah riset jadi produk yang benar-benar jalan. Fokusku di fullstack web, AI tooling, dan data science. Aku suka mengajar, menulis riset, dan membangun hal-hal kecil yang berguna untuk komunitas.",
    payload: { affiliation: data.profile.affiliation, location: data.profile.location, type: "profile-intro" },
    status: "public",
    createdAt: 0,
    updatedAt: 0,
    schemaVersion: 1,
  };

  const captions = [
    ["about-caption", "About caption", `${data.profile.affiliation} · ${data.profile.location}`],
    ["projects-caption", "Projects caption", "Proyek pilihan lintas web, AI, dan data science. Saring berdasarkan tipe atau kategori - 57 repo selengkapnya ada di GitHub."],
    ["research-caption", "Research caption", "Riset yang benar-benar terbit, terindeks, dan tersitasi di Google Scholar."],
    ["blog-caption", "Blog caption", "Catatan proses riset, web build, dan community work. Konten sekarang disimpan dan disinkronkan melalui Convex."],
    ["contact-caption", "Contact caption", "Punya proyek, riset, atau sekadar mau menyapa? Pilih kanal yang paling nyaman buatmu."],
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
  blogPosts: 9,
  inventoryItems: 14,
  contentEntries: 6,
  contactChannels: 5,
};
