import { NextResponse } from "next/server";
import { getApiActor } from "@/lib/backend/routeAuth";
import { createChatMessage, listChatMessages } from "@/lib/backend/featureStore";

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
    return NextResponse.json({ ok: false, error: "LOGIN_REQUIRED" }, { status: 401 });
  }

  try {
    const payload = await request.json();
    const message = await createChatMessage({ body: payload.body, actor });
    return NextResponse.json({ ok: true, message, source: "supabase" }, { status: 201 });
  } catch (error) {
    return errorResponse(error, error.code === "CHAT_EMPTY" ? 400 : 500);
  }
}
