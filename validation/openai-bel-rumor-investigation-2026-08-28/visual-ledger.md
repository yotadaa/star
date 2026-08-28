# Visual ledger

| ID | Narrative job | File / source | Type | Dimensions | SHA-256 | Asset key | Rights / public-use status | Alt text | Caption |
|---|---|---|---|---:|---|---|---|---|---|
| V00 | Preserve the user's starting artifact | `sources/S00-user-supplied-bel-claim.png` | supplied screenshot | 480×791 | `6f4484fa88fccf301775e9b6f95dc35b612d924ff039edb3ad321abbe4506cf4` | none | Private research only; original publisher/date and rights were absent from the crop | n/a | n/a |
| V01 | Establish a quiet visual metaphor for a source chain that stops before confirmation | `assets/feature-bel-source-gap.png` | original generated editorial photograph | 1672×941 | `e1d7065432681df2f52c1329b990926afeac9ed3f3b05c11ce838f009d9af1cf` | `blog:openai-bel-rumor-one-source-no-confirmation:feature-source-gap` | Original generated asset; publishable for this article | Five blank ivory index cards form a broken sequence on a worn black worktable beside binder clips, a brass magnifying loupe, and a red pencil in soft window light. | Original editorial illustration: the visible gap represents the missing evidence between one social claim and a confirmed OpenAI roadmap. |
| V02 | Show the exact source wording, attribution, date, and engagement without treating it as proof | `assets/evidence-original-bel-post.jpg`, cropped without content alteration from `sources/origin/01-synthwavedd-bel-scoop.png` | real browser evidence capture | 1265×500 | `38b78d175d67d6caf95639faa1f67a9632b6f9a77e3b28ea519ff2d466cc2308` | `blog:openai-bel-rumor-one-source-no-confirmation:evidence-original-bel-post` | Bounded, attributed evidentiary quotation approved for publication by the project owner on 28 August 2026 | X post by leo at @synthwavedd dated 26 August 2026, claiming an OpenAI pretrain named Bel with more than 10 trillion parameters and an alleged Doug, Astra, GPT-6, and Anthropic relationship. | The earliest explicit public Bel claim found. The screenshot proves what one account posted, not that OpenAI completed the described model. |
| V03 | Let readers scan each central verdict without converting rumor into a scale chart | `assets/claim-status-matrix.png`, generated from `assets/claim-matrix-data.json` by `assets/build-claim-matrix.mjs` | deterministic factual graphic | 1600×1080 | `a82f133c20d6be297a44a43ba4b835a8a4a2be11aaa66d332d574bc4da247862` | `blog:openai-bel-rumor-one-source-no-confirmation:claim-status-matrix` | Original project graphic; publishable | Claim-status matrix showing Astra and Stargate training as verified, Bel and its 10-trillion-parameter scale as claimed, the Doug lineage as unknown, the GPT-4.5 comparison as not checkable, and the Bel-Stargate and Anthropic claims as unsupported. | The public record confirms Astra and real training infrastructure. Every connecting arrow to Bel still depends on one social source. |

## Generated feature prompt

> Create a landscape editorial feature photograph for an evidence-based
> technology investigation about tracing an unverified model rumor. Scene: an
> overhead three-quarter view of a worn charcoal-black editorial worktable with
> several small warm-ivory index cards arranged in a short incomplete sequence;
> one deliberate empty space breaks the chain. Include a red carpenter pencil,
> two plain black binder clips, a small brass magnifying loupe resting near the
> gap, and faint erased graphite marks and paper scuffs. The cards must be blank
> or contain only illegible soft graphite texture—absolutely no readable
> letters, numbers, logos, company names, headlines, screens, documents,
> strings, pushpins, maps, charts, model diagrams, robots, brains, galaxies,
> stars, neon, glass UI, or futuristic circuitry. Documentary still-life
> photography, believable natural materials, subtle imperfections, quiet
> newsroom mood, soft side light from a real window, charcoal/warm ivory palette
> with one muted red accent, restrained contrast, shallow but sufficient depth
> of field, no dramatic cinematic glow. Composition should leave calm negative
> space for a blog header crop and feel handmade and editorial rather than
> glossy advertising. 16:9 landscape, no border, no watermark.

The native `imagegen` output was inspected at 1672×941. No readable accidental
text, logo, watermark, malformed object, fake source, or star/galaxy motif was
found. The source file remains at
`/home/tada/.codex/generated_images/01a0466e-91d8-7462-9c32-36b0f322c4ae/exec-6926764d-f719-43c6-a1c2-e4e38f9918c8.png`.
