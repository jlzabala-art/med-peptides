import { create } from 'zustand';

export const useQuotationsUIStore = create((set) => ({
  // View Management
  activeView: 'list', // 'list', 'kanban'
  setActiveView: (view) => set({ activeView: view }),

  // Modal / Drawer State
  isBuilderWizardOpen: false,
  openBuilderWizard: (sourceData = null) => set({ isBuilderWizardOpen: true, builderSource: sourceData }),
  closeBuilderWizard: () => set({ isBuilderWizardOpen: false, builderSource: null }),
  builderSource: null, // { type: 'prescription'|'protocol'|'items', id: string, data: object }

  activeQuotation: null,
  openQuotationDrawer: (quotation) => set({ activeQuotation: quotation }),
  closeQuotationDrawer: () => set({ activeQuotation: null }),

  // Search and Filters
  searchQuery: '',
  setSearchQuery: (query) => set({ searchQuery: query }),
  
  filters: {
    status: 'all',
    clinic: 'all',
    doctor: 'all'
  },
  setFilter: (key, value) => set((state) => ({ filters: { ...state.filters, [key]: value } })),
  resetFilters: () => set({ filters: { status: 'all', clinic: 'all', doctor: 'all' } }),

  // AI Assistant (Floating)
  isAIAssistantOpen: false,
  toggleAIAssistant: () => set((state) => ({ isAIAssistantOpen: !state.isAIAssistantOpen })),
  
  // Selection (for bulk actions)
  selectedQuotationIds: [],
  toggleSelection: (id) => set((state) => ({
    selectedQuotationIds: state.selectedQuotationIds.includes(id)
      ? state.selectedQuotationIds.filter((x) => x !== id)
      : [...state.selectedQuotationIds, id]
  })),
  clearSelection: () => set({ selectedQuotationIds: [] }),
  selectAll: (ids) => set({ selectedQuotationIds: ids }),
}));
