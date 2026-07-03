"use client";

import { useMemo, useState } from "react";
import { PixelButton, RarityTag, SpriteIcon } from "@/components/claude";

const filters = ["all", "scroll", "tool", "artifact", "medal", "key"];

export default function InventoryGrid({ items }) {
  const [filter, setFilter] = useState("all");
  const [selectedId, setSelectedId] = useState(items[0]?.id ?? null);
  const visibleItems = useMemo(
    () => (filter === "all" ? items : items.filter((item) => item.type === filter)),
    [filter, items]
  );
  const selected = items.find((item) => item.id === selectedId);

  return (
    <div className="inventory-panel">
      <div className="inventory-filter" aria-label="Filter inventory">
        {filters.map((itemFilter) => (
          <PixelButton
            key={itemFilter}
            className="inventory-filter-btn"
            selected={filter === itemFilter}
            onClick={() => {
              setFilter(itemFilter);
              const next = itemFilter === "all" ? items[0] : items.find((item) => item.type === itemFilter);
              setSelectedId(next?.id ?? null);
            }}
          >
            {itemFilter}
          </PixelButton>
        ))}
      </div>

      {visibleItems.length === 0 ? (
        <div className="player-empty">Inventory masih kosong untuk tipe ini. Selesaikan mission pertama untuk membuka item.</div>
      ) : (
        <div className="inventory-grid">
          {visibleItems.map((item) => (
            <button
              type="button"
              key={item.id}
              className={`inventory-item ${selectedId === item.id ? "active" : ""}`}
              onClick={() => setSelectedId(item.id)}
              aria-pressed={selectedId === item.id}
            >
              <SpriteIcon id={item.icon} size={34} />
              <span className="inventory-type">{item.type}</span>
              <span className="inventory-name">{item.name}</span>
            </button>
          ))}
        </div>
      )}

      {selected && (
        <article className="inventory-detail">
          <RarityTag rarity={selected.rarity} label={selected.rarity.toUpperCase()} className="player-rarity" />
          <h3>{selected.name}</h3>
          <p>{selected.description}</p>
          <span className="player-meta">Acquired: {selected.acquiredAt}</span>
          {selected.linkTo && (
            <a className="inventory-link" href={selected.linkTo} target={selected.linkTo.startsWith("http") ? "_blank" : undefined} rel={selected.linkTo.startsWith("http") ? "noopener noreferrer" : undefined}>
              Buka sumber
            </a>
          )}
        </article>
      )}
    </div>
  );
}
