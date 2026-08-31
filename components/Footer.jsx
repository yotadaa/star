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
        <a href="/projects">PROJECTS</a>
        <a href="/research">RESEARCH</a>
        <a href={profile.links.blog} data-testid="foot-blog">BLOG</a>
        <a href="/contact">CONTACT</a>
        <a href={profile.links.github} target="_blank" rel="noopener noreferrer" data-testid="foot-github">GITHUB</a>
      </div>
      <p className={`foot-complete ${complete ? "visible" : ""}`}>
        Page complete - continue with the links below.
      </p>
      <p className="foot-copy">
        © 2026 {profile.name.toUpperCase()} - BUILT IN JAMBI, INDONESIA ·{" "}
        <a href="/#hero">↑ BACK TO TOP</a>
      </p>
    </footer>
  );
}
