import { NextResponse } from 'next/server';
import { withApiHandler } from '@/lib/api/withApiHandler';

/**
 * GET /api/wholesellers/stats
 * Returns aggregated KPIs for the wholesellers collection.
 */
export const GET = withApiHandler(
  async ({ db }) => {
    try {
      const collRef = db.collection('wholesellers');

      const [totalSnap, activeSnap, pendingSnap, inactiveSnap] = await Promise.all([
        collRef.count().get(),
        collRef.where('status', '==', 'active').count().get(),
        collRef.where('status', '==', 'pending').count().get(),
        collRef.where('status', '==', 'inactive').count().get(),
      ]);

      let restricted = 0;
      try {
        const restrictedSnap = await collRef.where('catalogAccessId', '!=', null).count().get();
        restricted = restrictedSnap.data().count;
      } catch (restrictedErr) {
        console.warn('[wholesellers/stats] Unable to count restricted variants:', restrictedErr?.message);
      }

      return {
        kpis: {
          total: totalSnap.data().count,
          active: activeSnap.data().count,
          pending: pendingSnap.data().count,
          inactive: inactiveSnap.data().count,
          restricted,
        },
      };
    } catch (err) {
      console.error('[/api/wholesellers/stats] Error:', err);
      return NextResponse.json({ kpis: { total: 0, active: 0, pending: 0, restricted: 0 } }, { status: 200 });
    }
  },
  { auth: 'public', requireDb: true }
);
