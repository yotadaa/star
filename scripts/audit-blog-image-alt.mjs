const baseArgument = process.argv.find((argument) => argument.startsWith("--base="));
const baseUrl = new URL(baseArgument ? baseArgument.slice("--base=".length) : "http://localhost:3123");

function decodeAttribute(value) {
  return String(value || "")
    .replaceAll("&quot;", '"')
    .replaceAll("&#39;", "'")
    .replaceAll("&amp;", "&")
    .replaceAll("&lt;", "<")
    .replaceAll("&gt;", ">")
    .trim();
}

function imageTags(html) {
  return [...String(html || "").matchAll(/<img\b[^>]*>/gi)].map((match) => match[0]);
}

function imageAlt(tag) {
  const match = tag.match(/\balt\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+))/i);
  if (!match) return null;
  return decodeAttribute(match[1] ?? match[2] ?? match[3]);
}

async function fetchText(url) {
  const response = await fetch(url, {
    headers: { "User-Agent": "star-blog-alt-audit/1.0" },
    signal: AbortSignal.timeout(30_000),
  });
  if (!response.ok) throw new Error(`${url} returned HTTP ${response.status}`);
  return response.text();
}

const sitemapUrl = new URL("/sitemap-blog.xml", baseUrl);
const sitemap = await fetchText(sitemapUrl);
const sitemapLocations = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/gi)]
  .map((match) => decodeAttribute(match[1]));

if (!sitemapLocations.length) {
  throw new Error(`${sitemapUrl} did not contain Blog URLs`);
}

const paths = new Set(["/blog"]);
for (const location of sitemapLocations) {
  const pathname = new URL(location, baseUrl).pathname;
  if (pathname === "/blog" || pathname.startsWith("/blog/")) paths.add(pathname);
}

const results = await Promise.all([...paths].sort().map(async (pathname) => {
  const url = new URL(pathname, baseUrl);
  const html = await fetchText(url);
  const tags = imageTags(html);
  const failures = tags
    .map((tag, index) => ({ index: index + 1, alt: imageAlt(tag), tag }))
    .filter((image) => image.alt === null || image.alt === "");
  return { pathname, total: tags.length, failures };
}));

const failures = results.flatMap((result) => result.failures.map((failure) => ({
  pathname: result.pathname,
  ...failure,
})));
const imageCount = results.reduce((total, result) => total + result.total, 0);

if (failures.length) {
  for (const failure of failures) {
    console.error(`${failure.pathname} image ${failure.index}: ${failure.alt === null ? "missing alt" : "empty alt"}`);
    console.error(`  ${failure.tag}`);
  }
  throw new Error(`${failures.length} of ${imageCount} rendered Blog images have a missing or empty alt attribute`);
}

console.log(`Blog image ALT audit passed: ${results.length} routes, ${imageCount} images, zero missing or empty alt attributes.`);
