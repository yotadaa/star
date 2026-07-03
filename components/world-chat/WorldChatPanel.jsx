"use client";

import { useEffect, useRef } from "react";
import { PixelButton, SpriteIcon } from "@/components/claude";
import RequireLoginGate from "@/components/auth/RequireLoginGate";

export default function WorldChatPanel({ open, onClose }) {
  const panelRef = useRef(null);

  useEffect(() => {
    if (!open) return undefined;

    const id = window.requestAnimationFrame(() => panelRef.current?.focus());
    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.cancelAnimationFrame(id);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose, open]);

  if (!open) return null;

  return (
    <aside
      ref={panelRef}
      className="world-chat-panel"
      role="dialog"
      aria-modal="false"
      aria-labelledby="world-chat-title"
      tabIndex={-1}
      data-testid="world-chat-panel"
    >
      <header className="world-chat-header">
        <div className="world-chat-titleline">
          <span className="world-chat-title-icon" aria-hidden="true">
            <SpriteIcon id="icon-chat-bubble" size={18} />
          </span>
          <div>
            <h2 id="world-chat-title">World Chat</h2>
            <span>Realtime belum terhubung</span>
          </div>
        </div>
        <PixelButton className="world-chat-close" onClick={onClose}>
          Tutup
        </PixelButton>
      </header>

      <div className="world-chat-status">
        <span aria-hidden="true"><SpriteIcon id="icon-database-offline" size={16} /></span>
        <span>Google login aktif. Supabase Realtime belum terhubung, jadi belum ada pesan publik yang ditampilkan.</span>
      </div>

      <div className="world-chat-messages" aria-label="Riwayat world chat">
        <article className="world-chat-empty">
          <SpriteIcon id="icon-chat-bubble" size={32} />
          <h3>Channel siap, backend belum aktif</h3>
          <p>Setelah project Supabase tersedia, area ini akan memuat pesan realtime dari tabel chat.</p>
        </article>
      </div>

      <div className="world-chat-input-shell">
        <RequireLoginGate
          title="Login ke System"
          description="Login dibutuhkan sebelum ikut mengirim pesan ke World Chat."
        >
          <form className="world-chat-form">
            <label htmlFor="world-chat-message">Pesan</label>
            <textarea id="world-chat-message" maxLength={280} placeholder="Ketik pesan ke semua penjelajah..." />
            <PixelButton>
              <SpriteIcon id="icon-send" size={15} />
              Kirim
            </PixelButton>
          </form>
        </RequireLoginGate>
      </div>
    </aside>
  );
}
