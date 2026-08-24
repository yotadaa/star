import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { ConvexHttpClient } from "convex/browser";
import { makeFunctionReference } from "convex/server";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const slug = "gpt-6-astra-rumor-origin";
const sourceRoot = path.join(root, "docs", "blogs", "gpt-6-astra-rumor");
const officialAstraUrl = "https://openai.com/index/ten-advances-in-mathematics/";
const listBlogAdmin = makeFunctionReference("bridge:listBlogAdmin");
const createBlog = makeFunctionReference("bridge:createBlog");
const updateBlog = makeFunctionReference("bridge:updateBlog");
const createFileUploadUrl = makeFunctionReference("bridge:createFileUploadUrl");
const commitFile = makeFunctionReference("bridge:commitFile");
const getFile = makeFunctionReference("bridge:getFile");
const findFileBySourceKey = makeFunctionReference("bridge:findFileBySourceKey");

const imageAssets = [
  {
    source: "generated/featured-astra-rumor-archive.jpg",
    sourceKey: "blog:" + slug + ":featured-archive",
    fileName: "gpt-6-astra-rumor-featured.jpg",
    kind: "generated-editorial",
  },
  {
    source: "source/00-chris-earlier-unnamed-hint.jpg",
    sourceKey: "blog:" + slug + ":chris-unnamed-hint",
    fileName: "chris-unnamed-hint.jpg",
    kind: "source-evidence",
    sourceUrl: "https://x.com/ChrisGPT/status/2074857449593487805",
  },
  {
    source: "source/01-leo-first-explicit-gpt6-rumor.jpg",
    sourceKey: "blog:" + slug + ":leo-first-explicit-gpt6",
    fileName: "leo-first-explicit-gpt6-rumor.jpg",
    kind: "source-evidence",
    sourceUrl: "https://x.com/synthwavedd/status/2074886230018568582",
  },
  {
    source: "source/02-the-information-astra-report.jpg",
    sourceKey: "blog:" + slug + ":information-astra-report",
    fileName: "the-information-astra-report.jpg",
    kind: "source-evidence",
    sourceUrl: "https://www.theinformation.com/briefings/exclusive-openai-previews-astra-ai-model-dc",
  },
  {
    source: "source/03-openai-astra-math-announcement.jpg",
    sourceKey: "blog:" + slug + ":openai-math-announcement",
    fileName: "openai-astra-math-announcement.jpg",
    kind: "source-evidence",
    sourceUrl: officialAstraUrl,
  },
  {
    source: "generated/rumor-chain-visualization.jpg",
    sourceKey: "blog:" + slug + ":rumor-chain-visualization",
    fileName: "gpt-6-astra-rumor-chain.jpg",
    kind: "generated-editorial",
  },
  {
    source: "source/04-leo-astra-next-week-rumor.jpg",
    sourceKey: "blog:" + slug + ":leo-next-week-rumor",
    fileName: "leo-astra-next-week-rumor.jpg",
    kind: "source-evidence",
    sourceUrl: "https://x.com/synthwavedd/status/2085365276640702915",
  },
  {
    source: "source/06-leo-astra-delay-retraction.jpg",
    sourceKey: "blog:" + slug + ":leo-delay-rumor",
    fileName: "leo-astra-delay-rumor.jpg",
    kind: "source-evidence",
    sourceUrl: "https://x.com/synthwavedd/status/2085803828784271771",
  },
  {
    source: "source/05-openai-astra-critical-cyber-statement.jpg",
    sourceKey: "blog:" + slug + ":openai-cyber-statement",
    fileName: "openai-astra-cyber-statement.jpg",
    kind: "source-evidence",
    sourceUrl: "https://openai.com/index/responding-next-frontier-critical-cyber-capabilities/",
  },
  {
    source: "source/08-openai-latest-astra-status.jpg",
    sourceKey: "blog:" + slug + ":openai-latest-status",
    fileName: "openai-astra-latest-status.jpg",
    kind: "source-evidence",
    sourceUrl: "https://openai.com/index/pacing-model-development-cyber-capabilities/",
  },
  {
    source: "source/07-tibo-codex-will-have-astra.jpg",
    sourceKey: "blog:" + slug + ":tibo-codex-astra",
    fileName: "tibo-codex-will-have-astra.jpg",
    kind: "source-evidence",
    sourceUrl: "https://x.com/thsottiaux/status/2089149255382438340",
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

export const gpt6AstraRumorBlogPayload = {
  title: "GPT-6 Astra: Who Started the Rumor, and What Is Actually Known?",
  slug,
  excerpt:
    "An evidence-led timeline of the GPT-6 Astra rumor, from the earliest traceable public post to the claims that grew beyond OpenAI's own record.",
  status: "published",
  tags: ["OpenAI", "GPT-6", "Astra", "AI Rumor", "Research"],
  readTime: "12 min read",
  coverTone: "research",
  sourceHref: officialAstraUrl,
  blocks: [
    {
      type: "image",
      assetKey: "blog:" + slug + ":featured-archive",
      alt: "An editorial research desk with a telescope, source cards, official papers, and a red thread splitting into two trails",
      text: "The Astra story has two trails: what the public record supports, and what repetition added along the way.",
    },
    {
      type: "paragraph",
      text: "By the time Astra reached most timelines, it already had a launch week, a checkpoint called mewfour, a ten-trillion-parameter headline, and a story about an indefinite delay. Only one part was firmly on the record: OpenAI was developing a model called Astra.",
    },
    {
      type: "paragraph",
      text: "No search can prove who spoke first across deleted posts, private chats, and unindexed pages. This investigation therefore uses a narrower standard: the **earliest traceable public source** found by August 24, 2026. It then keeps four things separate—an early hint, an explicit rumor, named reporting, and a first-party statement.",
    },
    { type: "divider", text: "" },
    { type: "heading", text: "The first trail: Chris hinted, Leo named GPT-6" },
    {
      type: "paragraph",
      text: "At 9:05 p.m. Jakarta time on July 8, 2026, [Chris @ChrisGPT](https://x.com/ChrisGPT/status/2074857449593487805) wrote that GPT-5.6 in July was exciting, but OpenAI was not finished for the summer—perhaps not even for July. Replies immediately guessed GPT-6. The post itself never named GPT-6, Astra, a new model, or a release date.",
    },
    {
      type: "image",
      assetKey: "blog:" + slug + ":chris-unnamed-hint",
      alt: "Chris's July 8, 2026 post offering a vague hint about OpenAI's plans after GPT-5.6",
      text: "Chris posted first, but the wording stayed deliberately vague and never named GPT-6. [Open the original post.](https://x.com/ChrisGPT/status/2074857449593487805)",
    },
    {
      type: "image",
      assetKey: "blog:" + slug + ":leo-first-explicit-gpt6",
      alt: "Leo's July 8, 2026 post explicitly naming GPT-6, a new pretrain, and an estimated launch window",
      text: "One hour and 54 minutes later, Leo published the first detailed GPT-6 claim found in the public record. [Open the original post.](https://x.com/synthwavedd/status/2074886230018568582)",
    },
    {
      type: "paragraph",
      text: "At 11:00 p.m. Jakarta time, [Leo @synthwavedd](https://x.com/synthwavedd/status/2074886230018568582) made a much sharper claim: GPT-5.6 would close the 5.x line, GPT-6 could arrive in roughly a month, and it would use a new, larger pretrain. In the public archive examined here, **Leo is the earliest traceable source to state the GPT-6 rumor explicitly**. That finding follows the surviving evidence; it does not crown an unknowable first speaker across the entire internet.",
    },
    { type: "heading", text: "The name Astra arrived three weeks later" },
    {
      type: "paragraph",
      text: "The July 8 rumor did not use the name Astra. The earliest traceable public link between Astra and a possible GPT-6 appeared on July 31 in [The Information](https://www.theinformation.com/briefings/exclusive-openai-previews-astra-ai-model-dc). Erin Woo, Leo Schwartz, and Stephanie Palazzolo reported on a Washington, DC preview. Astra was described as a tentative name, while OpenAI had reportedly not decided whether the model would become GPT-6 or a GPT-5 point release such as GPT-5.7.",
    },
    {
      type: "image",
      assetKey: "blog:" + slug + ":information-astra-report",
      alt: "The Information headline and three-reporter byline for its Washington DC preview of Astra",
      text: "The July 31 report is the earliest public link found between **Astra and a possible GPT-6**. Its byline belongs to three reporters, not a single leaker. [Open the report.](https://www.theinformation.com/briefings/exclusive-openai-previews-astra-ai-model-dc)",
    },
    {
      type: "image",
      assetKey: "blog:" + slug + ":openai-math-announcement",
      alt: "OpenAI's mathematics page describing an internal version of Astra as its next major model",
      text: "One day later, OpenAI called Astra its next major model in a mathematics publication—without using the name GPT-6. [Open the OpenAI publication.](https://openai.com/index/ten-advances-in-mathematics/)",
    },
    {
      type: "paragraph",
      text: "On August 1, [OpenAI used the Astra name in public](https://openai.com/index/ten-advances-in-mathematics/). The company connected an internal version of the model to ten results in mathematics and theoretical computer science. Humans prepared manuscripts with the same model, after which the arguments were formalized as Lean certificates. The omissions matter just as much: the page gave no GPT-6 name, parameter count, context window, price, API, or release date.",
    },
    {
      type: "table",
      text: "Primary-source timeline",
      rows: [
        ["Time", "Source", "What the source actually said"],
        ["Jul 8, 9:05 p.m. WIB", "Chris @ChrisGPT", "A hint that OpenAI was not finished for the summer or July; no mention of GPT-6."],
        ["Jul 8, 11:00 p.m. WIB", "Leo @synthwavedd", "An explicit GPT-6 rumor, a new pretrain, and a launch estimate of roughly one month."],
        ["Jul 31", "The Information", "Astra was tentative; the GPT-6 versus GPT-5.x label had reportedly not been decided."],
        ["Aug 1", "OpenAI", "Astra was called the next major model and linked to ten mathematics results."],
        ["Aug 6", "Leo @synthwavedd", "A claim that Astra targeted the following week and that mewfour was a release candidate."],
        ["Aug 7–8", "OpenAI, then Leo", "OpenAI described a preliminary cyber risk; Leo then claimed an indefinite delay."],
        ["Aug 17–18", "Tibo Sottiaux and OpenAI", "A Codex clue followed by an official update focused on securing model-development work."],
      ],
    },
    { type: "heading", text: "How one post became a stack of certainty" },
    {
      type: "paragraph",
      text: "On August 6, Leo returned with a more dramatic set of details. [The post](https://x.com/synthwavedd/status/2085365276640702915) said OpenAI was targeting the following week, called Astra the largest pretrain since GPT-4.5, and named a release-candidate checkpoint called mewfour. No OpenAI document confirmed the schedule, the relative training scale, or the checkpoint's status.",
    },
    {
      type: "image",
      assetKey: "blog:" + slug + ":rumor-chain-visualization",
      alt: "An evidence map where one source branches into distorted copies while official documents follow a separate line",
      text: "One claim can branch into a dozen cleaner-sounding versions. The official record usually moves on a shorter, slower line.",
    },
    {
      type: "paragraph",
      text: "The pattern is familiar. One post says “next week”; the next retelling turns that into a date. One post says “large pretrain”; a headline adds a parameter count. Once the original link stops being opened, the word **claimed** disappears and the rumor begins to read like a product sheet.",
    },
    {
      type: "image",
      assetKey: "blog:" + slug + ":leo-next-week-rumor",
      alt: "Leo's August 6, 2026 post claiming an Astra launch the following week and naming the mewfour checkpoint",
      text: "The August 6 post bundled three major claims: timing, relative training scale, and a release-candidate name. [Open the original post.](https://x.com/synthwavedd/status/2085365276640702915)",
    },
    {
      type: "image",
      assetKey: "blog:" + slug + ":leo-delay-rumor",
      alt: "Leo's August 8, 2026 post claiming that Astra had been delayed indefinitely",
      text: "Less than two days later, the same account replaced the launch story with an indefinite-delay story. [Open the original post.](https://x.com/synthwavedd/status/2085803828784271771)",
    },
    {
      type: "paragraph",
      text: "Between those two posts, OpenAI published a safety update. Preliminary evaluations showed advances in agentic coding and cybersecurity, and the company said it **could not rule out** Critical capability. On August 8 Jakarta time, Leo turned that cautious assessment into a claim that Astra had crossed the Critical threshold and had been postponed indefinitely in cooperation with the US government. The official post announced no public date, no confirmed threshold crossing, and no indefinite release delay.",
    },
    {
      type: "image",
      assetKey: "blog:" + slug + ":openai-cyber-statement",
      alt: "OpenAI's August 7 update on preliminary evaluations of Astra's agentic coding and cyber capabilities",
      text: "OpenAI's August 7 wording was preliminary: Critical capability could not yet be ruled out. [Open the OpenAI update.](https://openai.com/index/responding-next-frontier-critical-cyber-capabilities/)",
    },
    {
      type: "image",
      assetKey: "blog:" + slug + ":openai-latest-status",
      alt: "OpenAI's August 18 update on model-development pacing and critical cyber capabilities",
      text: "The August 18 update covered research-environment hardening, workload migration, and monitoring—still without an Astra release date. [Open the OpenAI update.](https://openai.com/index/pacing-model-development-cyber-capabilities/)",
    },
    { type: "heading", text: "What is actually known about Astra" },
    {
      type: "list",
      text: [
        "OpenAI uses Astra as an internal name for an upcoming model and has called it the company's next major model.",
        "OpenAI connected an internal Astra version to ten results in mathematics and theoretical computer science, human-prepared manuscripts, and Lean formalization.",
        "OpenAI's preliminary evaluations showed substantial gains in agentic coding and cybersecurity.",
        "Some Astra work was paused or moved behind stronger controls. The August 18 update said secure paths could continue while many other workloads still awaited migration.",
        "Codex team member Tibo Sottiaux publicly said Codex would have Astra, but gave neither timing nor the shape of that integration.",
      ].join("\n"),
    },
    { type: "heading", text: "What remains rumor—or repetition" },
    {
      type: "table",
      text: "Status of the circulating claims",
      rows: [
        ["Claim", "Status on August 24, 2026", "Why"],
        ["Astra is GPT-6", "Unconfirmed", "OpenAI has only called Astra its next major model; The Information reported that the label was undecided."],
        ["A launch in August or next week", "Unsupported", "The timing came from Leo's post and never became an official schedule."],
        ["Mewfour is the release candidate", "Unconfirmed", "The name appears in social claims and third-party code traces, not an OpenAI model card."],
        ["The largest pretrain since GPT-4.5", "Unconfirmed", "This is Leo's claim; OpenAI has not disclosed Astra's training scale."],
        ["Ten trillion parameters, MoE, huge context", "Weakly sourced", "The numbers and architecture travel through secondary articles; the often-linked primary post does not contain them."],
        ["Astra definitely crossed the Critical threshold", "Overstated", "OpenAI said Critical capability could not be ruled out, not that it had been established."],
        ["Astra was delayed indefinitely", "Not officially announced", "OpenAI paused selected workloads and tightened controls; it did not announce a public-release status."],
      ],
    },
    {
      type: "paragraph",
      text: "The clearest example is the **ten-trillion-parameter** number. Several articles point back to [Chris's post about GPT-6 and a later model called Doug](https://x.com/ChrisGPT/status/2086220662264250764). That post gives no ten-trillion figure, no MoE architecture, and no claim that Doug is Astra. The number entered the chain through secondary summaries, including [a headline that attributes it back to the same post](https://www.kucoin.com/news/flash/openai-to-launch-gpt-6-with-10-trillion-parameters-in-august). The link trail looks tidy. Its endpoint does not support the headline.",
    },
    { type: "heading", text: "A Codex clue is not a release date" },
    {
      type: "paragraph",
      text: "On August 17, [Tibo Sottiaux](https://x.com/thsottiaux/status/2089149255382438340) posted a short Codex checklist and added that the product “will have Astra.” His role on Codex at OpenAI gives the line more weight than an anonymous prediction. Its scope remains small: it signals an intended Codex connection, not the GPT-6 name, public availability, or a launch date.",
    },
    {
      type: "image",
      assetKey: "blog:" + slug + ":tibo-codex-astra",
      alt: "Tibo Sottiaux's August 17, 2026 post saying that Codex will have Astra",
      text: "The Codex team clue supports an integration direction. It does not answer when or how Astra will appear. [Open the original post.](https://x.com/thsottiaux/status/2089149255382438340)",
    },
    {
      type: "paragraph",
      text: "The latest official update found here, dated August 18, still focused on research-environment controls, inference monitoring, and workload migration. Some work could continue on secure paths; many other Astra workloads remained paused until migration. No model card, API ID, price, public benchmark, context window, parameter count, or release date appeared.",
    },
    {
      type: "quote",
      text: "The Astra rumor did not grow from nothing. It grew around a real model, then filled the quiet spaces between facts with dates, numbers, and certainty that OpenAI had never supplied.",
    },
    { type: "divider", text: "" },
    { type: "heading", text: "So, who started the GPT-6 Astra rumor?" },
    {
      type: "paragraph",
      text: "The precise answer has two parts. **Leo @synthwavedd is the earliest traceable public source found for the explicit GPT-6 rumor**, posted on July 8, 2026 at 11:00 p.m. Jakarta time. **The earliest traceable public link between Astra and a possible GPT-6 came from The Information's three-reporter story on July 31.** Chris hinted at further OpenAI activity almost two hours before Leo, but his post never named GPT-6 or Astra.",
    },
    {
      type: "paragraph",
      text: "At the August 24 research cutoff, the safe conclusion is simple: Astra is a real OpenAI model in development; GPT-6 is still a label attached from outside. A future model card or product announcement could change that answer. Until then, the official record should steer and the rumor can ride in the passenger seat.",
    },
    { type: "divider", text: "" },
    { type: "heading", text: "Before the next Astra screenshot becomes a release date" },
    {
      type: "list",
      text: [
        "Readers can open the original post instead of relying on a cropped repost or headline.",
        "A new claim can be compared with the latest first-party OpenAI update before its wording hardens into fact.",
        "Dates, parameter counts, codenames, and architecture labels can stay marked unknown until the linked source actually contains them.",
      ].join("\n"),
    },
    {
      type: "paragraph",
      text: "The source trail is open: [Leo's July 8 post](https://x.com/synthwavedd/status/2074886230018568582) marks the earliest explicit GPT-6 rumor found, [The Information's July 31 report](https://www.theinformation.com/briefings/exclusive-openai-previews-astra-ai-model-dc) introduces the Astra naming question, and [OpenAI's August 18 update](https://openai.com/index/pacing-model-development-cyber-capabilities/) is the latest first-party status in this review. That three-link check is faster than untangling a rumor after it has already traveled.",
    },
  ],
};

function sha256(bytes) {
  return crypto.createHash("sha256").update(bytes).digest("hex");
}

function detectContentType(bytes) {
  if (bytes.length >= 8 && bytes.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]))) {
    return "image/png";
  }
  if (bytes.length >= 3 && bytes[0] === 255 && bytes[1] === 216 && bytes[2] === 255) {
    return "image/jpeg";
  }
  throw new Error("GPT-6 Astra Blog assets must be PNG or JPEG images");
}

