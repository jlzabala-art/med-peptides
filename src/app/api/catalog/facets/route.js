import { NextResponse } from 'next/server';
import { adminDb } from '../../../../lib/firebaseAdmin';

export const dynamic = 'force-dynamic';

/**
 * GET /api/catalog/facets
 *
 * Sirve categorías, goals, formatos y suppliers con sus conteos.
 * Estrategia de caching en capas (más rápido → más lento):
 *
 *   Capa 1 — RAM cache (TTL 5 min): 0ms, sin red
 *   Capa 2 — _meta/catalog_facets (1 lectura Firestore): ~5ms
 *   Capa 3 — Fallback full-scan (solo si _meta no existe): ~2s
 *
 * Los Cloud Functions triggers mantienen _meta/catalog_facets actualizado
 * automáticamente en cada write de productos o variantes.
 */

// ── Capa 1: RAM cache en el proceso Next.js ───────────────────────────────────
let _ramCache = null;
let _ramCacheTs = 0;
const RAM_TTL_MS = 5 * 60 * 1000; // 5 minutos

const INACTIVE_STATUSES = new Set(['inactive', 'archived', 'draft', 'hidden']);

export async function GET() {
  if (!adminDb) {
    return NextResponse.json({ error: 'Database unavailable.' }, { status: 503 });
  }

  // ── Capa 1: servir desde RAM ─────────────────────────────────────────────
  if (_ramCache && Date.now() - _ramCacheTs < RAM_TTL_MS) {
    return NextResponse.json(_ramCache, {
      headers: { 
        'X-Cache': 'HIT-RAM', 
        'X-Cache-Age': String(Math.floor((Date.now() - _ramCacheTs) / 1000)),
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=1200'
      },
    });
  }

  try {
    // ── Capa 2: leer desde _meta/catalog_facets (1 sola lectura) ────────────
    const metaDoc = await adminDb.collection('_meta').doc('catalog_facets').get();

    if (metaDoc.exists) {
      const data = metaDoc.data();

      const normalized = {
        productTypes: data.productTypes || [],
        categories: data.categories || [],
        goals:      data.goals || [],
        formats:    data.formats || [],
        presentations: (data.presentations || []).map(p => ({
          value: p.id || p.value,
          label: p.name || p.label || p.id,
          count: p.count ?? 0,
        })),
        suppliers:  (data.suppliers || []).map(s => ({
          value: s.id,
          label: s.name,
          count: s.count,
          id:    s.id,
          name:  s.name,
        })),
        totals: data.totals || null,
        _source: 'meta',
        _updatedAt: data.updatedAt?.toDate?.()?.toISOString() || null,
      };

      _ramCache = normalized;
      _ramCacheTs = Date.now();

      return NextResponse.json(normalized, {
        headers: { 
          'X-Cache': 'HIT-FIRESTORE',
          'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=1200'
        },
      });
    }

    // ── Capa 3: fallback full-scan (solo si _meta no existe aún) ─────────────
    console.warn('[/api/catalog/facets] _meta/catalog_facets not found — falling back to full scan. Run: node scripts/seed_meta_docs.mjs facets');

    const [productsSnap, variantsSnap] = await Promise.all([
      adminDb.collection('products')
        .select('categoryId', 'category', 'goalIds', 'status', 'isActive', 'productType', 'isApiPlaceholder')
        .get(),
      adminDb.collectionGroup('variants')
        .select('formatId', 'format', 'supplierId', 'supplierName', 'supplier', 'isActive', 'status')
        .get(),
    ]);

    const activeProductIds = new Set();
    productsSnap.forEach(doc => {
      const { status, isActive } = doc.data();
      if (!INACTIVE_STATUSES.has(status) && isActive !== false) activeProductIds.add(doc.id);
    });

    const catCounts = {};
    const goalCounts = {};
    const productTypeCounts = {};
    productsSnap.forEach(doc => {
      if (!activeProductIds.has(doc.id)) return;
      const data = doc.data();
      const cat = data.categoryId || data.category;
      if (cat) catCounts[cat] = (catCounts[cat] || 0) + 1;
      if (Array.isArray(data.goalIds)) data.goalIds.forEach(g => { goalCounts[g] = (goalCounts[g] || 0) + 1; });

      const pType = data.productType || (data.isApiPlaceholder ? 'api_raw_material' : 'finished_product');
      productTypeCounts[pType] = (productTypeCounts[pType] || 0) + 1;
    });

    const formatCounts = {};
    const supplierCounts = {};
    variantsSnap.forEach(doc => {
      const parentId = doc.ref.parent.parent.id;
      if (!activeProductIds.has(parentId)) return;
      const { formatId, format, supplierId, supplierName, supplier, isActive: vActive, status: vStatus } = doc.data();
      if (vActive === false || ['inactive', 'archived'].includes(vStatus)) return;

      const fmt = formatId || format || 'vial';
      formatCounts[fmt] = (formatCounts[fmt] || 0) + 1;
      const sid = supplierId || supplier;
      const sname = supplierName || supplier || 'Unknown';
      if (sid) {
        if (!supplierCounts[sid]) supplierCounts[sid] = { count: 0, name: sname };
        supplierCounts[sid].count++;
      }
    });

    const result = {
      productTypes: Object.entries(productTypeCounts).map(([value, count]) => ({
        value,
        label: value === 'api_raw_material' ? 'Raw Materials / APIs' : 'Finished Products',
        count
      })),
      categories: Object.entries(catCounts).map(([value, count]) => ({ value, label: value, count })).sort((a, b) => b.count - a.count),
      goals:      Object.entries(goalCounts).map(([value, count]) => ({ value, label: value, count })).sort((a, b) => b.count - a.count),
      formats:    Object.entries(formatCounts).map(([value, count]) => ({ value, label: value, count })).sort((a, b) => b.count - a.count),
      suppliers:  Object.entries(supplierCounts).map(([value, { count, name }]) => ({ value, label: name, count, id: value, name })).sort((a, b) => b.count - a.count),
      _source: 'fallback-full-scan',
    };

    _ramCache = result;
    _ramCacheTs = Date.now();

    return NextResponse.json(result, {
      headers: { 'X-Cache': 'MISS-FULL-SCAN' },
    });

  } catch (error) {
    console.error('/api/catalog/facets error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
