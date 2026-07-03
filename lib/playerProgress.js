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
    [/4 Publikasi/i, "4 Publikasi Scholar"],
    [/Finalis OSN-P/i, "Finalis OSN-P"],
    [/Systems Builder/i, "Systems Builder"],
    [/Fullstack Adventurer/i, "Fullstack Adventurer"],
    [/Fullstack Apprentice/i, "Fullstack Apprentice"],
    [/Vice President/i, "VP English Club"],
    [/E-Ticket TNKS/i, "E-Ticket TNKS"],
    [/h-index/i, "h-index 2"],
    [/Study Club/i, "Study Club Mentor"],
    [/DIGDAYA/i, "DIGDAYA Hackathon"],
    [/PEDAS/i, "PEDAS Nasional"],
    [/Publikasi pertama/i, "Publikasi Pertama"],
    [/Repo GitHub/i, "50+ GitHub Repos"],
    [/JICEST/i, "JICEST Committee"],
    [/Sitasi pertama/i, "Sitasi Pertama"],
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
      description: `Milestone level ${level.number} terbuka dari total Player Points.`,
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
      title: "Publikasi pertama terindeks Scholar",
      description: "Publikasi riset awal tercatat di profil Google Scholar.",
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
      title: "4 Publikasi Ilmiah Terindeks Scholar",
      description: "Empat publikasi aktif menjadi bukti ritme riset yang konsisten.",
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
      title: "Sitasi pertama diterima",
      description: "Publikasi mulai dirujuk oleh peneliti lain.",
      points: 3,
      rarity: "common",
      category: "research",
      icon: "icon-scroll",
      unlocked: researchStats.citations >= 1,
      unlockedAtLabel: `${researchStats.citations} sitasi`,
      linkTo: profile.links.scholar,
    },
    {
      id: "a-hindex-two",
      title: "h-index mencapai 2",
      description: "Dampak publikasi sudah membentuk skor h-index dua.",
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
      title: "Finalis OSN-P Informatika",
      description: "Milestone kompetisi awal yang menegaskan arah komputasi.",
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
      title: "Peserta PEDAS",
      description: "Partisipasi di Pesta Data Nasional.",
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
      title: "Peserta DIGDAYA X Hackathon",
      description: "Membangun prototype WakafDigital untuk transparansi proyek wakaf.",
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
      title: "Jadi Mentor Study Club",
      description: "Mengajar sekitar 30 mahasiswa pada program Study Club Batch 4.",
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
      description: "Peran organisasi yang menjembatani komunitas dan komunikasi kampus.",
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
      description: "Mengelola penyesuaian dan pemeliharaan website konferensi JICEST.",
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
      title: "Repo GitHub publik tembus 50+",
      description: "Portfolio kode publik melewati ambang 50 repository.",
      points: 5,
      rarity: "rare",
      category: "web",
      icon: "icon-artifact-vase",
      unlocked: repoCount >= 50,
      unlockedAtLabel: `${repoCount} repo`,
      linkTo: profile.links.github,
    },
    {
      id: "a-tnks-fullstack",
      title: "Deploy proyek fullstack pertama",
      description: "E-Ticket TNKS menjadi bukti proyek web riset yang berjalan.",
      points: 6,
      rarity: "rare",
      category: "web",
      icon: "icon-artifact-vase",
      unlocked: hasQuest("TNKS") || hasExperience("E-Tiket TNKS"),
      unlockedAtLabel: "2024-2025",
      linkTo: profile.links.scholar,
      inventoryName: "Artifact: E-Ticket TNKS",
    },
    {
      id: "a-fifth-publication",
      title: "Publikasi ke-5 terindeks",
      description: "Slot berikutnya untuk milestone riset lanjutan.",
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
      description: "Lengkapi kurasi proyek publik yang tampil di Quest Board.",
      current: curatedProjects,
      target: 10,
      points: 8,
      category: "web",
      linkTo: "/projects",
    },
    {
      id: "m-citations-10",
      title: "Kumpulkan 10 Sitasi di Scholar",
      description: "Dorong publikasi agar makin banyak dirujuk.",
      current: researchStats.citations,
      target: 10,
      points: 10,
      category: "research",
      linkTo: profile.links.scholar,
    },
    {
      id: "m-publications-5",
      title: "Publikasi ke-5 di Scholar",
      description: "Tambah satu publikasi terindeks lagi.",
      current: researchStats.publications,
      target: 5,
      points: 6,
      category: "research",
      linkTo: profile.links.scholar,
    },
    {
      id: "m-repos-60",
      title: "Tembus 60 Repo Publik GitHub",
      description: "Naikkan portfolio repository publik menuju ambang berikutnya.",
      current: repoCount,
      target: 60,
      points: 4,
      category: "web",
      linkTo: profile.links.github,
    },
    {
      id: "m-hindex-3",
      title: "Selesaikan h-index 3",
      description: "Milestone dampak riset berikutnya.",
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
