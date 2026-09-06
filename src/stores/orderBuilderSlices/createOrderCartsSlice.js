/**
 * createOrderCartsSlice.js
 * 
 * Atomic slice for cart management, draft items, and imported sources.
 */

export const createOrderCartsSlice = (set, get) => ({
  carts: {},
  activeTargetId: null,
  pendingItem: null,

  setActiveTargetId: (id) => set({ activeTargetId: id }),
  setPendingItem: (item) => set({ pendingItem: item }),

  setSelectedTarget: (target) => {
    if (!target) {
      set({ activeTargetId: null });
      return;
    }

    set((state) => {
      if (state.carts[target.id]) {
        return { activeTargetId: target.id };
      }
      return {
        carts: {
          ...state.carts,
          [target.id]: { target, draftItems: [], importedSources: [], lastModified: Date.now() },
        },
        activeTargetId: target.id,
      };
    });

    // Auto-add pending item if present
    const state = get();
    if (state.pendingItem) {
      setTimeout(() => {
        get().addItem(state.pendingItem);
        set({ pendingItem: null });
      }, 0);
    }

    // Background prefetch patient prescription history
    get().prefetchPatientHistory?.(target.id);
  },

  setDraftItems: (updater) => {
    const { activeTargetId, carts } = get();
    if (!activeTargetId) return;

    const activeCart = carts[activeTargetId];
    if (!activeCart) return;

    const nextItems =
      typeof updater === 'function' ? updater(activeCart.draftItems) : updater;

    // Run clinical rules if available
    const patientContext = get().patientContext || {};
    const clinicalAlerts = get().runRulesEngine?.(nextItems, patientContext) || {
      errors: [],
      warnings: [],
      info: [],
      all: [],
    };

    set((state) => ({
      carts: {
        ...state.carts,
        [activeTargetId]: { ...activeCart, draftItems: nextItems, lastModified: Date.now() },
      },
      clinicalAlerts,
    }));
  },

  setImportedSources: (updater) => {
    const { activeTargetId, carts } = get();
    if (!activeTargetId) return;

    const activeCart = carts[activeTargetId];
    if (!activeCart) return;

    const nextSources =
      typeof updater === 'function' ? updater(activeCart.importedSources) : updater;

    set((state) => ({
      carts: {
        ...state.carts,
        [activeTargetId]: { ...activeCart, importedSources: nextSources },
      },
    }));
  },

  addItem: (item) => {
    const { activeTargetId } = get();
    if (!activeTargetId) {
      set({ pendingItem: item });
      return;
    }

    get().setDraftItems((prev) => {
      const existingIndex = prev.findIndex((i) => {
        if (i.productId && item.productId) {
          return i.productId === item.productId && i.variantId === item.variantId && i.sourceId === item.sourceId;
        }
        return i.id === item.id && i.sourceId === item.sourceId;
      });
      if (existingIndex >= 0) {
        const copy = [...prev];
        copy[existingIndex] = {
          ...copy[existingIndex],
          quantity: copy[existingIndex].quantity + (item.quantity || 1),
        };
        return copy;
      }
      return [...prev, { ...item, quantity: item.quantity || 1 }];
    });
  },

  updateItemQuantity: (id, sourceId, quantity) => {
    get().setDraftItems((prev) =>
      prev.map((item) => {
        if (item.id === id && item.sourceId === sourceId) {
          return { ...item, quantity: Math.max(1, quantity) };
        }
        return item;
      })
    );
  },

  removeItem: (id, sourceId) => {
    get().setDraftItems((prev) =>
      prev.filter((item) => !(item.id === id && item.sourceId === sourceId))
    );
  },

  importSource: (sourceType, sourceId, sourceData, items) => {
    const { carts, activeTargetId } = get();
    if (!activeTargetId) return;
    const activeCart = carts[activeTargetId];
    if (activeCart?.importedSources?.find((s) => s.id === sourceId)) return;

    get().setImportedSources((prev) => [
      ...prev,
      { type: sourceType, id: sourceId, data: sourceData },
    ]);

    items.forEach((item) => {
      get().addItem({ ...item, sourceId, sourceType });
    });
  },

  removeSource: (sourceId) => {
    get().setImportedSources((prev) => prev.filter((s) => s.id !== sourceId));
    get().setDraftItems((prev) => prev.filter((item) => item.sourceId !== sourceId));
  },

  clear: () => {
    const { activeTargetId } = get();
    if (!activeTargetId) return;

    set((state) => {
      const copy = { ...state.carts };
      delete copy[activeTargetId];
      return {
        carts: copy,
        activeTargetId: null,
        clinicalAlerts: { errors: [], warnings: [], info: [], all: [] },
      };
    });
  },
});
