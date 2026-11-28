import { create } from 'zustand';

export const useUIStore = create((set) => ({
  // Modals
  activeModal: null,
  setActiveModal: (modalName) => set({ activeModal: modalName }),

  // Polymorphic Drawer Stack (consolidated from legacy DrawerContext)
  drawers: [],
  openDrawer: (type, id, data = null) =>
    set((state) => {
      if (state.drawers.some((d) => d.type === type && d.resourceId === id)) {
        return state;
      }
      const drawerId = `${type}_${id}_${Date.now()}_${Math.floor(Math.random() * 10000)}`;
      return {
        drawers: [...state.drawers, { id: drawerId, type, resourceId: id, data }],
      };
    }),
  closeDrawer: (drawerId) =>
    set((state) => ({
      drawers: state.drawers.filter((d) => d.id !== drawerId),
    })),
  closeAllDrawers: () => set({ drawers: [] }),

  // Search
  searchQuery: '',
  setSearchQuery: (query) => set({ searchQuery: query }),
  searchInitialTab: 'peptides',
  setSearchInitialTab: (tab) => set({ searchInitialTab: tab }),

  // Region UI Flags
  manualRegionChange: false,
  setManualRegionChange: (value) => set({ manualRegionChange: value }),

  // Scroll Management
  scrolled: false,
  setScrolled: (value) => set({ scrolled: value }),

  // Checkout Overlay (Global)
  showCheckout: false,
  setShowCheckout: (value) => set({ showCheckout: value }),
}));
