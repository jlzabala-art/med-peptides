 
import { db } from '../firebase';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { getActiveSupplements } from '../repositories/supplementRepository';
import { buildProtocolIndex } from '../utils/searchEngine';
import localProtocolIndex from '../data/protocol_search_index.json';
import { useQuery } from '@tanstack/react-query';

export function useFirestoreData() {
  // ── FAQs (cached per session via React Query) ─────────────────────────────
  const { data: allFaqs = [] } = useQuery({
    queryKey: ['faqs'],
    queryFn: async () => {
      const snap = await getDocs(collection(db, 'peptide_faq'));
      return snap.docs.map((d) => ({ ...d.data(), faqId: d.id }));
    },
    staleTime: 1000 * 60 * 60 * 24, // 24 hours
  });

  // ── Supplements (Firestore, cached via React Query) ──────────────────────
  const { data: supplementCatalogue = [] } = useQuery({
    queryKey: ['supplements'],
    queryFn: async () => {
      return await getActiveSupplements();
    },
    staleTime: 1000 * 60 * 60 * 24, // 24 hours
  });

  // ── Protocol Index for Search ─────────────────────────────────────────────
  const { data: protocolIndex = [] } = useQuery({
    queryKey: ['protocolIndex'],
    queryFn: async () => {
      if (localProtocolIndex && localProtocolIndex.length > 0) {
        return localProtocolIndex;
      }
      const q = query(collection(db, 'protocols'), where('active', '==', true));
      const snap = await getDocs(q);
      const templates = snap.docs.map((d) => ({ ...d.data(), id: d.id }));
      return buildProtocolIndex(templates);
    },
    staleTime: Infinity, // never stale
  });

  // Expose empty products array to not break any legacy code expecting it
  return { products: [], setProducts: () => {}, allFaqs, protocolIndex, loadingProducts: false, supplementCatalogue };
}
