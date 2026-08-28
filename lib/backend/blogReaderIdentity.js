import "server-only";
import crypto from "node:crypto";

export const BLOG_READER_COOKIE = "mb_blog_voter";

function cleanSlug(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function blogReaderIdentity(request) {
  const existing = request.cookies.get(BLOG_READER_COOKIE)?.value || "";
  return /^[a-f0-9-]{36}$/i.test(existing)
    ? { token: existing, fresh: false }
    : { token: crypto.randomUUID(), fresh: true };
}

export function blogVoterHash(token) {
  return crypto.createHash("sha256").update(String(token || "")).digest("hex");
}

export function blogReaderHash(token, slug) {
  const secret = process.env.AUTH_SECRET;
  if (!secret) {
    const error = new Error("AUTH_SECRET is required for private Blog reading hashes.");
    error.code = "BLOG_READING_AUTH_ENV_MISSING";
    throw error;
  }
  const cleanPostSlug = cleanSlug(slug);
  if (!cleanPostSlug) {
    const error = new Error("A valid Blog slug is required for reading analytics.");
    error.code = "BLOG_SLUG_INVALID";
    throw error;
  }
  return crypto
    .createHmac("sha256", secret)
    .update(`blog-reading:v1:${cleanPostSlug}:${String(token || "")}`)
    .digest("hex");
}

export function applyBlogReaderCookie(response, identity) {
  if (!identity?.fresh) return response;
  response.cookies.set(BLOG_READER_COOKIE, identity.token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
  });
  return response;
}
