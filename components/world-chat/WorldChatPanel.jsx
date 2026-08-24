"use client";

import { useEffect, useRef, useState } from "react";
import { useConvexConnectionState, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import RequireLoginGate from "@/components/auth/RequireLoginGate";
import useCurrentUser from "@/components/auth/useCurrentUser";
import { PixelButton, SpriteIcon } from "@/components/claude";

export default function WorldChatPanel({ open, onClose }) {
  const panelRef = useRef(null);
  const textareaRef = useRef(null);
  const { user } = useCurrentUser();
  const result = useQuery(api.worldChat.listLatest, open ? { limit: 40 } : "skip");
  const connection = useConvexConnectionState();
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);
  const [sendStatus, setSendStatus] = useState("");
  const [replyTo, setReplyTo] = useState(null);
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
    setSendStatus("Sending through Convex...");
    try {
      const response = await fetch("/api/chat/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({ body, replyToId: replyTo?.id || undefined }),
      });
      const data = await response.json();
      if (!response.ok || !data.ok) throw new Error(data.message || data.error || "Send failed");
      setDraft("");
      setReplyTo(null);
      setSendStatus("Sent · live sync active");
    } catch (error) {
      setSendStatus(error.message);
    } finally {
      setSending(false);
    }
  }

  function selectReply(message) {
    setReplyTo({ id: message.id, authorName: message.authorName, body: message.body });
    setSendStatus(`Replying to ${message.authorName}`);
    window.requestAnimationFrame(() => textareaRef.current?.focus());
  }

  if (!open) return null;

  const connectionLabel = result === undefined
    ? "Loading the Convex channel..."
    : connection.isWebSocketConnected
      ? "Convex realtime active"
      : connection.hasEverConnected
        ? "Connection lost · reconnecting"
        : "Connecting to Convex...";

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
          Close
        </PixelButton>
      </header>

      <div className="world-chat-status" aria-live="polite">
        <span aria-hidden="true"><SpriteIcon id={isLive ? "icon-database-online" : "icon-database-offline"} size={16} /></span>
        <span>{sendStatus || connectionLabel}</span>
      </div>

      <div className="world-chat-messages" aria-label="World Chat history">
        {result === undefined ? (
          <article className="world-chat-empty">
            <SpriteIcon id="icon-chat-bubble" size={32} />
            <h3>Loading channel</h3>
            <p>Convex is opening the realtime subscription.</p>
          </article>
        ) : messages.length === 0 ? (
          <article className="world-chat-empty">
            <SpriteIcon id="icon-chat-bubble" size={32} />
            <h3>A new channel is ready</h3>
            <p>The old database is unavailable, so history begins here without fabricated messages.</p>
          </article>
        ) : (
          messages.map((message) => (
            <article className="world-chat-message" key={message.id}>
              {message.replyTo && (
                <div className="world-chat-reply-quote">
                  <span>Replying to {message.replyTo.authorName}</span>
                  <p>{message.replyTo.body}</p>
                </div>
              )}
              {message.replyUnavailable && (
                <div className="world-chat-reply-quote is-unavailable">
                  <span>The referenced message was deleted</span>
                </div>
              )}
              <div className="world-chat-message-header">
                <span className="world-chat-message-identity">
                  <strong>{message.authorName}</strong>
                  <time dateTime={message.createdAt}>{new Date(message.createdAt).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}</time>
                </span>
                {(!user?.name || user.name !== message.authorName) && (
                  <PixelButton
                    className="world-chat-reply-button"
                    onClick={() => selectReply(message)}
                    aria-label={`Reply to ${message.authorName}`}
                  >
                    <SpriteIcon id="icon-chat-bubble" size={13} />
                    Reply
                  </PixelButton>
                )}
              </div>
              <p className="world-chat-message-body">{message.body}</p>
            </article>
          ))
        )}
      </div>

      <div className="world-chat-input-shell">
        <RequireLoginGate
          title="Sign in to the system"
          description="Sign in before posting to World Chat."
        >
          <form className="world-chat-form" onSubmit={handleSubmit}>
            {replyTo && (
              <div className="world-chat-compose-reply" role="status">
                <div>
                  <span>Replying to {replyTo.authorName}</span>
                  <p>{replyTo.body}</p>
                </div>
                <PixelButton
                  type="button"
                  className="world-chat-cancel-reply"
                  onClick={() => setReplyTo(null)}
                  aria-label="Cancel reply"
                >
                  Cancel
                </PixelButton>
              </div>
            )}
            <label htmlFor="world-chat-message">Message</label>
            <textarea
              ref={textareaRef}
              id="world-chat-message"
              maxLength={280}
              placeholder="Write a message to every explorer..."
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
            />
            <PixelButton type="submit" disabled={sending || !draft.trim() || !isLive}>
              <SpriteIcon id="icon-send" size={15} />
              {sending ? "Sending" : "Send"}
            </PixelButton>
          </form>
        </RequireLoginGate>
      </div>
    </aside>
  );
}
