"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";

const START_EVENT = "mb-route-progress-start";
const INITIAL_PROGRESS = 0.08;
const MINIMUM_VISIBLE_MS = 180;
const SETTLE_MS = 180;
const FAILSAFE_MS = 12000;

const PROGRESS_STAGES = [
  [180, 0.34],
  [620, 0.58],
  [1400, 0.76],
  [3200, 0.88],
];

function normalizedPath(pathname) {
  const path = String(pathname || "/").replace(/\/+$/, "");
  return path || "/";
}

function eligibleInternalAnchor(event) {
  if (event.defaultPrevented || event.button > 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) {
    return null;
  }

  const target = event.target instanceof Element ? event.target : null;
  const anchor = target?.closest("a[href]");
  if (!anchor || anchor.hasAttribute("download") || anchor.dataset.routeProgress === "ignore") {
    return null;
  }

  const targetName = String(anchor.getAttribute("target") || "").toLowerCase();
  if (targetName && targetName !== "_self") return null;

  let destination;
  try {
    destination = new URL(anchor.href, window.location.href);
  } catch {
    return null;
  }

  if (destination.origin !== window.location.origin) return null;
  if (normalizedPath(destination.pathname) === normalizedPath(window.location.pathname)) return null;
  return anchor;
}

export function beginRouteProgress(href) {
  if (typeof window === "undefined") return;

  if (href) {
    try {
      const destination = new URL(href, window.location.href);
      if (
        destination.origin !== window.location.origin
        || normalizedPath(destination.pathname) === normalizedPath(window.location.pathname)
      ) {
        return;
      }
    } catch {
      return;
    }
  }

  window.dispatchEvent(new Event(START_EVENT));
}

export default function RouteProgressBar() {
  const pathname = usePathname();
  const [state, setState] = useState("idle");
  const [progress, setProgress] = useState(0);
  const stateRef = useRef("idle");
  const startedAtRef = useRef(0);
  const timersRef = useRef([]);
  const finishRef = useRef(() => {});
  const hasMountedRouteRef = useRef(false);

  useEffect(() => {
    function clearTimers() {
      timersRef.current.forEach((timer) => window.clearTimeout(timer));
      timersRef.current = [];
    }

    function reset() {
      clearTimers();
      stateRef.current = "idle";
      setState("idle");
      setProgress(0);
    }

    function finish() {
      if (stateRef.current !== "running") return;
      clearTimers();

      const elapsed = performance.now() - startedAtRef.current;
      const wait = Math.max(0, MINIMUM_VISIBLE_MS - elapsed);
      timersRef.current.push(window.setTimeout(() => {
        stateRef.current = "settling";
        setProgress(1);
        setState("settling");
        timersRef.current.push(window.setTimeout(reset, SETTLE_MS));
      }, wait));
    }

    function start() {
      if (stateRef.current === "running") return;
      clearTimers();
      startedAtRef.current = performance.now();
      stateRef.current = "running";
      setProgress(INITIAL_PROGRESS);
      setState("running");

      PROGRESS_STAGES.forEach(([delay, value]) => {
        timersRef.current.push(window.setTimeout(() => {
          if (stateRef.current === "running") setProgress(value);
        }, delay));
      });
      timersRef.current.push(window.setTimeout(finish, FAILSAFE_MS));
    }

    function onPointerDown(event) {
      if (event.pointerType === "mouse" && eligibleInternalAnchor(event)) start();
    }

    function onClick(event) {
      if (eligibleInternalAnchor(event)) start();
    }

    finishRef.current = finish;
    document.addEventListener("pointerdown", onPointerDown, true);
    document.addEventListener("click", onClick, true);
    window.addEventListener("popstate", start);
    window.addEventListener(START_EVENT, start);

    return () => {
      clearTimers();
      finishRef.current = () => {};
      document.removeEventListener("pointerdown", onPointerDown, true);
      document.removeEventListener("click", onClick, true);
      window.removeEventListener("popstate", start);
      window.removeEventListener(START_EVENT, start);
    };
  }, []);

  useEffect(() => {
    if (!hasMountedRouteRef.current) {
      hasMountedRouteRef.current = true;
      return;
    }
    finishRef.current();
  }, [pathname]);

  const active = state !== "idle";
  const position = `${Math.round(progress * 10000) / 100}%`;

  return (
    <div
      className={`route-progress-track is-${state}`}
      data-state={state}
      data-testid="route-progress"
      role={active ? "progressbar" : undefined}
      aria-hidden={active ? undefined : "true"}
      aria-label={active ? "Loading page" : undefined}
      aria-valuetext={active ? (state === "settling" ? "Page ready" : "Changing page") : undefined}
      style={{ "--route-progress-position": position }}
    >
      <span
        className="route-progress-fill"
        aria-hidden="true"
        style={{ transform: `scaleX(${progress})` }}
      />
      <span className="route-progress-cap" aria-hidden="true" />
    </div>
  );
}
