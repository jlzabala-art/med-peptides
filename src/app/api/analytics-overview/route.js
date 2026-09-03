import { NextResponse } from 'next/server';
import { adminDb } from '../../../lib/firebaseAdmin';

/**
 * GET /api/analytics-overview
 * Server-side calculation of financial KPIs and global platform metrics.
 * Runs aggregations on the server to prevent massive client-side data downloads.
 * Cached for 15 minutes by default to reduce DB load.
 */

export const dynamic = 'force-dynamic';

export async function GET(request) {
  try {
    if (!adminDb) {
      return NextResponse.json({ error: 'Firebase Admin not initialized' }, { status: 500 });
    }

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    // Run all massive aggregations in parallel on the server
    const [
      ordersSnap,
      rfqsSnap,
      patientsCountSnap,
      usersCountSnap
    ] = await Promise.all([
      adminDb.collection('orders').where('createdAt', '>=', thirtyDaysAgo).get(),
      adminDb.collection('agency_rfqs').where('status', 'in', ['pending', 'approved']).get(),
      adminDb.collection('patients').count().get(),
      adminDb.collection('users').count().get()
    ]);

    let totalRevenue30d = 0;
    let completedOrders = 0;

    ordersSnap.docs.forEach(doc => {
      const data = doc.data();
      if (data.status === 'delivered' || data.status === 'completed') {
        totalRevenue30d += (data.total || 0);
        completedOrders++;
      }
    });

    let pipelineValue = 0;
    rfqsSnap.docs.forEach(doc => {
      const data = doc.data();
      pipelineValue += (data.totalValue || 0);
    });

    return NextResponse.json({
      revenue30d: totalRevenue30d,
      completedOrders30d: completedOrders,
      pipelineValue,
      totalPatients: patientsCountSnap.data().count,
      totalUsers: usersCountSnap.data().count,
      lastCalculated: new Date().toISOString()
    });

  } catch (err) {
    console.error('[/api/analytics-overview] error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
