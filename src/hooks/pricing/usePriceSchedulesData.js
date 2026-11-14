'use client';

import { useState, useEffect, useCallback } from 'react';
import { doc, setDoc, collection, query, where, limit, getDocs } from 'firebase/firestore';
import { db } from '@/firebase';
import {
  FlaskConical, Dna, Scissors, Package, Layers, TestTube,
  Activity, Microscope, Sparkles, Building2
} from 'lucide-react';

/**
 * Static baseline metadata for 13 schedules.
 * Icons, standard routes and default fallback formulas.
 */
export const BASELINE_PRICE_SCHEDULES = [
  {
    id: 'peptides',
    label: 'Peptides',
    icon: FlaskConical,
    badge: '127 SKUs',
    supplier: 'NP Labs',
    description: 'Lyophilized bioactive peptides · HPLC ≥99% · Sterile analytical vials',
    pricingNote: 'Cost + 15% Atlas + 15% Wholesaler',
    route: '/pricing/peptides',
    skuCount: 127,
    currency: 'USD',
    fetchGroup: 'peptides',
    status: 'active',
    sharesCount: 38,
    recipients: [
      { name: 'Dr. Sajid Burud', organization: 'Transcend Healthcare (Dubai)', role: 'clinic', channel: 'whatsapp', date: '12 Nov 2026', views: 7, status: 'opened' },
      { name: 'Nikolaos Psathas', organization: 'NP Labs (Athens / EU)', role: 'wholesaler', channel: 'web', date: '04 Nov 2026', views: 14, status: 'opened' },
      { name: 'Dr. Carlos Mendez', organization: 'Longevity Clinic Madrid', role: 'doctor', channel: 'whatsapp', date: '28 Oct 2026', views: 3, status: 'opened' },
      { name: 'Hossam Ahmed', organization: 'Ryhanh Medical Company (Qatar)', role: 'wholesaler', channel: 'email', date: '22 Oct 2026', views: 9, status: 'opened' },
      { name: 'Atlas Partner Clinic Marbella', organization: 'Precision Medicine Group', role: 'clinic', channel: 'web', date: '15 Oct 2026', views: 5, status: 'opened' }
    ]
  },
  {
    id: '24genetics',
    label: '24Genetics',
    icon: Dna,
    badge: '12 Kits',
    supplier: '24Genetics S.L.',
    description: 'CE-IVD saliva genomic panels + AI Connect subscriptions',
    pricingNote: 'Role-based: Retail / Clinic / Wholesale',
    route: '/pricing/24genetics',
    skuCount: 12,
    currency: 'EUR',
    fetchGroup: 'genomics',
    status: 'active',
    sharesCount: 29,
    recipients: [
      { name: 'Dr. Sajid Burud', organization: 'Transcend Healthcare (Dubai)', role: 'clinic', channel: 'whatsapp', date: '11 Nov 2026', views: 8, status: 'opened' },
      { name: 'Hossam Ahmed', organization: 'Ryhanh Medical Company (Doha)', role: 'wholesaler', channel: 'web', date: '05 Nov 2026', views: 12, status: 'opened' },
      { name: 'Dr. Elena Ramos', organization: 'Atlas Partner Clinic Marbella', role: 'doctor', channel: 'whatsapp', date: '30 Oct 2026', views: 4, status: 'opened' },
      { name: 'Genomic Laboratories UAE', organization: 'Al Zahra Medical', role: 'clinic', channel: 'email', date: '18 Oct 2026', views: 5, status: 'opened' }
    ]
  },
  {
    id: 'colway',
    label: 'Colway',
    icon: Package,
    badge: '8 Products',
    supplier: 'Colway International',
    description: 'Biologically active native collagen — complete dermatology portfolio',
    pricingNote: 'Cost + 20% Wholesale / 30% Clinic',
    route: '/pricing/colway',
    skuCount: 8,
    currency: 'EUR',
    fetchGroup: 'colway',
    status: 'active',
    sharesCount: 22,
    recipients: [
      { name: 'Hossam Ahmed', organization: 'Ryhanh Medical Company (Qatar)', role: 'wholesaler', channel: 'whatsapp', date: '10 Nov 2026', views: 6, status: 'opened' },
      { name: 'Dr. Carmen Valls', organization: 'Barcelona Dermatology Institute', role: 'clinic', channel: 'web', date: '02 Nov 2026', views: 11, status: 'opened' },
      { name: 'Dr. Sajid Burud', organization: 'Transcend Healthcare', role: 'clinic', channel: 'whatsapp', date: '25 Oct 2026', views: 5, status: 'opened' }
    ]
  },
  {
    id: 'colway-hair',
    label: 'Colway Hair',
    icon: Scissors,
    badge: 'Trichology',
    supplier: 'Colway International',
    description: 'Baicapil™ 2% shampoo + conditioner — anti-hair-loss follicular protocol',
    pricingNote: 'Cost + 20% Wholesale / 30% Clinic',
    route: '/pricing/colway-hair',
    skuCount: 2,
    currency: 'EUR',
    fetchGroup: 'colway-hair',
    status: 'active',
    sharesCount: 17,
    recipients: [
      { name: 'Hossam Ahmed', organization: 'Ryhanh Medical Company (Qatar)', role: 'wholesaler', channel: 'whatsapp', date: '08 Nov 2026', views: 9, status: 'opened' },
      { name: 'Svenson Capillary Clinic', organization: 'Svenson Medical Madrid', role: 'clinic', channel: 'web', date: '01 Nov 2026', views: 4, status: 'opened' },
      { name: 'Dr. Alejandro Ruiz', organization: 'Trichology Center Valencia', role: 'doctor', channel: 'email', date: '20 Oct 2026', views: 4, status: 'opened' }
    ]
  },
  {
    id: 'colway-qatar',
    label: 'Colway Qatar',
    icon: Building2,
    badge: 'AED / QAR',
    supplier: 'Colway International',
    description: 'Qatar & GCC distributor pricing (AED/QAR)',
    pricingNote: 'Exclusive landed-cost schedule (112 QAR / unit)',
    route: '/pricing/colway-qatar',
    skuCount: 2,
    currency: 'AED',
    fetchGroup: 'colway-qatar',
    status: 'active',
    sharesCount: 14,
    recipients: [
      { name: 'Hossam Ahmed', organization: 'Ryhanh Medical Company · Ryhanh Group (Doha)', role: 'wholesaler', channel: 'whatsapp', date: '12 Nov 2026', views: 16, status: 'opened' },
      { name: 'Dr. Sajid Burud', organization: 'Transcend Healthcare', role: 'clinic', channel: 'web', date: '06 Nov 2026', views: 7, status: 'opened' }
    ]
  },
  {
    id: '24genomics-qatar',
    label: 'Genomics Qatar',
    icon: Dna,
    badge: 'GCC / AED',
    supplier: '24Genetics S.L.',
    description: 'Qatar & GCC genomics distributor pricing (Nutrigen + All-in-One)',
    pricingNote: 'Distributor-tier with GCC landing',
    route: '/pricing/24genomics-qatar',
    skuCount: 3,
    currency: 'AED',
    fetchGroup: '24genomics-qatar',
    status: 'active',
    sharesCount: 16,
    recipients: [
      { name: 'Hossam Ahmed', organization: 'Ryhanh Medical Company · Ryhanh Group (Doha)', role: 'wholesaler', channel: 'whatsapp', date: '12 Nov 2026', views: 18, status: 'opened' },
      { name: 'Dr. Sajid Burud', organization: 'Transcend Healthcare (Dubai & Doha)', role: 'clinic', channel: 'web', date: '09 Nov 2026', views: 9, status: 'opened' }
    ]
  },
  {
    id: 'bloodo',
    label: 'Bloodo DBS',
    icon: TestTube,
    badge: 'Diagnostics',
    supplier: 'Bloodo Lab',
    description: 'Dried Blood Spot diagnostic kits — capillary remote sampling',
    pricingNote: 'Fixed lab price + Atlas margin',
    route: '/collection/bloodo',
    skuCount: 6,
    currency: 'EUR',
    fetchGroup: 'bloodo',
    status: 'active',
    sharesCount: 9,
    recipients: [
      { name: 'Dr. Carlos Mendez', organization: 'Longevity Clinic Madrid', role: 'doctor', channel: 'whatsapp', date: '04 Nov 2026', views: 3, status: 'opened' },
      { name: 'Dr. Sajid Burud', organization: 'Transcend Healthcare', role: 'clinic', channel: 'web', date: '26 Oct 2026', views: 6, status: 'opened' }
    ]
  },
  {
    id: 'ultraperson',
    label: 'UltraPerson',
    icon: Sparkles,
    badge: 'Supplements',
    supplier: 'UltraPerson / NP Labs',
    description: 'Precision nutraceutical supplements — clinical-grade',
    pricingNote: 'Cost + 15% Atlas + 15% Wholesaler',
    route: '/collection/ultraperson',
    skuCount: 5,
    currency: 'EUR',
    fetchGroup: 'ultraperson',
    status: 'active',
    sharesCount: 11,
    recipients: [
      { name: 'Dr. Sajid Burud', organization: 'Transcend Healthcare', role: 'clinic', channel: 'whatsapp', date: '07 Nov 2026', views: 4, status: 'opened' },
      { name: 'Nikolaos Psathas', organization: 'NP Labs (Athens)', role: 'wholesaler', channel: 'web', date: '29 Oct 2026', views: 7, status: 'opened' }
    ]
  },
  {
    id: 'weight-management',
    label: 'Weight Mgmt',
    icon: Activity,
    badge: 'Incretins + GLP',
    supplier: 'NP Labs / Compounding',
    description: 'GLP-1 analogues, incretins, and metabolic weight optimization compounds',
    pricingNote: 'Cost + 15% Atlas + 15% Wholesaler',
    route: '/collection/weight-management',
    skuCount: 9,
    currency: 'EUR',
    fetchGroup: 'weight-management',
    status: 'active',
    sharesCount: 25,
    recipients: [
      { name: 'Dr. Sajid Burud', organization: 'Transcend Healthcare (Dubai)', role: 'clinic', channel: 'whatsapp', date: '11 Nov 2026', views: 12, status: 'opened' },
      { name: 'Dr. Carlos Mendez', organization: 'Longevity Clinic Madrid', role: 'doctor', channel: 'web', date: '03 Nov 2026', views: 8, status: 'opened' },
      { name: 'Antiaging Barcelona Clinic', organization: 'Antiaging Medical Group', role: 'clinic', channel: 'email', date: '27 Oct 2026', views: 5, status: 'opened' }
    ]
  },
  {
    id: 'hair-treatments',
    label: 'Hair Protocol',
    icon: Scissors,
    badge: 'Trichology Bundle',
    supplier: 'NP Labs + Colway',
    description: 'GHK-Cu, tricho compounds, and Colway hair protocol synergy',
    pricingNote: 'Mixed: peptide rate + Colway rate',
    route: '/collection/hair-treatments',
    skuCount: 7,
    currency: 'EUR',
    fetchGroup: 'hair-treatments',
    status: 'active',
    sharesCount: 13,
    recipients: [
      { name: 'Svenson Hair Clinic', organization: 'Svenson Medical', role: 'clinic', channel: 'whatsapp', date: '05 Nov 2026', views: 6, status: 'opened' },
      { name: 'Hossam Ahmed', organization: 'Ryhanh Medical Company', role: 'wholesaler', channel: 'web', date: '28 Oct 2026', views: 7, status: 'opened' }
    ]
  },
  {
    id: 'teletest',
    label: 'TeleTest',
    icon: Microscope,
    badge: 'HLA + HTMA',
    supplier: 'TeleTest Diagnostics',
    description: 'HLA celiac immunogenetics and Hair Tissue Mineral Analysis kits',
    pricingNote: 'Fixed laboratory rate',
    route: '/collection/teletest',
    skuCount: 2,
    currency: 'EUR',
    fetchGroup: 'teletest',
    status: 'active',
    sharesCount: 8,
    recipients: [
      { name: 'Dr. Carlos Mendez', organization: 'Longevity Clinic Madrid', role: 'doctor', channel: 'whatsapp', date: '02 Nov 2026', views: 3, status: 'opened' },
      { name: 'Transcend Healthcare', organization: 'Transcend Healthcare', role: 'clinic', channel: 'web', date: '21 Oct 2026', views: 5, status: 'opened' }
    ]
  },
  {
    id: 'eterna',
    label: 'ETERNA',
    icon: Layers,
    badge: 'Multi-Omics',
    supplier: 'ETERNA Genomics',
    description: 'Multi-omics longevity panels — epigenetics + proteomics',
    pricingNote: 'Fixed rate — lab-direct pricing',
    route: '/collection/eterna',
    skuCount: 3,
    currency: 'EUR',
    fetchGroup: 'eterna',
    status: 'active',
    sharesCount: 7,
    recipients: [
      { name: 'Dr. Sajid Burud', organization: 'Transcend Healthcare (Dubai)', role: 'clinic', channel: 'whatsapp', date: '09 Nov 2026', views: 4, status: 'opened' },
      { name: 'Atlas Partner Clinic Marbella', organization: 'Precision Medicine Group', role: 'clinic', channel: 'web', date: '19 Oct 2026', views: 3, status: 'opened' }
    ]
  },
  {
    id: 'aesthetic-injectables',
    label: 'Injectables',
    icon: Sparkles,
    badge: '40 SKUs · Dubai',
    supplier: 'Dubai Aesthetics Direct (Allergan · Teoxane · Galderma · Merz · Neauvia · Croma)',
    description: 'Dermal fillers, skin quality injectables, PLLA & CaHA biostimulators, polynucleotides & Aqualyx',
    pricingNote: 'Cost + 15% Atlas + 15% Wholesaler (×1.3225)',
    route: '/collection/aesthetic-injectables',
    skuCount: 40,
    currency: 'EUR',
    fetchGroup: 'dermal-fillers',
    status: 'active',
    sharesCount: 31,
    recipients: [
      { name: 'Dr. Sajid Burud', organization: 'Transcend Healthcare (Dubai)', role: 'clinic', channel: 'whatsapp', date: '12 Nov 2026', views: 11, status: 'opened' },
      { name: 'Dr. Carmen Valls', organization: 'Diagonal Aesthetic Clinic Barcelona', role: 'clinic', channel: 'web', date: '07 Nov 2026', views: 9, status: 'opened' },
      { name: 'Dr. Carlos Mendez', organization: 'Longevity Clinic Madrid', role: 'doctor', channel: 'whatsapp', date: '31 Oct 2026', views: 6, status: 'opened' },
      { name: 'Dr. Elena Ramos', organization: 'Atlas Partner Clinic Marbella', role: 'doctor', channel: 'email', date: '24 Oct 2026', views: 5, status: 'opened' }
    ]
  }
];

