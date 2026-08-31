// Real, sourced content for Mukhtada Billah NST.
// Sources: GitHub API (yotadaa), Google Scholar (w-CDgG8AAAAJ), CV PDFs, LinkedIn-supplied elements.
// No fabricated project screenshots. Any missing visual asset is labeled [ASSET PENDING].

export const profile = {
  name: "Mukhtada Billah NST",
  handle: "Mukhtada",
  role: "Full-Stack Developer · AI Tooling · Data Research",
  status: "Open to Work",
  location: "Jambi, Indonesia",
  affiliation: "University of Jambi - Information Systems",
  avatar: "https://avatars.githubusercontent.com/u/121438055?v=4",
  tagline_id: "Building useful systems with web, AI, and data.",
  lede_id:
    "I'm Mukhtada Billah NST, an Information Systems student at the University of Jambi. I build full-stack web products, AI tools, data projects, and published research.",
  about:
    "I am Mukhtada Billah NST, an Information Systems student at the University of Jambi. I build full-stack web products and AI tools, work with data, and publish information systems research. My experience includes backend development, web platform maintenance, student mentoring, and community technology projects.",
  links: {
    github: "https://github.com/yotadaa",
    linkedin: "https://www.linkedin.com/in/mukhtada-nasution-893aaa246/",
    scholar: "https://scholar.google.com/citations?user=w-CDgG8AAAAJ&hl=en",
    blog: "/blog",
    instagram: "https://www.instagram.com/tadanasuti.on/",
  },
  stats: {
    publicRepos: 57,
  },
};

export const publicPageCopy = {
  home: {
    metadataTitle: "Mukhtada Billah NST — Full-Stack Developer, AI & Data",
    metadataDescription:
      "Mukhtada Billah NST is an Information Systems student at the University of Jambi building full-stack web products, AI tools, data projects, and published research.",
    keywords: [
      "Mukhtada Billah NST",
      "full-stack developer Indonesia",
      "AI tooling",
      "data science",
      "University of Jambi",
    ],
  },
  about: {
    metadataTitle: "About Mukhtada Billah NST",
    metadataDescription:
      "Meet Mukhtada Billah NST, an Information Systems student at the University of Jambi with experience in full-stack web development, AI tools, data science, and published research.",
    keywords: [
      "Mukhtada Billah NST",
      "University of Jambi Information Systems",
      "full-stack developer Jambi",
      "AI tooling",
      "data research",
    ],
    label: "// Profile",
    title: "About Mukhtada Billah NST",
    caption:
      "Information Systems student at the University of Jambi · Full-stack developer based in Jambi, Indonesia.",
  },
  projects: {
    metadataTitle: "Web, AI & Data Projects",
    metadataDescription:
      "Web, AI, data science, and research projects by Mukhtada Billah NST, with project summaries, technology stacks, and source links.",
    keywords: [
      "Mukhtada Billah NST projects",
      "full-stack web projects",
      "AI projects",
      "data science projects",
      "information systems projects",
    ],
    label: "// Selected Work",
    title: "Web, AI, and data projects",
    caption:
      "Selected work in full-stack web development, AI tooling, data science, research, and community platforms. Filter the list or open GitHub for all 57 public repositories.",
  },
  research: {
    metadataTitle: "Information Systems Research",
    metadataDescription:
      "Published information systems research by Mukhtada Billah NST on education analytics, scheduling optimization, tourism digitization, and safety systems.",
    keywords: [
      "Mukhtada Billah NST research",
      "information systems research",
      "education analytics",
      "genetic algorithm scheduling",
      "Google Scholar",
    ],
    label: "// Research Record",
    title: "Information systems research",
    caption:
      "Published work on education analytics, scheduling optimization, tourism digitization, and safety systems. Open each record on Google Scholar for source and citation details.",
  },
  blog: {
    metadataTitle: "Web Development, AI & Research Blog",
    metadataDescription:
      "Articles by Mukhtada Billah NST about Next.js, AI tooling, open-source software, technical investigations, and information systems research.",
    keywords: [
      "Mukhtada Billah NST blog",
      "Next.js articles",
      "AI tooling",
      "open-source software",
      "information systems research",
    ],
    label: "// Articles & Technical Notes",
    title: "Web development, AI, and research articles",
    caption:
      "Technical articles on Next.js, AI tooling, open-source software, research, and the decisions behind real projects.",
  },
  contact: {
    metadataTitle: "Contact Mukhtada Billah NST",
    metadataDescription:
      "Contact Mukhtada Billah NST about full-stack web development, AI tooling, data projects, research, or community technology work.",
    keywords: [
      "contact Mukhtada Billah NST",
      "full-stack developer Jambi",
      "AI tooling collaboration",
      "information systems research",
    ],
    label: "// Contact",
    title: "Contact Mukhtada",
    caption:
      "For project work, research collaboration, or questions about this portfolio, choose a contact channel below.",
  },
};

