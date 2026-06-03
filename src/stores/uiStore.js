import { create } from 'zustand';

export const useUIStore = create((set) => ({
  // Modals
  activeModal: null,
  setActiveModal: (modalName) => set({ activeModal: modalName }),
  
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
