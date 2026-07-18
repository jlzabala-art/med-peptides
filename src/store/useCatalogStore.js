import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { collection, getDocs, query, limit } from 'firebase/firestore';
import { db } from '../firebase';

export const useCatalogStore = create(
  persist(
    (set, get) => ({
      products: [],
      protocols: [],
      loading: false,
      lastFetched: null,
      error: null,

      fetchCatalog: async (forceRefresh = false) => {
        const now = Date.now();
        const state = get();
        // Cache TTL of 10 minutes
        if (!forceRefresh && state.lastFetched && (now - state.lastFetched < 10 * 60 * 1000)) {
          return;
        }

        set({ loading: true, error: null });
        try {
          // Golden Rule #1: limit results so we don't freeze the client
          const productsSnap = await getDocs(query(collection(db, 'products'), limit(300)));
          const productsData = productsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));

          const protocolsSnap = await getDocs(query(collection(db, 'protocols'), limit(300)));
          const protocolsData = protocolsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));

          set({
            products: productsData,
            protocols: protocolsData,
            loading: false,
            lastFetched: now,
          });
        } catch (error) {
          console.error('Failed to fetch catalog:', error);
          set({ error: error.message, loading: false });
        }
      },

      invalidateCache: () => {
        set({ lastFetched: null, products: [], protocols: [] });
      }
    }),
    {
      name: 'catalog-storage', // unique name for localStorage key
    }
  )
);
