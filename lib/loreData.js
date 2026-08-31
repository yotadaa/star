import { profile } from "@/lib/data";

export const loreSections = [
  { id: "summary", label: "Summary" },
  { id: "education", label: "Education" },
  { id: "organizations", label: "Organizations" },
  { id: "experience", label: "Experience" },
  { id: "skills", label: "Skills" },
];

export const loreProfile = {
  name: profile.name,
  role: "Information Systems student · Full-stack developer · AI tooling · Data research",
  location: profile.location,
  phone: "0895703051945",
  email: "mukhtadanasution@gmail.com",
  website: "https://me.mukhtada.my.id",
  linkedin: "https://www.linkedin.com/in/mukhtada-nasution-893aaa246/",
  portrait: "/assets/lore/mukhtada-portrait.jpg",
  summary:
    "I am an Information Systems student at the University of Jambi who works across academic case studies, scientific writing, web products, and community technology. My experience includes full-stack and mobile development, data analysis, research support, mentoring, and improving the GenBI Jambi website.",
};

export const loreEducation = [
  {
    title: "Information Systems",
    organization: "University of Jambi",
    period: "2022 - Present",
    summary: "Undergraduate study with work spanning data, student organizations, and national technology events.",
    detail:
      "Actively contributes to lecture sessions and has participated in PEDAS (National Data Festival) 2025 and DIGDAYA X Hackathon 2026. Also participates in the Information Systems Student Association and the University of Jambi English Club.",
  },
  {
    title: "Senior High School",
    organization: "SMA Negeri 6 Kota Jambi",
    period: "2019 - 2022",
    summary: "Science-competition experience alongside regular senior high school study.",
    detail:
      "Was active in teaching and learning activities. Finalist in the 2020 Provincial National Science Olympiad (OSN) and participant in the 2019 German Language Olympiad organized by the Goethe-Institut Indonesien.",
  },
];

export const loreOrganizations = [
  {
    title: "IT and Website Development Team",
    organization: "Generasi Baru Indonesia (GenBI) Jambi",
    period: "2025 - 2026",
    summary: "News publishing, semantic HTML, SEO, security, and interface work for GenBI Jambi.",
    detail:
      "Contributed to updating GenBI news and developed the GenBI website using SEO and semantic HTML. Used Google Search Console, and worked on security, user interface, and user experience improvements.",
  },
  {
    title: "Research and Technology Division",
    organization: "Information Systems Student Association",
    period: "2025 - 2026",
    summary: "Website maintenance, Study Club committee work, and cross-division publishing support.",
    detail:
      "Maintained and updated the Information Systems Student Association website, participated in the Study Club committee, and collaborated with other divisions on association news.",
  },
  {
    title: "Vice President",
    organization: "University of Jambi English Club",
    period: "2024 - 2025",
    summary: "Member practice, community coordination, and liaison work with the university library.",
    detail:
      "Practiced English with members and served as a bridge between the University of Jambi Library, which organizes the community, and English Club members.",
  },
  {
    title: "Data and Research Member",
    organization: "University of Jambi Statistics Corner",
    period: "2024 - 2025",
    summary: "Statistical guidance and help locating official data through the BPS website.",
    detail:
      "Served visitors who needed statistical guidance, including helping them find requested statistical data through the official BPS website.",
  },
];

export const loreExperience = [
  {
    title: "Fullstack Developer",
    organization: "PT Affan Technology (Parto.id)",
    period: "July - August 2025",
    summary: "Internship work on a React Native attendance app and its Go-based backend integration.",
    detail:
      "During the internship, contributed to backend and frontend work. The team developed an attendance application integrated with Parto.id's central server using Golang (Go Gin) and React Native. Contributed primarily to React Native and also assisted with backend work.",
  },
  {
    title: "Study Club Batch 4 Mentor",
    organization: "Information Systems Student Association",
    period: "February 2025",
    summary: "Five days of web development instruction for a 30-student class.",
    detail:
      "Shared web development knowledge with Information Systems students in semesters 2 and 4. Taught a class of 30 students for five days and adjusted the speaking style to support their understanding. Participants gained a clearer understanding of the website creation process and project work.",
  },
  {
    title: "E-Ticket TNKS Research Member",
    organization: "Information Systems Lecturer and TNKS",
    period: "2024 - 2025",
    summary: "Research and implementation support for the digitization of TNKS ticket bookings.",
    detail:
      "Applied study to a real-world ticketing case. TNKS collaborated with the University of Jambi to digitize ticket bookings. Served as an assistant to the lead Web Developer and contributed to coding and interface design.",
  },
  {
    title: "Publication Committee",
    organization: "Jambi International Conference on Engineering, Science, and Technology (JICEST)",
    period: "October 2024",
    summary: "Registration-site maintenance and clearer participant information for JICEST.",
    detail:
      "Adjusted and maintained the JICEST participant registration website, updating it so information was clear and participants could register more easily.",
  },
  {
    title: "Publication Member",
    organization: "Digital Initiation Agrotourism Pematang Gajah, University of Jambi Village Innovation Program",
    period: "October - December 2024",
    summary: "A WordPress site supporting local MSME and agrotourism marketing in Pematang Gajah.",
    detail:
      "Developed a WordPress website for the marketing needs of MSMEs and agrotourism in Pematang Gajah Village.",
  },
];

export const loreSkills = [
  {
    title: "Web and Mobile Development",
    icon: "code",
    items: ["Laravel", "Livewire", "React", "React Native"],
    detail: "Builds websites with Laravel and Livewire, works with React and similar JavaScript frameworks, and develops mobile applications using React Native.",
  },
  {
    title: "Programming and Data Analysis",
    icon: "chart",
    items: ["Python", "Data Science", "Data Analytics", "Google Sheets / MS Excel", "R"],
    detail: "Creates programs for course requirements, processes and analyzes data, and works with Python for data science and analytics alongside spreadsheets and R.",
  },
  {
    title: "UI/UX and Search Engine Optimization",
    icon: "search",
    items: ["UI/UX", "Semantic HTML", "SEO", "Google Search Console"],
    detail: "Improves interfaces so websites are clearer and easier to use, and applies semantic HTML and Google Search Console in SEO work.",
  },
];
