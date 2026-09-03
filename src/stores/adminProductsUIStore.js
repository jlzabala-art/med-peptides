import { create } from 'zustand';

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
