import { NextResponse } from "next/server";
import { canWriteBackend, getApiActor } from "@/lib/backend/routeAuth";
import { createRecord, listRecords } from "@/lib/backend/store";

export const dynamic = "force-dynamic";

function errorResponse(error, status = 500) {
  return NextResponse.json(
    {
      ok: false,
      error: error.code || "BACKEND_RECORDS_ERROR",
      message: error.message,
    },
    { status }
  );
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const actor = await getApiActor(request);
    const records = await listRecords({
      collection: searchParams.get("collection"),
      limit: searchParams.get("limit"),
      includePrivate: actor?.role === "owner" || actor?.role === "backend",
    });

    return NextResponse.json({ ok: true, records });
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
    const body = await request.json();
    const record = await createRecord({
      collection: body.collection,
      payload: body.payload,
      visibility: body.visibility,
      slug: body.slug,
      actor,
    });

    return NextResponse.json({ ok: true, record }, { status: 201 });
  } catch (error) {
    return errorResponse(error, 400);
  }
}
