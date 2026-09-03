'use client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { getAllProducts, invalidateProductsCache } from '@/repositories/productRepository';
import { useRoleAccess } from '@/hooks/useRoleAccess';
import { queryKeys } from './queryKeys';
import { validateProduct } from '@/schemas/productSchema.zod';
import notifier from '@/services/NotificationService';

/**
 * useCatalogQuery
 * 
 * Standardized TanStack Query hook for Catalog and Products data access.
 * Adheres to 4-layer cache architecture (RAM -> localStorage -> React Query -> Firestore).
 */
export function useCatalogQuery(options = {}) {
  const { is, effectiveRole } = useRoleAccess();
  const queryClient = useQueryClient();

  const {
    category = null,
    search = '',
    forceRefresh = false,
    validate = true,
    enabled = true,
  } = options;

  const query = useQuery({
    queryKey: queryKeys.products.list({ category, search, effectiveRole }),
    queryFn: async () => {
      const all = await getAllProducts({ forceRefresh });
      // Validate each product using Zod schema
      if (validate) {
        const results = all.map(item => validateProduct(item));
        const valid = results.filter(r => r.success).map(r => r.data);
        const invalid = results.filter(r => !r.success);
        if (invalid.length) {
          console.warn(`${invalid.length} product(s) failed validation and will be excluded.`);
          // Show toast notification for invalid products
          notifier.error(`${invalid.length} invalid product(s) ignored.`);
        }
        return valid;
      }
      return all;
    },
    staleTime: 1000 * 60 * 15, // 15 minutes
    gcTime: 1000 * 60 * 60,    // 1 hour
    enabled,
  });

  // Role-based pricing and client filtering
  const processedProducts = (query.data || []).map(product => {
    let displayPrice = product.price || 0;
    let tier = 'retail';

    if (is('admin')) {
      displayPrice = product.price;
      tier = 'admin_view';
    } else if (is('wholesaler') || is('supplier')) {
      displayPrice = product.tier1Price || product.price;
      tier = 'tier1';
    } else if (is('doctor') || is('clinic')) {
      displayPrice = product.tier2Price || product.price;
      tier = 'tier2';
    }

    return {
      ...product,
      displayPrice,
      pricingTier: tier,
    };
  });

  const filteredProducts = processedProducts.filter(p => {
    if (category && (p.category || '').toLowerCase() !== category.toLowerCase()) return false;
    if (search) {
      const q = search.toLowerCase();
      const matchName = (p.name || p.title || '').toLowerCase().includes(q);
      const matchDesc = (p.description || '').toLowerCase().includes(q);
      const matchSupplier = (p.supplier || '').toLowerCase().includes(q);
      return matchName || matchDesc || matchSupplier;
    }
    return true;
  });

  const invalidate = () => {
    invalidateProductsCache();
    queryClient.invalidateQueries({ queryKey: queryKeys.products.all });
  };

  return {
    ...query,
    products: filteredProducts,
    allProducts: processedProducts,
    invalidate,
  };
}
