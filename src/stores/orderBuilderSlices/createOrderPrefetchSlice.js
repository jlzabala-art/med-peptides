/**
 * createOrderPrefetchSlice.js
 * 
 * Atomic slice for background Firestore prefetching of patient prescription history.
 */

export const createOrderPrefetchSlice = (set, get) => ({
  patientHistoryCache: {},

  prefetchPatientHistory: async (patientId) => {
    if (!patientId) return;

    const { patientHistoryCache } = get();
    const cached = patientHistoryCache[patientId];
    const TTL_MS = 10 * 60 * 1000; // 10 minutes

    // Skip if recently fetched
    if (cached && !cached.loading && Date.now() - cached.lastFetched < TTL_MS) return;

    // Mark as loading
    set((state) => ({
      patientHistoryCache: {
        ...state.patientHistoryCache,
        [patientId]: { prescriptions: cached?.prescriptions || [], loading: true, lastFetched: 0 },
      },
    }));

    try {
      const { collection, query, where, orderBy, limit, getDocs } = await import('firebase/firestore');
      const { db } = await import('../../firebase');

      const q = query(
        collection(db, 'prescriptions'),
        where('patientId', '==', patientId),
        orderBy('createdAt', 'desc'),
        limit(5)
      );
      const snap = await getDocs(q);
      const prescriptions = snap.docs.map((d) => ({ id: d.id, ...d.data() }));

      set((state) => ({
        patientHistoryCache: {
          ...state.patientHistoryCache,
          [patientId]: { prescriptions, loading: false, lastFetched: Date.now() },
        },
      }));
    } catch (err) {
      console.warn('[orderBuilderStore] Failed to prefetch patient history:', err);
      set((state) => ({
        patientHistoryCache: {
          ...state.patientHistoryCache,
          [patientId]: { prescriptions: [], loading: false, lastFetched: Date.now() },
        },
      }));
    }
  },
});
