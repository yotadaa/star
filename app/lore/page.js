import LoreDocument from "@/components/lore/LoreDocument";
import { pageMetadata, absoluteUrl, SITE_URL } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Interactive CV",
  description: "Read Mukhtada Billah NST's interactive CV, covering Information Systems education, web development, AI tooling, data research, and community work.",
  path: "/lore",
  tags: ["Mukhtada Billah NST CV", "full-stack developer Jambi", "Information Systems student", "AI tooling", "data research"],
});

export default function LorePage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ProfilePage",
    "@id": `${SITE_URL}/lore#profile-page`,
    url: absoluteUrl("/lore"),
    name: "Interactive CV · Mukhtada Billah NST",
    description: "Education, organization work, development experience, research support, and technical skills from Mukhtada Billah NST's CV.",
    isPartOf: { "@id": `${SITE_URL}/#website` },
    mainEntity: { "@id": `${SITE_URL}/#person` },
    inLanguage: "en-US",
  };

  return <><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} /><LoreDocument /></>;
}
