import { NextResponse } from "next/server";
import crypto from "node:crypto";
import { getNalaReply } from "@/lib/nala/assistant";
import { storeNalaExchange } from "@/lib/backend/nalaStore";

export const dynamic = "force-dynamic";

const WINDOW_MS = 60_000;
const MAX_REQUESTS = 12;

function cleanText(value, fallback = "") {
  return String(value ?? fallback).trim();
}

function getClientKey(request, sessionKey) {
  const forwarded = request.headers.get("x-forwarded-for") || "";
  const ip = forwarded.split(",")[0]?.trim() || request.headers.get("x-real-ip") || "local";
  return crypto.createHash("sha256").update(`${sessionKey || "anon"}:${ip}`).digest("hex").slice(0, 32);
}

function isRateLimited(key) {
  const stateKey = "__mbNalaRateLimit";
  if (!globalThis[stateKey]) globalThis[stateKey] = new Map();
  const state = globalThis[stateKey];
  const now = Date.now();
  const current = state.get(key) || { count: 0, resetAt: now + WINDOW_MS };

  if (current.resetAt < now) {
    current.count = 0;
    current.resetAt = now + WINDOW_MS;
  }

  current.count += 1;
  state.set(key, current);
  return current.count > MAX_REQUESTS;
}

function errorResponse(error, status = 500) {
  return NextResponse.json(
    {
      ok: false,
      error: error.code || "NALA_API_ERROR",
      message: error.message,
    },
    { status }
  );
}

export async function POST(request) {
  try {
    const payload = await request.json();
    const message = cleanText(payload.message).slice(0, 1000);
    const sessionKey = cleanText(payload.sessionKey, "anonymous-session").slice(0, 120);
    const conversationId = cleanText(payload.conversationId);

    if (!message) {
      return errorResponse(Object.assign(new Error("Pertanyaan Nala tidak boleh kosong."), { code: "NALA_EMPTY_PROMPT" }), 400);
    }

    const clientKey = getClientKey(request, sessionKey);
    if (isRateLimited(clientKey)) {
      return errorResponse(Object.assign(new Error("Terlalu banyak pesan ke Nala dalam satu menit. Coba lagi sebentar."), { code: "NALA_RATE_LIMITED" }), 429);
    }

    const answer = await getNalaReply({ message, history: payload.history });
    const warnings = Array.isArray(answer.warnings) ? [...answer.warnings] : [];
    let persistence = null;

    try {
      persistence = await storeNalaExchange({
        conversationId,
        sessionKey,
        userMessage: message,
        assistantMessage: answer.reply,
        expression: answer.expression,
        source: answer.source,
        toolResults: answer.toolResults,
        action: answer.action,
        metadata: {
          client: "nala-widget",
          openRouterConfigured: Boolean(process.env.OPENROUTER_API_KEY || process.env.NALA_OPENROUTER_API_KEY),
        },
      });
    } catch (error) {
      warnings.push(`storage:${error.code || "error"}:${error.message || "unknown error"}`);
    }

    return NextResponse.json({
      ok: true,
      reply: answer.reply,
      expression: answer.expression,
      suggestedChips: answer.suggestedChips || [],
      action: answer.action || null,
      source: answer.source,
      conversationId: persistence?.conversationId || conversationId || null,
      storage: persistence?.storage || null,
      warnings,
    });
  } catch (error) {
    return errorResponse(error, error.code === "NALA_EMPTY_PROMPT" ? 400 : 500);
  }
}
