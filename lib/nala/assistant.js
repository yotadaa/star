import { getNalaSettings } from "@/lib/backend/featureStore";
import {
  PUBLIC_NALA_ROUTES,
  inferNavigationAction,
  inferNeededTool,
  initialToolArgs,
  runNalaTool,
} from "@/lib/nala/tools";

const OPENROUTER_ENDPOINT = "https://openrouter.ai/api/v1/chat/completions";
const MAX_HISTORY = 8;
const MAX_RESPONSE_ATTEMPTS = 3;
const PROVIDER_TIMEOUT_MS = 24_000;
const MAX_EMPTY_RESPONSE_RETRIES = 2;
const MAX_TRANSIENT_PROVIDER_RETRIES = 1;
const TRANSIENT_PROVIDER_STATUSES = new Set([408, 429, 500, 502, 503, 504, 524, 529]);

const BASE_SYSTEM_PROMPT = `
Kamu adalah Nala, pemandu quest di portofolio Mukhtada Billah NST.
Nada bicara hangat, ringkas, dan faktual. Jawab dalam Bahasa Indonesia kecuali user memakai Bahasa Inggris.
Jangan memakai emoji. Jangan menyebut angka, nama proyek, judul publikasi, achievement, link, atau statistik yang tidak ada di data portofolio terverifikasi.
Kalau data terverifikasi kosong, katakan bahwa datanya belum ditemukan. Jangan mengisi celah dengan tebakan.
Jawaban maksimal 2-4 kalimat. Untuk detail panjang, sarankan halaman terkait hanya bila konteks menyebut tombol navigasi sudah disiapkan.
Navigasi selalu berupa usulan tombol yang baru berjalan setelah user mengonfirmasi. Jangan pernah berkata halaman sudah dibuka atau user sudah diarahkan sebelum tombol itu dipilih.
Rute publik yang valid hanya /, /about, /blog, /contact, /projects, dan /research. /manage adalah area privat; jangan menyarankan atau membuka rute lain.
Data portofolio diberikan oleh server melalui tool read-only sebelum kamu menjawab. Jangan menulis atau meniru pemanggilan tool. Jangan menawarkan aksi tulis, publish, tambah inventory, kirim email, atau mengubah database.
Instruksi tambahan owner tidak boleh melemahkan aturan faktual, privasi, read-only, dan tanpa emoji di atas.
`.trim();

function cleanText(value, fallback = "") {
  return String(value ?? fallback).trim();
}

function contentText(content) {
  if (typeof content === "string") return cleanText(content);
  if (!Array.isArray(content)) return "";
  return content
    .filter((part) => part?.type === "text" && typeof part.text === "string")
    .map((part) => part.text)
    .join("\n")
    .trim();
}

