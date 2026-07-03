"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

function getOffset(index, active, total) {
  let offset = index - active;
  if (offset > total / 2) offset -= total;
  if (offset < -total / 2) offset += total;
  return offset;
}

export default function HomeGlimpseSlider({ items }) {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const total = items.length;

  const goTo = useCallback((index) => {
    setActive((index + total) % total);
  }, [total]);

  const goNext = useCallback(() => {
    setActive((current) => (current + 1) % total);
  }, [total]);

  const goPrev = useCallback(() => {
    setActive((current) => (current - 1 + total) % total);
  }, [total]);

  useEffect(() => {
    if (paused || total < 2) return undefined;
    const id = window.setInterval(goNext, 3600);
    return () => window.clearInterval(id);
  }, [goNext, paused, total]);

  return (
    <div
      className="glimpse-slider"
      onPointerEnter={() => setPaused(true)}
      onPointerLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
      data-testid="glimpse-slider"
    >
      <div className="glimpse-stage" aria-live="polite">
        {items.map((item, index) => {
          const offset = getOffset(index, active, total);
          const abs = Math.abs(offset);
          const visible = abs <= 1;
          const isActive = offset === 0;
          const scale = abs === 0 ? 1 : 0.58;
          const opacity = !visible ? 0 : abs === 0 ? 1 : 0.72;

          return (
            <article
              className={`glimpse-slide ${isActive ? "active" : ""}`}
              key={item.title}
              data-testid={`glimpse-card-${index}`}
              aria-hidden={!visible}
              style={{
                "--slide-x": `${offset * 430}px`,
                "--slide-scale": scale,
                "--slide-rotate": `${offset * -1.15}deg`,
                "--slide-opacity": opacity,
                "--slide-z": 10 - abs,
              }}
            >
              <div className="glimpse-frame">
                <img src={item.image} alt={item.alt} loading={isActive ? "eager" : "lazy"} decoding="async" />
              </div>
              <div className="glimpse-copy">
                <span className="pixel-label">{item.eyebrow}</span>
                <h3>{item.title}</h3>
                <p>{item.caption}</p>
              </div>
            </article>
          );
        })}
      </div>

      <div className="glimpse-controls" aria-label="Project glimpse controls">
        <button type="button" className="glimpse-arrow" onClick={goPrev} aria-label="Previous glimpse">
          <ChevronLeft size={18} aria-hidden="true" />
        </button>
        <div className="glimpse-dots">
          {items.map((item, index) => (
            <button
              type="button"
              key={item.title}
              className={`glimpse-dot ${index === active ? "active" : ""}`}
              onClick={() => goTo(index)}
              aria-label={`Show ${item.title}`}
              aria-current={index === active}
            />
          ))}
        </div>
        <button type="button" className="glimpse-arrow" onClick={goNext} aria-label="Next glimpse">
          <ChevronRight size={18} aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}
