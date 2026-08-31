import crypto from "node:crypto";
import { api } from "@/convex/_generated/api";
import { actionConvex, queryConvex } from "@/lib/backend/convexServerClient";
import { blogPosts, profile, publicPageCopy, socials } from "@/lib/data";
import { getPlayerProgress } from "@/lib/playerProgress";
import { commentActorToken } from "@/lib/backend/blogEngagementAuth";

const DEFAULT_LIMIT = 48;

function emptyReadingStats(slug) {
  return {
    slug: String(slug || ""),
    viewCount: 0,
    engagedReadCount: 0,
    averageActiveReadMs: null,
  };
}

function withReadingStats(post) {
  if (!post) return post;
  return {
    ...post,
    readingStats: post.readingStats || emptyReadingStats(post.slug),
  };
}

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
      title: "About Mukhtada",
      body: profile.about,
      payload: { affiliation: profile.affiliation, location: profile.location },
      source: "local",
    },
  ];
}

const LEGACY_CAPTIONS = {
  "about-caption": [
    `${profile.affiliation} · ${profile.location}`,
  ],
  "projects-caption": [
    "Selected work across web development, AI, and data science. Filter by type or category, or browse all 57 repositories on GitHub.",
  ],
  "research-caption": [
    "Published, indexed research with verified Google Scholar citations.",
  ],
  "blog-caption": [
    "Notes on research, web builds, and community work, stored and synchronized through Convex.",
  ],
  "contact-caption": [
    "Have a project, a research question, or simply want to say hello? Choose the channel that suits you.",
  ],
};

const CANONICAL_CAPTIONS = {
  "about-caption": publicPageCopy.about.caption,
  "projects-caption": publicPageCopy.projects.caption,
  "research-caption": publicPageCopy.research.caption,
  "blog-caption": publicPageCopy.blog.caption,
  "contact-caption": publicPageCopy.contact.caption,
};

function englishAboutEntry(entry) {
  if (entry.entryKey === "intro") {
    const fallback = staticAboutEntries()[0];
    const bodyLooksIndonesian = /\b(?:aku|mahasiswa|yang|senang|riset|membangun|komunitas)\b/i.test(entry.body);
    const bodyIsKnownLegacy = /\bMukhtada Billah NSTs\b/.test(entry.body);
    return {
      ...entry,
      title: fallback.title,
      body: bodyLooksIndonesian || bodyIsKnownLegacy ? fallback.body : entry.body,
      payload: {
        ...entry.payload,
        affiliation: profile.affiliation,
        location: profile.location,
      },
    };
  }
  if (CANONICAL_CAPTIONS[entry.entryKey]) {
    const body = String(entry.body || "").trim();
    const isKnownLegacy = LEGACY_CAPTIONS[entry.entryKey].includes(body);
    return isKnownLegacy ? { ...entry, body: CANONICAL_CAPTIONS[entry.entryKey] } : entry;
  }
  return entry;
}

function englishContactChannel(channel) {
  const canonical = socials.find((item) => item.key === channel.key);
  return canonical
    ? { ...channel, label: canonical.label, sub: canonical.sub, cta: canonical.cta }
    : channel;
}

async function listPublishedBlogPostsViaBridge(limit = DEFAULT_LIMIT) {
  const posts = await actionConvex(api.bridge.listBlogAdmin, {
    secret: bridgeSecret(),
    limit: limitNumber(limit, 100),
  });
  return posts.filter((post) => post.status === "published").slice(0, limitNumber(limit));
}

function blogPostSummary(post) {
  const normalizedPost = withReadingStats(post);
  const featuredImage = normalizedPost.featuredImage
    || (Array.isArray(normalizedPost.blocks) ? normalizedPost.blocks.find((block) => block?.type === "image") : undefined);

  return {
    slug: normalizedPost.slug,
    title: normalizedPost.title,
    excerpt: normalizedPost.excerpt,
    status: normalizedPost.status,
    tags: Array.isArray(normalizedPost.tags) ? normalizedPost.tags : [],
    publishedAt: normalizedPost.publishedAt,
    datePublished: normalizedPost.datePublished,
    readTime: normalizedPost.readTime,
    ...(featuredImage ? { featuredImage } : {}),
    upvoteCount: Math.max(0, Number(normalizedPost.upvoteCount || 0)),
    readingStats: normalizedPost.readingStats,
  };
}