function validateSourceEvidence() {
  const hashes = new Set();
  for (const asset of imageAssets) {
    const sourcePath = path.join(sourceRoot, asset.source);
    if (!fs.existsSync(sourcePath)) throw new Error("GPT-6 Astra image is missing: " + sourcePath);
    const bytes = fs.readFileSync(sourcePath);
    detectContentType(bytes);
    hashes.add(sha256(bytes));
  }
  if (hashes.size !== imageAssets.length) {
    throw new Error("Every GPT-6 Astra Blog image must be unique");
  }
}

function validatePayload(payload, { requireStorage = false } = {}) {
  const images = payload.blocks.filter((block) => block.type === "image");
  if (images.length !== imageAssets.length) {
    throw new Error("Expected " + imageAssets.length + " image blocks, received " + images.length);
  }
  if (images[0]?.assetKey !== "blog:" + slug + ":featured-archive") {
    throw new Error("The generated editorial archive must remain the featured image");
  }

  const expectedKeys = new Set(imageAssets.map((asset) => asset.sourceKey));
  for (const image of images) {
    if (!expectedKeys.has(image.assetKey)) {
      throw new Error("Invalid Convex image asset key: " + (image.assetKey || "missing"));
    }
    if (requireStorage && !image.storageId) {
      throw new Error("Missing Convex storage ID for " + image.assetKey);
    }
    if (image.src) throw new Error("Image payload must not persist a storage URL: " + image.assetKey);
    if (!image.alt?.trim()) throw new Error("Missing alt text for " + image.assetKey);
  }

  const headings = new Set(payload.blocks.filter((block) => block.type === "heading").map((block) => block.text));
  for (const expected of [
    "The first trail: Chris hinted, Leo named GPT-6",
    "The name Astra arrived three weeks later",
    "How one post became a stack of certainty",
    "What is actually known about Astra",
    "What remains rumor—or repetition",
    "A Codex clue is not a release date",
    "So, who started the GPT-6 Astra rumor?",
    "Before the next Astra screenshot becomes a release date",
  ]) {
    if (!headings.has(expected)) throw new Error("Missing research section: " + expected);
  }

  const prose = payload.blocks
    .flatMap((block) => [block.text, ...(block.rows || []).flat()])
    .filter(Boolean)
    .join("\n");
  if (/\b(?:I|we|you)\b/i.test(prose)) {
    throw new Error("GPT-6 Astra article must remain in third-person point of view");
  }
  if (!prose.includes("earliest traceable public source") || !prose.includes("Unconfirmed")) {
    throw new Error("The article must preserve its source-scope and uncertainty language");
  }
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
    if (!existing?.storage_id || !existing?.url || existing.metadata?.sha256 !== checksum) {
      const uploadUrl = await client.action(createFileUploadUrl, { secret, actor });
      const uploadResponse = await fetch(uploadUrl, {
        method: "POST",
        headers: { "Content-Type": contentType },
        body: bytes,
      });
      if (!uploadResponse.ok) {
        throw new Error("Convex upload failed for " + asset.source + ": " + uploadResponse.status);
      }
      const upload = await uploadResponse.json();
      if (!upload.storageId) throw new Error("Convex did not return a storage ID for " + asset.source);

      const fileId = await client.action(commitFile, {
        secret,
        storageId: upload.storageId,
        sourceKey: asset.sourceKey,
        originalName: asset.fileName,
        contentType,
        sizeBytes: bytes.length,
        metadata: {
          purpose: "blog-image-block",
          blogSlug: slug,
          evidenceKind: asset.kind,
          sourcePath: path.relative(root, sourcePath),
          ...(asset.sourceUrl ? { sourceUrl: asset.sourceUrl } : {}),
          sha256: checksum,
        },
        actor,
      });
      stored = await client.action(getFile, { secret, id: fileId });
      uploaded += 1;
    } else {
      reused += 1;
    }

    if (!stored?.storage_id || !stored?.url) {
      throw new Error("Convex storage verification failed for " + asset.sourceKey);
    }
    storedByAssetKey.set(asset.sourceKey, stored);
  }

  return { storedByAssetKey, uploaded, reused };
}

