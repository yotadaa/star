import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { advanceReadingWindow, MAX_ACTIVE_READ_MS } from "../lib/blog/readingAnalyticsMath.mjs";
import { estimatedReadLabel, publicReadershipLabel } from "../lib/blog/readingMetrics.mjs";
import { privacySignalEnabled, readingWindowIsActive } from "../lib/blog/readingTrackerPolicy.mjs";

const root = process.cwd();
const baseUrl = String(process.argv.find((arg) => arg.startsWith("--base-url=")) || "")
  .replace(/^--base-url=/, "")
  .replace(/\/+$/, "");

function pass(label) {
  process.stdout.write(`PASS ${label}\n`);
}

const first = advanceReadingWindow(null, 3_000, 1_000);
assert.equal(first.viewCountDelta, 1);
assert.equal(first.becameEngaged, false);
pass("first event creates one view transition");

const duplicate = advanceReadingWindow({ activeReadMs: 3_000, maxProgressBps: 1_000 }, 3_000, 1_800);
assert.equal(duplicate.viewCountDelta, 0);
assert.equal(duplicate.maxProgressBps, 1_800);
pass("same daily window does not create another view");

const engaged = advanceReadingWindow({ activeReadMs: 18_000, maxProgressBps: 1_800 }, 15_000, 3_000);
assert.equal(engaged.becameEngaged, true);
assert.equal(engaged.engagedReadCountDelta, 1);
assert.equal(engaged.engagedTimeDelta, 33_000);
const engagedAgain = advanceReadingWindow({ activeReadMs: 33_000, maxProgressBps: 3_000, engagedAt: 1 }, 15_000, 4_000);
assert.equal(engagedAgain.becameEngaged, false);
assert.equal(engagedAgain.engagedReadCountDelta, 0);
assert.equal(engagedAgain.engagedTimeDelta, 15_000);
pass("engaged read transitions once and preserves later active time");

const completed = advanceReadingWindow({ activeReadMs: 33_000, maxProgressBps: 4_000, engagedAt: 1 }, 1_000, 9_500);
assert.equal(completed.becameCompleted, true);
const completedAgain = advanceReadingWindow({ activeReadMs: 34_000, maxProgressBps: 9_500, engagedAt: 1, completedAt: 2 }, 1_000, 10_000);
assert.equal(completedAgain.becameCompleted, false);
assert.equal(completedAgain.completionCountDelta, 0);
pass("completion transition is monotonic and counted once");

const capped = advanceReadingWindow({ activeReadMs: MAX_ACTIVE_READ_MS - 500, maxProgressBps: 5_000, engagedAt: 1 }, 20_000, 5_000);
assert.equal(capped.activeReadMs, MAX_ACTIVE_READ_MS);
assert.equal(capped.acceptedActiveMs, 500);
pass("daily active reading time is capped at 60 minutes");

assert.equal(privacySignalEnabled({ globalPrivacyControl: true }), true);
assert.equal(privacySignalEnabled({ doNotTrack: "1" }), true);
assert.equal(privacySignalEnabled({ windowDoNotTrack: "1" }), true);
assert.equal(privacySignalEnabled({ doNotTrack: "0" }), false);
assert.equal(readingWindowIsActive({ visibilityState: "hidden", hasFocus: true }), false);
assert.equal(readingWindowIsActive({ visibilityState: "visible", hasFocus: false }), false);
assert.equal(readingWindowIsActive({ visibilityState: "visible", hasFocus: true }), true);
pass("privacy signals disable writes and hidden or blurred windows are inactive");

assert.equal(estimatedReadLabel("11 min read"), "11 min estimated");
assert.equal(
  publicReadershipLabel("11 min read", { viewCount: 1, engagedReadCount: 1, averageActiveReadMs: null }),
  "11 min estimated, 1 view, 1 engaged read",
);
pass("editorial estimates stay distinct from measured readership");

const seedImporter = fs.readFileSync(path.join(root, "scripts/import-convex-seed.mjs"), "utf8");
const tableDeclaration = seedImporter.match(/const tables = \[([^\]]+)\]/)?.[1] || "";
assert.doesNotMatch(tableDeclaration, /blogReadStats|blogReadWindows/);
const validators = fs.readFileSync(path.join(root, "convex/validators.ts"), "utf8");
const blogInputBlock = validators.match(/export const blogInput = v\.object\(\{([\s\S]*?)\n\}\);/)?.[1] || "";
assert.doesNotMatch(blogInputBlock, /viewCount|engagedReadCount|completionCount|activeRead/);
pass("seed and authoring inputs cannot write analytics tables or counters");

if (baseUrl) {
  const response = await fetch(`${baseUrl}/blog/ox-alpha-api-left-a-trail`);
  assert.equal(response.status, 200);
  const html = await response.text();
  const imageTags = html.match(/<img\b[^>]*>/gi) || [];
  assert.equal(imageTags.some((tag) => !/\balt=(?:"[^"]*"|'[^']*')/i.test(tag)), false);
  const structuredData = [...html.matchAll(/<script[^>]+type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/gi)]
    .map((match) => match[1])
    .join("\n");
  assert.doesNotMatch(structuredData, /viewCount|engagedReadCount|averageActiveRead/i);
  pass("live article HTML has image alt attributes and no volatile analytics in JSON-LD");
}

process.stdout.write("Blog reading analytics verification complete.\n");
