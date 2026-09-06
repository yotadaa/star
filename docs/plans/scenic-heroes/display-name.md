# Public display name

2026-09-06: owner explicitly requested “Do not call my full name, just mention Mukhtada in every page”.

Use a central public display name for profile, footer, HUD, Lore and metadata. Current full-name aliases in saved captions and article bylines are normalized at presentation time, keeping stored source records and author identifiers intact. Existing academic citation strings remain source-faithful; this task changes how the site addresses its owner.

Verified Home, About, Projects, Research, Blog, Contact and Lore text/title/description plus one published article byline in the browser. Source review covers Open Graph image and default CMS author. Two normalization tests pass; production build passes. Evidence: `validation/biome-heroes-2026-09-06/identity/`. No new dependency, database migration or external write.

GitNexus: caption renderer and article SEO builder LOW; constants UNKNOWN because property/constant reads are not fully linked. Text search resolved their actual profile/footer/HUD/layout/Lore consumers. Unknown was not treated as unused.
