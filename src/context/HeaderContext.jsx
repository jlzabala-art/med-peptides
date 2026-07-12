/**
 * HeaderContext.jsx — Thin compatibility wrapper over Zustand headerStore.
 * Todos los imports existentes `useHeaderContext` siguen funcionando.
 * HeaderProvider ya no es necesario en AppProviders.
 */
import { useHeaderStore } from '../stores/headerStore';

export function useHeaderContext() {
  return useHeaderStore();
}

// No-op provider for backward compat during transition period
export function HeaderProvider({ children }) {
  return children;
}
