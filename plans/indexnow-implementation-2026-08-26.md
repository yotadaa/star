# IndexNow implementation plan

Status: complete

## Evidence

- Bing's official setup guide requires a host-verifiable key and supports JSON URL batches through `https://api.indexnow.org/indexnow`.
- The IndexNow protocol permits up to 10,000 same-host URLs per request and recommends notifying participating engines when content is added, updated, or deleted.
- `INDEXNOW_API_KEY` is present in the local server environment and passes the documented length/character checks. Its value must never enter client code, logs, source control, or screenshots.

## Implementation

1. Add a server-only IndexNow client that validates the key, canonical origin, same-host URLs, request size, and accepted response statuses.
2. Serve the verification key as UTF-8 plain text from `/indexnow-key.txt`; all submissions include that absolute `keyLocation`.
3. Notify IndexNow after owner/backend Blog create, update, publish, archive, or slug changes. Indexing failures remain observable but do not roll back a successful content mutation.
4. Extend the grounded Blog batch publisher so automation-originated publications also notify IndexNow.
5. Add a guarded CLI for deployment-time bulk submission from the live Blog sitemap.

## Acceptance criteria

- The key never appears in a browser JavaScript bundle or application log.
- `/indexnow-key.txt` returns the configured key as `text/plain` and returns a safe unavailable response if configuration is missing or invalid.
- Submission payloads contain only deduplicated URLs on the canonical host, never exceed 10,000 URLs, and use the documented host/key/keyLocation/urlList shape.
- HTTP 200 and 202 are accepted; other IndexNow responses produce a key-safe error.
- Published and removed Blog URLs are notified through both the admin API and the grounded-batch automation path.
- Build, local route verification, mocked protocol checks, and rendered Blog checks pass before commit.

## Guardrails

- No dependency or color/UI change.
- No client-side secret or public environment variable.
- No fabricated indexing-success claim: IndexNow acknowledgement does not guarantee crawling or indexing.
