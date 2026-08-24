import { v } from "convex/values";

export const blogStatus = v.union(
  v.literal("draft"),
  v.literal("published"),
  v.literal("archived"),
);

export const contentStatus = v.union(v.literal("public"), v.literal("private"));
export const inventoryStatus = v.union(v.literal("unlocked"), v.literal("hidden"));
export const recordVisibility = v.union(v.literal("public"), v.literal("private"));
export const chatStatus = v.union(v.literal("active"), v.literal("deleted"));
export const blogCommentStatus = v.union(v.literal("active"), v.literal("deleted"));
export const actorRole = v.union(
  v.literal("owner"),
  v.literal("visitor"),
  v.literal("backend"),
);
export const inventoryType = v.union(
  v.literal("scroll"),
  v.literal("tool"),
  v.literal("artifact"),
  v.literal("medal"),
  v.literal("key"),
);
export const rarity = v.union(v.literal("common"), v.literal("rare"), v.literal("epic"));

export const blogAuthor = v.object({
  id: v.string(),
  name: v.string(),
  url: v.string(),
});

export const blogFeaturedImage = v.object({
  storageId: v.optional(v.id("_storage")),
  assetKey: v.optional(v.string()),
  src: v.optional(v.string()),
  alt: v.string(),
  width: v.number(),
  height: v.number(),
});

export const editorBlock = v.object({
  type: v.union(
    v.literal("heading"),
    v.literal("paragraph"),
    v.literal("quote"),
    v.literal("list"),
    v.literal("code"),
    v.literal("image"),
    v.literal("divider"),
    v.literal("table"),
    v.literal("icon"),
  ),
  text: v.string(),
  rows: v.optional(v.array(v.array(v.string()))),
  storageId: v.optional(v.id("_storage")),
  assetKey: v.optional(v.string()),
  src: v.optional(v.string()),
  alt: v.optional(v.string()),
  width: v.optional(v.number()),
  height: v.optional(v.number()),
});

export const actorSnapshot = v.object({
  key: v.string(),
  email: v.string(),
  name: v.string(),
  image: v.optional(v.string()),
  role: actorRole,
});

export const blogInput = v.object({
  title: v.optional(v.string()),
  slug: v.optional(v.string()),
  excerpt: v.optional(v.string()),
  status: v.optional(blogStatus),
  tags: v.optional(v.array(v.string())),
  publishedAt: v.optional(v.string()),
  coverTone: v.optional(v.string()),
  cover_tone: v.optional(v.string()),
  sourceHref: v.optional(v.string()),
  source_href: v.optional(v.string()),
  readTime: v.optional(v.string()),
  read_time: v.optional(v.string()),
  seoTitle: v.optional(v.string()),
  seoDescription: v.optional(v.string()),
  language: v.optional(v.string()),
  author: v.optional(blogAuthor),
  articleSection: v.optional(v.string()),
  featuredImage: v.optional(blogFeaturedImage),
  blocks: v.optional(v.array(editorBlock)),
});

export const contentInput = v.object({
  entryKey: v.optional(v.string()),
  entry_key: v.optional(v.string()),
  title: v.optional(v.string()),
  body: v.optional(v.string()),
  payload: v.optional(v.any()),
  status: v.optional(contentStatus),
});

export const inventoryInput = v.object({
  sourceId: v.optional(v.string()),
  source_id: v.optional(v.string()),
  type: v.optional(inventoryType),
  icon: v.optional(v.string()),
  name: v.optional(v.string()),
  fullName: v.optional(v.string()),
  description: v.optional(v.string()),
  rarity: v.optional(rarity),
  acquiredAt: v.optional(v.string()),
  acquired_at_label: v.optional(v.string()),
  linkTo: v.optional(v.string()),
  link_to: v.optional(v.string()),
  status: v.optional(inventoryStatus),
  metadata: v.optional(v.any()),
});

