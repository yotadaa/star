"use client";

import { useEffect, useRef, useState } from "react";
import { useConvexConnectionState, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import RequireLoginGate from "@/components/auth/RequireLoginGate";
import { PixelButton, SpriteIcon } from "@/components/claude";

export default function WorldChatPanel({ open, onClose }) {
  const panelRef = useRef(null);
  const result = useQuery(api.worldChat.listLatest, open ? { limit: 40 } : "skip");
  const connection = useConvexConnectionState();
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);
  const [sendStatus, setSendStatus] = useState("");
  const messages = result?.messages || [];
  const isLive = Boolean(result && connection.isWebSocketConnected);

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

  async function handleSubmit(event) {
    event.preventDefault();
    const body = draft.trim();
    if (!body) return;
    setSending(true);
    setSendStatus("Mengirim melalui Convex...");
    try {
      const response = await fetch("/api/chat/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({ body }),
      });
      const data = await response.json();
      if (!response.ok || !data.ok) throw new Error(data.message || data.error || "Send failed");
      setDraft("");
      setSendStatus("Terkirim · sinkron realtime aktif");
    } catch (error) {
      setSendStatus(error.message);
    } finally {
      setSending(false);
    }
  }

  if (!open) return null;

  const connectionLabel = result === undefined
    ? "Memuat channel Convex..."
    : connection.isWebSocketConnected
      ? "Realtime Convex aktif"
      : connection.hasEverConnected
        ? "Koneksi terputus · mencoba menyambung ulang"
        : "Menghubungkan ke Convex...";

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
            <span>Reactive channel · Convex</span>
          </div>
        </div>
        <PixelButton className="world-chat-close" onClick={onClose}>
          Tutup
        </PixelButton>
      </header>

      <div className="world-chat-status" aria-live="polite">
        <span aria-hidden="true"><SpriteIcon id={isLive ? "icon-database-online" : "icon-database-offline"} size={16} /></span>
        <span>{sendStatus || connectionLabel}</span>
      </div>

      <div className="world-chat-messages" aria-label="Riwayat world chat">
        {result === undefined ? (
          <article className="world-chat-empty">
            <SpriteIcon id="icon-chat-bubble" size={32} />
            <h3>Memuat channel</h3>
            <p>Convex sedang membuka subscription realtime.</p>
          </article>
        ) : messages.length === 0 ? (
          <article className="world-chat-empty">
            <SpriteIcon id="icon-chat-bubble" size={32} />
            <h3>Channel baru siap</h3>
            <p>Database lama tidak tersedia, jadi riwayat dimulai dari sini tanpa pesan buatan.</p>
          </article>
        ) : (
          messages.map((message) => (
            <article className="world-chat-message" key={message.id}>
              <div>
                <strong>{message.authorName}</strong>
                <time dateTime={message.createdAt}>{new Date(message.createdAt).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })}</time>
              </div>
              <p>{message.body}</p>
            </article>
          ))
        )}
      </div>

      <div className="world-chat-input-shell">
        <RequireLoginGate
          title="Login ke System"
          description="Login dibutuhkan sebelum ikut mengirim pesan ke World Chat."
        >
          <form className="world-chat-form" onSubmit={handleSubmit}>
            <label htmlFor="world-chat-message">Pesan</label>
            <textarea
              id="world-chat-message"
              maxLength={280}
              placeholder="Ketik pesan ke semua penjelajah..."
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
            />
            <PixelButton type="submit" disabled={sending || !draft.trim() || !isLive}>
              <SpriteIcon id="icon-send" size={15} />
              {sending ? "Mengirim" : "Kirim"}
            </PixelButton>
          </form>
        </RequireLoginGate>
      </div>
    </aside>
  );
}
