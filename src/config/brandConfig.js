/**
 * brandConfig.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Authoritative Single Source of Truth for Platform Branding, Palette,
 * Typography, Assets & Institutional Credentials.
 */

export const BRAND_COLORS = {
  primaryNavy: '#003666',
  primaryNavyDark: '#002244',
  secondaryBlue: '#1A73E8',
  secondaryBlueHover: '#1557B0',
  clinicalTeal: '#0D9488',
  ekgCyan: '#00BCD4',
  darkAccentSky: '#38BDF8',
  surfacePage: '#F8FAFC',
  surfaceCard: '#FFFFFF',
  surfaceMuted: '#F1F5F9',
  borderSubtle: '#E2E8F0',
  borderControl: '#DADCE0',
  inkPrimary: '#0F172A',
  inkSecondary: '#475569',
  inkMuted: '#64748B',
  inkControl: '#5F6368',
  statusActive: '#137333',
  statusActiveBg: '#E6F4EA',
  statusPending: '#B06000',
  statusPendingBg: '#FEF7E0',
  statusError: '#C5221F',
  statusErrorBg: '#FCE8E6',
  statusInfo: '#1A73E8',
  statusInfoBg: '#E8F0FE',
};

export const BRAND_TYPOGRAPHY = {
  sans: 'Inter',
  mono: 'JetBrains Mono',
  sansStack: "var(--font-inter), 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
  monoStack: "var(--font-jetbrains-mono), 'JetBrains Mono', ui-monospace, SFMono-Regular, Menlo, monospace",
};

export const BRAND_ASSETS = {
  logoHorizontalSvg: '/brand/atlas-logo-horizontal.svg',
  logoHorizontalDarkSvg: '/brand/atlas-logo-horizontal-dark.svg',
  iconSvg: '/brand/atlas-icon.svg',
  iconBadgeSvg: '/favicon.svg',
  logoHorizontalPng: '/atlas-health-logo.png',
  logoSquarePng: '/atlas-health-logo-wa.png',
  iconPng: '/logo-icon-only.png',
};

export const BRAND_CONFIG = {
  name: 'Atlas Health Services',
  shortName: 'Atlas Health',
  shortCode: 'AS',
  domain: 'atlashealth-services.com',
  url: 'https://www.atlashealth-services.com',
  supportEmail: 'info@atlashealth-services.com',
  defaultPurity: '≥ 99.0%',
  colors: BRAND_COLORS,
  typography: BRAND_TYPOGRAPHY,
  assets: BRAND_ASSETS,
};

export default BRAND_CONFIG;
