# Six Evidence-Based Blog Articles — 2026-08-24

## Output contract

- Reader: developers, technical operators, and product builders who need a decision rather than a trend recap.
- Language and voice: English, warm third-person prose, no first- or second-person narration outside short source quotations or UI labels.
- Research cutoff: 24 August 2026, 23:59 Asia/Jakarta. Volatile claims must carry event and publication dates.
- Article forms: technical investigation or technical explainer, chosen per topic after research.
- Publication target: native Convex Blog blocks, explicit SEO data, durable image identities, `/blog/{slug}` route, and the existing `· Mukhtada` title suffix.
- Author: Mukhtada Billah NST using the repository's first-party author record.
- Status: each topic remains a draft until its individual Research Gate passes. A topic that still has an unresolved central claim or media-rights issue will not publish.
- Git: this request authorizes article creation and live Blog publication after the gates pass, but does not request a commit or push.
- Dependencies and visual tokens: no new dependency and no new color token.

## Source and screenshot policy

- Each article must use multiple independent sources and include both supporting and contrary evidence.
- The source order is direct artifact/paper, first-party documentation, primary reporting/research, firsthand social post, then secondary context.
- Every opened source gets a traceable browser screenshot in that article's `validation/<slug>/sources/` folder, plus URL, owner, access date, and the exact claim it supports.
- X, Threads, and other social posts count only when the original dated post is open and attributable. Search snippets, reposts, and screenshots without a reachable origin remain discovery leads.
- The user explicitly requested evidence images in the articles. Essential cropped source captures may therefore appear as attributed source-evidence blocks when they show the fact under discussion; the remaining source screenshots stay in the private research package. No full article copy, unrelated personal data, or decorative collected image may be published.
- Each article receives original feature art. Supporting generated art is optional and cannot imitate a real UI, document, person, benchmark, or event.

## Parallel workflow

Four research lanes run at once. Child agents write only inside their assigned research/validation folders; they do not edit shared manifests, publisher scripts, seed inputs, or live Convex data. The root agent reviews each Research Gate and performs all shared integration.

Initial wave:

1. Harness versus model, including DeepSeek Harness and “everything is a plugin.”
2. Bid-for-ad-slot websites, including `outbid.lol`, `flappybid.lol`, and other verified forms.
3. Xiaomi XRING O3.
4. Why 100 Agent Skills Can Be Worse Than 5.

Dynamic follow-up wave, assigned to the first available child agents:

5. Changing an AI model or reasoning level mid-session and prompt-cache cost.
6. Does `/compact` Secretly Make Claude Code Worse?

## Required package per topic

- `assignment.md`: reader question, thesis under test, possible disproof, source targets, cutoff, and CTA target.
- `terminology-ledger.md`: every ambiguous term, accepted meaning, primary source, rejected alternatives, and article wording.
- `claim-ledger.md`: claims, exact source locations, class, dates, status, conflicts, and planned use.
- `source-ledger.md`: every opened source and its screenshot path.
- `visual-ledger.md`: evidence captures and original-art direction, rights status, alt, caption, dimensions, checksum, and asset key.
- `hook-scorecard.md`: contradiction, concrete moment, consequence, and answer-first hooks scored against the grounded-blog rubric.
- `draft.md`: English third-person article with pros, cons, uncertainty boundary, descriptive links, and one earned CTA.
- `payload.json`: supported native blocks and complete editorial metadata; status stays `draft` until review.

## Topic acceptance criteria

### 1. The Harness Is Becoming More Important Than the Model

- Locate the original DeepSeek Harness repository/documentation and the exact “everything is a plugin” wording or reject that wording if the source does not say it.
- Compare at least two other agent harnesses or coding-agent systems through first-party architecture/tooling sources.
- Separate model capability from orchestration, tools, context management, verification, permissions, and portability.
- Cover gains and costs: repeatability, model substitution, observability, lock-in, complexity, attack surface, and maintenance.

### 2. The Internet Is Auctioning Its Ad Slots One Bid at a Time

- Verify `outbid.lol`, `flappybid.lol`, and at least two other distinct implementations or narrow the scope if examples cannot be traced.
- Establish chronology from direct sites, archived pages, domain/project artifacts, or attributable social posts; avoid calling the phenomenon broadly “trending” without measurable evidence.
- Compare auction mechanics, permanence, moderation, payment rails, fraud/spam risk, advertiser value, owner incentives, and novelty decay.

### 3. Xiaomi XRING O3

- Resolve the product name and generation from Xiaomi first-party material; record any mismatch between “O3” and official naming.
- Use first-party specifications plus independent technical reporting or analysis for manufacturing, CPU/GPU/modem, device integration, performance, and supply-chain claims.
- Separate announced specifications, tested behavior, analyst inference, and unverified roadmap claims.
- Cover strategic upside and costs: integration, differentiation, efficiency, modem/dependency limits, process-node economics, software tuning, and export/supply risk.

### 4. Why 100 Agent Skills Can Be Worse Than 5

- Open and inspect arXiv `2608.14036`, its PDF/method, author artifacts if available, and independent related work.
- Verify the 8,135-trial count and the reported 29.6% versus 3.3% retrieval precision directly from the paper before using them.
- Explain retrieval precision, procedural anchors, experimental setup, limits, and whether the result generalizes beyond the tested agents/tasks.
- Cover the value of broad skill libraries as well as retrieval noise, naming collisions, context cost, maintenance, and routing remedies.

### 5. Changing an AI Model Mid-Session Can Cost More Than Staying on the Expensive Model

- Open Anthropic's current session-value guidance and current prompt-caching documentation.
- Distinguish documented cache invalidation from a measured billing outcome; benchmark only configurations available in the local authorized environment.
- Compare model switches and reasoning-effort switches against a fixed task, fresh-session control, stable-model control, and explicit handoff.
- Report cache reads/writes, tokens, elapsed time, quality differences, and measurement limits; do not promise savings without observed data.

### 6. Does `/compact` Secretly Make Claude Code Worse?

- Open Anthropic's current models/usage/limits guidance and the official `/compact` and `/clear` documentation or help output.
- Test one controlled multi-stage repository task under auto-compact, manual `/compact`, fresh sessions, and explicit handoff documents when the environment supports a valid comparison.
- Define what “worse” means before testing: instruction retention, factual recall, code correctness, rework, tokens, elapsed time, and handoff omissions.
- Present benefits alongside losses: continuity and reduced context pressure versus lossy summaries, stale assumptions, hidden omission, and accumulated task drift.

## Integration and publication gate

For each topic, the root agent must:

1. Reopen the strongest sources and inspect every source screenshot.
2. Reject or relabel unsupported ledger rows before editing the draft.
3. Run the grounded-blog audit and the banned-language scan.
4. Generate and inspect original feature art; select only source captures that carry essential evidence.
5. Convert the approved draft to native blocks, measure every image, and add the SEO/image manifest entries.
6. Add one idempotent publisher, update the deterministic seed, and run the publisher twice to prove reuse.
7. Run typecheck, seed build, global Blog data/image audits, and production build.
8. Render the live article at desktop, 375 px mobile, keyboard focus, and reduced motion; inspect title, canonical, structured data, image decode, tables, links, and overflow.
9. Record the results and any deferred issue in the article's validation folder and `TASKS.md`.

## Status

`research-in-progress`
