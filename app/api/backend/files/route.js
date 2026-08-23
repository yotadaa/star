import { NextResponse } from "next/server";
import { canWriteBackend } from "@/lib/backend/routeAuth";
import { uploadFile } from "@/lib/backend/store";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const BLOG_IMAGE_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);
const MAX_BLOG_IMAGE_BYTES = 12 * 1024 * 1024;

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

function hasImageSignature(buffer, type) {
  if (type === "image/jpeg") {
    return buffer.length >= 3 && buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff;
  }
  if (type === "image/png") {
    return buffer.length >= 8 && buffer.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]));
  }
  if (type === "image/webp") {
    return buffer.length >= 12 && buffer.toString("ascii", 0, 4) === "RIFF" && buffer.toString("ascii", 8, 12) === "WEBP";
  }
  return false;
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

    const metadata = parseMetadata(form.get("metadata"));
    if (metadata.purpose === "blog-image-block") {
      if (!BLOG_IMAGE_TYPES.has(file.type)) {
        return NextResponse.json(
          { ok: false, error: "UNSUPPORTED_BLOG_IMAGE", message: "Blog images must be JPEG, PNG, or WebP." },
          { status: 415 },
        );
      }
      if (file.size < 1 || file.size > MAX_BLOG_IMAGE_BYTES) {
        return NextResponse.json(
          { ok: false, error: "BLOG_IMAGE_SIZE", message: "Compressed Blog images must be between 1 byte and 12 MB." },
          { status: 413 },
        );
      }
      const signature = Buffer.from(await file.arrayBuffer());
      if (!hasImageSignature(signature, file.type)) {
        return NextResponse.json(
          { ok: false, error: "BLOG_IMAGE_SIGNATURE", message: "The uploaded bytes do not match the declared image type." },
          { status: 415 },
        );
      }
      metadata.verifiedImage = {
        contentType: file.type,
        sizeBytes: file.size,
        checkedAt: Date.now(),
      };
    }

    const stored = await uploadFile({
      file,
      recordId: form.get("recordId") || null,
      metadata,
      actor,
    });

    return NextResponse.json({ ok: true, file: stored }, { status: 201 });
  } catch (error) {
    return errorResponse(error, 400);
  }
}
