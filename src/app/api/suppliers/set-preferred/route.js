import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebaseAdmin';

/**
 * POST /api/suppliers/set-preferred
 * Persists `preferredSupplierId` across all Firestore product documents
 * sharing the given `canonicalKey` (or explicit `docIds`).
 */
export async function POST(request) {
  try {
    const body = await request.json();
    const canonicalKey = String(body?.canonicalKey || '').trim();
    const supplierId = String(body?.supplierId || '').trim();
    const docIds = Array.isArray(body?.docIds) ? body.docIds.filter(Boolean) : [];

    if (!supplierId || (!canonicalKey && docIds.length === 0)) {
      return NextResponse.json(
        { ok: false, error: 'supplierId and canonicalKey (or docIds) are required' },
        { status: 400 }
      );
    }

    const targets = new Set(docIds);
    if (canonicalKey) {
      const snap = await adminDb
        .collection('products')
        .where('canonicalKey', '==', canonicalKey)
        .limit(20)
        .get();
      snap.forEach((d) => targets.add(d.id));
    }

    if (targets.size === 0) {
      return NextResponse.json(
        { ok: false, error: 'No matching products found in Firestore' },
        { status: 404 }
      );
    }

    const batch = adminDb.batch();
    const now = new Date().toISOString();
    for (const id of targets) {
      batch.set(
        adminDb.collection('products').doc(id),
        { preferredSupplierId: supplierId, updatedAt: now },
        { merge: true }
      );
    }
    await batch.commit();

    return NextResponse.json({
      ok: true,
      canonicalKey,
      preferredSupplierId: supplierId,
      updatedCount: targets.size,
    });
  } catch (err) {
    console.error('[POST /api/suppliers/set-preferred] Error:', err);
    return NextResponse.json(
      { ok: false, error: err?.message || 'Failed to update preferred supplier' },
      { status: 500 }
    );
  }
}
