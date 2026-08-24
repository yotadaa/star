# Assignment

- Working title: **Anthropic Added Invisible AI Watermarks. Removers Arrived Before the Detector**
- Slug: `anthropic-watermark-removers`
- Reader question: What did Anthropic actually announce, what can the new open-source removers demonstrably remove, and what remains unverified?
- Article form: AI investigation.
- Intended audience: creators, developers, editors, and policy readers who need to judge provenance claims without treating marketing as a laboratory result.
- Language and voice: `en-US`; warm third-person narration; no first- or second-person narration outside source titles or short quotations.
- Research cutoff: 2026-08-24, 23:59 Asia/Jakarta.
- Required output: repository research package and draft Convex native-block payload only. No publication, database mutation, commit, or push.
- Publishing system: Convex Blog native blocks listed in `docs/blog-writing-automation-contract.md`.
- Primary source (`sourceHref`): https://support.claude.com/en/articles/16266773-how-claude-marks-ai-generated-content
- Author: Mukhtada Billah NST, https://me.mukhtada.my.id/, ID `https://me.mukhtada.my.id/#person`.
- Article section: `AI Investigation`.
- Media: one original editorial feature; one bounded screenshot of the public remover repository as attributed evidence.
- CTA: inspect Anthropic's current marking guidance and the remover repository's limitations before trusting a pass/fail claim.
- Explicit limits: no generic research-note ending; no collected editorial photographs in the payload; no claims that a remover defeats Claude without an official detector result.

## Research questions

1. Which Claude outputs and models does Anthropic say it marks, and why?
2. What implementation details has Anthropic actually disclosed?
3. What do the leading open-source tools do at the byte, metadata, and language levels?
4. Which removal claims can be independently checked today?
5. What legitimate and abusive uses follow from easy mark removal?
6. Does the claimed two-million-impression launch establish technical effectiveness?

## Disproof conditions

The working angle fails if Anthropic has released a public detector and a reproducible test shows the featured tool reliably clears it, or if the repository contains a validated Claude-specific detector rather than generic Unicode, metadata, and rewrite operations.
