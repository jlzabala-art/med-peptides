/**
 * ThemeContext.jsx — Thin compatibility wrapper over Zustand themeStore.
 * Todos los imports existentes `useTheme` siguen funcionando.
 * ThemeProvider ya no se necesita en AppProviders (no tiene estado propio).
 */
export { useThemeStore as ThemeStore } from '../stores/themeStore';

export const useTheme = () => {
  const { theme, toggleTheme, setTheme } = require('../stores/themeStore').useThemeStore();
  return { theme, toggleTheme, setTheme };
};

// No-op provider for backward compat during transition period
export function ThemeProvider({ children }) {
  return children;
}
