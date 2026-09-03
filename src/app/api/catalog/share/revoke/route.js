import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebaseAdmin';

export async function POST(request) {
  try {
    const { catalogId, reason = 'Revoked by commercial manager' } = await request.json();

    if (!catalogId) {
      return NextResponse.json({ error: 'catalogId is required' }, { status: 400 });
    }

    const docRef = adminDb.collection('shared_catalog_links').doc(catalogId);
    const snap = await docRef.get();

    if (!snap.exists) {
      return NextResponse.json({ error: 'Catalog link not found' }, { status: 404 });
    }

    await docRef.set({
      status: 'revoked',
      revokedAt: new Date().toISOString(),
      revocationReason: reason,
      updatedAt: new Date().toISOString()
    }, { merge: true });

    return NextResponse.json({
      success: true,
      catalogId,
      status: 'revoked',
      message: 'Catalog link access successfully revoked'
    });

  } catch (error) {
    console.error('[revoke/route.js] Error revoking catalog link:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
