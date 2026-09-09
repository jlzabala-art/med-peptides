import { NextResponse } from 'next/server';
import { FieldValue } from 'firebase-admin/firestore';
import { adminDb } from '@/lib/firebaseAdmin';

/**
 * GET /api/catalog/tracking-logs?q=term&status=all&limit=50
 * Fetches historical audit and tracking logs of generated catalogs & price lists.
 */
export async function GET(request) {
  try {
    if (!adminDb) {
      return NextResponse.json({ error: 'Firebase Admin not initialized' }, { status: 500 });
    }

    const { searchParams } = new URL(request.url);
    const limitNum = Math.min(parseInt(searchParams.get('limit') || '50', 10), 150);
    const status = searchParams.get('status') || 'all';
    const q = (searchParams.get('q') || '').toLowerCase().trim();

    let query = adminDb.collection('catalog_generation_logs').orderBy('generatedAt', 'desc').limit(limitNum);

    if (status && status !== 'all') {
      query = query.where('status', '==', status);
    }

    const snap = await query.get();
    let logs = [];
    snap.forEach(doc => {
      logs.push({ id: doc.id, ...doc.data() });
    });

    if (q) {
      logs = logs.filter(l => 
        (l.recipient?.name || '').toLowerCase().includes(q) ||
        (l.recipient?.email || '').toLowerCase().includes(q) ||
        (l.accountManager?.name || '').toLowerCase().includes(q) ||
        (l.docType || '').toLowerCase().includes(q) ||
        (l.productSummary || '').toLowerCase().includes(q) ||
        (l.productName || '').toLowerCase().includes(q) ||
        (l.productSlug || '').toLowerCase().includes(q)
      );
    }

    // Pre-calculate summary KPIs for tracking
    const kpis = {
      totalGenerated: logs.length,
      wholesalerDocs: logs.filter(l => l.recipient?.type === 'wholeseller' || l.tier === 'wholeseller').length,
      clinicDocs: logs.filter(l => l.recipient?.type === 'clinic' || l.tier === 'clinic' || l.recipient?.type === 'doctor').length,
      convertedCount: logs.filter(l => l.status === 'converted_to_order').length,
      viewedCount: logs.filter(l => l.status === 'viewed').length,
    };

    return NextResponse.json({
      items: logs,
      total: logs.length,
      kpis,
    });
  } catch (err) {
    console.error('[/api/catalog/tracking-logs] GET Error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

/**
 * POST /api/catalog/tracking-logs
 * 1. Creates a new tracking log when sharing a product or catalog.
 * 2. Handles view telemetry sent via navigator.sendBeacon (which sends POST).
 */
export async function POST(request) {
  try {
    if (!adminDb) {
      return NextResponse.json({ error: 'Firebase Admin not initialized' }, { status: 500 });
    }

    const body = await request.json();

    // ── Branch A: Telemetry View Event (from navigator.sendBeacon) ──
    if (body.event === 'view' || body.action === 'view' || (body.id && body.viewedAt)) {
      const logRef = adminDb.collection('catalog_generation_logs').doc(body.id);
      const docSnap = await logRef.get();
      if (!docSnap.exists) {
        return NextResponse.json({ error: 'Tracking record not found' }, { status: 404 });
      }

      const existing = docSnap.data();
      const newStatus = existing.status === 'converted_to_order' ? 'converted_to_order' : 'viewed';

      const updateData = {
        status: newStatus,
        lastViewedAt: body.viewedAt || new Date().toISOString(),
        viewCount: FieldValue.increment(1),
        updatedAt: new Date().toISOString(),
      };

      if (body.userAgent || body.screen || body.referrer) {
        updateData.views = FieldValue.arrayUnion({
          timestamp: body.viewedAt || new Date().toISOString(),
          userAgent: (body.userAgent || '').slice(0, 150),
          screen: body.screen || null,
          referrer: (body.referrer || '').slice(0, 100),
        });
      }

      await logRef.update(updateData);
      return NextResponse.json({ success: true, id: body.id, event: 'view_recorded' });
    }

    // ── Branch B: Creation of a New Share Log ──
    const {
      docType = 'product_datasheet',
      productSlug,
      productName,
      recipient,
      targetType,
      sharedWith,
      sharedPhone,
      sharedEmail,
      accountManager,
      shareUrl,
      items,
    } = body;

    const recipientData = recipient || {
      name: sharedWith || '',
      phone: sharedPhone || '',
      email: sharedEmail || '',
      type: targetType || 'custom',
    };

    const newLog = {
      docType: docType || 'product_datasheet',
      productSlug: productSlug || null,
      productName: productName || (productSlug ? productSlug.replace(/-/g, ' ').toUpperCase() : null),
      productSummary: productName || productSlug || 'Precision Clinical Product',
      recipient: recipientData,
      accountManager: accountManager || {
        name: 'Atlas Commercial Desk',
        email: 'orders@atlas-solutions.com',
      },
      shareUrl: shareUrl || null,
      status: 'sent',
      itemCount: items ? items.length : 1,
      generatedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      viewCount: 0,
      views: [],
    };

    const docRef = await adminDb.collection('catalog_generation_logs').add(newLog);

    return NextResponse.json({
      success: true,
      id: docRef.id,
      item: { id: docRef.id, ...newLog },
    });
  } catch (err) {
    console.error('[/api/catalog/tracking-logs] POST Error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

/**
 * PATCH /api/catalog/tracking-logs
 * Updates status, follow-up notes, or records a view event on a generated catalog log.
 */
export async function PATCH(request) {
  try {
    if (!adminDb) {
      return NextResponse.json({ error: 'Firebase Admin not initialized' }, { status: 500 });
    }

    const body = await request.json();
    const { id, status, followUpNotes, followUpDate, event, viewedAt, userAgent, screen, referrer } = body;

    if (!id) {
      return NextResponse.json({ error: 'Missing log id' }, { status: 400 });
    }

    const updateData = {
      updatedAt: new Date().toISOString(),
    };

    if (event === 'view' || status === 'viewed') {
      updateData.status = 'viewed';
      updateData.lastViewedAt = viewedAt || new Date().toISOString();
      updateData.viewCount = FieldValue.increment(1);

      if (userAgent || screen || referrer) {
        updateData.views = FieldValue.arrayUnion({
          timestamp: viewedAt || new Date().toISOString(),
          userAgent: (userAgent || '').slice(0, 150),
          screen: screen || null,
          referrer: (referrer || '').slice(0, 100),
        });
      }
    } else if (status !== undefined) {
      updateData.status = status;
    }

    if (followUpNotes !== undefined) updateData.followUpNotes = followUpNotes;
    if (followUpDate !== undefined) updateData.followUpDate = followUpDate;

    await adminDb.collection('catalog_generation_logs').doc(id).update(updateData);

    return NextResponse.json({ success: true, id, updated: updateData });
  } catch (err) {
    console.error('[/api/catalog/tracking-logs] PATCH Error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
