import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { ConvexHttpClient } from "convex/browser";
import { makeFunctionReference } from "convex/server";
import { completeBlogSeoData } from "./blog-seo-data.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const slug = "genbi-rebranding";
const repositoryUrl = "https://github.com/GenBI-Jambi/genbi-rebranding";
const sourceRoot = path.join(root, "docs", "blogs", "genbi-rebranding");
const listBlogAdmin = makeFunctionReference("bridge:listBlogAdmin");
const createBlog = makeFunctionReference("bridge:createBlog");
const updateBlog = makeFunctionReference("bridge:updateBlog");
const createFileUploadUrl = makeFunctionReference("bridge:createFileUploadUrl");
const commitFile = makeFunctionReference("bridge:commitFile");
const getFile = makeFunctionReference("bridge:getFile");
const findFileBySourceKey = makeFunctionReference("bridge:findFileBySourceKey");

const imageAssets = [
  {
    source: "Pasted image.png",
    sourceKey: `blog:${slug}:home`,
    fileName: "genbi-home.png",
  },
  {
    source: "Pasted image (2).png",
    sourceKey: `blog:${slug}:about`,
    fileName: "genbi-about.png",
  },
  {
    source: "Pasted image (3).png",
    sourceKey: `blog:${slug}:team`,
    fileName: "genbi-team.png",
  },
  {
    source: "Pasted image (7).png",
    sourceKey: `blog:${slug}:news`,
    fileName: "genbi-news.png",
  },
  {
    source: "Pasted image (6).png",
    sourceKey: `blog:${slug}:events`,
    fileName: "genbi-events.png",
  },
  {
    source: "Pasted image (4).png",
    sourceKey: `blog:${slug}:achievements`,
    fileName: "genbi-achievements.png",
  },
  {
    source: "Pasted image (8).png",
    sourceKey: `blog:${slug}:news-editor`,
    fileName: "genbi-news-editor.png",
  },
];

function loadLocalEnv() {
  const envPath = path.join(root, ".env.local");
  if (!fs.existsSync(envPath)) return;

  for (const rawLine of fs.readFileSync(envPath, "utf8").split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) continue;
    const separator = line.indexOf("=");
    if (separator < 1) continue;
    const key = line.slice(0, separator).trim();
    let value = line.slice(separator + 1).trim();
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    if (process.env[key] === undefined) process.env[key] = value;
  }
}

