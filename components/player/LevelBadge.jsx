export default function LevelBadge({ level, className = "" }) {
  const safeLevel = Math.max(1, Number(level) || 1);

  return (
    <span
      className={`player-level-badge ${className}`.trim()}
      aria-label={`Level ${safeLevel}`}
    >
      {safeLevel}
    </span>
  );
}
