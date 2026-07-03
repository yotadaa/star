// Real, sourced content for Mukhtada Billah NST.
// Sources: GitHub API (yotadaa), Google Scholar (w-CDgG8AAAAJ), CV PDFs, LinkedIn-supplied elements.
// No fabricated project screenshots. Any missing visual asset is labeled [ASSET PENDING].

export const profile = {
  name: "Mukhtada Billah NST",
  handle: "MB · NST",
  role: "Fullstack Builder · AI Tinkerer · Data Researcher",
  status: "Open to Work",
  location: "Jambi, Indonesia",
  affiliation: "Universitas Jambi — Sistem Informasi",
  avatar: "https://avatars.githubusercontent.com/u/121438055?v=4",
  tagline_id: "Membangun sistem, satu quest pada satu waktu.",
  lede_id:
    "Mahasiswa Sistem Informasi Universitas Jambi yang senang mengubah riset jadi produk yang jalan beneran — fullstack, AI tooling, dan data science, dilihat lewat jendela kabin senja ini.",
  links: {
    github: "https://github.com/yotadaa",
    linkedin: "https://www.linkedin.com/in/mukhtada-nasution-893aaa246/",
    scholar: "https://scholar.google.com/citations?user=w-CDgG8AAAAJ&hl=en",
    blog: "https://write.mukhtada.site",
    instagram: "https://www.instagram.com/tadanasuti.on/",
  },
  stats: {
    publicRepos: 57,
  },
};

export const homeConfig = {
  hero: {
    showGlassContainer: false,
  },
};

export const questChips = [
  { label: `GitHub — ${profile.stats.publicRepos} repo publik`, href: profile.links.github },
  { label: "Scholar — 4 publikasi · 5 sitasi", href: profile.links.scholar },
  { label: "UNJA — Sistem Informasi", href: null },
  { label: "Jambi, ID — base camp", href: null },
];

// Curated featured quests (real repos / projects, not the full 57-repo dump).
export const featuredQuests = [
  {
    tier: "TIER S · AI TOOLING",
    title: "Nara — Natural Language Assistant",
    desc: "Asisten berbasis bahasa natural yang bisa berjalan lokal: membantu mencari, meringkas, dan berkomunikasi. Fokus pada respons yang terasa manusiawi.",
    tags: ["JavaScript", "NLP", "Assistant"],
    type: "AI", category: "Personal", featured: true,
    href: "https://github.com/yotadaa/nara",
  },
  {
    tier: "TIER A · AI / DOCS",
    title: "Word AI Draft Add-in",
    desc: "Add-in Microsoft Word untuk drafting berbantuan AI langsung di dalam dokumen — menyatukan Office.js dengan alur penulisan.",
    tags: ["TypeScript", "Office.js", "AI"],
    type: "AI", category: "Personal", featured: true,
    href: "https://github.com/yotadaa/word-ai-draft-addin",
  },
  {
    tier: "TIER S · FULLSTACK · RISET",
    title: "E-Ticket TNKS",
    desc: "Sistem e-ticketing untuk Taman Nasional Kerinci Seblat pada penelitian dosen — reservasi online menggantikan pemesanan on-site. Asisten web developer (front & back).",
    tags: ["Laravel", "Bootstrap", "Research"],
    type: "Web", category: "Research", featured: true,
    href: profile.links.scholar,
  },
  {
    tier: "TIER A · DATA SCIENCE",
    title: "IDR/USD Multivariate Forecast",
    desc: "Prediksi nilai tukar IDR/USD dengan Vector AutoRegression berbasis banyak variabel — proyek mata kuliah Data Science & Analytics. ★ 1",
    tags: ["Python", "Jupyter", "VAR"],
    type: "Data", category: "Personal", featured: false,
    href: "https://github.com/yotadaa/data-science-project",
  },
  {
    tier: "TIER A · ALGORITMA",
    title: "Genetic Algorithm Scheduler",
    desc: "Algoritma genetika untuk menemukan penjadwalan mata kuliah paling optimal — dieksperimenkan lalu diterbitkan di jurnal.",
    tags: ["Python", "Optimization", "Published"],
    type: "Data", category: "Research", featured: false,
    href: "https://github.com/yotadaa/genetic-algorithm",
  },
  {
    tier: "TIER A · WEB / OPS",
    title: "GenBI CMS & Website",
    desc: "Content Management System dan pemeliharaan website Generasi Baru Indonesia Jambi: fitur baru, SEO, semantic HTML, dan optimasi.",
    tags: ["React", "Laravel", "SEO"],
    type: "Web", category: "Community", featured: false,
    href: "https://github.com/yotadaa/cms-genbi",
  },
];

