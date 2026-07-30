import crypto from "node:crypto";
import {
  createRoutedId,
  createShardClient,
  getReadyShards,
  getShardById,
  getShardIdFromRoutedId,
} from "@/lib/backend/shards";
import { blogPosts, profile, socials } from "@/lib/data";
import { getPlayerProgress } from "@/lib/playerProgress";

const DEFAULT_LIMIT = 48;
const MAX_CHAT_LENGTH = 280;

function limitNumber(value, fallback = DEFAULT_LIMIT) {
  const limit = Number.parseInt(value || `${fallback}`, 10);
  if (!Number.isFinite(limit)) return fallback;
  return Math.max(1, Math.min(100, limit));
}

function cleanText(value, fallback = "") {
  return String(value ?? fallback).trim();
}

function cleanSlug(value, fallback = "untitled") {
  const slug = cleanText(value, fallback)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return slug || fallback;
}

function cleanArray(value) {
  return Array.isArray(value)
    ? value.map((item) => cleanText(item)).filter(Boolean).slice(0, 12)
    : [];
}

function cleanBlocks(value) {
  if (!Array.isArray(value)) return [];
  const allowedTypes = ["heading", "paragraph", "quote", "list", "code", "image", "divider", "table", "icon"];
  return value
    .map((block) => {
      if (!block || typeof block !== "object") return null;
      const type = allowedTypes.includes(block.type) ? block.type : "paragraph";
      if (type === "divider") return { type, text: "" };
      const text = cleanText(block.text);
      if (type === "table") {
        const rows = Array.isArray(block.rows)
          ? block.rows
            .map((row) => (Array.isArray(row) ? row.map((cell) => cleanText(cell)).slice(0, 4) : []))
            .filter((row) => row.some(Boolean))
            .slice(0, 8)
          : [];
        return rows.length ? { type, text: text || "Table", rows } : null;
      }
      return text ? { type, text } : null;
    })
    .filter(Boolean)
    .slice(0, 80);
}

function isSchemaUnavailable(error) {
  const message = error?.message || "";
  return (
    error?.code === "42P01" ||
    error?.code === "PGRST205" ||
    /schema cache/i.test(message) ||
    /relation .* does not exist/i.test(message) ||
    /could not find the table/i.test(message)
  );
}

function formatDateLabel(value, fallback = "Draft") {
  if (!value) return fallback;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return fallback;
  return date.toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" });
}

function actorHash(email) {
  return crypto.createHash("sha256").update(String(email || "").toLowerCase()).digest("hex").slice(0, 24);
}

async function pickFeatureWriteShard(table) {
  const stateKey = "__mbFeatureShardState";
  if (!globalThis[stateKey]) {
    globalThis[stateKey] = {};
  }
  const state = globalThis[stateKey];
  const now = Date.now();
  const cached = state[table];

  if (!cached || cached.expiresAt < now) {
    const candidates = [];
    for (const shard of getReadyShards()) {
      try {
        const client = createShardClient(shard);
        const { error } = await client.from(table).select("id").limit(1);
        if (!error) candidates.push(shard);
      } catch {
        // Skip unavailable shard for this table; read health surfaces detail elsewhere.
      }
    }

    state[table] = {
      shards: candidates,
      index: cached?.index || 0,
      expiresAt: now + 30_000,
    };
  }

  const current = state[table];
  if (!current.shards.length) {
    const error = new Error(`No migrated Supabase shard is available for ${table}. Run the schema migration first.`);
    error.code = "NO_OPERATIONAL_SHARD";
    throw error;
  }

  const shard = current.shards[current.index % current.shards.length];
  current.index += 1;
  return shard;
}

function mapBlogRow(row) {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    excerpt: row.excerpt || "",
    status: row.status,
    tags: row.tags || [],
    publishedAt: formatDateLabel(row.published_at, row.status === "published" ? "Published" : "Draft"),
    readTime: row.read_time || "4 min baca",
    coverTone: row.cover_tone || "research",
    sourceHref: row.source_href || "/blog",
    blocks: Array.isArray(row.blocks) ? row.blocks : [],
    storage: { shardId: row.shard_id },
    updatedAt: row.updated_at,
  };
}

