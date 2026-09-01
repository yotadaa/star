# Six bilingual platform guides — publication validation

## Published routes

| Topic | English | Indonesian |
|---|---|---|
| Hacktoberfest 2026 | `/blog/hacktoberfest-2026-new-rules-no-pr-counter` | `/blog/hacktoberfest-2026-aturan-cara-ikut` |
| Node.js 26 + Next.js | `/blog/nodejs-26-lts-nextjs-upgrade-guide` | `/blog/nodejs-26-lts-nextjs-panduan-upgrade` |
| WebMCP vs MCP | `/blog/webmcp-vs-mcp-nextjs-agent-ready` | `/blog/webmcp-vs-mcp-nextjs-agent-ready-id` |

## Editorial and evidence gates

- Six third-person, content-only drafts; no verdict section, investigation diary, research-note ending, or cutoff paragraph.
- Grounded-blog audit: zero hard findings across all six articles.
- Slopbeth signature gate: zero hard and zero review signatures after final edits.
- Hacktoberfest: six readable private source captures.
- Node.js: five private source captures, two additional primary links, and a one-run-per-runtime compatibility probe with explicit limits.
- WebMCP: five private primary-source captures, a five-tool local implementation, static verifier, API boundary checks, and desktop/mobile interface evidence.

## Code and schema gates

- `npm run convex:typecheck`: PASS.
- `npm run build`: PASS after final language/locale changes.
- Convex seed: 38 Blog rows, manifest hash `717965cad7d087abebf65067db6f594d8ec7dcb184f934be48c9124e56905de8`.
- Published payload language accepts valid `en-US` and `id-ID` tags.
- Indonesian local render: `<article lang="id-ID">`, Open Graph `id_ID`, BlogPosting `inLanguage: id-ID`.
- WebMCP endpoint excludes drafts and article bodies; unknown/draft-expansion parameters are rejected.
- Feature-disabled WebMCP browser path is a safe no-op.

## Publication and live gates

- Final batch rerun: 6 updates, 12/12 assets reused, 0 uploads.
- IndexNow: HTTP 200, 7 URLs submitted, key location on the canonical host.
- All six live routes: HTTP 200, exact canonical, BlogPosting JSON-LD, and present in `sitemap-blog.xml`.
- Six-route HTML image scan: 48/48 image tags have alt attributes.
- Site-wide local production audit: 36 public Blog routes, 363 images, zero missing or empty alt attributes.
- Checked-in image dimensions: 106/106 match the SEO registry.
- Desktop WebMCP article and mobile Indonesian Node.js article were visually inspected; no clipping or horizontal overflow was observed.

IndexNow acceptance confirms receipt, not indexing or ranking.
