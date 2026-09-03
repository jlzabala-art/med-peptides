import { adminDb } from '@/lib/firebaseAdmin';

/**
 * GET /api/wholesellers/stats
 * Returns aggregated KPIs for the wholesellers collection.
 * Called by useWholesellerData on mount.
 */
export async function GET() {
  try {
    const collRef = adminDb.collection('wholesellers');

    const [totalSnap, activeSnap, pendingSnap, inactiveSnap] = await Promise.all([
      collRef.count().get(),
      collRef.where('status', '==', 'active').count().get(),
      collRef.where('status', '==', 'pending').count().get(),
      collRef.where('status', '==', 'inactive').count().get(),
    ]);

    // Count those with restricted catalog access
    let restricted = 0;
    try {
      // authorizedVariantIds.length > 0 — Firestore can't do this natively, estimate via not empty
      const restrictedSnap = await collRef
        .where('catalogAccessId', '!=', null)
        .count().get();
      restricted = restrictedSnap.data().count;
    } catch (restrictedErr) {
      // `catalogAccessId != null` Firestore aggregation may fail on some indexes — default to 0
      console.warn('[wholesellers/stats] Unable to count restricted variants:', restrictedErr?.message);
    }

    return Response.json({
      kpis: {
        total: totalSnap.data().count,
        active: activeSnap.data().count,
        pending: pendingSnap.data().count,
        inactive: inactiveSnap.data().count,
        restricted,
      },
    });
  } catch (err) {
    console.error('[/api/wholesellers/stats] Error:', err);
    return Response.json({ kpis: { total: 0, active: 0, pending: 0, restricted: 0 } }, { status: 200 });
  }
}