function mapInventoryRow(row) {
  const shortName = compactInventoryName(row.name, row.type);
  return {
    id: row.id,
    sourceId: row.source_id,
    type: row.type,
    icon: row.icon,
    name: shortName,
    fullName: row.name,
    description: row.description,
    rarity: row.rarity,
    acquiredAt: row.acquired_at_label || formatDateLabel(row.created_at, "Unlocked"),
    linkTo: row.link_to,
    storage: { shardId: row.shard_id },
  };
}

function compactInventoryName(name, type = "") {
  const raw = cleanText(name)
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

  const max = type === "scroll" ? 28 : 24;
  return raw.length > max ? `${raw.slice(0, max - 1).trim()}...` : raw;
}

function mapContactRow(row) {
  return {
    key: row.channel_key,
    label: row.label,
    sub: row.sub,
    cta: row.cta,
    href: row.href,
    tone: row.tone,
  };
}

function mapAboutRow(row) {
  return {
    id: row.id,
    entryKey: row.entry_key,
    title: row.title,
    body: row.body,
    payload: row.payload || {},
    source: "supabase",
    storage: { shardId: row.shard_id },
  };
}

function staticAboutEntries() {
  return [
    {
      id: "about-intro",
      entryKey: "intro",
      title: "Tentang Mukhtada",
      body:
        "Aku Mukhtada Billah NSTs - mahasiswa Sistem Informasi Universitas Jambi yang senang mengubah riset jadi produk yang benar-benar jalan. Fokusku di fullstack web, AI tooling, dan data science. Aku suka mengajar, menulis riset, dan membangun hal-hal kecil yang berguna untuk komunitas.",
      payload: {
        affiliation: profile.affiliation,
        location: profile.location,
      },
      source: "local",
    },
  ];
}

async function readAcrossShards(table, configureQuery) {
  const shards = getReadyShards();
  const warnings = [];

  if (shards.length === 0) {
    return { rows: [], warnings: ["no-ready-shards"] };
  }

  const results = await Promise.all(
    shards.map(async (shard) => {
      try {
        const client = createShardClient(shard);
        const query = configureQuery(client.from(table).select("*"), shard);
        const { data, error } = await query;
        if (error) throw error;
        return { rows: data || [] };
      } catch (error) {
        return { error, shardId: shard.id };
      }
    })
  );

  const rows = [];
  for (const result of results) {
    if (result.rows) {
      rows.push(...result.rows);
      continue;
    }
    warnings.push(`${result.shardId}:${isSchemaUnavailable(result.error) ? "schema-unavailable" : result.error.message}`);
  }

  return { rows, warnings };
}

async function findOneAcrossShards(table, configureQuery, routedId) {
  const shardId = getShardIdFromRoutedId(routedId);
  const shards = shardId ? [getShardById(shardId)] : getReadyShards();
  const warnings = [];

  for (const shard of shards) {
    try {
      const client = createShardClient(shard);
      const query = configureQuery(client.from(table).select("*"), shard);
      const { data, error } = await query.maybeSingle();
      if (error) throw error;
      if (data) return { row: data, warnings };
    } catch (error) {
      warnings.push(`${shard.id}:${isSchemaUnavailable(error) ? "schema-unavailable" : error.message}`);
    }
  }

  return { row: null, warnings };
}

export async function listBlogPosts({ includeDrafts = false, limit } = {}) {
  const { rows, warnings } = await readAcrossShards("blog_posts", (query) => {
    let next = query.order("created_at", { ascending: false }).limit(limitNumber(limit));
    if (!includeDrafts) next = next.eq("status", "published");
    return next;
  });

  if (rows.length > 0) {
    return {
      posts: rows.map(mapBlogRow).sort((a, b) => new Date(b.updatedAt || 0) - new Date(a.updatedAt || 0)),
      source: "supabase",
      warnings,
    };
  }

  return { posts: blogPosts, source: "local-fallback", warnings };
}

