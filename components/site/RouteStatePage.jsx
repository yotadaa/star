import Link from "next/link";
import { SpriteIcon } from "@/components/claude";

export default function RouteStatePage({
  code,
  label,
  title,
  description,
  icon,
  primaryHref = "/",
  primaryLabel = "Kembali ke Home",
  secondaryHref,
  secondaryLabel,
  children,
}) {
  return (
    <section className="route-state-page" aria-labelledby="route-state-title">
      <div className="route-state-grid" aria-hidden="true" />
      <div className="route-state-card">
        <div className="route-state-code">{code}</div>
        <span className="route-state-icon" aria-hidden="true">
          <SpriteIcon id={icon} size={42} />
        </span>
        <p className="route-state-label">{label}</p>
        <h1 id="route-state-title">{title}</h1>
        <p className="route-state-description">{description}</p>
        {children}
        <div className="route-state-actions">
          <Link href={primaryHref} className="pixel-button route-state-primary">
            {primaryLabel}
          </Link>
          {secondaryHref && (
            <Link href={secondaryHref} className="pixel-button route-state-secondary">
              {secondaryLabel}
            </Link>
          )}
        </div>
      </div>
    </section>
  );
}
