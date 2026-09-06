"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { DISCOVERY_IDS, DISCOVERY_KEY, parseDiscoveries } from "./sceneState.mjs";

const JOURNAL_EVENT = "star:scenic-discovery";

export default function useDiscoveryJournal() {
  const [discoveries, setDiscoveries] = useState([]);
  const currentRef = useRef([]);
  useEffect(() => {
    const sync = (event) => {
      try {
        const next = parseDiscoveries(event?.detail || sessionStorage.getItem(DISCOVERY_KEY));
        currentRef.current = next;
        setDiscoveries(next);
      } catch { /* Optional storage: retain in-memory observations. */ }
    };
    sync();
    window.addEventListener(JOURNAL_EVENT, sync);
    return () => window.removeEventListener(JOURNAL_EVENT, sync);
  }, []);

  const record = useCallback((id) => {
    if (!DISCOVERY_IDS.includes(id) || currentRef.current.includes(id)) return;
    let stored = [];
    try { stored = parseDiscoveries(sessionStorage.getItem(DISCOVERY_KEY)); } catch { /* Optional. */ }
    const next = [...new Set([...currentRef.current, ...stored, id])];
    const serialized = JSON.stringify(next);
    currentRef.current = next;
    setDiscoveries(next);
    try { sessionStorage.setItem(DISCOVERY_KEY, serialized); } catch { /* Memory fallback. */ }
    window.dispatchEvent(new CustomEvent(JOURNAL_EVENT, { detail: serialized }));
  }, []);

  return { discoveries, record };
}
