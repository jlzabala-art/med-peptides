import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebaseAdmin';

export const dynamic = 'force-dynamic';

/**
 * GET /api/health
 * Lightweight Cloud Run & uptime health-check endpoint.
 */
export async function GET() {
  const timestamp = new Date().toISOString();
  let firestore = 'unavailable';

  try {
    if (adminDb) {
      await adminDb.collection('doctors').limit(1).get();
      firestore = 'connected';
    }
  } catch (err) {
    return NextResponse.json(
      { ok: false, status: 'degraded', service: 'atlas-web', firestore: 'error', error: err?.message, timestamp },
      { status: 503 }
    );
  }

  return NextResponse.json({
    ok: true,
    status: 'healthy',
    service: 'atlas-web',
    firestore,
    timestamp,
  });
}
