"use client";

import { useEffect } from 'react';

/**
 * useGlobalShortcuts
 * ─────────────────────────────────────────────────────────────────────────────
 * Registers cross-platform keyboard shortcuts (⌘K/Ctrl+K, Esc, ⌘P).
 */
export function useGlobalShortcuts({ onSearch = null, onEscape = null, onPrint = null }) {
  useEffect(() => {
    const handleKeyDown = (e) => {
      const isMeta = e.metaKey || e.ctrlKey;

      // ⌘K or Ctrl+K -> Search
      if (isMeta && e.key.toLowerCase() === 'k') {
        if (onSearch) {
          e.preventDefault();
          onSearch();
        }
      }

      // Escape -> Dismiss
      if (e.key === 'Escape') {
        if (onEscape) {
          e.preventDefault();
          onEscape();
        }
      }

      // ⌘P or Ctrl+P -> Print
      if (isMeta && e.key.toLowerCase() === 'p') {
        if (onPrint) {
          e.preventDefault();
          onPrint();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onSearch, onEscape, onPrint]);
}
