/**
 * GET /api/suppliers/stats
 *
 * Server-side aggregation: counts products and variants per supplier.
 * Fast embedded-first resolution with in-memory caching and strict ID sanitization.
 */

import { NextResponse } from 'next/server';
import { adminDb } from '../../../../lib/firebaseAdmin';

// In-memory cache
let inMemoryStatsCache = null;
let inMemoryCacheTime = 0;
const CACHE_TTL_MS = 10 * 60 * 1000; // 10 minutes

export const dynamic = 'force-dynamic';

function sanitizeSupplierId(val) {
  if (!val) return null;
  if (typeof val === 'string') {
    const trimmed = val.trim();
    if (!trimmed || trimmed === 'unknown' || trimmed === 'undefined' || trimmed === 'null' || trimmed === '[object Object]') {
      return null;
    }
    return trimmed;
  }
  if (typeof val === 'object' && val !== null) {
    return sanitizeSupplierId(val.id || val.supplierId || val.value);
  }
  return null;
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const forceRefresh = searchParams.get('refresh') === '1';

    // 1. Check in-memory cache
    if (!forceRefresh && inMemoryStatsCache && (Date.now() - inMemoryCacheTime < CACHE_TTL_MS)) {
      return NextResponse.json({ stats: inMemoryStatsCache, source: 'memory-cache' });
    }

    if (!adminDb) {
      throw new Error('Database connection unavailable');
    }

    // 2. Load all supplier docs
    const suppliersSnap = await adminDb.collection('suppliers').get();
    const suppliers = suppliersSnap.docs.map(d => ({ id: d.id, ...d.data() }));

    // 3. Compute stats across products (Embedded-First Strategy)
    const supplierMap = {};
    const ensureEntry = (sid) => {
      if (!supplierMap[sid]) {
        supplierMap[sid] = { productIds: new Set(), variantCount: 0, categories: new Set() };
      }
    };

    const productsSnap = await adminDb.collection('products').get();

    for (const productDoc of productsSnap.docs) {
      const data = productDoc.data();
      const productId = productDoc.id;
      const cat = data.category || data.category_main || data.categoryId || '';

      let hasEmbeddedVariants = false;

      // Scan embedded variants if present
      if (Array.isArray(data.variants) && data.variants.length > 0) {
        hasEmbeddedVariants = true;
        for (const v of data.variants) {
          const sid = sanitizeSupplierId(v.supplierId || v.supplier || v.supplier_id);
          if (sid) {
            ensureEntry(sid);
            supplierMap[sid].productIds.add(productId);
            supplierMap[sid].variantCount += 1;
            if (cat) supplierMap[sid].categories.add(cat);
          }
        }
      }

      // If no embedded variants, count product from top-level supplier fields
      if (!hasEmbeddedVariants) {
        const avail = Array.isArray(data.availableSuppliers) ? data.availableSuppliers : (Array.isArray(data.supplierIds) ? data.supplierIds : []);
        for (const rawSid of avail) {
          const sid = sanitizeSupplierId(rawSid);
          if (sid) {
            ensureEntry(sid);
            supplierMap[sid].productIds.add(productId);
            if (cat) supplierMap[sid].categories.add(cat);
          }
        }

        const topSupplier = sanitizeSupplierId(data.supplierId || data.supplier);
        if (topSupplier) {
          ensureEntry(topSupplier);
          supplierMap[topSupplier].productIds.add(productId);
          if (cat) supplierMap[topSupplier].categories.add(cat);
        }
      }
    }

    const now = new Date().toISOString();

    // Collect all valid, non-empty string supplier IDs
    const validSupplierIds = new Set();
    suppliers.forEach(s => {
      const clean = sanitizeSupplierId(s.id);
      if (clean) validSupplierIds.add(clean);
    });
    Object.keys(supplierMap).forEach(k => {
      const clean = sanitizeSupplierId(k);
      if (clean) validSupplierIds.add(clean);
    });

    const result = Array.from(validSupplierIds).map(supplierId => {
      const stats = supplierMap[supplierId];
      return {
        id: supplierId,
        productsSupplied: stats ? stats.productIds.size : 0,
        variantsSupplied: stats ? stats.variantCount : 0,
        productCategories: stats ? Array.from(stats.categories).sort() : []
      };
    });

    // Update in-memory cache
    inMemoryStatsCache = result;
    inMemoryCacheTime = Date.now();

    return NextResponse.json({ stats: result, source: 'computed', computedAt: now }, {
      headers: {
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=900',
        'X-Cache': 'COMPUTED'
      }
    });
  } catch (error) {
    console.warn('GET /api/suppliers/stats graceful error handling:', error.message);
    if (inMemoryStatsCache) {
      return NextResponse.json({ stats: inMemoryStatsCache, source: 'stale-cache', warning: error.message }, { status: 200 });
    }
    return NextResponse.json({ stats: [], source: 'fallback', warning: error.message }, { status: 200 });
  }
}
