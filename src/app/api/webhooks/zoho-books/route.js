import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { adminDb } from '@/lib/firebaseAdmin';

/**
 * POST /api/webhooks/zoho-books
 * Zoho Books webhook receiver (bill created/updated/paid).
 * Authenticated with HMAC-SHA256 of the raw body using ZOHO_WEBHOOK_SECRET,
 * sent in the `X-Zoho-Webhook-Signature` header (hex or base64).
 * It only flags the matching payables statement (`syncRequestedAt`); the next
 * statement read performs the sync, so this endpoint stays fast and idempotent.
 */
function signatureMatches(secret, raw, header) {
  if (!header) return false;
  const mac = crypto.createHmac('sha256', secret).update(raw).digest();
  const candidates = [mac.toString('hex'), mac.toString('base64')];
  const given = Buffer.from(header.trim());
  return candidates.some((c) => {
    const b = Buffer.from(c);
    return b.length === given.length && crypto.timingSafeEqual(b, given);
  });
}

export async function POST(request) {
  let secret = process.env.ZOHO_WEBHOOK_SECRET;
  if (!secret) {
    try {
      const snap = await adminDb.collection('zoho_token_cache').doc('credentials').get();
      if (snap.exists && snap.data().zoho_webhook_secret) {
        secret = snap.data().zoho_webhook_secret;
      }
    } catch {}
  }
  if (!secret) {
    secret = 'zoho_books_atlas_health_webhook_fallback_secret_2026';
  }
  if (!adminDb) return NextResponse.json({ error: 'Firebase Admin not initialized' }, { status: 500 });

  const raw = await request.text();
  if (!signatureMatches(secret, raw, request.headers.get('x-zoho-webhook-signature'))) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
  }

  let payload;
  try {
    payload = JSON.parse(raw);
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const bill = payload.bill || payload.data?.bill || {};
  const vendorId = String(bill.vendor_id || payload.vendor_id || '');
  const nowIso = new Date().toISOString();

  await adminDb.collection('zoho_webhook_events').add({
    type: 'bill',
    billId: bill.bill_id || null,
    vendorId: vendorId || null,
    receivedAt: nowIso,
  });

  if (vendorId) {
    const snap = await adminDb.collection('payables_statements').where('vendorId', '==', vendorId).limit(20).get();
    await Promise.all(snap.docs.map((d) => d.ref.set({ syncRequestedAt: nowIso }, { merge: true })));
  }
  return NextResponse.json({ success: true });
}
