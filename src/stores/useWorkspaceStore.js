import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { useShallow } from 'zustand/react/shallow';

function generateWorkspaceId() {
  return `ws_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
}

const DEFAULT_WORKSPACE = {
  id: 'ws_default',
  name: 'Workspace 1',
  createdAt: Date.now(),
  updatedAt: Date.now(),
  items: [],
  operationType: 'unassigned', // 'sell_quotation' | 'sell_prescription' | 'sell_order' | 'buy_po' | 'buy_rfq' | 'unassigned'
  intent: 'sell', // 'sell' | 'buy'
  targetEntity: null, // { type: 'clinic'|'patient'|'doctor'|'wholesaler'|'supplier', id, name, email, phone }
  pricingTier: 'clinic', // 'cost' | 'wholesale' | 'clinic' | 'retail'
  currency: 'USD',
  notes: '',
};

// ─── 1. Workspace Lifecycle Slice ─────────────────────────────────────────────
const createWorkspaceLifecycleSlice = (set, get) => ({
  workspaces: {
    ws_default: { ...DEFAULT_WORKSPACE },
  },
  activeWorkspaceId: 'ws_default',
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
    const id = generateWorkspaceId();
    const count = Object.keys(get().workspaces).length + 1;
    const wsName = name || `Workspace ${count}`;

    const newWs = {
      id,
      name: wsName,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      items: [],
      operationType: 'unassigned',
      intent: initialIntent,
      targetEntity: null,
      pricingTier: initialIntent === 'buy' ? 'cost' : 'clinic',
      currency: 'USD',
      notes: '',
    };

    set((s) => ({
      workspaces: { ...s.workspaces, [id]: newWs },
      activeWorkspaceId: id,
    }));

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
    const { workspaces } = get();
    const source = workspaces[id];
    if (!source) return null;

    const newId = generateWorkspaceId();
    const dup = {
      ...source,
      id: newId,
      name: `${source.name} (Copia)`,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      items: source.items.map((it) => ({ ...it })),
    };

    set((s) => ({
      workspaces: { ...s.workspaces, [newId]: dup },
      activeWorkspaceId: newId,
    }));

    return newId;
  },

  deleteWorkspace: (id) => {
    const { workspaces, activeWorkspaceId } = get();
    const keys = Object.keys(workspaces);

    if (keys.length <= 1) {
      const defaultWs = { ...DEFAULT_WORKSPACE, id: 'ws_default', createdAt: Date.now() };
      set({
        workspaces: { ws_default: defaultWs },
        activeWorkspaceId: 'ws_default',
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
    });
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
          operationType: 'unassigned',
          updatedAt: Date.now(),
        },
      },
    }));
  },
});

// ─── 2. Items & Batch Modifiers Slice ──────────────────────────────────────────
const createWorkspaceItemsSlice = (set, get) => ({
  addItem: (item, targetWorkspaceId = null) => {
    const { workspaces, activeWorkspaceId } = get();
    const wsId = targetWorkspaceId || activeWorkspaceId;
    const ws = workspaces[wsId] || Object.values(workspaces)[0];
    if (!ws) return;

    const canonicalId = item.id || item.variantId || item.productId || `item_${Date.now()}`;
    const existingIndex = ws.items.findIndex(
      (it) => (it.id && it.id === canonicalId) || (it.variantId && it.variantId === item.variantId)
    );

    let nextItems = [...ws.items];
    if (existingIndex >= 0) {
      const existing = nextItems[existingIndex];
      nextItems[existingIndex] = {
        ...existing,
        quantity: (existing.quantity || 1) + (item.quantity || 1),
      };
    } else {
      nextItems.push({
        id: canonicalId,
        productId: item.productId || item.id,
        variantId: item.variantId || item.id,
        canonicalName: item.canonicalName || item.displayName || item.name || 'Custom Compound',
        sku: item.sku || '',
        dosage: item.dosage || item.unit || '',
        format: item.format || item.dosage_form || 'Vial',
        quantity: item.quantity || 1,
        unitPrice: Number(item.unitPrice || item.price || item.unitRate || 0),
        supplierCost: Number(item.supplierCost || item.costPrice || item.pricing?.supplierCost || 0),
        supplierId: item.supplierId || item.supplier || '',
        supplierName: item.supplierName || '',
        category: item.category || '',
        presentation: item.presentation || '',
        targetTier: ws.pricingTier || 'clinic',
      });
    }

    set((s) => ({
      isDrawerOpen: true,
      workspaces: {
        ...s.workspaces,
        [ws.id]: { ...ws, items: nextItems, updatedAt: Date.now() },
      },
    }));
  },

  addItems: (itemsToAdd, targetWorkspaceId = null) => {
    const { workspaces, activeWorkspaceId } = get();
    const wsId = targetWorkspaceId || activeWorkspaceId;
    const ws = workspaces[wsId] || Object.values(workspaces)[0];
    if (!ws || !Array.isArray(itemsToAdd) || itemsToAdd.length === 0) return;

    let nextItems = [...ws.items];
    itemsToAdd.forEach((item) => {
      const canonicalId = item.id || item.variantId || item.productId || `item_${Date.now()}_${Math.random()}`;
      const existingIndex = nextItems.findIndex(
        (it) => (it.id && it.id === canonicalId) || (it.variantId && it.variantId === item.variantId)
      );

      if (existingIndex >= 0) {
        nextItems[existingIndex] = {
          ...nextItems[existingIndex],
          quantity: (nextItems[existingIndex].quantity || 1) + (item.quantity || 1),
        };
      } else {
        nextItems.push({
          id: canonicalId,
          productId: item.productId || item.id,
          variantId: item.variantId || item.id,
          canonicalName: item.canonicalName || item.displayName || item.name || 'Custom Compound',
          sku: item.sku || '',
          dosage: item.dosage || item.unit || '',
          format: item.format || item.dosage_form || 'Vial',
          quantity: item.quantity || 1,
          unitPrice: Number(item.unitPrice || item.price || item.unitRate || 0),
          supplierCost: Number(item.supplierCost || item.costPrice || item.pricing?.supplierCost || 0),
          supplierId: item.supplierId || item.supplier || '',
          supplierName: item.supplierName || '',
          category: item.category || '',
          presentation: item.presentation || '',
          targetTier: ws.pricingTier || 'clinic',
        });
      }
    });

    set((s) => ({
      isDrawerOpen: true,
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
      it.id === itemId ? { ...it, unitPrice: nextPrice } : it
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

    set((s) => ({
      workspaces: {
        ...s.workspaces,
        [wsId]: { ...ws, targetEntity, updatedAt: Date.now() },
      },
    }));
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