export const homeConfig = {
  hero: {
    showGlassContainer: false,
  },
};

export const questChips = [
  { label: `GitHub · ${profile.stats.publicRepos} public repositories`, href: profile.links.github },
  { label: "Google Scholar · 4 publications · 5 citations", href: profile.links.scholar },
  { label: "Information Systems · University of Jambi", href: null },
  { label: "Based in Jambi, Indonesia", href: null },
];

// Curated featured quests (real repos / projects, not the full 57-repo dump).
export const featuredQuests = [
  {
    tier: "TIER S · AI TOOLING",
    title: "Nara - Natural Language Assistant",
    desc: "A local-first natural-language assistant for search, summaries, and communication, with an emphasis on direct, natural responses.",
    tags: ["JavaScript", "NLP", "Assistant"],
    type: "AI", category: "Personal", featured: true,
    href: "https://github.com/yotadaa/nara",
  },
  {
    tier: "TIER A · AI / DOCS",
    title: "Word AI Draft Add-in",
    desc: "A Microsoft Word add-in for AI-assisted drafting inside the document, connecting Office.js with the writing workflow.",
    tags: ["TypeScript", "Office.js", "AI"],
    type: "AI", category: "Personal", featured: true,
    href: "https://github.com/yotadaa/word-ai-draft-addin",
  },
  {
    tier: "TIER S · FULLSTACK · RESEARCH",
    title: "E-Ticket TNKS",
    desc: "An e-ticketing system for Kerinci Seblat National Park, built for faculty research to replace on-site reservations. Contributed across front end and back end.",
    tags: ["Laravel", "Bootstrap", "Research"],
    type: "Web", category: "Research", featured: true,
    href: profile.links.scholar,
  },
  {
    tier: "TIER A · DATA SCIENCE",
    title: "IDR/USD Multivariate Forecast",
    desc: "A multivariate IDR/USD exchange-rate forecast using Vector AutoRegression, developed for a Data Science & Analytics course. ★ 1",
    tags: ["Python", "Jupyter", "VAR"],
    type: "Data", category: "Personal", featured: false,
    href: "https://github.com/yotadaa/data-science-project",
  },
  {
    tier: "TIER A · ALGORITHMS",
    title: "Genetic Algorithm Scheduler",
    desc: "A genetic algorithm for optimizing course schedules, developed experimentally and later published in a journal.",
    tags: ["Python", "Optimization", "Published"],
    type: "Data", category: "Research", featured: false,
    href: "https://github.com/yotadaa/genetic-algorithm",
  },
  {
    tier: "TIER A · WEB / OPS",
    title: "GenBI CMS & Website",
    desc: "Content management and website maintenance for Generasi Baru Indonesia Jambi, including new features, SEO, semantic HTML, and optimization.",
    tags: ["React", "Laravel", "SEO"],
    type: "Web", category: "Community", featured: false,
    href: "https://github.com/yotadaa/cms-genbi",
  },
];

