import { create } from 'zustand';

export const useAppUIStore = create((set) => ({
  // Sidebar State
  isSidebarOpen: true,
  toggleSidebar: () => set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),
  setSidebarOpen: (isOpen) => set({ isSidebarOpen: isOpen }),

  // Modal States
  isCreateProductModalOpen: false,
  setCreateProductModalOpen: (isOpen) => set({ isCreateProductModalOpen: isOpen }),

  isBulkUpdateModalOpen: false,
  setBulkUpdateModalOpen: (isOpen) => set({ isBulkUpdateModalOpen: isOpen }),

  // Global Search
  globalSearchQuery: '',
  setGlobalSearchQuery: (query) => set({ globalSearchQuery: query }),

  // Reset all UI state (useful on logout)
  resetUIState: () => set({
    isSidebarOpen: true,
    isCreateProductModalOpen: false,
    isBulkUpdateModalOpen: false,
    globalSearchQuery: '',
  }),
}));
