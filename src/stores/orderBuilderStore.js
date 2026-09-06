/**
 * orderBuilderStore.js
 * 
 * Zustand store for managing carts, clinical rules engine checks, and draft orders.
 * Modularized into atomic slice functions with storage hygiene and useShallow exports.
 */
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { useShallow } from 'zustand/react/shallow';

import { createOrderCartsSlice } from './orderBuilderSlices/createOrderCartsSlice';
import { createOrderClinicalSlice } from './orderBuilderSlices/createOrderClinicalSlice';
import { createOrderPrefetchSlice } from './orderBuilderSlices/createOrderPrefetchSlice';

export const useOrderBuilderStore = create(
  persist(
    (...a) => ({
      ...createOrderCartsSlice(...a),
      ...createOrderClinicalSlice(...a),
      ...createOrderPrefetchSlice(...a),
    }),
    {
      name: 'regenpept_order_carts_v2',
      version: 1,
      migrate: (persistedState) => persistedState || {},
      // 🔒 Storage Hygiene: Persist ONLY core cart and patient context state
      partialize: (state) => ({
        carts: state.carts,
        activeTargetId: state.activeTargetId,
        patientContext: state.patientContext,
      }),
    }
  )
);

// ─── Granular Selector Hooks (useShallow) ──────────────────────────────────
export const useActiveOrderCart = () =>
  useOrderBuilderStore(
    useShallow((s) => {
      const activeId = s.activeTargetId;
      return activeId ? s.carts[activeId] || null : null;
    })
  );

export const useOrderClinicalAlerts = () =>
  useOrderBuilderStore(useShallow((s) => s.clinicalAlerts));

export const useOrderCartItems = () =>
  useOrderBuilderStore(
    useShallow((s) => {
      const activeId = s.activeTargetId;
      return activeId && s.carts[activeId] ? s.carts[activeId].draftItems || [] : [];
    })
  );
