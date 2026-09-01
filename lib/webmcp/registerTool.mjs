import { encodeWebMcpError, encodeWebMcpResult } from "./result.mjs";

function combineAbortSignals(...signals) {
  const activeSignals = signals.filter(Boolean);
  if (activeSignals.length < 2) {
    return { signal: activeSignals[0], dispose() {} };
  }
  if (typeof AbortSignal.any === "function") {
    return { signal: AbortSignal.any(activeSignals), dispose() {} };
  }

  const controller = new AbortController();
  const abortFrom = (signal) => {
    if (!controller.signal.aborted) controller.abort(signal.reason);
  };
  const listeners = activeSignals.map((signal) => {
    const listener = () => abortFrom(signal);
    if (signal.aborted) abortFrom(signal);
    else signal.addEventListener("abort", listener, { once: true });
    return [signal, listener];
  });
  return {
    signal: controller.signal,
    dispose() {
      for (const [signal, listener] of listeners) {
        signal.removeEventListener("abort", listener);
      }
    },
  };
}

export function registerWebMcpTool(modelContext, definition, handler, lifecycleSignal) {
  if (!modelContext?.registerTool || lifecycleSignal?.aborted) return Promise.resolve(false);

  const tool = {
    ...definition,
    execute: async (input = {}, options = {}) => {
      const combined = combineAbortSignals(options.signal, lifecycleSignal);
      try {
        const result = await handler(input, combined.signal);
        return encodeWebMcpResult(result || {});
      } catch (error) {
        return encodeWebMcpError(error);
      } finally {
        combined.dispose();
      }
    },
  };

  return modelContext.registerTool(tool, { signal: lifecycleSignal }).then(() => true);
}
