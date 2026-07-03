"use client";

import { useEffect, useRef, useState } from "react";
import { PixelButton, SpriteIcon } from "@/components/claude";
import RequireLoginGate from "@/components/auth/RequireLoginGate";

export default function WorldChatPanel({ open, onClose }) {
  const panelRef = useRef(null);
  const [messages, setMessages] = useState([]);
  const [draft, setDraft] = useState("");
  const [status, setStatus] = useState({ mode: "idle", label: "Memuat channel..." });
  const [sending, setSending] = useState(false);

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

  useEffect(() => {
    if (!open) return undefined;
    let active = true;

    async function loadMessages() {
      try {
        const response = await fetch("/api/chat/messages?limit=40", { cache: "no-store" });
        const data = await response.json();
        if (!active) return;
        if (!response.ok || !data.ok) throw new Error(data.message || data.error || "Chat unavailable");
        setMessages(data.messages || []);
        setStatus({
          mode: data.source === "supabase" ? "live" : "offline",
          label: data.source === "supabase" ? "Supabase chat live" : "Menunggu migration database",
        });
      } catch (error) {
        if (!active) return;
        setStatus({ mode: "offline", label: error.message });
      }
    }

    loadMessages();
    const interval = window.setInterval(loadMessages, 6000);
    return () => {
      active = false;
      window.clearInterval(interval);
    };
  }, [open]);

  async function handleSubmit(event) {
    event.preventDefault();
    const body = draft.trim();
    if (!body) return;

    setSending(true);
    setStatus({ mode: "sending", label: "Mengirim..." });
    try {
      const response = await fetch("/api/chat/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ body }),
      });
      const data = await response.json();
      if (!response.ok || !data.ok) throw new Error(data.message || data.error || "Send failed");
      setMessages((items) => [...items, data.message].slice(-40));
      setDraft("");
      setStatus({ mode: "live", label: `Terkirim via ${data.source}` });
    } catch (error) {
      setStatus({ mode: "offline", label: error.message });
    } finally {
      setSending(false);
    }
  }

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
            <span>{status.mode === "live" ? "Realtime/polling aktif" : "Polling fallback"}</span>
          </div>
        </div>
        <PixelButton className="world-chat-close" onClick={onClose}>
          Tutup
        </PixelButton>
      </header>

      <div className="world-chat-status">
        <span aria-hidden="true"><SpriteIcon id={status.mode === "live" ? "icon-database-online" : "icon-database-offline"} size={16} /></span>
        <span>{status.label}</span>
      </div>

      <div className="world-chat-messages" aria-label="Riwayat world chat">
        {messages.length === 0 ? (
          <article className="world-chat-empty">
            <SpriteIcon id="icon-chat-bubble" size={32} />
            <h3>Channel siap</h3>
            <p>{status.mode === "live" ? "Belum ada pesan publik. Channel Supabase sudah siap." : "Migration chat belum selesai di shard Supabase."}</p>
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
            <PixelButton disabled={sending || !draft.trim()}>
              <SpriteIcon id="icon-send" size={15} />
              {sending ? "Mengirim" : "Kirim"}
            </PixelButton>
          </form>
        </RequireLoginGate>
      </div>
    </aside>
  );
}