export const genbiRebrandingBlogPayload = {
  title: "GenBI Jambi: When a Rebrand Became an Organization's Working System",
  slug,
  excerpt:
    "A review of the GenBI Jambi website as it grew into a CMS, member directory, attendance system, activity points ledger, book catalog, and role-based finance platform.",
  status: "published",
  tags: ["PHP", "CMS", "SSR", "Community Platform"],
  readTime: "10 min read",
  coverTone: "research",
  sourceHref: repositoryUrl,
  blocks: [
    {
      type: "paragraph",
      text: "The repository is named genbi-rebranding, but the ssr branch has grown far beyond a color and typography update. The public site received a new face. Under it sits a news CMS, member directory, achievements, events, books, attendance, activity points, site settings, and a finance module with separate access for the regional office, UNJA, and UIN.",
    },
    {
      type: "paragraph",
      text: "This review uses the supplied source snapshot and seven unique screenshots. I examined its Git history, routes, models, migrations, tests, and the PHP pages behind official.genbijambi.com. The numbers describe that snapshot; they are not permanent claims about a repository that will keep changing.",
    },
    {
      type: "image",
      assetKey: `blog:${slug}:home`,
      alt: "GenBI Jambi Home page with white navigation, a blue activity collage, and the headline Bersama GenBI tumbuh dan berdampak untuk Jambi",
      text: "The Home page uses activity documentation as its main backdrop, then links directly to the organization profile, news, and video.",
    },
    { type: "divider", text: "" },
    { type: "heading", text: "The repository name is now too narrow" },
    {
      type: "paragraph",
      text: "The snapshot contains 247 commits. Its history starts on May 6, 2026 and reaches August 18, 2026; 165 commits belong to the yotadaa account, with the rest from Aziz Alhadiid. The system grew incrementally. The news CMS arrived first, followed by SSR, themes, attendance, GenBI Points, books, and finance. It reads like a working tool responding to administrators' needs, not a feature package fixed at the beginning.",
    },
    {
      type: "quote",
      text: "The project kept absorbing real organizational needs, and the repository was flexible enough to hold them. That flexibility helped it grow, but it is now raising the maintenance cost.",
    },
    {
      type: "table",
      text: "GenBI rebranding technical snapshot",
      rows: [
        ["Area", "Reviewed snapshot"],
        ["Public interface", "Server-rendered PHP views, Tailwind CSS, and progressive JavaScript"],
        ["Backend foundation", "Custom Router, Request, Response, ViewRenderer, migration runner, and PDO layer"],
        ["Public routes", "30 declarations for pages, content detail, forms, sitemaps, and feeds"],
        ["Admin routes", "97 declarations for content, members, comments, attendance, points, books, and settings"],
        ["Finance routes", "56 declarations for the regional office, UNJA chapter, UIN chapter, and members"],
        ["Data-change history", "45 migrations in the main PHP application"],
        ["Available tests", "33 PHP test files and 2 JavaScript test files"],
      ],
    },
    {
      type: "paragraph",
      text: "Route and test-file counts do not make a codebase healthy by themselves. They provide a more useful measure: this is now a multi-entry organizational application, not a campaign microsite.",
    },
    { type: "heading", text: "A restrained, recognizable visual identity" },
    {
      type: "paragraph",
      text: "The default theme fixes Bank Indonesia blue, cool white surfaces, dark text, Inter for the interface, and Source Serif 4 for headings. Cards use soft corners and light shadows. ThemeRegistry adds ten light and ten dark alternatives, backed by a contrast-checking script. Keeping the GenBI template locked is a sound decision: administrators can experiment without erasing the official identity.",
    },
    {
      type: "image",
      assetKey: `blog:${slug}:about`,
      alt: "GenBI Jambi About page with a blue collage Hero and Tentang, Visi, and Misi sections on white",
      text: "The About page keeps the organization copy simple. Serif headings separate sections from explanatory text without extra ornament.",
    },
    {
      type: "image",
      assetKey: `blog:${slug}:team`,
      alt: "GenBI Jambi team directory with search, division, campus, and year filters, plus member cards",
      text: "The member directory includes search, three filters, grid and list views, and 200 members in the supplied capture.",
    },
    {
      type: "paragraph",
      text: "The repeated Hero collage makes page changes feel consistent. On inner pages, however, it consumes substantial space before users reach the data. I would keep the collage but shorten the Hero on frequently revisited directories such as Team, News, and Achievements.",
    },
    { type: "heading", text: "Public content takes the shape its job requires" },
    {
      type: "paragraph",
      text: "News is not forced into a dense card grid. The page uses an editorial list with small images, categories, dates, summaries, and detail actions. The capture shows 94 articles, so the choice is practical: readers can scan titles without facing twelve large images at once.",
    },
    {
      type: "image",
      assetKey: `blog:${slug}:news`,
      alt: "GenBI Jambi News page with search and an editorial list of thumbnails, categories, dates, titles, summaries, and Detail buttons",
      text: "The News list gives titles and summaries more space than thumbnails.",
    },
    {
      type: "paragraph",
      text: "Events use cards because date, location, and status need to appear together. Achievements use two columns, giving photographs and recipient names more weight. The pages share a visual language without copying the News layout verbatim.",
    },
    {
      type: "image",
      assetKey: `blog:${slug}:events`,
      alt: "GenBI Jambi Events page with search and three event cards showing dates, locations, status, and Detail buttons",
      text: "The Events capture shows six activities and marks past events directly on each card image.",
    },
    {
      type: "image",
      assetKey: `blog:${slug}:achievements`,
      alt: "GenBI Jambi Achievements page in a two-column grid with photographs, category, year, title, summary, and member name",
      text: "Achievements centers photographic evidence and member names. The supplied capture contains 35 entries.",
    },
    { type: "heading", text: "The CMS stays close to the page it publishes" },
    {
      type: "paragraph",
      text: "The news editor makes the link between administrative work and public output visible. Title, summary, body, category, comment status, publication date, featured image, and image blocks share one screen. Editor.js stores content as blocks, allowing images to sit inside an article instead of always acting as covers.",
    },
    {
      type: "image",
      assetKey: `blog:${slug}:news-editor`,
      alt: "GenBI CMS admin panel on Edit News with title, summary and body editors, Quick Insert, publication settings, and feature navigation",
      text: "The news editor combines block writing with publication metadata while keeping the rest of the CMS visible in the sidebar.",
    },
    {
      type: "paragraph",
      text: "Public pages render initial HTML through ViewRenderer. JavaScript then checks the data-ssr marker and attaches only the search, filters, modals, comments, and controls that need browser behavior. Content remains readable without waiting for a client application to rebuild the page.",
    },
    { type: "heading", text: "Operational modules change the project's scale" },
    {
      type: "paragraph",
      text: "Once attendance, member points, and finance arrive, the project stops being a showcase. Admin routes protect the work area with AuthMiddleware, CsrfMiddleware, and RoleMiddleware. The finance module has its own sign-in and role checks, separating regional, UNJA chapter, UIN chapter, and member transactions.",
    },
    {
      type: "list",
      text: [
        "Achievements can receive submissions through public tokens with expiration and revocation states.",
        "Attendance records events, submissions, member lists, manual approval, and the relationship between activities and GenBI Points.",
        "Administrators manage news, comments, events, members, flagship programs, photo galleries, books, site identity, the top bar, footer, contacts, and themes.",
        "Finance stores activities, income, expenses, allocations, funding sources, treasurer profiles, and transaction evidence for separate units.",
      ].join("\n"),
    },
    {
      type: "paragraph",
      text: "SEO is also handled on the server. The repository includes canonical URLs, Open Graph, Twitter Cards, structured data, RSS, a sitemap index, and separate sitemaps for pages, news, events, achievements, and images. These details are easy to neglect when the CMS consumes most of the attention.",
    },
    { type: "heading", text: "Security was not postponed" },
    {
      type: "paragraph",
      text: "The first commit in the snapshot already mentions authentication, CSRF, and hardening. The current code adds CSP, X-Frame-Options, Referrer-Policy, and Permissions-Policy headers. Passwords use password_hash and password_verify, while sign-in and comments are throttled. The repository also contains a security audit and tests for sanitizers, tokens, middleware, models, HEAD routes, SEO, and settings.",
    },
    {
      type: "paragraph",
      text: "Test counts are not a security guarantee. The snapshot proves that security boundaries exist in code and have targeted tests. Production auditing, server configuration, upload permissions, and real data still require checks in the deployed environment.",
    },
    { type: "divider", text: "" },
    { type: "heading", text: "Two architectures blur the next step" },
    {
      type: "paragraph",
      text: "The ssr branch stores the main PHP MVC application at the root and a complete Laravel application under laravel-app. Late-July history records an attempted Laravel migration, parity work, and a merge back into the SSR branch. The experiment is understandable. Keeping both application trees as features grow makes security fixes, views, and routes likely to diverge by accident.",
    },
    {
      type: "list",
      text: [
        "Choose one production runtime. Custom PHP can suit constrained cPanel hosting, while Laravel offers clearer conventions when the server supports it.",
        "Move repeated finance-transaction rules into a shared service. The regional controller has 871 lines; the UNJA and UIN controllers each approach 700.",
        "Split the largest views and models. The public books page is 990 lines, while several models and controllers exceed 500.",
        "Reduce duplicate build artifacts. JavaScript source, the dist directory, minified stylesheets, and ZIP archives all live in the same repository.",
      ].join("\n"),
    },
    {
      type: "quote",
      text: "The next architecture decision should reduce the number of sources of truth. A third application copy would only add synchronization work.",
    },
    { type: "heading", text: "Final assessment" },
    {
      type: "paragraph",
      text: "The rebrand works because its visual identity is not isolated. Home, About, Team, Achievements, Events, News, and the CMS share typography and color, while their list structures change with the data. The screenshots look like one product, not a set of templates attached to a database.",
    },
    {
      type: "paragraph",
      text: "Its best technical decision is the combination of SSR and progressive enhancement. Core content comes from the server, while JavaScript handles interactions that need it. I would keep that pattern and the operational modules already in use. The next work is to choose one backend foundation, split large files, and unify rules now repeated across three finance paths.",
    },
    {
      type: "paragraph",
      text: "The genbi-rebranding name can remain on GitHub as a record of where the work began. The project description should change. This snapshot captures GenBI Jambi's digital working system, with a polished public side and an administrative core substantial enough to maintain as a long-term product.",
    },
  ],
};

