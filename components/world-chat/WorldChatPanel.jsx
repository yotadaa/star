"use client";

import { createClient } from "@supabase/supabase-js";
import { useEffect, useRef, useState } from "react";
import { PixelButton, SpriteIcon } from "@/components/claude";
import RequireLoginGate from "@/components/auth/RequireLoginGate";

function normalizeRealtimeMessage(payload) {
  if (!payload?.id) return null;
  return {
    id: payload.id,
    authorName: payload.authorName || payload.author_name || "Visitor",
    body: payload.body || "",
    createdAt: payload.createdAt || payload.created_at || new Date().toISOString(),
    storage: { shardId: payload.storage?.shardId || payload.shard_id || null },
  };
}

function upsertMessage(items, message) {
  if (!message?.id || !message.body) return items;
  return [...items.filter((item) => item.id !== message.id), message]
    .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
    .slice(-40);
}

export default function WorldChatPanel({ open, onClose }) {
  const panelRef = useRef(null);
  const [messages, setMessages] = useState([]);
  const [draft, setDraft] = useState("");
  const [status, setStatus] = useState({ mode: "idle", label: "Memuat channel..." });
  const [sending, setSending] = useState(false);
  const isOnline = ["live", "realtime", "sending"].includes(status.mode);

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
    const realtimeClients = [];
    const realtimeChannels = [];

    async function loadMessages() {
      try {
        const response = await fetch("/api/chat/messages?limit=40", { cache: "no-store", credentials: "same-origin" });
        const data = await response.json();
        if (!active) return;
        if (!response.ok || !data.ok) throw new Error(data.message || data.error || "Chat unavailable");
        setMessages(data.messages || []);
        setStatus((current) =>
          current.mode === "realtime"
            ? current
            : {
              mode: data.source === "supabase" ? "live" : "offline",
              label: data.source === "supabase" ? "History Supabase siap" : "Menunggu migration database",
            }
        );
      } catch (error) {
        if (!active) return;
        setStatus({ mode: "offline", label: error.message });
      }
    }

    async function startRealtime() {
      try {
        const response = await fetch("/api/chat/realtime-config", { cache: "no-store", credentials: "same-origin" });
        const data = await response.json();
        if (!active) return;
        if (!response.ok || !data.ok || !data.shards?.length) throw new Error(data.message || "Realtime config unavailable");

        for (const shard of data.shards) {
          const client = createClient(shard.url, shard.publishableKey, {
            auth: { autoRefreshToken: false, persistSession: false },
          });
          const channel = client.channel(shard.channel || "chat:public");

          channel
            .on("broadcast", { event: "message_created" }, ({ payload }) => {
              const message = normalizeRealtimeMessage(payload);
              if (message) setMessages((items) => upsertMessage(items, message));
            })
            .on("broadcast", { event: "message_updated" }, ({ payload }) => {
              const message = normalizeRealtimeMessage(payload);
              if (payload?.status === "deleted") {
                setMessages((items) => items.filter((item) => item.id !== payload.id));
              } else if (message) {
                setMessages((items) => upsertMessage(items, message));
              }
            })
            .on("broadcast", { event: "message_deleted" }, ({ payload }) => {
              if (payload?.id) setMessages((items) => items.filter((item) => item.id !== payload.id));
            })
            .subscribe((state) => {
              if (!active || state !== "SUBSCRIBED") return;
              setStatus((current) =>
                current.mode === "sending"
                  ? current
                  : { mode: "realtime", label: `Realtime aktif di ${data.shards.length} shard` }
              );
            });

          realtimeClients.push(client);
          realtimeChannels.push(channel);
        }
      } catch (error) {
        if (!active) return;
        setStatus((current) =>
          current.mode === "offline" ? current : { mode: "live", label: `Polling aktif; Realtime belum tersambung (${error.message})` }
        );
      }
    }

    loadMessages();
    startRealtime();
    const interval = window.setInterval(loadMessages, 15000);
    return () => {
      active = false;
      window.clearInterval(interval);
      realtimeChannels.forEach((channel) => channel.unsubscribe());
      realtimeClients.forEach((client) => client.removeAllChannels());
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
        credentials: "same-origin",
        body: JSON.stringify({ body }),
      });
      const data = await response.json();
      if (!response.ok || !data.ok) throw new Error(data.message || data.error || "Send failed");
      setMessages((items) => [...items, data.message].slice(-40));
      setDraft("");
      setStatus({ mode: "live", label: `Terkirim ke ${data.message?.storage?.shardId || "Supabase"}` });
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
            <span>{status.mode === "realtime" ? "Realtime Supabase aktif" : isOnline ? "Polling Supabase aktif" : "Polling fallback"}</span>
          </div>
        </div>
        <PixelButton className="world-chat-close" onClick={onClose}>
          Tutup
        </PixelButton>
      </header>

      <div className="world-chat-status">
        <span aria-hidden="true"><SpriteIcon id={isOnline ? "icon-database-online" : "icon-database-offline"} size={16} /></span>
        <span>{status.label}</span>
      </div>

      <div className="world-chat-messages" aria-label="Riwayat world chat">
        {messages.length === 0 ? (
          <article className="world-chat-empty">
            <SpriteIcon id="icon-chat-bubble" size={32} />
            <h3>Channel siap</h3>
            <p>{isOnline ? "Belum ada pesan publik. Channel Supabase sudah siap." : "Migration chat belum selesai di shard Supabase."}</p>
          </article>
        ) : (
          messages.map((message) => (
            <article className="world-chat-message" key={message.id}>
              <div>
                <strong>{message.authorName}</strong>
                {message.storage?.shardId && <span className="world-chat-shard">{message.storage.shardId}</span>}
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
            <PixelButton type="submit" disabled={sending || !draft.trim()}>
              <SpriteIcon id="icon-send" size={15} />
              {sending ? "Mengirim" : "Kirim"}
            </PixelButton>
          </form>
        </RequireLoginGate>
      </div>
    </aside>
  );
}
