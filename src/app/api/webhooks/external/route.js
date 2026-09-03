import { NextResponse } from 'next/server';
import { adminDb } from '../../../../lib/firebaseAdmin';

/**
 * POST /api/webhooks/external
 * Generic webhook receiver for third-party services (Zoho, Stripe, ShipStation).
 * Receives the payload and logs it directly to Firestore for background processing.
 */
export async function POST(request) {
  try {
    if (!adminDb) {
      return NextResponse.json({ error: 'Firebase Admin not initialized' }, { status: 500 });
    }

    const payload = await request.json();
    const source = request.headers.get('x-webhook-source') || 'unknown';

    // Log the webhook payload securely to Firestore
    const webhookRef = adminDb.collection('webhook_events').doc();
    await webhookRef.set({
      source,
      payload,
      status: 'pending',
      receivedAt: new Date().toISOString()
    });

    // In a real scenario, we might process it immediately or let a Cloud Function trigger handle it.
    console.log(`[WEBHOOK] Received payload from ${source}`);

    return NextResponse.json({ success: true, id: webhookRef.id });
  } catch (err) {
    console.error('[/api/webhooks/external] error:', err);
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}
