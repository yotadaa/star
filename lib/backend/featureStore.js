import crypto from "node:crypto";
import { api } from "@/convex/_generated/api";
import { actionConvex, queryConvex } from "@/lib/backend/convexServerClient";
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
      const posts = await actionConvex(api.bridge.listBlogAdmin, {
        secret: bridgeSecret(),
        limit: limitNumber(limit),
      });
      return { posts, source: "convex", warnings: [] };
    }
    return await queryConvex(api.blog.listPublished, { limit: limitNumber(limit) });
  } catch (error) {
    return { posts: blogPosts, source: "local-fallback", warnings: [warning(error)] };
  }
}

export async function getBlogPostBySlug(slug) {
  try {
    const post = await queryConvex(api.blog.getPublishedBySlug, { slug: String(slug || "") });
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
    const post = await actionConvex(api.bridge.getBlogAdmin, { secret: bridgeSecret(), id });
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
  return await actionConvex(api.bridge.createBlog, {
    secret: bridgeSecret(),
    payload,
    actor: actorSnapshot(actor),
  });
}

export async function updateBlogPost(id, { payload, actor }) {
  return await actionConvex(api.bridge.updateBlog, {
    secret: bridgeSecret(),
    id,
    payload,
    actor: actorSnapshot(actor),
  });
}

export async function listChatMessages({ limit } = {}) {
  const result = await queryConvex(api.worldChat.listLatest, { limit: Math.min(40, limitNumber(limit, 40)) });
  return { ...result, warnings: [] };
}

function chatError(error) {
  const codes = [
    "CHAT_EMPTY",
    "CHAT_TOO_LONG",
    "CHAT_PARENT_INVALID",
    "CHAT_PARENT_NOT_FOUND",
    "CHAT_PARENT_DELETED",
    "CHAT_ID_INVALID",
    "CHAT_FORBIDDEN",
  ];
  const code = codes.find((item) => String(error?.message || "").includes(item));
  if (code) error.code = code;
  return error;
}

export async function createChatMessage({ body, replyToId, actor }) {
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
  try {
    return await actionConvex(api.bridge.sendWorldChat, {
      secret: bridgeSecret(),
      body: message,
      ...(String(replyToId || "").trim() ? { replyToId: String(replyToId).trim() } : {}),
      actor: actorSnapshot(actor),
    });
  } catch (error) {
    throw chatError(error);
  }
}

export async function deleteChatMessage({ id, actor }) {
  if (!actor || (actor.role !== "owner" && actor.role !== "backend")) {
    const error = new Error("Only the owner can delete World Chat messages.");
    error.code = "CHAT_FORBIDDEN";
    throw error;
  }
  const messageId = String(id || "").trim();
  if (!messageId) {
    const error = new Error("A message id is required.");
    error.code = "CHAT_ID_INVALID";
    throw error;
  }
  try {
    return await actionConvex(api.bridge.deleteWorldChat, {
      secret: bridgeSecret(),
      id: messageId,
      actor: actorSnapshot(actor),
    });
  } catch (error) {
    throw chatError(error);
  }
}

export async function getNalaSettings() {
  return await actionConvex(api.bridge.getNalaSettings, {
    secret: bridgeSecret(),
  });
}

export async function updateNalaSettings({ payload, actor }) {
  if (!actor || (actor.role !== "owner" && actor.role !== "backend")) {
    const error = new Error("Only the owner can update Nala settings.");
    error.code = "NALA_CONFIG_FORBIDDEN";
    throw error;
  }
  return await actionConvex(api.bridge.updateNalaSettings, {
    secret: bridgeSecret(),
    payload: {
      enabled: Boolean(payload.enabled),
      model: String(payload.model || "").trim(),
      systemPromptSupplement: String(payload.systemPromptSupplement || "").trim(),
      temperature: Number(payload.temperature),
      maxTokens: Number(payload.maxTokens),
    },
    actor: actorSnapshot(actor),
  });
}

export async function listInventoryItems() {
  try {
    return await queryConvex(api.inventory.listUnlocked, {});
  } catch (error) {
    return { items: getPlayerProgress().inventory, source: "local-fallback", warnings: [warning(error)] };
  }
}

export async function createInventoryItem({ payload, actor }) {
  return await actionConvex(api.bridge.createInventory, {
    secret: bridgeSecret(),
    payload,
    actor: actorSnapshot(actor),
  });
}

export async function listAboutEntries() {
  try {
    return await queryConvex(api.content.listPublic, {});
  } catch (error) {
    return { entries: staticAboutEntries(), source: "local-fallback", warnings: [warning(error)] };
  }
}

export async function createAboutEntry({ payload, actor }) {
  return await actionConvex(api.bridge.createContent, {
    secret: bridgeSecret(),
    payload,
    actor: actorSnapshot(actor),
  });
}

export async function upsertAboutEntry({ payload, actor }) {
  return await actionConvex(api.bridge.upsertContent, {
    secret: bridgeSecret(),
    payload,
    actor: actorSnapshot(actor),
  });
}

export async function listContactChannels() {
  try {
    return await queryConvex(api.contact.listActive, {});
  } catch (error) {
    return { channels: socials, source: "local-fallback", warnings: [warning(error)] };
  }
}

export async function createContactChannel({ payload, actor }) {
  return await actionConvex(api.bridge.createContactChannel, {
    secret: bridgeSecret(),
    payload,
    actor: actorSnapshot(actor),
  });
}

export async function createContactEvent({ payload }) {
  return await actionConvex(api.bridge.createContactEvent, {
    secret: bridgeSecret(),
    payload,
  });
}
