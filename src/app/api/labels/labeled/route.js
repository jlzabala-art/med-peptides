import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebaseAdmin';

export const dynamic = 'force-dynamic';

/**
 * POST /api/labels/labeled
 * ─────────────────────────────────────────────────────────────────────────────
 * Persists bottle/part labeled verification state in Firestore so multiple
 * pharmacy workstations stay synchronized in real time.
 */
export async function POST(request) {
  try {
    const body = await request.json();
    const { code, docId, partIdx = 0, labeled = true, updatedBy = 'Pharmacy Staff' } = body || {};
    const cleanCode = String(code || docId || '').trim();

    if (!cleanCode || !adminDb) {
      return NextResponse.json({ success: true, synced: false });
    }

    let targetDocRef = null;
    let docData = null;

    if (docId) {
      const ref = adminDb.collection('prescriptions').doc(String(docId));
      const snap = await ref.get();
      if (snap.exists) {
        targetDocRef = ref;
        docData = snap.data();
      }
    }

    if (!targetDocRef) {
      const ref = adminDb.collection('prescriptions').doc(cleanCode);
      const snap = await ref.get();
      if (snap.exists) {
        targetDocRef = ref;
        docData = snap.data();
      }
    }

    if (!targetDocRef) {
      const qSnap = await adminDb.collection('prescriptions')
        .where('prescriptionNumber', '==', cleanCode)
        .limit(1)
        .get();
      if (!qSnap.empty) {
        targetDocRef = qSnap.docs[0].ref;
        docData = qSnap.docs[0].data();
      }
    }

    if (!targetDocRef) {
      return NextResponse.json({ success: true, synced: false });
    }

    const now = new Date().toISOString();
    const existing = docData?.labeledParts || {};
    const nextLabeledParts = {
      ...existing,
      [`part-${partIdx}`]: {
        labeled: Boolean(labeled),
        updatedAt: now,
        updatedBy
      }
    };

    await targetDocRef.set({ labeledParts: nextLabeledParts }, { merge: true });

    return NextResponse.json({
      success: true,
      synced: true,
      labeledParts: nextLabeledParts
    });
  } catch (err) {
    console.error('[POST /api/labels/labeled] Error:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
