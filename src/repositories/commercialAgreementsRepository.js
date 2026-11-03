/**
 * repositories/commercialAgreementsRepository.js
 *
 * Parametric Commercial Agreements SSOT Repository
 * Architecture Golden Rule #2:
 * 1. RAM Cache (0ms)
 * 2. localStorage Cache (30 min TTL)
 * 3. Firestore collection 'commercial_agreements'
 * 4. Resilient Static Fallback (0 Downtime)
 */

import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  query,
  where,
  limit,
  serverTimestamp
} from 'firebase/firestore';
import { db } from '../firebase.js';
import { validateAndNormalizeAgreement } from './agreementWriteGuard.js';

// ── Cache Configuration ───────────────────────────────────────────────────────
const RAM_CACHE = new Map();
const TTL_MS = 30 * 60 * 1000; // 30 minutes
const STORAGE_PREFIX = 'atlas_comm_agreement_';

// ── Fallback Defaults (Emergency / Offline) ──────────────────────────────────
export const FALLBACK_AGREEMENTS = {
  'colway-qatar': {
    id: 'colway-qatar-ryhanh',
    slug: 'colway-qatar',
    documentRef: 'DOC-QA-COL-2026-V1',
    partnerName: 'Hossam Ahmed',
    organization: 'Ryhanh Medical Company',
    territory: 'State of Qatar (Exclusive B2B)',
    tier: 'Authorized Commercial Distributor',
    pricingBasis: 'CIF Doha Port of Entry (excl. 5% local VAT)',
    title: 'COLWAY® CLINICAL HAIR CARE & TRICHOLOGY SCHEDULE',
    subtitle: 'Exclusive B2B Commercial Distribution Architecture · State of Qatar Territory',
    status: 'active',
    baseCurrency: 'PLN',
    securedDiscountPct: 18,
    orderQuantity: 80,
    pegRates: {
      QAR_USD: 3.6795,
      PLN_USD: 3.9268,
      QAR_PLN: 0.92098
    },
    pricing: {
      unitProductPricePln: 102.00,
      unitShippingPln: 19.73,
      unitTotalPln: 121.73,
      unitProductPriceUsd: 26.00,
      unitShippingUsd: 5.00,
      unitTotalUsd: 31.00,
      unitProductPriceQar: 93.94,
      unitShippingQar: 18.06,
      unitDistributorPriceQar: 112.00,
      unitRecommendedRetailQar: 187.00,
      distributorGrossMarginPerUnit: 75.00,
      distributorGrossMarginPct: 40.1,
      distributorOpexPerUnit: 28.05,
      distributorNetProfitPerUnit: 44.74,
      distributorNetProfitPct: 23.93
    },
    totals: {
      totalDistributorInvoicePln: 9738.40,
      totalDistributorInvoiceUsd: 2480.00,
      totalDistributorInvoiceQar: 8960.00,
      totalDistributorGrossProfit: 6000.00,
      totalDistributorNetProfit: 3579.25
    },
    items: [
      {
        id: 'colway-shampoo-250',
        name: 'Colway Strengthening Anti-Hair Loss Shampoo (250 mL)',
        quantity: 40,
        unitPriceQar: 112.00,
        unitPriceUsd: 31.00,
        unitPricePln: 121.73,
        actives: 'Baicapil™ 2.0%, Native Fish Tropocollagen, Micronized Diosmin, Caffeine'
      },
      {
        id: 'colway-conditioner-200',
        name: 'Colway Strengthening Hair Conditioner (200 mL)',
        quantity: 40,
        unitPriceQar: 112.00,
        unitPriceUsd: 31.00,
        unitPricePln: 121.73,
        actives: 'Baicapil™, Native Tropocollagen, Hydrolyzed Keratin, Argan Oil, D-Panthenol'
      }
    ],
    keyConditions: [
      {
        title: 'Prepayment',
        text: 'Full payment to Colway is required prior to the dispatch of any order.'
      },
      {
        title: 'Dynamic Shipping & Regional Impact',
        text: 'The shipping cost can change depending on the dimensions and weight of the shipment. The situation in the region can have an additional price impact.'
      },
      {
        title: 'Currency Exchange',
        text: 'The price is set in PLN, so any currency fluctuation risk between PLN and US$ / QAR will be assumed on your end.'
      }
    ],
    updatedAt: '2026-11-03T06:00:00Z'
  },
  '24genomics-qatar': {
    id: '24genomics-qatar-ryhanh',
    slug: '24genomics-qatar',
    documentRef: 'DOC-QA-24G-2026-V1',
    partnerName: 'Hossam Ahmed',
    organization: 'Ryhanh Medical Company',
    territory: 'State of Qatar (Exclusive B2B)',
    tier: 'Exclusive Clinical Partner',
    pricingBasis: 'Delivered Duty Paid (DDP Doha / GCC)',
    title: '24GENETICS® CLINICAL NUTRIGENOMICS & DNA INTELLIGENCE SCHEDULE',
    subtitle: 'Complete Genomic Translation & Clinical Protocol Platform · State of Qatar',
    status: 'active',
    baseCurrency: 'AED',
    securedDiscountPct: 22,
    orderQuantity: 50,
    pegRates: {
      EUR_AED: 4.40,
      EUR_QAR: 4.36,
      AED_QAR: 1.00,
      QAR_USD: 3.64,
      AED_USD: 3.6725
    },
    volumeTiers: [
      {
        id: 'tier-1',
        name: '1 Nutrition test + Ancestry Test + Kit Test',
        shortLabel: '1 Kit (Single)',
        quantity: 1,
        mediluxeCostEur: 169.00,
        costAed: 743.60,
        totalKitAed: 743.60,
        returnShippingAed: 200.00,
        totalCostAed: 943.60,
        perKitCostAed: 943.60,
        marginSalesPct: 10.0,
        marginSalesAed: 104.84,
        distributionPriceAed: 1048.44,
        distributionPriceQar: 1048.44,
        unitPriceQar: 1048.44,
        totalPriceQar: 1048.44,
        unitPriceUsd: 285.50,
        totalPriceUsd: 285.50
      },
      {
        id: 'tier-50',
        name: '50 Nutrition test + Ancestry Test + Kit Test',
        shortLabel: '50 Kits (Batch)',
        quantity: 50,
        mediluxeCostEur: 159.00,
        costAed: 699.60,
        totalKitAed: 34980.00,
        returnShippingAed: 1000.00,
        totalCostAed: 35980.00,
        perKitCostAed: 719.60,
        marginSalesPct: 10.0,
        marginSalesAed: 79.96,
        distributionPriceAed: 799.56,
        distributionPriceQar: 799.56,
        unitPriceQar: 799.56,
        totalPriceQar: 39977.78,
        unitPriceUsd: 217.75,
        totalPriceUsd: 10887.50
      },
      {
        id: 'tier-100',
        name: '100 Nutrition test + Ancestry Test + Kit Test',
        shortLabel: '100 Kits (Clinic Batch)',
        quantity: 100,
        mediluxeCostEur: 149.00,
        costAed: 655.60,
        totalKitAed: 65560.00,
        returnShippingAed: 2000.00,
        totalCostAed: 67560.00,
        perKitCostAed: 675.60,
        marginSalesPct: 10.0,
        marginSalesAed: 75.07,
        distributionPriceAed: 750.67,
        distributionPriceQar: 750.67,
        unitPriceQar: 750.67,
        totalPriceQar: 75066.67,
        unitPriceUsd: 204.43,
        totalPriceUsd: 20443.00
      }
    ],
    aiSubscription: {
      name: 'Monthly AI Subscription',
      costEur: 10.45,
      costAed: 45.98,
      marginSalesPct: 10.0,
      marginSalesAed: 5.11,
      priceAed: 51.09,
      priceQar: 51.09,
      priceEur: 11.61,
      billingPeriod: 'monthly'
    },
    items: [
      {
        id: '24g-nutrition-ancestry-kit',
        name: '1 Nutrition test + Ancestry Test + Kit Test',
        quantity: 50,
        unitPriceAed: 799.56,
        unitPriceQar: 799.56,
        unitPriceUsd: 217.75,
        actives: '700,000+ SNPs Illumina GSA Array · Saliva Buccal Swab · ISO 15189 European Core Lab'
      },
      {
        id: '24g-ai-subscription',
        name: 'Monthly Clinical AI Companion Subscription (Optional)',
        quantity: 1,
        unitPriceAed: 51.09,
        unitPriceQar: 51.09,
        unitPriceUsd: 13.90,
        actives: 'Julia AI Multimodal Video Translation + 24/7 Precision Nutrition Copilot'
      }
    ],
    keyConditions: [
      {
        title: 'European Laboratory Cost Anchor (@ 1 EUR = 4.40 AED)',
        text: 'Laboratory production cost is anchored in EUR (€149 - €169 per test based on volume tier) and converted to AED at a fixed reference rate of 1 EUR = 4.40 AED.'
      },
      {
        title: 'Prepaid Return Cold-Chain Logistics Included',
        text: 'Return shipping of biological saliva specimens to European CE-IVD Core Lab in Madrid is included (AED 200 for 1 kit, AED 1,000 for 50 kits, AED 2,000 for 100 kits).'
      },
      {
        title: 'Distributor Margin on Sales (10%)',
        text: 'Landed distribution cost includes an approved 10% margin on sales (AED 75.07 to AED 104.84 per test).'
      },
      {
        title: 'Prepayment Terms',
        text: '100% advance wire transfer payment with purchase order before laboratory kit dispatch from Europe.'
      },
      {
        title: 'Monthly AI Subscription at EUR 10.45',
        text: 'Optional recurring digital AI patient companion subscription available at EUR 10.45 (AED 45.98 cost / AED 51.09 distribution price per active monthly user).'
      }
    ],
    updatedAt: '2026-11-03T08:00:00Z'
  }
};

