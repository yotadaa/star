# Claim ledger

| Claim | Evidence | Boundary |
|---|---|---|
| Node 26 shipped as Current on 5 May 2026 | Node 26 release notes | Status can change in October |
| LTS transition is scheduled for 28 October 2026 | Node Release schedule | Scheduled date, not a completed event |
| Temporal is enabled by default; V8 14.6 and Undici 8 ship with Node 26 | Node 26 release notes | Runtime-level features, not Next.js speed claims |
| `writeHeader()` and legacy `_stream_*` internals were removed | Node 26 release notes | Only affected code and dependencies break |
| Current Next.js docs require Node 20.9+ | Next.js installation docs | Minimum support does not certify every Node 26 dependency |
| Vercel currently lists 24, 22, and 20 | Vercel Node runtime docs | Hosting support may change before Node 26 LTS |
| Convex hosted Node actions currently list 20, 22, and 24 | Convex runtime docs | Browser client compatibility is a separate surface |
| This checkout built and started under Node 24.20.0 and 26.7.0 | `benchmark/results.json` | One clean run per runtime; no performance winner claim |
