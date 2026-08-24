# The Harness Is Becoming More Important Than the Model

Coding agents are still sold under model names, yet a 2026 controlled study found up to a 40× difference in tokens per solved task after changing the harness while keeping the model fixed. The model still determines what the system can reason through. The harness increasingly determines what that reasoning can see, what it can do, how long it can keep going, and whether anyone can reconstruct the run afterward.

DeepSeek put a blunt label on that shift when it opened Harness v0.1 on August 13, 2026: [“Everything is a plugin.”](https://x.com/deepseek_ai/status/2087887408440164663) The slogan covers the model adapter itself, along with tools, skills, sessions, sandboxes, storage, loops, scheduling, and the interface. It makes a useful argument, though a narrower one than the title may first suggest. No available study proves that a harness always matters more than the model; the evidence shows that a model name alone no longer predicts an agent's cost, failure behavior, action boundary, or task result well enough for a serious system choice.

![A small dark model core linked to tools, memory reels, a sandbox, a permission gate, an execution loop, and a trace ribbon.](generated/harness-system-feature.png)

*The model occupies the center; the machinery that gives it tools, memory, limits, and a record occupies almost everything else.*

## “More important” means more decisive in the running system

A harness is the execution system around a model. It assembles context, presents tool schemas, carries state between turns, decides when to stop, enforces permissions, records events, and handles a bad tool call or a broken process. A chat benchmark can hide most of that machinery. A coding agent cannot.

The distinction appeared well before the current crop of coding products. The 2024 [SWE-agent paper](https://arxiv.org/abs/2405.15793) called its tool-facing design an agent-computer interface. Its authors treated commands and feedback formats as variables that could change how a language model edited files, moved through a repository, and ran tests. That paper reported 12.5% Pass@1 on SWE-bench and 87.7% on HumanEvalFix for the complete SWE-agent system. Those rates belong to their period and protocols, so they should not be compared directly with 2026 results. The durable point is simpler: interface design was already part of measured agent capability.

Two newer studies make the separation harder to ignore. [Harness-Bench](https://arxiv.org/abs/2605.27922) evaluated 106 sandboxed tasks across 5,194 execution trajectories and recorded artifacts, traces, usage, and validator results. Its authors argue that capability should be reported at the model-harness configuration level because plausible reasoning can become detached from tool feedback, workspace state, or the requested output contract.

[The Scaffold Effect in Coding Agents](https://arxiv.org/abs/2607.22585) held the model fixed while running Qwen 3.6 Plus and MiniMax M2.5 through Goose, OpenCode, and OpenHands-SDK on 50 Terminal-Bench Pro tasks. Pass-rate differences within a model stayed between 0 and 8 percentage points, and most paired confidence intervals included zero. Efficiency did not stay close: the study found roughly a 40× gap in tokens per solved task between its least and most expensive harness configurations.

The failures also carried the harness's fingerprints. Goose tended to stop after reasoning failures. OpenHands-SDK produced more verification and turn-limit failures, while OpenCode showed more timeouts, hangs, and idle turns. Those patterns repeated across both models. A model upgrade cannot directly repair a wrapper that keeps spinning, misreports tool feedback, or never verifies its patch.

## A counterexample keeps the model in the picture

The strongest case for harness importance also supplies the best warning against model dismissal. [Claw-SWE-Bench](https://arxiv.org/abs/2606.12344) reports that a minimal direct-diff adapter scored 19.1% Pass@1 while a full adapter reached 73.4% with the same GLM 5.1 backbone. That 54.3-point gap is a striking fixed-model result.

Across the paper's broader sweeps, model choice changed Pass@1 by 29.4 percentage points and harness choice by 27.4 points. The model effect was slightly larger. The fair reading is that harness choice has entered the same order of magnitude as model choice in that benchmark, not that the model has become incidental.

Task category matters too. The Scaffold Effect found a large OpenHands-SDK advantage on fresh implementation tasks, but harness ordering shifted elsewhere and every tested combination failed both system tasks in its small sample. No single wrapper won every kind of work. “Best harness” is therefore as incomplete as “best model” without a task mix, budget, latency target, and failure policy.

## DeepSeek moved the agent loop behind the plugin boundary

DeepSeek's claim is unusually literal. Its [architecture document](https://github.com/deepseek-ai/deepseek-harness/blob/master/docs/architecture.md) says the model adapter, tool registry, session log, and agent loop are plugins. A running profile becomes an ordered plugin tree, assembled from bundles and local configuration. The document says there is no privileged core to patch; an extension mounts beside the existing parts, and its registrations unwind when the plugin unloads.

Cordis supplies that lifecycle model. The associated [programming-paradigm draft](https://github.com/cordiverse/paper) describes reversible effects, which let a component undo registered changes when removed, and reactive dependencies, which let components respond when a required service appears or disappears. The paper calls these temporal and spatial composability. It also warns that the draft is under active revision, so its formal claims should not be mistaken for a stability promise about every DeepSeek plugin.

DeepSeek's [launch page](https://deepseek.com/harness/en/) adds a second design choice: an append-only session log records system prompts, reasoning exposed to the runtime, tool calls and results, subagent scheduling, and injected context. Resume, fork, search, and replay operate on that event stream. That record can turn a vague complaint such as “the model went wrong” into a smaller question: which context entered, which tool contract failed, which event changed the state, and what happened next?

The page also exposes Standard, Code, Minimal, and Creator modes. Minimal mode keeps a persistent shell and file editor; richer modes add tools, workflows, and plugin inspection. That separation matters for evaluation because it makes the execution environment an explicit choice instead of an invisible bundle attached to a model label.

## Claude Code and Codex make different parts explicit

DeepSeek is not alone. Other products expose different portions of the surrounding system, which is precisely why model-only comparisons lose information.

| Surface | DeepSeek Harness | Claude Code | Codex |
|---|---|---|---|
| Composition | Model, loop, tools, sessions, storage, scheduling, and UI can be Cordis plugins. | [Claude Code's extension layer](https://code.claude.com/docs/en/features-overview) assigns separate jobs to persistent instructions, skills, MCP, subagents, hooks, and plugin packages. | The inspected [Codex operating account](https://openai.com/index/running-codex-safely/) centers managed rules, execution policy, network policy, and logs rather than one universal plugin claim. |
| Context | An append-only event stream supports resume, fork, search, and replay. | `CLAUDE.md` supplies persistent context, while skills load task-specific material and subagents isolate their own work. | The inspected source establishes managed configuration and agent-native logs; it does not document a DeepSeek-style public event stream. |
| Action boundary | Tools and policy points sit inside a replaceable runtime, which leaves operators responsible for the mounted configuration. | Hooks can run at lifecycle events, and MCP connects external systems; each extension enters execution differently and carries its own context cost. | Sandboxing defines writable paths and network reach, while approval policy decides when an action must stop for review. |
| Main tradeoff visible in the sources | Broad replaceability and trace inspection, paired with preview-stage compatibility risk. | Purpose-specific extension surfaces, paired with context and connection management. | Clear deployment controls, paired with policy choices that can add friction or widen authority. |

Claude Code's documentation is revealing because it does not treat every extension as the same thing. Persistent instructions, on-demand skills, isolated subagents, external MCP connections, and deterministic hooks have different context costs and failure modes. A large undifferentiated prompt would hide those distinctions.

OpenAI's Codex account makes another layer visible: the sandbox sets technical limits on writes and network use, while approval policy controls when work crosses those limits. Managed configuration and logs make those choices inspectable. A model may propose an identical shell command in two Codex deployments and still face different consequences because the harness grants different authority.

## What the plugin idea gets right

Replaceability shortens the distance between a diagnosis and an experiment. A team that suspects tool formatting can swap or wrap the tool adapter. A team investigating context loss can inspect session assembly without replacing the model provider. DeepSeek's model adapter being a plugin also allows the same surrounding system to test several backends without pretending their tool-call habits are identical.

An attributed account on X shows the kind of repair this makes possible. Ahmad Awais [described recurring tool-input shape errors](https://x.com/MrAhmadAwais/status/2050956678502420612) across several open models, then added a validator-guided repair path that touched only fields named by schema errors. The post reports better internal results after that change, but it does not publish the task set or logs. The benchmark claim therefore remains unverified; the concrete engineering lesson does not. A harness can translate between a model's learned output habits and the exact contract a tool expects.

Traceability offers a second benefit. A failed final answer says little about whether the model misunderstood the task, received stale context, misread a tool error, lost state, or stopped too early. Execution records make those hypotheses separable. They also make regression tests possible after a model or plugin change.

Armin Ronacher's [early reaction](https://x.com/mitsuhiko/status/2088189145952731317) captured the architectural appeal without turning it into a verdict: he called DeepSeek Harness imperfect, yet said it prompted him to revisit some design choices. That is a useful social signal from a framework author, not performance evidence.

## More seams mean more ways to fail

An all-plugin system exchanges a fixed internal design for a dependency graph that someone must operate. Plugin versions can disagree. A provider adapter can drift from a model API. A tool can return a technically valid object that the loop interprets badly. Hot replacement also needs lifecycle cleanup to work exactly as intended.

DeepSeek does not hide the maturity boundary. The [repository README](https://github.com/deepseek-ai/deepseek-harness) labels the release a developer preview and warns of compatibility-breaking changes. One of the authors repeated that warning in the [launch discussion](https://news.ycombinator.com/item?id=49285244). Composability can isolate a change without making the surrounding ecosystem stable by declaration.

Security becomes an execution-layer problem as soon as an agent reads untrusted content and can call sensitive tools. A Tencent Zhuque Lab research team tested one DeepSeek Harness revision in [14,560 controlled indirect-prompt-injection runs](https://arxiv.org/abs/2608.16393). Its rule-based judge marked 5.6% as full attack success, while its semantic judge marked 5.3%; some attack and carrier combinations ran higher. The study used one model backend, one persona, controlled local fixtures, simulated sinks, and a specific source snapshot. Those constraints prevent a general claim about every deployment, but the result supports a firm design requirement: plugins that admit content and plugins that perform sensitive actions need runtime policy between them.

Observability carries its own burden. An append-only record aids debugging, but a deployment still needs retention rules, access controls, redaction, and a clear distinction between runtime-visible reasoning and private provider state. That operational cost follows from the data the harness keeps; the model card cannot settle it.

## The useful unit is the pair

The title holds when “important” means decisive for a running agent rather than inherently more intelligent. A model supplies planning and judgment. The harness supplies the available world: context, tools, feedback, memory, limits, recovery, and proof of work. Weakness in either side can cap the pair.

DeepSeek's “Everything is a plugin” design makes that dependency hard to overlook. It also exposes the price of the idea. Replaceable parts invite faster experiments and clearer traces, while adding contracts, versions, policy decisions, and more runtime code to trust. Claude Code and Codex draw their seams elsewhere, yet both products document extension or execution layers that change what the same model can safely accomplish.

The next useful comparison is not another model-only leaderboard. Readers can take a fixed task set and one model, then run two harness configurations under the same token budget, timeout, tool permissions, and validators. [Harness-Bench](https://arxiv.org/abs/2605.27922) and [The Scaffold Effect](https://arxiv.org/abs/2607.22585) provide starting protocols; DeepSeek's [architecture record](https://github.com/deepseek-ai/deepseek-harness/blob/master/docs/architecture.md) shows which parts can actually change. That experiment turns a slogan into an engineering decision.
