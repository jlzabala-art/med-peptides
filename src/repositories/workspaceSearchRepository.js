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
        ...d.data(),
        priceMarkupPercent: 0,
      }));
    } else if (type === 'clinic') {
      const snap = await getDocs(query(collection(db, 'clinics'), limit(25)));
      docs = snap.docs.map(d => ({
        id: d.id,
        name: d.data().name || d.data().legalName || d.id,
        type: 'clinic',
        priceMarkupPercent: d.data().priceMarkupPercent ?? d.data().markupPercent ?? 50,
        pricingTier: 'clinic',
        ...d.data()
      }));
    } else if (type === 'wholeseller') {
      const [snapWs, snapUsers] = await Promise.all([
        getDocs(query(collection(db, 'wholesellers'), limit(25))).catch(() => ({ docs: [] })),
        getDocs(query(collection(db, 'users'), limit(50))).catch(() => ({ docs: [] }))
      ]);

      const wsMap = new Map();

      // Seed/Default for Ruben Ruano with exact Zoho Bigin data
      wsMap.set('ruben-ruano', {
        id: 'ruben-ruano',
        name: 'Ruben Ruano',
        companyName: 'Ruben Ruano (Wholesale)',
        fullName: 'Ruben Ruano',
        displayName: 'Ruben Ruano',
        email: 'Ruben@rubenruano.com',
        phone: '+34 637316102',
        type: 'wholeseller',
        role: 'wholeseller',
        priceMarkupPercent: 30,
        markupPercent: 30,
        marginOnCost: 30,
        pricingTier: 'wholesale',
        address: 'CEI el atelier, Calle Félix Esteban guerrero 8 bajo',
        shippingAddress: 'CEI el atelier, Calle Félix Esteban guerrero 8 bajo, 30007 Murcia, Spain',
        city: 'Murcia',
        state: 'Murcia',
        zip: '30007',
        country: 'Spain',
        deliveryNotes: 'Horario de recepción: 7.30 a 15.00. Persona de mensajería: Teresa. Teléfono: 695262424',
        shippingNotes: 'Horario de recepción: 7.30 a 15.00. Persona de mensajería: Teresa. Teléfono: 695262424',
        zohoContactId: '7006116000001550028',
        biginContactId: '7006116000001550028',
      });

      // Seed/Default for Dr. Raluca Hera (Hera Medical Institute)
      wsMap.set('hera-medical-institute', {
        id: 'hera-medical-institute',
        name: 'Dr. Raluca Hera',
        companyName: 'Hera Medical Institute',
        fullName: 'Dr. med. Raluca Hera, MD PhD',
        displayName: 'Hera Medical Institute · Dr. Raluca Hera',
        email: 'office@dr-hera.com',
        secondaryEmail: 'raluca.hera@dr-hera.com',
        phone: '+40 726 714 810',
        mobile: '+41 77 416 49 29',
        landline: '+41 43 343 97 30',
        type: 'wholeseller',
        role: 'wholeseller',
        priceMarkupPercent: 20,
        markupPercent: 20,
        marginOnCost: 20,
        pricingTier: 'wholesale',
        address: 'Docenților 12A',
        shippingAddress: 'Docenților 12A, RO-011403 Bucharest, Romania',
        city: 'Bucharest',
        country: 'Romania',
        currency: 'EUR',
        secondaryAddress: 'Lochmannstrasse 2, CH-8001 Zurich, Switzerland',
        secondaryCountry: 'Switzerland',
        secondaryCity: 'Zurich',
        website: 'https://dr-hera.com',
        speciality: 'Obstetrics and Gynecology; Menopause and Longevity Medicine',
        biginContactId: '7006116000001741002',
        zohoBiginContactId: '7006116000001741002',
        zohoBiginAccountId: '7006116000001742002',
      });

      // Seed/Default for Dr. Ana Baroni
      wsMap.set('dr-ana-baroni', {
        id: 'dr-ana-baroni',
        name: 'Dr. Ana Baroni',
        companyName: 'Asia Pacific Longevity Medicine Society / Dr. Ana Baroni',
        fullName: 'Dr. Ana Baroni, MD PhD MSc',
        displayName: 'Dr. Ana Baroni · Longevity Medicine',
        email: 'dranabaroni@gmail.com',
        phone: '+34 693 76 57 65',
        mobile: '+34 693 76 57 65',
        type: 'wholeseller',
        role: 'wholeseller',
        priceMarkupPercent: 20,
        markupPercent: 20,
        marginOnCost: 20,
        pricingTier: 'wholesale',
        country: 'Spain',
        currency: 'EUR',
        website: 'https://www.linkedin.com/in/dranabaronimdphd/',
        speciality: 'Longevity Medicine, Precision Health, Regenerative Medicine, Genomics',
        biginContactId: '7006116000001708010',
        zohoBiginContactId: '7006116000001708010',
      });

      snapWs.docs.forEach(d => {
        const data = d.data();
        wsMap.set(d.id, {
          id: d.id,
          name: data.name || data.companyName || d.id,
          type: 'wholeseller',
          priceMarkupPercent: data.priceMarkupPercent ?? data.markupPercent ?? 25,
          pricingTier: 'wholesale',
          ...data,
        });
      });

      snapUsers.docs.forEach(d => {
        const data = d.data();
        const r = data.role;
        const rs = data.roles || [];
        const isWholesale = r === 'wholeseller' || r === 'wholesaler' || rs.includes('wholeseller') || rs.includes('wholesaler') || d.id === 'ruben-ruano';
        if (isWholesale) {
          const existing = wsMap.get(d.id) || {};
          wsMap.set(d.id, {
            ...existing,
            id: d.id,
            name: data.name || data.fullName || data.displayName || existing.name || d.id,
            type: 'wholeseller',
            priceMarkupPercent: data.priceMarkupPercent ?? data.markupPercent ?? existing.priceMarkupPercent ?? 30,
            pricingTier: 'wholesale',
            ...data,
          });
        }
      });

      docs = Array.from(wsMap.values());
    } else if (type === 'patient') {
      const snap = await getDocs(query(collection(db, 'users'), limit(30)));
      docs = snap.docs
        .filter(d => d.data().role === 'patient' || (d.data().roles && d.data().roles.includes('patient')))
        .map(d => ({
          id: d.id,
          name: d.data().fullName || d.data().displayName || d.data().email || d.id,
          email: d.data().email,
          type: 'patient',
          priceMarkupPercent: d.data().priceMarkupPercent ?? d.data().markupPercent ?? 100,
          pricingTier: 'retail',
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
          priceMarkupPercent: d.data().priceMarkupPercent ?? d.data().markupPercent ?? 50,
          pricingTier: 'clinic',
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
 * Persists a new default markup for an entity (Client/Wholesaler/Clinic) across Firestore and caches
 */
export async function updateRecipientDefaultMarkup(recipientId, recipientType, newMarkupPercent) {
  if (!recipientId || newMarkupPercent == null || isNaN(newMarkupPercent)) return false;
  const numMarkup = Number(newMarkupPercent);

  try {
    const { doc, setDoc, updateDoc } = await import('firebase/firestore');
    
    // 1. Update in 'users' collection if applicable
    try {
      await updateDoc(doc(db, 'users', recipientId), {
        priceMarkupPercent: numMarkup,
        marginOnCost: numMarkup,
        updatedAt: new Date().toISOString()
      });
    } catch {
      await setDoc(doc(db, 'users', recipientId), {
        priceMarkupPercent: numMarkup,
        marginOnCost: numMarkup,
        updatedAt: new Date().toISOString()
      }, { merge: true });
    }

    // 2. If wholeseller, also update in 'wholesellers' collection
    if (recipientType === 'wholeseller') {
      try {
        await updateDoc(doc(db, 'wholesellers', recipientId), {
          markupPercent: numMarkup,
          priceMarkupPercent: numMarkup,
          marginOnCost: numMarkup,
          updatedAt: new Date().toISOString()
        });
      } catch {
        await setDoc(doc(db, 'wholesellers', recipientId), {
          markupPercent: numMarkup,
          priceMarkupPercent: numMarkup,
          marginOnCost: numMarkup,
          updatedAt: new Date().toISOString()
        }, { merge: true });
      }
    }

    // 3. Clear local caches so subsequent searches get the new default
    RAM_CACHE.delete(`recent_${recipientType}`);
    if (typeof window !== 'undefined') {
      localStorage.removeItem(`${STORAGE_PREFIX}recent_${recipientType}`);
    }

    return true;
  } catch (err) {
    console.error('Failed to update recipient default markup:', err);
    return false;
  }
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
