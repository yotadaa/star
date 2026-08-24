# Assignment: The Harness Is Becoming More Important Than the Model

- Reader question: For developers choosing or building a coding agent, when does the execution system around a model matter as much as, or more than, the model name?
- Intended reader: software engineers and agent builders who understand tool-calling models but may still compare products mainly by model family.
- Article form: evidence-backed technical opinion with an explainer spine.
- Language: English (`en-US`).
- Point of view: warm third-person narration; no first- or second-person narration outside source titles or short quotations.
- Depth: long-form, with enough detail to separate accuracy, cost, failure behavior, observability, and safety.
- Research cutoff: August 24, 2026, 23:59 WIB (UTC+7).
- Output: research package, Markdown draft, and native-block draft payload. No publication, Convex mutation, commit, or push.
- Publishing system: this repository's Convex Blog schema and native blocks.
- Citation style: descriptive Markdown links beside the supported claim.
- Primary source (`sourceHref`): https://deepseek.com/harness/en/
- Author: Mukhtada Billah NST, https://me.mukhtada.my.id/#person, https://me.mukhtada.my.id/
- Article section: `Research Note`.
- Draft status: `draft`; no publication date is asserted.
- Proposed slug: `harness-more-important-than-model`.
- Proposed SEO title: `Why the Agent Harness Can Matter More Than the Model`
- Proposed SEO description: `Benchmarks and DeepSeek Harness show how tools, context, recovery, tracing, and safety can change an agent's cost and results without changing its model.`
- Media ownership: one original generated feature illustration may enter the payload. Third-party source captures remain research evidence unless the rights owner grants publication permission.
- Reader action: inspect DeepSeek Harness's architecture and compare model-harness pairs under the same task, budget, and validation rules.

## Research questions

1. What does DeepSeek mean by “everything is a plugin,” and which agent functions actually sit behind that boundary?
2. Does controlled evidence show that changing a harness while holding the model fixed changes completion, cost, or failure behavior?
3. Which evidence still shows a material model effect?
4. How do DeepSeek Harness, Claude Code, and Codex divide tools, context, extensions, execution controls, tracing, and recovery?
5. What benefits follow from a replaceable execution layer, and what new costs appear in compatibility, security, debugging, and operator burden?
6. Which social claims can be treated only as firsthand reports rather than benchmark results?

## Disproof conditions

The working angle would fail if fixed-model studies showed negligible harness effects across accuracy, cost, and failure behavior, or if DeepSeek's plugin claim applied only to peripheral extensions. The title must be narrowed if the evidence supports only one benchmark, one model, or one harness family.

## Research Gate decision

**Passed on August 24, 2026.** The central answer is supported by DeepSeek's direct architecture record, three independent 2026 benchmark papers, the 2024 SWE-agent interface study, and first-party comparison material for Claude Code and Codex. The evidence supports “becoming more important” as an operational selection claim, not a universal ranking of harness over model intelligence. Model choice remains material in Claw-SWE-Bench, and all named 2026 harness studies are preprints with bounded task sets.

## Boundary sentence

No available study proves that a harness is universally more important than a model; the evidence shows that the model name alone no longer predicts cost, failure mode, safety boundary, or even task success well enough for an agent-system decision.
