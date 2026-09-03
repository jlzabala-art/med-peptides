"use client";

import { useState, useCallback, useRef, useEffect, useMemo } from 'react';
import { useInfiniteQuery, useQueryClient } from '@tanstack/react-query';
import {
  collection,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  getDocs,
  getCountFromServer,
  getAggregateFromServer,
} from 'firebase/firestore';
import * as fb from '../../firebase';
const db = fb?.db;

/** Normalize Firestore Timestamp fields to ISO strings */
function normalizeTimestamps(data) {
  const normalized = { ...data };
  ['createdAt', 'updatedAt', 'deletedAt', 'date', 'dueDate'].forEach((field) => {
    if (normalized[field]?.toDate) {
      normalized[field] = normalized[field].toDate().toISOString();
    }
  });
  return normalized;
}

/**
 * useFirestorePaginatedCollection
 * ─────────────────────────────────────────────────────────────────────────────
 * Refactored to use @tanstack/react-query for multi-level caching.
 */
export function useFirestorePaginatedCollection(collectionPath, options = {}) {
  const {
    whereConditions = [],
    orderByFields = [['createdAt', 'desc']],
    pageSize = 50,
    enabled = true,
    initialData = null,
    onDataLoaded,
    aggregations = null,
  } = options;


  const queryClient = useQueryClient();

  const memoizedWhere = useMemo(() => whereConditions, [JSON.stringify(whereConditions)]);
  const memoizedOrder = useMemo(() => orderByFields, [JSON.stringify(orderByFields)]);

  const queryKey = useMemo(() => [
    'firestore',
    collectionPath,
    { where: memoizedWhere, order: memoizedOrder, pageSize }
  ], [collectionPath, memoizedWhere, memoizedOrder, pageSize]);
  
  const cacheKey = `__rg_paginated_${collectionPath}_${JSON.stringify(memoizedWhere)}_${JSON.stringify(memoizedOrder)}_${pageSize}_v3`;

  const {
    data: queryData,
    error,
    fetchNextPage,
    hasNextPage,
    isFetching,
    isFetchingNextPage,
    refetch,
    status
  } = useInfiniteQuery({
    queryKey,
    queryFn: async ({ pageParam = null }) => {
      const buildQuery = (skipOrder = false) => {
        let q = collection(db, collectionPath);
        memoizedWhere.forEach(([field, op, value]) => {
          if (value !== undefined && value !== null) {
            q = query(q, where(field, op, value));
          }
        });
        
        if (!skipOrder) {
          memoizedOrder.forEach(([field, direction = 'asc']) => {
            q = query(q, orderBy(field, direction));
          });
        }
        
        if (pageParam && typeof pageParam.data === 'function') {
          q = query(q, startAfter(pageParam));
        }
        
        q = query(q, limit(pageSize));
        return q;
      };

      let snap;
      try {
        snap = await getDocs(buildQuery(false));
      } catch (err) {
        // failed-precondition usually means missing composite index
        if (err.code === 'failed-precondition' || String(err).includes('index')) {
          console.warn(`[Firestore] Query failed due to missing index on ${collectionPath}. Retrying without orderBy. Original error: ${err.message}`);
          snap = await getDocs(buildQuery(true));
        } else {
          throw err;
        }
      }

      const docs = snap.docs.map(docSnap => ({
        id: docSnap.id,
        ...normalizeTimestamps(docSnap.data()),
      }));

      return {
        docs,
        lastDoc: snap.docs.length > 0 ? snap.docs[snap.docs.length - 1] : null,
        hasMore: snap.docs.length === pageSize
      };
    },
    getNextPageParam: (lastPage) => {
      if (lastPage.hasMore && lastPage.lastDoc) {
        return lastPage.lastDoc;
      }
      return undefined;
    },
    initialData: () => {
      if (initialData) {
        return {
          pages: [{ docs: initialData, lastDoc: null, hasMore: initialData.length === pageSize }],
          pageParams: [null],
        };
      }
      if (typeof window !== 'undefined') {
        try {
          const cached = localStorage.getItem(cacheKey);
          if (cached) {
            const parsed = JSON.parse(cached);
            if (Date.now() - parsed.ts < 30 * 60 * 1000) { // 30 min TTL
              return {
                pages: [{ docs: parsed.data, lastDoc: null, hasMore: parsed.hasMore, fromCache: true }],
                pageParams: [null]
              };
            }
          }
        } catch (e) {}
      }
      return undefined;
    },
    enabled: enabled && !!collectionPath,
    staleTime: 1000 * 60 * 5, // 5 minutes fresh
    retry: false, // Prevent hanging loops on missing index errors
  });

  // Sync first page to LocalStorage for zero-latency load on refresh
  useEffect(() => {
    if (queryData?.pages?.[0] && !queryData.pages[0].fromCache && typeof window !== 'undefined') {
      try {
        const firstPage = queryData.pages[0];
        localStorage.setItem(cacheKey, JSON.stringify({
          data: firstPage.docs,
          hasMore: firstPage.hasMore,
          ts: Date.now()
        }));
      } catch (e) {}
    }
  }, [queryData, cacheKey]);

  const flatData = useMemo(() => {
    if (!queryData) return initialData || [];
    return queryData.pages.flatMap(page => page.docs);
  }, [queryData, initialData]);

  // Backward compatibility state for metrics/aggregations
  // (Preferably these should be handled by Server Actions, but we keep this for older consumers)
  const [totalCount, setTotalCount] = useState(null);
  const [metrics, setMetrics] = useState(null);

  useEffect(() => {
    // Skip client-side aggregation when initialData is provided.
    // KPIs already come from the RSC via serverKPIs prop — no duplicate query needed.
    if (!enabled || !collectionPath) return;
    if (initialData && initialData.length > 0) return;

    let isMounted = true;
    const fetchMetrics = async () => {
      try {
        let q = collection(db, collectionPath);
        memoizedWhere.forEach(([field, op, value]) => {
          if (value !== undefined && value !== null) {
            q = query(q, where(field, op, value));
          }
        });
        
        if (aggregations) {
          const snapshot = await getAggregateFromServer(q, aggregations);
          if (isMounted) setMetrics(snapshot.data());
        } else {
          const snapshot = await getCountFromServer(q);
          if (isMounted) setTotalCount(snapshot.data().count);
        }
      } catch (err) {
        console.warn(`[useFirestorePaginatedCollection] Aggregation failed on ${collectionPath}:`, err);
      }
    };
    
    fetchMetrics();
    return () => { isMounted = false; };
  }, [collectionPath, memoizedWhere, aggregations, enabled, initialData]);


  // Simulate onDataLoaded
  const onDataLoadedRef = useRef(onDataLoaded);
  useEffect(() => {
    onDataLoadedRef.current = onDataLoaded;
  }, [onDataLoaded]);

  useEffect(() => {
    if (queryData && onDataLoadedRef.current) {
      const lastPage = queryData.pages[queryData.pages.length - 1];
      if (lastPage) {
        onDataLoadedRef.current(lastPage.docs);
      }
    }
  }, [queryData]);

  return {
    data: flatData,
    isLoading: status === 'pending' || (isFetching && !isFetchingNextPage),
    isFetchingMore: isFetchingNextPage,
    hasMore: hasNextPage,
    error: error?.message || null,
    totalCount,
    metrics,
    loadMore: fetchNextPage,
    refresh: refetch,
  };
}

export default useFirestorePaginatedCollection;
