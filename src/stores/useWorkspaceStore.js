import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { useShallow } from 'zustand/react/shallow';
import { resolveItemSku } from '@/utils/skuResolver';
import { normalizeVariant } from '../repositories/mappers';

function generateWorkspaceId() {
  return `ws_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
}

export function getWorkspaceInitials(ws) {
  if (!ws) return 'WS';
  const name = ws.targetEntity?.name || ws.targetEntity?.displayName || ws.name || '';
  const clean = name.trim().replace(/^Dr\.\s+/i, '').replace(/[^a-zA-Z0-9\s]/g, '');
  const parts = clean.split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  if (parts.length === 1 && parts[0].length >= 2) {
    return parts[0].substring(0, 2).toUpperCase();
  }
  return (ws.name ? ws.name.substring(0, 2) : 'W1').toUpperCase();
}

const DEFAULT_WORKSPACE = {
  id: 'ws_default',
  name: 'Workspace 1',
  createdAt: Date.now(),
  updatedAt: Date.now(),
  status: 'draft', // 'draft' | 'converted'
  convertedAt: null,
  convertedInfo: null, // { type, docId, summary }
  items: [],
  operationType: 'unassigned', // 'sell_quotation' | 'sell_prescription' | 'sell_order' | 'buy_po' | 'buy_rfq' | 'unassigned'
  intent: 'sell', // 'sell' | 'buy'
  targetEntity: null, // { type: 'clinic'|'patient'|'doctor'|'wholesaler'|'supplier', id, name, email, phone }
  selectedTargetType: 'clinic',
  shippingMethod: 'cold_chain', // 'cold_chain' | 'express' | 'pickup'
  shippingAddress: '',
  shippingNotes: '',
  selectedShippingOptionId: null, // Logistics estimator option ID
  selectedWarehouseId: null,      // Supplier warehouse ID (e.g. 'poland', 'hongkong')
  shippingCostOverride: null,     // Manual cost override (null = auto-calculated)
  discountPercent: 0,
  pricingTier: 'clinic', // 'cost' | 'wholesale' | 'clinic' | 'retail'
  appliedMarkupPercent: null, // Custom markup applied to this workspace (e.g. 30)
  currency: 'USD',
  notes: '',
};

// ─── 1. Workspace Lifecycle Slice ─────────────────────────────────────────────
const createWorkspaceLifecycleSlice = (set, get) => ({
  workspaces: {
    ws_default: { ...DEFAULT_WORKSPACE },
  },
  activeWorkspaceId: 'ws_default',
  workspaceHistory: [], // Last 10 soft-archived/converted workspaces
  isDrawerOpen: false,

  setDrawerOpen: (open) => set({ isDrawerOpen: !!open }),
  toggleDrawer: () => set((s) => ({ isDrawerOpen: !s.isDrawerOpen })),

  setActiveWorkspace: (id) => {
    const { workspaces } = get();
    if (workspaces[id]) {
      set({ activeWorkspaceId: id });
    }
  },

  createWorkspace: (name, initialIntent = 'sell') => {
    const { workspaces, workspaceHistory = [] } = get();
    let currentWorkspaces = { ...workspaces };
    const keys = Object.keys(currentWorkspaces);

    let newHistory = [...workspaceHistory];

    // Max 3 active workspaces rule (FIFO eviction of oldest or converted)
    if (keys.length >= 3) {
      // Preference 1: already converted workspace
      let evictId = keys.find(k => currentWorkspaces[k]?.status === 'converted');
      // Preference 2: oldest workspace by updatedAt or createdAt
      if (!evictId) {
        evictId = keys.reduce((oldest, k) => {
          const tOld = currentWorkspaces[oldest]?.updatedAt || currentWorkspaces[oldest]?.createdAt || 0;
          const tCur = currentWorkspaces[k]?.updatedAt || currentWorkspaces[k]?.createdAt || 0;
          return tCur < tOld ? k : oldest;
        }, keys[0]);
      }

      if (evictId && currentWorkspaces[evictId]) {
        const evicted = currentWorkspaces[evictId];
        if ((evicted.items && evicted.items.length > 0) || evicted.targetEntity) {
          newHistory = [
            {
              ...evicted,
              archivedAt: Date.now(),
              archiveReason: evicted.status === 'converted' ? 'converted' : 'fifo_limit',
            },
            ...newHistory.filter(h => h.id !== evicted.id).slice(0, 9),
          ];
        }
        delete currentWorkspaces[evictId];
      }
    }

    const id = generateWorkspaceId();
    const count = Object.keys(currentWorkspaces).length + 1;
    const wsName = name || `Workspace ${count}`;

    const newWs = {
      id,
      name: wsName,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      status: 'draft',
      convertedAt: null,
      convertedInfo: null,
      items: [],
      operationType: 'unassigned',
      intent: initialIntent,
      targetEntity: null,
      selectedTargetType: 'clinic',
      shippingMethod: 'cold_chain',
      shippingAddress: '',
      shippingNotes: '',
      selectedShippingOptionId: null,
      selectedWarehouseId: null,
      shippingCostOverride: null,
      discountPercent: 0,
      pricingTier: initialIntent === 'buy' ? 'cost' : 'clinic',
      appliedMarkupPercent: null,
      currency: 'USD',
      notes: '',
    };

    currentWorkspaces[id] = newWs;

    set({
      workspaces: currentWorkspaces,
      activeWorkspaceId: id,
      workspaceHistory: newHistory,
    });

    return id;
  },

  renameWorkspace: (id, newName) => {
    const { workspaces } = get();
    if (!workspaces[id] || !newName.trim()) return;

    set((s) => ({
      workspaces: {
        ...s.workspaces,
        [id]: { ...s.workspaces[id], name: newName.trim(), updatedAt: Date.now() },
      },
    }));
  },

  duplicateWorkspace: (id) => {
    const { workspaces, workspaceHistory = [] } = get();
    const source = workspaces[id];
    if (!source) return null;

    let currentWorkspaces = { ...workspaces };
    const keys = Object.keys(currentWorkspaces);
    let newHistory = [...workspaceHistory];

    // Max 3 active workspaces rule
    if (keys.length >= 3) {
      let evictId = keys.find(k => currentWorkspaces[k]?.status === 'converted');
      if (!evictId) {
        evictId = keys.reduce((oldest, k) => {
          const tOld = currentWorkspaces[oldest]?.updatedAt || currentWorkspaces[oldest]?.createdAt || 0;
          const tCur = currentWorkspaces[k]?.updatedAt || currentWorkspaces[k]?.createdAt || 0;
          return tCur < tOld ? k : oldest;
        }, keys[0]);
      }
      if (evictId && currentWorkspaces[evictId]) {
        const evicted = currentWorkspaces[evictId];
        if ((evicted.items && evicted.items.length > 0) || evicted.targetEntity) {
          newHistory = [
            { ...evicted, archivedAt: Date.now(), archiveReason: 'fifo_limit' },
            ...newHistory.filter(h => h.id !== evicted.id).slice(0, 9),
          ];
        }
        delete currentWorkspaces[evictId];
      }
    }

    const newId = generateWorkspaceId();
    const dup = {
      ...source,
      id: newId,
      name: `${source.name} (Copy)`,
      status: 'draft',
      convertedAt: null,
      convertedInfo: null,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      items: source.items.map((it) => ({ ...it })),
    };

    currentWorkspaces[newId] = dup;

    set({
      workspaces: currentWorkspaces,
      activeWorkspaceId: newId,
      workspaceHistory: newHistory,
    });

    return newId;
  },

  deleteWorkspace: (id) => {
    const { workspaces, activeWorkspaceId, workspaceHistory = [] } = get();
    const keys = Object.keys(workspaces);

    const wsToDelete = workspaces[id];
    let newHistory = [...workspaceHistory];
    if (wsToDelete && ((wsToDelete.items && wsToDelete.items.length > 0) || wsToDelete.targetEntity)) {
      newHistory = [
        { ...wsToDelete, archivedAt: Date.now(), archiveReason: 'manual_delete' },
        ...newHistory.filter(h => h.id !== id).slice(0, 9),
      ];
    }

    if (keys.length <= 1) {
      const defaultWs = { ...DEFAULT_WORKSPACE, id: 'ws_default', createdAt: Date.now() };
      set({
        workspaces: { ws_default: defaultWs },
        activeWorkspaceId: 'ws_default',
        workspaceHistory: newHistory,
      });
      return;
    }

    const nextWorkspaces = { ...workspaces };
    delete nextWorkspaces[id];

    let nextActive = activeWorkspaceId;
    if (activeWorkspaceId === id) {
      nextActive = Object.keys(nextWorkspaces)[0];
    }

    set({
      workspaces: nextWorkspaces,
      activeWorkspaceId: nextActive,
      workspaceHistory: newHistory,
    });
  },

  convertWorkspace: (id, docInfo = {}) => {
    const wsId = id || get().activeWorkspaceId;
    const { workspaces, workspaceHistory = [] } = get();
    const ws = workspaces[wsId];
    if (!ws) return;

    const convertedWs = {
      ...ws,
      status: 'converted',
      convertedAt: Date.now(),
      convertedInfo: docInfo, // { type: 'quotation' | 'purchase_order' | 'prescription', docId, summary }
      updatedAt: Date.now(),
    };

    const historyEntry = {
      ...convertedWs,
      archivedAt: Date.now(),
      archiveReason: 'converted',
    };
    const updatedHistory = [historyEntry, ...workspaceHistory.filter(h => h.id !== wsId).slice(0, 9)];

    set((s) => ({
      workspaces: {
        ...s.workspaces,
        [wsId]: convertedWs,
      },
      workspaceHistory: updatedHistory,
    }));
  },

  restoreWorkspaceFromHistory: (historyIndex) => {
    const { workspaces, workspaceHistory = [] } = get();
    const itemToRestore = workspaceHistory[historyIndex];
    if (!itemToRestore) return null;

    let currentWorkspaces = { ...workspaces };
    const keys = Object.keys(currentWorkspaces);
    let newHistory = workspaceHistory.filter((_, idx) => idx !== historyIndex);

    // Max 3 active workspaces rule: evict oldest
    if (keys.length >= 3) {
      let evictId = keys.find(k => currentWorkspaces[k]?.status === 'converted');
      if (!evictId) {
        evictId = keys.reduce((oldest, k) => {
          const tOld = currentWorkspaces[oldest]?.updatedAt || currentWorkspaces[oldest]?.createdAt || 0;
          const tCur = currentWorkspaces[k]?.updatedAt || currentWorkspaces[k]?.createdAt || 0;
          return tCur < tOld ? k : oldest;
        }, keys[0]);
      }
      if (evictId && currentWorkspaces[evictId]) {
        const evicted = currentWorkspaces[evictId];
        if ((evicted.items && evicted.items.length > 0) || evicted.targetEntity) {
          newHistory = [
            { ...evicted, archivedAt: Date.now(), archiveReason: 'fifo_limit' },
            ...newHistory.filter(h => h.id !== evicted.id).slice(0, 9),
          ];
        }
        delete currentWorkspaces[evictId];
      }
    }

    const restoredId = generateWorkspaceId();
    const restoredWs = {
      ...itemToRestore,
      id: restoredId,
      name: `${itemToRestore.name} (Restored)`,
      status: 'draft',
      convertedAt: null,
      convertedInfo: null,
      updatedAt: Date.now(),
    };

    currentWorkspaces[restoredId] = restoredWs;

    set({
      workspaces: currentWorkspaces,
      activeWorkspaceId: restoredId,
      workspaceHistory: newHistory,
    });

    return restoredId;
  },

  clearWorkspaceHistory: () => {
    set({ workspaceHistory: [] });
  },

  clearWorkspaceItems: (id) => {
    const wsId = id || get().activeWorkspaceId;
    const { workspaces } = get();
    if (!workspaces[wsId]) return;

    set((s) => ({
      workspaces: {
        ...s.workspaces,
        [wsId]: {
          ...s.workspaces[wsId],
          items: [],
          targetEntity: null,
          status: 'draft',
          convertedAt: null,
          convertedInfo: null,
          operationType: 'unassigned',
          updatedAt: Date.now(),
        },
      },
    }));
  },
});

// ─── Price Extraction Helper ───────────────────────────────────────────────────
function extractNumericVal(val) {
  if (val === null || val === undefined) return 0;
  if (typeof val === 'number') return isNaN(val) ? 0 : val;
  if (typeof val === 'string') {
    const p = parseFloat(val.replace(/[^0-9.]/g, ''));
    return isNaN(p) ? 0 : p;
  }
  if (typeof val === 'object') {
    if (typeof val.perUnit === 'number' && val.perUnit > 0) return val.perUnit;
    if (typeof val.base === 'number' && val.base > 0) return val.base;
    if (typeof val.price === 'number' && val.price > 0) return val.price;
    if (typeof val.value === 'number' && val.value > 0) return val.value;
    if (typeof val.amount === 'number' && val.amount > 0) return val.amount;
  }
  return 0;
}

function extractItemPrice(item) {
  if (!item) return 0;
  const direct =
    extractNumericVal(item.unitPrice) ||
    extractNumericVal(item.price) ||
    extractNumericVal(item.unitRate) ||
    extractNumericVal(item.resolvedPrice?.perUnit) ||
    extractNumericVal(item.resolvedPrice);
  if (direct > 0) return direct;

  const pricing = item.pricing;
  if (pricing) {
    const p =
      extractNumericVal(pricing.clinicPrice) ||
      extractNumericVal(pricing.retailPrice) ||
      extractNumericVal(pricing.wholesalePrice) ||
      extractNumericVal(pricing.masterPrice) ||
      extractNumericVal(pricing.clinic) ||
      extractNumericVal(pricing.retail) ||
      extractNumericVal(pricing.wholesale) ||
      extractNumericVal(pricing.master) ||
      extractNumericVal(pricing);
    if (p > 0) return p;
  }

  if (Array.isArray(item.variants) && item.variants.length > 0) {
    for (const v of item.variants) {
      const vp = extractItemPrice(v);
      if (vp > 0) return vp;
    }
  }

  return 0;
}

// ─── 2. Items & Batch Modifiers Slice ──────────────────────────────────────────
const createWorkspaceItemsSlice = (set, get) => ({
  addItem: (item, targetWorkspaceId = null, options = {}) => {
    const { workspaces, activeWorkspaceId } = get();
    const wsId = targetWorkspaceId || activeWorkspaceId;
    const ws = workspaces[wsId] || Object.values(workspaces)[0];
    if (!ws) return;

    const canonicalId = item.id || item.variantId || item.productId || `item_${Date.now()}`;
    const existingIndex = ws.items.findIndex(
      (it) => (it.id && it.id === canonicalId) || (it.variantId && it.variantId === item.variantId)
    );

    const supplierCost = Number(item.supplierCost || item.costPrice || item.pricing?.supplierCost || 0);
    const targetEntity = ws.targetEntity;
    const effectiveMarkup = ws.appliedMarkupPercent ?? targetEntity?.priceMarkupPercent ?? targetEntity?.markupPercent ?? null;
    let resolvedPrice = extractItemPrice(item);

    // Apply recipient/workspace active markup over cost
    if (effectiveMarkup != null && !isNaN(effectiveMarkup) && supplierCost > 0) {
      resolvedPrice = Number((supplierCost * (1 + Number(effectiveMarkup) / 100)).toFixed(2));
    } else if (ws.pricingTier === 'wholesale' && (!resolvedPrice || resolvedPrice === item.pricing?.clinic?.perUnit)) {
      if (item.pricing?.wholesale?.perUnit) {
        resolvedPrice = item.pricing.wholesale.perUnit;
      } else if (supplierCost > 0) {
        resolvedPrice = Number((supplierCost * 1.25).toFixed(2));
      }
    } else if (ws.pricingTier === 'retail' && (!resolvedPrice || resolvedPrice === item.pricing?.clinic?.perUnit)) {
      if (item.pricing?.retail?.perUnit) {
        resolvedPrice = item.pricing.retail.perUnit;
      } else if (supplierCost > 0) {
        resolvedPrice = Number((supplierCost * 2.00).toFixed(2));
      }
    }

    // Fail-Safe: Never leave product with 0 or negative price if supplierCost > 0
    if ((!resolvedPrice || resolvedPrice <= 0) && supplierCost > 0) {
      resolvedPrice = Number((supplierCost * 1.25).toFixed(2));
    }

    let nextItems = [...ws.items];
    if (existingIndex >= 0) {
      const existing = nextItems[existingIndex];
      nextItems[existingIndex] = {
        ...existing,
        quantity: (existing.quantity || 1) + (item.quantity || 1),
        unitPrice: existing.unitPrice || resolvedPrice,
        price: existing.price || resolvedPrice,
        unitRate: existing.unitRate || resolvedPrice,
      };
    } else {
      const norm = normalizeVariant(item);
      const tier10Obj = norm.tier_10 || null;
      const tier10Price = norm.tier_10_price || null;

      nextItems.push({
        id: canonicalId,
        productId: item.productId || item.id,
        variantId: item.variantId || item.id,
        canonicalName: item.canonicalName || item.displayName || item.name || 'Custom Compound',
        sku: resolveItemSku(item),
        dosage: item.dosage || item.unit || '',
        format: item.format || item.dosage_form || 'Vial',
        quantity: item.quantity || 1,
        unitPrice: resolvedPrice,
        price: resolvedPrice,
        unitRate: resolvedPrice,
        supplierCost: supplierCost,
        supplierId: item.supplierId || item.supplier || '',
        supplierName: item.supplierName || '',
        category: item.category || '',
        presentation: item.presentation || '',
        targetTier: ws.pricingTier || 'clinic',
        appliedMarkup: effectiveMarkup != null ? Number(effectiveMarkup) : (ws.pricingTier === 'wholesale' ? 25 : ws.pricingTier === 'retail' ? 100 : 50),
        // ── Canonical Homogeneous Tier 10 (Zero Mappings) ──
        tier_10: tier10Obj,
        tier_10_price: tier10Price,
        cost_tiers: item.cost_tiers || null,
        cost_10: tier10Price,
      });
    }

    const shouldOpen = options?.openDrawer !== undefined ? Boolean(options.openDrawer) : true;
    set((s) => ({
      isDrawerOpen: shouldOpen ? true : s.isDrawerOpen,
      workspaces: {
        ...s.workspaces,
        [ws.id]: { ...ws, items: nextItems, updatedAt: Date.now() },
      },
    }));
  },

  addItems: (itemsToAdd, targetWorkspaceId = null, options = {}) => {
    const { workspaces, activeWorkspaceId } = get();
    const wsId = targetWorkspaceId || activeWorkspaceId;
    const ws = workspaces[wsId] || Object.values(workspaces)[0];
    if (!ws || !Array.isArray(itemsToAdd) || itemsToAdd.length === 0) return;

    const targetEntity = ws.targetEntity;
    const effectiveMarkup = ws.appliedMarkupPercent ?? targetEntity?.priceMarkupPercent ?? targetEntity?.markupPercent ?? null;

    let nextItems = [...ws.items];
    itemsToAdd.forEach((item) => {
      const canonicalId = item.id || item.variantId || item.productId || `item_${Date.now()}_${Math.random()}`;
      const existingIndex = nextItems.findIndex(
        (it) => (it.id && it.id === canonicalId) || (it.variantId && it.variantId === item.variantId)
      );

      const supplierCost = Number(item.supplierCost || item.costPrice || item.pricing?.supplierCost || 0);
      let resolvedPrice = extractItemPrice(item);

      if (effectiveMarkup != null && !isNaN(effectiveMarkup) && supplierCost > 0) {
        resolvedPrice = Number((supplierCost * (1 + Number(effectiveMarkup) / 100)).toFixed(2));
      } else if (ws.pricingTier === 'wholesale' && (!resolvedPrice || resolvedPrice === item.pricing?.clinic?.perUnit)) {
        if (item.pricing?.wholesale?.perUnit) {
          resolvedPrice = item.pricing.wholesale.perUnit;
        } else if (supplierCost > 0) {
          resolvedPrice = Number((supplierCost * 1.25).toFixed(2));
        }
      } else if (ws.pricingTier === 'retail' && (!resolvedPrice || resolvedPrice === item.pricing?.clinic?.perUnit)) {
        if (item.pricing?.retail?.perUnit) {
          resolvedPrice = item.pricing.retail.perUnit;
        } else if (supplierCost > 0) {
          resolvedPrice = Number((supplierCost * 2.00).toFixed(2));
        }
      }

      if ((!resolvedPrice || resolvedPrice <= 0) && supplierCost > 0) {
        resolvedPrice = Number((supplierCost * 1.25).toFixed(2));
      }

      if (existingIndex >= 0) {
        nextItems[existingIndex] = {
          ...nextItems[existingIndex],
          quantity: (nextItems[existingIndex].quantity || 1) + (item.quantity || 1),
          unitPrice: nextItems[existingIndex].unitPrice || resolvedPrice,
          price: nextItems[existingIndex].price || resolvedPrice,
          unitRate: nextItems[existingIndex].unitRate || resolvedPrice,
        };
      } else {
        const norm = normalizeVariant(item);
        const tier10Obj = norm.tier_10 || null;
        const tier10Price = norm.tier_10_price || null;

        nextItems.push({
          id: canonicalId,
          productId: item.productId || item.id,
          variantId: item.variantId || item.id,
          canonicalName: item.canonicalName || item.displayName || item.name || 'Custom Compound',
          sku: item.sku || resolveItemSku(item),
          dosage: item.dosage || item.unit || '',
          format: item.format || item.dosage_form || 'Vial',
          quantity: item.quantity || 1,
          unitPrice: resolvedPrice,
          price: resolvedPrice,
          unitRate: resolvedPrice,
          supplierCost: supplierCost,
          supplierId: item.supplierId || item.supplier || '',
          supplierName: item.supplierName || '',
          category: item.category || '',
          presentation: item.presentation || '',
          targetTier: ws.pricingTier || 'clinic',
          appliedMarkup: effectiveMarkup != null ? Number(effectiveMarkup) : (ws.pricingTier === 'wholesale' ? 25 : ws.pricingTier === 'retail' ? 100 : 50),
          tier_10: tier10Obj,
          tier_10_price: tier10Price,
          cost_tiers: item.cost_tiers || null,
          cost_10: tier10Price,
        });
      }
    });

    const shouldOpen = options?.openDrawer !== undefined ? Boolean(options.openDrawer) : true;
    set((s) => ({
      isDrawerOpen: shouldOpen ? true : s.isDrawerOpen,
      workspaces: {
        ...s.workspaces,
        [ws.id]: { ...ws, items: nextItems, updatedAt: Date.now() },
      },
    }));
  },

  removeItem: (itemId, targetWorkspaceId = null) => {
    const { workspaces, activeWorkspaceId } = get();
    const wsId = targetWorkspaceId || activeWorkspaceId;
    const ws = workspaces[wsId];
    if (!ws) return;

    const nextItems = ws.items.filter((it) => it.id !== itemId);
    set((s) => ({
      workspaces: {
        ...s.workspaces,
        [wsId]: { ...ws, items: nextItems, updatedAt: Date.now() },
      },
    }));
  },

  updateItemQuantity: (itemId, quantity, targetWorkspaceId = null) => {
    const { workspaces, activeWorkspaceId } = get();
    const wsId = targetWorkspaceId || activeWorkspaceId;
    const ws = workspaces[wsId];
    if (!ws) return;

    const nextQty = Math.max(1, parseInt(quantity, 10) || 1);
    const nextItems = ws.items.map((it) =>
      it.id === itemId ? { ...it, quantity: nextQty } : it
    );

    set((s) => ({
      workspaces: {
        ...s.workspaces,
        [wsId]: { ...ws, items: nextItems, updatedAt: Date.now() },
      },
    }));
  },

  updateItemPrice: (itemId, price, targetWorkspaceId = null) => {
    const { workspaces, activeWorkspaceId } = get();
    const wsId = targetWorkspaceId || activeWorkspaceId;
    const ws = workspaces[wsId];
    if (!ws) return;

    const nextPrice = Math.max(0, parseFloat(price) || 0);
    const nextItems = ws.items.map((it) =>
      it.id === itemId ? { ...it, unitPrice: nextPrice, price: nextPrice, unitRate: nextPrice } : it
    );

    set((s) => ({
      workspaces: {
        ...s.workspaces,
        [wsId]: { ...ws, items: nextItems, updatedAt: Date.now() },
      },
    }));
  },

  updateItemFormat: (itemId, format, targetWorkspaceId = null) => {
    const { workspaces, activeWorkspaceId } = get();
    const wsId = targetWorkspaceId || activeWorkspaceId;
    const ws = workspaces[wsId];
    if (!ws) return;

    const nextItems = ws.items.map((it) =>
      it.id === itemId ? { ...it, format } : it
    );

    set((s) => ({
      workspaces: {
        ...s.workspaces,
        [wsId]: { ...ws, items: nextItems, updatedAt: Date.now() },
      },
    }));
  },

  updateItemDosage: (itemId, dosage, targetWorkspaceId = null) => {
    const { workspaces, activeWorkspaceId } = get();
    const wsId = targetWorkspaceId || activeWorkspaceId;
    const ws = workspaces[wsId];
    if (!ws) return;

    const nextItems = ws.items.map((it) =>
      it.id === itemId ? { ...it, dosage } : it
    );

    set((s) => ({
      workspaces: {
        ...s.workspaces,
        [wsId]: { ...ws, items: nextItems, updatedAt: Date.now() },
      },
    }));
  },

  updateItemData: (itemId, data, targetWorkspaceId = null) => {
    const { workspaces, activeWorkspaceId } = get();
    const wsId = targetWorkspaceId || activeWorkspaceId;
    const ws = workspaces[wsId];
    if (!ws) return;

    const nextItems = ws.items.map((it) =>
      it.id === itemId ? { ...it, ...data } : it
    );

    set((s) => ({
      workspaces: {
        ...s.workspaces,
        [wsId]: { ...ws, items: nextItems, updatedAt: Date.now() },
      },
    }));
  },

  applyDiscountPercentage: (percent, targetWorkspaceId = null) => {
    const { workspaces, activeWorkspaceId } = get();
    const wsId = targetWorkspaceId || activeWorkspaceId;
    const ws = workspaces[wsId];
    if (!ws || !ws.items.length) return;

    const factor = Math.max(0, (100 - Number(percent)) / 100);
    const nextItems = ws.items.map((it) => {
      const basePrice = it.originalUnitPrice || it.unitPrice;
      return {
        ...it,
        originalUnitPrice: it.originalUnitPrice || it.unitPrice,
        unitPrice: Number((basePrice * factor).toFixed(2)),
      };
    });

    set((s) => ({
      workspaces: {
        ...s.workspaces,
        [wsId]: { ...ws, items: nextItems, discountPercent: percent, updatedAt: Date.now() },
      },
    }));
  },

  multiplyQuantities: (multiplier, targetWorkspaceId = null) => {
    const { workspaces, activeWorkspaceId } = get();
    const wsId = targetWorkspaceId || activeWorkspaceId;
    const ws = workspaces[wsId];
    if (!ws || !ws.items.length) return;

    const mult = Number(multiplier) || 1;
    const nextItems = ws.items.map((it) => ({
      ...it,
      quantity: Math.max(1, Math.round((it.quantity || 1) * mult)),
    }));

    set((s) => ({
      workspaces: {
        ...s.workspaces,
        [wsId]: { ...ws, items: nextItems, updatedAt: Date.now() },
      },
    }));
  },

  addReconstitutionBacteriostaticWater: (targetWorkspaceId = null) => {
    const { workspaces, activeWorkspaceId, addItem } = get();
    const wsId = targetWorkspaceId || activeWorkspaceId;
    const ws = workspaces[wsId];
    if (!ws) return;

    addItem({
      id: 'bac_water_30ml_companion',
      productId: 'bac-water-30ml',
      variantId: 'bac-water-30ml-standard',
      canonicalName: 'Bacteriostatic Water 30ml (USP Grade)',
      dosage: '30ml Vial',
      format: 'Vial',
      quantity: 1,
      unitPrice: 15.00,
      supplierCost: 4.50,
      category: 'Reconstitution & Diluents',
      presentation: '30ml multi-dose vial'
    }, wsId);
  },

  moveItemBetweenWorkspaces: (itemId, fromWsId, toWsId) => {
    const { workspaces, createWorkspace } = get();
    const sourceWs = workspaces[fromWsId];
    if (!sourceWs) return;

    const itemToMove = sourceWs.items.find((it) => it.id === itemId);
    if (!itemToMove) return;

    let targetId = toWsId;
    if (toWsId === 'new') {
      targetId = createWorkspace(`Workspace ${Object.keys(workspaces).length + 1}`);
    }

    const targetWs = get().workspaces[targetId];
    if (!targetWs) return;

    const nextSourceItems = sourceWs.items.filter((it) => it.id !== itemId);
    const nextTargetItems = [
      ...targetWs.items,
      { ...itemToMove, id: `item_${Date.now()}_${Math.random().toString(36).substr(2, 4)}` }
    ];

    set((s) => ({
      workspaces: {
        ...s.workspaces,
        [fromWsId]: { ...sourceWs, items: nextSourceItems, updatedAt: Date.now() },
        [targetId]: { ...targetWs, items: nextTargetItems, updatedAt: Date.now() },
      },
    }));
  },

  copyItemBetweenWorkspaces: (itemId, fromWsId, toWsId) => {
    const { workspaces, createWorkspace } = get();
    const sourceWs = workspaces[fromWsId];
    if (!sourceWs) return;

    const itemToCopy = sourceWs.items.find((it) => it.id === itemId);
    if (!itemToCopy) return;

    let targetId = toWsId;
    if (toWsId === 'new') {
      targetId = createWorkspace(`Workspace ${Object.keys(workspaces).length + 1}`);
    }

    const targetWs = get().workspaces[targetId];
    if (!targetWs) return;

    const nextTargetItems = [
      ...targetWs.items,
      { ...itemToCopy, id: `item_${Date.now()}_${Math.random().toString(36).substr(2, 4)}` }
    ];

    set((s) => ({
      workspaces: {
        ...s.workspaces,
        [targetId]: { ...targetWs, items: nextTargetItems, updatedAt: Date.now() },
      },
    }));
  },

  transferAllItems: (fromWsId, toWsId, mode = 'move') => {
    const { workspaces, createWorkspace } = get();
    const sourceWs = workspaces[fromWsId];
    if (!sourceWs || !sourceWs.items.length) return;

    let targetId = toWsId;
    if (toWsId === 'new') {
      targetId = createWorkspace(`Workspace ${Object.keys(workspaces).length + 1}`);
    }

    const targetWs = get().workspaces[targetId];
    if (!targetWs) return;

    const copiedItems = sourceWs.items.map((it) => ({
      ...it,
      id: `item_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
    }));

    const nextTargetItems = [...targetWs.items, ...copiedItems];

    set((s) => ({
      workspaces: {
        ...s.workspaces,
        ...(mode === 'move'
          ? { [fromWsId]: { ...sourceWs, items: [], updatedAt: Date.now() } }
          : {}),
        [targetId]: { ...targetWs, items: nextTargetItems, updatedAt: Date.now() },
      },
    }));
  },
});