export const homeGlimpses = [
  {
    title: "Project TNKS",
    eyebrow: "Research Web",
    caption: "E-ticketing dan informasi pendakian Kerinci Seblat.",
    image: "/assets/glimpses/tnks.webp",
    alt: "Header website resmi Taman Nasional Kerinci Seblat dengan gunung dan panel informasi.",
  },
  {
    title: "Website CMS GenBI Jambi",
    eyebrow: "Community Platform",
    caption: "CMS dan wajah publik GenBI Provinsi Jambi.",
    image: "/assets/glimpses/genbi-cms.webp",
    alt: "Header website GenBI Provinsi Jambi dengan kolase kegiatan dan navigasi.",
  },
  {
    title: "JICEST 2024",
    eyebrow: "Conference Site",
    caption: "Website informasi dan pendaftaran konferensi FST UNJA.",
    image: "/assets/glimpses/jicest-2024.webp",
    alt: "Header website JICEST 2024 dengan latar kampus dan jadwal konferensi.",
  },
  {
    title: "Raykha Tour Jambi",
    eyebrow: "Travel Website",
    caption: "Landing page travel Umroh, Haji Khusus, dan wisata.",
    image: "/assets/glimpses/raykha-tour-jambi.webp",
    alt: "Header Raykha Tour and Travel dengan latar Masjidil Haram dan logo travel.",
  },
  {
    title: "DIGDAYA X BI Hackathon",
    eyebrow: "Hackathon Build",
    caption: "Prototype WakafDigital untuk transparansi proyek wakaf.",
    image: "/assets/glimpses/digdaya-bi.webp",
    alt: "Header WakafDigital dengan latar ladang, CTA proyek wakaf, dan statistik.",
  },
  {
    title: "Bachelor Thesis Project",
    eyebrow: "Optimization Lab",
    caption: "Algen Lab untuk eksperimen optimasi penjadwalan.",
    image: "/assets/glimpses/thesis-algen-lab.webp",
    alt: "Dashboard Algen Lab dengan jadwal hasil optimasi dan status valid.",
  },
];

// Journey / level path (real timeline from CV + LinkedIn + Scholar).
export const journey = [
  {
    when: "2020",
    title: "Finalis OSN-P Informatika",
    body: "SMA Negeri 6 Kota Jambi. Titik nol yang menegaskan arah: memecahkan masalah lewat komputasi.",
  },
  {
    when: "2022",
    title: "Mulai S1 Sistem Informasi, UNJA",
    body: "Fondasi algoritma, struktur data, dan sistem — sambil aktif di komunitas mahasiswa.",
  },
  {
    when: "2024",
    title: "Riset & proyek fullstack pertama",
    body: "Asisten riset E-Ticket TNKS, Publication Committee JICEST, dan digitalisasi UMKM/Agrowisata Desa Pematang Gajah. Publikasi pertama terbit.",
  },
  {
    when: "2025",
    title: "Mengajar, meneliti, magang",
    body: "Mentor Study Club (±30 mahasiswa), anggota Pojok Statistik (BPS), VP English Club, dan Backend Developer intern di PARTO.ID. Dua publikasi baru: KNN & Genetic Algorithm.",
  },
  {
    when: "2025 — kini",
    title: "IT & Web Development @ GenBI Jambi",
    body: "Mengelola dan mengembangkan platform GenBI dengan React.js + Laravel: fitur baru, maintenance, dan optimasi keamanan.",
  },
];

// Publications — verified from Google Scholar public profile.
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
  { label: "Contact", href: "/contact" },
];

