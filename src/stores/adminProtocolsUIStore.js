import { create } from 'zustand';

export const useAdminProtocolsUIStore = create((set) => ({
  // View Management
  activeView: 'table', // 'table', 'cards', 'kanban'
  setActiveView: (view) => set({ activeView: view }),

  // Selection
  selectedProtocolIds: [],
  setSelectedProtocolIds: (ids) => set({ selectedProtocolIds: ids }),
  clearSelection: () => set({ selectedProtocolIds: [] }),

  // Filters
  searchTerm: '',
  setSearchTerm: (term) => set({ searchTerm: term }),
  filterStatus: 'All',
  setFilterStatus: (status) => set({ filterStatus: status }),
  filterCategory: 'All',
  setFilterCategory: (category) => set({ filterCategory: category }),

  // Drawer / Modals
  isProtocolDrawerOpen: false,
  selectedProtocolId: null,
  openProtocolDrawer: (id) => set({ isProtocolDrawerOpen: true, selectedProtocolId: id }),
  closeProtocolDrawer: () => set({ isProtocolDrawerOpen: false, selectedProtocolId: null }),
}));