function sha256(bytes) {
  return crypto.createHash("sha256").update(bytes).digest("hex");
}

function validateSourceEvidence() {
  const hashes = new Set();
  for (const asset of imageAssets) {
    const sourcePath = path.join(sourceRoot, asset.source);
    if (!fs.existsSync(sourcePath)) throw new Error(`GenBI screenshot is missing: ${sourcePath}`);
    hashes.add(sha256(fs.readFileSync(sourcePath)));
  }
  if (hashes.size !== imageAssets.length) {
    throw new Error("The selected GenBI Blog screenshots must be unique");
  }
}

function validatePayload(payload, { requireProviderNeutral = false } = {}) {
  const images = payload.blocks.filter((block) => block.type === "image");
  if (images.length !== imageAssets.length) {
    throw new Error(`Expected ${imageAssets.length} image blocks, received ${images.length}`);
  }
  for (const image of images) {
    if (!image.assetKey?.startsWith(`blog:${slug}:`)) {
      throw new Error(`Invalid Convex image asset key: ${image.assetKey || "missing"}`);
    }
    if (requireProviderNeutral && image.storageId) {
      throw new Error(`Legacy Convex storage ID must not be persisted for ${image.assetKey}`);
    }
    if (image.src) throw new Error(`Image payload must not persist a storage URL: ${image.assetKey}`);
    if (!image.alt?.trim()) throw new Error(`Missing alt text for ${image.assetKey}`);
  }

  const headings = new Set(payload.blocks.filter((block) => block.type === "heading").map((block) => block.text));
  for (const expected of [
    "The repository name is now too narrow",
    "A restrained, recognizable visual identity",
    "Public content takes the shape its job requires",
    "The CMS stays close to the page it publishes",
    "Operational modules change the project's scale",
    "Two architectures blur the next step",
    "Final assessment",
  ]) {
    if (!headings.has(expected)) throw new Error(`Missing review section: ${expected}`);
  }
}

