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
  "ke",
  "mau",
  "nya",
  "paling",
  "publication",
  "publications",
  "publikasi",
  "project",
  "projects",
  "proyek",
  "research",
  "riset",
  "saja",
  "scholar",
  "sitasi",
  "tentang",
  "tolong",
  "terbaru",
  "yang",
]);

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
      description: "Ambil ringkasan bio, brand personality, dan fokus terkini Mukhtada.",
      parameters: { type: "object", properties: {}, required: [] },
    },
  },
  {
    type: "function",
    function: {
      name: "search_projects",
      description: "Cari proyek berdasarkan kata kunci dan/atau tag stack. Wajib dipakai sebelum menyebut detail proyek spesifik.",
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
      description: "Ambil detail lengkap satu proyek berdasarkan id dari hasil search_projects.",
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
      description: "Cari publikasi/riset. Tidak boleh mengarang angka sitasi.",
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
      description: "Ambil Player Points, level, achievement, mission, dan inventory dari data nyata.",
      parameters: {
        type: "object",
        properties: {
          query: { type: "string", description: "Pertanyaan user untuk membatasi kelompok statistik yang dikembalikan." },
        },
        required: [],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "get_contact_channels",
      description: "Ambil daftar kanal kontak resmi berikut link portal-nya.",
      parameters: { type: "object", properties: {}, required: [] },
    },
  },
  {
    type: "function",
    function: {
      name: "search_blog_posts",
      description: "Cari artikel blog publik, bukan draft.",
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
      description: "Saran navigasi non-destruktif. UI harus meminta konfirmasi sebelum menjalankan.",
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
      description: "Saran salin teks ke clipboard. UI yang menjalankan, bukan server.",
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
      const route = cleanText(args.route, "/");
      const safeRoute = route.startsWith("/") ? route : "/";
      return { action: { type: "navigate", route: safeRoute, anchor: cleanText(args.anchor) || null } };
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

export function initialToolArgs(toolName, message) {
  if (["search_projects", "search_publications", "search_blog_posts", "get_player_stats"].includes(toolName)) {
    return { query: cleanText(message).slice(0, 1000) };
  }
  return {};
}
