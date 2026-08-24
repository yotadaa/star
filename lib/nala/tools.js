import { listBlogPosts } from "@/lib/backend/featureStore";
import {
  achievements,
  experience,
  featuredQuests,
  journey,
  profile,
  publications,
  socials,
} from "@/lib/data";
import { getPlayerProgress } from "@/lib/playerProgress";

function cleanText(value, fallback = "") {
  return String(value ?? fallback).trim();
}

function lower(value) {
  return cleanText(value).toLowerCase();
}

function includesAny(text, terms) {
  const haystack = lower(text);
  return terms.some((term) => haystack.includes(lower(term)));
}

const QUERY_STOPWORDS = new Set([
  "can",
  "could",
  "aku",
  "aja",
  "apa",
  "bisa",
  "boleh",
  "baru",
  "buat",
  "cerita",
  "ceritain",
  "dan",
  "detail",
  "dong",
  "h-index",
  "itu",
  "ini",
  "his",
  "ke",
  "me",
  "mau",
  "nya",
  "navigate",
  "open",
  "page",
  "paling",
  "publication",
  "publications",
  "publikasi",
  "project",
  "projects",
  "proyek",
  "research",
  "redirect",
  "riset",
  "saja",
  "show",
  "scholar",
  "sitasi",
  "tentang",
  "the",
  "to",
  "tolong",
  "terbaru",
  "yang",
  "you",
]);

export const PUBLIC_NALA_ROUTES = new Set([
  "/",
  "/about",
  "/blog",
  "/contact",
  "/projects",
  "/research",
]);

const NAVIGATION_TARGETS = [
  { route: "/projects", terms: ["project", "projects", "proyek"] },
  { route: "/research", terms: ["publication", "publications", "publikasi", "research", "riset"] },
  { route: "/blog", terms: ["article", "articles", "artikel", "blog", "catatan", "tulisan"] },
  { route: "/contact", terms: ["contact", "hubungi", "kontak"] },
  { route: "/about", terms: ["about", "bio", "profile", "profil", "tentang"] },
  { route: "/", terms: ["beranda", "home", "homepage"] },
];

function hasNavigationIntent(text) {
  return /\b(navigate|redirect)\b/i.test(text)
    || /\b(?:bring|take)\s+me\b/i.test(text)
    || /\bgo\s+to\b/i.test(text)
    || /\bopen\s+(?:the\s+)?(?:about|articles?|blog|contact|homepage|profile|projects?|publications?|research)\b/i.test(text)
    || /\b(?:antar|arahkan|bawa)\s+(?:aku|gue|kami|saya)?\b/i.test(text)
    || /\bbuka\s+(?:halaman\s+)?(?:artikel|beranda|blog|kontak|profil|proyek|publikasi|riset)\b/i.test(text);
}

