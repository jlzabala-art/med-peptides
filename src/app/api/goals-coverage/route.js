import { NextResponse } from 'next/server';
import { adminDb } from '../../../lib/firebaseAdmin';

export const dynamic = 'force-dynamic';

/**
 * GET /api/goals-coverage
 *
 * Devuelve la cobertura de goalIds[] en productos y variantes.
 * Lee desde `_meta/goals_coverage` — 1 sola lectura Firestore.
 *
 * Respuesta:
 *   {
 *     productsTotal: 611,
 *     variantsTotal: 782,
 *     productsWithoutGoals: 0,
 *     variantsWithoutGoals: 32,
 *     nonCanonicalValues: [],
 *     byGoal: {
 *       general_wellness: { products: 130, variants: 155 },
 *       ...
 *     },
 *     updatedAt: "2026-08-11T..."
 *   }
 */

// RAM cache — 5 minutos
let _cache = null;
let _cacheTs = 0;
const TTL_MS = 5 * 60 * 1000;

export async function GET(request) {
  if (!adminDb) {
    return NextResponse.json({ error: 'Database unavailable.' }, { status: 503 });
  }

  const { searchParams } = new URL(request.url);
  const forceRefresh = searchParams.get('refresh') === '1';

  // Serve from RAM cache
  if (!forceRefresh && _cache && Date.now() - _cacheTs < TTL_MS) {
    return NextResponse.json(_cache, {
      headers: { 
        'X-Cache': 'HIT-RAM',
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=1200'
      },
    });
  }

  try {
    const metaDoc = await adminDb.collection('_meta').doc('goals_coverage').get();

    if (!metaDoc.exists) {
      return NextResponse.json(
        { error: '_meta/goals_coverage not found. Run: node scripts/seed_meta_docs.mjs goals' },
        { status: 404 }
      );
    }

    const data = metaDoc.data();
    const result = {
      productsTotal:        data.productsTotal ?? 0,
      variantsTotal:        data.variantsTotal ?? 0,
      productsWithoutGoals: data.productsWithoutGoals ?? 0,
      variantsWithoutGoals: data.variantsWithoutGoals ?? 0,
      nonCanonicalValues:   data.nonCanonicalValues ?? [],
      byGoal:               data.byGoal ?? {},
      updatedAt:            data.updatedAt?.toDate?.()?.toISOString() ?? null,
    };

    _cache = result;
    _cacheTs = Date.now();

    return NextResponse.json(result, {
      headers: { 
        'X-Cache': 'HIT-FIRESTORE',
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=1200'
      },
    });

  } catch (err) {
    console.error('[/api/goals-coverage] error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