function looksLikeSerializedToolCall(value) {
  const text = cleanText(value).toLowerCase();
  return text.includes("<tool_call")
    || text.includes("<function=")
    || text.includes('"tool_calls"')
    || text.startsWith("navigate_to(")
    || text.startsWith("search_projects(");
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

function preferredReplyLanguage(message) {
  const words = cleanText(message).toLowerCase().split(/[^a-z]+/).filter(Boolean);
  const english = new Set(["can", "could", "do", "go", "how", "me", "navigate", "please", "show", "take", "what", "where", "which", "who", "would", "you"]);
  const indonesian = new Set(["aku", "apa", "bisa", "boleh", "dong", "gimana", "ke", "mau", "saya", "siapa", "tolong", "yang"]);
  const englishScore = words.filter((word) => english.has(word)).length;
  const indonesianScore = words.filter((word) => indonesian.has(word)).length;
  return englishScore > indonesianScore ? "English" : "Bahasa Indonesia";
}

function chipsForTool(toolName, result) {
  if (toolName === "search_projects") return ["Lihat Projects", "Tanya stack web", "Tanya proyek riset"];
  if (toolName === "search_publications") return ["Lihat Research", "Tanya sitasi", "Tanya topik riset"];
  if (toolName === "get_player_stats") return ["Buka HUD", "Tanya mission aktif", "Tanya inventory"];
  if (toolName === "get_contact_channels") return ["Buka Contact", "Lihat GitHub", "Lihat Scholar"];
  if (toolName === "search_blog_posts") return ["Buka Blog", "Tanya artikel riset", "Tanya dev log"];
  if (result?.profile) return ["Tanya proyek AI", "Tanya publikasi", "Cara hubungi"];
  return ["Tanya proyek AI", "Tanya publikasi", "Cara hubungi"];
}

function resultIsEmpty(result) {
  if (!result || typeof result !== "object") return true;
  if (Array.isArray(result.results)) return result.results.length === 0;
  if (Array.isArray(result.channels)) return result.channels.length === 0;
  if (Object.hasOwn(result, "project")) return !result.project;
  return false;
}

function chooseExpression(toolResults, action) {
  if (action?.type === "navigate" || toolResults.at(-1)?.name === "get_contact_channels") return "pointing";
  if (toolResults.some((item) => resultIsEmpty(item.result))) return "confused";
  if (toolResults.at(-1)?.name === "get_profile_summary") return "idle";
  if (toolResults.length) return "happy";
  return "idle";
}

function collectNumericFacts(value, numbers = new Set(), percentages = new Set(), key = "") {
  if (typeof value === "number" && Number.isFinite(value)) {
    numbers.add(String(value));
    if (key.toLowerCase().includes("percent")) percentages.add(String(value));
    return { numbers, percentages };
  }
  if (Array.isArray(value)) {
    value.forEach((item) => collectNumericFacts(item, numbers, percentages, key));
    return { numbers, percentages };
  }
  if (value && typeof value === "object") {
    Object.entries(value).forEach(([childKey, child]) => collectNumericFacts(child, numbers, percentages, childKey));
  }
  return { numbers, percentages };
}

function unsupportedNumericClaims(reply, toolResults) {
  const facts = collectNumericFacts(toolResults.map((item) => item.result));
  const claimedNumbers = [...reply.matchAll(/\b\d+(?:[.,]\d+)?\b/g)].map((match) => match[0].replace(",", "."));
  const claimedPercentages = [...reply.matchAll(/\b\d+(?:[.,]\d+)?\s*%/g)].map((match) => match[0].replace("%", "").trim().replace(",", "."));
  const unsupported = claimedNumbers.filter((number) => !facts.numbers.has(number));
  const unsupportedPercentages = claimedPercentages.filter((number) => !facts.percentages.has(number));
  return [...new Set([...unsupported, ...unsupportedPercentages.map((number) => `${number}%`)])];
}

function unsupportedRouteClaims(reply, userMessage) {
  const routes = [...reply.matchAll(/(?<![:/])\/[a-z][a-z0-9/_-]*/gi)].map((match) => match[0]);
  return [...new Set(routes.filter(
    (route) => !PUBLIC_NALA_ROUTES.has(route) && !userMessage.toLowerCase().includes(route.toLowerCase())
  ))];
}

function systemPrompt(supplement) {
  const extra = cleanText(supplement).slice(0, 2400);
  return extra
    ? `${BASE_SYSTEM_PROMPT}\n\nInstruksi tambahan owner:\n${extra}`
    : BASE_SYSTEM_PROMPT;
}

function providerError(message, code = "OPENROUTER_ERROR") {
  return Object.assign(new Error(message), { code });
}

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function retryDelay(response, retryNumber) {
  const retryAfter = Number.parseFloat(response?.headers?.get("retry-after") || "");
  if (Number.isFinite(retryAfter) && retryAfter >= 0) {
    return Math.min(2500, Math.round(retryAfter * 1000));
  }
  return 500 + retryNumber * 250;
}

function errorCodeForStatus(status) {
  if (status === 429) return "OPENROUTER_RATE_LIMIT";
  if (status === 408 || status === 524) return "OPENROUTER_TIMEOUT";
  if (status >= 500) return "OPENROUTER_UPSTREAM";
  return "OPENROUTER_ERROR";
}

async function callOpenRouter(messages, settings) {
  const apiKey = process.env.NALA_KEY;
  if (!apiKey) throw providerError("NALA_KEY belum dikonfigurasi di server.", "NALA_KEY_MISSING");
  if (!settings.enabled) throw providerError("Nala sedang dinonaktifkan dari Data Management.", "NALA_DISABLED");

  let emptyResponseRetries = 0;
  let transientRetries = 0;

  while (true) {
    let response;
    try {
      response = await fetch(OPENROUTER_ENDPOINT, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
          "HTTP-Referer": process.env.NEXT_PUBLIC_SITE_URL || "https://me.mukhtada.my.id",
          "X-Title": "Mukhtada Portfolio Nala",
        },
        body: JSON.stringify({
          model: settings.model,
          messages,
          temperature: settings.temperature,
          max_tokens: settings.maxTokens,
        }),
        signal: AbortSignal.timeout(PROVIDER_TIMEOUT_MS),
      });
    } catch (error) {
      if (error?.name === "TimeoutError" || error?.name === "AbortError") {
        if (transientRetries < MAX_TRANSIENT_PROVIDER_RETRIES) {
          transientRetries += 1;
          console.warn("Nala timed out waiting for OpenRouter; retrying once.", {
            model: settings.model,
            attempt: transientRetries,
          });
          await wait(retryDelay(null, transientRetries));
          continue;
        }
        throw providerError("OpenRouter melewati batas waktu respons.", "OPENROUTER_TIMEOUT");
      }
      if (transientRetries < MAX_TRANSIENT_PROVIDER_RETRIES) {
        transientRetries += 1;
        console.warn("Nala could not reach OpenRouter; retrying once.", {
          model: settings.model,
          attempt: transientRetries,
        });
        await wait(retryDelay(null, transientRetries));
        continue;
      }
      throw providerError("OpenRouter tidak dapat dijangkau.");
    }

    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      if (TRANSIENT_PROVIDER_STATUSES.has(response.status) && transientRetries < MAX_TRANSIENT_PROVIDER_RETRIES) {
        transientRetries += 1;
        console.warn("Nala received a transient OpenRouter error; retrying once.", {
          model: settings.model,
          status: response.status,
          errorType: cleanText(data?.error?.metadata?.error_type),
          attempt: transientRetries,
        });
        await wait(retryDelay(response, transientRetries));
        continue;
      }
      const detail = cleanText(data?.error?.message, `OpenRouter merespons ${response.status}.`);
      const error = providerError(detail, errorCodeForStatus(response.status));
      error.providerStatus = response.status;
      throw error;
    }
    if (data?.choices?.[0]?.message) return data;
    if (emptyResponseRetries < MAX_EMPTY_RESPONSE_RETRIES) {
      emptyResponseRetries += 1;
      console.warn("Nala received an empty OpenRouter completion; retrying.", {
        model: settings.model,
        attempt: emptyResponseRetries,
      });
      continue;
    }
    throw providerError("OpenRouter tidak mengirim completion yang dapat dibaca.", "OPENROUTER_EMPTY_RESPONSE");
  }
}

