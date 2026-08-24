# DeepSeek Harness Stuck Installation Blog

## Output contract

- Intended reader: Linux/zsh users whose `npx @deepseek-ai/dsh web` run appears
  to stop after the installation prompt, and maintainers who need to distinguish
  package-runner trouble from later profile/plugin failures.
- Reader question: what did the captured troubleshooting session actually fix,
  how can the working command be exposed as `dsh`, and what remains unproven?
- Article type: evidence-led technical troubleshooting case study.
- Language and voice: warm English prose, third-person narration, no first- or
  second-person narration outside source titles or exact UI text.
- Research cutoff and publication date: 2026-08-24 (Asia/Jakarta).
- Required output: native Blog blocks, a published Convex row, deterministic
  seed preservation, original generated editorial art, supplied user-owned
  terminal evidence, and rendered desktop/mobile validation.
- Publishing system: `blogPosts` native blocks through the authenticated Convex
  bridge; images stored by durable `storageId` plus stable `assetKey` and resolved
  to delivery URLs only at read time.
- Authorization: the user requested a Blog entry and explicitly asked that the
  referenced publication workflow be followed. No push is authorized.

## Research questions

1. What command does DeepSeek Harness officially document, and how stable is the
   product contract?
2. What do `npx` and `pnpm dlx` promise, and what does the captured output prove
   about the stalled run?
3. Why does a `pnpm dlx` success not create a permanent `dsh` executable?
4. What does the wrapper solve, and what risks come with `@latest` versus an
   exact version?
5. How can bootstrap, profile, build-permission, and plugin-schema failures be
   separated so one successful layer is not mistaken for a complete repair?

## Terminology ledger

| Term | Accepted meaning | Evidence | Article wording |
|---|---|---|---|
| DeepSeek Harness / DSH | DeepSeek AI's open-source, plugin-based agent harness; the CLI package exposes the `dsh` binary. | Official repository README and `apps/cli/package.json` | Define once as “DeepSeek Harness (`dsh`)”. |
| `npx` | npm's command for running a binary from a local or remotely fetched package; absent packages are placed in npm's cache for execution. | npm CLI v11 documentation | “npm's temporary package runner”. |
| `pnpm dlx` / `pnx` | Aliases that fetch and hotload a package without adding it as a project dependency; an exact package version may be selected. | pnpm v11/v12 documentation | “pnpm's temporary package runner”. |
| profile | A named DSH composition stored below `$DSH_HOME/profiles/<name>` and assembled from bundles and patch layers. | Official DSH CLI reference | “persistent DSH profile”. |
| plugin tree | The composed set of bundles/plugins DSH loads after the CLI and profile are found. | Official DSH architecture and CLI reference | “profile/plugin boot layer”. |
| wrapper | A small executable shell script that forwards its arguments to another command using `exec ... \"$@\"`. | Local `/home/tada/.local/bin/dsh` artifact | “pinned command bridge”. |
| suspend | Job-control state entered by the terminal suspend character, normally Ctrl+Z; it does not terminate the process. | GNU Bash Job Control Basics | “suspended, not stopped permanently”. |
| `allowBuilds` | pnpm permission used for dependency lifecycle/build scripts; permission to run a script is distinct from the script succeeding. | Official DSH CLI plugin reference and captured log | “build permission, not build success”. |

## Claim ledger

