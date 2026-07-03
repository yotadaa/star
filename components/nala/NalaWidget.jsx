"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { PixelButton, SpriteIcon, useToast } from "@/components/claude";

const SPRITES = {
  idle: "/assets/nala/nala-idle-pixel.png",
  thinking: "/assets/nala/nala-thinking-pixel.png",
  happy: "/assets/nala/nala-happy-pixel.png",
  confused: "/assets/nala/nala-confused-pixel.png",
  greeting: "/assets/nala/nala-greeting-pixel.png",
  pointing: "/assets/nala/nala-pointing-pixel.png",
};

const INITIAL_CHIPS = [
  "Ceritain proyek AI tooling-nya",
  "Publikasi apa aja?",
  "Level sekarang berapa?",
  "Cara hubungi Mukhtada?",
];

function createId(prefix = "nala") {
  if (typeof crypto !== "undefined" && crypto.randomUUID) return `${prefix}-${crypto.randomUUID()}`;
  return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function getSessionKey() {
  if (typeof window === "undefined") return "server";
  const existing = window.sessionStorage.getItem("nala-session-key");
  if (existing) return existing;
  const next = createId("session");
  window.sessionStorage.setItem("nala-session-key", next);
  return next;
}

function getConversationId() {
  if (typeof window === "undefined") return "";
  return window.sessionStorage.getItem("nala-conversation-id") || "";
}

function setConversationId(id) {
  if (typeof window !== "undefined" && id) window.sessionStorage.setItem("nala-conversation-id", id);
}

function NalaPortrait({ expression = "idle", className = "" }) {
  const src = SPRITES[expression] || SPRITES.idle;
  return (
    <img
      className={`nala-sprite ${className}`.trim()}
      src={src}
      alt=""
      aria-hidden="true"
      decoding="async"
      draggable="false"
    />
  );
}

export default function NalaWidget() {
  const router = useRouter();
  const { showToast } = useToast();
  const fabRef = useRef(null);
  const panelRef = useRef(null);
  const threadRef = useRef(null);
  const inputRef = useRef(null);
  const [open, setOpen] = useState(false);
  const [expression, setExpression] = useState("idle");
  const [messages, setMessages] = useState([]);
  const [chips, setChips] = useState(INITIAL_CHIPS);
  const [draft, setDraft] = useState("");
  const [pending, setPending] = useState(false);
  const [status, setStatus] = useState("Siap menjawab dari data portofolio");
  const [pendingAction, setPendingAction] = useState(null);

  const history = useMemo(
    () =>
      messages
        .filter((message) => message.role === "user" || message.role === "assistant")
        .slice(-8)
        .map((message) => ({ role: message.role, content: message.content })),
    [messages]
  );

  useEffect(() => {
    document.documentElement.dataset.nalaPanel = open ? "open" : "closed";
    return () => {
      document.documentElement.dataset.nalaPanel = "closed";
    };
  }, [open]);

  useEffect(() => {
    if (!open) return undefined;
    const raf = window.requestAnimationFrame(() => inputRef.current?.focus());
    const onKeyDown = (event) => {
      if (event.key === "Escape") {
        event.preventDefault();
        setOpen(false);
        fabRef.current?.focus();
      }
    };
    const onPointerDown = (event) => {
      if (!panelRef.current || !fabRef.current) return;
      if (panelRef.current.contains(event.target) || fabRef.current.contains(event.target)) return;
      if (window.matchMedia("(min-width: 641px)").matches) setOpen(false);
    };

    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("pointerdown", onPointerDown);
    return () => {
      window.cancelAnimationFrame(raf);
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("pointerdown", onPointerDown);
    };
  }, [open]);

  useEffect(() => {
    if (!open || !threadRef.current) return;
    threadRef.current.scrollTop = threadRef.current.scrollHeight;
  }, [messages, open, pending]);

  function openPanel() {
    setOpen(true);
    if (messages.length === 0) {
      setExpression("greeting");
      setMessages([
        {
          id: createId("assistant"),
          role: "assistant",
          expression: "greeting",
          content:
            "Halo, aku Nala. Aku pemandu quest untuk portofolio Mukhtada, terpisah dari World Chat. Aku bisa bantu cari proyek, publikasi, statistik level, blog, atau kanal kontak.",
        },
      ]);
    }
  }

  const sendMessage = useCallback(
    async (text) => {
      const body = String(text || "").trim();
      if (!body || pending) return;

      const userMessage = { id: createId("user"), role: "user", content: body };
      setMessages((items) => [...items, userMessage]);
      setDraft("");
      setPending(true);
      setPendingAction(null);
      setExpression("thinking");
      setStatus("Nala membaca data portofolio...");

      try {
        const response = await fetch("/api/nala/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "same-origin",
          body: JSON.stringify({
            message: body,
            history,
            sessionKey: getSessionKey(),
            conversationId: getConversationId(),
          }),
        });
        const data = await response.json();
        if (!response.ok || !data.ok) throw new Error(data.message || data.error || "Nala belum bisa menjawab.");

        if (data.conversationId) setConversationId(data.conversationId);
        const nextExpression = data.expression || "idle";
        setExpression(nextExpression);
        setMessages((items) => [
          ...items,
          {
            id: createId("assistant"),
            role: "assistant",
            expression: nextExpression,
            content: data.reply,
            action: data.action,
            source: data.source,
          },
        ]);
        setPendingAction(data.action || null);
        setChips(Array.isArray(data.suggestedChips) && data.suggestedChips.length ? data.suggestedChips.slice(0, 3) : INITIAL_CHIPS);
        setStatus(data.source === "openrouter" ? "OpenRouter tool mode" : "Mode faktual lokal");
      } catch (error) {
        setExpression("confused");
        setStatus(error.message);
        setMessages((items) => [
          ...items,
          {
            id: createId("assistant"),
            role: "assistant",
            expression: "confused",
            content: "Nala belum bisa menyelesaikan jawaban barusan. Coba tanya dengan kata kunci yang lebih spesifik, atau buka kanal kontak.",
            action: { type: "navigate", route: "/contact", anchor: null },
          },
        ]);
        setPendingAction({ type: "navigate", route: "/contact", anchor: null });
      } finally {
        setPending(false);
      }
    },
    [history, pending]
  );

  function handleSubmit(event) {
    event.preventDefault();
    sendMessage(draft);
  }

  async function executeAction(action = pendingAction) {
    if (!action) return;
    if (action.type === "navigate" && action.route) {
      const href = action.anchor ? `${action.route}#${action.anchor}` : action.route;
      router.push(href);
      showToast("Nala membuka rute yang relevan.", { icon: <SpriteIcon id="icon-route-redirect" size={15} /> });
      setOpen(false);
      return;
    }

    if (action.type === "copy" && action.text) {
      await navigator.clipboard?.writeText(action.text);
      showToast("Teks disalin ke clipboard.", { icon: <SpriteIcon id="icon-clipboard" size={15} /> });
    }
  }

  return (
    <section className="nala-widget" aria-label="Nala NPC assistant" data-testid="nala-widget">
      {open && (
        <aside
          ref={panelRef}
          className="nala-panel"
          role="dialog"
          aria-modal="false"
          aria-labelledby="nala-title"
          data-testid="nala-panel"
        >
          <header className="nala-panel-header">
            <span className="nala-portrait nala-portrait-header" aria-hidden="true">
              <NalaPortrait expression={expression} />
            </span>
            <div className="nala-title-group">
              <h2 id="nala-title">Nala</h2>
              <p>Pemandu Quest</p>
            </div>
            <PixelButton className="nala-close" onClick={() => setOpen(false)} aria-label="Tutup Nala">
              <SpriteIcon id="icon-plus" className="nala-close-icon" size={15} />
            </PixelButton>
          </header>

          <div className="nala-status" aria-live="polite">
            <SpriteIcon id={pending ? "icon-target" : "icon-database-online"} size={14} />
            <span>{status}</span>
          </div>

          <div ref={threadRef} className="nala-thread" aria-label="Percakapan Nala" aria-live="polite">
            {messages.map((message) => (
              <article className={`nala-message ${message.role === "user" ? "is-user" : "is-nala"}`} key={message.id}>
                {message.role !== "user" && (
                  <span className="nala-portrait nala-portrait-mini" aria-hidden="true">
                    <NalaPortrait expression={message.expression || "idle"} />
                  </span>
                )}
                <div className="nala-bubble">
                  <p>{message.content}</p>
                  {message.action && message.role !== "user" && (
                    <PixelButton className="nala-action-chip" onClick={() => executeAction(message.action)}>
                      <SpriteIcon id={message.action.type === "copy" ? "icon-clipboard" : "icon-route-redirect"} size={14} />
                      {message.action.type === "copy" ? "Salin" : "Bawa saya ke sana"}
                    </PixelButton>
                  )}
                </div>
              </article>
            ))}
            {pending && (
              <article className="nala-message is-nala">
                <span className="nala-portrait nala-portrait-mini" aria-hidden="true">
                  <NalaPortrait expression="thinking" />
                </span>
                <div className="nala-bubble">
                  <div className="nala-typing" aria-label="Nala sedang berpikir">
                    <span />
                    <span />
                    <span />
                  </div>
                </div>
              </article>
            )}
          </div>

          <div className="nala-chips" aria-label="Prompt cepat Nala">
            {chips.slice(0, 3).map((chip) => (
              <PixelButton className="nala-chip" key={chip} onClick={() => sendMessage(chip)} disabled={pending}>
                {chip}
              </PixelButton>
            ))}
          </div>

          <form className="nala-input-row" onSubmit={handleSubmit}>
            <label htmlFor="nala-message">Tanya Nala</label>
            <input
              ref={inputRef}
              id="nala-message"
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              placeholder="Tanya Nala..."
              disabled={pending}
              maxLength={1000}
            />
            <PixelButton type="submit" className="nala-send" disabled={pending || !draft.trim()}>
              <SpriteIcon id="icon-send" size={15} />
              {pending ? "Tunggu" : "Kirim"}
            </PixelButton>
          </form>
        </aside>
      )}

      <button
        ref={fabRef}
        type="button"
        className={`nala-fab ${open ? "is-open" : ""}`}
        aria-label="Buka Nala, pemandu quest"
        aria-haspopup="dialog"
        aria-expanded={open}
        onClick={open ? () => setOpen(false) : openPanel}
        data-testid="open-nala"
      >
        <NalaPortrait expression={pending ? "thinking" : open ? expression : "idle"} />
      </button>
    </section>
  );
}
