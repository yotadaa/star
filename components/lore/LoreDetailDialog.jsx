"use client";

import { useEffect, useRef } from "react";
import { X } from "lucide-react";

export default function LoreDetailDialog({ id, title, organization, period, detail }) {
  const dialogRef = useRef(null);
  const triggerRef = useRef(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return undefined;
    const onClose = () => triggerRef.current?.focus();
    dialog.addEventListener("close", onClose);
    return () => dialog.removeEventListener("close", onClose);
  }, []);

  function openDialog() {
    triggerRef.current = document.activeElement;
    dialogRef.current?.showModal();
  }

  function closeDialog() {
    dialogRef.current?.close();
  }

  return (
    <>
      <button ref={triggerRef} type="button" className="lore-detail-trigger" onClick={openDialog} aria-haspopup="dialog" aria-controls={id}>
        Open details
      </button>
      <dialog ref={dialogRef} id={id} className="lore-dialog" aria-labelledby={`${id}-title`} onClick={(event) => event.target === event.currentTarget && closeDialog()}>
        <div className="lore-dialog-card" role="document">
          <button type="button" className="lore-dialog-close" onClick={closeDialog} aria-label={`Close details for ${title}`}>
            <X size={18} aria-hidden="true" />
          </button>
          <span className="pixel-label">// Record details</span>
          <h3 id={`${id}-title`}>{title}</h3>
          <p className="lore-dialog-meta">{organization} · {period}</p>
          <p>{detail}</p>
        </div>
      </dialog>
    </>
  );
}