export const homeGlimpses = [
  {
    title: "Project TNKS",
    eyebrow: "Research Web",
    caption: "E-ticketing and mountaineering information for Kerinci Seblat.",
    image: "/assets/glimpses/tnks.webp",
    alt: "Kerinci Seblat National Park website header with mountains and an information panel.",
  },
  {
    title: "Website CMS GenBI Jambi",
    eyebrow: "Community Platform",
    caption: "The CMS and public website for GenBI Jambi.",
    image: "/assets/glimpses/genbi-cms.webp",
    alt: "GenBI Jambi website header with an activity collage and navigation.",
  },
  {
    title: "JICEST 2024",
    eyebrow: "Conference Site",
    caption: "Information and registration website for the FST UNJA conference.",
    image: "/assets/glimpses/jicest-2024.webp",
    alt: "JICEST 2024 website header with a campus backdrop and conference schedule.",
  },
  {
    title: "Raykha Tour Jambi",
    eyebrow: "Travel Website",
    caption: "A travel landing page for Umrah, special Hajj, and tour packages.",
    image: "/assets/glimpses/raykha-tour-jambi.webp",
    alt: "Raykha Tour and Travel header with Masjid al-Haram and the travel logo.",
  },
  {
    title: "DIGDAYA X BI Hackathon",
    eyebrow: "Hackathon Build",
    caption: "A WakafDigital prototype for transparent waqf projects.",
    image: "/assets/glimpses/digdaya-bi.webp",
    alt: "WakafDigital header with a field backdrop, waqf project action, and statistics.",
  },
  {
    title: "Bachelor Thesis Project",
    eyebrow: "Optimization Lab",
    caption: "Algen Lab for scheduling-optimization experiments.",
    image: "/assets/glimpses/thesis-algen-lab.webp",
    alt: "Algen Lab dashboard with an optimized schedule and validation status.",
  },
];

// Journey / level path (real timeline from CV + LinkedIn + Scholar).
export const journey = [
  {
    when: "2020",
    title: "OSN-P Informatics Finalist",
    body: "SMA Negeri 6 Kota Jambi. The starting point that set the direction: solving problems through computing.",
  },
  {
    when: "2022",
    title: "Started Information Systems at UNJA",
    body: "Built a foundation in algorithms, data structures, and systems while staying active in student communities.",
  },
  {
    when: "2024",
    title: "First research and fullstack projects",
    body: "Worked on E-Ticket TNKS research, the JICEST publication committee, and digitalization for small businesses and agrotourism in Pematang Gajah. Published the first paper.",
  },
  {
    when: "2025",
    title: "Teaching, research, and an internship",
    body: "Mentored a Study Club of roughly 30 students, joined the BPS Statistics Corner, served as English Club vice president, and interned as a backend developer at PARTO.ID. Published two more papers on KNN and genetic algorithms.",
  },
  {
    when: "2025 - present",
    title: "IT & Web Development @ GenBI Jambi",
    body: "Managing and developing the GenBI platform with React.js and Laravel, including new features, maintenance, and security optimization.",
  },
];

// Publications - verified from Google Scholar public profile.
export const publications = [
  {
    title:
      "Analisis Prediktif Tren Pendidikan di Indonesia Menggunakan KNN (Studi Kasus Data Pendidikan 2021–2023)",
    authors: "MB Nasution, A Waladi, U Khaira, PEP Utomo",
    venue: "Education Library, 1(2), 62–73",
    year: "2025",
    citedBy: 2,
    href: "https://scholar.google.com/citations?view_op=view_citation&hl=en&user=w-CDgG8AAAAJ&citation_for_view=w-CDgG8AAAAJ:u-x6o8ySG0sC",
  },
  {
    title:
      "Integrasi Agrowisata dan UMKM dalam Digital Promotion Menggunakan Virtual Tour di Desa Pematang Gajah",
    authors: "N Suniyyah, F Heryansah, D Arsa, NF Oktarivia, BA Putra, MB Nst",
    venue: "JITU: Journal Informatic Technology And Communication, 8(2), 82–90",
    year: "2024",
    citedBy: 2,
    href: "https://scholar.google.com/citations?view_op=view_citation&hl=en&user=w-CDgG8AAAAJ&citation_for_view=w-CDgG8AAAAJ:u5HHmVD_uO8C",
  },
  {
    title: "Analisis Implementasi Algoritma Genetika pada Penjadwalan Mata Kuliah",
    authors: "MB Nasution, PEP Utomo, H Iftitah",
    venue: "Jurnal Algoritme, 5(3), 335–349",
    year: "2025",
    citedBy: 1,
    href: "https://scholar.google.com/citations?view_op=view_citation&hl=en&user=w-CDgG8AAAAJ&citation_for_view=w-CDgG8AAAAJ:9yKSN-GCB0IC",
  },
  {
    title:
      "Prototype Sistem Informasi Terintegrasi Pelacakan Jejak dan Peringatan Dini Bahaya di Kerinci Seblat",
    authors: "R Aryani, E Saputra, MF Putri, D Arsa, RR Bintana, U Khaira, MB NST",
    venue: "SEMNASTIK-APTIKOM 2025, 1(1), 128–139",
    year: "2025",
    citedBy: 0,
    href: "https://scholar.google.com/citations?view_op=view_citation&hl=en&user=w-CDgG8AAAAJ&citation_for_view=w-CDgG8AAAAJ:2osOgNQ5qMEC",
  },
];