export const TOTAL_SKUS = BASELINE_PRICE_SCHEDULES.reduce((s, g) => s + g.skuCount, 0);

export const MACRO_CATEGORIES = [
  { id: 'all', label: 'All Catalogs (13)' },
  { id: 'peptides', label: '🔬 Peptides & Longevity', groupIds: ['peptides', 'ultraperson', 'weight-management', 'hair-treatments'] },
  { id: 'genomics', label: '🧬 Genomics CE-IVD', groupIds: ['24genetics', '24genomics-qatar', 'teletest', 'eterna'] },
  { id: 'cosmetics', label: '✨ Cosmetics & Collagen', groupIds: ['colway', 'colway-hair', 'colway-qatar'] },
  { id: 'injectables', label: '💉 Medical Injectables', groupIds: ['aesthetic-injectables'] },
  { id: 'diagnostics', label: '🩸 DBS Diagnostics', groupIds: ['bloodo', 'teletest'] },
];

// 4-Layer Caching (Golden Rule #2)
let memoryCacheSchedules = null;
let memoryCacheTimestamp = 0;
const CACHE_TTL_MS = 30 * 60 * 1000; // 30 minutes
const LOCAL_STORAGE_KEY = 'atlas_price_schedules_cache_v2';

export function invalidatePriceSchedulesCache() {
  memoryCacheSchedules = null;
  memoryCacheTimestamp = 0;
  if (typeof window !== 'undefined') {
    try {
      localStorage.removeItem(LOCAL_STORAGE_KEY);
    } catch (_) {}
  }
}

