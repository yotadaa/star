"use client";

import { useMemo, useState } from "react";
import LoginButton from "@/components/auth/LoginButton";
import useCurrentUser from "@/components/auth/useCurrentUser";
import { PixelButton, RarityTag, SpriteIcon } from "@/components/claude";

const filters = ["all", "scroll", "tool", "artifact", "medal", "key"];

export default function InventoryGrid({ items }) {
  const [filter, setFilter] = useState("all");
  const [selectedId, setSelectedId] = useState(items[0]?.id ?? null);
  const [formOpen, setFormOpen] = useState(false);
  const { isOwner, isConfigured } = useCurrentUser();
  const visibleItems = useMemo(
    () => (filter === "all" ? items : items.filter((item) => item.type === filter)),
    [filter, items]
  );
  const selected = items.find((item) => item.id === selectedId);

  return (
    <div className="inventory-panel">
      <div className="inventory-owner-tools">
        {isOwner ? (
          <>
            <PixelButton className="inventory-add-toggle" onClick={() => setFormOpen((value) => !value)}>
              <SpriteIcon id="icon-admin-shield" size={15} />
              Tambah Item
            </PixelButton>
            {formOpen && (
              <form
                className="inventory-add-form"
                onSubmit={(event) => event.preventDefault()}
              >
                <label>
                  Nama Item
                  <input type="text" required placeholder="Scroll: Riset terbaru" />
                </label>
                <label>
                  Tipe
                  <select defaultValue="scroll">
                    <option value="scroll">Scroll - riset</option>
                    <option value="tool">Tool - skill</option>
                    <option value="artifact">Artifact - proyek</option>
                    <option value="medal">Medal - kompetisi/organisasi</option>
                    <option value="key">Key - milestone</option>
                  </select>
                </label>
                <label>
                  Rarity
                  <select defaultValue="rare">
                    <option value="epic">Epic</option>
                    <option value="rare">Rare</option>
                    <option value="common">Common</option>
                  </select>
                </label>
                <label className="inventory-add-wide">
                  Deskripsi
                  <textarea rows={3} placeholder="Konteks singkat item ini" />
                </label>
                <PixelButton>
                  <SpriteIcon id="icon-database-offline" size={15} />
                  Simpan setelah backend aktif
                </PixelButton>
              </form>
            )}
          </>
        ) : !isConfigured ? (
          <div className="inventory-owner-setup">
            <SpriteIcon id="icon-admin-shield" size={24} />
            <div>
              <h3>Owner tools menunggu Login ke System</h3>
              <p>Manual add inventory akan aktif setelah Auth.js dan Supabase dikonfigurasi. Pengunjung tidak melihat tombol tambah item.</p>
            </div>
            <LoginButton />
          </div>
        ) : null}
      </div>

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
