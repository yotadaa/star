import { auth } from "@/auth";
import crypto from "node:crypto";

const BACKEND_HEADER = "x-backend-api-key";

function safeEqual(a, b) {
  if (!a || !b) return false;
  const left = Buffer.from(a);
  const right = Buffer.from(b);
  return left.length === right.length && crypto.timingSafeEqual(left, right);
}

export function requestHasBackendKey(request) {
  return safeEqual(request.headers.get(BACKEND_HEADER), process.env.BACKEND_API_KEY);
}

export async function getApiActor(request) {
  if (requestHasBackendKey(request)) {
    return { role: "backend", email: "backend@local", name: "Backend", key: "backend" };
  }

  const session = await auth();
  if (!session?.user) return null;

  const email = session.user.email?.toLowerCase() || null;
  return {
    role: session.user.role || "visitor",
    email,
    name: session.user.name || null,
    image: session.user.image || null,
    key: email ? crypto.createHash("sha256").update(email).digest("hex").slice(0, 32) : null,
  };
}

export async function canWriteBackend(request) {
  const actor = await getApiActor(request);
  return actor?.role === "backend" || actor?.role === "owner" ? actor : null;
}
