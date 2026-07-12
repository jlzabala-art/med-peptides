import { useState, useCallback, useRef, useEffect, useMemo } from 'react';
import {
  collection,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  getDocs,
  getCountFromServer,
} from 'firebase/firestore';
import * as fb from '../../firebase';
const db = fb?.db;

/**
 * useFirestorePaginatedCollection
 * ─────────────────────────────────────────────────────────────────────────────
 * Generic hook for paginated Firestore collection fetching.
 * Uses cursor-based pagination (startAfter) which is the correct approach
 * for Firestore — never fetches all documents at once.
 *
 * Supports:
 *  - limit-based pagination (page size)
 *  - cursor navigation (next/prev pages)
 *  - where clauses (equality, range, etc.)
 *  - orderBy fields (IMPORTANT: must match Firestore composite index)
 *  - auto-refresh on option changes
 *
 * Firestore Index Requirements:
 *  When using both orderBy AND where on different fields, you MUST create a
 *  composite index in Firebase Console:
 *  https://console.firebase.google.com/project/med-peptides-app/firestore/indexes
 *
 *  Common required indexes for this app:
 *  - products: orderBy('name') — single field, auto-indexed ✓
 *  - products: where('category', '==', x) + orderBy('name') → composite index needed
 *  - prescriptions: where('doctorId', '==', x) + orderBy('createdAt', 'desc') → composite index needed
 *
 * @param {string} collectionPath — Firestore collection path (e.g. 'products')
 * @param {Object} options
 * @param {Array}  options.whereConditions — e.g. [['category', '==', 'Peptides'], ['isActive', '==', true]]
 * @param {Array}  options.orderByFields   — e.g. [['name', 'asc']] or [['createdAt', 'desc']]
 * @param {number} options.pageSize        — Items per page. Default: 50
 * @param {boolean} options.enabled        — If false, query won't run. Default: true
 * @param {Function} options.onDataLoaded  — Optional callback after each successful fetch
 *
 * @returns {Object} { data, isLoading, isFetchingMore, hasMore, error, totalCount,
 *                     loadMore, refresh, goToPage, currentPage }
 *
 * @example
 * const { data, isLoading, hasMore, loadMore } = useFirestorePaginatedCollection('products', {
 *   orderByFields: [['name', 'asc']],
 *   pageSize: 50,
 * });
 *
 * @example With filters (requires composite Firestore index)
 * const { data, isLoading } = useFirestorePaginatedCollection('prescriptions', {
 *   whereConditions: [['doctorId', '==', userId], ['status', '!=', 'archived']],
 *   orderByFields: [['createdAt', 'desc']],
 *   pageSize: 25,
 * });
 */
