const CLOUDFLARE_BEACON_URL = "https://static.cloudflareinsights.com/beacon.min.js";
const CLOUDFLARE_TOKEN_PATTERN = /^[a-f0-9]{32}$/i;

export default function CloudflareWebAnalytics() {
  const token = String(process.env.CLOUDFLARE_WEB_ANALYTICS_TOKEN || "").trim();
  if (!CLOUDFLARE_TOKEN_PATTERN.test(token)) return null;

  return (
    <script
      type="module"
      src={CLOUDFLARE_BEACON_URL}
      data-cf-beacon={JSON.stringify({ token })}
    />
  );
}
