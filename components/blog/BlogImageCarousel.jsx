"use client";

import { useEffect, useId, useRef, useState } from "react";
import { isRenderableBlogImageSource } from "@/lib/blog/featuredImage";
import BlogImagePreview from "./BlogImagePreview";
import BlogInlineText from "./BlogInlineText";

export default function BlogImageCarousel({ images = [], sourceHref }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [orientation, setOrientation] = useState("unknown");
  const imageRef = useRef(null);
  const viewportId = useId();
  const safeIndex = Math.min(activeIndex, Math.max(0, images.length - 1));
  const image = images[safeIndex];
  const source = String(image?.src || "").trim();

  useEffect(() => {
    setOrientation("unknown");
  }, [source]);

  if (!image) return null;

  const canRender = isRenderableBlogImageSource(source);
  const description = String(image.alt || image.text || "").trim();

  return (
    <section
      className={`blog-image-carousel is-${orientation}`}
      aria-label={`${images.length}-image gallery`}
    >
      <div className="blog-image-carousel-viewport" id={viewportId} aria-live="polite">
        <figure>
          {canRender ? (
            <BlogImagePreview
              src={source}
              alt={description}
              caption={image.text}
              imageRef={imageRef}
              onImageLoad={(event) => {
                const element = event.currentTarget;
                setOrientation(element.naturalWidth >= element.naturalHeight ? "landscape" : "portrait");
              }}
            />
          ) : (
            <span className="blog-image-carousel-missing">Image unavailable</span>
          )}
          {image.text ? <figcaption><BlogInlineText baseHref={sourceHref}>{image.text}</BlogInlineText></figcaption> : null}
        </figure>
      </div>

      <div className="blog-image-carousel-controls">
        <button
          type="button"
          onClick={() => setActiveIndex((index) => Math.max(0, index - 1))}
          disabled={safeIndex === 0}
          aria-controls={viewportId}
          aria-label="Previous image"
        >
          <span aria-hidden="true">←</span>
        </button>
        <span className="blog-image-carousel-count" aria-label={`Image ${safeIndex + 1} of ${images.length}`}>
          {safeIndex + 1} / {images.length}
        </span>
        <button
          type="button"
          onClick={() => setActiveIndex((index) => Math.min(images.length - 1, index + 1))}
          disabled={safeIndex === images.length - 1}
          aria-controls={viewportId}
          aria-label="Next image"
        >
          <span aria-hidden="true">→</span>
        </button>
      </div>

      <div className="blog-image-carousel-dots" aria-label="Choose an image">
        {images.map((item, index) => (
          <button
            type="button"
            key={item.assetKey || item.src || index}
            className={index === safeIndex ? "is-active" : ""}
            onClick={() => setActiveIndex(index)}
            aria-controls={viewportId}
            aria-label={`Show image ${index + 1}`}
            aria-current={index === safeIndex ? "true" : undefined}
          />
        ))}
      </div>
    </section>
  );
}
