# Terminology ledger

| Term | Accepted meaning | Direct source | Rejected alternatives | Article wording |
|---|---|---|---|---|
| Agent Skill | A folder containing instructions, scripts, and resources that an agent can discover and load, anchored by `SKILL.md`. | https://github.com/agentskills/agentskills/blob/main/docs/specification.mdx | A model weight update; a generic API tool; any prompt fragment | agent skill / skill package |
| Skill-pool size | A candidate set containing the task's annotated ground-truth skill set plus real distractors; tested at 5, 10, 20, 50, and 100. | https://arxiv.org/html/2608.14036#S5.SS5 | Number of fully loaded skill bodies; number of API tools | candidate skill pool |
| Actual-use precision | In the study's execution arm, overlap between skills parsed as accessed during execution and the annotated ground-truth set. | https://arxiv.org/html/2608.14036#S5.SS5 | Task success; top-1 retrieval precision; fraction of installed skills used | exact-use precision |
| Procedural anchor | Guidance that stabilizes an ordering, checklist, tool sequence, setup routine, or verification plan. | https://arxiv.org/html/2608.14036#S4 | Static factual knowledge injection | procedural anchor |
| Similar distractor | A real skill selected as an embedding-space near-neighbor to the ground-truth skill. | https://arxiv.org/html/2608.14036#A1.SS7 | Random irrelevant noise | confusable or similar skill |
| Progressive disclosure | A three-tier loading pattern: metadata at startup, full instructions after activation, resources on demand. | https://github.com/agentskills/agentskills/blob/main/docs/client-implementation/adding-skills-support.mdx | Loading every skill body at startup | progressive disclosure |
| HSR@3 | Harmful Sibling Rate at 3: whether a risky same-capability sibling is exposed in the top three results. | https://arxiv.org/abs/2606.10388 | General hallucination rate; task failure rate | risky-sibling exposure |
