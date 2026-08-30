"use client";

import { useEffect, useRef, useState } from "react";
import { profile } from "@/lib/data";

export default function Footer() {
  const ref = useRef(null);
  const [complete, setComplete] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setComplete(true);
          observer.unobserve(node);
        }
      },
      { threshold: 0.45 }
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <footer className="site-footer" id="contact" ref={ref}>
      <div className="foot-links">
        <a href={profile.links.github} target="_blank" rel="noopener noreferrer" data-testid="foot-github">
          GITHUB
        </a>
        <a href={profile.links.linkedin} target="_blank" rel="noopener noreferrer" data-testid="foot-linkedin">
          LINKEDIN
        </a>
        <a href={profile.links.scholar} target="_blank" rel="noopener noreferrer" data-testid="foot-scholar">
          SCHOLAR
        </a>
        <a href={profile.links.blog} data-testid="foot-blog">
          BLOG
        </a>
      </div>
      <p className={`foot-complete ${complete ? "visible" : ""}`}>
        Level complete - the entire map has been explored.
      </p>
      <p className="foot-copy">
        © 2026 {profile.name.toUpperCase()} - BUILT WITH COFFEE &amp; PIXELS ·{" "}
        <a href="/#hero">↑ BACK TO TOP</a>
      </p>
    </footer>
  );
}
