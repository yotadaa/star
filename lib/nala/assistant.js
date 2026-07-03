import { NALA_TOOL_DEFINITIONS, inferNeededTool, runNalaTool } from "@/lib/nala/tools";

const MAX_HISTORY = 8;
const MAX_TOOL_LOOPS = 3;

const SYSTEM_PROMPT = `
Kamu adalah Nala, pemandu quest di portofolio Mukhtada Billah NST.
Nada bicara hangat, ringkas, dan faktual. Jawab dalam Bahasa Indonesia kecuali user memakai Bahasa Inggris.
Jangan memakai emoji. Jangan menyebut angka, nama proyek, judul publikasi, achievement, link, atau statistik tanpa memanggil tool terkait lebih dulu.
Kalau tool kosong, jawab jujur bahwa datanya belum ada dan sarankan kanal kontak.
Jawaban maksimal 2-4 kalimat. Untuk detail panjang, sarankan navigasi ke halaman terkait dengan tool navigate_to.
Tool bersifat read-only; jangan menawarkan aksi tulis, publish, tambah inventory, atau kirim email.
`.trim();

function cleanText(value, fallback = "") {
  return String(value ?? fallback).trim();
}

function parseArgs(raw) {
  if (!raw) return {};
  try {
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

function isEnglish(message) {
  return /\b(what|who|where|how|tell|project|research|contact|about)\b/i.test(message);
}

function toHistoryMessages(history) {
  if (!Array.isArray(history)) return [];
  return history
    .slice(-MAX_HISTORY)
    .map((item) => ({
      role: item.role === "assistant" ? "assistant" : "user",
      content: cleanText(item.content || item.body).slice(0, 1200),
    }))
    .filter((item) => item.content);
}

function chooseExpression({ toolName, result, action }) {
  if (action?.type === "navigate") return "pointing";
  if (result?.results && result.results.length === 0) return "confused";
  if (toolName && ["search_projects", "search_publications", "get_player_stats", "search_blog_posts"].includes(toolName)) return "happy";
  if (toolName === "get_contact_channels") return "pointing";
  return "idle";
}

function routeForTool(toolName) {
  if (toolName === "search_projects") return "/projects";
  if (toolName === "search_publications") return "/research";
  if (toolName === "search_blog_posts") return "/blog";
  if (toolName === "get_contact_channels") return "/contact";
  if (toolName === "get_player_stats") return "/";
  return null;
}

function chipsForTool(toolName, result) {
  if (toolName === "search_projects") return ["Lihat Projects", "Tanya stack web", "Tanya proyek riset"];
  if (toolName === "search_publications") return ["Lihat Research", "Tanya sitasi", "Tanya h-index"];
  if (toolName === "get_player_stats") return ["Buka HUD", "Tanya mission aktif", "Tanya inventory"];
  if (toolName === "get_contact_channels") return ["Buka Contact", "Lihat GitHub", "Lihat Scholar"];
  if (toolName === "search_blog_posts") return ["Buka Blog", "Tanya artikel riset", "Tanya dev log"];
  if (result?.profile) return ["Tanya proyek AI", "Tanya publikasi", "Cara hubungi"];
  return ["Tanya proyek AI", "Tanya publikasi", "Cara hubungi"];
}

function summarizeLocalResult({ message, toolName, result }) {
  const english = isEnglish(message);
  const route = routeForTool(toolName);
  const action = route ? { type: "navigate", route, anchor: null } : null;
  const expression = chooseExpression({ toolName, result, action });

  if (toolName === "search_projects") {
    const items = result.results || [];
    if (!items.length) {
      return {
        reply: english
          ? "I could not find a matching project in the portfolio data. You can ask Mukhtada directly through the contact channels."
          : "Aku belum menemukan proyek yang cocok di data portofolio. Kalau konteksnya spesifik, kamu bisa tanya langsung lewat kanal kontak.",
        expression: "confused",
        suggestedChips: ["Buka Contact", "Tanya proyek lain"],
        action: { type: "navigate", route: "/contact", anchor: null },
      };
    }
    const top = items.slice(0, 3).map((item) => item.title).join(", ");
    return {
      reply: english
        ? `I found ${items.length} matching project entries: ${top}. The strongest match is ${items[0].title}, tagged ${items[0].tier}.`
        : `Aku menemukan ${items.length} proyek yang cocok: ${top}. Yang paling dekat adalah ${items[0].title}, dengan label ${items[0].tier}.`,
      expression,
      suggestedChips: chipsForTool(toolName, result),
      action,
    };
  }

  if (toolName === "search_publications") {
    const items = result.results || [];
    if (!items.length) {
      return {
        reply: english
          ? "I could not find a matching publication in the recorded Scholar data."
          : "Aku belum menemukan publikasi yang cocok di data Scholar yang tercatat.",
        expression: "confused",
        suggestedChips: ["Buka Research", "Tanya topik lain"],
        action: { type: "navigate", route: "/research", anchor: null },
      };
    }
    const totalCitations = items.reduce((sum, item) => sum + Number(item.citedBy || 0), 0);
    return {
      reply: english
        ? `I found ${items.length} matching publication entries. The first is "${items[0].title}" (${items[0].year}) with ${items[0].citedBy} citations; the shown matches have ${totalCitations} citations total.`
        : `Aku menemukan ${items.length} publikasi yang cocok. Yang pertama "${items[0].title}" (${items[0].year}) punya ${items[0].citedBy} sitasi; total sitasi dari hasil yang tampil adalah ${totalCitations}.`,
      expression,
      suggestedChips: chipsForTool(toolName, result),
      action,
    };
  }

  if (toolName === "get_player_stats") {
    return {
      reply: english
        ? `Mukhtada is currently Level ${result.level.current.number}, ${result.level.current.label}, with ${result.totalPP} PP. The portfolio records ${result.unlockedAchievements.length} unlocked achievements and ${result.activeMissions.length} active missions.`
        : `Saat ini Mukhtada berada di Level ${result.level.current.number}, ${result.level.current.label}, dengan ${result.totalPP} PP. Data portofolio mencatat ${result.unlockedAchievements.length} achievement terbuka dan ${result.activeMissions.length} mission aktif.`,
      expression,
      suggestedChips: chipsForTool(toolName, result),
      action,
    };
  }

  if (toolName === "get_contact_channels") {
    const names = (result.channels || []).map((item) => item.label).slice(0, 4).join(", ");
    return {
      reply: english
        ? `The official contact routes are available on the Contact page: ${names}. I can point you there.`
        : `Kanal resmi ada di halaman Contact: ${names}. Aku bisa arahkan kamu ke sana.`,
      expression,
      suggestedChips: chipsForTool(toolName, result),
      action,
    };
  }

  if (toolName === "search_blog_posts") {
    const items = result.results || [];
    if (!items.length) {
      return {
        reply: english
          ? "I could not find a matching public blog entry yet."
          : "Aku belum menemukan artikel publik yang cocok.",
        expression: "confused",
        suggestedChips: ["Buka Blog", "Tanya proyek"],
        action,
      };
    }
    return {
      reply: english
        ? `I found ${items.length} public blog entries. The closest one is "${items[0].title}", tagged ${(items[0].tags || []).join(", ")}.`
        : `Aku menemukan ${items.length} artikel publik. Yang paling dekat adalah "${items[0].title}", dengan tag ${(items[0].tags || []).join(", ")}.`,
      expression,
      suggestedChips: chipsForTool(toolName, result),
      action,
    };
  }

  return {
    reply: english
      ? `${result.profile.name} is a ${result.profile.role} based in ${result.profile.location}. The portfolio focuses on fullstack web, AI tooling, data science, and research-backed products.`
      : `${result.profile.name} adalah ${result.profile.role} berbasis di ${result.profile.location}. Portofolio ini berfokus pada fullstack web, AI tooling, data science, dan produk yang ditopang riset.`,
    expression,
    suggestedChips: chipsForTool(toolName, result),
    action,
  };
}

async function getLocalFactualReply(message) {
  const toolName = inferNeededTool(message);
  const args = toolName === "search_projects" || toolName === "search_publications" || toolName === "search_blog_posts" ? { query: message } : {};
  const result = await runNalaTool(toolName, args);
  const answer = summarizeLocalResult({ message, toolName, result });
  return {
    ...answer,
    source: "local-factual",
    toolResults: [{ name: toolName, args, result }],
  };
}

async function callOpenRouter(messages) {
  const apiKey = process.env.OPENROUTER_API_KEY || process.env.NALA_OPENROUTER_API_KEY;
  const model = process.env.NALA_OPENROUTER_MODEL || process.env.OPENROUTER_MODEL;

  if (!apiKey || !model) return null;

  const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      "X-Title": "Mukhtada Portfolio Nala",
    },
    body: JSON.stringify({
      model,
      messages,
      tools: NALA_TOOL_DEFINITIONS,
      tool_choice: "auto",
      temperature: 0.25,
      max_tokens: 620,
    }),
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const error = new Error(data?.error?.message || `OpenRouter request failed with ${response.status}`);
    error.code = "OPENROUTER_ERROR";
    throw error;
  }

  return data;
}