| ID | Planned claim | Source and precise location | Class | Status | Conflict or limit | Article use |
|---|---|---|---|---|---|---|
| C01 | DSH officially documents `npx @deepseek-ai/dsh web` and labels the project a developer preview with compatibility-breaking changes expected. | [DeepSeek Harness README](https://github.com/deepseek-ai/deepseek-harness#readme), Run and Developer preview | first-party | verified | The documented `npx` route is not generally broken. | opening boundary |
| C02 | `npx` can fetch an absent package into npm's cache, place it on PATH for the executed process, and show a confirmation prompt. | [npm npx documentation](https://docs.npmjs.com/cli/v11/commands/npx/), Description | first-party | verified | Documentation describes behavior, not the cause of this machine's stall. | mechanics |
| C03 | `pnpm dlx` is a `pnx` alias that fetches and runs a package without adding it as a dependency, and it supports exact versions. | [pnpm pnx documentation](https://pnpm.io/cli/pnx), lines 64-83 in the opened page | first-party | verified | Temporary execution does not promise a durable shell command. | mechanics |
| C04 | The first captured run accepted the install prompt, was suspended with Ctrl+Z, and a second run again appeared idle after `y`. | `docs/blogs/dsh-problem-stuck-installation/image-1.png`; `content.md:53-136` | direct user-owned artifact | verified | A screenshot cannot identify the resolver's internal blocking point. | concrete failure |
| C05 | Verbose npm output included successful registry HTTP 200 responses before the apparent stall. | `image-2.png`; `content.md:138-162` | direct user-owned artifact | verified | This rules out a total registry/DNS outage, not every network or dependency-resolution failure. | diagnosis boundary |
| C06 | On this machine, `pnpm dlx @deepseek-ai/dsh@latest web` moved beyond the earlier bootstrap barrier. | `content.md:164-200` | direct troubleshooting record | verified | It is one environment's result, not a benchmark of npm versus pnpm. | solution pivot |
| C07 | The active `/home/tada/.local/bin/dsh` forwards all arguments to `pnpm dlx @deepseek-ai/dsh@0.1.1-rc.2`; `command -v dsh`, `dsh --version`, and `dsh --help` succeed on 2026-08-24. | local wrapper plus direct command output captured during this task | direct artifact/measurement | verified | The wrapper is only as available as `pnpm` and its package/cache/network path. | central answer |
| C08 | The published CLI package exposes `dsh` through `lib/bin.js`, so forwarding arguments to its package runner reaches the same command surface. | [DSH CLI package manifest](https://github.com/deepseek-ai/deepseek-harness/blob/master/apps/cli/package.json), `bin` field | first-party | verified | This establishes the command mapping, not identical cache/performance behavior. | explanation |
| C09 | DSH profiles live below `$DSH_HOME/profiles`, and plugin commands operate in that persistent profile directory. | [DSH CLI behavior reference](https://github.com/deepseek-ai/deepseek-harness/blob/master/apps/cli/reference/README.md), Profile boot and Plugin management | first-party | verified | Current local profile contents differ from the historical failed snapshot; profile persistence is the claim, not unchanged contents. | persistence |
| C10 | Ctrl+Z normally suspends a foreground process and returns control to Bash; `jobs` displays active jobs. | [GNU Bash Job Control Basics](https://www.gnu.org/software/bash/manual/html_node/Job-Control-Basics.html) | primary documentation | verified | Ctrl+C handling can be application-specific, though DSH's current CLI reference documents graceful SIGINT handling. | cleanup note |
| C11 | The later failures occurred after DSH reached profile/plugin loading: three schema-validation failures, one missing package, and one missing build artifact. | `content.md:747-917`, `content.md:1059-1127` | direct troubleshooting record | verified historical | These entries are not present in the current profile manifest and must not be described as current failures. | layered diagnosis |
| C12 | DSH's current CLI reference says Git-hosted plugins that build during install may first require pnpm build approval; a successful approval can still be followed by an unrelated build failure. | Official DSH CLI reference, Plugin management; `content.md:500-573` | first-party + direct artifact | corroborated | The captured Open Design failure belongs to the historical source checkout, not a general DSH requirement. | plugin sidebar |
| C13 | The inspected Open Design source declares Node `~24`, while the captured machine used Node `v26.7.0`; its source build uses `tsx`. | [Open Design package manifest](https://github.com/nexu-io/open-design/blob/main/package.json); `content.md:451-499,919-938` | first-party + direct artifact | verified | Node mismatch and missing `tsx` were visible, but neither should be promoted into a proven single root cause for every install. | compatibility example |

## Research Gate

- Central answer: passed. A pinned executable wrapper reliably exposes the
  temporary `pnpm dlx` runner as `dsh` on the captured system.
- Uncertainty boundary: passed. The exact `npx` stall cause remains unknown;
  the workaround is machine-specific and does not disprove the official path.
- Source chain: passed. Central mechanics use local artifacts plus official
  DSH, npm, pnpm, Bash, and Open Design sources.
- Dates, labels, versions, and chronology: passed for the 2026-08-24 snapshot.
- Counterevidence: included. Official DSH still recommends `npx`, and the
  project explicitly warns that the developer-preview contract can break.
- Added synthesis: the article will separate four failure layers—shell job,
  package runner, DSH profile boot, and third-party plugin build/schema.

## Thesis and boundary

- Thesis: on this Linux/zsh setup, changing the temporary package runner to
  `pnpm dlx` crossed the stalled bootstrap, while a pinned wrapper supplied the
  stable `dsh` command that profiles and external tools expected.
- Boundary: the evidence does not reveal why npm's resolver appeared to stall,
  does not show that `npx` is generally defective, and does not turn later
  plugin incompatibilities into installation failures.

## Hook candidates

| Approach | Candidate | Anchor | Specificity | Tension | Relevance | Promise | Total |
|---|---|---:|---:|---:|---:|---:|---:|
| Contradiction | The command in DeepSeek Harness's own README reached the install prompt, accepted `y`, and then went quiet. On the same machine, another temporary runner crossed that boundary. | 2 | 2 | 2 | 2 | 2 | 10 |
| Concrete moment | Two DSH jobs sat in the shell at once: one running, one suspended after Ctrl+Z. The installer problem had quietly become a job-control problem too. | 2 | 2 | 2 | 2 | 1 | 9 |
| Consequence | A temporary runner can launch a CLI and still leave every external tool convinced the CLI is missing. That gap explained why a successful DSH bootstrap was not yet a usable setup. | 2 | 2 | 2 | 2 | 2 | 10 |
| Answer first | A 67-byte pinned wrapper solved the durable-command problem: `dsh` now forwards to the `pnpm dlx` route that worked. It did not solve the separate plugin tree. | 2 | 2 | 2 | 2 | 2 | 10 |

Selected opening: the contradiction hook, followed immediately by the
answer-first wrapper result and the uncertainty boundary.

## Visual reference ledger

| ID | Narrative job | Reference or owner | Visual lesson only | Rights status | Publish? |
|---|---|---|---|---|---|
| V01 | Show the captured stall | User-owned `image-1.png` | Large terminal field, sparse prompt, cursor as the focal point | user-supplied for this Blog task | yes, as evidence |
| V02 | Show that registry requests returned | User-owned `image-2.png` | Dense terminal lines, restrained cyan/green status accents | user-supplied for this Blog task | yes, as evidence |
| V03 | Establish DSH's plugin-world mood | Official DeepSeek Harness repository and Web UI references | Dark developer surface, modular panels, restrained technical density | first-party research reference | no |
| V04 | Establish package-runner friction | Image-search terminal-install references | Progress lines and one interrupted path, without copying any screen composition | third-party research reference | no |
| V05 | Explain the wrapper bridge | Mechanical dependency-tree editorial references | One clear bridge between a temporary package stream and a durable command socket | third-party research reference | no |

Generated art direction:

1. Feature image: a wide editorial still life of a dark terminal workbench with
   two abstract package routes, one stalled and one reaching a small brass command
   socket; warm mechanical pixel texture, ink/teal/amber palette, no logos, no
   legible text, no fake UI, crop-safe at 16:9.
2. Supporting image: a clean isometric command bridge, with ephemeral package
   modules flowing through a small executable relay into a stable terminal port;
   same palette, clearer negative space, no labels, metrics, logos, or source-like UI.

## Native article structure

1. Generated feature image.
2. Contradiction hook, answer, and explicit evidence boundary.
3. “The prompt was not the whole diagnosis” — supplied terminal images and
   job-control cleanup.
4. “Two temporary runners, one machine-specific result” — official semantics
   for `npx` and `pnpm dlx`.
5. “The wrapper made `dsh` discoverable” — pinned code, validation, and tradeoffs.
6. Supporting generated bridge illustration.
7. “A successful bootstrap can still fail later” — layer table and historical
   plugin examples, with no implication that they remain current.
8. “The durable lesson is to name the failing layer” — concise decision path.
9. Resolution and source-led CTA to the current DSH README/CLI reference.

### Task: Publish the DeepSeek Harness stuck-installation case study

- Sumber spesifikasi: user request; `docs/blogs/dsh-problem-stuck-installation/`;
  official DSH/npm/pnpm/Bash/Open Design sources; current Blog/Convex contract.
- Halaman/letak persis: new published entry at
  `/blog/deepseek-harness-npx-stuck-pnpm-dlx-wrapper`.
- Elemen & struktur: native Blog blocks (`paragraph`, `heading`, `image`,
  `list`, `code`, `table`, `divider`) rendered by `BlogPostRenderer`.
- Dependency baru dibutuhkan?: TIDAK.
- Token warna baru dibutuhkan?: TIDAK.
- Butuh konfirmasi data (rarity/medal/dsb)?: tidak; unknown root cause remains
  unknown and the historical/current profile boundary stays explicit.
- Acceptance criteria:
  1. The article directly answers what worked while stating that the exact
     `npx` root cause was not established.
  2. Officially documented behavior, local observation, inference, and
     historical plugin errors remain distinguishable.
  3. Prose is warm English in third person, with no first/second-person
     narration, fabricated motives, universal package-manager claim, or
     unsupported causal diagnosis.
  4. Two original generated images carry no factual burden; the two supplied
     screenshots are presented only as source evidence with useful alt text.
  5. All four images persist Convex `storageId` and stable `assetKey`; no local
     path or delivery URL is durably stored.
  6. Repeated publication reuses all four image checksums, updates one slug,
     and creates no duplicate Blog or file rows.
  7. The deterministic seed contains eleven Blog posts and remains byte-stable
     across repeated builds.
  8. Blog audit, claim/source/editorial/visual passes, Convex typecheck,
     production build, public readback, desktop/mobile image decode, code/table
     behavior, keyboard focus, and horizontal-overflow checks pass.
- Guardrail relevan dari §1: no new dependency, color token, fabricated data,
  emoji UI, blocking media, or horizontal overflow; preserve keyboard and
  reduced-motion behavior.
- Screenshot evidence: `validation/dsh-stuck-installation-blog-2026-08-24/`.
- Temuan triase (jika ada): no unresolved P0-P4 findings; details in
  `validation/dsh-stuck-installation-blog-2026-08-24/VALIDATION.md`.
- Status: done.

## Implementation sequence

1. [x] Inspect the supplied evidence, first-party sources, Blog renderer,
   Convex schema/bridge, image pipeline, seed builder, and prior publisher.
2. [x] Pass the Research Gate and select the bounded thesis and opening.
3. [x] Generate and visually inspect the two original editorial images.
4. [x] Draft native blocks, run the Blog audit, and complete four manual audits.
5. [x] Publish idempotently, add the eleventh deterministic seed row, and verify
   repeated image reuse/readback.
6. [x] Validate the rendered page at desktop and 375 px, fix P0-P2 findings,
   update `TASKS.md` and the decision log, and commit only this task.
