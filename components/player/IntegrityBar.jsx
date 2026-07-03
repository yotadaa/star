export default function IntegrityBar({
  current = 0,
  target = 1,
  segments = 10,
  isMax = false,
  label,
}) {
  const safeSegments = Math.max(1, segments);
  const safeTarget = Math.max(1, target);
  const safeCurrent = Math.min(safeTarget, Math.max(0, current));
  const filled = isMax
    ? safeSegments
    : Math.min(safeSegments, Math.max(0, Math.round((safeCurrent / safeTarget) * safeSegments)));
  const accessibleLabel = label || (isMax ? "Level maksimum tercapai" : `${safeCurrent} dari ${safeTarget} Player Points`);

  return (
    <div
      className="integrity-progress"
      role="progressbar"
      aria-label="System Integrity"
      aria-valuemin={0}
      aria-valuemax={safeTarget}
      aria-valuenow={isMax ? safeTarget : safeCurrent}
      aria-valuetext={accessibleLabel}
    >
      <div className="integrity-track" aria-hidden="true">
        {Array.from({ length: safeSegments }).map((_, index) => (
          <span key={index} className={`integrity-segment ${index < filled ? "filled" : ""}`} />
        ))}
      </div>
      <span className="integrity-value">{accessibleLabel}</span>
    </div>
  );
}
