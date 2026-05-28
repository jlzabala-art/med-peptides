import { doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../firebase';

// Simple in-memory cache to avoid repeated Firestore reads for the same tenant
const tenantCache = {};

/**
 * Resolves a tenant by slug (e.g. from URL path /partner/:slug)
 * @param {string} slug 
 * @returns {Promise<object|null>}
 */
export async function resolveTenantBySlug(slug) {
  if (!slug) return null;
  const normalizedSlug = slug.toLowerCase().trim();
  
  if (tenantCache[normalizedSlug]) {
    return tenantCache[normalizedSlug];
  }

  try {
    const tenantsRef = collection(db, 'tenants');
    const q = query(tenantsRef, where('slug', '==', normalizedSlug));
    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
      const docSnap = querySnapshot.docs[0];
      const tenantData = { id: docSnap.id, ...docSnap.data() };
      tenantCache[normalizedSlug] = tenantData;
      return tenantData;
    }
  } catch (error) {
    console.error('[resolveTenantBySlug] Error resolving tenant:', error);
  }

  return null;
}

/**
 * Resolves a tenant by its unique document ID (e.g. from userProfile)
 * @param {string} tenantId 
 * @returns {Promise<object|null>}
 */
export async function resolveTenantById(tenantId) {
  if (!tenantId) return null;
  const cacheKey = `id_${tenantId}`;

  if (tenantCache[cacheKey]) {
    return tenantCache[cacheKey];
  }

  try {
    const docRef = doc(db, 'tenants', tenantId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const tenantData = { id: docSnap.id, ...docSnap.data() };
      tenantCache[cacheKey] = tenantData;
      // also cache by slug
      if (tenantData.slug) {
        tenantCache[tenantData.slug.toLowerCase().trim()] = tenantData;
      }
      return tenantData;
    }
  } catch (error) {
    console.error('[resolveTenantById] Error resolving tenant:', error);
  }

  return null;
}

/**
 * Helper to extract tenant slug from current path
 * Supports `/partner/:slug` or `/partners/:slug`
 * @param {string} pathname 
 * @returns {string|null}
 */
export function getTenantSlugFromPath(pathname) {
  if (!pathname) return null;
  const parts = pathname.split('/').filter(Boolean);
  if (parts.length >= 2 && (parts[0] === 'partner' || parts[0] === 'partners')) {
    return parts[1];
  }
  return null;
}
