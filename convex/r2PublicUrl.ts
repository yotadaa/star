function publicDomain() {
  const configured = String(process.env.R2_PUBLIC_DOMAIN || "").trim().replace(/\/+$/, "");
  if (!configured) throw new Error("R2_PUBLIC_DOMAIN_NOT_CONFIGURED");
  try {
    const url = new URL(configured);
    if (
      url.protocol !== "https:"
      || url.username
      || url.password
      || url.pathname !== "/"
      || url.search
      || url.hash
    ) {
      throw new Error("R2_PUBLIC_DOMAIN_INVALID");
    }
    return url.origin;
  } catch {
    throw new Error("R2_PUBLIC_DOMAIN_INVALID");
  }
}

export function r2PublicUrl(key: string) {
  const domain = publicDomain();
  const cleanKey = key.trim();
  if (!cleanKey || cleanKey.startsWith("/") || cleanKey.includes("..")) {
    throw new Error("FILE_R2_KEY_INVALID");
  }
  const encodedKey = cleanKey.split("/").map(encodeURIComponent).join("/");
  return `${domain}/${encodedKey}`;
}
