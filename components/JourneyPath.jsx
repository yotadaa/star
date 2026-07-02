import Reveal from "./Reveal";
import { journey } from "@/lib/data";

function Path() {
  return (
    <div className="journey-path">
      {journey.map((lv, i) => (
        <Reveal key={lv.when} className="level" delay={i * 80} data-testid={`journey-level-${i}`}>
          <span className="when">{lv.when}</span>
          <h3>{lv.title}</h3>
          <p>{lv.body}</p>
        </Reveal>
      ))}
    </div>
  );
}

export default function JourneyPath({ embedded = false }) {
  if (embedded) return <Path />;
  return (
    <section className="section-band alt" id="journey">
      <div className="content">
        <div className="section-head">
          <span className="pixel-label">// Journey Log</span>
          <h2>Perjalanan riset &amp; akademik</h2>
          <p>Bukan CV datar — ini level path dari titik mulai sampai posisi sekarang.</p>
        </div>
        <Path />
      </div>
    </section>
  );
}
