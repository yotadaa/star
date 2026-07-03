import { NextResponse } from "next/server";
import { canWriteBackend } from "@/lib/backend/routeAuth";
import { createInventoryItem, listInventoryItems } from "@/lib/backend/featureStore";

export const dynamic = "force-dynamic";

function errorResponse(error, status = 500) {
  return NextResponse.json(
    {
      ok: false,
      error: error.code || "INVENTORY_API_ERROR",
      message: error.message,
    },
    { status }
  );
}

export async function GET() {
  try {
    const result = await listInventoryItems();
    return NextResponse.json({ ok: true, ...result });
  } catch (error) {
    return errorResponse(error);
  }
}

export async function POST(request) {
  const actor = await canWriteBackend(request);
  if (!actor) {
    return NextResponse.json({ ok: false, error: "UNAUTHORIZED" }, { status: 401 });
  }

  try {
    const payload = await request.json();
    const item = await createInventoryItem({ payload, actor });
    return NextResponse.json({ ok: true, item, source: "supabase" }, { status: 201 });
  } catch (error) {
    return errorResponse(error, 400);
  }
}
