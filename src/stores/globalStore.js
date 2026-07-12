import { create } from 'zustand';
import { collection, getDocs, query, limit } from 'firebase/firestore';
import * as fb from '../firebase';
const db = fb?.db;

export const useGlobalStore = create((set, get) => ({
  products: [],
  protocols: [],
  isProductsLoaded: false,
  isProtocolsLoaded: false,
  isLoading: false,

  fetchProducts: async () => {
    if (get().isProductsLoaded) return;
    set({ isLoading: true });
    try {
      // SECURITY: Add limit to prevent unbounded memory usage on massive catalogs.
      // If full dataset is needed, use a paginated DataTable component.
      const q = query(collection(db, 'products'), limit(250));
      const snap = await getDocs(q);
      const data = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      set({ products: data, isProductsLoaded: true });
    } catch (error) {
      console.error("Error fetching products:", error);
    } finally {
      set({ isLoading: false });
    }
  },

  fetchProtocols: async () => {
    if (get().isProtocolsLoaded) return;
    set({ isLoading: true });
    try {
      // SECURITY: Add limit to prevent unbounded memory usage on massive catalogs.
      const q = query(collection(db, 'protocols'), limit(150));
      const snap = await getDocs(q);
      const data = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      set({ protocols: data, isProtocolsLoaded: true });
    } catch (error) {
      console.error("Error fetching protocols:", error);
    } finally {
      set({ isLoading: false });
    }
  },

  // Helper method to fetch everything needed for the Hub initially
  initializeGlobalData: async () => {
    await Promise.all([
      get().fetchProducts(),
      get().fetchProtocols()
    ]);
  }
}));