function detectContentType(bytes) {
  if (bytes.length >= 8 && bytes.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]))) {
    return "image/png";
  }
  throw new Error("GenBI Blog assets must be PNG images");
}

async function uploadImageAssets(client, secret, actor) {
  const storedByAssetKey = new Map();
  let uploaded = 0;
  let reused = 0;

  for (const asset of imageAssets) {
    const sourcePath = path.join(sourceRoot, asset.source);
    const bytes = fs.readFileSync(sourcePath);
    const checksum = sha256(bytes);
    const contentType = detectContentType(bytes);
    const existing = await client.action(findFileBySourceKey, {
      secret,
      sourceKey: asset.sourceKey,
    });

    let stored = existing;
    if (existing?.storage_provider !== "r2" || !existing?.url || existing.sha256 !== checksum) {
      const upload = await client.action(createFileUploadUrl, { secret, actor, sha256: checksum, contentType });
      const uploadResponse = await fetch(upload.url, {
        method: upload.method,
        headers: {
          "Content-Type": contentType,
          "Cache-Control": "public, max-age=31536000, immutable",
        },
        body: bytes,
      });
      if (!uploadResponse.ok) {
        throw new Error(`R2 upload failed for ${asset.source}: ${uploadResponse.status}`);
      }

      const fileId = await client.action(commitFile, {
        secret,
        r2Key: upload.key,
        sha256: checksum,
        access: "public",
        sourceKey: asset.sourceKey,
        originalName: asset.fileName,
        contentType,
        sizeBytes: bytes.length,
        metadata: {
          purpose: "blog-image-block",
          blogSlug: slug,
          sourcePath: path.relative(root, sourcePath),
          sha256: checksum,
        },
        actor,
      });
      stored = await client.action(getFile, { secret, id: fileId });
      uploaded += 1;
    } else {
      reused += 1;
    }

    if (stored?.storage_provider !== "r2" || !stored?.source_key || !stored?.url) {
      throw new Error(`R2 storage verification failed for ${asset.sourceKey}`);
    }
    storedByAssetKey.set(asset.sourceKey, stored);
  }

  return { storedByAssetKey, uploaded, reused };
}

