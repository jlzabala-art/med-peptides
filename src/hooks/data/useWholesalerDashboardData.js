'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { fetchWholesalerOverviewDataAction, approveAndReservePoAction } from '../../actions/wholesalerActions';
import notifier from '../../services/NotificationService';
import { logger } from '../../utils/logger';

// Layer 1: Module RAM Cache with TTL
let ramCache = null;
let ramCacheTimestamp = 0;
const RAM_TTL = 1000 * 60 * 5; // 5 minutes

// Layer 2: LocalStorage key & TTL
const STORAGE_KEY = 'regenpept_wholesaler_overview_cache';
const STORAGE_TTL = 1000 * 60 * 30; // 30 minutes

/**
 * Invalidates both Layer 1 (RAM) and Layer 2 (LocalStorage) caches
 */
export function invalidateWholesalerCache() {
  ramCache = null;
  ramCacheTimestamp = 0;
  if (typeof window !== 'undefined') {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // Ignore storage errors
    }
  }
}

/**
 * Custom hook for Wholesaler / Supplier overview data.
 * Implements Golden Rule #2 (4-Layer Caching Architecture):
 * Layer 1: RAM (0ms)
 * Layer 2: LocalStorage (persists across page reloads)
 * Layer 3: Component State / Stale-While-Revalidate
 * Layer 4: Server Action / Firestore Atomic Transactions
 *
 * @param {object} params
 * @param {string|null} params.wholesalerId
 * @param {object|null} params.initialData - Pre-hydrated data from RSC (Golden Rule #21)
 * @returns {object} { data, loading, error, isRefreshing, approvePo, refetch }
 */
export function useWholesalerDashboardData({ wholesalerId = null, initialData = null } = {}) {
  const [data, setData] = useState(() => {
    // 0. Use pre-hydrated RSC data if present
    if (initialData) {
      ramCache = initialData;
      ramCacheTimestamp = Date.now();
      return initialData;
    }

    // 1. Layer 1 Check (RAM)
    if (ramCache && Date.now() - ramCacheTimestamp < RAM_TTL) {
      return ramCache;
    }

    // 2. Layer 2 Check (LocalStorage)
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
          const parsed = JSON.parse(stored);
          if (Date.now() - parsed.timestamp < STORAGE_TTL) {
            ramCache = parsed.data;
            ramCacheTimestamp = Date.now();
            return parsed.data;
          }
        }
      } catch {
        // Fallback to null
      }
    }

    return null;
  });

  const [loading, setLoading] = useState(!data && !initialData);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const isMounted = useRef(true);

  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  const fetchData = useCallback(async (forceRefresh = false) => {
    // If not forcing refresh and RAM is fresh, skip network
    if (!forceRefresh && ramCache && Date.now() - ramCacheTimestamp < RAM_TTL) {
      if (isMounted.current) {
        setData(ramCache);
        setLoading(false);
      }
      return;
    }

    if (isMounted.current) {
      if (!data) setLoading(true);
      else setIsRefreshing(true);
      setError(null);
    }

    try {
      // Layer 4: Server Action
      const result = await fetchWholesalerOverviewDataAction({ wholesalerId });

      if (isMounted.current) {
        setData(result);
        setLoading(false);
        setIsRefreshing(false);
      }

      // Update Layer 1 (RAM)
      ramCache = result;
      ramCacheTimestamp = Date.now();

      // Update Layer 2 (LocalStorage)
      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem(
            STORAGE_KEY,
            JSON.stringify({ timestamp: Date.now(), data: result })
          );
        } catch {
          // LocalStorage full or private browsing
        }
      }
    } catch (err) {
      logger.error('[useWholesalerDashboardData] fetch failed', { error: err.message });
      if (isMounted.current) {
        setError(err.message || 'Failed to fetch wholesaler data');
        setLoading(false);
        setIsRefreshing(false);
      }
    }
  }, [wholesalerId, data]);

  // Initial fetch if cache was empty
  useEffect(() => {
    if (!data) {
      fetchData(false);
    }
  }, [fetchData, data]);

  /**
   * Approves a PO with optimistic state update + Server Action atomic transaction
   */
  const approvePo = useCallback(async (poId) => {
    // Optimistic UI Update: remove from pending list
    let previousData = null;
    setData(prev => {
      if (!prev) return prev;
      previousData = prev;
      const updatedOrders = (prev.pendingBulkOrders || []).filter(o => o.id !== poId);
      const updated = {
        ...prev,
        pendingBulkOrders: updatedOrders,
        bulkOrdersPending: Math.max(0, updatedOrders.length),
      };
      ramCache = updated;
      return updated;
    });

    try {
      const res = await approveAndReservePoAction({ poId, wholesalerId });
      if (res.success) {
        notifier.success(res.message || `PO ${poId} approved! Stock reserved from FEFO lot.`);
      } else {
        throw new Error(res.error || 'Approval failed');
      }
    } catch (err) {
      logger.error('[useWholesalerDashboardData] approvePo failed, rolling back', { poId, error: err.message });
      notifier.error(`Failed to approve PO: ${err.message}`);
      // Rollback optimistic state
      if (previousData && isMounted.current) {
        setData(previousData);
        ramCache = previousData;
      }
    }
  }, [wholesalerId]);

  return {
    data,
    loading,
    isRefreshing,
    error,
    approvePo,
    refetch: () => fetchData(true),
    invalidateCache: invalidateWholesalerCache,
  };
}

export default useWholesalerDashboardData;
