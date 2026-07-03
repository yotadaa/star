# Execution Checklist - Nala NPC Assistant

Tanggal mulai: 2026-07-04

## DISCOVER

- [x] Baca `AGENTS.md`.
- [x] Baca `PRODUCT.md`, `design-system.md`, `report.md`, dan `TASKS.md`.
- [x] Baca `plans/ai-npc-plan/implementation-plan.md` penuh.
- [x] Baca `plans/ai-npc-plan/nala-mockup.html` penuh.
- [x] Load skill relevan: `executing-plans`, `nextjs`, `react`, `frontend-design`, `design-systems`, `supabase`, `postgres`.
- [x] Cek pola existing: `SiteProvider`, `Toast`, `WorldChatPanel`, `featureStore`, `schema.sql`, dan shard setup script.

## Decisions

- World Chat tetap di kiri-atas; Nala menjadi assistant AI publik di kanan-bawah sesuai plan §1-2.
- Karena user meminta migrasi database, Nala MVP menyimpan conversation telemetry ke Supabase walaupun plan §4 awal menyebut MVP tidak membutuhkan Supabase.
- `OPENROUTER_API_KEY` / model belum ditemukan di `.env.local`. Implementasi tetap env-driven untuk OpenRouter, dan mode dev tanpa key memakai deterministic factual response dari data nyata supaya tidak mengarang.
- Tip proaktif/badge notifikasi tidak diaktifkan di MVP karena plan §7.4 masih butuh konfirmasi dan bisa terasa interrupting. FAB tetap siap tanpa fake notification.
- `search_blog_posts` masuk MVP karena backend Blog CMS sudah live.

## Task Plan

### Task 1 - Supabase migration for Nala sessions

- Sumber spesifikasi: `plans/ai-npc-plan/implementation-plan.md` §4, §9; user request migration database.
- Halaman/letak persis: backend schema, all three Supabase shards.
- Elemen & struktur: `public.nala_conversations`, `public.nala_messages`, backend-only write/read policies via `private.is_backend_request()`.
- Dependency baru dibutuhkan?: TIDAK.
- Token warna baru dibutuhkan?: TIDAK.
- Butuh konfirmasi data?: Tidak untuk schema; storage requested by user.
- Acceptance criteria:
  1. `npm run supabase:setup` applies schema without errors to all configured shards.
  2. Tables exist in `public` and have RLS + explicit grants.
  3. Writes route to one shard and reads back by routed `conversation_id`.
- Guardrail relevan: AGENTS §1.1 no dependency, no fake data; Supabase RLS/grants.
- Screenshot evidence: not visual; validation command output recorded in final validation report.
- Status: done.

### Task 2 - `/api/nala/chat` with tool-calling architecture

- Sumber spesifikasi: plan §4-7.
- Halaman/letak persis: `app/api/nala/chat/route.js`, `lib/nala/*`, `lib/backend/featureStore.js`.
- Elemen & struktur: POST endpoint accepts `{ message, history, conversationId }`, calls OpenRouter when env exists, executes local read-only tools, stores exchange in Supabase, returns `{ reply, expression, suggestedChips, action }`.
- Dependency baru dibutuhkan?: TIDAK.
- Token warna baru dibutuhkan?: TIDAK.
- Butuh konfirmasi data?: Model/rate limit belum ada; endpoint uses env and clear local factual mode when missing.
- Acceptance criteria:
  1. No answer can mention project/publication/stats unless it comes from local data/tool result.
  2. Missing OpenRouter env does not crash and returns factual local-mode response.
  3. API stores user and assistant messages when schema is available.
- Guardrail relevan: PRODUCT anti-fabrication, AGENTS no fake metrics, Next.js server-only secrets.
- Screenshot evidence: API test output plus visual panel screenshots.
- Status: done.

### Task 3 - Nala widget UI

