import {
  achievements as achievementFacts,
  experience,
  featuredQuests,
  profile,
  publications,
} from "./data";

export const playerLevels = [
  { number: 1, label: "Fresh Explorer", points: 0 },
  { number: 2, label: "Fullstack Apprentice", points: 15 },
  { number: 3, label: "Fullstack Adventurer", points: 35 },
  { number: 4, label: "Systems Builder", points: 60 },
  { number: 5, label: "Research Voyager", points: 90 },
];

const rarityRank = { epic: 0, rare: 1, common: 2 };

export function getResearchStats() {
  const citations = publications.reduce((sum, publication) => sum + publication.citedBy, 0);
  const sortedCitations = publications.map((publication) => publication.citedBy).sort((a, b) => b - a);
  const hIndex = sortedCitations.reduce((score, citedBy, index) => (citedBy >= index + 1 ? index + 1 : score), 0);

  return {
    publications: publications.length,
    citations,
    hIndex,
  };
}

function hasAchievement(titleFragment) {
  return achievementFacts.some((achievement) => achievement.title.toLowerCase().includes(titleFragment.toLowerCase()));
}

function hasExperience(roleFragment) {
  return experience.some((item) => item.role.toLowerCase().includes(roleFragment.toLowerCase()));
}

function hasQuest(titleFragment) {
  return featuredQuests.some((item) => item.title.toLowerCase().includes(titleFragment.toLowerCase()));
}

function getLevel(totalPP) {
  const current = [...playerLevels].reverse().find((level) => totalPP >= level.points) ?? playerLevels[0];
  const next = playerLevels.find((level) => level.points > totalPP) ?? null;
  const previousPoints = current.points;
  const nextPoints = next?.points ?? current.points;
  const span = Math.max(1, nextPoints - previousPoints);
  const progress = next ? Math.min(span, totalPP - previousPoints) : span;

  return {
    current,
    next,
    progress,
    target: span,
    percent: next ? Math.round((progress / span) * 100) : 100,
  };
}

function mapAchievementType(category) {
  if (category === "research") return "scroll";
  if (category === "web") return "artifact";
  if (category === "community" || category === "competition") return "medal";
  return "tool";
}

function mapIconByType(type) {
  if (type === "scroll") return "icon-scroll";
  if (type === "tool") return "icon-tool-wrench";
  if (type === "artifact") return "icon-artifact-vase";
  if (type === "key") return "icon-key";
  return "icon-trophy";
}

function toInventoryItem(source) {
  const type = mapAchievementType(source.category);
  return {
    id: `inv-${source.id}`,
    sourceId: source.id,
    type,
    icon: mapIconByType(type),
    name: compactInventoryName(source.inventoryName ?? source.title),
    fullName: source.inventoryName ?? source.title,
    description: source.description,
    rarity: source.rarity,
    acquiredAt: source.unlockedAtLabel ?? "Unlocked",
    linkTo: source.linkTo,
  };
}

function compactInventoryName(name) {
  const raw = String(name || "").replace(/^(Scroll|Artifact|Medal|Key):\s*/i, "").trim();
  const known = [
    [/4 (?:Publikasi|Indexed Publications)/i, "4 Scholar Publications"],
    [/(?:Finalis|Finalist) OSN-P/i, "OSN-P Finalist"],
    [/Systems Builder/i, "Systems Builder"],
    [/Fullstack Adventurer/i, "Fullstack Adventurer"],
    [/Fullstack Apprentice/i, "Fullstack Apprentice"],
    [/Vice President/i, "VP English Club"],
    [/E-Ticket TNKS/i, "E-Ticket TNKS"],
    [/h-index/i, "h-index 2"],
    [/Study Club/i, "Study Club Mentor"],
    [/DIGDAYA/i, "DIGDAYA Hackathon"],
    [/PEDAS/i, "National PEDAS"],
    [/(?:Publikasi pertama|First publication)/i, "First Publication"],
    [/(?:Repo GitHub|GitHub repositories)/i, "50+ GitHub Repos"],
    [/JICEST/i, "JICEST Committee"],
    [/(?:Sitasi pertama|First citation)/i, "First Citation"],
  ];
  for (const [pattern, label] of known) {
    if (pattern.test(raw)) return label;
  }
  return raw.length > 24 ? `${raw.slice(0, 23).trim()}...` : raw;
}

