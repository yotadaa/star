import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";

const root = process.cwd();
const envPath = path.join(root, ".env.local");

function readEnvFile(filePath) {
  const entries = {};
  if (!fs.existsSync(filePath)) return entries;

  for (const line of fs.readFileSync(filePath, "utf8").split(/\r?\n/)) {
    if (!line || line.trimStart().startsWith("#") || !line.includes("=")) continue;
    const index = line.indexOf("=");
    entries[line.slice(0, index)] = line.slice(index + 1);
  }

  return entries;
}

function readShard(index, env) {
  const prefix = `SUPABASE_SHARD_${index}`;
  return {
    id: env[`${prefix}_ID`] || `s${index}`,
    url: env[`${prefix}_URL`],
    key: env[`${prefix}_PUBLISHABLE_KEY`],
    projectRef: env[`${prefix}_PROJECT_REF`],
  };
}

function routedId(shardId, namespace, sourceId) {
  return `${shardId}_${crypto.createHash("sha256").update(`${namespace}:${sourceId}`).digest("hex").slice(0, 32)}`;
}

function cleanBlocks(blocks) {
  return Array.isArray(blocks)
    ? blocks
        .map((block) => ({
          type: ["heading", "paragraph", "quote"].includes(block?.type) ? block.type : "paragraph",
          text: String(block?.text || "").trim(),
        }))
        .filter((block) => block.text)
    : [];
}

function pickShard(items, index) {
  return items[index % items.length];
}

async function upsertOrThrow(shard, appKey, table, rows, conflict) {
  if (rows.length === 0) return;
  const url = new URL(`/rest/v1/${table}`, shard.url);
  url.searchParams.set("on_conflict", conflict);

  const response = await fetch(url, {
    method: "POST",
    headers: {
      apikey: shard.key,
      Authorization: `Bearer ${shard.key}`,
      "Content-Type": "application/json",
      Prefer: "resolution=merge-duplicates",
      "x-backend-api-key": appKey,
    },
    body: JSON.stringify(rows),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`${table} seed failed on ${shard.id}: ${response.status} ${text}`);
  }
}

const env = { ...process.env, ...readEnvFile(envPath) };
const appKey = env.SUPABASE_BACKEND_APP_KEY;
if (!appKey) throw new Error("Missing SUPABASE_BACKEND_APP_KEY in .env.local");

const shards = [1, 2, 3].map((index) => readShard(index, env));
for (const shard of shards) {
  if (!shard.url || !shard.key) throw new Error(`Missing Supabase URL/key for ${shard.id}. Run npm run supabase:sync-env first.`);
}

const dataModule = await import(pathToFileURL(path.join(root, "lib", "data.js")).href);

const blogRowsByShard = new Map(shards.map((shard) => [shard.id, []]));
const inventoryRowsByShard = new Map(shards.map((shard) => [shard.id, []]));
const aboutRowsByShard = new Map(shards.map((shard) => [shard.id, []]));
const contactRowsByShard = new Map(shards.map((shard) => [shard.id, []]));

dataModule.blogPosts.forEach((post, index) => {
  const shard = pickShard(shards, index);
  blogRowsByShard.get(shard.id).push({
    id: routedId(shard.id, "blog", post.id),
    shard_id: shard.id,
    slug: post.slug,
    title: post.title,
    excerpt: post.excerpt || "",
    status: "published",
    tags: post.tags || [],
    cover_tone: post.coverTone || "research",
    source_href: post.sourceHref || "/blog",
    read_time: post.readTime || "4 min baca",
    blocks: cleanBlocks(post.blocks),
    owner_email: null,
    published_at: new Date().toISOString(),
  });
});

const inventorySeeds = [
  ...dataModule.publications.map((publication, index) => ({
    id: `publication-${index}`,
    sourceId: publication.href,
    type: "scroll",
    icon: "icon-scroll",
    name: `Scroll: ${publication.title}`,
    description: `${publication.venue} · ${publication.year}`,
    rarity: publication.citedBy > 1 ? "rare" : "common",
    acquiredAt: publication.year,
    linkTo: publication.href,
  })),
  ...dataModule.featuredQuests.slice(0, 6).map((quest, index) => ({
    id: `quest-${index}`,
    sourceId: quest.href,
    type: "artifact",
    icon: "icon-artifact-vase",
    name: `Artifact: ${quest.title}`,
    description: quest.desc,
    rarity: quest.featured ? "rare" : "common",
    acquiredAt: quest.tier,
    linkTo: quest.href,
  })),
  ...dataModule.achievements.map((achievement, index) => ({
    id: `achievement-${index}`,
    sourceId: `${achievement.title}-${achievement.year}`,
    type: "medal",
    icon: "icon-trophy",
    name: `Medal: ${achievement.title}`,
    description: `${achievement.org} · ${achievement.year}`,
    rarity: achievement.medal === "gold" ? "epic" : achievement.medal === "silver" ? "rare" : "common",
    acquiredAt: achievement.year,
    linkTo: null,
  })),
];

inventorySeeds.forEach((item, index) => {
  const shard = pickShard(shards, index);
  inventoryRowsByShard.get(shard.id).push({
    id: routedId(shard.id, "inventory", item.id),
    shard_id: shard.id,
    source_id: item.sourceId || item.id,
    type: item.type,
    name: item.name,
    description: item.description || "",
    rarity: item.rarity || "common",
    icon: item.icon || "icon-artifact-vase",
    acquired_at_label: item.acquiredAt || "Unlocked",
    link_to: item.linkTo || null,
    status: "unlocked",
    owner_email: null,
    metadata: {},
  });
});

aboutRowsByShard.get(shards[0].id).push({
  id: routedId(shards[0].id, "about", "intro"),
  shard_id: shards[0].id,
  entry_key: "intro",
  title: "Tentang Mukhtada",
  body:
    "Aku Mukhtada Billah NST - mahasiswa Sistem Informasi Universitas Jambi yang senang mengubah riset jadi produk yang benar-benar jalan. Fokusku di fullstack web, AI tooling, dan data science. Aku suka mengajar, menulis riset, dan membangun hal-hal kecil yang berguna untuk komunitas.",
  payload: {
    affiliation: dataModule.profile.affiliation,
    location: dataModule.profile.location,
  },
  status: "public",
  owner_email: null,
});

dataModule.socials.forEach((channel, index) => {
  const shard = pickShard(shards, index);
  contactRowsByShard.get(shard.id).push({
    id: routedId(shard.id, "contact", channel.key),
    shard_id: shard.id,
    channel_key: channel.key,
    label: channel.label,
    sub: channel.sub,
    cta: channel.cta,
    href: channel.href,
    tone: channel.tone,
    sort_order: index,
    active: true,
    owner_email: null,
  });
});

for (const shard of shards) {
  console.log(`Seeding feature data to ${shard.id} (${shard.projectRef || "unknown"})...`);

  await upsertOrThrow(shard, appKey, "blog_posts", blogRowsByShard.get(shard.id), "id");
  await upsertOrThrow(shard, appKey, "inventory_items", inventoryRowsByShard.get(shard.id), "id");
  await upsertOrThrow(shard, appKey, "about_entries", aboutRowsByShard.get(shard.id), "id");
  await upsertOrThrow(shard, appKey, "contact_channels", contactRowsByShard.get(shard.id), "id");

  console.log(`Done seed ${shard.id}.`);
}

console.log("Feature seed data has been distributed across all configured shards.");
