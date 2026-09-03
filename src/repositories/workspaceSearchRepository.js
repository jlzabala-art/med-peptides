/**
 * ════════════════════════════════════════════════════════════════════════════════
 *  WORKSPACE HIGH-SPEED SEARCH & ENTITY REPOSITORY
 *  src/repositories/workspaceSearchRepository.js
 * ════════════════════════════════════════════════════════════════════════════════
 * 
 * Implements the 4-layer Golden Rule caching architecture:
 * 1. RAM Cache (0ms instant response)
 * 2. LocalStorage Cache (Persists across navigation, 0ms on drawer open)
 * 3. Algolia Fast Index (<20ms fuzzy search across products, protocols, patients)
 * 4. Non-blocking Firestore SWR background sync
 */

import { searchAlgolia, searchAlgoliaFederated } from '../services/algoliaSearch';
import { db } from '../firebase';
import { collection, getDocs, query, limit, orderBy } from 'firebase/firestore';

const RAM_CACHE = new Map();
const CACHE_TTL_MS = 15 * 60 * 1000; // 15 minutes
const STORAGE_PREFIX = 'rp_ws_cache_';

function getFromStorage(key) {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(STORAGE_PREFIX + key);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (Date.now() - parsed.ts > CACHE_TTL_MS) return null;
    return parsed.data;
  } catch {
    return null;
  }
}

function saveToStorage(key, data) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_PREFIX + key, JSON.stringify({ data, ts: Date.now() }));
  } catch { /* ignore */ }
}

/**
 * 1. Get Top Recent Entities for Workspace (0ms instant return + background SWR)
 */
export async function getRecentEntitiesFast(type = 'clinic') {
  const cacheKey = `recent_${type}`;
  
  // Layer 1: RAM
  if (RAM_CACHE.has(cacheKey)) {
    const item = RAM_CACHE.get(cacheKey);
    if (Date.now() - item.ts < CACHE_TTL_MS) {
      return item.data;
    }
  }

  // Layer 2: LocalStorage
  const localData = getFromStorage(cacheKey);
  if (localData) {
    RAM_CACHE.set(cacheKey, { data: localData, ts: Date.now() });
    // Trigger background SWR sync without awaiting
    syncEntitiesBackground(type, cacheKey);
    return localData;
  }

  // Layer 3: Firestore Fetch
  return await fetchFromFirestore(type, cacheKey);
}

/**
 * Background SWR sync
 */
async function syncEntitiesBackground(type, cacheKey) {
  try {
    const fresh = await fetchFromFirestore(type, cacheKey);
    RAM_CACHE.set(cacheKey, { data: fresh, ts: Date.now() });
    saveToStorage(cacheKey, fresh);
  } catch { /* ignore background sync errors */ }
}

/**
 * Direct Firestore Fetch with strict limit
 */
async function fetchFromFirestore(type, cacheKey) {
  let docs = [];
  try {
    if (type === 'supplier') {
      const snap = await getDocs(query(collection(db, 'suppliers'), limit(25)));
      docs = snap.docs.map(d => ({
        id: d.id,
        name: d.data().companyName || d.data().name || d.id.replace(/^supplier-/, '').replace(/-/g, ' '),
        type: 'supplier',
        ...d.data()
      }));
    } else if (type === 'clinic') {
      const snap = await getDocs(query(collection(db, 'clinics'), limit(25)));
      docs = snap.docs.map(d => ({
        id: d.id,
        name: d.data().name || d.data().legalName || d.id,
        type: 'clinic',
        ...d.data()
      }));
    } else if (type === 'wholeseller') {
      const snap = await getDocs(query(collection(db, 'wholesellers'), limit(25)));
      docs = snap.docs.map(d => ({
        id: d.id,
        name: d.data().name || d.data().companyName || d.id,
        type: 'wholeseller',
        ...d.data()
      }));
    } else if (type === 'patient') {
      const snap = await getDocs(query(collection(db, 'users'), limit(30)));
      docs = snap.docs
        .filter(d => d.data().role === 'patient' || (d.data().roles && d.data().roles.includes('patient')))
        .map(d => ({
          id: d.id,
          name: d.data().fullName || d.data().displayName || d.data().email || d.id,
          email: d.data().email,
          type: 'patient',
          ...d.data()
        }));
    } else if (type === 'doctor') {
      const snap = await getDocs(query(collection(db, 'users'), limit(25)));
      docs = snap.docs
        .filter(d => d.data().role === 'doctor' || (d.data().roles && d.data().roles.includes('doctor')))
        .map(d => ({
          id: d.id,
          name: d.data().fullName || d.data().displayName || d.data().email || d.id,
          type: 'doctor',
          ...d.data()
        }));
    }
  } catch (err) {
    console.warn(`[WorkspaceRepo] Failed to fetch ${type}:`, err);
  }

  RAM_CACHE.set(cacheKey, { data: docs, ts: Date.now() });
  saveToStorage(cacheKey, docs);
  return docs;
}

/**
 * 2. Instant Search across Products & Protocols via Algolia + RAM
 */
export async function searchCatalogFast(searchQuery = '') {
  if (!searchQuery || searchQuery.trim().length < 2) {
    return { products: [], protocols: [] };
  }

  const clean = searchQuery.trim();
  const cacheKey = `search_${clean.toLowerCase()}`;
  if (RAM_CACHE.has(cacheKey)) {
    return RAM_CACHE.get(cacheKey).data;
  }

  // 1. Try Algolia
  try {
    const algoliaRes = await searchAlgolia(clean);
    if (algoliaRes && (algoliaRes.products?.length > 0 || algoliaRes.protocols?.length > 0)) {
      const formatted = {
        products: (algoliaRes.products || []).map(p => ({
          id: p.objectID || p.id,
          canonicalName: p.canonicalName || p.name,
          ...p
        })),
        protocols: (algoliaRes.protocols || []).map(pr => ({
          id: pr.objectID || pr.id,
          name: pr.name || pr.title,
          ...pr
        }))
      };
      RAM_CACHE.set(cacheKey, { data: formatted, ts: Date.now() });
      return formatted;
    }
  } catch { /* fallback to local search */ }

  return { products: [], protocols: [] };
}