function buildInventory(achievements, missions, levelState) {
  const achievementItems = achievements
    .filter((achievement) => achievement.unlocked)
    .map(toInventoryItem);

  const missionItems = missions
    .filter((mission) => mission.status === "completed")
    .map((mission) => ({
      id: `inv-${mission.id}`,
      sourceId: mission.id,
      type: mission.category === "web" ? "artifact" : "scroll",
      icon: mission.category === "web" ? "icon-artifact-vase" : "icon-scroll",
      name: compactInventoryName(mission.inventoryName ?? mission.title),
      fullName: mission.inventoryName ?? mission.title,
      description: mission.description,
      rarity: "rare",
      acquiredAt: "Mission complete",
      linkTo: mission.linkTo,
    }));

  const keyItems = playerLevels
    .filter((level) => level.number > 1 && level.number <= levelState.current.number)
    .map((level) => ({
      id: `inv-level-key-${level.number}`,
      sourceId: `level-${level.number}`,
      type: "key",
      icon: "icon-key",
      name: compactInventoryName(`Key: ${level.label}`),
      fullName: `Key: ${level.label}`,
      description: `Level ${level.number} unlocked through total Player Points.`,
      rarity: level.number >= 4 ? "epic" : "rare",
      acquiredAt: `${level.points} PP`,
      linkTo: null,
    }));

  return [...achievementItems, ...missionItems, ...keyItems].sort((a, b) => {
    const rarityDelta = rarityRank[a.rarity] - rarityRank[b.rarity];
    if (rarityDelta !== 0) return rarityDelta;
    return a.name.localeCompare(b.name);
  });
}

