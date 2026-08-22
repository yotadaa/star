import { NextResponse } from "next/server";
import { getApiActor } from "@/lib/backend/routeAuth";
import { createChatMessage, deleteChatMessage, listChatMessages } from "@/lib/backend/featureStore";

export const dynamic = "force-dynamic";

function errorResponse(error, status = 500) {
  return NextResponse.json(
    {
      ok: false,
      error: error.code || "CHAT_API_ERROR",
      message: error.message,
    },
    { status }
  );
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const result = await listChatMessages({ limit: searchParams.get("limit") });
    return NextResponse.json({ ok: true, ...result });
  } catch (error) {
    return errorResponse(error);
  }
}

export async function POST(request) {
  const actor = await getApiActor(request);
  if (!actor?.email) {
    return NextResponse.json(
      {
        ok: false,
        error: "LOGIN_REQUIRED",
        message: "Login ke System dibutuhkan sebelum mengirim pesan. GET chat tetap bisa 200 karena membaca channel publik.",
      },
      { status: 401 }
    );
  }

  try {
    const payload = await request.json();
    const message = await createChatMessage({ body: payload.body, replyToId: payload.replyToId, actor });
    return NextResponse.json({ ok: true, message, source: "convex" }, { status: 201 });
  } catch (error) {
    const clientErrors = ["CHAT_EMPTY", "CHAT_TOO_LONG", "CHAT_PARENT_INVALID", "CHAT_PARENT_NOT_FOUND", "CHAT_PARENT_DELETED"];
    return errorResponse(error, clientErrors.includes(error.code) ? 400 : 500);
  }
}

export async function DELETE(request) {
  const actor = await getApiActor(request);
  if (!actor) {
    return errorResponse(Object.assign(new Error("Login dibutuhkan sebelum menghapus pesan."), { code: "LOGIN_REQUIRED" }), 401);
  }
  if (actor.role !== "owner" && actor.role !== "backend") {
    return errorResponse(Object.assign(new Error("Hanya owner yang dapat menghapus World Chat."), { code: "CHAT_FORBIDDEN" }), 403);
  }

  try {
    const { searchParams } = new URL(request.url);
    const deleted = await deleteChatMessage({ id: searchParams.get("id"), actor });
    if (!deleted) {
      return errorResponse(Object.assign(new Error("Pesan tidak ditemukan."), { code: "CHAT_NOT_FOUND" }), 404);
    }
    return NextResponse.json({ ok: true, deleted: true, source: "convex" });
  } catch (error) {
    const status = error.code === "CHAT_ID_INVALID" ? 400 : error.code === "CHAT_FORBIDDEN" ? 403 : 500;
    return errorResponse(error, status);
  }
}
