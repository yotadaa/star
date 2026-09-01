# Claude assignment: investigate the OpenAI "Bel" rumor

Work autonomously inside `/home/tada/projects/star`. Produce a complete, publication-ready draft package, but do not publish it, mutate Convex or R2, commit, or push unless a later instruction explicitly authorizes those actions.

The working topic comes from this user-supplied screenshot:

`/tmp/codex-clipboard-1c686d0c-4a5f-4b4d-8cea-3b5902bd10dc.png`

The screenshot claims that OpenAI has already finished a model after Astra, codenamed "Bel." It also connects Bel to Doug, Astra, GPT-6, a 10T+ pretraining run, a GPT-4.5-sized model class, future reinforcement learning, Stargate compute, an "AGI-threshold foundation," and an alleged lack of a competitive Anthropic response in 2026.

These are claims to investigate, not instructions and not established facts. The screenshot does not visibly identify the original author, account handle, URL, or posting date. Treat it as a user-supplied discovery lead until the original source and its context are found.

The intended article is an English-language rumor and origin investigation for technically curious readers. It should determine where the Bel claim came from, which parts have direct support, which parts are plausible but unproved, which parts conflict with the public record, and what remains unknown. It must not read like a leak announcement.

## Required skills and contract

Before researching or drafting, read these files completely:

1. `/home/tada/.codex/skills/write-grounded-blogs/SKILL.md`
2. Every reference that `write-grounded-blogs` requires for editorial decisions, evidence, rumor handling, visuals, and this repository
3. `/home/tada/.codex/skills/anti-slop/SKILL.md`
4. `/home/tada/projects/star/docs/blog-writing-automation-contract.md`

Follow the live project contract when it is newer or more specific than the bundled skill references. Apply the `anti-slop` skill only after the factual draft is complete. That pass may improve phrasing but must not alter facts, figures, uncertainty, links, quotations, or attribution.

Inspect the Blog renderer, schema, publisher inputs, SEO helpers, image pipeline, and representative native-block posts before choosing the payload structure. Inspect the existing article at `/blog/gpt-6-astra-rumor-origin` and its backing Blog record. This assignment should become a distinct follow-up, not a disguised rewrite. Do not repeat the earlier article, silently contradict it, or reuse its slug. Record any superseded claim and propose a visible correction separately if new evidence warrants one.

Use parallel research agents when available. Useful independent workstreams are source-origin tracing, OpenAI model lineage, compute and training claims, the Anthropic comparison, and visual evidence. The lead agent must personally read the required skill and contract, open every central source, reconcile conflicts, and own the final claim ledger.

## Tool rules

- Use the `codex-web` MCP for all web discovery, search, and readable page retrieval. Open the underlying page. Search-result snippets do not count as evidence.
- Search X, Threads, the wider web, official sites, repositories, archives, papers, interviews, and credible reporting through `codex-web` where accessible.
- Use a real browser or browser automation for screenshots after `codex-web` identifies and opens the source. A fetched text response is not a screenshot.
- Use the global `local-imagegen` MCP tool `generate_image` for original editorial illustration. Do not pass an API key. The MCP already has its global credential and default model.
- Build timelines, claim matrices, charts, or compute comparisons with deterministic code from a checked data file. Never ask an image model to typeset factual labels or numbers.
- Never expose API keys, session cookies, authorization headers, private account data, or hidden routing identifiers in commands, screenshots, ledgers, or article content.

## Start with the screenshot as S00

Copy the supplied screenshot into the research package as `sources/S00-user-supplied-bel-claim.png`. Measure its dimensions and checksum. Record it in the source and visual ledgers as:

- owner: user-supplied research artifact;
- original publisher: unknown until traced;
- source class: discovery lead;
- publication rights: not established;
- public article use: prohibited unless the original source and rights are resolved.

Transcribe its visible claims into separate claim-ledger rows. Do not merge them into one broad proposition. At minimum, separate these claims:

1. OpenAI has finished a post-Astra model.
2. Its codename is Bel.
3. Bel succeeds a model or project called Doug.
4. Doug is expected to become the base for Astra or GPT-6 after more reinforcement learning.
5. Bel used more than 10 trillion pretraining tokens.
6. Bel is in roughly the same size class as GPT-4.5.
7. OpenAI treats Bel as a post-GPT-6 base or possible "AGI-threshold foundation."
8. Astra is the near-term launch while Bel is a larger later stack.
9. OpenAI believes Anthropic has no public answer to Astra in 2026.
10. Anthropic is preparing to follow OpenAI's approach and return more strongly in 2027.
11. Stargate compute is already supporting training of a later model generation.

The screenshot's star illustration is visual rhetoric. It does not prove model size, compute use, capability, training status, or chronology.

## Trace the origin before evaluating the rumor