export async function listBlogPosts({ includeDrafts = false, limit } = {}) {
  try {
    if (includeDrafts) {
      const posts = await actionConvex(api.bridge.listBlogAdmin, {
        secret: bridgeSecret(),
        limit: limitNumber(limit),
      });
      let stats = [];
      let statsWarning = null;
      try {
        stats = await actionConvex(api.bridge.listBlogAdminReadingStats, {
          secret: bridgeSecret(),
          slugs: posts.map((post) => post.slug),
        });
      } catch (error) {
        statsWarning = warning(error);
      }
      const statsBySlug = new Map(stats.map((item) => [item.slug, item]));
      return {
        posts: posts.map((post) => ({
          ...withReadingStats(post),
          readingAdminStats: statsBySlug.get(post.slug) || {
            ...emptyReadingStats(post.slug),
            completionCount: 0,
            completionRateBps: 0,
            startedAt: null,
            updatedAt: null,
          },
        })),
        source: "convex",
        warnings: statsWarning ? [statsWarning] : [],
      };
    }
    return await queryConvex(api.blog.listPublished, { limit: limitNumber(limit) });
  } catch (queryError) {
    try {
      const posts = await listPublishedBlogPostsViaBridge(limit);
      return { posts, source: "convex", warnings: [warning(queryError)] };
    } catch (bridgeError) {
      return {
        posts: blogPosts.map(withReadingStats),
        source: "local-fallback",
        warnings: [warning(queryError), warning(bridgeError)],
      };
    }
  }
}

export async function listBlogPostSummaries({ limit = 24 } = {}) {
  try {
    return await queryConvex(api.blog.listPublishedSummaries, { limit: limitNumber(limit, 24) });
  } catch (queryError) {
    try {
      const posts = await listPublishedBlogPostsViaBridge(limit);
      return {
        posts: posts.map(blogPostSummary),
        source: "convex",
        warnings: [warning(queryError)],
      };
    } catch (bridgeError) {
      return {
        posts: blogPosts.slice(0, limitNumber(limit, 24)).map(blogPostSummary),
        source: "local-fallback",
        warnings: [warning(queryError), warning(bridgeError)],
      };
    }
  }
}

export async function getBlogPostBySlug(slug) {
  try {
    const post = await queryConvex(api.blog.getPublishedBySlug, { slug: String(slug || "") });
    return { post, source: "convex", warnings: [] };
  } catch (queryError) {
    try {
      const posts = await listPublishedBlogPostsViaBridge(100);
      return {
        post: posts.find((post) => post.slug === slug) || null,
        source: "convex",
        warnings: [warning(queryError)],
      };
    } catch (bridgeError) {
      return {
        post: withReadingStats(blogPosts.find((post) => post.slug === slug) || null),
        source: "local-fallback",
        warnings: [warning(queryError), warning(bridgeError)],
      };
    }
  }
}

export async function getBlogPostById(id) {
  try {
    const post = await actionConvex(api.bridge.getBlogAdmin, { secret: bridgeSecret(), id });
    return { post, source: "convex", warnings: [] };
  } catch (error) {
    return {
      post: withReadingStats(blogPosts.find((post) => post.id === id) || null),
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

export async function getBlogVoteState({ slug, voterHash }) {
  return await actionConvex(api.bridge.getBlogVoteState, {
    secret: bridgeSecret(),
    slug: String(slug || ""),
    voterHash: String(voterHash || ""),
  });
}

export async function toggleBlogVote({ slug, voterHash }) {
  return await actionConvex(api.bridge.toggleBlogVote, {
    secret: bridgeSecret(),
    slug: String(slug || ""),
    voterHash: String(voterHash || ""),
  });
}

export async function recordBlogReading({ slug, readerHash, activeMsDelta, progressBps }) {
  return await actionConvex(api.bridge.recordBlogReading, {
    secret: bridgeSecret(),
    slug: String(slug || ""),
    readerHash: String(readerHash || ""),
    activeMsDelta: Number(activeMsDelta),
    progressBps: Number(progressBps),
  });
}

export async function createBlogComment({ slug, body, actor }) {
  if (!actor?.email || !actor?.key) {
    const error = new Error("Login is required before writing a Blog comment.");
    error.code = "BLOG_COMMENT_LOGIN_REQUIRED";
    throw error;
  }
  return await actionConvex(api.bridge.createBlogComment, {
    secret: bridgeSecret(),
    slug: String(slug || ""),
    body: String(body || ""),
    authorToken: commentActorToken(actor.key),
    actor: actorSnapshot(actor),
  });
}

export async function deleteBlogComment({ slug, id, actor }) {
  if (!actor?.email || !actor?.key) {
    const error = new Error("Login is required before deleting a Blog comment.");
    error.code = "BLOG_COMMENT_LOGIN_REQUIRED";
    throw error;
  }
  return await actionConvex(api.bridge.deleteBlogComment, {
    secret: bridgeSecret(),
    slug: String(slug || ""),
    id: String(id || ""),
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
    const result = await queryConvex(api.content.listPublic, {});
    return { ...result, entries: result.entries.map(englishAboutEntry) };
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
    const result = await queryConvex(api.contact.listActive, {});
    return { ...result, channels: result.channels.map(englishContactChannel) };
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
