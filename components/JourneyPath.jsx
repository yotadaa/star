import Reveal from "./Reveal";
import { CurrentMarker } from "@/components/claude";
import { journey } from "@/lib/data";

function Path() {
  return (
    <div className="journey-path">
      {journey.map((lv, i) => {
        const isCurrent = i === journey.length - 1;
        return (
          <Reveal key={lv.when} className={`level ${isCurrent ? "is-current" : ""}`} delay={i * 80} data-testid={`journey-level-${i}`}>
            <span className="when">{lv.when}</span>
            {isCurrent && <CurrentMarker className="journey-current" />}
            <h3>{lv.title}</h3>
            <p>{lv.body}</p>
          </Reveal>
        );
      })}
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
          <p>Bukan CV datar - ini level path dari titik mulai sampai posisi sekarang.</p>
        </div>
        <Path />
      </div>
    </section>
  );
}
