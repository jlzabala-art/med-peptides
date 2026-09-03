'use client';

import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { cacheEventBus } from '@/lib/cache';

/**
 * useCacheSync
 * ─────────────────────────────────────────────────────────────────────────────
 * Synchronizes repository-level invalidations (RAM/localStorage) with TanStack Query.
 * When a repository calls `invalidateCache('products/123')` or `clearCacheNamespace('products')`,
 * this hook automatically invalidates the corresponding queryKey in React Query without
 * requiring page reloads or manual hook invocations.
 *
 * @param {Array|string} queryKey - TanStack Query key to invalidate
 * @param {string} [cacheNamespace] - Repository cache namespace prefix (e.g. 'products', 'prescriptions')
 */
export function useCacheSync(queryKey, cacheNamespace) {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!queryClient || !cacheNamespace) return;

    const targetKey = Array.isArray(queryKey) ? queryKey : [queryKey];

    const unsubscribeClear = cacheEventBus.on(`clear:${cacheNamespace}`, () => {
      queryClient.invalidateQueries({ queryKey: targetKey });
    });

    const unsubscribeWildcard = cacheEventBus.on('invalidate', ({ key }) => {
      if (key && key.startsWith(cacheNamespace)) {
        queryClient.invalidateQueries({ queryKey: targetKey });
      }
    });

    return () => {
      unsubscribeClear();
      unsubscribeWildcard();
    };
  }, [queryClient, queryKey, cacheNamespace]);
}
