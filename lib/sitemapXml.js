const XML_HEADER = '<?xml version="1.0" encoding="UTF-8"?>';

function escapeXml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}

function optionalTag(name, value) {
  if (value === undefined || value === null || value === "") return "";
  return `\n    <${name}>${escapeXml(value)}</${name}>`;
}

export function renderSitemapIndex(entries) {
  const items = entries.map((entry) => (
    `  <sitemap>\n    <loc>${escapeXml(entry.url)}</loc>${optionalTag("lastmod", entry.lastModified)}\n  </sitemap>`
  ));

  return `${XML_HEADER}\n<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${items.join("\n")}\n</sitemapindex>\n`;
}

export function renderUrlSet(entries) {
  const items = entries.map((entry) => (
    `  <url>\n    <loc>${escapeXml(entry.url)}</loc>${optionalTag("lastmod", entry.lastModified)}${optionalTag("changefreq", entry.changeFrequency)}${optionalTag("priority", entry.priority)}\n  </url>`
  ));

  return `${XML_HEADER}\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${items.join("\n")}\n</urlset>\n`;
}

export function sitemapResponse(xml) {
  return new Response(xml, {
    status: 200,
    headers: {
      "Cache-Control": "public, max-age=0, s-maxage=3600, stale-while-revalidate=86400",
      "Content-Type": "application/xml; charset=utf-8",
    },
  });
}