// ─── 3. Operational Intent & Target Entity Slice ──────────────────────────────
const createWorkspaceIntentSlice = (set, get) => ({
  setWorkspaceIntent: (intent, targetWorkspaceId = null) => {
    const wsId = targetWorkspaceId || get().activeWorkspaceId;
    const ws = get().workspaces[wsId];
    if (!ws) return;

    set((s) => ({
      workspaces: {
        ...s.workspaces,
        [wsId]: {
          ...ws,
          intent,
          pricingTier: intent === 'buy' ? 'cost' : ws.pricingTier,
          updatedAt: Date.now(),
        },
      },
    }));
  },

  setOperationType: (operationType, targetWorkspaceId = null) => {
    const wsId = targetWorkspaceId || get().activeWorkspaceId;
    const ws = get().workspaces[wsId];
    if (!ws) return;

    set((s) => ({
      workspaces: {
        ...s.workspaces,
        [wsId]: { ...ws, operationType, updatedAt: Date.now() },
      },
    }));
  },

  setTargetEntity: (targetEntity, targetWorkspaceId = null) => {
    const wsId = targetWorkspaceId || get().activeWorkspaceId;
    const ws = get().workspaces[wsId];
    if (!ws) return;

    const defaultMarkup = targetEntity?.priceMarkupPercent ?? targetEntity?.markupPercent ?? null;
    const defaultTier = targetEntity?.pricingTier || (targetEntity?.type === 'wholeseller' ? 'wholesale' : targetEntity?.type === 'patient' ? 'retail' : ws.pricingTier || 'clinic');

    // Auto-fill shipping address/notes if empty in workspace
    const shippingAddress = ws.shippingAddress || targetEntity?.shippingAddress || targetEntity?.address || '';
    const shippingNotes = ws.shippingNotes || targetEntity?.shippingNotes || targetEntity?.deliveryNotes || '';

    set((s) => ({
      workspaces: {
        ...s.workspaces,
        [wsId]: {
          ...ws,
          targetEntity,
          shippingAddress,
          shippingNotes,
          pricingTier: defaultTier,
          appliedMarkupPercent: defaultMarkup != null ? Number(defaultMarkup) : ws.appliedMarkupPercent,
          updatedAt: Date.now(),
        },
      },
    }));
  },

  loadUserIntoWorkspace: (user, options = {}) => {
    if (!user) return null;
    const {
      workspaces,
      activeWorkspaceId,
      createWorkspace,
      setActiveWorkspace,
      setTargetEntity,
      setDrawerOpen,
      renameWorkspace,
    } = get();

    const role = options.role || user.type || user.role || (user.customerType === 'wholesaler' ? 'wholesaler' : user.customerType || 'wholesaler');
    const openDrawer = options.openDrawer !== false;
    const userName = user.companyName || user.name || user.displayName || user.fullName || 'Client';
    const userId = user.id;

    // 1. Check if an active workspace already has this specific user assigned (distinct workspace per user)
    const existingWsEntry = Object.entries(workspaces).find(([id, ws]) => {
      const t = ws.targetEntity;
      return t && (t.id === userId || (user.email && t.email === user.email));
    });

    let targetWsId = null;

    if (existingWsEntry) {
      targetWsId = existingWsEntry[0];
      setActiveWorkspace(targetWsId);
      if (typeof window !== 'undefined') {
        import('react-hot-toast').then(({ default: toast }) => {
          toast.success(`Workspace activo para ${userName} seleccionado ✓`);
        });
      }
    } else {
      // 2. Check if currently active workspace is an empty draft with no items and no targetEntity
      const currentWs = workspaces[activeWorkspaceId];
      const isCurrentEmpty = currentWs && (!currentWs.items || currentWs.items.length === 0) && !currentWs.targetEntity;

      const targetEntity = {
        type: role === 'wholeseller' ? 'wholesaler' : role,
        id: userId,
        name: userName,
        companyName: user.companyName || user.company || userName,
        email: user.email || user.contactEmail || '',
        phone: user.phone || user.whatsapp || user.phoneNumber || user.contactPhone || '',
        pricingTier: user.pricingTier || user.tier || (role === 'wholesaler' || role === 'wholeseller' ? 'wholesale' : role === 'patient' ? 'retail' : 'clinic'),
        priceMarkupPercent: user.priceMarkupPercent ?? user.markupPercent ?? user.discountMargin ?? null,
        shippingAddress: user.shippingAddress || user.address || user.registeredAddress || '',
        shippingNotes: user.shippingNotes || user.deliveryNotes || '',
        country: user.country || '',
        currency: user.currency || (user.country?.toLowerCase().includes('emirates') ? 'AED' : (user.country?.toLowerCase().includes('spain') ? 'EUR' : 'USD')),
      };

      if (isCurrentEmpty) {
        targetWsId = activeWorkspaceId;
        renameWorkspace(activeWorkspaceId, `WS: ${userName}`);
        setTargetEntity(targetEntity, activeWorkspaceId);
        if (typeof window !== 'undefined') {
          import('react-hot-toast').then(({ default: toast }) => {
            toast.success(`Workspace asignado a ${userName} ✓`);
          });
        }
      } else {
        // Create new workspace (createWorkspace automatically enforces the max 3 workspaces via FIFO eviction into history)
        targetWsId = createWorkspace(`WS: ${userName}`, role === 'supplier' ? 'buy' : 'sell');
        setTargetEntity(targetEntity, targetWsId);
        if (typeof window !== 'undefined') {
          import('react-hot-toast').then(({ default: toast }) => {
            toast.success(`Nuevo Workspace creado para ${userName} (máx 3 activos) ✓`);
          });
        }
      }
    }

    if (openDrawer) {
      setDrawerOpen(true);
    }

    return targetWsId;
  },

  recalculateWorkspacePrices: (targetWorkspaceId = null, options = {}) => {
    const { workspaces, activeWorkspaceId } = get();
    const wsId = targetWorkspaceId || activeWorkspaceId;
    const ws = workspaces[wsId];
    if (!ws || !ws.items?.length) return 0;

    const targetEntity = options.targetEntity !== undefined ? options.targetEntity : ws.targetEntity;
    const customMarkup = options.targetMarkup !== undefined 
      ? options.targetMarkup 
      : (options.appliedMarkupPercent ?? ws.appliedMarkupPercent ?? targetEntity?.priceMarkupPercent ?? targetEntity?.markupPercent ?? null);

    const targetTier = options.targetTier || ws.pricingTier || targetEntity?.pricingTier || (targetEntity?.type === 'wholeseller' ? 'wholesale' : targetEntity?.type === 'patient' ? 'retail' : 'clinic');

    const nextItems = ws.items.map(it => {
      const cost = Number(it.supplierCost || it.pricing?.supplierCost || 0);
      let newUnitPrice = it.unitPrice;

      if (customMarkup != null && !isNaN(customMarkup) && cost > 0) {
        newUnitPrice = Number((cost * (1 + Number(customMarkup) / 100)).toFixed(2));
      } else if (cost > 0) {
        const mult = targetTier === 'wholesale' ? 1.25 : targetTier === 'retail' ? 2.00 : targetTier === 'cost' ? 1.00 : 1.50;
        newUnitPrice = Number((cost * mult).toFixed(2));
      }

      if ((!newUnitPrice || newUnitPrice <= 0) && cost > 0) {
        newUnitPrice = Number((cost * 1.25).toFixed(2));
      }

      const activeEffectiveMarkup = customMarkup != null ? Number(customMarkup) : (targetTier === 'wholesale' ? 25 : targetTier === 'retail' ? 100 : 50);

      return {
        ...it,
        unitPrice: newUnitPrice,
        price: newUnitPrice,
        unitRate: newUnitPrice,
        appliedTier: targetTier,
        appliedMarkup: activeEffectiveMarkup,
      };
    });

    set(s => ({
      workspaces: {
        ...s.workspaces,
        [wsId]: {
          ...ws,
          pricingTier: targetTier,
          appliedMarkupPercent: customMarkup != null ? Number(customMarkup) : ws.appliedMarkupPercent,
          items: nextItems,
          updatedAt: Date.now()
        }
      }
    }));

    return nextItems.length;
  },

  setWorkspaceMarkup: (markup, targetWorkspaceId = null, recalculate = true) => {
    const wsId = targetWorkspaceId || get().activeWorkspaceId;
    const ws = get().workspaces[wsId];
    if (!ws) return;
    const num = markup != null && !isNaN(markup) ? Number(markup) : null;

    set(s => ({
      workspaces: {
        ...s.workspaces,
        [wsId]: {
          ...ws,
          appliedMarkupPercent: num,
          updatedAt: Date.now()
        }
      }
    }));

    if (recalculate && ws.items?.length > 0) {
      get().recalculateWorkspacePrices(wsId, { targetMarkup: num });
    }
  },

  setPricingTier: (tier, targetWorkspaceId = null) => {
    const wsId = targetWorkspaceId || get().activeWorkspaceId;
    const ws = get().workspaces[wsId];
    if (!ws) return;

    set((s) => ({
      workspaces: {
        ...s.workspaces,
        [wsId]: { ...ws, pricingTier: tier, updatedAt: Date.now() },
      },
    }));
  },

  setCurrency: (currency, targetWorkspaceId = null) => {
    const wsId = targetWorkspaceId || get().activeWorkspaceId;
    const ws = get().workspaces[wsId];
    if (!ws) return;

    set((s) => ({
      workspaces: {
        ...s.workspaces,
        [wsId]: { ...ws, currency, updatedAt: Date.now() },
      },
    }));
  },

  setNotes: (notes, targetWorkspaceId = null) => {
    const wsId = targetWorkspaceId || get().activeWorkspaceId;
    const ws = get().workspaces[wsId];
    if (!ws) return;

    set((s) => ({
      workspaces: {
        ...s.workspaces,
        [wsId]: { ...ws, notes, updatedAt: Date.now() },
      },
    }));
  },

  setSelectedTargetType: (selectedTargetType, targetWorkspaceId = null) => {
    const wsId = targetWorkspaceId || get().activeWorkspaceId;
    const ws = get().workspaces[wsId];
    if (!ws) return;

    set((s) => ({
      workspaces: {
        ...s.workspaces,
        [wsId]: { ...ws, selectedTargetType, updatedAt: Date.now() },
      },
    }));
  },

  setShippingDetails: (shippingData, targetWorkspaceId = null) => {
    const wsId = targetWorkspaceId || get().activeWorkspaceId;
    const ws = get().workspaces[wsId];
    if (!ws) return;

    set((s) => ({
      workspaces: {
        ...s.workspaces,
        [wsId]: {
          ...ws,
          shippingMethod: shippingData?.shippingMethod ?? ws.shippingMethod ?? 'cold_chain',
          shippingAddress: shippingData?.shippingAddress ?? ws.shippingAddress ?? '',
          shippingNotes: shippingData?.shippingNotes ?? ws.shippingNotes ?? '',
          selectedShippingOptionId: shippingData?.selectedShippingOptionId !== undefined ? shippingData.selectedShippingOptionId : ws.selectedShippingOptionId,
          selectedWarehouseId: shippingData?.selectedWarehouseId !== undefined ? shippingData.selectedWarehouseId : ws.selectedWarehouseId,
          shippingCostOverride: shippingData?.shippingCostOverride !== undefined ? shippingData.shippingCostOverride : ws.shippingCostOverride,
          updatedAt: Date.now(),
        },
      },
    }));
  },

  setDiscountPercent: (discountPercent, targetWorkspaceId = null) => {
    const wsId = targetWorkspaceId || get().activeWorkspaceId;
    const ws = get().workspaces[wsId];
    if (!ws) return;

    set((s) => ({
      workspaces: {
        ...s.workspaces,
        [wsId]: { ...ws, discountPercent: Number(discountPercent || 0), updatedAt: Date.now() },
      },
    }));
  },
});

