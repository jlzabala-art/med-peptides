import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { collection, getDocs, query, limit, orderBy, doc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';

export const useLeadStore = create(
  persist(
    (set, get) => ({
      leads: [],
      loading: false,
      lastFetched: null,
      error: null,

      fetchLeads: async (forceRefresh = false) => {
        const now = Date.now();
        const state = get();
        // Cache TTL of 10 minutes
        if (!forceRefresh && state.lastFetched && (now - state.lastFetched < 10 * 60 * 1000)) {
          return;
        }

        set({ loading: true, error: null });
        try {
          const q = query(
            collection(db, 'leads'), 
            orderBy('createdAt', 'desc'), 
            limit(300)
          );
          
          const snap = await getDocs(q);
          const data = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));

          set({
            leads: data,
            loading: false,
            lastFetched: now,
          });
        } catch (error) {
          console.error('Failed to fetch leads:', error);
          set({ error: error.message, loading: false });
        }
      },

      updateLead: async (id, updates) => {
        const previousLeads = get().leads;
        // Optimistic update
        set(state => ({
          leads: state.leads.map(lead => lead.id === id ? { ...lead, ...updates } : lead)
        }));
        try {
          await updateDoc(doc(db, 'leads', id), updates);
        } catch (error) {
          console.error('Failed to update lead:', error);
          // Rollback on failure
          set({ leads: previousLeads, error: error.message });
          throw error;
        }
      },

      invalidateCache: () => {
        set({ lastFetched: null, leads: [] });
      }
    }),
    {
      name: 'lead-storage', // unique name for localStorage key
    }
  )
);