function attachStoredAssetKeys(payload, storedByAssetKey) {
  return {
    ...payload,
    blocks: payload.blocks.map((block) => {
      if (block.type !== "image") return block;
      const stored = storedByAssetKey.get(block.assetKey);
      if (stored?.storage_provider !== "r2" || !stored?.source_key) {
        throw new Error(`Missing uploaded file for ${block.assetKey}`);
      }
      const { storageId: _legacyStorageId, src: _legacyUrl, ...rest } = block;
      return { ...rest, assetKey: stored.source_key };
    }),
  };
}

export async function publishGenbiRebrandingBlog() {
  loadLocalEnv();
  validateSourceEvidence();
  validatePayload(genbiRebrandingBlogPayload);

  const convexUrl = String(process.env.CONVEX_CLOUD_URL || "").trim().replace(/\/+$/, "");
  const secret = process.env.CONVEX_INTERNAL_API_KEY;
  if (!convexUrl) throw new Error("CONVEX_CLOUD_URL is not configured");
  if (!secret) throw new Error("CONVEX_INTERNAL_API_KEY is not configured");

  const client = new ConvexHttpClient(convexUrl);
  const actor = {
    key: "repository-review:genbi-rebranding",
    email: String(process.env.OWNER_EMAIL || "mukhtadanasution@gmail.com").trim().toLowerCase(),
    name: "Mukhtada Billah NST",
    role: "backend",
  };
  const uploads = await uploadImageAssets(client, secret, actor);
  const publishPayload = completeBlogSeoData(
    attachStoredAssetKeys(genbiRebrandingBlogPayload, uploads.storedByAssetKey),
  );
  validatePayload(publishPayload, { requireProviderNeutral: true });
  const posts = await client.action(listBlogAdmin, { secret, limit: 100 });
  const existing = posts.find((post) => post.slug === slug);
  const post = existing
    ? await client.action(updateBlog, {
        secret,
        id: existing.id,
        payload: publishPayload,
        actor,
      })
    : await client.action(createBlog, {
        secret,
        payload: publishPayload,
        actor,
      });

  if (!post || post.slug !== slug || post.status !== "published") {
    throw new Error("GenBI Blog publish verification failed");
  }
  const publishedImages = post.blocks.filter(
    (block) => block.type === "image" && block.storageId && block.assetKey && block.src?.startsWith("https://"),
  );
  if (publishedImages.length !== imageAssets.length) {
    throw new Error("Published post is missing rendered image blocks");
  }

  console.log(`${existing ? "Updated" : "Created"} Blog post: ${post.slug}`);
  console.log(
    `Blocks: ${post.blocks.length}; images: ${publishedImages.length}; uploads: ${uploads.uploaded}; reused: ${uploads.reused}; source: ${post.sourceHref}`,
  );
  return post;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  await publishGenbiRebrandingBlog();
}