/**
 * Invalidate cache for a specific agreement or all.
 */
export function invalidateAgreementCache(slugOrId) {
  if (slugOrId) {
    RAM_CACHE.delete(slugOrId);
    if (typeof window !== 'undefined') {
      try {
        localStorage.removeItem(`${STORAGE_PREFIX}${slugOrId}`);
      } catch {
        // ignore
      }
    }
  } else {
    RAM_CACHE.clear();
    if (typeof window !== 'undefined') {
      try {
        Object.keys(localStorage).forEach(key => {
          if (key.startsWith(STORAGE_PREFIX)) localStorage.removeItem(key);
        });
      } catch {
        // ignore
      }
    }
  }
}

/**
 * Fetch a commercial agreement by slug or ID with multi-tier caching.
 */
export async function getCommercialAgreement(slugOrId, options = {}) {
  const { forceRefresh = false } = options;
  const normalizedKey = String(slugOrId).trim().toLowerCase();

  // 1. Layer 1: RAM Cache
  if (!forceRefresh && RAM_CACHE.has(normalizedKey)) {
    const cached = RAM_CACHE.get(normalizedKey);
    if (Date.now() - cached.timestamp < TTL_MS) {
      return cached.data;
    }
  }

  // 2. Layer 2: localStorage
  if (!forceRefresh && typeof window !== 'undefined') {
    try {
      const raw = localStorage.getItem(`${STORAGE_PREFIX}${normalizedKey}`);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Date.now() - parsed.timestamp < TTL_MS) {
          RAM_CACHE.set(normalizedKey, parsed);
          return parsed.data;
        }
      }
    } catch {
      // ignore
    }
  }

  // 3. Layer 3: Firestore
  try {
    if (db) {
      // First try by direct document ID
      const docRef = doc(db, 'commercial_agreements', normalizedKey);
      const snap = await getDoc(docRef);

      let agreementData = null;

      if (snap.exists()) {
        agreementData = { id: snap.id, ...snap.data() };
      } else {
        // Try querying by slug field
        const q = query(
          collection(db, 'commercial_agreements'),
          where('slug', '==', normalizedKey),
          limit(1)
        );
        const querySnap = await getDocs(q);
        if (!querySnap.empty) {
          const firstDoc = querySnap.docs[0];
          agreementData = { id: firstDoc.id, ...firstDoc.data() };
        }
      }

      if (agreementData) {
        const cacheEntry = { timestamp: Date.now(), data: agreementData };
        RAM_CACHE.set(normalizedKey, cacheEntry);
        if (typeof window !== 'undefined') {
          try {
            localStorage.setItem(`${STORAGE_PREFIX}${normalizedKey}`, JSON.stringify(cacheEntry));
          } catch {
            // ignore
          }
        }
        return agreementData;
      }
    }
  } catch (err) {
    console.warn(`[commercialAgreementsRepo] Firestore query failed for ${normalizedKey}:`, err.message);
  }

  // 4. Layer 4: Fallback Static Defaults
  const fallback = FALLBACK_AGREEMENTS[normalizedKey] || null;
  if (fallback) {
    const cacheEntry = { timestamp: Date.now(), data: fallback };
    RAM_CACHE.set(normalizedKey, cacheEntry);
    return fallback;
  }

  return null;
}

/**
 * Save or update a commercial agreement in Firestore and invalidate cache.
 * Validates data integrity through agreementWriteGuard before writing.
 */
export async function saveCommercialAgreement(agreement) {
  // 1. Validate and normalize payload via write guard
  const validatedPayload = validateAndNormalizeAgreement(agreement);

  const id = validatedPayload.id;
  const docRef = doc(db, 'commercial_agreements', id);

  const payload = {
    ...validatedPayload,
    updatedAt: serverTimestamp()
  };

  await setDoc(docRef, payload, { merge: true });
  invalidateAgreementCache(validatedPayload.slug);
  invalidateAgreementCache(id);

  return { id, success: true, data: validatedPayload };
}

