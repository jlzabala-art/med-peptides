'use client';

/**
 * DrawerContext.jsx — Thin compatibility wrapper over Zustand useUIStore (Pillar 5).
 * DrawerProvider is no longer required at root (kept as no-op for callers).
 */
import { useUIStore } from '../stores/uiStore';

export function useDrawer() {
  const drawers = useUIStore((s) => s.drawers);
  const openDrawer = useUIStore((s) => s.openDrawer);
  const closeDrawer = useUIStore((s) => s.closeDrawer);
  const closeAllDrawers = useUIStore((s) => s.closeAllDrawers);
  return { drawers, openDrawer, closeDrawer, closeAllDrawers };
}

export function DrawerProvider({ children }) {
  return children;
}
