import { NextResponse } from 'next/server';
import { withApiHandler } from '@/lib/api/withApiHandler';
import { sanitizePublicProductForViewer } from '@/lib/supplierSanitizer';
import { TELSTAR_SUPPLIER, getAllTelstarEquipment } from '@/data/telstarLyophilizersRegistry';

export const dynamic = 'force-dynamic';

/**
 * GET /api/equipment/telstar
 * Returns role-sanitized 2027 Syntegon Telstar Laboratory & Pilot GMP Freeze Dryers
 * from Firestore SSOT (with emergency fallback registry if unavailable).
 */
export const GET = withApiHandler(
  async ({ query, isAdmin, db, requestId }) => {
    const seriesFilter = query.series ? String(query.series).toUpperCase().trim() : null;
    let items = [];

    const snap = await db
      .collection('products')
      .where('collectionSlug', '==', 'telstar-lyophilizers')
      .limit(50)
      .get();

    if (!snap.empty) {
      items = snap.docs
        .map((d) => ({ id: d.id, ...d.data() }))
        .filter((p) => p.status !== 'archived' && p.status !== 'hidden' && p.isActive !== false);
    }

    if (items.length === 0) {
      items = getAllTelstarEquipment();
    }

    if (seriesFilter && seriesFilter !== 'ALL') {
      items = items.filter((p) => String(p.equipmentSpecs?.series || p.subcategory || '').toUpperCase() === seriesFilter);
    }

    const sanitized = items
      .sort((a, b) => (a.listPriceEur || 0) - (b.listPriceEur || 0))
      .map((p) => sanitizePublicProductForViewer(p, { isAdmin }));

    return NextResponse.json(
      {
        ok: true,
        brand: TELSTAR_SUPPLIER.displayName,
        count: sanitized.length,
        items: sanitized,
        requestId,
      },
      {
        status: 200,
        headers: {
          'Cache-Control': isAdmin ? 'private, no-store' : 'public, s-maxage=300, stale-while-revalidate=900',
        },
      }
    );
  },
  { auth: 'public', requireDb: true }
);