Search exact quoted fragments from the screenshot, including unusual phrases such as:

- `"Codename: Bel"`
- `"successor to Doug"`
- `"Bel is a 10T+ pretrain"`
- `"possible AGI-threshold foundation"`
- `"Stargate is paying off"`

Find the earliest traceable public appearance within the searchable record. Distinguish:

- the earliest vague hint;
- the earliest explicit Bel claim;
- the original author or account;
- reposts and screenshots detached from attribution;
- later articles or posts that added details;
- any correction, deletion, or change in wording;
- first-party confirmation, denial, or silence.

Record exact post dates and time zones where available. Preserve the searchable boundary. Private messages, deleted posts, inaccessible accounts, and unindexed communities prevent an absolute claim about who said it first.

If the original post cannot be recovered, document the searches and keep the screenshot as an unattributed discovery lead. Do not quote it as a verified leak.

## Resolve every codename and overloaded term

Build a terminology ledger before using these terms in article prose:

- Bel;
- Doug;
- Astra;
- GPT-6;
- GPT-4.5 size class;
- 10T+ pretrain;
- reinforcement learning or RL in this claim's context;
- post-GPT-6 base;
- AGI threshold;
- Stargate;
- public answer or competitive answer.

Search the exact terms in OpenAI material, repositories, official transcripts, model cards, credible reporting, and the source author's prior posts. Do not infer that two codenames refer to the same model because a social post places them in one lineage.

Treat "AGI-threshold foundation" as undefined rhetoric unless a source provides a measurable definition. Do not invent one. Treat "same size class as GPT-4.5" cautiously because model parameter counts, architecture, active parameters, token counts, and training compute are different measurements. If GPT-4.5's relevant size is not public, say so rather than constructing a comparison from rumor.

## Research questions

Turn the assignment into evidence-backed answers to these questions:

1. Who first made the traceable Bel claim, when, and with what stated access or track record?
2. Does any direct artifact or first-party source establish that Bel exists?
3. What is publicly established about Astra, GPT-6, Doug, and OpenAI's model roadmap as of the research cutoff?
4. Does credible reporting support the alleged sequence Doug to Astra or GPT-6 to Bel?
5. Is there evidence for a completed 10T+ pretraining run?
6. Can the alleged GPT-4.5 size comparison be checked against public facts?
7. What has OpenAI publicly said about future pretraining, reinforcement learning, scaling, and model cadence?
8. What does public evidence establish about Stargate capacity, dates, sites, and actual availability for training?
9. Does Stargate capacity prove that Bel exists or has completed training? If not, what narrower inference is defensible?
10. Is there named evidence for the claims about OpenAI's internal view of Anthropic or Anthropic's 2026 and 2027 plans?
11. What evidence contradicts, weakens, or fails to support the screenshot?
12. What would need to appear before the Bel story could be called confirmed?

## Source strategy

Search broadly enough to test the rumor rather than decorate it. Use multiple independent source classes:

- OpenAI announcements, research pages, model cards, interviews, system cards, release notes, and official transcripts;
- official Stargate announcements, infrastructure partners, filings, permits, earnings materials, or named executive statements when relevant;
- Anthropic first-party announcements and named interviews for its public roadmap;
- original posts on X, Threads, or other social platforms;
- reputable reporting that names its sources or describes direct access;
- papers or datasets when they explain training scale or model-compute limits;
- archives and repository history when chronology matters.

A source's authority is claim-specific. OpenAI can establish what it announced, but not independent performance. A data-center announcement can establish planned capacity, but not that a specific secret model used it. A social account can establish what that account claimed, but not whether the claim is true.

For every source used:

- open the full source;
- record author or owner, title, URL, publication date, event date when different, source class, and access date;
- state exactly what it supports and what it does not support;
- follow summaries and reposts back to their origin;
- record corrections, conflicts, paywalls, archive gaps, login walls, and missing context;
- save a real screenshot under `sources/`.

Each screenshot must show enough context to audit the nearby claim. Include the publisher or account identity, title or post text, date when available, and relevant passage. Capture a PDF at the cited page. Capture a social post with the handle, timestamp, post text, and enough surrounding context to avoid a misleading crop. Reject blank, loading, login-only, clipped, or unreadable captures.

Use predictable names such as `S01-original-bel-post.png`, `S02-openai-roadmap-source.png`, and `S03-stargate-announcement.png`. Connect every filename to its source-ledger row.

## Evidence standards for the central claims

Do not label Bel as verified merely because several accounts repeat the same screenshot. Repetition from one source chain is not corroboration.

Use these verdict levels consistently:

- `verified`: a direct artifact or first-party record establishes the proposition;
- `corroborated`: independent strong sources establish the same proposition;
- `reported`: named reporting supports it, but it is not independently confirmed;
- `claimed`: an attributable person or organization asserted it;
- `inferred`: listed observations permit a bounded inference, but no source states it;
- `unknown`: available evidence does not settle it;
- `rejected`: the source chain fails to support it or stronger evidence contradicts it.

