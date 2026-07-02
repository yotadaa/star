import { questChips } from "@/lib/data";

export default function QuestLog() {
  return (
    <div
      className="questlog"
      role="list"
      aria-label="Bukti cepat"
      data-testid="quest-log"
    >
      {questChips.map((c) =>
        c.href ? (
          <a
            className="chip"
            role="listitem"
            key={c.label}
            href={c.href}
            target="_blank"
            rel="noopener noreferrer"
          >
            <span className="pip" />
            {c.label}
          </a>
        ) : (
          <div className="chip" role="listitem" key={c.label}>
            <span className="pip" />
            {c.label}
          </div>
        )
      )}
    </div>
  );
}