- Sumber spesifikasi: plan §2-3, §7-8; mockup sections 1-6.
- Halaman/letak persis: global overlay rendered by `SiteProvider`, right-bottom FAB/panel.
- Elemen & struktur: pixel-corner FAB, Nala portrait states, panel header/thread/chips/input, toast offset coordination.
- Dependency baru dibutuhkan?: TIDAK.
- Token warna baru dibutuhkan?: TIDAK.
- Butuh konfirmasi data?: Character style already has generated assets in plan folder.
- Acceptance criteria:
  1. Desktop and mobile render without horizontal overflow.
  2. Keyboard: FAB opens with Enter/Space, Esc closes panel, focus-visible visible.
  3. Reduced-motion disables FAB bob/typing bounce.
  4. No emoji/ASCII pseudo-icons in production UI.
- Guardrail relevan: design-system §5, §8, §11; PRODUCT anti emoji-based gamification.
- Screenshot evidence: `screenshots/ai-npc-nala-2026-07-04/`.
- Status: done.

### Task 4 - Validation and log

- Sumber spesifikasi: AGENTS §5-7.
- Acceptance criteria:
  1. Build passes.
  2. Supabase migration passes or blocker is documented with exact error.
  3. API smoke tests pass for local factual mode.
  4. Screenshots captured desktop/mobile/reduced-motion and analyzed.
  5. `TASKS.md` and `AGENTS.md` decision log updated.
  6. Coherent work committed.
- Status: done.

## Validation Report

Tanggal selesai: 2026-07-04

- Migration: `npm run supabase:setup` selesai tanpa error untuk shard `s1`, `s2`, dan `s3`.
- API syntax: `node -c lib/nala/tools.js`, `node -c lib/nala/assistant.js`, `node -c lib/backend/nalaStore.js`, dan `node -c app/api/nala/chat/route.js` lulus.
- API smoke:
  - `Ceritain proyek AI tooling` -> menjawab dari project data, action `/projects`, tersimpan ke Supabase.
  - `Publikasi apa saja yang paling baru?` -> menjawab dari publication data dengan total sitasi hasil tampil.
  - `Publikasi tentang pendidikan` -> memfilter publikasi KNN pendidikan.
  - `Cara hubungi Mukhtada lewat LinkedIn atau GitHub?` -> action `/contact`.
  - `Level dan inventory sekarang berapa?` -> memakai Player Progress real: Level 4 / 71 PP.
- DB readback: conversation `s2_3f06ffe585b0440ca478fd328f897fbc` terbaca dari `public.nala_conversations`; `public.nala_messages` berisi 14 pesan berpasangan user/assistant.
- Build: `npm run build` lulus; `/api/nala/chat` tercatat sebagai dynamic route.
- Visual evidence:
  - `screenshots/ai-npc-nala-2026-07-04/desktop-closed.png`
  - `screenshots/ai-npc-nala-2026-07-04/desktop-open.png`
  - `screenshots/ai-npc-nala-2026-07-04/desktop-after-reply.png`
  - `screenshots/ai-npc-nala-2026-07-04/mobile-closed.png`
  - `screenshots/ai-npc-nala-2026-07-04/mobile-open.png`
  - `screenshots/ai-npc-nala-2026-07-04/mobile-after-reply.png`
  - `screenshots/ai-npc-nala-2026-07-04/desktop-reduced-motion-closed.png`
  - `screenshots/ai-npc-nala-2026-07-04/desktop-reduced-motion-open.png`
  - `screenshots/ai-npc-nala-2026-07-04/desktop-reduced-motion-after-reply.png`
- Screenshot/DOM checks: desktop and mobile `scrollWidth` matched viewport width; action chip rendered; mobile open state hides the FAB to avoid blocking the send button; reduced-motion media query was active in validation.

## Triage Notes

- Fixed P1: initial project search treated natural-language prompt as one exact query, so Nala failed to find AI tooling projects. Added tokenized query scoring with portfolio-specific stopwords.
- Fixed P1: `nala_messages.tool_payload` was `null` for the user row during Supabase multi-row insert. Added explicit `{}` payload for user messages.
- Fixed P2: FAB bob animation on the button made the target unstable for automated click/focus. Moved bob animation to the inner sprite only.
- Fixed P1/P2: mobile open panel left FAB over the send button. Hidden the open FAB on narrow viewports because the panel has its own close button.
- Fixed P1: desktop thread did not scroll to the latest assistant response, hiding the final action chip. Added automatic thread scroll on message/pending changes.
