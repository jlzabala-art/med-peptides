/**
 * adminProductsUIStore.js
 * 
 * Zustand store for Admin Products table UI states, modal visibility, and bulk operations.
 * Enhanced with pure derived selectors and useShallow hooks.
 */
import { create } from 'zustand';
import { useShallow } from 'zustand/react/shallow';

export const useAdminProductsUIStore = create((set) => ({
  isCreateProductModalOpen: false,
  setIsCreateProductModalOpen: (val) => set({ isCreateProductModalOpen: val }),

  catalogSelectMode: false,
  setCatalogSelectMode: (val) => set({ catalogSelectMode: val }),

  myCatalogs: [],
  setMyCatalogs: (val) => set({ myCatalogs: val }),

  loadingCatalogs: false,
  setLoadingCatalogs: (val) => set({ loadingCatalogs: val }),

  bulkMode: null,
  setBulkMode: (val) => set({ bulkMode: val }),

  bulkValue: '',
  setBulkValue: (val) => set({ bulkValue: val }),

  bulkCategory: 'All',
  setBulkCategory: (val) => set({ bulkCategory: val }),

  migrating: false,
  setMigrating: (val) => set({ migrating: val }),

  isBulkOrderModalOpen: false,
  setIsBulkOrderModalOpen: (val) => set({ isBulkOrderModalOpen: val }),

  productsToBulkOrder: [],
  setProductsToBulkOrder: (val) => set({ productsToBulkOrder: val }),

  inventoryMode: false,
  setInventoryMode: (val) => set({ inventoryMode: val }),
}));

// ─── Granular Selector Hooks (useShallow) ──────────────────────────────────
export const useAdminProductsBulkState = () =>
  useAdminProductsUIStore(
    useShallow((s) => ({
      bulkMode: s.bulkMode,
      bulkValue: s.bulkValue,
      bulkCategory: s.bulkCategory,
      productsToBulkOrder: s.productsToBulkOrder,
      isBulkOrderModalOpen: s.isBulkOrderModalOpen,
    }))
  );

export const useAdminProductsModalState = () =>
  useAdminProductsUIStore(
    useShallow((s) => ({
      isCreateProductModalOpen: s.isCreateProductModalOpen,
      inventoryMode: s.inventoryMode,
      catalogSelectMode: s.catalogSelectMode,
    }))
  );
