import Reveal from "./Reveal";
import { Linkedin, Github, GraduationCap, PenLine, Instagram, ArrowUpRight } from "lucide-react";
import { socials } from "@/lib/data";

const ICONS = { linkedin: Linkedin, github: Github, scholar: GraduationCap, blog: PenLine, instagram: Instagram };

export default function ContactCards() {
  return (
    <div className="contact-grid" data-testid="contact-cards">
      {socials.map((s, i) => {
        const Ic = ICONS[s.key] || ArrowUpRight;
        return (
          <Reveal
            as="a"
            key={s.key}
            href={s.href}
            target="_blank"
            rel="noopener noreferrer"
            className={`contact-card ${s.tone}`}
            delay={i * 60}
            data-testid={`contact-${s.key}`}
          >
            <span className="cc-ic"><Ic size={22} /></span>
            <div>
              <h3>{s.label}</h3>
              <p>{s.sub}</p>
            </div>
            <span className="cc-cta">{s.cta} ↗</span>
          </Reveal>
        );
      })}
    </div>
  );
}
