import crypto from "node:crypto";
import { fetchAction, fetchQuery } from "convex/nextjs";
import { api } from "@/convex/_generated/api";
import { blogPosts, profile, socials } from "@/lib/data";
import { getPlayerProgress } from "@/lib/playerProgress";

const DEFAULT_LIMIT = 48;

function limitNumber(value, fallback = DEFAULT_LIMIT) {
  const limit = Number.parseInt(value || `${fallback}`, 10);
  if (!Number.isFinite(limit)) return fallback;
  return Math.max(1, Math.min(100, limit));
}

function bridgeSecret() {
  const secret = process.env.CONVEX_INTERNAL_API_KEY;
  if (!secret) {
    const error = new Error("CONVEX_INTERNAL_API_KEY is not configured on the Next.js server.");
    error.code = "CONVEX_BRIDGE_ENV_MISSING";
    throw error;
  }
  return secret;
}

function actorSnapshot(actor) {
  const email = String(actor?.email || "backend@local").trim().toLowerCase();
  const role = ["owner", "visitor", "backend"].includes(actor?.role) ? actor.role : "visitor";
  return {
    key: actor?.key || crypto.createHash("sha256").update(email).digest("hex").slice(0, 32),
    email,
    name: String(actor?.name || email.split("@")[0] || "Visitor").trim(),
    ...(actor?.image ? { image: String(actor.image) } : {}),
    role,
  };
}

function warning(error) {
  return `convex:${error?.code || error?.message || "unavailable"}`;
}

function staticAboutEntries() {
  return [
    {
      id: "about-intro",
      entryKey: "intro",
      title: "Tentang Mukhtada",
      body:
        "Aku Mukhtada Billah NSTs - mahasiswa Sistem Informasi Universitas Jambi yang senang mengubah riset jadi produk yang benar-benar jalan. Fokusku di fullstack web, AI tooling, dan data science. Aku suka mengajar, menulis riset, dan membangun hal-hal kecil yang berguna untuk komunitas.",
      payload: { affiliation: profile.affiliation, location: profile.location },
      source: "local",
    },
  ];
}

export async function listBlogPosts({ includeDrafts = false, limit } = {}) {
  try {
    if (includeDrafts) {
      const posts = await fetchAction(api.bridge.listBlogAdmin, {
        secret: bridgeSecret(),
        limit: limitNumber(limit),
      });
      return { posts, source: "convex", warnings: [] };
    }
    return await fetchQuery(api.blog.listPublished, { limit: limitNumber(limit) });
  } catch (error) {
    return { posts: blogPosts, source: "local-fallback", warnings: [warning(error)] };
  }
}

export async function getBlogPostBySlug(slug) {
  try {
    const post = await fetchQuery(api.blog.getPublishedBySlug, { slug: String(slug || "") });
    return { post, source: "convex", warnings: [] };
  } catch (error) {
    return {
      post: blogPosts.find((post) => post.slug === slug) || null,
      source: "local-fallback",
      warnings: [warning(error)],
    };
  }
}

export async function getBlogPostById(id) {
  try {
    const post = await fetchAction(api.bridge.getBlogAdmin, { secret: bridgeSecret(), id });
    return { post, source: "convex", warnings: [] };
  } catch (error) {
    return {
      post: blogPosts.find((post) => post.id === id) || null,
      source: "local-fallback",
      warnings: [warning(error)],
    };
  }
}

export async function createBlogPost({ payload, actor }) {
  return await fetchAction(api.bridge.createBlog, {
    secret: bridgeSecret(),
    payload,
    actor: actorSnapshot(actor),
  });
}

export async function updateBlogPost(id, { payload, actor }) {
  return await fetchAction(api.bridge.updateBlog, {
    secret: bridgeSecret(),
    id,
    payload,
    actor: actorSnapshot(actor),
  });
}

export async function listChatMessages({ limit } = {}) {
  const result = await fetchQuery(api.worldChat.listLatest, { limit: Math.min(40, limitNumber(limit, 40)) });
  return { ...result, warnings: [] };
}

export async function createChatMessage({ body, actor }) {
  if (!actor?.email) {
    const error = new Error("Login is required before sending chat messages.");
    error.code = "CHAT_LOGIN_REQUIRED";
    throw error;
  }
  const message = String(body || "").trim();
  if (!message) {
    const error = new Error("Message cannot be empty.");
    error.code = "CHAT_EMPTY";
    throw error;
  }
  if (message.length > 280) {
    const error = new Error("Message cannot exceed 280 characters.");
    error.code = "CHAT_TOO_LONG";
    throw error;
  }
  return await fetchAction(api.bridge.sendWorldChat, {
    secret: bridgeSecret(),
    body: message,
    actor: actorSnapshot(actor),
  });
}

export async function listInventoryItems() {
  try {
    return await fetchQuery(api.inventory.listUnlocked, {});
  } catch (error) {
    return { items: getPlayerProgress().inventory, source: "local-fallback", warnings: [warning(error)] };
  }
}

export async function createInventoryItem({ payload, actor }) {
  return await fetchAction(api.bridge.createInventory, {
    secret: bridgeSecret(),
    payload,
    actor: actorSnapshot(actor),
  });
}

export async function listAboutEntries() {
  try {
    return await fetchQuery(api.content.listPublic, {});
  } catch (error) {
    return { entries: staticAboutEntries(), source: "local-fallback", warnings: [warning(error)] };
  }
}

export async function createAboutEntry({ payload, actor }) {
  return await fetchAction(api.bridge.createContent, {
    secret: bridgeSecret(),
    payload,
    actor: actorSnapshot(actor),
  });
}

export async function upsertAboutEntry({ payload, actor }) {
  return await fetchAction(api.bridge.upsertContent, {
    secret: bridgeSecret(),
    payload,
    actor: actorSnapshot(actor),
  });
}

export async function listContactChannels() {
  try {
    return await fetchQuery(api.contact.listActive, {});
  } catch (error) {
    return { channels: socials, source: "local-fallback", warnings: [warning(error)] };
  }
}

export async function createContactChannel({ payload, actor }) {
  return await fetchAction(api.bridge.createContactChannel, {
    secret: bridgeSecret(),
    payload,
    actor: actorSnapshot(actor),
  });
}

export async function createContactEvent({ payload }) {
  return await fetchAction(api.bridge.createContactEvent, {
    secret: bridgeSecret(),
    payload,
  });
}
