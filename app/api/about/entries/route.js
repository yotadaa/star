import { NextResponse } from "next/server";
import { canWriteBackend } from "@/lib/backend/routeAuth";
import { createAboutEntry, listAboutEntries, upsertAboutEntry } from "@/lib/backend/featureStore";

export const dynamic = "force-dynamic";

function errorResponse(error, status = 500) {
  return NextResponse.json(
    {
      ok: false,
      error: error.code || "ABOUT_API_ERROR",
      message: error.message,
    },
    { status }
  );
}

export async function GET() {
  try {
    const result = await listAboutEntries();
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
    const entry = await createAboutEntry({ payload, actor });
    return NextResponse.json({ ok: true, entry, source: "convex" }, { status: 201 });
  } catch (error) {
    return errorResponse(error, 400);
  }
}

export async function PUT(request) {
  const actor = await canWriteBackend(request);
  if (!actor) {
    return NextResponse.json({ ok: false, error: "UNAUTHORIZED" }, { status: 401 });
  }

  try {
    const payload = await request.json();
    const entry = await upsertAboutEntry({ payload, actor });
    return NextResponse.json({ ok: true, entry, source: "convex" });
  } catch (error) {
    return errorResponse(error, 400);
  }
}