function attachStorageIds(payload, storedByAssetKey) {
  return {
    ...payload,
    blocks: payload.blocks.map((block) => {
      if (block.type !== "image") return block;
      const stored = storedByAssetKey.get(block.assetKey);
      if (!stored?.storage_id) throw new Error("Missing uploaded file for " + block.assetKey);
      return { ...block, storageId: stored.storage_id };
    }),
  };
}

export async function publishGpt6AstraRumorBlog() {
  loadLocalEnv();
  validateSourceEvidence();
  validatePayload(gpt6AstraRumorBlogPayload);

  const convexUrl = String(process.env.CONVEX_CLOUD_URL || "").trim().replace(/\/+$/, "");
  const secret = process.env.CONVEX_INTERNAL_API_KEY;
  if (!convexUrl) throw new Error("CONVEX_CLOUD_URL is not configured");
  if (!secret) throw new Error("CONVEX_INTERNAL_API_KEY is not configured");

  const client = new ConvexHttpClient(convexUrl);
  const actor = {
    key: "research-blog:gpt-6-astra-rumor",
    email: String(process.env.OWNER_EMAIL || "mukhtadanasution@gmail.com").trim().toLowerCase(),
    name: "Mukhtada Billah NST",
    role: "backend",
  };
  const uploads = await uploadImageAssets(client, secret, actor);
  const publishPayload = attachStorageIds(gpt6AstraRumorBlogPayload, uploads.storedByAssetKey);
  validatePayload(publishPayload, { requireStorage: true });
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
    throw new Error("GPT-6 Astra Blog publish verification failed");
  }
  const publishedImages = post.blocks.filter(
    (block) => block.type === "image" && block.storageId && block.assetKey && block.src?.startsWith("https://"),
  );
  if (publishedImages.length !== imageAssets.length) {
    throw new Error("Published GPT-6 Astra post is missing rendered image blocks");
  }

  console.log((existing ? "Updated" : "Created") + " Blog post: " + post.slug);
  console.log(
    "Blocks: " + post.blocks.length
      + "; images: " + publishedImages.length
      + "; uploads: " + uploads.uploaded
      + "; reused: " + uploads.reused
      + "; source: " + post.sourceHref,
  );
  return post;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  await publishGpt6AstraRumorBlog();
}