export function usePriceSchedulesData() {
  const [schedules, setSchedules] = useState(BASELINE_PRICE_SCHEDULES);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async (forceRefresh = false) => {
    const now = Date.now();

    // Layer 1: Memory cache
    if (!forceRefresh && memoryCacheSchedules && (now - memoryCacheTimestamp < CACHE_TTL_MS)) {
      setSchedules(memoryCacheSchedules);
      setLoading(false);
      return;
    }

    // Layer 2: localStorage cache
    if (!forceRefresh && typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
        if (stored) {
          const parsed = JSON.parse(stored);
          if (parsed && parsed.timestamp && (now - parsed.timestamp < CACHE_TTL_MS)) {
            // Restore icon references from BASELINE
            const merged = parsed.data.map(item => {
              const baseline = BASELINE_PRICE_SCHEDULES.find(b => b.id === item.id);
              return { ...item, icon: baseline ? baseline.icon : Package };
            });
            memoryCacheSchedules = merged;
            memoryCacheTimestamp = parsed.timestamp;
            setSchedules(merged);
            setLoading(false);
            return;
          }
        }
      } catch (_) {}
    }

    // Layer 3 / 4: Live Firestore SSOT Sync
    try {
      setLoading(true);
      // Fetch dynamic share counts or catalog facets from API if available
      const res = await fetch('/api/catalog/summary', { cache: 'no-store' }).catch(() => null);
      let updatedSchedules = BASELINE_PRICE_SCHEDULES;

      if (res && res.ok) {
        const data = await res.json().catch(() => null);
        if (data && data.catalogs) {
          updatedSchedules = BASELINE_PRICE_SCHEDULES.map(base => {
            const remote = data.catalogs.find(c => c.id === base.id);
            if (!remote) return base;
            return {
              ...base,
              skuCount: remote.skuCount || base.skuCount,
              sharesCount: remote.sharesCount || base.sharesCount
            };
          });
        }
      }

      memoryCacheSchedules = updatedSchedules;
      memoryCacheTimestamp = now;
      if (typeof window !== 'undefined') {
        try {
          const serializable = updatedSchedules.map(({ icon, ...rest }) => rest);
          localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify({ data: serializable, timestamp: now }));
        } catch (_) {}
      }

      setSchedules(updatedSchedules);
    } catch (_) {
      setSchedules(BASELINE_PRICE_SCHEDULES);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  return {
    schedules,
    loading,
    refresh: () => loadData(true),
    invalidate: invalidatePriceSchedulesCache
  };
}

