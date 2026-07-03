"use client";

import { useEffect, useMemo, useState } from "react";
import LoginButton from "@/components/auth/LoginButton";
import useCurrentUser from "@/components/auth/useCurrentUser";
import { PixelButton, RarityTag, SpriteIcon } from "@/components/claude";

const filters = ["all", "scroll", "tool", "artifact", "medal", "key"];

export default function InventoryGrid({ items }) {
  const [filter, setFilter] = useState("all");
  const [inventoryItems, setInventoryItems] = useState(items);
  const [selectedId, setSelectedId] = useState(items[0]?.id ?? null);
  const [formOpen, setFormOpen] = useState(false);
  const [formState, setFormState] = useState({ status: "idle", message: "" });
  const { isOwner, isConfigured } = useCurrentUser();
  const visibleItems = useMemo(
    () => (filter === "all" ? inventoryItems : inventoryItems.filter((item) => item.type === filter)),
    [filter, inventoryItems]
  );
  const selected = inventoryItems.find((item) => item.id === selectedId);

  useEffect(() => {
    let active = true;
    fetch("/api/inventory/items", { cache: "no-store" })
      .then((response) => response.json())
      .then((data) => {
        if (!active || !data.ok || !Array.isArray(data.items)) return;
        setInventoryItems(data.items);
        setSelectedId((current) => current ?? data.items[0]?.id ?? null);
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, []);

  async function handleCreate(event) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setFormState({ status: "saving", message: "Menyimpan item..." });

    try {
      const response = await fetch("/api/inventory/items", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.get("name"),
          type: form.get("type"),
          rarity: form.get("rarity"),
          description: form.get("description"),
          linkTo: form.get("linkTo"),
        }),
      });
      const data = await response.json();
      if (!response.ok || !data.ok) throw new Error(data.message || data.error || "Save failed");
      setInventoryItems((current) => [data.item, ...current]);
      setSelectedId(data.item.id);
      setFormState({ status: "saved", message: `Saved via ${data.source}` });
      event.currentTarget.reset();
    } catch (error) {
      setFormState({ status: "error", message: error.message });
    }
  }

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
                onSubmit={handleCreate}
              >
                <label>
                  Nama Item
                  <input name="name" type="text" required placeholder="Scroll: Riset terbaru" />
                </label>
                <label>
                  Tipe
                  <select name="type" defaultValue="scroll">
                    <option value="scroll">Scroll - riset</option>
                    <option value="tool">Tool - skill</option>
                    <option value="artifact">Artifact - proyek</option>
                    <option value="medal">Medal - kompetisi/organisasi</option>
                    <option value="key">Key - milestone</option>
                  </select>
                </label>
                <label>
                  Rarity
                  <select name="rarity" defaultValue="rare">
                    <option value="epic">Epic</option>
                    <option value="rare">Rare</option>
                    <option value="common">Common</option>
                  </select>
                </label>
                <label>
                  Link
                  <input name="linkTo" type="url" placeholder="https://..." />
                </label>
                <label className="inventory-add-wide">
                  Deskripsi
                  <textarea name="description" rows={3} placeholder="Konteks singkat item ini" />
                </label>
                <PixelButton disabled={formState.status === "saving"}>
                  <SpriteIcon id={formState.status === "saved" ? "icon-database-online" : "icon-database-offline"} size={15} />
                  {formState.status === "saving" ? "Menyimpan" : "Simpan Item"}
                </PixelButton>
                {formState.message && <span className="inventory-form-status">{formState.message}</span>}
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
              const next = itemFilter === "all" ? inventoryItems[0] : inventoryItems.find((item) => item.type === itemFilter);
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
