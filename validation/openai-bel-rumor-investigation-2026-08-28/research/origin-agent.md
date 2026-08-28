# Origin trace for the OpenAI "Bel" rumor

Investigation date: 2026-08-28

## Finding

The earliest public post I could trace is an X post by leo, `@synthwavedd`, published at `2026-08-25T19:00:01.229Z`, or 02:00:01 WIB on 26 August. It calls itself a "SCOOP" but provides no document, named source, benchmark, image, or official statement.

The screenshot supplied with the assignment matches a later post by Adit_Yah, `@Adidotdev`. Adit published it at `2026-08-26T00:08:16.853Z`, five hours and eight minutes after leo's post. Five seconds later, Adit replied `cc: @synthwavedd` and attached a screenshot of leo's post. That makes the Adit post a derivative retelling, not the first traceable source.

No matching page from OpenAI appeared in a focused `site:openai.com` search for both "Bel" and "Doug". This is a search boundary, not proof that no internal model exists. The rumor remains unconfirmed.

## Search method

I used the in-app Browser for all web discovery, page reading, and captures. I searched these exact or constrained phrases:

- `"OpenAI already finished the model after Astra"`
- `site:x.com/Adidotdev/status "Codename: Bel"`
- `"OpenAI recently finished its next pretrain"`
- `site:openai.com "Bel" "Doug" OpenAI`

X displays times in the viewer's local timezone. To compare X posts without locale drift, I normalized their public snowflake status IDs to UTC. Reddit exposed its post time in the page's `time[datetime]` value.

## Public timeline