// Career / experience (real, from CV + LinkedIn-supplied elements).
export const experience = [
  {
    role: "IT & Web Development",
    org: "Generasi Baru Indonesia (GenBI) Jambi",
    period: "Sep 2025 — Sekarang",
    type: "Part-time",
    mode: "Hybrid",
    stack: ["React.js", "Laravel"],
    rarity: "epic",
    rarityLabel: "EPIC",
    detail:
      "Mengelola update website, maintenance, dan mengembangkan fitur baru untuk meningkatkan UX. Melakukan upgrade & optimasi kode agar platform tetap efisien, aman, dan modern.",
  },
  {
    role: "Back End Developer",
    org: "PARTO.ID (PT Affan Technology Indonesia)",
    period: "Jul 2025 — Agu 2025",
    type: "Internship",
    mode: "Hybrid",
    stack: ["Golang", "REST API"],
    rarity: "rare",
    rarityLabel: "RARE",
    detail:
      "Magang sebagai backend developer, membangun dan memelihara layanan sisi server untuk produk Parto.id.",
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
      "Mengajar ±30 mahasiswa semester 2 & 4 selama lima hari. Peserta memahami proses pembuatan website dan siap menjalankan proyek lanjutan.",
  },
  {
    role: "Anggota Penelitian E-Tiket TNKS",
    org: "Universitas Jambi × TNKS",
    period: "2024 — 2025",
    type: "Research",
    mode: "Onsite",
    stack: ["Laravel", "Bootstrap"],
    rarity: "epic",
    rarityLabel: "EPIC",
    detail:
      "Membantu digitalisasi pemesanan tiket Taman Nasional Kerinci Seblat. Asisten web developer utama, fokus front-end sekaligus kontribusi back-end.",
  },
  {
    role: "Publication Committee",
    org: "JICEST (Jambi Int'l Conference on Engineering, Science & Technology)",
    period: "Okt 2024",
    type: "Committee",
    mode: "Onsite",
    stack: ["Web", "Maintenance"],
    rarity: "common",
    rarityLabel: "COMMON",
    detail:
      "Menyesuaikan, memelihara, dan memperbarui website pendaftaran peserta JICEST agar informasi tersampaikan dengan baik.",
  },
  {
    role: "Vice President",
    org: "English Club Universitas Jambi",
    period: "2024 — 2025",
    type: "Organization",
    mode: "Onsite",
    stack: ["Leadership", "Communication"],
    rarity: "rare",
    rarityLabel: "RARE",
    detail:
      "Menjembatani Perpustakaan UNJA dengan anggota English Club dan aktif dalam praktik bahasa Inggris.",
  },
];

// Achievements — real facts only (no fabricated certificate images).
export const achievements = [
  { title: "Finalis OSN-P Informatika", org: "SMA Negeri 6 Kota Jambi", year: "2020", tag: "Kompetisi", medal: "silver" },
  { title: "Peserta PEDAS (Pesta Data Nasional)", org: "Nasional", year: "2025", tag: "Data", medal: "bronze" },
  { title: "Peserta DIGDAYA X Hackathon", org: "Nasional", year: "2026", tag: "Hackathon", medal: "bronze" },
  { title: "4 Publikasi Ilmiah Terindeks", org: "Google Scholar · 5 sitasi · h-index 2", year: "2024–2025", tag: "Riset", medal: "gold" },
];

// Contact channels (real).
export const socials = [
  { key: "linkedin", label: "Let's Connect", sub: "Terhubung secara profesional", cta: "Buka LinkedIn", href: "https://www.linkedin.com/in/mukhtada-nasution-893aaa246/", tone: "linkedin" },
  { key: "github", label: "Explore the Code", sub: "57 repo open-source & eksperimen", cta: "Buka GitHub", href: "https://github.com/yotadaa", tone: "github" },
  { key: "scholar", label: "Read the Research", sub: "Publikasi terindeks di Scholar", cta: "Buka Scholar", href: "https://scholar.google.com/citations?user=w-CDgG8AAAAJ&hl=en", tone: "scholar" },
  { key: "blog", label: "Read My Notes", sub: "Tulisan di write.mukhtada.site", cta: "Buka Blog", href: "https://write.mukhtada.site", tone: "blog" },
  { key: "instagram", label: "Follow My Journey", sub: "Sisi kreatif sehari-hari", cta: "Buka Instagram", href: "https://www.instagram.com/tadanasuti.on/", tone: "instagram" },
];