// ─── Per-Catalog 4-Layer Product Repository (Golden Rule #2) ──────────────────

const memoryProductsCache = {};
const PRODUCT_CACHE_PREFIX = 'atlas_schedule_products_v1_';

export function invalidateGroupProductsCache(groupId) {
  if (groupId) {
    delete memoryProductsCache[groupId];
    if (typeof window !== 'undefined') {
      try {
        localStorage.removeItem(`${PRODUCT_CACHE_PREFIX}${groupId}`);
      } catch (_) {}
    }
  } else {
    Object.keys(memoryProductsCache).forEach((k) => delete memoryProductsCache[k]);
  }
}

export async function fetchGroupProductsWithCache(groupId, fetchGroup, { forceRefresh = false, isAdmin = false } = {}) {
  const now = Date.now();
  const cacheKey = `${groupId}_${isAdmin ? 'admin' : 'public'}`;

  // Layer 1: Memory RAM
  if (!forceRefresh && memoryProductsCache[cacheKey] && (now - memoryProductsCache[cacheKey].ts < CACHE_TTL_MS)) {
    return memoryProductsCache[cacheKey].data;
  }

  // Layer 2: localStorage
  if (!forceRefresh && typeof window !== 'undefined') {
    try {
      const raw = localStorage.getItem(`${PRODUCT_CACHE_PREFIX}${cacheKey}`);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed?.ts && (now - parsed.ts < CACHE_TTL_MS) && Array.isArray(parsed.data)) {
          memoryProductsCache[cacheKey] = { data: parsed.data, ts: parsed.ts };
          return parsed.data;
        }
      }
    } catch (_) {}
  }

  let products = [];

  // Layer 3/4: Firestore (SSOT) for Admin or Public API
  try {
    if (isAdmin && db && fetchGroup) {
      const q = query(
        collection(db, 'products'),
        where('categoryId', '==', fetchGroup),
        limit(100)
      );
      const snap = await getDocs(q);
      if (!snap.empty) {
        products = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      }
    }

    if (products.length === 0 && fetchGroup) {
      const res = await fetch(`/api/catalog/public?category=${encodeURIComponent(fetchGroup)}&limit=100`);
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data.products) && data.products.length > 0) {
          products = data.products;
        }
      }
    }
  } catch (_) {}

  // Emergency Fallback (only if Firestore has no seeded docs for aesthetic-injectables)
  if (products.length === 0 && groupId === 'aesthetic-injectables') {
    try {
      const mod = await import('@/data/aestheticInjectablesRegistry');
      products = mod.getAestheticInjectablesCatalog() || [];
    } catch (_) {
      products = [];
    }
  }

  memoryProductsCache[cacheKey] = { data: products, ts: now };
  if (typeof window !== 'undefined' && products.length > 0) {
    try {
      localStorage.setItem(`${PRODUCT_CACHE_PREFIX}${cacheKey}`, JSON.stringify({ data: products, ts: now }));
    } catch (_) {}
  }

  return products;
}

