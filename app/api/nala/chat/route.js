import { NextResponse } from "next/server";
import crypto from "node:crypto";
import { getNalaReply } from "@/lib/nala/assistant";

export const dynamic = "force-dynamic";

const WINDOW_MS = 60_000;
const MAX_REQUESTS = 12;
const GLOBAL_MAX_REQUESTS = 60;

function cleanText(value, fallback = "") {
  return String(value ?? fallback).trim();
}

function getClientKey(request) {
  const forwarded = request.headers.get("x-forwarded-for") || "";
  const ip = forwarded.split(",")[0]?.trim() || request.headers.get("x-real-ip") || "local";
  return crypto.createHash("sha256").update(ip).digest("hex").slice(0, 32);
}

function isRateLimited(key) {
  const stateKey = "__mbNalaRateLimit";
  if (!globalThis[stateKey]) globalThis[stateKey] = new Map();
  const state = globalThis[stateKey];
  const now = Date.now();
  for (const [entryKey, entry] of state) {
    if (entry.resetAt < now) state.delete(entryKey);
  }
  const globalKey = "global";
  const globalRate = state.get(globalKey) || { count: 0, resetAt: now + WINDOW_MS };
  globalRate.count += 1;
  state.set(globalKey, globalRate);
  const current = state.get(key) || { count: 0, resetAt: now + WINDOW_MS };

  if (current.resetAt < now) {
    current.count = 0;
    current.resetAt = now + WINDOW_MS;
  }

  current.count += 1;
  state.set(key, current);
  return current.count > MAX_REQUESTS || globalRate.count > GLOBAL_MAX_REQUESTS;
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
    const conversationId = cleanText(payload.conversationId);

    if (!message) {
      return errorResponse(Object.assign(new Error("Pertanyaan Nala tidak boleh kosong."), { code: "NALA_EMPTY_PROMPT" }), 400);
    }

    const clientKey = getClientKey(request);
    if (isRateLimited(clientKey)) {
      return errorResponse(Object.assign(new Error("Terlalu banyak pesan ke Nala dalam satu menit. Coba lagi sebentar."), { code: "NALA_RATE_LIMITED" }), 429);
    }

    const answer = await getNalaReply({ message, history: payload.history });
    const warnings = [
      ...(Array.isArray(answer.warnings) ? answer.warnings : []),
      "history:not-restored:legacy-database-unavailable",
    ];

    return NextResponse.json({
      ok: true,
      reply: answer.reply,
      expression: answer.expression,
      suggestedChips: answer.suggestedChips || [],
      action: answer.action || null,
      source: answer.source,
      model: answer.model || null,
      conversationId: conversationId || null,
      storage: null,
      warnings,
    });
  } catch (error) {
    const statusByCode = {
      NALA_EMPTY_PROMPT: 400,
      NALA_RATE_LIMITED: 429,
      NALA_KEY_MISSING: 503,
      NALA_DISABLED: 503,
      OPENROUTER_ERROR: 502,
      OPENROUTER_TIMEOUT: 504,
      OPENROUTER_EMPTY_RESPONSE: 502,
      NALA_TOOL_ARGUMENTS_INVALID: 502,
      NALA_TOOL_REQUIRED: 502,
      NALA_TOOL_UNKNOWN: 502,
      NALA_TOOL_LIMIT: 502,
      NALA_UNGROUNDED_RESPONSE: 502,
    };
    return errorResponse(error, statusByCode[error.code] || 500);
  }
}
