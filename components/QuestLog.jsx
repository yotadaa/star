import { questChips } from "@/lib/data";
import { HudStatusStrip, SpriteIcon } from "@/components/claude";

const ICONS = ["icon-star-level", "icon-flame-streak", "icon-command", "icon-pin"];

export default function QuestLog() {
  const items = questChips.map((chip, index) => ({
    label: { text: chip.label, href: chip.href },
    accent: index === 0 || index === 1 ? "gold" : "aurora",
    icon: <SpriteIcon id={ICONS[index] || "icon-star-level"} size={14} />,
  }));

  return (
    <div
      className="questlog"
      role="list"
      aria-label="Bukti cepat"
      data-testid="quest-log"
    >
      <HudStatusStrip items={items} />
    </div>
  );
}
