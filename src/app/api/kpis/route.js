import { NextResponse } from 'next/server';
import { adminDb } from '../../../lib/firebaseAdmin';

/**
 * GET /api/kpis?collection=prescriptions&aggs=total,active,draft,fulfilled
 *
 * Lightweight aggregate count endpoint for client components that need
 * real server-side totals without loading all Firestore docs client-side.
 *
 * Supports a fixed set of well-known aggregation presets per collection
 * to avoid arbitrary query injection.
 */

const PRESETS = {
  prescriptions: [
    { key: 'total',     conditions: [] },
    { key: 'active',    conditions: [['status', 'in', ['Active', 'active', 'sent', 'viewed_by_patient', 'ordered', 'added_to_bulk']]] },
    { key: 'draft',     conditions: [['status', 'in', ['draft', 'Draft']]] },
    { key: 'fulfilled', conditions: [['status', 'in', ['fulfilled', 'Fulfilled', 'completed', 'Completed']]] },
    { key: 'pending',   conditions: [['status', 'in', ['pending', 'review_required']]] },
  ],
  orders: [
    { key: 'total',     conditions: [] },
    { key: 'pending',   conditions: [['status', 'in', ['pending', 'processing']]] },
    { key: 'delivered', conditions: [['status', '==', 'delivered']] },
  ],
  products: [
    { key: 'total',     conditions: [] },
    { key: 'published', conditions: [['status', '==', 'published']] },
    { key: 'draft',     conditions: [['status', '==', 'draft']] },
    { key: 'archived',  conditions: [['status', '==', 'archived']] },
  ],
  patients: [
    { key: 'total',      conditions: [] },
    { key: 'active',     conditions: [['status', '==', 'active']] },
    { key: 'unverified', conditions: [['status', '==', 'unverified']] },
    { key: 'suspended',  conditions: [['status', '==', 'suspended']] },
  ],
  protocols: [
    { key: 'total',    conditions: [] },
    { key: 'active',   conditions: [['status', '==', 'active']] },
    { key: 'draft',    conditions: [['status', '==', 'draft']] },
    { key: 'archived', conditions: [['status', '==', 'archived']] },
  ],
};

/**
 * Special meta collections — read from _meta/* docs instead of count()
 * on large collections. Returns the full pre-computed summary document.
 */
const META_COLLECTIONS = new Set(['goals_coverage', 'catalog_facets', 'supplier_coverage']);


export async function GET(request) {
  try {
    if (!adminDb) {
      return NextResponse.json({ error: 'Firebase Admin not initialized' }, { status: 500 });
    }

    const { searchParams } = new URL(request.url);
    const collection = searchParams.get('collection');
    const requestedKeys = (searchParams.get('aggs') || '').split(',').filter(Boolean);

    if (!collection) {
      return NextResponse.json({ error: 'Missing collection param' }, { status: 400 });
    }

    // ── _meta/* special case — read pre-computed doc ─────────────────────────
    if (META_COLLECTIONS.has(collection)) {
      const metaDoc = await adminDb.collection('_meta').doc(collection).get();
      if (!metaDoc.exists) {
        return NextResponse.json(
          { error: `_meta/${collection} not found. Run: node scripts/seed_meta_docs.mjs` },
          { status: 404 }
        );
      }
      return NextResponse.json(metaDoc.data(), {
        headers: { 'Cache-Control': 'no-store' },
      });
    }

    // ── Standard collections — use count() ───────────────────────────────────
    if (!PRESETS[collection]) {
      return NextResponse.json({ error: `Unknown collection: ${collection}` }, { status: 400 });
    }

    const presets = PRESETS[collection];
    const toRun = requestedKeys.length > 0
      ? presets.filter(p => requestedKeys.includes(p.key))
      : presets;

    const results = {};
    await Promise.all(toRun.map(async ({ key, conditions }) => {
      let q = adminDb.collection(collection);
      for (const [field, op, value] of conditions) {
        q = q.where(field, op, value);
      }
      const snap = await q.count().get();
      results[key] = snap.data().count;
    }));

    return NextResponse.json(results, {
      headers: {
        'Cache-Control': 'no-store',
      },
    });
  } catch (err) {
    console.error('[/api/kpis] error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