const blogAuthor = {
  id: "https://me.mukhtada.my.id/#person",
  name: "Mukhtada Billah NST",
  url: "https://me.mukhtada.my.id/",
};

export const blogPosts = [
  {
    id: "blog-knn-research-note",
    slug: "catatan-riset-knn-pendidikan",
    title: "KNN Education Research Notes",
    excerpt: "A draft lore entry about publishing education-trend predictions, from raw data to the KNN model.",
    seoTitle: "KNN Education Research Notes",
    seoDescription: "Research notes on education-trend prediction, covering the path from source data to a K-nearest neighbors model.",
    language: "en-US",
    author: blogAuthor,
    articleSection: "Research Note",
    status: "local-preview",
    tags: ["Research", "Data"],
    publishedAt: "CMS pending",
    readTime: "4 min read",
    coverTone: "research",
    sourceHref: publications[0]?.href,
    blocks: [
      { type: "heading", text: "Research background" },
      { type: "paragraph", text: "This entry is prepared for the Blog CMS. It will draw context from the KNN publication already listed on the Research page." },
      { type: "quote", text: "The CMS exists to document the work, not invent new metrics." },
    ],
  },
  {
    id: "blog-tnks-devlog",
    slug: "dev-log-e-ticket-tnks",
    title: "Dev Log E-Ticket TNKS",
    excerpt: "A draft development log about the TNKS e-ticketing system, its reservation flow, and front-end and back-end contributions.",
    seoTitle: "E-Ticket TNKS Development Log",
    seoDescription: "Development notes on the TNKS e-ticketing system, its reservation flow, and the project's front-end and back-end work.",
    language: "en-US",
    author: blogAuthor,
    articleSection: "Development Log",
    status: "local-preview",
    tags: ["Web", "Research"],
    publishedAt: "CMS pending",
    readTime: "6 min read",
    coverTone: "web",
    sourceHref: profile.links.scholar,
    blocks: [
      { type: "heading", text: "The problem it solves" },
      { type: "paragraph", text: "Online reservations replace on-site booking. This entry is prepared as a technical account grounded in the existing project data." },
      { type: "paragraph", text: "The production version will be stored as JSON blocks from the CMS editor." },
    ],
  },
  {
    id: "blog-community-mentoring",
    slug: "mentor-study-club-batch-4",
    title: "Mentor Study Club Batch 4",
    excerpt: "A draft reflection on teaching web development to roughly 30 students over five days.",
    seoTitle: "Mentor Study Club Batch 4",
    seoDescription: "A draft account of teaching web development to about 30 students over five days during Study Club Batch 4.",
    language: "en-US",
    author: blogAuthor,
    articleSection: "Community Story",
    status: "local-preview",
    tags: ["Community", "Web"],
    publishedAt: "CMS pending",
    readTime: "5 min read",
    coverTone: "community",
    sourceHref: "/about",
    blocks: [
      { type: "heading", text: "Why it matters" },
      { type: "paragraph", text: "Community work is part of the builder's journey, not a separate activity list." },
      { type: "quote", text: "The Blog CMS will document process, decisions, and lessons learned." },
    ],
  },
];

export const skills = [
  { group: "Web Development", level: 7, items: ["Laravel", "Livewire", "React.js", "Next.js", "Semantic HTML", "SEO", "UI/UX"] },
  { group: "Programming & Data", level: 6, items: ["Python", "Data Science", "Data Analytics", "R", "Spreadsheet"] },
  { group: "Research", level: 6, items: ["Scientific Writing", "KNN", "Genetic Algorithm", "Prototyping"] },
  { group: "Community", level: 7, items: ["Mentoring", "English Club (VP)", "Statistical Guidance", "Web Publication"] },
];

export const navLinks = [
  { label: "Home", href: "/" },
  { label: "About", href: "/about" },
  { label: "Projects", href: "/projects" },
  { label: "Research", href: "/research" },
  { label: "Blog", href: "/blog" },
  { label: "Contact", href: "/contact" },
];

