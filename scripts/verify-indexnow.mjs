import assert from "node:assert/strict";
import {
  createIndexNowPayload,
  INDEXNOW_ENDPOINT,
  submitIndexNowUrls,
} from "../lib/indexNowCore.mjs";

const key = "test-indexnow-key-2026";
const siteOrigin = "https://me.mukhtada.my.id";
const urls = [
  `${siteOrigin}/blog`,
  `${siteOrigin}/blog/example-post`,
  `${siteOrigin}/blog/example-post#duplicate-fragment`,
];

const payload = createIndexNowPayload({ key, siteOrigin, urls });
assert.deepEqual(payload, {
  host: "me.mukhtada.my.id",
  key,
  keyLocation: `${siteOrigin}/indexnow-key.txt`,
  urlList: [`${siteOrigin}/blog`, `${siteOrigin}/blog/example-post`],
});

let capturedRequest;
const result = await submitIndexNowUrls({
  key,
  siteOrigin,
  urls,
  fetchImpl: async (url, init) => {
    capturedRequest = { url, init };
    return new Response(null, { status: 202 });
  },
});

assert.equal(capturedRequest.url, INDEXNOW_ENDPOINT);
assert.equal(capturedRequest.init.method, "POST");
assert.equal(capturedRequest.init.headers["Content-Type"], "application/json; charset=utf-8");
assert.deepEqual(JSON.parse(capturedRequest.init.body), payload);
assert.deepEqual(result, {
  ok: true,
  status: 202,
  submitted: 2,
  host: "me.mukhtada.my.id",
  keyLocation: `${siteOrigin}/indexnow-key.txt`,
});

assert.throws(
  () => createIndexNowPayload({ key: "short", siteOrigin, urls }),
  (error) => error.code === "INDEXNOW_KEY_INVALID",
);
assert.throws(
  () => createIndexNowPayload({ key, siteOrigin, urls: ["https://example.com/blog"] }),
  (error) => error.code === "INDEXNOW_URL_HOST_MISMATCH",
);
assert.throws(
  () => createIndexNowPayload({
    key,
    siteOrigin,
    urls: Array.from({ length: 10_001 }, (_, index) => `${siteOrigin}/blog/${index}`),
  }),
  (error) => error.code === "INDEXNOW_URL_LIMIT",
);
await assert.rejects(
  submitIndexNowUrls({
    key,
    siteOrigin,
    urls,
    fetchImpl: async () => new Response(null, { status: 403 }),
  }),
  (error) => error.code === "INDEXNOW_REJECTED" && error.status === 403,
);

console.log("IndexNow protocol checks passed: key, host, deduplication, payload, limits, and responses.");