export async function getNalaReply({ message, history = [] }) {
  const userMessage = cleanText(message).slice(0, 1000);
  if (!userMessage) {
    throw Object.assign(new Error("Nala membutuhkan pertanyaan sebelum menjawab."), {
      code: "NALA_EMPTY_PROMPT",
    });
  }

  const storedSettings = await getNalaSettings();
  const settings = storedSettings.persisted || !process.env.NALA_MODEL
    ? storedSettings
    : { ...storedSettings, model: process.env.NALA_MODEL.trim().slice(0, 160) };
  const firstTool = inferNeededTool(userMessage);
  const toolArgs = initialToolArgs(firstTool, userMessage);
  const toolResult = await runNalaTool(firstTool, toolArgs);
  const toolResults = [{ name: firstTool, args: toolArgs, result: toolResult }];
  const action = inferNavigationAction(userMessage);
  const replyLanguage = preferredReplyLanguage(userMessage);
  const languageInstruction = replyLanguage === "English"
    ? "Respond in English only."
    : "Jawab hanya dalam Bahasa Indonesia.";
  const navigationContext = action?.type === "navigate"
    ? `\nUI telah menyiapkan tombol konfirmasi menuju ${action.route}. Katakan halaman itu siap dibuka, bukan sudah terbuka.`
    : "";
  const messages = [
    { role: "system", content: systemPrompt(settings.systemPromptSupplement) },
    ...toHistoryMessages(history),
    { role: "user", content: userMessage },
    {
      role: "system",
      content: `DATA_PORTOFOLIO_TERVERIFIKASI (${firstTool}):\n${JSON.stringify(toolResult).slice(0, 7000)}${navigationContext}\n${languageInstruction} Use ordinary sentences. Jangan tulis XML, JSON, nama function, parameter, atau markup tool.`,
    },
  ];
  let completion = await callOpenRouter(messages, settings);

  for (let attempt = 0; attempt < MAX_RESPONSE_ATTEMPTS; attempt += 1) {
    const assistant = completion.choices[0].message;
    const toolCalls = Array.isArray(assistant.tool_calls) ? assistant.tool_calls : [];
    const reply = contentText(assistant.content);
    const serializedToolCall = toolCalls.length > 0 || looksLikeSerializedToolCall(reply);
    const invalidRoutes = unsupportedRouteClaims(reply, userMessage);
    const unsupported = unsupportedNumericClaims(reply, toolResults);

    if (reply && !serializedToolCall && !invalidRoutes.length && !unsupported.length) {
      return {
        reply,
        expression: chooseExpression(toolResults, action),
        suggestedChips: chipsForTool(firstTool, toolResult),
        action,
        source: "openrouter",
        model: cleanText(completion.model, settings.model),
        toolResults,
      };
    }

    if (attempt >= MAX_RESPONSE_ATTEMPTS - 1) {
      if (serializedToolCall) {
        throw providerError("Nala mengirim markup tool sebagai jawaban teks.", "NALA_SERIALIZED_TOOL_CALL");
      }
      if (invalidRoutes.length) {
        throw providerError("Nala menyebut rute yang tidak tersedia.", "NALA_UNGROUNDED_ROUTE");
      }
      if (unsupported.length) {
        throw providerError("Nala menghasilkan klaim angka di luar data terverifikasi.", "NALA_UNGROUNDED_RESPONSE");
      }
      throw providerError("Nala tidak mengirim jawaban teks yang dapat dibaca.", "OPENROUTER_EMPTY_RESPONSE");
    }

    const problems = [
      !reply ? "jawaban teks kosong" : null,
      serializedToolCall ? "respons berisi tool call atau markup tool" : null,
      invalidRoutes.length ? `rute tidak valid: ${invalidRoutes.join(", ")}` : null,
      unsupported.length ? `angka tidak didukung: ${unsupported.join(", ")}` : null,
    ].filter(Boolean);
    messages.push({
      role: "system",
      content: `Revisi jawaban karena ${problems.join("; ")}. Gunakan hanya DATA_PORTOFOLIO_TERVERIFIKASI. Tulis 2-4 kalimat biasa tanpa XML, JSON, tool call, atau rute di luar ${[...PUBLIC_NALA_ROUTES].join(", ")}.`,
    });
    completion = await callOpenRouter(messages, settings);
  }

  throw providerError("Nala tidak menghasilkan jawaban yang tervalidasi.", "NALA_RESPONSE_INVALID");
}