// ─── 4. Reusable Staging Kits & Templates Slice ────────────────────────────────
const createWorkspaceKitsSlice = (set, get) => ({
  savedKits: [
    {
      id: 'kit_glp1_starter',
      name: 'GLP-1 Weight Loss Starter Kit',
      intent: 'sell',
      items: [
        { id: 'kit_item_1', productId: 'semaglutide-5mg', canonicalName: 'Semaglutide 5mg Vial', dosage: '5mg', format: 'Vial', quantity: 2, unitPrice: 120.00, supplierCost: 35.00 },
        { id: 'kit_item_2', productId: 'bac-water-30ml', canonicalName: 'Bacteriostatic Water 30ml', dosage: '30ml Vial', format: 'Vial', quantity: 1, unitPrice: 15.00, supplierCost: 4.50 }
      ]
    },
    {
      id: 'kit_longevity_trio',
      name: 'Peptide Longevity & Repair Trio',
      intent: 'sell',
      items: [
        { id: 'kit_item_3', productId: 'bpc-157-10mg', canonicalName: 'BPC-157 10mg Vial', dosage: '10mg', format: 'Vial', quantity: 2, unitPrice: 85.00, supplierCost: 22.00 },
        { id: 'kit_item_4', productId: 'tb-500-10mg', canonicalName: 'TB-500 (Thymosin Beta-4) 10mg', dosage: '10mg', format: 'Vial', quantity: 2, unitPrice: 95.00, supplierCost: 28.00 },
        { id: 'kit_item_5', productId: 'ghrp-2-5mg', canonicalName: 'GHRP-2 5mg Vial', dosage: '5mg', format: 'Vial', quantity: 1, unitPrice: 65.00, supplierCost: 18.00 }
      ]
    }
  ],

  saveWorkspaceAsKit: (kitName, targetWorkspaceId = null) => {
    const { workspaces, activeWorkspaceId, savedKits } = get();
    const wsId = targetWorkspaceId || activeWorkspaceId;
    const ws = workspaces[wsId];
    if (!ws || !ws.items.length) return null;

    const kitId = `kit_${Date.now()}`;
    const newKit = {
      id: kitId,
      name: kitName || `${ws.name} Kit`,
      intent: ws.intent,
      createdAt: Date.now(),
      items: ws.items.map(it => ({ ...it })),
    };

    const updatedKits = [...(savedKits || []), newKit];
    set({ savedKits: updatedKits });
    return newKit;
  },

  loadKitIntoWorkspace: (kitId, targetWorkspaceId = null) => {
    const { workspaces, activeWorkspaceId, savedKits, addItems } = get();
    const wsId = targetWorkspaceId || activeWorkspaceId;
    const kit = (savedKits || []).find(k => k.id === kitId);
    if (!kit) return;

    addItems(kit.items.map(it => ({
      ...it,
      id: `item_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`
    })), wsId);
  },

  deleteSavedKit: (kitId) => {
    const { savedKits } = get();
    const updatedKits = (savedKits || []).filter(k => k.id !== kitId);
    set({ savedKits: updatedKits });
  },
});