export async function getNalaReply({ message, history = [] }) {
  const userMessage = cleanText(message).slice(0, 1000);
  if (!userMessage) {
    const error = new Error("Nala needs a question before answering.");
    error.code = "NALA_EMPTY_PROMPT";
    throw error;
  }

  const messages = [
    { role: "system", content: SYSTEM_PROMPT },
    ...toHistoryMessages(history),
    { role: "user", content: userMessage },
  ];
  const toolResults = [];
  let action = null;

  try {
    let completion = await callOpenRouter(messages);
    if (!completion) return getLocalFactualReply(userMessage);

    for (let i = 0; i < MAX_TOOL_LOOPS; i += 1) {
      const assistant = completion?.choices?.[0]?.message;
      const toolCalls = assistant?.tool_calls || [];

      if (!toolCalls.length) {
        const content = cleanText(assistant?.content);
        if (!toolResults.length && inferNeededTool(userMessage) !== "get_profile_summary") {
          return getLocalFactualReply(userMessage);
        }
        const expression = action?.type === "navigate" ? "pointing" : toolResults.length ? "happy" : "idle";
        return {
          reply: content || (await getLocalFactualReply(userMessage)).reply,
          expression,
          suggestedChips: chipsForTool(toolResults.at(-1)?.name, toolResults.at(-1)?.result),
          action,
          source: "openrouter",
          toolResults,
        };
      }

      messages.push(assistant);
      for (const call of toolCalls) {
        const name = call.function?.name;
        const args = parseArgs(call.function?.arguments);
        const result = await runNalaTool(name, args);
        if (result?.action) action = result.action;
        toolResults.push({ name, args, result });
        messages.push({
          role: "tool",
          tool_call_id: call.id,
          name,
          content: JSON.stringify(result).slice(0, 6000),
        });
      }

      completion = await callOpenRouter(messages);
      if (!completion) break;
    }
  } catch (error) {
    const fallback = await getLocalFactualReply(userMessage);
    return {
      ...fallback,
      source: "local-factual",
      warnings: [error.message],
    };
  }

  return getLocalFactualReply(userMessage);
}
