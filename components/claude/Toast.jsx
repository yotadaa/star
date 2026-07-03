"use client";

import React, { createContext, useCallback, useContext, useRef, useState } from "react";

const ToastContext = createContext(null);

/**
 * ToastProvider - pasang sekali di root layout, membungkus seluruh app:
 *   <ToastProvider><App /></ToastProvider>
 *
 * useToast() mengembalikan fungsi showToast(message, { icon }).
 * Hanya 1 toast tampil bersamaan (queue sederhana, bukan stack menumpuk).
 *
 * Trigger yang direkomendasikan (lihat report.md §6.1):
 *   - Mencapai node terakhir Journey Log
 *   - Klik "salin email/kontak"
 */
export function ToastProvider({ children }) {
  const [toast, setToast] = useState(null); // { id, message, icon }
  const queueRef = useRef([]);
  const timeoutRef = useRef(null);

  const processQueue = useCallback(() => {
    if (queueRef.current.length === 0) {
      setToast(null);
      timeoutRef.current = null;
      return;
    }
    const next = queueRef.current.shift();
    setToast(next);
    timeoutRef.current = setTimeout(() => {
      processQueue();
    }, 3500);
  }, []);

  const showToast = useCallback(
    (message, { icon = null } = {}) => {
      const id = Date.now() + Math.random();
      queueRef.current.push({ id, message, icon });
      if (!timeoutRef.current) {
        processQueue();
      }
    },
    [processQueue]
  );

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div
        className="toast-stack"
        aria-live="polite"
      >
        {toast && (
          <div key={toast.id} className="toast">
            {toast.icon && <span className="toast-icon">{toast.icon}</span>}
            <span>{toast.message}</span>
          </div>
        )}
      </div>
    </ToastContext.Provider>
  );
}

/**
 * useToast - dipakai di komponen manapun di dalam ToastProvider.
 * Contoh:
 *   const { showToast } = useToast();
 *   showToast("Kamu sudah mengikuti seluruh perjalanan!", { icon: <TrophyIcon/> });
 */
export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error("useToast harus dipakai di dalam <ToastProvider>");
  }
  return ctx;
}