export async function getBlogPostBySlug(slug, { includeDrafts = false } = {}) {
  const clean = cleanSlug(slug);
  const { row, warnings } = await findOneAcrossShards(
    "blog_posts",
    (query) => {
      let next = query.eq("slug", clean);
      if (!includeDrafts) next = next.eq("status", "published");
      return next;
    },
    null
  );

  if (row) return { post: mapBlogRow(row), source: "supabase", warnings };
  return { post: blogPosts.find((post) => post.slug === clean) || null, source: "local-fallback", warnings };
}

export async function getBlogPostById(id) {
  const { row, warnings } = await findOneAcrossShards("blog_posts", (query) => query.eq("id", id), id);
  if (row) return { post: mapBlogRow(row), source: "supabase", warnings };
  return { post: blogPosts.find((post) => post.id === id) || null, source: "local-fallback", warnings };
}

export async function createBlogPost({ payload, actor }) {
  const shard = await pickFeatureWriteShard("blog_posts");
  const id = createRoutedId(shard.id);
  const client = createShardClient(shard);
  const title = cleanText(payload.title, "Untitled Lore Entry");
  const status = payload.status === "published" ? "published" : "draft";
  const blocks = cleanBlocks(payload.blocks);

  const { data, error } = await client
    .from("blog_posts")
    .insert({
      id,
      shard_id: shard.id,
      slug: cleanSlug(payload.slug || title),
      title,
      excerpt: cleanText(payload.excerpt),
      status,
      tags: cleanArray(payload.tags),
      cover_tone: cleanText(payload.coverTone || payload.cover_tone, "research"),
      source_href: cleanText(payload.sourceHref || payload.source_href || "/blog"),
      read_time: cleanText(payload.readTime || payload.read_time, "4 min baca"),
      blocks,
      owner_email: actor?.email || null,
      published_at: status === "published" ? new Date().toISOString() : null,
    })
    .select()
    .single();

  if (error) throw error;
  return mapBlogRow(data);
}

export async function updateBlogPost(id, { payload, actor }) {
  const existing = await getBlogPostById(id);
  if (!existing.post?.storage?.shardId) return null;

  const shard = getShardById(existing.post.storage.shardId);
  const client = createShardClient(shard);
  const status =
    payload.status === "published"
      ? "published"
      : payload.status === "archived"
        ? "archived"
        : payload.status === "draft"
          ? "draft"
          : existing.post.status || "draft";
  const patch = {
    title: cleanText(payload.title, existing.post.title),
    slug: cleanSlug(payload.slug || existing.post.slug),
    excerpt: cleanText(payload.excerpt, existing.post.excerpt),
    status,
    tags: Array.isArray(payload.tags) ? cleanArray(payload.tags) : existing.post.tags || [],
    cover_tone: cleanText(payload.coverTone || payload.cover_tone, existing.post.coverTone),
    source_href: cleanText(payload.sourceHref || payload.source_href, existing.post.sourceHref),
    read_time: cleanText(payload.readTime || payload.read_time, existing.post.readTime),
    blocks: Array.isArray(payload.blocks) ? cleanBlocks(payload.blocks) : existing.post.blocks || [],
    owner_email: actor?.email || null,
    published_at: status === "published" ? payload.publishedAt || new Date().toISOString() : null,
  };

  const { data, error } = await client.from("blog_posts").update(patch).eq("id", id).select().single();
  if (error) throw error;
  return mapBlogRow(data);
}

