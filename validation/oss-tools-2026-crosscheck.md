# Independent cross-check: open-source tools for 2026

Checked 30 August 2026 against current official repositories, repository license files, official documentation, the project security advisory, and the dated third-party Trending capture. No article or publication files were changed.

## Verdict

The strongest supportable thesis is not that one late-August Trending list identified the best open-source tools. It is that a durable 2026 toolbelt can be assembled from small, replaceable layers that exchange ordinary artifacts: project search and reproducible Python tooling, document conversion and local analytics, a permission-bounded agent layer, then separate synchronization and backup. Agent skills fit this argument as portable procedures, while skill scanners and the Cline incident show that those procedures also create a new dependency and authority boundary. The licensing section then supplies the second defensible point: public source and self-hostability do not automatically mean OSI-approved open source or unrestricted commercial reuse.

The following stronger claims are not supportable:

- “GitHub Trending proved that Codex, Agent Skills, Scientific Agent Skills, and SkillSpector were all prominent on 29 August.”
- A star count or one daily list establishes durability, quality, or user satisfaction.
- Every listed agent, framework, gateway, notebook, self-hosted application, and command-line utility belongs in one coherent stack.
- “Open source” can be used interchangeably with source-available, fair-code, or open-core.

## The Trending record must be tied to one capture

The supplied synthesis conflates the archive site’s changing `/` live page with its dated archive.

