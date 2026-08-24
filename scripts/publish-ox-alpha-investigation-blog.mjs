import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { ConvexHttpClient } from "convex/browser";
import { makeFunctionReference } from "convex/server";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const slug = "ox-alpha-api-left-a-trail";
const sourceRoot = path.join(root, "docs", "blogs", "ox-alpha-investigation");
const officialModelUrl = "https://openrouter.ai/stealth/ox-alpha";
const listBlogAdmin = makeFunctionReference("bridge:listBlogAdmin");
const createBlog = makeFunctionReference("bridge:createBlog");
const updateBlog = makeFunctionReference("bridge:updateBlog");
const createFileUploadUrl = makeFunctionReference("bridge:createFileUploadUrl");
const commitFile = makeFunctionReference("bridge:commitFile");
const getFile = makeFunctionReference("bridge:getFile");
const findFileBySourceKey = makeFunctionReference("bridge:findFileBySourceKey");

const imageAssets = [
  {
    source: "generated/featured-ox-alpha-trail.png",
    sourceKey: "blog:" + slug + ":featured-trail",
    fileName: "ox-alpha-api-trail-featured.png",
    kind: "generated-editorial",
  },
  {
    source: "generated/tokenizer-fingerprint.png",
    sourceKey: "blog:" + slug + ":tokenizer-fingerprint",
    fileName: "ox-alpha-tokenizer-fingerprint.png",
    kind: "generated-editorial",
  },
  {
    source: "generated/serving-layer-trace.png",
    sourceKey: "blog:" + slug + ":serving-layer-trace",
    fileName: "ox-alpha-serving-layer-trace.png",
    kind: "generated-editorial",
  },
  {
    source: "source/01-openrouter-model-card.jpg",
    sourceKey: "blog:" + slug + ":openrouter-model-card",
    fileName: "ox-alpha-openrouter-model-card.jpg",
    kind: "source-evidence",
    sourceUrl: "https://openrouter.ai/stealth/ox-alpha",
  },
  {
    source: "source/02-fingerprint-archive.jpg",
    sourceKey: "blog:" + slug + ":fingerprint-archive",
    fileName: "ox-alpha-fingerprint-archive.jpg",
    kind: "source-evidence",
    sourceUrl: "https://github.com/LuD1161/ox-alpha-identification-public",
  },
  {
    source: "source/03-full-deepswe-run.jpg",
    sourceKey: "blog:" + slug + ":full-deepswe-run",
    fileName: "ox-alpha-full-deepswe-run.jpg",
    kind: "source-evidence",
    sourceUrl: "https://github.com/MatchaOnMuffins/oxalpha#7-final-results",
  },
  {
    source: "source/04-deepswe-leaderboard.jpg",
    sourceKey: "blog:" + slug + ":deepswe-leaderboard",
    fileName: "ox-alpha-deepswe-leaderboard.jpg",
    kind: "source-evidence",
    sourceUrl: "https://deepswe.datacurve.ai/",
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

export const oxAlphaInvestigationBlogPayload = {
  title: "Who Is Behind Ox Alpha? The API Left a Trail",
  slug,
  excerpt:
    "Ox Alpha arrived without a maker's name. Tokenizer matches, an exposed Java class, and a corrected 58.4% DeepSWE run tell a more careful story.",
  status: "published",
  tags: ["Ox Alpha", "Z.ai", "GLM", "Model Forensics", "AI Research"],
  readTime: "11 min read",
  coverTone: "research",
  sourceHref: officialModelUrl,
  blocks: [
    {
      type: "image",
      assetKey: "blog:" + slug + ":featured-trail",
      alt: "A warm forensic desk where an anonymous black model core is surrounded by token strips, server photographs, and linked evidence cards",
      text: "Ox Alpha kept its maker's name out of view. The machinery around it proved less discreet.",
    },
    {
      type: "paragraph",
      text: "**The model would not name its maker. Its error handler did.**",
    },
    {
      type: "paragraph",
      text: "A harmless malformed request sent to Ox Alpha on August 24 exposed a Java class path inside the upstream service. A second request, carrying an invalid chat role, returned a numbered error in the same dialect documented around Z.ai's GLM endpoints. Neither clue could identify a set of weights alone. Together with two tokenizer studies, they changed the question from a guessing game into a model-forensics case.",
    },
    {
      type: "paragraph",
      text: "The official record remains narrower. [OpenRouter's model card](https://openrouter.ai/stealth/ox-alpha) says an anonymous third party develops and operates Ox Alpha; OpenRouter only routes requests. The preview opened on August 20 with a 1,048,576-token context window, up to 131,072 output tokens, and text, image, and video input. No lab name, architecture, parameter count, checkpoint, or technical report came with it.",
    },
    {
      type: "image",
      assetKey: "blog:" + slug + ":openrouter-model-card",
      alt: "OpenRouter's Ox Alpha model card showing the anonymous third-party provider notice, free preview, 1M context, and multimodal inputs",
      text: "OpenRouter's live card names the party it is **not**: the router is neither developer, owner, nor provider. It also states that the anonymous provider retains prompts and completions. [Open the current model card.](https://openrouter.ai/stealth/ox-alpha)",
    },
    { type: "divider", text: "" },
    { type: "heading", text: "The first 68 minutes" },
    {
      type: "paragraph",
      text: "The listing became visible at 20:04:55 UTC. [OpenCode posted about the free preview](https://x.com/opencode/status/2090544355824038300) at 20:59:49, roughly two minutes before [OpenRouter's launch post](https://x.com/OpenRouter/status/2090544970923184269). OpenCode also advertised enough capacity for 100 trillion tokens per day. That last number belongs to OpenCode's announcement; it is not an audited measure of the model's throughput.",
    },
    {
      type: "table",
      text: "The public launch clock",
      rows: [
        ["UTC on Aug. 20, 2026", "Public trace", "What it established"],
        ["20:04:55", "OpenRouter listing", "The route existed with an anonymous provider."],
        ["20:59:49", "OpenCode", "The earliest launch post found; a one-week free preview and a capacity claim."],
        ["21:02:16", "OpenRouter", "The official router announcement: 1M context and multimodal input."],
        ["21:12:41", "@aitrackerbot", "The earliest public technical identity probe found; its GLM comparison was explicitly unconfirmed."],
      ],
    },
    {
      type: "paragraph",
      text: "Sixty-eight minutes after the listing appeared, [@aitrackerbot published the earliest technical fingerprint found in the indexed public record](https://x.com/aitrackerbot/status/2090547594556494221). That is a bounded finding. Deleted posts, private chats, and pages that search engines never indexed remain outside it, so the source cannot be crowned the first person anywhere to suspect GLM.",
    },
    { type: "heading", text: "Asking the model led nowhere" },
    {
      type: "paragraph",
      text: "Early threads tried the obvious route: asking Ox Alpha what it was. The answers ranged from coy to contradictory. The [largest public evidence archive](https://github.com/LuD1161/ox-alpha-identification-public) later recovered a deployment instruction that forced the model to identify only as `ox-alpha`. Self-identification had been contaminated before the first question arrived.",
    },
    {
      type: "paragraph",
      text: "That discovery removed the most conversational evidence from consideration. A model can repeat a supplied persona, invent a creator, or deny a capability it is already using. Token boundaries and upstream validators are harder to rehearse.",
    },
    { type: "heading", text: "The tokenizer matched; the server stack spoke" },
    {
      type: "paragraph",
      text: "Aseem Shrey's public archive compared 44 deliberately awkward strings across tokenizer families. Ox Alpha matched the GLM-5 generation on all 44; GLM-4.x matched 42. [Joseph W. Elstner's separate study](https://isimplifyme.com/whitepapers/the-tokenizer-is-a-fingerprint) widened the test to 95 probes and 14 candidate vocabularies. The GLM-5 vocabulary matched 95 out of 95 with zero mean absolute error.",
    },
    {
      type: "paragraph",
      text: "A third [independent black-box study](https://github.com/Mich404elle/ox-alpha-black-box-fingerprint) reached the same neighborhood from a different angle. After correcting for a fixed wrapper offset, Ox Alpha and a served GLM-5.3 control matched on 24 of 24 token deltas, with correlation 1.0. MiMo-V2.5 matched only five. Its authors stopped short of naming an exact checkpoint, which is precisely where the evidence stops too.",
    },
    {
      type: "image",
      assetKey: "blog:" + slug + ":tokenizer-fingerprint",
      alt: "Three paper token ribbons pass through precision rollers, with two patterns aligning while a third drifts out of step",
      text: "A tokenizer does not sign a model's name. It leaves a repeated rhythm, especially on strings chosen to make related vocabularies disagree.",
    },
    {
      type: "image",
      assetKey: "blog:" + slug + ":serving-layer-trace",
      alt: "A paper request tape passes through a dark gateway whose torn casing reveals nested upstream machinery and a restrained error signal",
      text: "The serving layer left a second fingerprint: a Java namespace, a request validator, and an error dialect visible through the gateway.",
    },
    {
      type: "paragraph",
      text: "The server-side trace was unusually concrete. [Chetaslua first reported](https://x.com/chetaslua/status/2091086141764354364) that a malformed `top_p` value exposed `com.wd.paas.api.domain.v4.chat.ChatCompletionRequest`. A fresh check for this article reproduced that class path through OpenCode Zen. The invalid role `wizard` also reproduced `[1214] Incorrect role information`. Z.ai's official documentation uses the related `/api/paas/v4/chat/completions` route family, and Z.ai-hosted GLM endpoints have returned the same numbered role error. The same GLM weights served elsewhere can produce a different validator, which points to the operator rather than merely the vocabulary.",
    },
    {
      type: "table",
      text: "What each fingerprint can—and cannot—establish",
      rows: [
        ["Evidence layer", "Observation", "Strongest supported conclusion", "Limit"],
        ["Deployment persona", "The route forced the name `ox-alpha`.", "Direct self-identification is unusable.", "It says nothing about the weights."],
        ["Tokenizer", "44/44 and 95/95 GLM-5-generation matches.", "Strong GLM-5-family lineage.", "Shared vocabulary is not proof of ownership."],
        ["Serving stack", "Z.ai-shaped Java class, route family, and `[1214]` error.", "Z.ai is the likely upstream operator.", "A gateway can transform requests."],
        ["Context and modalities", "About 1M input plus image and video support.", "A real extended deployment profile.", "These are serving properties, not a unique checkpoint ID."],
      ],
    },
    {
      type: "image",
      assetKey: "blog:" + slug + ":fingerprint-archive",
      alt: "The public Ox Alpha identification archive showing its Z.ai and GLM-5-generation verdict alongside the exact-variant limitation",
      text: "The public archive makes a strong family attribution while preserving the boundary that matters: the exact serving, quantization, and deployment variant remains unproven. [Open the evidence archive.](https://github.com/LuD1161/ox-alpha-identification-public)",
    },
    { type: "heading", text: "A calibrated answer: Z.ai upstream, GLM-5 family, checkpoint unknown" },
    {
      type: "paragraph",
      text: "The converging evidence supports a high-confidence attribution of the upstream operator to **Z.ai / Zhipu AI** and a strong attribution to the **GLM-5 generation**. That conclusion rests on signals from different layers that fail in different ways: vocabulary, template behavior, validator implementation, error codes, context behavior, and modality controls.",
    },
    {
      type: "quote",
      text: "Likely operator: Z.ai. Likely family: GLM-5 generation. Exact checkpoint: unresolved.",
    },
    {
      type: "paragraph",
      text: "The final line matters. Public GLM-5 documentation describes a text model with a much smaller context window, while Ox Alpha exposes roughly one million tokens and visual input. A private multimodal successor, an extended serving tier, a distilled or quantized build, or a new checkpoint could all preserve the same family fingerprints. No public artifact selects one of them. As of August 24, OpenRouter still labels the provider anonymous.",
    },
    { type: "heading", text: "The 80% score was ten tasks wide" },
    {
      type: "paragraph",
      text: "The performance story moved faster than the forensics. Ben Davis's first DeepSWE subset contained ten tasks and Ox Alpha solved eight. The 80% headline was arithmetically correct, but each task moved it by ten percentage points. Davis warned that the estimate carried high variance; many retellings dropped that warning.",
    },
    {
      type: "paragraph",
      text: "[Davis later relayed](https://x.com/davis7/status/2091285712566140986) a larger subset run near 63%, conducted by DeepSWE creator Wenqi. A separate public sweep then ran all 113 tasks for 20 hours and 39 minutes. Its auditable aggregate was [66 solved tasks, or 58.4%](https://github.com/MatchaOnMuffins/oxalpha/blob/main/README.md). These were different runs and denominators, not one model visibly losing ability over two days.",
    },
    {
      type: "image",
      assetKey: "blog:" + slug + ":full-deepswe-run",
      alt: "The public Ox Alpha DeepSWE repository's final-results table showing 66 of 113 tasks solved, 58.4 percent, and a Wilson confidence interval",
      text: "The completed public run reports **66 / 113 = 58.4%**, with a 95% Wilson interval of 49.2% to 67.1%. [Inspect the run and raw artifacts.](https://github.com/MatchaOnMuffins/oxalpha#7-final-results)",
    },
    {
      type: "image",
      assetKey: "blog:" + slug + ":deepswe-leaderboard",
      alt: "The official DeepSWE leaderboard showing frontier model pass rates including Claude Opus 5, GPT-5.6 Sol, Claude Fable 5, and GLM-5.3",
      text: "The official board supplies the comparison reference: roughly 74% for Claude Opus 5, 73% for GPT-5.6 Sol, 70% for Claude Fable 5, and 69% for GLM-5.3 in its best view. [Open the live leaderboard.](https://deepswe.datacurve.ai/)",
    },
    {
      type: "table",
      text: "DeepSWE orientation, not a merged leaderboard",
      rows: [
        ["Model / setting", "Reported pass rate", "Source and caveat"],
        ["Claude Opus 5 · max", "~74%", "Official DeepSWE best view; aggregated benchmark configuration."],
        ["GPT-5.6 Sol · max", "~73%", "Official DeepSWE best view; aggregated benchmark configuration."],
        ["Claude Fable 5 · max", "~70%", "Official DeepSWE best view; aggregated benchmark configuration."],
        ["GLM-5.3 · max", "~69%", "Official DeepSWE best view; useful family reference, not identity proof."],
        ["DeepSeek V4 Pro · max", "~63%", "Official DeepSWE best view."],
        ["Claude Opus 4.8 · max", "~59%", "Official DeepSWE best view."],
        ["Ox Alpha", "58.4%", "One community run, 66/113, Pier 0.3.1 + mini-swe-agent + Docker."],
        ["Qwen3.8 Max · xhigh", "~57%", "Official DeepSWE best view."],
      ],
    },
    {
      type: "paragraph",
      text: "The table is a compass, not a clean ranking merger. [DeepSWE's official board](https://deepswe.datacurve.ai/) aggregates multiple configurations and often several runs; Ox Alpha has one community run with public traces and a Docker setup. The fairest reading places that run near Claude Opus 4.8 and Qwen3.8 Max, below the current leaders. It does not support the claim that an anonymous preview has already beaten them.",
    },
    { type: "heading", text: "Good patch instincts, unfinished agent loops" },
    {
      type: "paragraph",
      text: "The binary score hides a model that often came close. Ninety of 113 tasks passed at least 90% of their fail-to-pass tests, yet only 66 earned full credit. Eleven tasks—9.7% of the suite—ended after repeated tool-call formatting failures. Five timed out. The public traces suggest strong repository reading and patch construction paired with a weaker habit of closing the loop cleanly.",
    },
    {
      type: "paragraph",
      text: "A broader [Unlock AI evaluation](https://unlock-ai.natebjones.com/benchmarks/ox-alpha) found the same uneven shape. Ox Alpha averaged 65 out of 100 across four work samples, reaching 92 on a knowledge-work artifact but 54 on both a data-cleaning task and a physics-heavy brick task. Its 60 on the Artemis II visualization sat close to GLM-5.2's 58 and far below GPT-5.6 Sol's 89. The site changed its harness, so historical rows are not perfectly interchangeable; the spread across tasks is more informative than the average.",
    },
    { type: "heading", text: "The free preview has a privacy bill" },
    {
      type: "paragraph",
      text: "The model costs zero dollars per token during the preview, but the routes do not make the same data promise. OpenRouter states that the anonymous provider **retains prompts and completions**, while saying those records are not used for training. [OpenCode Zen's documentation](https://opencode.ai/docs/zen/) describes zero retention at its own proxy. Those statements apply to different paths; one cannot silently cancel the other.",
    },
    {
      type: "paragraph",
      text: "That distinction turns model identity into a practical issue. A private repository, customer record, unreleased design, or credential should not be sent to an unnamed upstream merely because the context window is generous. The safest evaluation remains a disposable repository with synthetic or public data until the operator, retention boundary, and long-term service terms are explicit.",
    },
    { type: "heading", text: "What would change the verdict" },
    {
      type: "list",
      text: [
        "A provider-authenticated announcement or model card would settle the operator question.",
        "A checkpoint identifier, architecture report, or reproducible weight artifact would narrow the exact-model question.",
        "A second full DeepSWE run under a frozen route, harness, effort level, timeout, and seed would turn one score into a distribution.",
        "Cross-route probes with raw requests and responses would show which clues belong to the model and which belong to a gateway.",
      ].join("\n"),
    },
    { type: "heading", text: "The trail is open" },
    {
      type: "paragraph",
      text: "The useful next post will not be another confident model name. It will be a trace that another researcher can run. The [OpenRouter card](https://openrouter.ai/stealth/ox-alpha), [public identity archive](https://github.com/LuD1161/ox-alpha-identification-public), [independent fingerprint study](https://github.com/Mich404elle/ox-alpha-black-box-fingerprint), and [full community benchmark run](https://github.com/MatchaOnMuffins/oxalpha) leave enough material to test or challenge this conclusion. Researchers who find a counterexample can add far more by publishing the prompt, route, timestamp, control models, and raw response than by adding another anonymous vote to a thread.",
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
  throw new Error("Ox Alpha Blog assets must be PNG or JPEG images");
}

function validateImageAssets() {
  const hashes = new Set();
  for (const asset of imageAssets) {
    const sourcePath = path.join(sourceRoot, asset.source);
    if (!fs.existsSync(sourcePath)) throw new Error("Ox Alpha image is missing: " + sourcePath);
    const bytes = fs.readFileSync(sourcePath);
    detectContentType(bytes);
    hashes.add(sha256(bytes));
    if (!["generated-editorial", "source-evidence"].includes(asset.kind)) {
      throw new Error("Unsupported Ox Alpha Blog image kind: " + asset.kind);
    }
    if (asset.kind === "source-evidence" && !asset.sourceUrl) {
      throw new Error("Source evidence requires an original URL: " + asset.source);
    }
    if (asset.kind === "generated-editorial" && asset.sourceUrl) {
      throw new Error("Generated editorial art must not claim an original source URL: " + asset.source);
    }
  }
  if (hashes.size !== imageAssets.length) {
    throw new Error("Every Ox Alpha Blog image must be unique");
  }
}

function validatePayload(payload, { requireStorage = false } = {}) {
  const images = payload.blocks.filter((block) => block.type === "image");
  if (images.length !== imageAssets.length) {
    throw new Error("Expected " + imageAssets.length + " image blocks, received " + images.length);
  }
  if (images[0]?.assetKey !== "blog:" + slug + ":featured-trail") {
    throw new Error("The investigation desk must remain the featured image");
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
    "The first 68 minutes",
    "Asking the model led nowhere",
    "The tokenizer matched; the server stack spoke",
    "A calibrated answer: Z.ai upstream, GLM-5 family, checkpoint unknown",
    "The 80% score was ten tasks wide",
    "Good patch instincts, unfinished agent loops",
    "The free preview has a privacy bill",
    "What would change the verdict",
    "The trail is open",
  ]) {
    if (!headings.has(expected)) throw new Error("Missing investigation section: " + expected);
  }

  const prose = payload.blocks
    .flatMap((block) => [block.text, ...(block.rows || []).flat()])
    .filter(Boolean)
    .join("\n");
  if (/\b(?:I|we|you)\b/i.test(prose)) {
    throw new Error("Ox Alpha article must remain in third-person point of view");
  }
  if (!prose.includes("earliest technical fingerprint found") || !prose.includes("Exact checkpoint: unresolved")) {
    throw new Error("The article must preserve its bounded-source and identity language");
  }
  if (!prose.includes("66 solved tasks, or 58.4%") || !prose.includes("different runs and denominators")) {
    throw new Error("The article must preserve the corrected benchmark narrative");
  }
  if (/source-evidence|screenshot|collected image/i.test(prose)) {
    throw new Error("Research-image process notes must not appear in the published article");
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

export async function publishOxAlphaInvestigationBlog() {
  loadLocalEnv();
  validateImageAssets();
  validatePayload(oxAlphaInvestigationBlogPayload);

  const convexUrl = String(process.env.CONVEX_CLOUD_URL || "").trim().replace(/\/+$/, "");
  const secret = process.env.CONVEX_INTERNAL_API_KEY;
  if (!convexUrl) throw new Error("CONVEX_CLOUD_URL is not configured");
  if (!secret) throw new Error("CONVEX_INTERNAL_API_KEY is not configured");

  const client = new ConvexHttpClient(convexUrl);
  const actor = {
    key: "research-blog:ox-alpha-investigation",
    email: String(process.env.OWNER_EMAIL || "mukhtadanasution@gmail.com").trim().toLowerCase(),
    name: "Mukhtada Billah NST",
    role: "backend",
  };
  const uploads = await uploadImageAssets(client, secret, actor);
  const publishPayload = attachStorageIds(oxAlphaInvestigationBlogPayload, uploads.storedByAssetKey);
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
    throw new Error("Ox Alpha Blog publish verification failed");
  }
  const publishedImages = post.blocks.filter(
    (block) => block.type === "image" && block.storageId && block.assetKey && block.src?.startsWith("https://"),
  );
  if (publishedImages.length !== imageAssets.length) {
    throw new Error("Published Ox Alpha post is missing rendered image blocks");
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
  await publishOxAlphaInvestigationBlog();
}
