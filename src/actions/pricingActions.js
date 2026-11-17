'use server';

import { revalidatePath } from 'next/cache';
import { adminDb } from '@/lib/firebaseAdmin';

function isComboProduct(p) {
  const id = String(p.id || '').toLowerCase();
  const name = String(p.name || p.title || '').toLowerCase();
  const cat = String(p.category || '').toLowerCase();
  return (
    p.isCombo === true ||
    p.isBundle === true ||
    id.startsWith('bundle-') ||
    id.includes('combo') ||
    name.includes('ritual') ||
    name.includes('bundle') ||
    name.includes('combo') ||
    name.includes('set ') ||
    cat.includes('bundle') ||
    cat.includes('combo')
  );
}

function normalizeProductDoc(id, d, fallback = {}) {
  const pricingUae = d.pricing_uae || {};
  const derivedAedFromEur = d.costPriceEur ? Number((Number(d.costPriceEur) * 3.98).toFixed(4)) : 0;
  const landedCostAed = Number(
    d.landedCostAed ?? pricingUae.landedCostAed ?? d.cost ?? (derivedAedFromEur || fallback.landedCostAed || 0)
  );
  return {
    ...fallback,
    id,
    slug: d.slug || fallback.slug || id,
    itemNumber: d.itemNumber ?? fallback.itemNumber ?? null,
    name: d.name || d.title || fallback.name || id,
    subtitle: d.subtitle || fallback.subtitle || '',
    brand: d.brand || fallback.brand || '',
    supplierId: d.supplierId || fallback.supplierId || '',
    supplierName: d.supplierName || fallback.supplierName || '',
    sku: d.variants?.[0]?.sku || d.sku || fallback.sku || id.toUpperCase(),
    packSize: d.packSize || fallback.packSize || '',
    volume: d.volume || d.size || fallback.volume || '',
    presentation: d.presentation || fallback.presentation || '',
    category: d.category || fallback.category || 'Dermocosmetics',
    subTrack: d.subTrack || fallback.subTrack || '',
    keyActives: d.key_actives_summary || d.keyActives || fallback.keyActives || '',
    clinicalFocus: d.clinical_focus_dossier || d.clinicalFocus || fallback.clinicalFocus || '',
    applicationTip: d.application_tip || d.applicationTip || fallback.applicationTip || '',
    costPriceEur: Number(d.costPriceEur ?? fallback.costPriceEur ?? 0),
    minPriceEur: Number(d.minPriceEur ?? d.costPriceEur ?? fallback.minPriceEur ?? 0),
    maxPriceEur: Number(d.maxPriceEur ?? d.costPriceEur ?? fallback.maxPriceEur ?? 0),
    strengthTiers: d.strengthTiers || fallback.strengthTiers || null,
    allStrengths: Array.isArray(d.allStrengths) ? d.allStrengths : fallback.allStrengths || [],
    landedCostAed,
    wholesalePriceAed: Number(
      d.wholesalePriceAed ??
        pricingUae.wholesalePriceAed ??
        d.wholesale_price ??
        fallback.wholesalePriceAed ??
        Number((landedCostAed * 1.15).toFixed(2))
    ),
    clinicPriceAed: Number(
      d.clinicPriceAed ?? pricingUae.clinicPriceAed ?? fallback.clinicPriceAed ?? Number((landedCostAed * 1.3225).toFixed(2))
    ),
    retailPriceAed: Number(
      d.retailPriceAed ?? pricingUae.retailPriceAed ?? d.price ?? fallback.retailPriceAed ?? Number((landedCostAed * 1.55).toFixed(2))
    ),
    variants: Array.isArray(d.variants) ? d.variants : fallback.variants || [],
    image: d.heroImage || d.imageUrl || d.image || fallback.image || '',
    stockStatus: d.stockStatus || fallback.stockStatus || 'In Stock (EU / International)',
  };
}

export async function fetchBrandPricingProductsAction({
  brand = 'colway',
  fallbackProducts = [],
  excludeCombos = true,
  limitCount = 100,
} = {}) {
  const fallbackMap = new Map(fallbackProducts.map((p) => [p.id, p]));
  let products = [...fallbackProducts];
  const safeLimit = Math.min(Math.max(Number(limitCount) || 100, 1), 500);

  if (adminDb) {
    try {
      const brandLower = String(brand || '').toLowerCase();
      const [byBrandSnap, fallbackSnaps] = await Promise.all([
        adminDb
          .collection('products')
          .where('brand', '==', brandLower)
          .limit(safeLimit)
          .get(),
        fallbackProducts.length > 0
          ? Promise.all(
              fallbackProducts.map((p) => adminDb.collection('products').doc(p.id).get())
            )
          : Promise.resolve([]),
      ]);

      const mergedMap = new Map();

      // 1. Seed with fallback docs merged with direct Firestore doc reads
      fallbackSnaps.forEach((docSnap, index) => {
        const fb = fallbackProducts[index];
        if (docSnap.exists) {
          mergedMap.set(docSnap.id, normalizeProductDoc(docSnap.id, docSnap.data(), fb));
        } else {
          mergedMap.set(fb.id, fb);
        }
      });

      // 2. Include any additional Firestore products matching brand == brandLower
      byBrandSnap.forEach((docSnap) => {
        if (!mergedMap.has(docSnap.id)) {
          const fb = fallbackMap.get(docSnap.id) || {};
          mergedMap.set(docSnap.id, normalizeProductDoc(docSnap.id, docSnap.data(), fb));
        }
      });

      if (mergedMap.size > 0) {
        products = Array.from(mergedMap.values());
      }
    } catch (err) {
      console.warn(
        `[pricingActions] Firestore read error for brand=${brand}, using fallback:`,
        err.message
      );
    }
  }

  return excludeCombos ? products.filter((p) => !isComboProduct(p)) : products;
}

export async function updateProductSchedulePriceAction({ productId, pricingPatch }) {
  if (!productId || !pricingPatch || typeof pricingPatch !== 'object') {
    return { ok: false, error: 'Missing productId or pricingPatch' };
  }
  if (!adminDb) {
    return { ok: false, error: 'Firebase Admin not initialized' };
  }

  const allowedKeys = [
    'landedCostAed',
    'wholesalePriceAed',
    'clinicPriceAed',
    'retailPriceAed',
  ];
  const cleanPatch = {};
  const nestedUaePatch = {};

  for (const key of allowedKeys) {
    if (pricingPatch[key] != null && !Number.isNaN(Number(pricingPatch[key]))) {
      const val = Number(Number(pricingPatch[key]).toFixed(2));
      cleanPatch[key] = val;
      nestedUaePatch[`pricing_uae.${key}`] = val;
    }
  }

  if (Object.keys(cleanPatch).length === 0) {
    return { ok: false, error: 'No valid numeric pricing fields provided' };
  }

  try {
    await adminDb
      .collection('products')
      .doc(productId)
      .set(
        {
          ...cleanPatch,
          ...nestedUaePatch,
          updatedAt: new Date().toISOString(),
        },
        { merge: true }
      );

    revalidatePath('/pricing/colway');
    revalidatePath('/pricing/colway-hair');
    return { ok: true, updated: cleanPatch };
  } catch (err) {
    console.error('[pricingActions] updateProductSchedulePriceAction error:', err);
    return { ok: false, error: err.message };
  }
}
