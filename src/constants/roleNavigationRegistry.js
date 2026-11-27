/**
 * roleNavigationRegistry.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Single Source of Truth (pure ESM, zero React dependencies) for role-scoped
 * navigation menus across the unified portal (no public-vs-private split).
 *
 * Rules:
 *   - `guest` or signed share-link visitor -> [] (zero global menus)
 *   - `admin`                              -> full global menus (handled by AppSwitcher / B2BUniversalMenu / ClinicalFormatSwitcher)
 *   - Authenticated non-admin roles        -> concise 3–5 item role-specific menu
 *     respecting `market` and optional `allowedSchedules`.
 */

import { normalizeRole, normalizePricingMarket } from './roles.js';

export const AVAILABLE_SCHEDULE_IDS = Object.freeze([
  { id: 'peptides', labelEn: 'Peptides B2B', labelEs: 'Péptidos B2B', href: '/pricing/peptides' },
  { id: 'pens', labelEn: 'Peptide Pens U-100', labelEs: 'Plumas U-100', href: '/pricing/pens' },
  { id: 'pellets', labelEn: 'Hormone Pellets', labelEs: 'Pellets Hormonales', href: '/pricing/pellets' },
  { id: 'hormones', labelEn: 'BHRT & Hormones', labelEs: 'Hormonas BHRT', href: '/pricing/hormones' },
  { id: '24genetics', labelEn: '24Genetics DNA', labelEs: '24Genetics ADN', href: '/pricing/24genetics' },
  { id: 'bloodo', labelEn: 'Bloodo™ Diagnostics', labelEs: 'Bloodo™ Diagnóstico', href: '/pricing/bloodo' },
  { id: 'colway', labelEn: 'Colway® Derma & Hair', labelEs: 'Colway® Derma y Capilar', href: '/pricing/colway' },
  { id: 'fillers', labelEn: 'Fillers & Boosters', labelEs: 'Fillers y Boosters', href: '/pricing/fillers' },
]);