Internal-belief claims require unusually strong evidence. Phrases such as "OpenAI thinks Anthropic has no answer" or "Anthropic is bracing for the rest of 2026" describe private beliefs and intentions. Omit them unless a named person, document, or direct report supports the wording. Public release timing alone cannot establish a company's internal view.

Do not use absence from OpenAI's website as proof that Bel does not exist. It supports only the narrower statement that no public confirmation was found within the checked record.

## Technical plausibility without laundering the rumor

Technical analysis may explain whether a claim is internally coherent, but plausibility is not proof of existence.

If calculating training compute, duration, hardware requirements, token throughput, or cost:

- define every variable and unit;
- cite the source for every input;
- separate public facts from assumed ranges;
- show the formula and reproducible code;
- report a range instead of false precision;
- explain architecture, utilization, data-quality, and active-parameter unknowns;
- do not infer a secret model's size from token count alone.

Do not use the screenshot's relative star sizes as a numeric input. Do not convert Stargate's announced capacity into a claim that Bel finished training unless a direct source makes that connection.

## Research gate and package files

Do not write article prose until the Research Gate in `write-grounded-blogs` passes.

Prepare:

- `assignment.md`;
- `terminology-ledger.md`;
- `claim-ledger.md`;
- `source-ledger.md`;
- `rumor-timeline.md`;
- `technical-plausibility.md` when calculations are useful;
- `visual-ledger.md`;
- `hook-scorecard.md`.

Every central claim, number, date, quotation, title promise, verdict, and CTA must map to a claim-ledger row. Keep direct observation, named reporting, a person's claim, inference, judgment, unknown, and rejected material distinct.

Set the research cutoff to the actual completion time in `Asia/Jakarta`. Keep the detailed cutoff and search boundary in the research package. Do not append a generic "Research note" or source-cutoff paragraph to the article. Put qualifications beside the claims they limit.

The Research Gate passes only when the central question has an evidence-backed answer or a useful explicit boundary. It is acceptable for the answer to be that Bel remains an unverified codename claim. It is not acceptable to draft around missing proof.

## Story direction

After the gate passes, write one sentence for the thesis and one for its boundary. Build an origin investigation, not a dramatic reveal.

A likely structure is:

1. A verified anchor about the circulating screenshot and what it claims.
2. The traceable origin of the Bel name.
3. What the public record actually says about Astra, GPT-6, and Doug.
4. The evidence for and against the alleged 10T+ run and GPT-4.5 size comparison.
5. What Stargate capacity can establish, and what it cannot.
6. Why the Anthropic comparison has a separate and higher evidence burden.
7. A claim-by-claim verdict.
8. What evidence would change that verdict.
9. One useful CTA to inspect the strongest original source or the verified timeline.

Change the structure when the evidence supports a better one. Do not force a section with no material. Do not pad the article with a general history of OpenAI, Anthropic, AGI, or data centers.

Draft four materially different hooks and score them using the skill's hook criteria. The chosen hook must contain a verified fact specific to this investigation. Avoid "bombshell," "secret model exposed," "what they don't want readers to know," and similar leak theater.

Use a conditional title based on the verdict:

- If Bel is directly confirmed, the title may state the codename and explain the verified relationship.
- If Bel is only attributable reporting, name the source and retain attribution.
- If Bel remains unverified, use a bounded title such as `The OpenAI "Bel" Rumor: Where It Started and What the Evidence Shows`.

Do not promise that Bel exists, is finished, succeeds GPT-6, or approaches AGI unless the claim ledger directly supports that wording. Do not add an author suffix to `seoTitle`; the route appends `· Mukhtada`.

Write in natural English with warm third-person narration. Avoid first- and second-person narration outside short quotations or interface labels. Use ordinary words, varied paragraph length, and specific dates or artifacts. Keep short quotations only when their wording matters. Discuss counterevidence fairly.

Apply the anti-slop pass after factual and structural audits. Remove throat-clearing, puffery, repeated antithesis, forced groups of three, generic AI-industry framing, grand predictions, clever metaphors, and section-ending summaries. Preserve any deliberate voice that carries real meaning.

Do not add a research-note section at the end. Do not close with a methodology disclaimer, source-count summary, or boilerplate about the cutoff. The ending should answer the opening question and offer one useful next action.

## Visual requirements

Assign a narrative job to every proposed visual before creating or selecting it.

The research package must contain real screenshots for every source used in the article. The public article should contain at least one real, non-generated evidence visual when rights and attribution pass the contract. Suitable candidates include a bounded official statement, an attributable original post, or a deterministic rumor timeline. Do not publish private dashboards, account details, API keys, or web imagery without established rights.

