import { NextResponse } from "next/server";
import { getApiActor } from "@/lib/backend/routeAuth";
import { getNalaSettings, updateNalaSettings } from "@/lib/backend/featureStore";

export const dynamic = "force-dynamic";

function responseError(error, status = 500) {
  return NextResponse.json(
    {
      ok: false,
      error: error.code || "NALA_CONFIG_ERROR",
      message: error.message,
    },
    { status },
  );
}

async function requireOwnerActor(request) {
  const actor = await getApiActor(request);
  if (!actor) {
    const error = new Error("Login dibutuhkan untuk membuka konfigurasi Nala.");
    error.code = "LOGIN_REQUIRED";
    return { error: responseError(error, 401) };
  }
  if (actor.role !== "owner" && actor.role !== "backend") {
    const error = new Error("Konfigurasi Nala hanya tersedia untuk owner.");
    error.code = "NALA_CONFIG_FORBIDDEN";
    return { error: responseError(error, 403) };
  }
  return { actor };
}

function providerState() {
  return {
    endpoint: "https://openrouter.ai/api/v1/chat/completions",
    keyConfigured: Boolean(process.env.NALA_KEY),
  };
}

export async function GET(request) {
  const access = await requireOwnerActor(request);
  if (access.error) return access.error;
  try {
    const settings = await getNalaSettings();
    return NextResponse.json({ ok: true, settings, provider: providerState() });
  } catch (error) {
    return responseError(error);
  }
}

export async function PUT(request) {
  const access = await requireOwnerActor(request);
  if (access.error) return access.error;
  try {
    const payload = await request.json();
    const settings = await updateNalaSettings({ payload, actor: access.actor });
    return NextResponse.json({ ok: true, settings, provider: providerState() });
  } catch (error) {
    const message = String(error?.message || "");
    const status = message.includes("NALA_MODEL_INVALID") ? 400 : 500;
    return responseError(error, status);
  }
}
