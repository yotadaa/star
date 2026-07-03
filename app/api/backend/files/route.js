import { NextResponse } from "next/server";
import { canWriteBackend } from "@/lib/backend/routeAuth";
import { uploadFile } from "@/lib/backend/store";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

function parseMetadata(value) {
  if (!value) return {};
  try {
    const parsed = JSON.parse(value);
    return parsed && typeof parsed === "object" && !Array.isArray(parsed) ? parsed : {};
  } catch {
    return {};
  }
}

function errorResponse(error, status = 500) {
  return NextResponse.json(
    {
      ok: false,
      error: error.code || "BACKEND_FILES_ERROR",
      message: error.message,
    },
    { status }
  );
}

export async function POST(request) {
  const actor = await canWriteBackend(request);
  if (!actor) {
    return NextResponse.json({ ok: false, error: "UNAUTHORIZED" }, { status: 401 });
  }

  try {
    const form = await request.formData();
    const file = form.get("file");

    if (!file || typeof file.arrayBuffer !== "function") {
      return NextResponse.json({ ok: false, error: "MISSING_FILE" }, { status: 400 });
    }

    const stored = await uploadFile({
      file,
      recordId: form.get("recordId") || null,
      collection: form.get("collection") || "files",
      metadata: parseMetadata(form.get("metadata")),
    });

    return NextResponse.json({ ok: true, file: stored }, { status: 201 });
  } catch (error) {
    return errorResponse(error, 400);
  }
}
