"use client";

import { useEffect, useId, useRef, useState } from "react";
import { isRenderableBlogImageSource } from "@/lib/blog/featuredImage";

export default function BlogImageCarousel({ images = [] }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [orientation, setOrientation] = useState("unknown");
  const imageRef = useRef(null);
  const viewportId = useId();
  const safeIndex = Math.min(activeIndex, Math.max(0, images.length - 1));
  const image = images[safeIndex];
  const source = String(image?.src || "").trim();

  useEffect(() => {
    const element = imageRef.current;
    if (!element) return undefined;

    const syncOrientation = () => {
      setOrientation(element.naturalWidth >= element.naturalHeight ? "landscape" : "portrait");
    };

    setOrientation("unknown");
    if (element.complete && element.naturalWidth > 0) syncOrientation();
    element.addEventListener("load", syncOrientation);

    return () => element.removeEventListener("load", syncOrientation);
  }, [source]);

  if (!image) return null;

  const canRender = isRenderableBlogImageSource(source);
  const description = String(image.alt || image.text || "").trim();

  return (
    <section
      className={`blog-image-carousel is-${orientation}`}
      aria-label={`Galeri ${images.length} gambar`}
    >
      <div className="blog-image-carousel-viewport" id={viewportId} aria-live="polite">
        <figure>
          {canRender ? (
            <img
              ref={imageRef}
              src={source}
              alt={description}
              loading="lazy"
              decoding="async"
            />
          ) : (
            <span className="blog-image-carousel-missing">Gambar tidak tersedia</span>
          )}
          {image.text ? <figcaption>{image.text}</figcaption> : null}
        </figure>
      </div>

      <div className="blog-image-carousel-controls">
        <button
          type="button"
          onClick={() => setActiveIndex((index) => Math.max(0, index - 1))}
          disabled={safeIndex === 0}
          aria-controls={viewportId}
          aria-label="Gambar sebelumnya"
        >
          <span aria-hidden="true">←</span>
        </button>
        <span className="blog-image-carousel-count" aria-label={`Gambar ${safeIndex + 1} dari ${images.length}`}>
          {safeIndex + 1} / {images.length}
        </span>
        <button
          type="button"
          onClick={() => setActiveIndex((index) => Math.min(images.length - 1, index + 1))}
          disabled={safeIndex === images.length - 1}
          aria-controls={viewportId}
          aria-label="Gambar berikutnya"
        >
          <span aria-hidden="true">→</span>
        </button>
      </div>

      <div className="blog-image-carousel-dots" aria-label="Pilih gambar">
        {images.map((item, index) => (
          <button
            type="button"
            key={item.assetKey || item.src || index}
            className={index === safeIndex ? "is-active" : ""}
            onClick={() => setActiveIndex(index)}
            aria-controls={viewportId}
            aria-label={`Tampilkan gambar ${index + 1}`}
            aria-current={index === safeIndex ? "true" : undefined}
          />
        ))}
      </div>
    </section>
  );
}
