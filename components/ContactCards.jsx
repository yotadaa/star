import Reveal from "./Reveal";
import { Linkedin, Github, GraduationCap, PenLine, Instagram, ArrowUpRight } from "lucide-react";
import { PortalCard } from "@/components/claude";
import { socials } from "@/lib/data";

const ICONS = { linkedin: Linkedin, github: Github, scholar: GraduationCap, blog: PenLine, instagram: Instagram };
const ACCENTS = {
  linkedin: "#0a66c2",
  github: "#2c333d",
  scholar: "#2b8a7a",
  blog: "#c9552f",
  instagram: "#e06a45",
};

export default function ContactCards({ channels = socials, source = "local" }) {
  return (
    <div className="contact-grid" data-testid="contact-cards" data-source={source}>
      {channels.map((s, i) => {
        const Ic = ICONS[s.key] || ArrowUpRight;
        return (
          <Reveal key={s.key} delay={i * 60} data-testid={`contact-${s.key}`}>
            <PortalCard
              href={s.href}
              accent={ACCENTS[s.key] || "var(--ink)"}
              icon={<Ic size={22} />}
              title={s.label}
              description={s.sub}
              cta={`${s.cta} ->`}
              eventKey={s.key}
              className={s.tone}
            />
          </Reveal>
        );
      })}
    </div>
  );
}
