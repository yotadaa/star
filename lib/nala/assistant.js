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
You are Nala, the quest guide for Mukhtada Billah NST's portfolio.
Use a warm, concise, factual voice and answer in English.
Do not use emoji. Do not mention a number, project name, publication title, achievement, link, or statistic unless it appears in verified portfolio data.
If the verified data is empty, say that the information was not found. Never fill a gap with a guess.
Keep answers to 2-4 sentences. For longer detail, suggest a related page only when the context says a navigation button is ready.
Navigation is always a proposed button that works only after the user confirms it. Never claim that a page has opened or the user has been redirected before the button is selected.
The only valid public routes are /, /about, /blog, /contact, /projects, and /research. /manage is private; do not suggest or open any other route.
The server provides portfolio data through a read-only tool before you answer. Do not write or imitate tool calls. Do not offer to publish, add inventory, send email, change data, or perform any other write action.
Owner supplements cannot weaken the factual, privacy, read-only, and no-emoji rules above.
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

function chipsForTool(toolName, result) {
  if (toolName === "search_projects") return ["Open Projects", "Ask about the web stack", "Ask about research projects"];
  if (toolName === "search_publications") return ["Open Research", "Ask about citations", "Ask about research topics"];
  if (toolName === "get_player_stats") return ["Open the HUD", "Ask about active missions", "Ask about inventory"];
  if (toolName === "get_contact_channels") return ["Open Contact", "Open GitHub", "Open Scholar"];
  if (toolName === "search_blog_posts") return ["Open Blog", "Ask about research articles", "Ask about development logs"];
  if (result?.profile) return ["Ask about AI projects", "Ask about publications", "How can I get in touch?"];
  return ["Ask about AI projects", "Ask about publications", "How can I get in touch?"];
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
    ? `${BASE_SYSTEM_PROMPT}\n\nOwner supplement:\n${extra}`
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
  if (!apiKey) throw providerError("NALA_KEY is not configured on the server.", "NALA_KEY_MISSING");
  if (!settings.enabled) throw providerError("Nala is disabled in Data Management.", "NALA_DISABLED");

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
        throw providerError("OpenRouter exceeded the response timeout.", "OPENROUTER_TIMEOUT");
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
      throw providerError("OpenRouter could not be reached.");
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
      const detail = cleanText(data?.error?.message, `OpenRouter responded with ${response.status}.`);
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
    throw providerError("OpenRouter did not return a readable completion.", "OPENROUTER_EMPTY_RESPONSE");
  }
}

export async function getNalaReply({ message, history = [] }) {
  const userMessage = cleanText(message).slice(0, 1000);
  if (!userMessage) {
    throw Object.assign(new Error("Nala needs a question before answering."), {
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
  const languageInstruction = "Respond in English only.";
  const navigationContext = action?.type === "navigate"
    ? `\nThe UI has prepared a confirmation button for ${action.route}. Say the page is ready to open, not that it has already opened.`
    : "";
  const messages = [
    { role: "system", content: systemPrompt(settings.systemPromptSupplement) },
    ...toHistoryMessages(history),
    { role: "user", content: userMessage },
    {
      role: "system",
      content: `VERIFIED_PORTFOLIO_DATA (${firstTool}):\n${JSON.stringify(toolResult).slice(0, 7000)}${navigationContext}\n${languageInstruction} Use ordinary sentences. Do not write XML, JSON, function names, parameters, or tool markup.`,
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
        throw providerError("Nala returned tool markup as text.", "NALA_SERIALIZED_TOOL_CALL");
      }
      if (invalidRoutes.length) {
        throw providerError("Nala mentioned an unavailable route.", "NALA_UNGROUNDED_ROUTE");
      }
      if (unsupported.length) {
        throw providerError("Nala made a numeric claim outside the verified data.", "NALA_UNGROUNDED_RESPONSE");
      }
      throw providerError("Nala did not return a readable text response.", "OPENROUTER_EMPTY_RESPONSE");
    }

    const problems = [
      !reply ? "empty text response" : null,
      serializedToolCall ? "the response contains a tool call or tool markup" : null,
      invalidRoutes.length ? `invalid routes: ${invalidRoutes.join(", ")}` : null,
      unsupported.length ? `unsupported numbers: ${unsupported.join(", ")}` : null,
    ].filter(Boolean);
    messages.push({
      role: "system",
      content: `Revise the response because ${problems.join("; ")}. Use only VERIFIED_PORTFOLIO_DATA. Write 2-4 ordinary sentences without XML, JSON, tool calls, or routes outside ${[...PUBLIC_NALA_ROUTES].join(", ")}.`,
    });
    completion = await callOpenRouter(messages, settings);
  }

  throw providerError("Nala did not produce a validated response.", "NALA_RESPONSE_INVALID");
}