export function useFirestorePaginatedCollection(collectionPath, options = {}) {
  const {
    whereConditions = [],
    orderByFields = [['createdAt', 'desc']],
    pageSize = 50,
    enabled = true,
    initialData = null,
    onDataLoaded,
  } = options;

  // Memoize array conditions to prevent infinite loops when arrays are passed inline
  const whereConditionsStr = JSON.stringify(whereConditions);
  const orderByFieldsStr = JSON.stringify(orderByFields);

  const memoizedWhere = useMemo(() => JSON.parse(whereConditionsStr), [whereConditionsStr]);
  const memoizedOrder = useMemo(() => JSON.parse(orderByFieldsStr), [orderByFieldsStr]);

  const onDataLoadedRef = useRef(onDataLoaded);
  useEffect(() => {
    onDataLoadedRef.current = onDataLoaded;
  }, [onDataLoaded]);

  const [data, setData] = useState(initialData || []);
  const [isLoading, setIsLoading] = useState(initialData ? false : true);
  const [isFetchingMore, setIsFetchingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState(null);
  const [totalCount, setTotalCount] = useState(null); // From Firestore count query

  // Cursor stack: allows going back to previous pages
  const cursorsRef = useRef([]); // Array of lastVisible docs per page
  const currentPageRef = useRef(0);

  /** Build the base Firestore query from options */
  const buildQuery = useCallback(
    (startAfterDoc = null, limitOverride = null) => {
      let q = collection(db, collectionPath);

      memoizedWhere.forEach(([field, op, value]) => {
        if (value !== undefined && value !== null) {
          q = query(q, where(field, op, value));
        }
      });

      memoizedOrder.forEach(([field, direction = 'asc']) => {
        q = query(q, orderBy(field, direction));
      });

      if (startAfterDoc) {
        q = query(q, startAfter(startAfterDoc));
      }

      q = query(q, limit(limitOverride || pageSize));

      return q;
    },
    [collectionPath, memoizedWhere, memoizedOrder, pageSize]
  );

  /** Initial fetch (page 1) */
  const fetchInitial = useCallback(async () => {
    if (!enabled || !collectionPath) return;

    setIsLoading(true);
    setError(null);
    cursorsRef.current = [];
    currentPageRef.current = 0;

    try {
      const q = buildQuery(null);
      const snap = await getDocs(q);

      const docs = snap.docs.map((docSnap) => ({
        id: docSnap.id,
        ...normalizeTimestamps(docSnap.data()),
        _ref: docSnap, // Keep reference for cursor pagination
      }));

      setData(docs);
      setHasMore(snap.docs.length === pageSize);

      if (snap.docs.length > 0) {
        cursorsRef.current = [snap.docs[snap.docs.length - 1]];
      }

      // Get total count (non-blocking, for display)
      fetchTotalCount();

      onDataLoadedRef.current?.(docs);
    } catch (err) {
      console.error(`[useFirestorePaginatedCollection] Error fetching ${collectionPath}:`, err);
      // If it's an index error, provide a helpful message
      if (err.code === 'failed-precondition') {
        setError(
          `Firestore index required. Please create a composite index for "${collectionPath}". ` +
          `Fields: ${orderByFields.map(([f]) => f).join(', ')}. ` +
          `Check the Firebase Console: https://console.firebase.google.com`
        );
      } else {
        setError(err.message || 'Error loading data');
      }
    } finally {
      setIsLoading(false);
    }
  }, [enabled, collectionPath, buildQuery, pageSize]);

  /** Load next page (append mode for infinite scroll) */
  const loadMore = useCallback(async () => {
    if (!hasMore || isFetchingMore || isLoading) return;

    const lastCursor = cursorsRef.current[cursorsRef.current.length - 1];
    if (!lastCursor) return;

    setIsFetchingMore(true);
    try {
      const q = buildQuery(lastCursor);
      const snap = await getDocs(q);

      const newDocs = snap.docs.map((docSnap) => ({
        id: docSnap.id,
        ...normalizeTimestamps(docSnap.data()),
        _ref: docSnap,
      }));

      setData((prev) => [...prev, ...newDocs]);
      setHasMore(snap.docs.length === pageSize);

      if (snap.docs.length > 0) {
        cursorsRef.current = [...cursorsRef.current, snap.docs[snap.docs.length - 1]];
      }

      onDataLoadedRef.current?.(newDocs);
    } catch (err) {
      console.error(`[useFirestorePaginatedCollection] Error loading more from ${collectionPath}:`, err);
    } finally {
      setIsFetchingMore(false);
    }
  }, [hasMore, isFetchingMore, isLoading, buildQuery, pageSize, collectionPath]);

  /** Get total count (for UI display) — uses Firestore count aggregate */
  const fetchTotalCount = useCallback(async () => {
    try {
      let q = collection(db, collectionPath);
      memoizedWhere.forEach(([field, op, value]) => {
        if (value !== undefined && value !== null) {
          q = query(q, where(field, op, value));
        }
      });
      const snapshot = await getCountFromServer(q);
      setTotalCount(snapshot.data().count);
    } catch {
      // Count queries may fail on older Firestore setups — non-critical
    }
  }, [collectionPath, memoizedWhere]);

  /** Re-run the initial fetch (e.g. after a mutation) */
  const refresh = useCallback(() => {
    fetchInitial();
  }, [fetchInitial]);

  // Auto-fetch on mount and when key options change
  useEffect(() => {
    // If we have initialData and this is the very first render, skip the fetch
    // to avoid overriding Server-Side fetched data.
    if (initialData && data.length > 0 && data[0] === initialData[0] && !cursorsRef.current.length) {
      if (initialData.length > 0) {
        cursorsRef.current = []; // We don't have the firestore document reference for cursors when data comes from server, 
        // so pagination will require a new fetch or we can just fetch the first page from firestore when they click 'Load More'
      }
      return;
    }
    fetchInitial();
  }, [fetchInitial, initialData]);

  return {
    data,
    isLoading,
    isFetchingMore,
    hasMore,
    error,
    totalCount,
    loadMore,
    refresh,
  };
}

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
