# Terminology Ledger

| Term | Operational meaning in this article | Boundary |
|---|---|---|
| GitHub Trending snapshot | The daily repository list preserved by GitHub Trending Archives for 29 August 2026. | The archive is unofficial and not affiliated with GitHub. It indicates attention, not quality or durability. |
| Open source | Software released under a license that grants source-code freedoms; exact obligations still depend on the license and version. | A public repository, free download, or self-hostability alone does not settle the term. |
| Source-available | Source can be inspected, but use, branding, commercial, or redistribution rights may be narrower than an OSI-approved license. | Used descriptively, not as a judgment of project quality. |
| Agent skill | A Markdown-led package of instructions, workflows, references, and sometimes executable helpers loaded by an AI coding agent. | It can expand capability and attack surface; it is not a harmless prompt snippet by default. |
| Permission policy | Rules that allow, ask for approval, or deny an agent action. | A configured rule is a control, not proof that every downstream tool is safe. |
| Static security scan | Pattern-based inspection that does not require executing the inspected skill. | It can produce false positives and false negatives; it is triage, not certification. |
| Reactive notebook | A notebook whose dependency graph reruns affected cells when upstream definitions change. | It improves reproducibility but can conflict with mutation-heavy or order-dependent notebook habits. |
| In-place Parquet query | SQL directly over Parquet files without first importing them into a database table. | Repeated or join-heavy work can still benefit from loading data into DuckDB's native format. |
| File sync | Replication of current file state between devices. | Deletion and corruption can propagate; sync is not automatically backup. |
| Backup | Versioned, independently restorable copies retained outside the live working set. | A backup is credible only when integrity checks and restores succeed. |
