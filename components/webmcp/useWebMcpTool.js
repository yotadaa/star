"use client";

import { useEffect, useRef } from "react";
import { registerWebMcpTool } from "@/lib/webmcp/registerTool.mjs";

export default function useWebMcpTool({ definition, execute, enabled = true }) {
  const executeRef = useRef(execute);
  executeRef.current = execute;

  useEffect(() => {
    if (!enabled || typeof document === "undefined" || !document.modelContext?.registerTool) return undefined;
    const controller = new AbortController();
    registerWebMcpTool(
      document.modelContext,
      definition,
      (input, signal) => executeRef.current(input, signal),
      controller.signal,
    ).catch((error) => {
      if (process.env.NODE_ENV !== "production") {
        console.info(`[webmcp] ${definition.name} unavailable: ${error?.name || "registration_failed"}`);
      }
    });
    return () => controller.abort();
  }, [definition, enabled]);
}