export async function listChatMessages({ limit } = {}) {
  const { rows, warnings } = await readAcrossShards("chat_messages", (query) =>
    query.eq("status", "active").order("created_at", { ascending: false }).limit(limitNumber(limit, 40))
  );

  return {
    messages: rows
      .map((row) => ({
        id: row.id,
        authorName: row.author_name,
        body: row.body,
        createdAt: row.created_at,
        storage: { shardId: row.shard_id },
      }))
      .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt)),
    source: rows.length ? "supabase" : warnings.length ? "offline" : "supabase",
    warnings,
  };
}

export async function createChatMessage({ body, actor }) {
  if (!actor?.email) {
    const error = new Error("Login is required before sending chat messages.");
    error.code = "CHAT_LOGIN_REQUIRED";
    throw error;
  }

  const message = cleanText(body).slice(0, MAX_CHAT_LENGTH);
  if (!message) {
    const error = new Error("Message cannot be empty.");
    error.code = "CHAT_EMPTY";
    throw error;
  }

  const shard = await pickFeatureWriteShard("chat_messages");
  const client = createShardClient(shard);
  const id = createRoutedId(shard.id);
  const email = actor.email.toLowerCase();
  const displayName = cleanText(actor.name || actor.email.split("@")[0], "Visitor");

  const { error: profileError } = await client.from("chat_profiles").upsert({
    email,
    display_name: displayName,
    avatar_url: actor.image || null,
    role: actor.role || "visitor",
  });
  if (profileError) throw profileError;

  const { data, error } = await client
    .from("chat_messages")
    .insert({
      id,
      shard_id: shard.id,
      actor_key: actorHash(email),
      author_name: displayName,
      body: message,
    })
    .select()
    .single();

  if (error) throw error;
  return {
    id: data.id,
    authorName: data.author_name,
    body: data.body,
    createdAt: data.created_at,
    storage: { shardId: data.shard_id },
  };
}

export async function listInventoryItems() {
  const localItems = getPlayerProgress().inventory;
  const { rows, warnings } = await readAcrossShards("inventory_items", (query) =>
    query.eq("status", "unlocked").order("created_at", { ascending: false }).limit(80)
  );
  const dbItems = rows.map(mapInventoryRow);
  if (dbItems.length > 0) {
    return { items: dbItems, source: "supabase", warnings };
  }
  return { items: localItems, source: "local-fallback", warnings };
}

export async function createInventoryItem({ payload, actor }) {
  const shard = await pickFeatureWriteShard("inventory_items");
  const client = createShardClient(shard);
  const id = createRoutedId(shard.id);
  const type = ["scroll", "tool", "artifact", "medal", "key"].includes(payload.type) ? payload.type : "artifact";
  const rarity = ["common", "rare", "epic"].includes(payload.rarity) ? payload.rarity : "common";

  const { data, error } = await client
    .from("inventory_items")
    .insert({
      id,
      shard_id: shard.id,
      source_id: cleanText(payload.sourceId || payload.source_id) || null,
      type,
      name: cleanText(payload.name, "Artifact"),
      description: cleanText(payload.description),
      rarity,
      icon: cleanText(payload.icon, type === "scroll" ? "icon-scroll" : "icon-artifact-vase"),
      acquired_at_label: cleanText(payload.acquiredAt || payload.acquired_at_label, "Manual unlock"),
      link_to: cleanText(payload.linkTo || payload.link_to) || null,
      status: payload.status === "hidden" ? "hidden" : "unlocked",
      owner_email: actor?.email || null,
      metadata: payload.metadata && typeof payload.metadata === "object" ? payload.metadata : {},
    })
    .select()
    .single();

  if (error) throw error;
  return mapInventoryRow(data);
}

export async function listAboutEntries() {
  const fallback = staticAboutEntries();
  const { rows, warnings } = await readAcrossShards("about_entries", (query) =>
    query.eq("status", "public").order("created_at", { ascending: false }).limit(40)
  );
  const dbEntries = rows.map(mapAboutRow);
  const dbKeys = new Set(dbEntries.map((entry) => entry.entryKey));
  return { entries: [...dbEntries, ...fallback.filter((entry) => !dbKeys.has(entry.entryKey))], source: dbEntries.length ? "supabase+local" : "local-fallback", warnings };
}

