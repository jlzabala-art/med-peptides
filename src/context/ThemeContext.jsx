/**
 * ThemeContext.jsx — Thin compatibility wrapper over Zustand themeStore.
 * Todos los imports existentes `useTheme` siguen funcionando (sin CJS require).
 */
import { useThemeStore } from '../stores/themeStore';

export { useThemeStore as ThemeStore };

export function useTheme() {
  const theme = useThemeStore((s) => s.theme);
  const toggleTheme = useThemeStore((s) => s.toggleTheme);
  const setTheme = useThemeStore((s) => s.setTheme);
  return { theme, toggleTheme, setTheme };
}

// No-op provider for backward compat
export function ThemeProvider({ children }) {
  return children;
}
