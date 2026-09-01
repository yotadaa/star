"use client";

import Image from "next/image";
import { useId, useRef, useState } from "react";
import { SpriteIcon } from "@/components/claude";

export default function BlogImagePreview({ src, alt, caption, width, height, onImageLoad, imageRef }) {
  const dialogRef = useRef(null);
  const triggerRef = useRef(null);
  const [isOpen, setIsOpen] = useState(false);
  const titleId = useId();
  const description = String(alt || caption || "Article image").trim();
  const imageWidth = Number(width) > 0 ? Number(width) : 1600;
  const imageHeight = Number(height) > 0 ? Number(height) : 900;

  const openPreview = () => {
    setIsOpen(true);
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
        <Image
          ref={imageRef}
          src={src}
          alt={description}
          loading="lazy"
          width={imageWidth}
          height={imageHeight}
          sizes="(max-width: 620px) calc(100vw - 40px), (max-width: 960px) 80vw, 820px"
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
        onClose={() => {
          setIsOpen(false);
          triggerRef.current?.focus();
        }}
        onClick={(event) => {
          if (event.target === event.currentTarget) closePreview();
        }}
      >
        <div className="blog-image-preview-shell">
          <header>
            <p id={titleId}>{description}</p>
            <button type="button" onClick={closePreview} autoFocus aria-label="Close image preview">×</button>
          </header>
          {isOpen ? (
            <Image
              src={src}
              alt={`Enlarged view: ${description}`}
              width={imageWidth}
              height={imageHeight}
              sizes="92vw"
            />
          ) : null}
          {caption ? <p className="blog-image-preview-caption">{caption}</p> : null}
        </div>
      </dialog>
    </>
  );
}