const ROLE_MENU_BLUEPRINTS = Object.freeze({
  distributor: [
    { id: 'dist-pricing', href: '/pricing', labelEn: 'My Price Schedules', labelEs: 'Mis Tarifas', attachMarket: true, isScheduleHub: true },
    { id: 'dist-orders', href: '/orders', labelEn: 'Orders & Quotes', labelEs: 'Pedidos y Cotizaciones' },
    { id: 'dist-portal', href: '/wholesaler', labelEn: 'Partner Portal', labelEs: 'Portal Partner' },
    { id: 'dist-calc', href: '/calculator', labelEn: 'Calculator', labelEs: 'Calculadora' },
  ],
  wholesaler: [
    { id: 'ws-pricing', href: '/pricing', labelEn: 'Wholesale Schedules', labelEs: 'Tarifas Mayoristas', attachMarket: true, isScheduleHub: true },
    { id: 'ws-orders', href: '/orders', labelEn: 'Orders & RFQs', labelEs: 'Pedidos y RFQ' },
    { id: 'ws-portal', href: '/wholesaler', labelEn: 'Wholesaler Portal', labelEs: 'Portal Wholesaler' },
    { id: 'ws-proto', href: '/proto', labelEn: 'Clinical Protocols', labelEs: 'Protocolos Clínicos' },
  ],
  doctor: [
    { id: 'doc-portal', href: '/doctor', labelEn: 'Physician Portal', labelEs: 'Portal Médico' },
    { id: 'doc-proto', href: '/proto', labelEn: 'Protocols', labelEs: 'Protocolos' },
    { id: 'doc-pens', href: '/pricing/pens', labelEn: 'Pens U-100 Guide', labelEs: 'Guía Plumas U-100' },
    { id: 'doc-calc', href: '/calculator', labelEn: 'Dosing Calculator', labelEs: 'Calculadora' },
    { id: 'doc-pricing', href: '/pricing', labelEn: 'Clinic Schedules', labelEs: 'Tarifas Clínica', attachMarket: true, isScheduleHub: true },
  ],
  clinic: [
    { id: 'cli-portal', href: '/clinic', labelEn: 'Clinic Portal', labelEs: 'Portal Clínica' },
    { id: 'cli-proto', href: '/proto', labelEn: 'Protocols', labelEs: 'Protocolos' },
    { id: 'cli-calc', href: '/calculator', labelEn: 'Calculator', labelEs: 'Calculadora' },
    { id: 'cli-orders', href: '/orders', labelEn: 'Orders', labelEs: 'Pedidos' },
    { id: 'cli-pricing', href: '/pricing', labelEn: 'Clinic Schedules', labelEs: 'Tarifas Clínica', attachMarket: true, isScheduleHub: true },
  ],
  medical_director: [
    { id: 'md-portal', href: '/doctor', labelEn: 'Clinical Portal', labelEs: 'Portal Clínico' },
    { id: 'md-proto', href: '/proto', labelEn: 'Protocols', labelEs: 'Protocolos' },
    { id: 'md-calc', href: '/calculator', labelEn: 'Calculator', labelEs: 'Calculadora' },
    { id: 'md-pricing', href: '/pricing', labelEn: 'Schedules', labelEs: 'Tarifas', attachMarket: true, isScheduleHub: true },
  ],
  account_manager: [
    { id: 'am-portal', href: '/account-manager', labelEn: 'Account Manager', labelEs: 'Account Manager' },
    { id: 'am-labels', href: '/labels', labelEn: 'Labels Station', labelEs: 'Estación Etiquetas' },
    { id: 'am-intake', href: '/rx/intake', labelEn: 'Import Rx', labelEs: 'Importar Rx' },
  ],
  patient: [
    { id: 'pat-portal', href: '/patient', labelEn: 'My Treatment', labelEs: 'Mi Tratamiento' },
    { id: 'pat-calc', href: '/calculator', labelEn: 'Dosing Guide', labelEs: 'Guía de Dosis' },
    { id: 'pat-orders', href: '/orders', labelEn: 'My Orders', labelEs: 'Mis Pedidos' },
  ],
  supplier: [
    { id: 'sup-portal', href: '/supplier', labelEn: 'Supplier Portal', labelEs: 'Portal Proveedor' },
    { id: 'sup-orders', href: '/orders', labelEn: 'Orders & RFQs', labelEs: 'Pedidos y RFQs' },
  ],
  compounding_pharmacy: [
    { id: 'ph-portal', href: '/pharmacy', labelEn: 'Pharmacy Portal', labelEs: 'Portal Farmacia' },
    { id: 'ph-labels', href: '/labels', labelEn: 'Labels Station', labelEs: 'Etiquetas' },
    { id: 'ph-orders', href: '/orders', labelEn: 'Orders', labelEs: 'Pedidos' },
  ],
});

/**
 * Returns the concise role-specific navigation items for an authenticated
 * non-admin session. Returns [] for `guest`, share-link visitors, or `admin`.
 */
export function getRoleMenuItems({
  role = 'guest',
  market = 'global',
  allowedSchedules = null,
  hasShareGrant = false,
} = {}) {
  if (hasShareGrant) return [];
  const normalized = normalizeRole(role);
  if (!normalized || normalized === 'guest' || normalized === 'admin') return [];

  const blueprint = ROLE_MENU_BLUEPRINTS[normalized] || [];
  const normalizedMarket = normalizePricingMarket(market || 'global');
  const allowedSet =
    Array.isArray(allowedSchedules) && allowedSchedules.length > 0
      ? new Set(allowedSchedules.map((s) => String(s).toLowerCase().trim()))
      : null;

  const items = [];
  for (const item of blueprint) {
    // If user has explicit allowedSchedules (e.g. ['colway', '24genetics']),
    // replace the generic '/pricing' hub item with direct links to ONLY those schedules.
    if (item.isScheduleHub && allowedSet) {
      for (const sched of AVAILABLE_SCHEDULE_IDS) {
        if (!allowedSet.has(sched.id)) continue;
        const href =
          normalizedMarket !== 'global'
            ? `${sched.href}?market=${normalizedMarket}`
            : sched.href;
        items.push({
          id: `sched-${sched.id}`,
          href,
          labelEn: sched.labelEn,
          labelEs: sched.labelEs,
        });
      }
      continue;
    }

    const href =
      item.attachMarket && normalizedMarket !== 'global'
        ? `${item.href}?market=${normalizedMarket}`
        : item.href;

    items.push({
      id: item.id,
      href,
      labelEn: item.labelEn,
      labelEs: item.labelEs,
    });
  }

  return items;
}
