import Link from "next/link";
import { AtSign, BriefcaseBusiness, Code2, Download, ExternalLink, FileText, GraduationCap, Globe2, MapPin, Phone, Search, Users, BarChart3 } from "lucide-react";
import LoreDetailDialog from "@/components/lore/LoreDetailDialog";
import { loreEducation, loreExperience, loreOrganizations, loreProfile, loreSections, loreSkills } from "@/lib/loreData";

const icons = { code: Code2, chart: BarChart3, search: Search };

function Record({ item, kind, index }) {
  const dialogId = `lore-${kind}-${index}`;
  return (
    <article className="lore-record">
      <div className="lore-record-heading">
        <div>
          <h3>{item.title}</h3>
          <p>{item.organization}</p>
        </div>
        <time>{item.period}</time>
      </div>
      <p className="lore-record-summary">{item.summary}</p>
      <LoreDetailDialog id={dialogId} {...item} />
    </article>
  );
}

export default function LoreDocument() {
  return (
    <div className="lore-document">
      <section className="lore-cover" aria-labelledby="lore-title">
        <div className="lore-cover-photo"><img src={loreProfile.portrait} alt="Portrait of Mukhtada Billah NST" /></div>
        <div className="lore-cover-copy">
          <span className="pixel-label">// Personal record · 2026</span>
          <h1 id="lore-title">{loreProfile.name}</h1>
          <p className="lore-role">{loreProfile.role}</p>
          <p>{loreProfile.summary}</p>
          <div className="lore-contact-grid" aria-label="Contact details">
            <a href={`tel:${loreProfile.phone}`}><Phone size={16} aria-hidden="true" /> {loreProfile.phone}</a>
            <a href={`mailto:${loreProfile.email}`}><AtSign size={16} aria-hidden="true" /> {loreProfile.email}</a>
            <a href={loreProfile.website}><Globe2 size={16} aria-hidden="true" /> me.mukhtada.my.id</a>
            <a href={loreProfile.linkedin} target="_blank" rel="noreferrer"><ExternalLink size={16} aria-hidden="true" /> LinkedIn profile</a>
            <span><MapPin size={16} aria-hidden="true" /> {loreProfile.location}</span>
          </div>
          <div className="lore-actions">
            <a className="btn primary" href="/documents/mukhtada-nasution-cv-english.pdf" download><Download size={16} aria-hidden="true" /> Download CV</a>
            <Link className="btn secondary" href="/projects"><BriefcaseBusiness size={16} aria-hidden="true" /> View projects</Link>
          </div>
        </div>
      </section>

      <nav className="lore-index" aria-label="CV sections">
        {loreSections.map((section) => <a key={section.id} href={`#${section.id}`}>{section.label}</a>)}
      </nav>

      <section id="summary" className="lore-section" aria-labelledby="summary-title">
        <span className="pixel-label">// Summary</span><h2 id="summary-title">A builder-researcher in progress</h2>
        <p>{loreProfile.summary}</p>
      </section>

      <section id="education" className="lore-section" aria-labelledby="education-title">
        <div className="lore-section-heading"><GraduationCap size={22} aria-hidden="true" /><div><span className="pixel-label">// Education</span><h2 id="education-title">Education</h2></div></div>
        <div className="lore-record-list">{loreEducation.map((item, index) => <Record key={item.title} item={item} kind="education" index={index} />)}</div>
      </section>

      <section id="organizations" className="lore-section" aria-labelledby="organizations-title">
        <div className="lore-section-heading"><Users size={22} aria-hidden="true" /><div><span className="pixel-label">// Organizations</span><h2 id="organizations-title">Organizations</h2></div></div>
        <div className="lore-record-list">{loreOrganizations.map((item, index) => <Record key={item.title} item={item} kind="organizations" index={index} />)}</div>
      </section>

      <section id="experience" className="lore-section" aria-labelledby="experience-title">
        <div className="lore-section-heading"><BriefcaseBusiness size={22} aria-hidden="true" /><div><span className="pixel-label">// Experience</span><h2 id="experience-title">Experience</h2></div></div>
        <div className="lore-record-list">{loreExperience.map((item, index) => <Record key={item.title} item={item} kind="experience" index={index} />)}</div>
      </section>

      <section id="skills" className="lore-section" aria-labelledby="skills-title">
        <div className="lore-section-heading"><Code2 size={22} aria-hidden="true" /><div><span className="pixel-label">// Skills</span><h2 id="skills-title">Skills and working tools</h2></div></div>
        <div className="lore-skills-grid">{loreSkills.map((skill) => { const Icon = icons[skill.icon]; return <article className="lore-skill-card" key={skill.title}><Icon size={22} aria-hidden="true" /><h3>{skill.title}</h3><ul>{skill.items.map((item) => <li key={item}>{item}</li>)}</ul><p>{skill.detail}</p></article>; })}</div>
      </section>

      <section className="lore-evidence" aria-labelledby="evidence-title"><FileText size={22} aria-hidden="true" /><div><span className="pixel-label">// Continue exploring</span><h2 id="evidence-title">See the work behind the record</h2><p>Explore project source, published research, and technical notes.</p><div className="lore-evidence-links"><Link href="/projects">Projects</Link><Link href="/research">Research</Link><Link href="/blog">Blog</Link><a href="https://github.com/yotadaa" target="_blank" rel="noreferrer">GitHub</a></div></div></section>
    </div>
  );
}
