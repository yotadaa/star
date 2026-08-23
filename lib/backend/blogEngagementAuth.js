import crypto from "node:crypto";

export function commentActorToken(actorKey) {
  const secret = process.env.AUTH_SECRET;
  if (!secret) {
    const error = new Error("AUTH_SECRET is required for private Blog comment ownership tokens.");
    error.code = "BLOG_COMMENT_AUTH_ENV_MISSING";
    throw error;
  }
  return crypto.createHmac("sha256", secret).update(String(actorKey || "")).digest("hex");
}