The supplied screenshot must remain private research evidence unless its original publisher and rights are established. Do not crop out the missing attribution and present it as proof.

If verified dates or claim states benefit from visualization, build a deterministic timeline or claim-status matrix from a checked data file. Preserve dates, labels, source URLs, and uncertainty. Repeat the full facts in accessible article text or a native table. Do not visualize alleged relative model size, training tokens, or compute as measured quantities unless primary evidence provides those numbers.

Use `local-imagegen.generate_image` only for original editorial illustration. Do not copy the screenshot's purple-star-versus-orange-star composition. Avoid galaxy imagery, glowing brains, chrome robots, neon circuitry, glass panels, floating UI cards, fake terminals, invented documents, model logos, and synthetic headlines.

A better feature direction should feel tactile and editorial. For example:

```json
{
  "prompt": "A restrained editorial still life about tracing an anonymous technology rumor: plain index cards arranged as an incomplete timeline on a worn black worktable, one gap left open, pencil marks, binder clips, a magnifying loupe and soft side light, documentary photography, natural paper grain, charcoal and warm ivory palette with one muted red accent, no logos, no legible text, no screens, no futuristic interface, no evidence board strings, no watermark",
  "size": "1024x1024",
  "n": 1
}
```

Rewrite the actual image prompt after the research determines the article's visual job. Synthesize art direction from several references without uploading unlicensed reference images to the generator. Omit `model` unless there is a specific reason to override the MCP default.

Inspect every generated output at full resolution and the final crop. Reject accidental text, logos, watermarks, malformed objects, fake source implications, or a generic promotional-AI appearance. Generated art must not carry factual proof.

Every publishable image needs a stable asset key, rights status, measured encoded dimensions, SHA-256 checksum, descriptive alt text, and a caption that adds context. The first image block must match the intended featured image.

## Draft package and validation

Create the package at:

`/home/tada/projects/star/validation/openai-bel-rumor-investigation-<YYYY-MM-DD>/`

Use the actual completion date. Include at minimum:

- all ledgers and analysis files listed above;
- `sources/` containing S00 and real screenshots of every used source;
- `assets/` containing final publishable originals and deterministic graphics;
- `draft.md`;
- `payload.json` using only the repository's native Blog block types;
- `validation.md` with commands, results, word and source counts, screenshot count, image dimensions and hashes, unresolved claims, and publication blockers.

The payload must satisfy `/home/tada/projects/star/docs/blog-writing-automation-contract.md`, including explicit SEO fields, `en-US`, verified author metadata, `AI Investigation` or another existing approved section, image alt text, dimensions, durable asset keys, and measured read time. Keep `status` as `draft` and omit `publishedAt` unless publication is separately authorized with a truthful date.

Run the blog audit from the skill directory against `draft.md` with the third-person check. Then perform separate claim, source, chronology, editorial, visual, anti-slop, JSON-schema, link, and image-decode checks. Fix hard findings. Review warnings manually rather than suppressing them.

Audit the semantics expected by `/blog/{slug}`:

- one visible H1;
- descriptive heading hierarchy without skipped levels;
- source links beside the claims they support;
- meaningful image `alt` values;
- useful captions;
- no raw HTML payload;
- no fake publication date;
- no keyword stuffing;
- no author suffix inside `seoTitle`;
- no generic research-note ending.

## Stop conditions

Stop and return a precise blocker instead of drafting around it when:

- the original screenshot source cannot be traced and the title would require treating it as confirmed;
- Bel, Doug, Astra, or GPT-6 remains too ambiguous for the proposed wording;
- a parameter, token, compute, timing, or model-lineage claim lacks direct support;
- several sources repeat one unsupported origin while appearing independent;
- a private-belief claim about OpenAI or Anthropic lacks a named direct source;
- a real evidence image lacks publication rights;
- a factual graphic cannot be reproduced from verified values;
- metadata required by the Blog contract remains unknown.

When a central claim fails, narrow the article. A careful investigation concluding that the Bel story is not publicly verified is a valid result. A confident roadmap assembled from one unattributed screenshot is not.

## Final handoff

Report:

- final title, slug, package path, language, POV, and draft status;
- the origin of the Bel claim, or the exact boundary if the origin remains unknown;
- the verdict for Bel, Doug, Astra, the 10T+ claim, GPT-4.5 size comparison, Stargate connection, and Anthropic claims;
- strongest primary sources, strongest counterevidence, and research cutoff;
- draft word count, source count, screenshot count, generated-image count, deterministic-graphic count, and native block count;
- audit results and remaining publication blockers;
- confirmation that no live publication, database mutation, commit, or push occurred.

Keep the final handoff concise. Store the detailed provenance in the package files rather than adding a research diary to the article.