| UTC timestamp | Elapsed from first post | Actor and URL | What the page establishes | Status | Screenshot |
|---|---:|---|---|---|---|
| 2026-08-25 19:00:01 | 0 | [leo on X](https://x.com/synthwavedd/status/2092326145270456377) | First traceable public statement found. The post labels the information a scoop and introduces Bel, Doug, the claimed parameter count, the Astra and GPT-6 relationship, and the Anthropic comparison. | Accessible. No supporting material or named source. | `../sources/origin/01-synthwavedd-bel-scoop.png` |
| 2026-08-25 19:09:18 | +9m 17s | [Outside-Iron-8242 on Reddit](https://www.reddit.com/r/singularity/comments/1vy99vk/according_to_leo_openai_just_finished_its_next/) | The title begins "According to Leo" and embeds a screenshot of leo's post. This is an early downstream repost, not independent corroboration. | Accessible. | `../sources/origin/06-reddit-according-to-leo.png` |
| 2026-08-26 00:08:16 | +5h 8m 15s | [Adit_Yah on X](https://x.com/Adidotdev/status/2092403721540186235) | Rewrites leo's claims as an "Update," adds a star-size comparison image, and adds a Stargate conclusion. This is the post shown in the supplied screenshot. | Accessible. Derivative. | `../sources/origin/02-adidotdev-repost.png` |
| 2026-08-26 00:08:21 | +5h 8m 20s | [Adit_Yah source-credit reply](https://x.com/Adidotdev/status/2092403740037018081) | Says `cc: @synthwavedd` and includes a screenshot of leo's post. This directly identifies the source Adit used. | Accessible. | `../sources/origin/04-adidotdev-source-credit.png` |

## Earliest traceable source

### leo, `@synthwavedd`

- Source URL: https://x.com/synthwavedd/status/2092326145270456377
- Public timestamp: `2026-08-25T19:00:01.229Z`
- Display name: leo
- Account context observed on the public profile: verified account, about 37.3K followers at capture time, and a bio describing the author as a tech, AI, and politics enthusiast who accepts tips.
- The next post in the thread promotes a Discord server for earlier leaks and access to tracking channels. It does not expose the earlier material or its timestamp publicly.
- Status: the earliest public origin found, but not primary evidence of OpenAI's work. The post relies on undisclosed sourcing and phrases one comparison as "my understanding."
- Screenshots:
  - `../sources/origin/01-synthwavedd-bel-scoop.png`
  - `../sources/origin/07-synthwavedd-profile-context.png`

### Claims introduced in the source post

The source post asserts all of the following without attaching evidence:

1. OpenAI recently completed another large pretraining run called Bel.
2. Bel follows an earlier internal model called Doug.
3. Doug is expected to become the base for Astra and, after more reinforcement learning, GPT-6.
4. Bel has more than 10 trillion total parameters and is in roughly the same size class as GPT-4.5.
5. OpenAI expects Bel to become a base after GPT-6 and possibly a base for a model near an AGI threshold.
6. OpenAI believes Anthropic lacks a strong public answer to Astra because of compute constraints.
7. Anthropic expects OpenAI to lead through much of 2026 but expects to regain the lead early in 2027.

The post contains no official OpenAI link, technical report, benchmark, employee quote, internal screenshot, or second named source.

## How the supplied screenshot changed the story

The supplied screenshot corresponds to Adit's later post. Adit retained most of leo's claims but altered the presentation.

| Element | leo's source post | Adit's later post | Assessment |
|---|---|---|---|
| Opening | Says OpenAI recently finished its next pretrain | Says OpenAI finished "the model after Astra" | Adit makes the model sequence sound more settled than the source wording does. |
| Bel, Doug, Astra, GPT-6 | Introduced as reported internal names and expected relationships | Repeated as a compact roadmap | Same rumor chain, not a second source. |
| More than 10T parameters | Direct claim in the source | Rephrased as "10T+" and compared with GPT-4.5 | Same unsupported claim. |
| AGI threshold | The source says Bel could potentially become a base for such a model | Adit says some reports frame it that way | The post refers to plural reports, but its explicit credit points to one public source. |
| Anthropic comparison | Introduced by leo without supporting evidence | Repeated with stronger narrative framing | Same unsupported source. |
| Stargate | Absent | Adit says Stargate is paying off for inference and training | New claim added by Adit. It cannot be attributed to leo's post. |
| Star comparison image | Absent | Added by Adit, with labels for Doug or Astra and Bel | Editorial illustration, not evidence of parameter count or model identity. |

The source-credit thread is the clearest proof of derivation. It places the new illustration and extra Stargate sentence above an explicit credit to `@synthwavedd`.

## Downstream reposts and copies

- The Reddit post appeared nine minutes after leo's post. Its title explicitly attributes the information to leo and embeds his post. It is a repost.
- Adit's X post appeared more than five hours later and credited leo in the next reply. It is a rewritten repost with added interpretation and artwork.
- Google exact-phrase results also showed later Facebook, Binance, Wccftech, Hardware Upgrade, OKX, and translated X copies. Their snippets repeat wording from leo or Adit. I did not treat those snippets as independent confirmation.
- Screenshot of the exact-phrase result set: `../sources/origin/03-google-exact-phrase-results.png`.

## Conflicts and inaccessible boundaries

### Apparent OKX date conflict

Google displayed an OKX result dated 14 August 2026 while its snippet contained wording from leo's 25 August post. The result title concerned Anthropic revenue rather than Bel. Two direct Browser attempts to open the page did not complete. The indexed date therefore cannot establish an earlier Bel publication. The most likely explanation is a dynamic aggregation page whose page date and later-inserted snippet refer to different items, but that remains an inference.

### Private Discord boundary

leo's follow-up advertises a Discord server where members can receive leaks earlier. The public X thread does not reveal whether Bel appeared there before the X post, who posted it, or when. I did not access a private or login-gated Discord. The earliest traceable **public** source remains leo's X post.

### Official-source boundary

A focused Google search for `site:openai.com "Bel" "Doug" OpenAI` returned no matching document. Screenshot: `../sources/origin/05-openai-site-no-match.png`.

This negative result is narrow. It does not rule out deleted pages, unindexed pages, private material, or internal codenames. It only shows that the rumor chain documented here does not lead to a public OpenAI source.

### Deleted-content boundary

Both identified X posts and the Reddit repost were accessible during this investigation. I did not encounter a deleted predecessor. Search results exposed no earlier public post with the same central wording.

## Editorial handling recommendation

Treat `@synthwavedd` as the public origin of the rumor, not as confirmation that Bel exists. Attribute every technical claim to that account unless a separate source independently verifies it. Describe Adit's post as the viral restatement shown in the supplied screenshot. Do not use its star image or Stargate sentence as evidence.

The cleanest defensible framing is: a self-described scoop on X introduced the Bel claim, Reddit amplified it within minutes, and Adit repackaged it hours later with a more dramatic roadmap and an illustration. OpenAI has not publicly confirmed the chain found here.
