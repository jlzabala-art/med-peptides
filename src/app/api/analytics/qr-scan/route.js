import { NextResponse } from 'next/server';
import { FieldValue } from 'firebase-admin/firestore';
import { adminDb } from '../../../../lib/firebaseAdmin';

// ─── In-Memory Aggregation Buffer ─────────────────────────────────────────────
// Reduces Firestore write contention and quota overhead during traffic spikes.
const scanBuffer = new Map(); // targetId -> count
let flushTimer = null;
const FLUSH_INTERVAL_MS = 20000; // 20 seconds
const BATCH_FLUSH_THRESHOLD = 10; // 10 scans

async function flushBuffer() {
  if (scanBuffer.size === 0 || !adminDb) return;

  const entries = Array.from(scanBuffer.entries());
  scanBuffer.clear();
  if (flushTimer) {
    clearTimeout(flushTimer);
    flushTimer = null;
  }

  const today = new Date().toISOString().slice(0, 10);
  const metaRef = adminDb.collection('_meta').doc(`analytics_${today}`);
  let totalIncrement = 0;
  const metaUpdates = {};

  const batch = adminDb.batch();

  for (const [targetId, count] of entries) {
    totalIncrement += count;
    metaUpdates[`qr_scans.${targetId}`] = FieldValue.increment(count);

    // Resolve doc ref
    const docRef = adminDb.collection('products').doc(targetId);
    batch.set(docRef, {
      qrScans: FieldValue.increment(count),
      lastQrScanAt: FieldValue.serverTimestamp(),
    }, { merge: true });
  }

  metaUpdates.total_qr_scans = FieldValue.increment(totalIncrement);
  metaUpdates.updatedAt = FieldValue.serverTimestamp();
  batch.set(metaRef, metaUpdates, { merge: true });

  try {
    await batch.commit();
  } catch (error) {
    console.error('Error committing QR scan buffer batch:', error);
  }
}

function scheduleFlush() {
  if (!flushTimer) {
    flushTimer = setTimeout(() => {
      flushBuffer().catch(e => console.error('Flush error:', e));
    }, FLUSH_INTERVAL_MS);
  }
}

export async function POST(request) {
  try {
    const body = await request.json().catch(() => ({}));
    const { productId, slug, referrer, source = 'qr' } = body;

    const targetId = productId || slug;
    if (!targetId || !adminDb) {
      return NextResponse.json({ ok: false, message: 'Missing identifier or db' }, { status: 400 });
    }

    // Accumulate in buffer
    const current = scanBuffer.get(targetId) || 0;
    scanBuffer.set(targetId, current + 1);

    const totalBuffered = Array.from(scanBuffer.values()).reduce((a, b) => a + b, 0);
    if (totalBuffered >= BATCH_FLUSH_THRESHOLD) {
      // Immediate asynchronous flush
      flushBuffer().catch(() => {});
    } else {
      scheduleFlush();
    }

    return NextResponse.json({ ok: true, buffered: true });
  } catch (error) {
    console.error('Error in qr-scan analytics route:', error);
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }
}

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id') || searchParams.get('slug');

  if (!id || !adminDb) {
    return NextResponse.json({ ok: false, scans: 0 });
  }

  try {
    let docSnap = await adminDb.collection('products').doc(id).get().catch(() => null);
    if (!docSnap || !docSnap.exists) {
      const slugQuery = await adminDb.collection('products').where('slug', '==', id.toLowerCase()).limit(1).get().catch(() => null);
      if (slugQuery && !slugQuery.empty) docSnap = slugQuery.docs[0];
    }

    const bufferedCount = scanBuffer.get(id) || 0;
    const scans = (docSnap?.exists ? (docSnap.data()?.qrScans || 0) : 0) + bufferedCount;
    return NextResponse.json({ ok: true, scans });
  } catch (error) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }
}
