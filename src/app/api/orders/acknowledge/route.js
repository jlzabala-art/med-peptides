import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebaseAdmin';

/**
 * POST /api/orders/acknowledge
 * Confirms reception of an incoming draft order and marks it as read.
 * Unlocks and dismisses the mandatory alert modal once acknowledged.
 */
export async function POST(request) {
  try {
    const body = await request.json();
    const {
      orderId,
      acknowledgedBy = 'admin',
      receptionNotes = ''
    } = body;

    if (!orderId) {
      return NextResponse.json(
        { error: 'Order ID is required to acknowledge reception.' },
        { status: 400 }
      );
    }

    if (!adminDb) {
      return NextResponse.json(
        { error: 'Database service temporarily unavailable.' },
        { status: 503 }
      );
    }

    const now = new Date().toISOString();

    // 1. Update Order Document
    const orderDocRef = adminDb.collection('orders').doc(orderId);
    const orderDoc = await orderDocRef.get();

    if (!orderDoc.exists) {
      // Check if orderId is the business code
      const querySnap = await adminDb.collection('orders').where('code', '==', orderId).limit(1).get();
      if (querySnap.empty) {
        return NextResponse.json(
          { error: 'Order document not found.' },
          { status: 404 }
        );
      }
      const targetDoc = querySnap.docs[0];
      await targetDoc.ref.update({
        acknowledged: true,
        isRead: true,
        acknowledgedAt: now,
        readAt: now,
        acknowledgedBy: String(acknowledgedBy).trim(),
        readBy: String(acknowledgedBy).trim(),
        receptionNotes: String(receptionNotes || '').trim(),
        updatedAt: now
      });
    } else {
      await orderDocRef.update({
        acknowledged: true,
        isRead: true,
        acknowledgedAt: now,
        readAt: now,
        acknowledgedBy: String(acknowledgedBy).trim(),
        readBy: String(acknowledgedBy).trim(),
        receptionNotes: String(receptionNotes || '').trim(),
        updatedAt: now
      });
    }

    // 2. Mark related notifications as acknowledged and read
    const notifsSnap = await adminDb.collection('notifications')
      .where('orderId', '==', orderId)
      .get();

    const batch = adminDb.batch();
    notifsSnap.docs.forEach(doc => {
      batch.update(doc.ref, {
        acknowledged: true,
        read: true,
        acknowledgedAt: now,
        acknowledgedBy: String(acknowledgedBy).trim()
      });
    });

    if (!notifsSnap.empty) {
      await batch.commit();
    }

    return NextResponse.json({
      success: true,
      message: 'Order reception officially acknowledged and marked as read.'
    });
  } catch (error) {
    console.error('Error acknowledging order reception:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to acknowledge order.' },
      { status: 500 }
    );
  }
}
