import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { collection, getDocs, query, limit, orderBy } from 'firebase/firestore';
import { db } from '../firebase';

export const usePrescriptionStore = create(
  persist(
    (set, get) => ({
      prescriptions: [],
      loading: false,
      lastFetched: null,
      error: null,

      fetchPrescriptions: async (forceRefresh = false) => {
        const now = Date.now();
        const state = get();
        // Cache TTL of 10 minutes
        if (!forceRefresh && state.lastFetched && (now - state.lastFetched < 10 * 60 * 1000)) {
          return;
        }

        set({ loading: true, error: null });
        try {
          const q = query(
            collection(db, 'prescriptions'), 
            orderBy('createdAt', 'desc'), 
            limit(300)
          );
          
          const snap = await getDocs(q);
          const data = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));

          set({
            prescriptions: data,
            loading: false,
            lastFetched: now,
          });
        } catch (error) {
          console.error('Failed to fetch prescriptions:', error);
          set({ error: error.message, loading: false });
        }
      },

      invalidateCache: () => {
        set({ lastFetched: null, prescriptions: [] });
      }
    }),
    {
      name: 'prescription-storage', // unique name for localStorage key
    }
  )
);