export function getPlayerProgress() {
  const researchStats = getResearchStats();
  const repoCount = profile.stats.publicRepos;
  const curatedProjects = featuredQuests.length;

  const achievements = [
    {
      id: "a-first-publication",
      title: "First publication indexed on Scholar",
      description: "The first research publication appears on the verified Google Scholar profile.",
      points: 6,
      rarity: "rare",
      category: "research",
      icon: "icon-scroll",
      unlocked: researchStats.publications >= 1,
      unlockedAtLabel: "2024",
      linkTo: profile.links.scholar,
    },
    {
      id: "a-four-publications",
      title: "4 Scientific Publications Indexed on Scholar",
      description: "Four active publications show a consistent research record.",
      points: 10,
      rarity: "epic",
      category: "research",
      icon: "icon-scroll",
      unlocked: researchStats.publications >= 4,
      unlockedAtLabel: "2025",
      linkTo: profile.links.scholar,
    },
    {
      id: "a-first-citation",
      title: "First citation received",
      description: "Other researchers have started citing the published work.",
      points: 3,
      rarity: "common",
      category: "research",
      icon: "icon-scroll",
      unlocked: researchStats.citations >= 1,
      unlockedAtLabel: `${researchStats.citations} citations`,
      linkTo: profile.links.scholar,
    },
    {
      id: "a-hindex-two",
      title: "h-index reached 2",
      description: "The publication record has reached an h-index of two.",
      points: 5,
      rarity: "rare",
      category: "research",
      icon: "icon-scroll",
      unlocked: researchStats.hIndex >= 2,
      unlockedAtLabel: `h-index ${researchStats.hIndex}`,
      linkTo: profile.links.scholar,
    },
    {
      id: "a-osnp-finalist",
      title: "OSN-P Informatics Finalist",
      description: "An early competition milestone that set a clear direction toward computing.",
      points: 8,
      rarity: "epic",
      category: "competition",
      icon: "icon-trophy",
      unlocked: hasAchievement("OSN-P"),
      unlockedAtLabel: "2020",
      linkTo: null,
    },
    {
      id: "a-pedas",
      title: "PEDAS Participant",
      description: "Participated in the National Data Festival.",
      points: 5,
      rarity: "rare",
      category: "competition",
      icon: "icon-trophy",
      unlocked: hasAchievement("PEDAS"),
      unlockedAtLabel: "2025",
      linkTo: null,
    },
    {
      id: "a-digdaya",
      title: "DIGDAYA X Hackathon Participant",
      description: "Built the WakafDigital prototype for transparent waqf projects.",
      points: 5,
      rarity: "rare",
      category: "competition",
      icon: "icon-trophy",
      unlocked: hasAchievement("DIGDAYA"),
      unlockedAtLabel: "2026",
      linkTo: null,
    },
    {
      id: "a-study-club-mentor",
      title: "Study Club Mentor",
      description: "Taught roughly 30 students in Study Club Batch 4.",
      points: 6,
      rarity: "rare",
      category: "community",
      icon: "icon-tool-wrench",
      unlocked: hasExperience("Mentor Study Club"),
      unlockedAtLabel: "2025",
      linkTo: null,
    },
    {
      id: "a-english-club-vp",
      title: "Vice President English Club",
      description: "An organizational role connecting the community with campus communication.",
      points: 8,
      rarity: "epic",
      category: "community",
      icon: "icon-trophy",
      unlocked: hasExperience("Vice President"),
      unlockedAtLabel: "2024-2025",
      linkTo: null,
    },
    {
      id: "a-jicest-committee",
      title: "Publication Committee JICEST",
      description: "Managed updates and maintenance for the JICEST conference website.",
      points: 4,
      rarity: "common",
      category: "community",
      icon: "icon-tool-wrench",
      unlocked: hasExperience("Publication Committee"),
      unlockedAtLabel: "2024",
      linkTo: null,
    },
    {
      id: "a-repo-fifty",
      title: "Public GitHub repositories passed 50",
      description: "The public code portfolio passed the 50-repository mark.",
      points: 5,
      rarity: "rare",
      category: "web",
      icon: "icon-artifact-vase",
      unlocked: repoCount >= 50,
      unlockedAtLabel: `${repoCount} repositories`,
      linkTo: profile.links.github,
    },
    {
      id: "a-tnks-fullstack",
      title: "Deployed the first fullstack project",
      description: "E-Ticket TNKS provides a working example of a research web project.",
      points: 6,
      rarity: "rare",
      category: "web",
      icon: "icon-artifact-vase",
      unlocked: hasQuest("TNKS") || hasExperience("E-Ticket TNKS"),
      unlockedAtLabel: "2024-2025",
      linkTo: profile.links.scholar,
      inventoryName: "Artifact: E-Ticket TNKS",
    },
    {
      id: "a-fifth-publication",
      title: "Fifth indexed publication",
      description: "The next milestone for the research record.",
      points: 6,
      rarity: "rare",
      category: "research",
      icon: "icon-lock-silhouette",
      unlocked: researchStats.publications >= 5,
      unlockedAtLabel: null,
      linkTo: null,
    },
  ];

  const missions = [
    {
      id: "m-projects-10",
      title: "Reach 10 Public Projects Featured",
      description: "Complete the public project selection shown on the Quest Board.",
      current: curatedProjects,
      target: 10,
      points: 8,
      category: "web",
      linkTo: "/projects",
    },
    {
      id: "m-citations-10",
      title: "Reach 10 Citations on Scholar",
      description: "Grow the number of references to the published work.",
      current: researchStats.citations,
      target: 10,
      points: 10,
      category: "research",
      linkTo: profile.links.scholar,
    },
    {
      id: "m-publications-5",
      title: "Fifth Publication on Scholar",
      description: "Add one more indexed publication.",
      current: researchStats.publications,
      target: 5,
      points: 6,
      category: "research",
      linkTo: profile.links.scholar,
    },
    {
      id: "m-repos-60",
      title: "Reach 60 Public GitHub Repositories",
      description: "Grow the public repository portfolio to its next threshold.",
      current: repoCount,
      target: 60,
      points: 4,
      category: "web",
      linkTo: profile.links.github,
    },
    {
      id: "m-hindex-3",
      title: "Reach h-index 3",
      description: "The next milestone for research impact.",
      current: researchStats.hIndex,
      target: 3,
      points: 6,
      category: "research",
      linkTo: profile.links.scholar,
    },
  ].map((mission) => ({
    ...mission,
    status: mission.current >= mission.target ? "completed" : "active",
  }));

  const totalPP =
    achievements.filter((achievement) => achievement.unlocked).reduce((sum, achievement) => sum + achievement.points, 0) +
    missions.filter((mission) => mission.status === "completed").reduce((sum, mission) => sum + mission.points, 0);
  const level = getLevel(totalPP);
  const inventory = buildInventory(achievements, missions, level);

  return {
    achievements,
    missions,
    inventory,
    level,
    totalPP,
    researchStats,
    repoCount,
  };
}
