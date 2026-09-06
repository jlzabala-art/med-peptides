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

      // ⌘ + K -> Focus Global Search Bar
      if (isCmdOrCtrl && (e.key === 'k' || e.key === 'K')) {
        const searchInput = document.querySelector('input[type="search"], input[placeholder*="Search"]');
        if (searchInput) {
          e.preventDefault();
          searchInput.focus();
          searchInput.select?.();
        }
        return;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [toggleDrawer]);
}

export default useKeyboardShortcuts;
