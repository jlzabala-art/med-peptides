import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { runClinicalRules } from '../engine/clinicalRulesEngine';

export const useOrderBuilderStore = create(
  persist(
    (set, get) => ({
      // ─── Cart State ───────────────────────────────────────────────────────
      carts: {},
      activeTargetId: null,
      pendingItem: null,

      // ─── Clinical Rules Engine results ────────────────────────────────────
      // Shape: { errors: [], warnings: [], info: [], all: [] }
      clinicalAlerts: { errors: [], warnings: [], info: [], all: [] },

      // ─── Patient Context (for context-aware rules) ───────────────────────
      // e.g. { hasDiabetes, hasAutoimmuneDisease, hasActiveCancer, ... }
      patientContext: {},

      // ─── Patient History (prefetch cache) ────────────────────────────────
      // { [patientId]: { prescriptions: [], loading: false, lastFetched: timestamp } }
      patientHistoryCache: {},

      // ─── Actions ──────────────────────────────────────────────────────────
      setActiveTargetId: (id) => set({ activeTargetId: id }),
      setPendingItem: (item) => set({ pendingItem: item }),
      setPatientContext: (ctx) => set({ patientContext: ctx }),

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

        // Auto-add pending item
        const state = get();
        if (state.pendingItem) {
          setTimeout(() => {
            get().addItem(state.pendingItem);
            set({ pendingItem: null });
          }, 0);
        }

        // Background prefetch patient prescription history
        get().prefetchPatientHistory(target.id);
      },

      // ─── Draft Items ──────────────────────────────────────────────────────
      setDraftItems: (updater) => {
        const { activeTargetId, carts } = get();
        if (!activeTargetId) return;

        const activeCart = carts[activeTargetId];
        if (!activeCart) return;

        const nextItems =
          typeof updater === 'function' ? updater(activeCart.draftItems) : updater;

        // Run the full clinical rules engine on every cart change
        const { patientContext } = get();
        const clinicalAlerts = runClinicalRules(nextItems, patientContext);

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

      // ─── Patient History Prefetch ─────────────────────────────────────────
      prefetchPatientHistory: async (patientId) => {
        if (!patientId) return;

        const { patientHistoryCache } = get();
        const cached = patientHistoryCache[patientId];
        const TTL_MS = 10 * 60 * 1000; // 10 minutes

        // Skip if recently fetched
        if (cached && !cached.loading && Date.now() - cached.lastFetched < TTL_MS) return;

        // Mark as loading
        set((state) => ({
          patientHistoryCache: {
            ...state.patientHistoryCache,
            [patientId]: { prescriptions: cached?.prescriptions || [], loading: true, lastFetched: 0 },
          },
        }));

        try {
          // Dynamic import to avoid circular deps
          const { collection, query, where, orderBy, limit, getDocs } = await import('firebase/firestore');
          const { db } = await import('../firebase');

          const q = query(
            collection(db, 'prescriptions'),
            where('patientId', '==', patientId),
            orderBy('createdAt', 'desc'),
            limit(5)
          );
          const snap = await getDocs(q);
          const prescriptions = snap.docs.map((d) => ({ id: d.id, ...d.data() }));

          set((state) => ({
            patientHistoryCache: {
              ...state.patientHistoryCache,
              [patientId]: { prescriptions, loading: false, lastFetched: Date.now() },
            },
          }));
        } catch (err) {
          console.warn('[orderBuilderStore] Failed to prefetch patient history:', err);
          set((state) => ({
            patientHistoryCache: {
              ...state.patientHistoryCache,
              [patientId]: { prescriptions: [], loading: false, lastFetched: Date.now() },
            },
          }));
        }
      },
    }),
    {
      name: 'regenpept_order_carts_v2',
      // Only persist cart data — not transient cache or clinical alerts
      partialize: (state) => ({
        carts: state.carts,
        activeTargetId: state.activeTargetId,
        patientContext: state.patientContext,
      }),
    }
  )
);
