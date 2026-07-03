import { create } from 'zustand';

export const usePrescriptionsUIStore = create((set) => ({
  // View Management
  activeView: 'table', // 'table', 'pipeline'
  setActiveView: (view) => set({ activeView: view }),

  // Modals
  isSourceSelectorModalOpen: false,
  setSourceSelectorModalOpen: (isOpen) => set({ isSourceSelectorModalOpen: isOpen }),

  // Filters
  searchTerm: '',
  setSearchTerm: (term) => set({ searchTerm: term }),
  filterStatus: 'All',
  setFilterStatus: (status) => set({ filterStatus: status }),
}));
