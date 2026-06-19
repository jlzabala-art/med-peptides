import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export const useCatalogBuilderStore = create(
  persist(
    (set, get) => ({
      selectedProducts: [], // array of IDs (variants or products)
      cartProductsData: [], // full objects
      catalogMeta: {
        title: '',
        description: '',
        territory: '',
        language: 'English',
        goals: [],
        categories: [],
        date: new Date().toISOString().split('T')[0],
        targetAudience: 'patients'
      },
      publishOptions: {
        format: 'landing_page', // pdf, excel, landing_page
        pdfTemplate: 'standard', // minimal, standard, clinical
        showPrices: true,
        priceLevel: 'MSRP', // MSRP, wholesale, custom
        includeContactData: true
      },
      isDraftActive: false,

      // Initialize or start/update a draft
      startDraft: (products = [], productsData = [], meta = null) => {
        set((state) => ({
          selectedProducts: products,
          cartProductsData: productsData,
          catalogMeta: meta || state.catalogMeta,
          isDraftActive: true
        }));
      },

      // Update draft properties (e.g. metadata, options)
      updateDraft: (updates) => {
        set((state) => ({
          ...state,
          ...updates
        }));
      },

      // Update catalogMeta specifically
      updateMeta: (metaUpdates) => {
        set((state) => ({
          catalogMeta: {
            ...state.catalogMeta,
            ...metaUpdates
          },
          isDraftActive: true
        }));
      },

      // Add products to the active draft (accumulating them)
      addProducts: (newIds, newProductsData = []) => {
        const currentIds = get().selectedProducts;
        const currentData = get().cartProductsData;

        // Merge IDs, avoiding duplicates
        const updatedIds = Array.from(new Set([...currentIds, ...newIds]));

        // Merge full product objects, avoiding duplicates by id
        const dataMap = new Map();
        currentData.forEach(p => dataMap.set(p.id, p));
        newProductsData.forEach(p => dataMap.set(p.id, p));
        const updatedData = Array.from(dataMap.values());

        set({
          selectedProducts: updatedIds,
          cartProductsData: updatedData,
          isDraftActive: true
        });
      },

      // Remove a specific product from draft
      removeProduct: (productId) => {
        set((state) => ({
          selectedProducts: state.selectedProducts.filter(id => id !== productId),
          cartProductsData: state.cartProductsData.filter(p => p.id !== productId && p.productId !== productId)
        }));
      },

      // Clear the draft completely (after publish or cancel)
      clearDraft: () => {
        set({
          selectedProducts: [],
          cartProductsData: [],
          catalogMeta: {
            title: '',
            description: '',
            territory: '',
            language: 'English',
            goals: [],
            categories: [],
            date: new Date().toISOString().split('T')[0],
            targetAudience: 'patients'
          },
          publishOptions: {
            format: 'landing_page',
            pdfTemplate: 'standard',
            showPrices: true,
            priceLevel: 'MSRP',
            includeContactData: true
          },
          isDraftActive: false
        });
      }
    }),
    {
      name: 'catalog-builder-draft-storage',
      storage: createJSONStorage(() => sessionStorage),
    }
  )
);
