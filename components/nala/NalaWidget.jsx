"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { PixelButton, SpriteIcon, useToast } from "@/components/claude";

const SPRITES = {
  idle: "/assets/nala/nala-idle-pixel.webp",
  thinking: "/assets/nala/nala-thinking-pixel.webp",
  happy: "/assets/nala/nala-happy-pixel.webp",
  confused: "/assets/nala/nala-confused-pixel.webp",
  greeting: "/assets/nala/nala-greeting-pixel.webp",
  pointing: "/assets/nala/nala-pointing-pixel.webp",
};

const INITIAL_CHIPS = [
  "Show me the AI tooling projects",
  "What has Mukhtada published?",
  "What is the current level?",
  "How can I contact Mukhtada?",
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
      status: "Nala is disabled by the owner",
      message: "Nala is not accepting new quests. Your message was not processed.",
    },
    NALA_KEY_MISSING: {
      status: "OpenRouter is not configured",
      message: "Nala's live connection is unavailable. Your message was not processed.",
    },
    NALA_RATE_LIMITED: {
      status: "Message limit reached · wait a moment",
      message: "Too many quests arrived at once. Try again after a short pause.",
    },
    OPENROUTER_RATE_LIMIT: {
      status: "OpenRouter is rate-limiting requests",
      message: "The model provider is busy. Your message is intact and can be retried.",
    },
    OPENROUTER_TIMEOUT: {
      status: "OpenRouter did not respond in time",
      message: "The live response timed out. Retry without sending your message again.",
    },
    OPENROUTER_UPSTREAM: {
      status: "The model provider is having trouble",
      message: "OpenRouter could not complete the response. Your message is intact and can be retried.",
    },
  };
  return presentations[error.code] || {
    status: String(error.message || "Nala's live connection was interrupted").slice(0, 180),
    message: "The live connection ended before the response finished. Your message is intact and can be retried.",
  };
}

function NalaPortrait({ expression = "idle", className = "" }) {
  const src = SPRITES[expression] || SPRITES.idle;
  return (
    <img
      className={`nala-sprite ${className}`.trim()}
      src={src}
      alt={`Pixel portrait of Nala with a ${expression} expression`}
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
  const [status, setStatus] = useState("Ready for a live OpenRouter connection");

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
            "Hi, I'm Nala, the quest guide for Mukhtada's portfolio. I can help you find projects, publications, player statistics, Blog posts, or contact channels.",
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
      setStatus("Nala is reading verified portfolio data...");

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
          const apiError = new Error(data.message || "Nala could not answer.");
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
        setStatus(data.source === "openrouter" ? "OpenRouter live · verified tool data" : "Unrecognized response source");
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
      showToast("Text copied to the clipboard.", { icon: <SpriteIcon id="icon-clipboard" size={15} /> });
    }
  }

  function prepareNavigation() {
    showToast("Opening the relevant route.", { icon: <SpriteIcon id="icon-route-redirect" size={15} /> });
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
              <p>Quest Guide</p>
            </div>
            <PixelButton className="nala-close" onClick={() => setOpen(false)} aria-label="Close Nala">
              <SpriteIcon id="icon-plus" className="nala-close-icon" size={15} />
            </PixelButton>
          </header>

          <div className="nala-status" aria-live="polite">
            <SpriteIcon id={pending ? "icon-target" : "icon-database-online"} size={14} />
            <span>{status}</span>
          </div>

          <div ref={threadRef} className="nala-thread" aria-label="Nala conversation" aria-live="polite" aria-busy={pending}>
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
                      Take me there
                    </PixelButton>
                  )}
                  {message.action?.type === "copy" && message.role !== "user" && (
                    <PixelButton className="nala-action-chip" onClick={() => executeAction(message.action)}>
                      <SpriteIcon id="icon-clipboard" size={14} />
                      Copy
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
                      Try again
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
                  <div className="nala-typing" aria-label="Nala is thinking">
                    <span />
                    <span />
                    <span />
                  </div>
                </div>
              </article>
            )}
          </div>

          {!pending && (
            <div className="nala-chips" aria-label="Nala quick prompts">
              {chips.slice(0, 3).map((chip) => (
                <PixelButton className="nala-chip" key={chip} onClick={() => sendMessage(chip)}>
                  {chip}
                </PixelButton>
              ))}
            </div>
          )}

          <form className="nala-input-row" onSubmit={handleSubmit}>
            <label htmlFor="nala-message">Ask Nala</label>
            <input
              ref={inputRef}
              id="nala-message"
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              placeholder="Ask Nala..."
              disabled={pending}
              maxLength={1000}
            />
            <PixelButton type="submit" className="nala-send" disabled={pending || !draft.trim()}>
              <SpriteIcon id="icon-send" size={15} />
              {pending ? "Wait" : "Send"}
            </PixelButton>
          </form>
        </aside>
      )}

      <button
        ref={fabRef}
        type="button"
        className={`nala-fab ${open ? "is-open" : ""}`}
        aria-label="Open Nala, the quest guide"
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