// ─── 5. Computed Getters Slice ──────────────────────────────────────────────────
const createWorkspaceGettersSlice = (set, get) => ({
  getActiveWorkspace: () => {
    const { workspaces, activeWorkspaceId } = get();
    return workspaces[activeWorkspaceId] || Object.values(workspaces)[0] || DEFAULT_WORKSPACE;
  },

  getTotalItemCount: () => {
    const { workspaces } = get();
    return Object.values(workspaces).reduce((total, ws) => {
      return total + (ws.items || []).reduce((sum, it) => sum + (it.quantity || 1), 0);
    }, 0);
  },

  getActiveItemCount: () => {
    const ws = get().getActiveWorkspace();
    return (ws.items || []).reduce((sum, it) => sum + (it.quantity || 1), 0);
  },
});

// ─── Unified Modular Zustand Store ─────────────────────────────────────────────
export const useWorkspaceStore = create(
  persist(
    (set, get) => ({
      ...createWorkspaceLifecycleSlice(set, get),
      ...createWorkspaceItemsSlice(set, get),
      ...createWorkspaceIntentSlice(set, get),
      ...createWorkspaceKitsSlice(set, get),
      ...createWorkspaceGettersSlice(set, get),
    }),
    {
      name: 'atlas-multi-workspace-storage',
      version: 1,
    }
  )
);

// ─── Export useShallow for High-Efficiency Component Rendering ──────────────────
export { useShallow };

// ─── Specialized Atomic Selector Hooks ─────────────────────────────────────────
export function useActiveWorkspaceItems() {
  return useWorkspaceStore(
    useShallow((state) => {
      const activeWs = state.workspaces[state.activeWorkspaceId] || Object.values(state.workspaces)[0];
      return activeWs?.items || [];
    })
  );
}

export function useWorkspaceKitsList() {
  return useWorkspaceStore(useShallow((state) => state.savedKits || []));
}