// Career / experience (real, from CV + LinkedIn-supplied elements).
export const experience = [
  {
    role: "IT & Web Development",
    org: "Generasi Baru Indonesia (GenBI) Jambi",
    period: "Sep 2025 - present",
    type: "Part-time",
    mode: "Hybrid",
    stack: ["React.js", "Laravel"],
    rarity: "epic",
    rarityLabel: "EPIC",
    detail:
      "Managing website updates and maintenance while developing new features to improve the user experience. Upgrading and optimizing code to keep the platform efficient, secure, and current.",
  },
  {
    role: "Back End Developer",
    org: "PARTO.ID (PT Affan Technology Indonesia)",
    period: "Jul 2025 - Aug 2025",
    type: "Internship",
    mode: "Hybrid",
    stack: ["Golang", "REST API"],
    rarity: "rare",
    rarityLabel: "RARE",
    detail:
      "Worked as a backend developer intern, building and maintaining server-side services for Parto.id.",
  },
  {
    role: "Mentor Study Club Batch 4",
    org: "Himpunan Sistem Informasi UNJA (HIMASI)",
    period: "Feb 2025",
    type: "Volunteer",
    mode: "Onsite",
    stack: ["Web Development", "Mentoring"],
    rarity: "rare",
    rarityLabel: "RARE",
    detail:
      "Taught web development to roughly 30 second- and fourth-semester students over five days, preparing them to continue with their own projects.",
  },
  {
    role: "E-Ticket TNKS Research Member",
    org: "Universitas Jambi × TNKS",
    period: "2024 - 2025",
    type: "Research",
    mode: "Onsite",
    stack: ["Laravel", "Bootstrap"],
    rarity: "epic",
    rarityLabel: "EPIC",
    detail:
      "Helped digitize ticket reservations for Kerinci Seblat National Park as a primary web development assistant, focusing on the front end while contributing to the back end.",
  },
  {
    role: "Publication Committee",
    org: "JICEST (Jambi Int'l Conference on Engineering, Science & Technology)",
    period: "Oct 2024",
    type: "Committee",
    mode: "Onsite",
    stack: ["Web", "Maintenance"],
    rarity: "common",
    rarityLabel: "COMMON",
    detail:
      "Adapted, maintained, and updated the JICEST registration website so participant information remained clear and current.",
  },
  {
    role: "Vice President",
    org: "English Club Universitas Jambi",
    period: "2024 - 2025",
    type: "Organization",
    mode: "Onsite",
    stack: ["Leadership", "Communication"],
    rarity: "rare",
    rarityLabel: "RARE",
    detail:
      "Connected the UNJA Library with English Club members and supported regular English-language practice.",
  },
];

// Achievements - real facts only (no fabricated certificate images).
export const achievements = [
  { title: "OSN-P Informatics Finalist", org: "SMA Negeri 6 Kota Jambi", year: "2020", tag: "Competition", medal: "silver" },
  { title: "PEDAS (National Data Festival) Participant", org: "National", year: "2025", tag: "Data", medal: "bronze" },
  { title: "DIGDAYA X Hackathon Participant", org: "National", year: "2026", tag: "Hackathon", medal: "bronze" },
  { title: "4 Indexed Scientific Publications", org: "Google Scholar · 5 citations · h-index 2", year: "2024–2025", tag: "Research", medal: "gold" },
];

// Contact channels (real).
export const socials = [
  { key: "linkedin", label: "LinkedIn", sub: "Professional profile and direct messages", cta: "View LinkedIn", href: "https://www.linkedin.com/in/mukhtada-nasution-893aaa246/", tone: "linkedin" },
  { key: "github", label: "GitHub", sub: "Source code for web, AI, and data projects", cta: "View GitHub", href: "https://github.com/yotadaa", tone: "github" },
  { key: "scholar", label: "Google Scholar", sub: "Published research and citation records", cta: "View Google Scholar", href: "https://scholar.google.com/citations?user=w-CDgG8AAAAJ&hl=en", tone: "scholar" },
  { key: "blog", label: "Blog", sub: "Articles on web development, AI tooling, and research", cta: "Read the Blog", href: "/blog", tone: "blog" },
  { key: "instagram", label: "Instagram", sub: "Personal updates and creative work", cta: "View Instagram", href: "https://www.instagram.com/tadanasuti.on/", tone: "instagram" },
];