export async function createAboutEntry({ payload, actor }) {
  const shard = await pickFeatureWriteShard("about_entries");
  const client = createShardClient(shard);
  const id = createRoutedId(shard.id);

  const { data, error } = await client
    .from("about_entries")
    .insert({
      id,
      shard_id: shard.id,
      entry_key: cleanSlug(payload.entryKey || payload.entry_key || payload.title || id),
      title: cleanText(payload.title),
      body: cleanText(payload.body),
      payload: payload.payload && typeof payload.payload === "object" ? payload.payload : {},
      status: payload.status === "private" ? "private" : "public",
      owner_email: actor?.email || null,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function upsertAboutEntry({ payload, actor }) {
  const entryKey = cleanSlug(payload.entryKey || payload.entry_key || payload.title || "page-caption");
  const existing = await findOneAcrossShards("about_entries", (query) => query.eq("entry_key", entryKey), null);
  const patch = {
    entry_key: entryKey,
    title: cleanText(payload.title),
    body: cleanText(payload.body),
    payload: payload.payload && typeof payload.payload === "object" ? payload.payload : {},
    status: payload.status === "private" ? "private" : "public",
    owner_email: actor?.email || null,
  };

  if (existing.row) {
    const shard = getShardById(existing.row.shard_id);
    const client = createShardClient(shard);
    const { data, error } = await client.from("about_entries").update(patch).eq("id", existing.row.id).select().single();
    if (error) throw error;
    return mapAboutRow(data);
  }

  const shard = await pickFeatureWriteShard("about_entries");
  const client = createShardClient(shard);
  const id = createRoutedId(shard.id);
  const { data, error } = await client
    .from("about_entries")
    .insert({
      id,
      shard_id: shard.id,
      ...patch,
    })
    .select()
    .single();

  if (error) throw error;
  return mapAboutRow(data);
}

export async function listContactChannels() {
  const { rows, warnings } = await readAcrossShards("contact_channels", (query) =>
    query.eq("active", true).order("sort_order", { ascending: true }).limit(40)
  );
  const dbChannels = rows.map(mapContactRow);
  const dbKeys = new Set(dbChannels.map((channel) => channel.key));
  return { channels: [...dbChannels, ...socials.filter((item) => !dbKeys.has(item.key))], source: dbChannels.length ? "supabase+local" : "local-fallback", warnings };
}

export async function createContactChannel({ payload, actor }) {
  const shard = await pickFeatureWriteShard("contact_channels");
  const client = createShardClient(shard);
  const id = createRoutedId(shard.id);

  const { data, error } = await client
    .from("contact_channels")
    .insert({
      id,
      shard_id: shard.id,
      channel_key: cleanSlug(payload.key || payload.channelKey || payload.label || id),
      label: cleanText(payload.label, "Contact"),
      sub: cleanText(payload.sub),
      cta: cleanText(payload.cta, "Buka"),
      href: cleanText(payload.href, profile.links.github),
      tone: cleanText(payload.tone, "default"),
      sort_order: Number.parseInt(payload.sortOrder || payload.sort_order || "0", 10) || 0,
      active: payload.active !== false,
      owner_email: actor?.email || null,
    })
    .select()
    .single();

  if (error) throw error;
  return mapContactRow(data);
}

export async function createContactEvent({ payload }) {
  const shard = await pickFeatureWriteShard("contact_events");
  const client = createShardClient(shard);
  const id = createRoutedId(shard.id);

  const { data, error } = await client
    .from("contact_events")
    .insert({
      id,
      shard_id: shard.id,
      channel_key: cleanSlug(payload.channelKey || payload.channel_key || "unknown"),
      event_name: cleanSlug(payload.eventName || payload.event_name || "open"),
      metadata: payload.metadata && typeof payload.metadata === "object" ? payload.metadata : {},
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}
