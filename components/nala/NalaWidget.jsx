"use client";

import { useCallback, useEffect, useRef, useState } from "react";
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

function requestHistory(messages, omittedUserId) {
  const failedUserIds = new Set(
    messages.filter((message) => message.failed && message.retryOf).map((message) => message.retryOf)
  );
  return messages
    .filter(
      (message) =>
        (message.role === "user" || message.role === "assistant")
        && !message.failed
        && message.id !== omittedUserId
        && !failedUserIds.has(message.id)
    )
    .slice(-8)
    .map((message) => ({ role: message.role, content: message.content }));
}

function errorPresentation(error) {
  const presentations = {
    NALA_DISABLED: {
      status: "Nala sedang dinonaktifkan oleh owner",
      message: "Nala sedang tidak menerima quest baru. Pesanmu belum diproses.",
    },
    NALA_KEY_MISSING: {
      status: "Koneksi OpenRouter belum dikonfigurasi",
      message: "Koneksi live Nala belum tersedia. Pesanmu belum diproses.",
    },
    NALA_RATE_LIMITED: {
      status: "Batas pesan tercapai · tunggu sebentar",
      message: "Terlalu banyak quest masuk bersamaan. Coba lagi setelah jeda singkat.",
    },
    OPENROUTER_RATE_LIMIT: {
      status: "OpenRouter sedang membatasi permintaan",
      message: "Penyedia model sedang penuh. Pesanmu tetap utuh dan bisa dicoba lagi.",
    },
    OPENROUTER_TIMEOUT: {
      status: "OpenRouter belum menjawab tepat waktu",
      message: "Jawaban live belum selesai tepat waktu. Coba lagi tanpa mengirim ulang pesanmu.",
    },
    OPENROUTER_UPSTREAM: {
      status: "Penyedia model sedang bermasalah",
      message: "OpenRouter belum berhasil menyelesaikan jawaban. Pesanmu tetap utuh dan bisa dicoba lagi.",
    },
  };
  return presentations[error.code] || {
    status: String(error.message || "Koneksi live Nala terputus").slice(0, 180),
    message: "Koneksi live terputus sebelum jawaban selesai. Pesanmu tetap utuh dan bisa dicoba lagi.",
  };
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

export default function NalaWidget({ obscured = false }) {
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
  const [status, setStatus] = useState("Siap untuk koneksi live OpenRouter");

  useEffect(() => {
    document.documentElement.dataset.nalaPanel = open ? "open" : "closed";
    return () => {
      document.documentElement.dataset.nalaPanel = "closed";
    };
  }, [open]);

  useEffect(() => {
    if (obscured) setOpen(false);
  }, [obscured]);

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
    async (text, options = {}) => {
      const body = String(text || "").trim();
      if (!body || pending) return;

      const retryUser = options.retryOf
        ? messages.find((message) => message.id === options.retryOf && message.role === "user")
        : null;
      const appendUser = !retryUser;
      const userMessage = retryUser || { id: createId("user"), role: "user", content: body };
      const history = requestHistory(messages, userMessage.id);
      setMessages((items) => {
        const withoutFailedMessage = options.replaceMessageId
          ? items.filter((message) => message.id !== options.replaceMessageId)
          : items;
        return appendUser ? [...withoutFailedMessage, userMessage] : withoutFailedMessage;
      });
      setDraft("");
      setPending(true);
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
        const data = await response.json().catch(() => ({}));
        if (!response.ok || !data.ok) {
          const apiError = new Error(data.message || "Nala belum bisa menjawab.");
          apiError.code = data.error || "NALA_API_ERROR";
          throw apiError;
        }

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
        setChips(Array.isArray(data.suggestedChips) && data.suggestedChips.length ? data.suggestedChips.slice(0, 3) : INITIAL_CHIPS);
        setStatus(data.source === "openrouter" ? "OpenRouter live · data tool terverifikasi" : "Sumber respons tidak dikenali");
      } catch (error) {
        const presentation = errorPresentation(error);
        setExpression("confused");
        setStatus(presentation.status);
        setMessages((items) => [
          ...items,
          {
            id: createId("assistant"),
            role: "assistant",
            expression: "confused",
            content: presentation.message,
            action: null,
            failed: true,
            retryOf: userMessage.id,
            retryText: body,
          },
        ]);
      } finally {
        setPending(false);
        window.requestAnimationFrame(() => inputRef.current?.focus());
      }
    },
    [messages, pending]
  );

  function handleSubmit(event) {
    event.preventDefault();
    sendMessage(draft);
  }

  async function executeAction(action) {
    if (!action) return;
    if (action.type === "copy" && action.text) {
      await navigator.clipboard?.writeText(action.text);
      showToast("Teks disalin ke clipboard.", { icon: <SpriteIcon id="icon-clipboard" size={15} /> });
    }
  }

  function prepareNavigation() {
    showToast("Nala membuka rute yang relevan.", { icon: <SpriteIcon id="icon-route-redirect" size={15} /> });
    setOpen(false);
  }

  if (obscured) return null;

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

          <div ref={threadRef} className="nala-thread" aria-label="Percakapan Nala" aria-live="polite" aria-busy={pending}>
            {messages.map((message) => (
              <article className={`nala-message ${message.role === "user" ? "is-user" : "is-nala"}`} key={message.id}>
                {message.role !== "user" && (
                  <span className="nala-portrait nala-portrait-mini" aria-hidden="true">
                    <NalaPortrait expression={message.expression || "idle"} />
                  </span>
                )}
                <div className="nala-bubble">
                  <p>{message.content}</p>
                  {message.action?.type === "navigate" && message.action.route && message.role !== "user" && (
                    <PixelButton
                      as="a"
                      className="nala-action-chip"
                      href={message.action.anchor ? `${message.action.route}#${message.action.anchor}` : message.action.route}
                      onClick={prepareNavigation}
                    >
                      <SpriteIcon id="icon-route-redirect" size={14} />
                      Bawa saya ke sana
                    </PixelButton>
                  )}
                  {message.action?.type === "copy" && message.role !== "user" && (
                    <PixelButton className="nala-action-chip" onClick={() => executeAction(message.action)}>
                      <SpriteIcon id="icon-clipboard" size={14} />
                      Salin
                    </PixelButton>
                  )}
                  {message.failed && message.role !== "user" && (
                    <PixelButton
                      className="nala-retry-chip"
                      onClick={() => sendMessage(message.retryText, {
                        retryOf: message.retryOf,
                        replaceMessageId: message.id,
                      })}
                      disabled={pending}
                    >
                      Coba lagi
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

          {!pending && (
            <div className="nala-chips" aria-label="Prompt cepat Nala">
              {chips.slice(0, 3).map((chip) => (
                <PixelButton className="nala-chip" key={chip} onClick={() => sendMessage(chip)}>
                  {chip}
                </PixelButton>
              ))}
            </div>
          )}

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
