export default function ProgressBarSegmented({
  current = 0,
  target = 1,
  segments = 10,
  label,
}) {
  const safeTarget = Math.max(1, target);
  const filled = Math.min(segments, Math.max(0, Math.ceil((current / safeTarget) * segments)));

  return (
    <div className="segmented-progress" aria-label={label ?? `${current} dari ${target}`}>
      <div className="segmented-track" aria-hidden="true">
        {Array.from({ length: segments }).map((_, index) => (
          <span key={index} className={`segment ${index < filled ? "filled" : ""}`} />
        ))}
      </div>
      {label && <span className="segmented-label">{label}</span>}
    </div>
  );
}
