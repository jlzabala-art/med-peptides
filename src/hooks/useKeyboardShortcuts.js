/**
 * useKeyboardShortcuts.js
 * 
 * Global keyboard shortcuts hook for power operators.
 * Listens for:
 *   - ⌘ + Shift + W / Ctrl + Shift + W -> Toggle Workspace Drawer
 *   - ⌘ + K / Ctrl + K                -> Focus Global Search
 *   - ⌘ + P / Ctrl + P                -> Quick Prescription / Workflow Action
 */
import { useEffect } from 'react';
import { useWorkspaceStore } from '../stores/useWorkspaceStore';

export function useKeyboardShortcuts() {
  const toggleDrawer = useWorkspaceStore((s) => s.toggleDrawer);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleKeyDown = (e) => {
      const isCmdOrCtrl = e.metaKey || e.ctrlKey;

      // ⌘ + Shift + W -> Toggle Workspace Drawer
      if (isCmdOrCtrl && e.shiftKey && (e.key === 'w' || e.key === 'W')) {
        e.preventDefault();
        toggleDrawer();
        return;
      }

      // ⌘ + K / Ctrl + K -> Focus Global Search Bar / Omnibar
      if (isCmdOrCtrl && (e.key === 'k' || e.key === 'K')) {
        e.preventDefault();
        window.dispatchEvent(new CustomEvent('focus-global-search'));
        const searchInput = document.querySelector(
          'input[data-global-search], .global-search-input, #header-global-search, input[type="search"], input[placeholder*="Search"]'
        );
        if (searchInput) {
          searchInput.focus();
          searchInput.select?.();
        }
        return;
      }

      // ⌘ + / or Ctrl + / -> Help Drawer (GCP standard)
      if (isCmdOrCtrl && (e.key === '/' || e.key === '?')) {
        e.preventDefault();
        window.dispatchEvent(new CustomEvent('toggle-help-drawer'));
        return;
      }

      // ⌘ + B or Ctrl + B -> Toggle Navigation Sidebar
      if (isCmdOrCtrl && (e.key === 'b' || e.key === 'B')) {
        e.preventDefault();
        window.dispatchEvent(new CustomEvent('toggle-app-sidebar'));
        return;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [toggleDrawer]);
}

export default useKeyboardShortcuts;
