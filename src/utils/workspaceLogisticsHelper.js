/**
 * workspaceLogisticsHelper.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Predictive split-fulfillment and multi-hub logistics engine for the Workspace Buffer.
 * Classifies items by geographic dispatch hub and fulfillment SLA.
 */

export const FULFILLMENT_HUBS = {
  'hub-dubai': {
    id: 'hub-dubai',
    name: '🇦🇪 Dubai Central Hub (Direct / Compounding)',
    badge: '🇦🇪 24-48h (Dubai Direct)',
    color: '#0369a1',
    bg: '#f0f9ff',
    border: '#bae6fd',
    leadTimeDays: '1-2 business days',
    suppliers: ['supplier-centrico', 'centrico', 'supplier-magenta', 'magenta']
  },
  'hub-iberia': {
    id: 'hub-iberia',
    name: '🇪🇸 Iberia Hub (Spain GMP Labs)',
    badge: '🇪🇸 24-72h (Iberia Hub)',
    color: '#047857',
    bg: '#ecfdf5',
    border: '#a7f3d0',
    leadTimeDays: '2-3 business days',
    suppliers: ['supplier-fagron-iberia', 'supplier-fagron-genomics', 'fagron']
  },
  'hub-eu': {
    id: 'hub-eu',
    name: '🇪🇺 EU Central Hub (Poland / Greece / UK)',
    badge: '🇪🇺 2-4 Days (EU Hub)',
    color: '#1e40af',
    bg: '#eff6ff',
    border: '#bfdbfe',
    leadTimeDays: '3-5 business days',
    suppliers: ['supplier-europeptides', 'europeptides', 'supplier-pod-poland', 'pod', 'supplier-nplabs', 'nplabs', 'supplier-bioniq', 'bioniq']
  },
  'hub-freight': {
    id: 'hub-freight',
    name: '✈️ Air Freight Global (Bulk & APIs)',
    badge: '📦 7-10 Days (Air Freight)',
    color: '#b45309',
    bg: '#fffbeb',
    border: '#fde68a',
    leadTimeDays: '7-10 business days',
    suppliers: ['supplier-lotusland', 'lotusland', 'supplier-raw-api']
  }
};

/**
 * Resolves the fulfillment hub for a given supplierId
 */
export function resolveFulfillmentHub(supplierId) {
  if (!supplierId) return FULFILLMENT_HUBS['hub-dubai'];
  const key = String(supplierId).toLowerCase().trim();

  for (const hub of Object.values(FULFILLMENT_HUBS)) {
    if (hub.suppliers.some(s => key.includes(s) || s.includes(key))) {
      return hub;
    }
  }

  return FULFILLMENT_HUBS['hub-eu'];
}

/**
 * Groups workspace items by fulfillment hub for split-shipping intelligence
 * @param {Array} items - List of items in the workspace buffer
 * @returns {Array<{ hub: Object, items: Array, itemCount: number, totalQuantity: number }>}
 */
export function groupWorkspaceByFulfillment(items = []) {
  const hubMap = new Map();

  items.forEach(item => {
    const hub = resolveFulfillmentHub(item.supplierId || item.supplier);
    if (!hubMap.has(hub.id)) {
      hubMap.set(hub.id, {
        hub,
        items: [],
        itemCount: 0,
        totalQuantity: 0
      });
    }

    const entry = hubMap.get(hub.id);
    entry.items.push(item);
    entry.itemCount += 1;
    entry.totalQuantity += Number(item.quantity || 1);
  });

  return Array.from(hubMap.values());
}
