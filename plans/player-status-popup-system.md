# Player Status Popup System

## Source

Steered request: create a 3-in-1 popup system for Inventory, Achievement, and
Mission connected by one Player Points system. This is a continuation of
`report.md` and `design-system.md`.

## Core Concept

Achievement and Mission both contribute to a single global Player Points value.
Inventory is only a visual collection of unlocked artifacts; it does not create
points by itself.

Flow:

```text
Achievement unlocked
Mission completed       -> +PP -> level calculation -> inventory item unlock
```

## Player Points

- Total PP is derived from unlocked achievements plus completed missions.
- Level is derived from Total PP, not manually entered.
- Draft thresholds:
  - Level 1: Fresh Explorer, 0 PP
  - Level 2: Fullstack Apprentice, 15 PP
  - Level 3: Fullstack Adventurer, 35 PP
  - Level 4: Systems Builder, 60 PP
  - Level 5: Research Voyager, 90 PP
- Home HUD level copy should eventually use derived level data.
- Level-up should trigger the existing toast system.

## Achievement Model

Required fields:

```ts
type Achievement = {
  id: string;
  title: string;
  description: string;
  points: number;
  rarity: "epic" | "rare" | "common";
  unlocked: boolean;
  unlockedAt?: string;
  category: "research" | "web" | "community" | "competition";
  icon: string;
};
```

Seed candidates from existing content:

- Terindeks Sinta 5, +6, rare, research
- 4 Publikasi Ilmiah Terindeks Scholar, +10, epic, research
- Sitasi pertama diterima, +3, common, research
- h-index mencapai 2, +5, rare, research
- Finalis OSN-P Informatika, +8, epic, competition
- Peserta PEDAS, +5, rare, competition
- Peserta DIGDAYA X Hackathon, +5, rare, competition
- Jadi Mentor Study Club, +6, rare, community
- Vice President English Club, +8, epic, community
- Publication Committee JICEST, +4, common, community
- Repo GitHub publik 50+, +5, rare, web
- Deploy proyek fullstack pertama, +6, rare, web

Locked achievements should remain visible with silhouette treatment and hidden
points, not removed from the list.

## Mission Model

Required fields:

```ts
type Mission = {
  id: string;
  title: string;
  description: string;
  target: number;
  current: number;
  points: number;
  status: "active" | "completed";
  category: "web" | "research" | "community";
};
```

Mission progress must be derived from existing site data, not duplicated:

- Featured public projects: use project data length.
- Scholar citations: use research/citation data.
- Publication count: use publications data.
- GitHub repo count: use profile/quest chip data.
- h-index: use research/profile data.

Visual progress should use segmented pixel bars rather than smooth gradients.

## Inventory Model

Inventory is derived from unlocked achievements and completed missions:

```ts
type InventoryItem = {
  id: string;
  sourceId: string;
  type: "scroll" | "tool" | "artifact" | "medal" | "key";
  name: string;
  rarity: "epic" | "rare" | "common";
  acquiredAt: string;
  linkTo?: string;
};
```

Item types:

- Scroll: research/writing
- Tool: mastered stack or skill
- Artifact: completed project
- Medal: competition/community achievement
- Key: level milestone

Inventory items can open detail and link back to original Research or Projects
data where a real URL exists.

## Popup UI

- One navbar trigger opens a modal with three tabs: Inventory, Achievement,
  Mission.
- Header summary is always visible across tabs:
  - Current level and total PP via `HudStatusStrip`.
  - Segmented progress to next level.
- Modal uses backdrop blur and cockpit/glass styling, with scale/fade open.
- Must close by backdrop click, close button, and Escape.
- Tabs use `PixelButton`.
- Cards use `UnlockCard` and `RarityTag`.

## Components To Add

- `PlayerStatusPopup.jsx`
- `AchievementList.jsx`
- `MissionList.jsx`
- `InventoryGrid.jsx`
- `ProgressBarSegmented.jsx`
- `usePlayerProgress.js`

## SVG Assets Needed

- `icon-backpack`
- `icon-scroll`
- `icon-tool-wrench`
- `icon-artifact-vase`
- `icon-key`
- `icon-lock-silhouette`

## Open Confirmations

1. PP scale and level thresholds are proposed values and need owner approval.
2. Rarity mapping per achievement needs owner approval before production use.
3. Mission progress is assumed to represent the portfolio owner, not each
   visitor.
4. Inventory links must come from existing data sources only.

## Acceptance Criteria

1. One nav entry opens the popup; no three-icon clutter.
2. PP and level are derived, not manually duplicated in multiple places.
3. Mission progress uses segmented bars and real data-derived current values.
4. Inventory contains only derived unlocked items.
5. No emoji is used as a permanent production icon; use sprite icons instead.
6. Keyboard and Escape behavior works; no horizontal overflow on mobile.

