/**
 * src/repositories/ultramanApiRepository.js
 * 
 * Repository for Ultraman / UltraPerson APIs (Pharmapolis Compounding Pharmacy).
 * Adheres strictly to Architecture Rule #2 (Firestore as Single Source of Truth,
 * 4-layer caching: RAM with TTL -> localStorage -> Firestore -> Fallback).
 */

import { ULTRAMAN_APIS_MASTER } from '../data/ultramanApisMaster.js';

const CACHE_TTL_MS = 30 * 60 * 1000; // 30 minutes
const LOCAL_STORAGE_KEY = 'atlas_ultraman_apis_cache_v1';
const LOCAL_STORAGE_TS_KEY = 'atlas_ultraman_apis_cache_ts_v1';

// Layer 1: In-memory RAM module variable
let memoryCache = null;
let memoryCacheTimestamp = 0;

export function invalidateUltramanApisCache() {
  memoryCache = null;
  memoryCacheTimestamp = 0;
  if (typeof window !== 'undefined') {
    try {
      localStorage.removeItem(LOCAL_STORAGE_KEY);
      localStorage.removeItem(LOCAL_STORAGE_TS_KEY);
    } catch {
      // ignore
    }
  }
}

/**
 * Fetch all Ultraman APIs from Firestore (with 4-layer caching)
 */
export async function getUltramanApis({ forceRefresh = false } = {}) {
  const now = Date.now();

  // Layer 1: Memory RAM
  if (!forceRefresh && memoryCache && (now - memoryCacheTimestamp < CACHE_TTL_MS)) {
    return memoryCache;
  }

  // Layer 2: localStorage (client-side)
  if (!forceRefresh && typeof window !== 'undefined') {
    try {
      const storedTs = Number(localStorage.getItem(LOCAL_STORAGE_TS_KEY) || 0);
      if (storedTs && (now - storedTs < CACHE_TTL_MS)) {
        const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
        if (stored) {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed) && parsed.length > 0) {
            memoryCache = parsed;
            memoryCacheTimestamp = storedTs;
            return parsed;
          }
        }
      }
    } catch {
      // LocalStorage access fail fallback
    }
  }

  // Layer 4: Firestore query
  try {
    let items = [];
    if (typeof window !== 'undefined') {
      const { firestoreDb } = await import('../firebase');
      const { collection, getDocs } = await import('firebase/firestore');
      if (firestoreDb) {
        const snap = await getDocs(collection(firestoreDb, 'ultraman_apis'));
        if (!snap.empty) {
          items = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        }
      }
    } else {
      // Server-side
      const { getFirestore } = await import('firebase-admin/firestore');
      const db = getFirestore();
      const snap = await db.collection('ultraman_apis').get();
      if (!snap.empty) {
        items = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      }
    }

    if (items.length > 0) {
      // Sort by rawIndex or name
      items.sort((a, b) => (a.rawIndex || 999) - (b.rawIndex || 999));
      memoryCache = items;
      memoryCacheTimestamp = now;

      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(items));
          localStorage.setItem(LOCAL_STORAGE_TS_KEY, String(now));
        } catch {
          // ignore quota error
        }
      }

      return items;
    }
  } catch (error) {
    console.warn('⚠️ [ultramanApiRepository] Firestore read failed, falling back to static master catalog:', error?.message);
  }

  // Fallback: master static array
  return ULTRAMAN_APIS_MASTER;
}

/**
 * Get single Ultraman API by ID or matching keyword
 */
export async function getUltramanApiById(id) {
  const apis = await getUltramanApis();
  const cleanId = (id || '').toLowerCase().trim();
  return apis.find(a => a.id === cleanId || a.id.replace('pharmapolis-', '') === cleanId) || null;
}
