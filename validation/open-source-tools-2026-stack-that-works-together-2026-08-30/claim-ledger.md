# Claim Ledger

| ID | Claim | Status | Evidence | Editorial treatment |
|---|---|---|---|---|
| C01 | The 29 Aug 2026 archive's top three entries were Archify, scientific-agent-skills, and Anthropic's official Claude plugins. | Supported | S01 | State as an unofficial archived snapshot, not GitHub's own historical record. |
| C02 | The supplied synthesis misdates Codex, Addy agent-skills, and SkillSpector as prominent in that exact snapshot. | Supported | Archive search index and assignment cross-check | Keep correction in validation only; body simply avoids the false grouping. |
| C03 | ripgrep recursively searches text and respects ignore rules by default. | Supported | S02 | Include with the hidden/ignored-file caveat. |
| C04 | ripgrep sorted output requires an explicit sort option and gives up parallelism. | Supported | ripgrep GUIDE/FAQ linked from S02 | Frame as a reproducibility tradeoff, not a speed benchmark. |
| C05 | uv manages Python projects, environments, versions, lockfiles, scripts, and tools. | Supported | S03 | No independent speed claim. |
| C06 | Ruff combines linting and formatting, supports safe/unsafe fixes, and is not intended to alternate continuously with Black. | Supported | S04, S05, S19 | State that import sorting remains a separate Ruff lint action. |
| C07 | Docling parses many document formats into a unified representation and exports several formats. | Supported | S06, S20 | Add that parsing output still needs domain-appropriate validation as practical guidance. |
| C08 | DuckDB can query Parquet directly and can push filters/projections into scans. | Supported | S07, S21 | Note that repeated/join-heavy work may justify native loading; avoid universal performance claims. |
| C09 | marimo is a reactive Python notebook stored as pure Python with a dependency graph. | Supported | S08 | Explain the upside and the incompatibility with order-dependent habits. |
| C10 | OpenCode is an MIT-licensed coding agent with configurable permission rules. | Supported | S09, S10 | State permissions as allow/ask/deny; do not imply they remove all execution risk. |
| C11 | OpenCode's `--auto` changes prompts to approvals but still enforces explicit deny rules. | Supported | S10 | Mention only as a reason deny rules matter. |
| C12 | Addy Osmani's Agent Skills guide recommends selective loading because more context is not always better. | Supported | S11, S22 | Use as scope discipline, not a claim that every agent implements skills identically. |
| C13 | SkillSpector documents static rules, optional LLM analysis, OSV checks, and risk-oriented output. | Supported | S12 | Describe as a triage layer. |
| C14 | An open issue reports that SkillSpector v2.8.2 can skip unrelated files when an oversized companion file is present and return a low result. | Reported, not reproduced | S13 | Attribute explicitly to the open issue; no general vulnerability-frequency claim. |
| C15 | Syncthing continuously synchronizes files and is MPL-2.0 licensed. | Supported | S14 | Do not call it backup. |
| C16 | Syncthing file versioning is off by default and archives remote-origin changes rather than local changes. | Supported | S15 | Use to explain why a second backup system is needed. |
| C17 | restic creates snapshots, restores them, and documents periodic metadata or full-data checks. | Supported | S16, S23 | Recommend a restore test in addition to repository checks. |
| C18 | The selected projects use MIT, Apache-2.0, MPL-2.0, BSD-2-Clause, or ripgrep/uv dual-license combinations. | Supported | S02, S03, S08, S09, S12, S14, S19–S23 and their linked license files | Present as a current selection table; instruct readers to verify the version they ship. |
| C19 | Open WebUI v0.6.6+ adds a branding restriction; its own license page says the license is not OSI-approved. | Supported | S17 | Keep neutral and quote no more than needed; distinguish v0.6.5 BSD history. |
| C20 | n8n's Sustainable Use License permits certain internal/personal uses and restricts selling or hosting n8n as a product. | Supported | S18 | Encourage exact-use review; no legal conclusion about a specific business. |
| C21 | Sync plus a tested backup offers a stronger recovery boundary than either alone. | Reasoned synthesis | C15–C17 | Present as operational guidance, not a vendor guarantee. |
| C22 | A bottom-up stack with replaceable layers reduces overlap and exit cost. | Reasoned synthesis | C03–C21 | Core thesis; no quantitative efficiency claim. |
