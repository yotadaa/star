"use client";

import { useId, useRef } from "react";
import { SpriteIcon } from "@/components/claude";

export default function BlogImagePreview({ src, alt, caption, onImageLoad, imageRef }) {
  const dialogRef = useRef(null);
  const triggerRef = useRef(null);
  const titleId = useId();
  const description = String(alt || caption || "Article image").trim();

  const openPreview = () => {
    if (dialogRef.current && !dialogRef.current.open) dialogRef.current.showModal();
  };

  const closePreview = () => {
    dialogRef.current?.close();
  };

  return (
    <>
      <button
        type="button"
        className="blog-image-preview-trigger"
        onClick={openPreview}
        ref={triggerRef}
        aria-haspopup="dialog"
        aria-label={`Open image fullscreen: ${description}`}
      >
        <img
          ref={imageRef}
          src={src}
          alt={description}
          loading="lazy"
          decoding="async"
          onLoad={onImageLoad}
        />
        <span className="blog-image-preview-hint" aria-hidden="true">
          <SpriteIcon id="icon-fullscreen" size={19} />
        </span>
      </button>
      <dialog
        className="blog-image-preview-dialog"
        ref={dialogRef}
        aria-labelledby={titleId}
        onCancel={(event) => {
          event.preventDefault();
          closePreview();
        }}
        onClose={() => triggerRef.current?.focus()}
        onClick={(event) => {
          if (event.target === event.currentTarget) closePreview();
        }}
      >
        <div className="blog-image-preview-shell">
          <header>
            <p id={titleId}>{description}</p>
            <button type="button" onClick={closePreview} autoFocus aria-label="Close image preview">×</button>
          </header>
          <img src={src} alt="" />
          {caption ? <p className="blog-image-preview-caption">{caption}</p> : null}
        </div>
      </dialog>
    </>
  );
}
