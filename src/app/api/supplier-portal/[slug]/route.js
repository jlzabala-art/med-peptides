import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebaseAdmin';
import { isAdminServerSession } from '@/lib/serverAdminAuth';
import admin from 'firebase-admin';

export async function PATCH(request, { params }) {
  try {
    const isAdmin = await isAdminServerSession();
    if (!isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const { slug } = await params;
    if (!slug || !adminDb) {
      return NextResponse.json({ error: 'Invalid portal slug' }, { status: 400 });
    }

    const body = await request.json();
    const { checklist, activeStageIndex, batchCode, status } = body || {};

    const ref = adminDb.collection('supplier_portals').doc(String(slug));
    const snap = await ref.get();
    if (!snap.exists) {
      return NextResponse.json({ error: 'Portal not found' }, { status: 404 });
    }

    const current = snap.data() || {};
    const nextActiveOrder = {
      ...(current.activeOrder || {}),
      ...(Array.isArray(checklist) ? { checklist } : {}),
      ...(typeof activeStageIndex === 'number' ? { activeStageIndex } : {}),
      ...(typeof batchCode === 'string' ? { batchCode } : {}),
      ...(typeof status === 'string' ? { status } : {}),
    };

    await ref.set(
      {
        activeOrder: nextActiveOrder,
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      },
      { merge: true }
    );

    return NextResponse.json({ ok: true, activeOrder: nextActiveOrder });
  } catch (err) {
    console.error('[PATCH /api/supplier-portal/[slug]] Error:', err);
    return NextResponse.json({ error: 'Failed to update supplier portal' }, { status: 500 });
  }
}
