import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export const useCatalogSelectionStore = create(
  persist(
    (set) => ({
      selectedIds: [],
      setSelectedIds: (ids) => set({ selectedIds: ids }),
      clearSelection: () => set({ selectedIds: [] }),
    }),
    {
      name: 'catalog-selection-storage',
      storage: createJSONStorage(() => sessionStorage),
    }
  )
);
