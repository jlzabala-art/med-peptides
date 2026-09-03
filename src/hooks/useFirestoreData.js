 
import * as fb from '../firebase';
const db = fb?.db;
import { collection, getDocs, query, where, limit } from 'firebase/firestore';
import { getActiveSupplements } from '../repositories/supplementRepository';
import { buildProtocolIndex } from '../utils/searchEngine';
import { useQuery } from '@tanstack/react-query';

// Local JSON is a FALLBACK ONLY — used if Firestore is unreachable.
// Firestore is the single source of truth per architecture rules.
let _localProtocolIndexFallback = null;
async function _getLocalFallback() {
  if (_localProtocolIndexFallback) return _localProtocolIndexFallback;
  try {
    const { default: data } = await import('../data/protocol_search_index.json');
    _localProtocolIndexFallback = data || [];
  } catch {
    _localProtocolIndexFallback = [];
  }
  return _localProtocolIndexFallback;
}

export function useFirestoreData() {
  // ── FAQs (Firestore, cached 24h via React Query) ──────────────────────────
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

  // ── Protocol Search Index (Firestore first, local JSON as fallback) ───────
  // Source of truth: Firestore `protocols` collection.
  // Fallback: pre-generated local JSON (used only if Firestore unreachable).
  const { data: protocolIndex = [] } = useQuery({
    queryKey: ['protocolIndex'],
    queryFn: async () => {
      try {
        const q = query(
          collection(db, 'protocols'),
          where('active', '==', true),
          limit(200)
        );
        const snap = await getDocs(q);
        if (!snap.empty) {
          const templates = snap.docs.map((d) => ({ ...d.data(), id: d.id }));
          return buildProtocolIndex(templates);
        }
      } catch (err) {
        console.warn('[useFirestoreData] Firestore protocol index failed, falling back to local:', err.message);
      }
      // Fallback to local JSON only if Firestore is unavailable
      return await _getLocalFallback();
    },
    staleTime: 1000 * 60 * 60, // 1 hour — aligns with protocolRepository cache TTL
  });

  // ── Active B2C Suppliers (Cached via React Query) ──────────────────────────
  const { data: activeB2cSuppliers = [] } = useQuery({
    queryKey: ['activeB2cSuppliers'],
    queryFn: async () => {
      try {
        const [supSnap, wholeSnap] = await Promise.all([
          getDocs(query(collection(db, 'suppliers'), where('statusB2C', '==', 'active'))),
          getDocs(query(collection(db, 'wholesellers'), where('statusB2C', '==', 'active')))
        ]);
        const list = [];
        supSnap.forEach((d) => {
          const data = d.data();
          list.push(d.id, data.name, data.companyName, data.displayName, data.slug);
        });
        wholeSnap.forEach((d) => {
          const data = d.data();
          list.push(d.id, data.name, data.companyName, data.displayName, data.slug);
        });
        return [...new Set(list.filter(Boolean).map((s) => s.toLowerCase().trim()))];
      } catch (err) {
        console.warn('[useFirestoreData] Active B2C suppliers check failed:', err);
        return [];
      }
    },
    staleTime: 1000 * 60 * 30, // 30 mins
  });

  // Expose empty products array to not break any legacy code expecting it
  return { products: [], setProducts: () => {}, allFaqs, protocolIndex, loadingProducts: false, supplementCatalogue, activeB2cSuppliers };
}