function queryTerms(query, tags = []) {
  const values = [query, ...tags].map(lower).filter(Boolean);
  return values
    .flatMap((value) => value.split(/[^a-z0-9+#./-]+/i))
    .map((term) => term.trim())
    .filter((term) => term.length > 1 && !QUERY_STOPWORDS.has(term));
}

function scoreText(text, query, tags = []) {
  const haystack = lower(text);
  const parts = queryTerms(query, tags);
  if (!parts.length) return 1;
  return parts.reduce((score, part) => {
    if (haystack.includes(part)) return score + 2;
    if (part.length > 4 && haystack.includes(part.slice(0, -1))) return score + 1;
    return score;
  }, 0);
}

function compactProject(project, index) {
  return {
    id: `project-${index}`,
    title: project.title,
    tier: project.tier,
    description: project.desc,
    tags: project.tags,
    type: project.type,
    category: project.category,
    href: project.href,
  };
}

function compactPublication(publication, index) {
  return {
    id: `publication-${index}`,
    title: publication.title,
    authors: publication.authors,
    venue: publication.venue,
    year: publication.year,
    citedBy: publication.citedBy,
    href: publication.href,
  };
}

export const NALA_TOOL_DEFINITIONS = [
  {
    type: "function",
    function: {
      name: "get_profile_summary",
      description: "Get a summary of Mukhtada's biography, brand personality, and current focus.",
      parameters: { type: "object", properties: {}, required: [] },
    },
  },
  {
    type: "function",
    function: {
      name: "search_projects",
      description: "Search projects by keyword and/or stack tag. Use this before naming details of a specific project.",
      parameters: {
        type: "object",
        properties: {
          query: { type: "string" },
          tags: { type: "array", items: { type: "string" } },
        },
        required: [],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "get_project_detail",
      description: "Get full details for one project by an ID returned from search_projects.",
      parameters: {
        type: "object",
        properties: { project_id: { type: "string" } },
        required: ["project_id"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "search_publications",
      description: "Search publications and research. Never invent citation counts.",
      parameters: {
        type: "object",
        properties: { query: { type: "string" } },
        required: [],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "get_player_stats",
      description: "Read Player Points, level, achievements, missions, and inventory from verified data.",
      parameters: {
        type: "object",
        properties: {
          query: { type: "string", description: "The user's question, used to narrow the returned statistics." },
        },
        required: [],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "get_contact_channels",
      description: "Get the official contact channels and their portal links.",
      parameters: { type: "object", properties: {}, required: [] },
    },
  },
  {
    type: "function",
    function: {
      name: "search_blog_posts",
      description: "Search public Blog articles, excluding drafts.",
      parameters: {
        type: "object",
        properties: {
          query: { type: "string" },
          category: { type: "string" },
        },
        required: [],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "navigate_to",
      description: "A non-destructive navigation suggestion. The UI must ask for confirmation before it runs.",
      parameters: {
        type: "object",
        properties: {
          route: { type: "string" },
          anchor: { type: "string" },
        },
        required: ["route"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "copy_to_clipboard",
      description: "Suggest copying text to the clipboard. The UI performs the action, not the server.",
      parameters: {
        type: "object",
        properties: { text: { type: "string" } },
        required: ["text"],
      },
    },
  },
];

export const NALA_TOOL_NAMES = new Set(
  NALA_TOOL_DEFINITIONS.map((definition) => definition.function.name),
);

export async function runNalaTool(name, args = {}) {
  if (!NALA_TOOL_NAMES.has(name)) throw new Error("NALA_TOOL_UNKNOWN");
  switch (name) {
    case "get_profile_summary":
      return {
        profile: {
          name: profile.name,
          handle: profile.handle,
          role: profile.role,
          status: profile.status,
          affiliation: profile.affiliation,
          location: profile.location,
          lede: profile.lede_id,
          repoCount: profile.stats.publicRepos,
        },
        journey: journey.slice(-2),
        experience: experience.slice(0, 3).map((item) => ({
          role: item.role,
          org: item.org,
          period: item.period,
          stack: item.stack,
        })),
      };

    case "search_projects": {
      const query = cleanText(args.query);
      const tags = Array.isArray(args.tags) ? args.tags.map(cleanText).filter(Boolean) : [];
      const results = featuredQuests
        .map((project, index) => ({ project: compactProject(project, index), score: scoreText(`${project.title} ${project.desc} ${project.tags.join(" ")} ${project.type} ${project.category}`, query, tags) }))
        .filter((item) => item.score > 0)
        .sort((a, b) => b.score - a.score)
        .slice(0, 5)
        .map((item) => item.project);
      return { results };
    }

    case "get_project_detail": {
      const index = Number.parseInt(cleanText(args.project_id).replace("project-", ""), 10);
      const project = featuredQuests[index];
      return { project: project ? compactProject(project, index) : null };
    }

    case "search_publications": {
      const query = cleanText(args.query);
      const results = publications
        .map((publication, index) => ({
          publication: compactPublication(publication, index),
          score: scoreText(`${publication.title} ${publication.authors} ${publication.venue} ${publication.year}`, query),
        }))
        .filter((item) => item.score > 0)
        .sort((a, b) => b.score - a.score)
        .slice(0, 5)
        .map((item) => item.publication);
      return { results };
    }

    case "get_player_stats": {
      const progress = getPlayerProgress();
      const nextLevel = progress.level.next;
      const level = {
        currentNumber: progress.level.current.number,
        currentLabel: progress.level.current.label,
        nextNumber: nextLevel?.number ?? null,
        nextLabel: nextLevel?.label ?? null,
        nextLevelAtPP: nextLevel?.points ?? null,
        pointsToNext: nextLevel ? Math.max(0, nextLevel.points - progress.totalPP) : 0,
        progressPercent: progress.level.percent,
      };
      const query = lower(args.query);
      const base = {
        totalPP: progress.totalPP,
        level,
      };
      if (includesAny(query, ["achievement", "pencapaian", "badge"])) {
        return {
          ...base,
          unlockedAchievements: progress.achievements
          .filter((achievement) => achievement.unlocked)
            .map((achievement) => ({ title: achievement.title, points: achievement.points, rarity: achievement.rarity }))
            .slice(0, 12),
        };
      }
      if (includesAny(query, ["mission", "misi"])) {
        return {
          ...base,
          activeMissions: progress.missions.filter((mission) => mission.status === "active").slice(0, 6),
        };
      }
      if (includesAny(query, ["inventory", "item", "artifact", "artefak"])) {
        return { ...base, inventoryCount: progress.inventory.length };
      }
      if (includesAny(query, ["level", "pp", "poin"])) return base;
      return {
        ...base,
        researchStats: progress.researchStats,
        repoCount: progress.repoCount,
        unlockedAchievementCount: progress.achievements.filter((achievement) => achievement.unlocked).length,
        activeMissionCount: progress.missions.filter((mission) => mission.status === "active").length,
        inventoryCount: progress.inventory.length,
      };
    }

    case "get_contact_channels":
      return {
        channels: socials.map((item) => ({
          key: item.key,
          label: item.label,
          sub: item.sub,
          href: item.href,
        })),
      };

    case "search_blog_posts": {
      const query = cleanText(args.query || args.category);
      const { posts, source } = await listBlogPosts({ includeDrafts: false, limit: 24 });
      const results = posts
        .filter((post) => post.status === "published" || post.status === "local-preview")
        .map((post) => ({
          post: {
            id: post.id,
            slug: post.slug,
            title: post.title,
            excerpt: post.excerpt,
            tags: post.tags,
            readTime: post.readTime,
          },
          score: scoreText(`${post.title} ${post.excerpt} ${(post.tags || []).join(" ")}`, query),
        }))
        .filter((item) => item.score > 0)
        .sort((a, b) => b.score - a.score)
        .slice(0, 5)
        .map((item) => item.post);
      return { results, source };
    }

    case "navigate_to": {
      const route = cleanText(args.route);
      const anchor = cleanText(args.anchor);
      if (!PUBLIC_NALA_ROUTES.has(route)) {
        return { action: null, error: "route_not_allowed", allowedRoutes: [...PUBLIC_NALA_ROUTES] };
      }
      return {
        action: {
          type: "navigate",
          route,
          anchor: /^[a-z0-9][a-z0-9_-]{0,80}$/i.test(anchor) ? anchor : null,
        },
      };
    }

    case "copy_to_clipboard":
      return { action: { type: "copy", text: cleanText(args.text) } };

    default:
      throw new Error("NALA_TOOL_UNKNOWN");
  }
}

export function inferNeededTool(message) {
  const text = lower(message);
  if (includesAny(text, ["kontak", "hubungi", "email", "linkedin", "github", "scholar", "instagram", "contact"])) {
    return "get_contact_channels";
  }
  if (includesAny(text, ["level", "achievement", "inventory", "mission", "pp", "poin", "player"])) {
    return "get_player_stats";
  }
  if (includesAny(text, ["publikasi", "riset", "research", "scholar", "sitasi", "citation", "h-index"])) {
    return "search_publications";
  }
  if (includesAny(text, ["blog", "artikel", "tulisan", "notes", "catatan"])) {
    return "search_blog_posts";
  }
  if (includesAny(text, ["proyek", "project", "web", "ai", "tooling", "fullstack", "data", "tnks", "genbi", "nara"])) {
    return "search_projects";
  }
  return "get_profile_summary";
}

export function inferNavigationAction(message) {
  const text = lower(message);
  if (!hasNavigationIntent(text)) return null;
  const target = NAVIGATION_TARGETS.find((item) => includesAny(text, item.terms));
  return target ? { type: "navigate", route: target.route, anchor: null } : null;
}

export function initialToolArgs(toolName, message) {
  if (["search_projects", "search_publications", "search_blog_posts", "get_player_stats"].includes(toolName)) {
    return { query: cleanText(message).slice(0, 1000) };
  }
  return {};
}
