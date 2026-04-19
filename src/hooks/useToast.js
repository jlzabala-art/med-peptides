import { useState, useCallback, useRef } from 'react';

/**
 * useToast — FASE 4
 *
 * Cola de toasts con animaciones de entrada/salida, cleanup de timers,
 * y duraciones configurables por toast.
 *
 * Variants: 'success' | 'error' | 'info' | 'warning'
 *
 * Usage:
 *   const { toasts, toast } = useToast();
 *   toast.success('Protocol saved!');
 *   toast.error('Failed to delete.', { duration: 5000 });
 *   toast.dismiss(id);  // dismiss manually
 */

const DEFAULT_DURATION = 3500;
let _id = 0;

export function useToast() {
  const [toasts, setToasts] = useState([]);
  const timers = useRef({});

  const dismiss = useCallback((id) => {
    // Trigger CSS exit animation before removing from DOM
    setToasts((prev) =>
      prev.map((t) => (t.id === id ? { ...t, exiting: true } : t))
    );
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 320);
    clearTimeout(timers.current[id]);
    delete timers.current[id];
  }, []);

  const add = useCallback(
    (message, variant = 'info', options = {}) => {
      const id       = ++_id;
      const duration = options.duration ?? DEFAULT_DURATION;

      setToasts((prev) => [...prev, { id, message, variant, exiting: false }]);

      if (duration > 0) {
        timers.current[id] = setTimeout(() => dismiss(id), duration);
      }

      return id;
    },
    [dismiss]
  );

  const toast = {
    success: (msg, opts) => add(msg, 'success', opts ?? {}),
    error:   (msg, opts) => add(msg, 'error',   { duration: 5000, ...(opts ?? {}) }),
    info:    (msg, opts) => add(msg, 'info',    opts ?? {}),
    warning: (msg, opts) => add(msg, 'warning', opts ?? {}),
    dismiss,
  };

  return { toasts, toast };
}