export async function updateScheduleProductCost(product, newCost, groupId) {
  if (!db || !product?.id) throw new Error('Database or product ID unavailable');
  const numericCost = Number(newCost);
  if (Number.isNaN(numericCost) || numericCost <= 0) throw new Error('Invalid cost amount');

  const mediluxePrice = +(numericCost * 1.15).toFixed(2);
  const wholesalePrice = +(numericCost * 1.3225).toFixed(2);
  const clinicPrice = +(numericCost * 1.45).toFixed(2);
  const currency = product.currency || product.pricing?.currency || 'EUR';

  const pricingPayload = {
    ...(product.pricing || {}),
    masterPrice: numericCost,
    mediluxePrice,
    wholesalePrice,
    clinicPrice,
    currency
  };

  await setDoc(doc(db, 'products', product.id), {
    id: product.id,
    name: product.name || product.canonicalName || product.id,
    canonicalName: product.canonicalName || product.name || product.id,
    categoryId: product.categoryId || (groupId === 'aesthetic-injectables' ? 'dermal-fillers' : groupId),
    brand: product.brand || null,
    manufacturer: product.manufacturer || null,
    packSize: product.packSize || null,
    subcategory: product.subcategory || null,
    technology: product.technology || null,
    indication: product.indication || null,
    requiresColdChain: Boolean(product.requiresColdChain),
    inStock: product.inStock ?? true,
    status: product.status || 'published',
    cost: numericCost,
    wholesalePrice,
    clinicPrice,
    currency,
    pricing: pricingPayload,
    updatedAt: new Date().toISOString()
  }, { merge: true });

  invalidateGroupProductsCache(`${groupId}_admin`);
  invalidateGroupProductsCache(`${groupId}_public`);
  return { cost: numericCost, pricing: pricingPayload };
}

export async function updateScheduleProductStock(product, inStock, groupId) {
  if (!db || !product?.id) throw new Error('Database or product ID unavailable');
  await setDoc(doc(db, 'products', product.id), {
    id: product.id,
    name: product.name || product.canonicalName || product.id,
    categoryId: product.categoryId || (groupId === 'aesthetic-injectables' ? 'dermal-fillers' : groupId),
    inStock: Boolean(inStock),
    status: inStock ? 'published' : 'draft',
    updatedAt: new Date().toISOString()
  }, { merge: true });

  invalidateGroupProductsCache(`${groupId}_admin`);
  invalidateGroupProductsCache(`${groupId}_public`);
  return Boolean(inStock);
}
