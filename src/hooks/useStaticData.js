/**
 * useStaticData.js
 *
 * ⚠️  DEPRECATED — kept only for backwards compatibility with any existing
 * callers. Firestore is the single source of truth; do NOT add new callers
 * to this hook. Use productRepository.getActiveProducts() or
 * protocolRepository.getAllProtocols() instead.
 *
 * Migration guide:
 *   - products        → getActiveProducts() from productRepository
 *   - supplements     → getActiveSupplements() from supplementRepository
 *   - productCategories → getProductCategories() from productRepository (TBD)
 *
 * This hook now fetches from Firestore via the same repositories and caches
 * results via React Query (staleTime: 30 min), so there is no local JSON
 * dependency at runtime.
 */
import { useQuery } from '@tanstack/react-query';
import { getActiveProducts } from '../repositories/productRepository';
import { getActiveSupplements } from '../repositories/supplementRepository';

export function useStaticData() {
  const { data: products = [] } = useQuery({
    queryKey: ['products'],
    queryFn: () => getActiveProducts(),
    staleTime: 1000 * 60 * 30, // 30 min — matches repository cache TTL
  });

  const { data: supplements = [] } = useQuery({
    queryKey: ['supplements'],
    queryFn: () => getActiveSupplements(),
    staleTime: 1000 * 60 * 60 * 24, // 24 hours
  });

  // Product categories are derived from the Firestore products themselves.
  // We extract unique category labels client-side to avoid a separate collection read.
  const productCategories = products
    .flatMap(p => p.categories || p.classification?.categories || [])
    .filter((v, i, arr) => arr.indexOf(v) === i);

  return { products, supplements, productCategories };
}
