"use client";

import { useRef, useState } from "react";
import { PixelButton, SpriteIcon } from "@/components/claude";

function safeHref(value) {
  const href = String(value || "").trim();
  if (href.startsWith("/") || href.startsWith("#") || href.startsWith("http://") || href.startsWith("https://")) return href;
  return "#";
}

function renderCaptionText(value) {
  const text = String(value || "");
  const parts = [];
  const pattern = /(\*\*([^*]+)\*\*|_([^_]+)_|\[([^\]]+)\]\(([^)]+)\))/g;
  let lastIndex = 0;
  let match;

  while ((match = pattern.exec(text))) {
    if (match.index > lastIndex) parts.push(text.slice(lastIndex, match.index));
    if (match[2]) {
      parts.push(<b key={`b-${match.index}`}>{match[2]}</b>);
    } else if (match[3]) {
      parts.push(<i key={`i-${match.index}`}>{match[3]}</i>);
    } else if (match[4]) {
      parts.push(
        <a key={`a-${match.index}`} href={safeHref(match[5])}>
          {match[4]}
        </a>
      );
    }
    lastIndex = pattern.lastIndex;
  }

  if (lastIndex < text.length) parts.push(text.slice(lastIndex));
  return parts.length ? parts : text;
}

export default function EditablePageCaption({
  entryKey,
  title,
  initialText,
  canManage = false,
  className = "",
  textClassName = "",
  payload = { type: "page-caption" },
  editLabel = "Edit caption",
  textareaLabel = "Caption halaman",
}) {
  const textRef = useRef(null);
  const [text, setText] = useState(initialText || "");
  const [draft, setDraft] = useState(initialText || "");
  const [editing, setEditing] = useState(false);
  const [status, setStatus] = useState("");
  const rootClassName = ["editable-page-caption", className].filter(Boolean).join(" ");
  const copyClassName = ["caption-text", textClassName].filter(Boolean).join(" ");

  function wrapSelection(prefix, suffix = prefix) {
    const input = textRef.current;
    if (!input) return;
    const start = input.selectionStart;
    const end = input.selectionEnd;
    const selected = draft.slice(start, end) || "teks";
    const next = `${draft.slice(0, start)}${prefix}${selected}${suffix}${draft.slice(end)}`;
    setDraft(next);
    requestAnimationFrame(() => {
      input.focus();
      input.setSelectionRange(start + prefix.length, start + prefix.length + selected.length);
    });
  }

  async function saveCaption() {
    setStatus("Menyimpan caption...");
    try {
      const response = await fetch("/api/about/entries", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({
          entryKey,
          title,
          body: draft,
          status: "public",
          payload,
        }),
      });
      const data = await response.json();
      if (!response.ok || !data.ok) throw new Error(data.message || data.error || "Save failed");
      setText(draft);
      setEditing(false);
      setStatus("Caption tersimpan");
    } catch (error) {
      setStatus(error.message);
    }
  }

  if (!canManage) {
    return <p className={copyClassName}>{renderCaptionText(text)}</p>;
  }

  return (
    <div className={rootClassName}>
      {!editing ? (
        <>
          <p className={copyClassName}>{renderCaptionText(text)}</p>
          <button type="button" className="caption-edit-trigger" onClick={() => setEditing(true)} aria-label={editLabel}>
            <SpriteIcon id="icon-pencil" size={13} />
          </button>
          {status && <span className="caption-save-status" role="status">{status}</span>}
        </>
      ) : (
        <div className="caption-inline-editor">
          <div className="caption-inline-toolbar" aria-label="Toolbar caption">
            <button type="button" onClick={() => wrapSelection("**")} title="Bold">
              <SpriteIcon id="icon-bold" size={13} />
            </button>
            <button type="button" onClick={() => wrapSelection("_")} title="Italic">
              <SpriteIcon id="icon-italic" size={13} />
            </button>
            <button type="button" onClick={() => wrapSelection("[", "](#)")} title="Link">
              <SpriteIcon id="icon-link" size={13} />
            </button>
          </div>
          <textarea ref={textRef} value={draft} onChange={(event) => setDraft(event.target.value)} aria-label={textareaLabel} />
          <div className="caption-inline-actions">
            <PixelButton type="button" onClick={saveCaption}>Simpan</PixelButton>
            <PixelButton type="button" onClick={() => { setDraft(text); setEditing(false); }}>Batal</PixelButton>
          </div>
          {status && <span className="caption-save-status" role="status">{status}</span>}
        </div>
      )}
    </div>
  );
}
