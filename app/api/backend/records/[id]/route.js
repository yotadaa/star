import { NextResponse } from "next/server";
import { canWriteBackend, getApiActor } from "@/lib/backend/routeAuth";
import { deleteRecordById, getRecordById } from "@/lib/backend/store";

export const dynamic = "force-dynamic";

function errorResponse(error, status = 500) {
  return NextResponse.json(
    {
      ok: false,
      error: error.code || "BACKEND_RECORD_ERROR",
      message: error.message,
    },
    { status }
  );
}

export async function GET(request, context) {
  try {
    const { id } = await context.params;
    const actor = await getApiActor(request);
    const record = await getRecordById(id);

    if (!record) {
      return NextResponse.json({ ok: false, error: "NOT_FOUND" }, { status: 404 });
    }

    if (record.visibility !== "public" && actor?.role !== "owner" && actor?.role !== "backend") {
      return NextResponse.json({ ok: false, error: "FORBIDDEN" }, { status: 403 });
    }

    return NextResponse.json({ ok: true, record });
  } catch (error) {
    return errorResponse(error);
  }
}

export async function DELETE(request, context) {
  const actor = await canWriteBackend(request);
  if (!actor) {
    return NextResponse.json({ ok: false, error: "UNAUTHORIZED" }, { status: 401 });
  }

  try {
    const { id } = await context.params;
    const deleted = await deleteRecordById(id);
    if (!deleted) {
      return NextResponse.json({ ok: false, error: "NOT_FOUND" }, { status: 404 });
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    return errorResponse(error);
  }
}
