# Claim ledger

Research cutoff: 28 August 2026, 11:20 WIB (Asia/Jakarta, UTC+7). Status
vocabulary follows the project contract: `verified`,
`corroborated`, `reported`, `claimed`, `inferred`, `unknown`, and `rejected`.

| ID | Planned claim | Evidence | Class | Status | Limit or conflict | Article use |
|---|---|---|---|---|---|---|
| C01 | The supplied screenshot is a crop of Adit_Yah's 26 August post | S00, S02 | user artifact + direct social artifact | **verified** | S00 omitted the handle, timestamp, and source-credit reply | Opening and provenance |
| C02 | The earliest explicit public Bel claim found is Leo (`@synthwavedd`) at 02:00:01 WIB on 26 August 2026 | S01; normalized X snowflake timestamp in `research/origin-agent.md` | direct social artifact | **verified** within searchable boundary | Private Discord, deleted posts, and unindexed communities prevent an absolute first-ever claim | Origin section |
| C03 | Reddit repeated Leo's post 9m17s later and attributed it “According to Leo” | S04 | downstream social artifact | **verified** | Repost, not corroboration | Propagation timeline |
| C04 | Adit posted a derivative version 5h8m15s after Leo and explicitly credited Leo five seconds later | S02, S03 | direct social artifacts | **verified** | Adit's larger engagement does not make the version independent | Origin and mutation |
| C05 | Leo claimed OpenAI finished a pretrain codenamed Bel | S01 | attributable claim | **claimed**; existence **unknown** | No document, named source, model card, benchmark, or OpenAI statement accompanies the post | Central verdict |
| C06 | Leo claimed Bel succeeds an internal model called Doug | S01 | attributable claim | **claimed**; relationship **unknown** | No checked OpenAI source names Doug as a model | Claim table |
| C07 | Leo claimed Doug would become the base for Astra and GPT-6 after further RL | S01 | attributable claim | **claimed**; lineage **unknown** | OpenAI confirms Astra but does not connect it to Doug, GPT-6, or Bel | Claim table and public-record section |
| C08 | The source claim is `>10T total parameters`, not more than 10T training tokens | S01, S02 | direct wording comparison | **verified** as source wording | The number itself is unverified. Adit shortened it to “10T+ pretrain” | Scale section |
| C09 | Bel has more than 10T parameters | S01 only | attributable claim | **claimed**; value **unknown** | No primary artifact or independent named-source report supports it | Scale section, labelled |
| C10 | Bel is in roughly the same size class as GPT-4.5 | S01, S09 | attributable claim + first-party disclosure | **claimed** and **not checkable** | OpenAI calls GPT-4.5 large/compute intensive but publishes no parameter count | Scale section |
| C11 | Bel could be a post-GPT-6 or “AGI-threshold” base | S01 | attributable speculation | **claimed**; technical meaning **unknown** | No threshold, definition, or evaluation is supplied | Claim table only; not headline/dek |
| C12 | Astra is a real OpenAI model and an internal version produced the announced mathematics results | S06 | first-party record | **verified** | Does not reveal base model, parameter count, launch date, or GPT-6 relationship | Verified anchor |
| C13 | OpenAI called Astra upcoming/next major, but published no launch date in the checked sources | S06, S07, S08 | first-party records | **verified** for wording; launch date **unknown** | “Near-term launch” is stronger than the public record | Timeline and verdict |
| C14 | On 18 August OpenAI said a two-week RL pause had occurred, its largest planned frontier RL run remained on hold, and many Astra workloads remained paused | S08 | first-party record | **verified** | Does not prove or disprove a separate Bel pretrain | Timeline boundary |
| C15 | OpenAI disclosed no public GPT-4.5 parameter count on its launch page | S09 | first-party record | **verified** as a disclosure boundary | Absence from one page is not proof no internal count exists | Scale section |
| C16 | GPT-4.5 involved scaled pretraining and post-training, including SFT and RLHF | S09 | first-party record | **verified** | General training sequence cannot authenticate the claimed Doug/Bel lineage | Technical explanation |
| C17 | Stargate was announced as a $500B/four-year intent with $100B to begin deploying immediately | S10 | first-party partnership record | **verified** as stated commitment | Commitment is not delivered compute | Stargate section |
| C18 | By July 2025, parts of Abilene were running early training and inference workloads | S11, S12 | first-party records | **verified** | No live MW/GW total or model identity was disclosed | Stargate section |
| C19 | The 4.5GW addition and nearly 7GW figures described capacity under development or planned, not delivered capacity | S11, S12, S13 | first-party + independent reporting | **corroborated** | Dates and categories must remain attached to each figure | Stargate section |
| C20 | Stargate proves Bel exists or completed training | No link in S01 or S10-S13 | unsupported inference | **rejected** | Infrastructure can support large runs without identifying any one run | Central verdict |
| C21 | Adit added “Stargate is paying off” to Leo's rumor chain | S01-S03 | direct wording comparison | **verified** | It is an added inference, not a second-source disclosure | Mutation section |
| C22 | Leo attributed internal competitive beliefs to OpenAI and a 2026/2027 posture to Anthropic | S01 | attributable claim | **claimed**; underlying beliefs **unknown** | No named speaker, document, interview, or source description | Anthropic section |
| C23 | Anthropic shipped Opus 5 in July 2026; Reuters independently confirmed the release and described its pace through a named executive | S14, S15 | first-party + independent reporting | **corroborated** | Does not establish that Opus 5 matches unreleased Astra | Counterevidence |
| C24 | Anthropic announced an Amazon agreement for up to 5GW, including nearly 1GW expected online by end-2026 | S16 | first-party partnership record | **verified** as company disclosure | Not independently audited here and not a matched comparison with Stargate | Counterevidence |
| C25 | Anthropic has “no answer,” has accepted 2026, or plans a 2027 comeback | S01 only, weighed against S14-S16 | private-belief/roadmap claim | **claimed** and **unsupported** | Public releases and compute plans weaken the implied inactivity but cannot disprove private beliefs | Anthropic verdict |
| C26 | Anthropic is “following OpenAI's approach” | Not present in S01 or S02 | later interpretation | **rejected** | The wording does not appear in the identified source chain | Omitted |
| C27 | Wccftech independently confirmed Bel | S05 | downstream report | **rejected** | The article embeds Leo's post and calls the story a “wild rumor” | Propagation section |
| C28 | Several repetitions make the Bel rumor corroborated | S03-S05 | source-chain analysis | **rejected** | All arrows lead back to Leo | Thesis |
| C29 | No checked public OpenAI artifact confirms Bel or Doug as of the cutoff | S06-S13 plus focused searches G02-G04 | bounded search result | **unknown**, with no public confirmation found | This is not proof the codenames do not exist | Conclusion |
| C30 | Confirmation would require an authenticated first-party artifact or independent named-source reporting that ties Bel to a training record | Evidence standard from contract | editorial criterion | **verified** as the investigation's decision rule | A new screenshot without provenance would not meet it | CTA and ending |

## Thesis and boundary

- **Thesis:** The viral Bel roadmap traces to one self-described X scoop; the
  public record confirms Astra and live Stargate training capacity, but not Bel,
  Doug, a 10T-parameter run, or the claimed lineage.
- **Boundary:** A missing public confirmation does not prove that an internal
  codename or run is impossible, and real infrastructure makes large runs
  plausible without identifying this one.

## Explicitly rejected transformations

- `>10T total parameters` must not become `>10T training tokens`.
- “Upcoming” must not become a launch date or “near-term launch.”
- Planned or under-development gigawatts must not become delivered capacity.
- Adit, Reddit, Wccftech, and other copies must not be counted as independent
  corroboration of Leo.
- Public Opus 5 and compute announcements must not become proof that Anthropic
  can beat Astra.
