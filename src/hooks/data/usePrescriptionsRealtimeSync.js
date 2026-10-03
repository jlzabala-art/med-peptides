"use client";

import { useState, useEffect, useRef } from 'react';
import { collection, query, where, orderBy, limit, onSnapshot } from 'firebase/firestore';
import { db } from '../../firebase';

/**
 * usePrescriptionsRealtimeSync
 * ─────────────────────────────────────────────────────────────────────────────
 * Lightweight Firestore real-time listener (Golden Rule GCP UX).
 * Subscribes only to limit(1) ordered by createdAt desc to detect new prescriptions
 * without pulling the entire collection into memory or burning read quotas.
 *
 * When a newer document is detected, it signals `hasNewData: true` so the UI
 * can display a non-blocking "New data available • Update view" notification,
 * or automatically update if appropriate.
 */
export function usePrescriptionsRealtimeSync({
  collectionPath = 'prescriptions',
  whereConditions = [],
  enabled = true,
  onNewDoc = null,
} = {}) {
  const [hasNewData, setHasNewData] = useState(false);
  const [latestNewDoc, setLatestNewDoc] = useState(null);
  const [syncStatus, setSyncStatus] = useState('idle'); // 'idle' | 'listening' | 'error'
  
  const initialDocIdRef = useRef(null);
  const isFirstSnapshotRef = useRef(true);

  // Reset when conditions or enabled state change
  useEffect(() => {
    isFirstSnapshotRef.current = true;
    initialDocIdRef.current = null;
    setHasNewData(false);
    setLatestNewDoc(null);
  }, [JSON.stringify(whereConditions), enabled]);

  useEffect(() => {
    if (!enabled || !db || typeof window === 'undefined') {
      setSyncStatus('idle');
      return;
    }

    let unsubscribe = () => {};

    try {
      let q = collection(db, collectionPath);

      // Apply where conditions if provided
      if (Array.isArray(whereConditions)) {
        whereConditions.forEach(([field, op, value]) => {
          if (value !== undefined && value !== null && value !== '') {
            q = query(q, where(field, op, value));
          }
        });
      }

      // Order by createdAt desc with limit(1) to be strictly minimal on reads
      q = query(q, orderBy('createdAt', 'desc'), limit(1));

      setSyncStatus('listening');

      unsubscribe = onSnapshot(
        q,
        (snapshot) => {
          if (snapshot.empty) {
            isFirstSnapshotRef.current = false;
            return;
          }

          const topDoc = snapshot.docs[0];
          const topDocId = topDoc.id;
          const topDocData = { id: topDocId, ...topDoc.data() };

          if (isFirstSnapshotRef.current) {
            // Initial snapshot — record the baseline newest doc
            initialDocIdRef.current = topDocId;
            isFirstSnapshotRef.current = false;
          } else {
            // Subsequent snapshot — check if a new doc arrived
            if (topDocId !== initialDocIdRef.current) {
              setHasNewData(true);
              setLatestNewDoc(topDocData);
              if (onNewDoc) {
                onNewDoc(topDocData);
              }
            }
          }
        },
        (error) => {
          // Gracefully log without crashing (e.g., missing index on specific compound queries)
          console.warn('[usePrescriptionsRealtimeSync] Realtime listener notice:', error.message);
          setSyncStatus('error');
        }
      );
    } catch (err) {
      console.warn('[usePrescriptionsRealtimeSync] Initialization error:', err);
      setSyncStatus('error');
    }

    return () => {
      unsubscribe();
      setSyncStatus('idle');
    };
  }, [collectionPath, JSON.stringify(whereConditions), enabled, onNewDoc]);

  const clearNewData = () => {
    setHasNewData(false);
    setLatestNewDoc(null);
    if (latestNewDoc?.id) {
      initialDocIdRef.current = latestNewDoc.id;
    }
  };

  return {
    hasNewData,
    latestNewDoc,
    syncStatus,
    clearNewData,
  };
}

export default usePrescriptionsRealtimeSync;