export const contactChannelInput = v.object({
  key: v.optional(v.string()),
  channelKey: v.optional(v.string()),
  label: v.optional(v.string()),
  sub: v.optional(v.string()),
  cta: v.optional(v.string()),
  href: v.optional(v.string()),
  tone: v.optional(v.string()),
  sortOrder: v.optional(v.number()),
  sort_order: v.optional(v.number()),
  active: v.optional(v.boolean()),
});

export const contactEventInput = v.object({
  channelKey: v.optional(v.string()),
  channel_key: v.optional(v.string()),
  eventName: v.optional(v.string()),
  event_name: v.optional(v.string()),
  metadata: v.optional(v.any()),
});

export const nalaSettingsInput = v.object({
  enabled: v.boolean(),
  model: v.string(),
  systemPromptSupplement: v.string(),
  temperature: v.number(),
  maxTokens: v.number(),
});

export const publicNalaSettings = v.object({
  enabled: v.boolean(),
  model: v.string(),
  systemPromptSupplement: v.string(),
  temperature: v.number(),
  maxTokens: v.number(),
  updatedAt: v.union(v.number(), v.null()),
  persisted: v.boolean(),
});

export const publicBlogPost = v.object({
  id: v.string(),
  slug: v.string(),
  title: v.string(),
  excerpt: v.string(),
  status: blogStatus,
  tags: v.array(v.string()),
  publishedAt: v.string(),
  datePublished: v.union(v.number(), v.null()),
  dateModified: v.number(),
  readTime: v.string(),
  coverTone: v.string(),
  sourceHref: v.string(),
  seoTitle: v.optional(v.string()),
  seoDescription: v.optional(v.string()),
  language: v.optional(v.string()),
  author: v.optional(blogAuthor),
  articleSection: v.optional(v.string()),
  featuredImage: v.optional(blogFeaturedImage),
  blocks: v.array(editorBlock),
  upvoteCount: v.number(),
  updatedAt: v.number(),
});

export const publicBlogComment = v.object({
  id: v.string(),
  authorName: v.string(),
  body: v.string(),
  createdAt: v.string(),
  canDelete: v.boolean(),
});

export const blogVoteState = v.object({
  count: v.number(),
  voted: v.boolean(),
});

export const publicChatMessage = v.object({
  id: v.string(),
  authorName: v.string(),
  body: v.string(),
  createdAt: v.string(),
  replyTo: v.union(
    v.object({
      id: v.string(),
      authorName: v.string(),
      body: v.string(),
    }),
    v.null(),
  ),
  replyUnavailable: v.boolean(),
});

export const publicInventoryItem = v.object({
  id: v.string(),
  sourceId: v.optional(v.string()),
  type: inventoryType,
  icon: v.string(),
  name: v.string(),
  fullName: v.string(),
  description: v.string(),
  rarity,
  acquiredAt: v.string(),
  linkTo: v.optional(v.string()),
});

export const publicContentEntry = v.object({
  id: v.string(),
  entryKey: v.string(),
  title: v.string(),
  body: v.string(),
  payload: v.any(),
  source: v.literal("convex"),
});

export const publicContactChannel = v.object({
  id: v.string(),
  key: v.string(),
  label: v.string(),
  sub: v.string(),
  cta: v.string(),
  href: v.string(),
  tone: v.string(),
});

export const publicRecord = v.object({
  id: v.string(),
  collection: v.string(),
  slug: v.optional(v.string()),
  visibility: recordVisibility,
  payload: v.any(),
  file_count: v.number(),
  created_at: v.string(),
  updated_at: v.string(),
});

export const publicFile = v.object({
  id: v.string(),
  record_id: v.optional(v.string()),
  storage_id: v.id("_storage"),
  source_key: v.optional(v.string()),
  original_name: v.string(),
  content_type: v.string(),
  size_bytes: v.number(),
  metadata: v.any(),
  created_at: v.string(),
  url: v.optional(v.string()),
});
