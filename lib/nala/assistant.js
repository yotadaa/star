import { getNalaSettings } from "@/lib/backend/featureStore";
import {
  NALA_TOOL_DEFINITIONS,
  NALA_TOOL_NAMES,
  inferNeededTool,
  initialToolArgs,
  runNalaTool,
} from "@/lib/nala/tools";

const OPENROUTER_ENDPOINT = "https://openrouter.ai/api/v1/chat/completions";
const MAX_HISTORY = 8;
const MAX_MODEL_TURNS = 3;
const PROVIDER_TIMEOUT_MS = 24_000;
const MAX_EMPTY_RESPONSE_RETRIES = 2;

const BASE_SYSTEM_PROMPT = `
Kamu adalah Nala, pemandu quest di portofolio Mukhtada Billah NST.
Nada bicara hangat, ringkas, dan faktual. Jawab dalam Bahasa Indonesia kecuali user memakai Bahasa Inggris.
Jangan memakai emoji. Jangan menyebut angka, nama proyek, judul publikasi, achievement, link, atau statistik yang tidak ada di hasil tool.
Kalau hasil tool kosong, katakan bahwa datanya belum ditemukan. Jangan mengisi celah dengan tebakan.
Jawaban maksimal 2-4 kalimat. Untuk detail panjang, sarankan halaman terkait melalui tool navigate_to.
Tool bersifat read-only. Jangan menawarkan aksi tulis, publish, tambah inventory, kirim email, atau mengubah database.
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

function parseArgs(raw) {
  if (!raw) return {};
  if (typeof raw === "object") return raw;
  try {
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    throw Object.assign(new Error("OpenRouter mengirim argumen tool yang tidak valid."), {
      code: "NALA_TOOL_ARGUMENTS_INVALID",
    });
  }
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

function systemPrompt(supplement) {
  const extra = cleanText(supplement).slice(0, 2400);
  return extra
    ? `${BASE_SYSTEM_PROMPT}\n\nInstruksi tambahan owner:\n${extra}`
    : BASE_SYSTEM_PROMPT;
}

function requiredToolChoice(name) {
  return { type: "function", function: { name } };
}

function providerError(message, code = "OPENROUTER_ERROR") {
  return Object.assign(new Error(message), { code });
}

async function callOpenRouter(messages, settings, toolChoice) {
  const apiKey = process.env.NALA_KEY;
  if (!apiKey) throw providerError("NALA_KEY belum dikonfigurasi di server.", "NALA_KEY_MISSING");
  if (!settings.enabled) throw providerError("Nala sedang dinonaktifkan dari Data Management.", "NALA_DISABLED");

  for (let attempt = 0; attempt <= MAX_EMPTY_RESPONSE_RETRIES; attempt += 1) {
    let response;
    try {
      response = await fetch(OPENROUTER_ENDPOINT, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
          "HTTP-Referer": process.env.NEXT_PUBLIC_SITE_URL || "https://mukhtada.my.id",
          "X-Title": "Mukhtada Portfolio Nala",
        },
        body: JSON.stringify({
          model: settings.model,
          messages,
          tools: NALA_TOOL_DEFINITIONS,
          tool_choice: toolChoice,
          parallel_tool_calls: false,
          temperature: settings.temperature,
          max_tokens: settings.maxTokens,
        }),
        signal: AbortSignal.timeout(PROVIDER_TIMEOUT_MS),
      });
    } catch (error) {
      if (error?.name === "TimeoutError" || error?.name === "AbortError") {
        throw providerError("OpenRouter melewati batas waktu respons.", "OPENROUTER_TIMEOUT");
      }
      throw providerError("OpenRouter tidak dapat dijangkau.");
    }

    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      const detail = cleanText(data?.error?.message, `OpenRouter merespons ${response.status}.`);
      const error = providerError(detail);
      error.providerStatus = response.status;
      throw error;
    }
    if (data?.choices?.[0]?.message) return data;
    if (attempt < MAX_EMPTY_RESPONSE_RETRIES) {
      console.warn("Nala received an empty OpenRouter completion; retrying.", {
        model: settings.model,
        attempt: attempt + 1,
      });
    }
  }

  throw providerError("OpenRouter tidak mengirim completion yang dapat dibaca.", "OPENROUTER_EMPTY_RESPONSE");
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
  const messages = [
    { role: "system", content: systemPrompt(settings.systemPromptSupplement) },
    ...toHistoryMessages(history),
    { role: "user", content: userMessage },
  ];
  const toolResults = [];
  let action = null;
  let completion = await callOpenRouter(messages, settings, requiredToolChoice(firstTool));

  for (let turn = 0; turn < MAX_MODEL_TURNS; turn += 1) {
    const assistant = completion.choices[0].message;
    const toolCalls = Array.isArray(assistant.tool_calls) ? assistant.tool_calls : [];

    if (!toolCalls.length) {
      const reply = contentText(assistant.content);
      if (!toolResults.length) {
        throw providerError("Nala tidak memanggil tool data yang diwajibkan.", "NALA_TOOL_REQUIRED");
      }
      if (!reply) {
        throw providerError("Nala menyelesaikan tool tanpa jawaban teks.", "OPENROUTER_EMPTY_RESPONSE");
      }
      const unsupported = unsupportedNumericClaims(reply, toolResults);
      if (unsupported.length) {
        if (turn >= MAX_MODEL_TURNS - 1) {
          throw providerError("Nala menghasilkan klaim angka di luar hasil tool.", "NALA_UNGROUNDED_RESPONSE");
        }
        messages.push(assistant);
        messages.push({
          role: "system",
          content: `Revisi jawaban. Hapus klaim angka yang tidak didukung hasil tool ini: ${unsupported.join(", ")}. Jangan menghitung persentase baru. Gunakan hanya fakta berikut: ${JSON.stringify(toolResults.map((item) => item.result)).slice(0, 6000)}`,
        });
        completion = await callOpenRouter(messages, settings, "none");
        continue;
      }
      const last = toolResults.at(-1);
      return {
        reply,
        expression: chooseExpression(toolResults, action),
        suggestedChips: chipsForTool(last?.name, last?.result),
        action,
        source: "openrouter",
        model: cleanText(completion.model, settings.model),
        toolResults,
      };
    }

    messages.push(assistant);
    for (const call of toolCalls) {
      const name = cleanText(call?.function?.name);
      if (!NALA_TOOL_NAMES.has(name)) {
        throw providerError("OpenRouter meminta tool yang tidak tersedia.", "NALA_TOOL_UNKNOWN");
      }
      const args = turn === 0 && name === firstTool
        ? { ...initialToolArgs(firstTool, userMessage), ...parseArgs(call.function?.arguments) }
        : parseArgs(call.function?.arguments);
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

    completion = await callOpenRouter(messages, settings, "auto");
  }

  throw providerError("Nala mencapai batas tiga putaran tool tanpa jawaban akhir.", "NALA_TOOL_LIMIT");
}