- The canonical dated page is the unofficial [29 August 2026 capture](https://www.github-trending-archives.com/d/2026-08-29). Its first three entries are `tt-a1i/archify`, `K-Dense-AI/scientific-agent-skills`, and `anthropics/claude-plugins-official`. Scientific Agent Skills is number two and the capture reports 720 stars that day.
- `openai/codex`, `addyosmani/agent-skills`, and `NVIDIA/SkillSpector` are absent from that dated top 20.
- The archive’s [About page](https://www.github-trending-archives.com/about) says it is an unaffiliated third-party archive. Nightly native captures began on 30 July 2026; older records were reconstructed from Wayback Machine captures.
- The site’s `/` route is a live, approximately ten-minute feed. It returned a different list during this audit, including Codex with 1,994 stars that day. It is not historical evidence for the dated 29 August ranking even when its displayed date falls on 29 August in another timezone.

Safe article wording:

> In the unofficial archive’s captured 29 August 2026 snapshot, the first three entries were Archify, K-Dense’s Scientific Agent Skills, and Anthropic’s official Claude plugins. The snapshot records a moment of attention, not a stable or official GitHub ranking.

Do not call this “GitHub’s August 29 ranking,” and do not attach Codex, Addy Agent Skills, or SkillSpector to that exact snapshot.

## Material factual and terminology corrections

| Topic | Finding | Required treatment |
|---|---|---|
| Addy Osmani Agent Skills | The [repository](https://github.com/addyosmani/agent-skills) is MIT-licensed and real. Its current guide describes skills as step-by-step processes and explicitly says not to load every skill at once because that wastes context. Single-skill installation can omit repository-level references. It was not in the dated 29 August top 20. | Keep it as a procedural dependency example, not as a proven 29 August winner or “one of the strongest trends.” |
| NVIDIA SkillSpector | The [repository](https://github.com/NVIDIA/SkillSpector) is Apache-2.0. Its current README documents static checks, optional LLM analysis, OSV lookups, risk scores, and JSON/Markdown/SARIF output. Current package metadata reports 2.11.0. | Describe it as a triage control, never proof that a skill is safe. An [open issue against 2.8.2](https://github.com/NVIDIA/SkillSpector/issues/363) reports a fail-open oversized-companion case; attribute it as an unreproduced report and do not imply that current 2.11.0 is confirmed affected. |
| Scientific Agent Skills | The [repository](https://github.com/K-Dense-AI/scientific-agent-skills) is MIT at the repository level and its current README reports version 2.65.0 and 163 skills. The GitHub description advertises 165, so counts are unsynchronized. Four vendored document skills carry Anthropic terms in their own license files. | Use the README’s 163 only if a number is necessary and date it. Say repository-level MIT with per-skill/upstream terms to check. Treat “used by 190,000+ scientists” as the maintainer’s marketing claim, not independently measured adoption. |
| OpenAI Codex | [Codex](https://github.com/openai/codex) is an Apache-2.0 terminal coding agent; GitHub identifies Rust as its primary language. | The product and license claims are sound. Remove the alleged 29 August ranking or tie a stars-today value only to an exact capture and time. |
| Apple `container` | The [project](https://github.com/apple/container) runs Linux containers as lightweight VMs on Apple silicon, but its latest official release is 1.3.1, published 29 August 2026. | Delete “still pre-1.0.” |
| OpenCode | The old `sst/opencode` URL redirects to [anomalyco/opencode](https://github.com/anomalyco/opencode). The current repository is MIT, documents multiple providers and LSP support, and exposes allow/ask/deny permission rules. | Use the canonical repository. Avoid undated “grew enormously” language. Make deny rules, secret boundaries, and auto-approval behavior part of the tradeoff. |
| goose | `block/goose` redirects to [aaif-goose/goose](https://github.com/aaif-goose/goose). The current repository is Apache-2.0, calls goose a local general-purpose agent, and identifies it as an Agentic AI Foundation project at the Linux Foundation. | Update the canonical URL. The general-purpose and foundation claims are supported. |
| OpenHands | `All-Hands-AI/OpenHands` redirects to [OpenHands/OpenHands](https://github.com/OpenHands/OpenHands). The current project is an Agent Canvas in a multi-repository architecture. The Canvas, [software-agent-sdk](https://github.com/OpenHands/software-agent-sdk), and [automation](https://github.com/OpenHands/automation) repositories all report MIT. Cloud and Enterprise are commercial offerings. | Do not claim that enterprise code in the referenced repository is separately licensed without pointing to a specific separately licensed codebase. Describe the current multi-repository architecture, not the older monolithic autonomous-development environment. |
| Browser Use | [browser-use/browser-use](https://github.com/browser-use/browser-use) is an MIT Python project. Its current README points coding agents to the separate [browser-use/browser-harness](https://github.com/browser-use/browser-harness), which GitHub also identifies as MIT and Python. | “Rust-backed browser harness” is false for the referenced repositories and must be removed. Distinguish the Python library, the agent-facing harness, and the commercial cloud service. |
| Letta | [letta-ai/letta](https://github.com/letta-ai/letta) is now a landing page. Its README says Letta V1 is retired and the current source lives at [letta-ai/letta-code](https://github.com/letta-ai/letta-code). Letta Code is Apache-2.0; its README says MemFS tracks context, including memory blocks, with Git and can sync it to a custom GitHub repository. | Change the link and product name to Letta Code. The Git-tracked-memory claim is supportable only against the new repository. |
| LiteLLM | The root [license](https://github.com/BerriAI/litellm/blob/litellm_internal_staging/LICENSE) says content outside `enterprise/` is MIT; `enterprise/` has a commercial BerriAI Enterprise License. The README describes a unified SDK/gateway for 100+ providers. | Call this a mixed-license or open-core repository. “Most code is MIT” is a quantity claim not established by the license and should become “code outside the named enterprise directory is MIT.” |
| Langfuse | The current [root license](https://github.com/langfuse/langfuse/blob/main/LICENSE) is MIT outside `ee/`, `web/src/ee/`, and `worker/src/ee/`; [ee/LICENSE](https://github.com/langfuse/langfuse/blob/main/ee/LICENSE) explicitly calls the project open-core. Copyright now names ClickHouse, Inc. | Use `langfuse/langfuse`, not the GitHub organization as the evidence link. Disclose the open-core split. “One of the better tools” is opinion, not a sourced finding. |
| Docling | [Docling](https://github.com/docling-project/docling) is MIT and carries the LF AI & Data project badge. Its current README supports PDF, DOCX, PPTX, XLSX, HTML, EPUB, images, audio, email, and other formats with Markdown/HTML/text/JSON-family outputs. | The broad format claim is supported. Treat extraction as a representation that must be validated, not ground truth. |
| marimo | [marimo](https://github.com/marimo-team/marimo) is Apache-2.0. Its README describes reactive notebooks stored as pure Python, executable as scripts, and deployable as apps. | The core description is supported. Keep the migration downside for mutation-heavy and manual-order notebooks. |
| Open WebUI | The official [license page](https://docs.openwebui.com/license/) says v0.6.6+, effective 19 April 2025, uses a branding-restricted source-available license that is not OSI-approved. Code through v0.6.5 remains BSD-3-Clause. | Correct in substance. Call current releases source-available, not open source. Mention the 50-user branding exception only if relevant; do not reduce the rule to a general commercial-use ban. |
| n8n | The official [Sustainable Use License documentation](https://docs.n8n.io/privacy-and-security/sustainable-use-license/) calls n8n fair-code and source-available, not open source. Internal business, personal, and non-commercial uses are generally allowed; selling white-labelled n8n or hosted access is restricted without another agreement. | The fair-code warning is correct. Do not place n8n in a strict OSS list. |
| Stirling PDF | The [root license](https://github.com/Stirling-Tools/Stirling-PDF/blob/main/LICENSE) makes code outside several named directories MIT; the engine, SaaS, proprietary, desktop, cloud, portal, and related directories have separate licenses. The README calls the project open-core. | “Open-core” is accurate but material. It should appear beside the first recommendation, not in fine print after calling the whole current product open source. |
| `llama.cpp` | The supplied link points to `max-krasnyansky/llama.cpp`, a different one-star repository. | The canonical major project is [ggml-org/llama.cpp](https://github.com/ggml-org/llama.cpp). Replace the URL before any publication. |

## The Cline supply-chain example needs a causality boundary

The example is real, but two evidence levels must not be collapsed.

- Adnan Khan’s [Clinejection report](https://adnanthekhan.com/posts/clinejection/) documents a reproducible chain in a mirror: attacker-controlled issue-title text reached an overprivileged Claude workflow, then GitHub Actions cache poisoning could pivot into a release workflow.
- Cline’s [GHSA-9ppg-jx86-fqw7](https://github.com/cline/cline/security/advisories/GHSA-9ppg-jx86-fqw7) confirms that an unauthorized actor later used a compromised npm token to publish `cline@2.3.0`, whose added postinstall command installed OpenClaw. Cline 2.4.0 replaced it after an exposure window of about eight hours; the VS Code and JetBrains packages were not affected.
- [Snyk’s account](https://snyk.io/blog/cline-supply-chain-attack-prompt-injection-github-actions/) connects the risk chain and incident timeline, but the public evidence does not establish that the unknown publisher was the same actor or definitively acquired the token through the reproduced prompt-injection/cache path.

Safe article treatment: the incident demonstrates why untrusted natural language, shell authority, shared CI caches, and long-lived publication credentials cannot be reviewed as separate problems. It should not say that a malicious skill caused the Cline release, or that the precise theoretical chain was proven to be the route used in production.

## Recommended 12-project article set

This set supports one coherent article rather than another directory of overlapping products:

1. **ripgrep** — fast, Git-aware project search; explicit flags are needed for ignored and hidden evidence.
2. **uv** — Python versions, environments, lockfiles, scripts, and tools under one reproducible entry point.
3. **Ruff** — linting and formatting with explicit safe/unsafe-fix boundaries.
4. **Docling** — heterogeneous document conversion, with page-to-output validation as the counterweight.
5. **DuckDB** — local SQL over portable files such as Parquet.
6. **marimo** — reactive, Git-friendly analysis stored as Python.
7. **OpenCode** — one representative coding agent with explicit permission policy. Codex or goose can be named as alternatives, not installed as duplicate mandatory layers.
8. **Agent Skills** — portable engineering procedures, loaded selectively and pinned like dependencies.
9. **Scientific Agent Skills** — an optional research specialization; repository-level MIT does not erase per-skill and upstream terms.
10. **SkillSpector** — pre-install triage, explicitly not a safety certificate.
11. **Syncthing** — current-file availability across devices.
12. **restic** — independent encrypted snapshot history and tested restores.

Codex, goose, OpenHands, Browser Use, Letta Code, LiteLLM, and Langfuse are legitimate projects, but adding all of them to this same stack would create overlapping agent and infrastructure layers. They belong in a comparison or a separate production-agent-stack article. Open WebUI, n8n, and Stirling PDF belong only in a clearly labeled licensing sidebar unless the title is broadened beyond strict open source.

## Editorial audit of the current OSS draft

The current draft at `validation/open-source-tools-2026-stack-that-works-together-2026-08-30/draft.md` already uses the dated capture correctly and avoids the false Codex/Addy/SkillSpector grouping. A literal pronoun/process scan found no first-person or second-person narration, no research-method narration, no cutoff note, and no “research note” ending. Its subject-matter-only, third-person constraint currently passes.

The current draft also avoids the major stale claims above: it uses the canonical OpenCode repository, does not repeat the Browser Use Rust claim, does not use the stale Letta link, and limits Open WebUI and n8n to a licensing-boundary example. Its open SkillSpector issue is correctly labeled as reported and not independently reproduced.

One maintenance caution remains: the issue targets SkillSpector 2.8.2 while current package metadata is 2.11.0. The sentence must continue to name the affected reported version and must not imply that the report proves a bypass in 2.11.0.

## Primary-source index

- Dated Trending capture: <https://www.github-trending-archives.com/d/2026-08-29>
- Archive provenance: <https://www.github-trending-archives.com/about>
- Agent Skills guide: <https://github.com/addyosmani/agent-skills/blob/main/docs/getting-started.md>
- SkillSpector repository and license: <https://github.com/NVIDIA/SkillSpector> and <https://github.com/NVIDIA/SkillSpector/blob/main/LICENSE>
- Scientific Agent Skills repository and license: <https://github.com/K-Dense-AI/scientific-agent-skills> and <https://github.com/K-Dense-AI/scientific-agent-skills/blob/main/LICENSE.md>
- Codex: <https://github.com/openai/codex>
- OpenCode: <https://github.com/anomalyco/opencode>
- goose: <https://github.com/aaif-goose/goose>
- OpenHands repositories: <https://github.com/OpenHands/OpenHands>, <https://github.com/OpenHands/software-agent-sdk>, <https://github.com/OpenHands/automation>
- Browser Use and Browser Harness: <https://github.com/browser-use/browser-use>, <https://github.com/browser-use/browser-harness>
- Letta Code: <https://github.com/letta-ai/letta-code>
- LiteLLM license: <https://github.com/BerriAI/litellm/blob/litellm_internal_staging/LICENSE>
- Langfuse licenses: <https://github.com/langfuse/langfuse/blob/main/LICENSE>, <https://github.com/langfuse/langfuse/blob/main/ee/LICENSE>
- Docling: <https://github.com/docling-project/docling>
- marimo: <https://github.com/marimo-team/marimo>
- Open WebUI license: <https://docs.openwebui.com/license/>
- n8n license guide: <https://docs.n8n.io/privacy-and-security/sustainable-use-license/>
- Stirling PDF license: <https://github.com/Stirling-Tools/Stirling-PDF/blob/main/LICENSE>
- Cline advisory and technical report: <https://github.com/cline/cline/security/advisories/GHSA-9ppg-jx86-fqw7>, <https://adnanthekhan.com/posts/clinejection/>
