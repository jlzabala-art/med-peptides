import { NextResponse } from 'next/server';
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
        (l.productSummary || '').toLowerCase().includes(q)
      );
    }

    // Pre-calculate summary KPIs for tracking
    const kpis = {
      totalGenerated: logs.length,
      wholesalerDocs: logs.filter(l => l.recipient?.type === 'wholeseller' || l.tier === 'wholeseller').length,
      clinicDocs: logs.filter(l => l.recipient?.type === 'clinic' || l.tier === 'clinic').length,
      convertedCount: logs.filter(l => l.status === 'converted_to_order').length,
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
 * PATCH /api/catalog/tracking-logs
 * Updates status or follow-up notes of a generated catalog log.
 */
export async function PATCH(request) {
  try {
    if (!adminDb) {
      return NextResponse.json({ error: 'Firebase Admin not initialized' }, { status: 500 });
    }

    const body = await request.json();
    const { id, status, followUpNotes, followUpDate } = body;

    if (!id) {
      return NextResponse.json({ error: 'Missing log id' }, { status: 400 });
    }

    const updateData = {
      updatedAt: new Date().toISOString(),
    };
    if (status !== undefined) updateData.status = status;
    if (followUpNotes !== undefined) updateData.followUpNotes = followUpNotes;
    if (followUpDate !== undefined) updateData.followUpDate = followUpDate;

    await adminDb.collection('catalog_generation_logs').doc(id).update(updateData);

    return NextResponse.json({ success: true, id, updated: updateData });
  } catch (err) {
    console.error('[/api/catalog/tracking-logs] PATCH Error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
