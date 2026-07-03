import { auth } from "@/auth";
import { BACKEND_HEADER, getBackendAppKey } from "@/lib/backend/shards";
import crypto from "node:crypto";

function safeEqual(a, b) {
  if (!a || !b) return false;
  const left = Buffer.from(a);
  const right = Buffer.from(b);
  return left.length === right.length && crypto.timingSafeEqual(left, right);
}

export function requestHasBackendKey(request) {
  return safeEqual(request.headers.get(BACKEND_HEADER), getBackendAppKey());
}

export async function getApiActor(request) {
  if (requestHasBackendKey(request)) {
    return { role: "backend", email: "backend@local" };
  }

  const session = await auth();
  if (!session?.user) return null;

  return {
    role: session.user.role || "visitor",
    email: session.user.email || null,
  };
}

export async function canWriteBackend(request) {
  const actor = await getApiActor(request);
  return actor?.role === "backend" || actor?.role === "owner" ? actor : null;
}
