"use client";

import { useEffect, useRef, useState } from "react";
import {
  activeReadDuration,
  engagedReadLabel,
  estimatedReadLabel,
  normalizedReadingStats,
  publicReadershipLabel,
  viewLabel,
} from "@/lib/blog/readingMetrics.mjs";
import { privacySignalEnabled, readingWindowIsActive } from "@/lib/blog/readingTrackerPolicy.mjs";

const INITIAL_VIEW_MS = 3_000;
const HEARTBEAT_MS = 15_000;
const TIMER_MS = 1_000;

function browserPrivacySignalEnabled() {
  if (typeof navigator === "undefined") return false;
  return privacySignalEnabled({
    globalPrivacyControl: navigator.globalPrivacyControl,
    doNotTrack: navigator.doNotTrack,
    windowDoNotTrack: window.doNotTrack,
  });
}

function articleProgressBps() {
  const article = document.getElementById("blog-article-content");
  if (!article) return 0;
  const bounds = article.getBoundingClientRect();
  const articleTop = window.scrollY + bounds.top;
  const articleHeight = Math.max(1, bounds.height);
  const viewportBottom = window.scrollY + window.innerHeight;
  return Math.max(0, Math.min(10_000, Math.round(
    ((viewportBottom - articleTop) / articleHeight) * 10_000,
  )));
}

export default function BlogReadMetrics({ slug, estimatedReadTime, initialStats }) {
  const [stats, setStats] = useState(() => normalizedReadingStats(initialStats, slug));
  const [trackingState, setTrackingState] = useState("pending");
  const accumulatedMsRef = useRef(0);
  const lastActiveAtRef = useRef(null);
  const firstSentRef = useRef(false);
  const finalSentRef = useRef(false);
  const sendingRef = useRef(false);
  const mountedRef = useRef(false);

  useEffect(() => {
    setStats(normalizedReadingStats(initialStats, slug));
  }, [initialStats, slug]);

  useEffect(() => {
    mountedRef.current = true;
    accumulatedMsRef.current = 0;
    lastActiveAtRef.current = null;
    firstSentRef.current = false;
    finalSentRef.current = false;
    sendingRef.current = false;
    const privacyBlocked = browserPrivacySignalEnabled();
    if (privacyBlocked) {
      setTrackingState("disabled");
      return () => {
        mountedRef.current = false;
      };
    }
    setTrackingState("active");

    function activeNow() {
      return readingWindowIsActive({
        visibilityState: document.visibilityState,
        hasFocus: document.hasFocus(),
      });
    }

    function accumulate(now = performance.now()) {
      if (!activeNow()) {
        lastActiveAtRef.current = null;
        return;
      }
      if (lastActiveAtRef.current === null) {
        lastActiveAtRef.current = now;
        return;
      }
      const elapsed = Math.max(0, Math.min(2_000, now - lastActiveAtRef.current));
      accumulatedMsRef.current += elapsed;
      lastActiveAtRef.current = now;
    }

    function flush({ force = false, keepalive = false } = {}) {
      accumulate();
      const threshold = firstSentRef.current ? HEARTBEAT_MS : INITIAL_VIEW_MS;
      if (accumulatedMsRef.current < threshold && (!force || !firstSentRef.current)) return;
      if (sendingRef.current && !keepalive) return;
      const activeMsDelta = Math.min(20_000, Math.floor(accumulatedMsRef.current));
      if (activeMsDelta < 1) return;
      accumulatedMsRef.current -= activeMsDelta;
      firstSentRef.current = true;
      if (!keepalive) sendingRef.current = true;

      fetch(`/api/blog/posts/${encodeURIComponent(slug)}/reading`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        keepalive,
        body: JSON.stringify({
          activeMsDelta,
          progressBps: articleProgressBps(),
        }),
      })
        .then(async (response) => {
          const payload = await response.json().catch(() => null);
          if (!response.ok || !payload?.ok) throw new Error(payload?.error || "BLOG_READING_REQUEST_FAILED");
          if (mountedRef.current) {
            setStats(normalizedReadingStats(payload.stats, slug));
            setTrackingState("active");
          }
        })
        .catch(() => {
          if (mountedRef.current) setTrackingState("unavailable");
        })
        .finally(() => {
          if (!keepalive) sendingRef.current = false;
        });
    }

    function onActivityChange() {
      const now = performance.now();
      if (activeNow()) {
        lastActiveAtRef.current = now;
        return;
      }
      if (lastActiveAtRef.current !== null) {
        accumulatedMsRef.current += Math.max(0, Math.min(2_000, now - lastActiveAtRef.current));
      }
      lastActiveAtRef.current = null;
    }

    function flushFinal() {
      if (finalSentRef.current) return;
      finalSentRef.current = true;
      flush({ force: true, keepalive: true });
    }

    function onPageHide() {
      flushFinal();
    }

    lastActiveAtRef.current = activeNow() ? performance.now() : null;
    const timer = window.setInterval(() => {
      accumulate();
      flush();
    }, TIMER_MS);
    document.addEventListener("visibilitychange", onActivityChange);
    window.addEventListener("focus", onActivityChange);
    window.addEventListener("blur", onActivityChange);
    window.addEventListener("pagehide", onPageHide);

    return () => {
      if (firstSentRef.current) flushFinal();
      window.clearInterval(timer);
      document.removeEventListener("visibilitychange", onActivityChange);
      window.removeEventListener("focus", onActivityChange);
      window.removeEventListener("blur", onActivityChange);
      window.removeEventListener("pagehide", onPageHide);
      lastActiveAtRef.current = null;
      mountedRef.current = false;
    };
  }, [slug]);

  const average = activeReadDuration(stats.averageActiveReadMs);
  const label = publicReadershipLabel(estimatedReadTime, stats);
  const disclosure = trackingState === "disabled"
    ? "Reading stats are visible; tracking is off for this browser."
    : "Anonymous reading stats; no IP or account stored.";

  return (
    <div
      className="blog-read-metrics"
      data-tracking-state={trackingState}
      data-view-count={stats.viewCount}
      data-engaged-read-count={stats.engagedReadCount}
    >
      <span className="sr-only">Article readership: {label}.</span>
      <span className="blog-read-metrics-values" aria-hidden="true">
        <span>Estimated: {estimatedReadLabel(estimatedReadTime).replace(/ estimated$/, "")}</span>
        <span>{viewLabel(stats.viewCount)}</span>
        <span>{engagedReadLabel(stats.engagedReadCount)}</span>
        {average ? <span>{average} avg active</span> : null}
      </span>
      <small>{disclosure}</small>
    </div>
  );
}
