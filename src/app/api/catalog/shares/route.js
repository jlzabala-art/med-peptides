import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebaseAdmin';

/**
 * GET /api/catalog/shares
 * Query params:
 *   - recipientId   (string, required) — filters by recipientUserId
 *   - type          (string, optional) — 'pdf' | 'web'
 *   - limit         (number, optional) — default 20, max 100
 *   - startAfter    (string, optional) — cursor for pagination (doc ID)
 *
 * Returns: { items: [...], total: number, hasMore: boolean }
 */
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const recipientId = searchParams.get('recipientId');
    const type        = searchParams.get('type')        || null;
    const limit       = Math.min(parseInt(searchParams.get('limit') || '20', 10), 100);
    const startAfter  = searchParams.get('startAfter')  || null;

    if (!recipientId) {
      return NextResponse.json({ error: 'recipientId is required' }, { status: 400 });
    }

    let query = adminDb
      .collection('shared_catalog_links')
      .where('recipientUserId', '==', recipientId)
      .orderBy('issuedAt', 'desc')
      .limit(limit + 1); // +1 to detect hasMore

    if (type === 'pdf') {
      query = query.where('sourceType', '==', 'pdf');
    } else if (type === 'web') {
      query = query.where('sourceType', '==', 'web');
    }

    if (startAfter) {
      const cursorDoc = await adminDb.collection('shared_catalog_links').doc(startAfter).get();
      if (cursorDoc.exists) {
        query = query.startAfter(cursorDoc);
      }
    }

    let snapshot;
    try {
      snapshot = await query.get();
    } catch (queryErr) {
      if (queryErr.code === 9 || String(queryErr).includes('FAILED_PRECONDITION') || String(queryErr).includes('index')) {
        console.warn('[catalog/shares GET] Missing index, falling back to in-memory sort');
        let fallbackQuery = adminDb
          .collection('shared_catalog_links')
          .where('recipientUserId', '==', recipientId);
        if (type === 'pdf' || type === 'web') {
          fallbackQuery = fallbackQuery.where('sourceType', '==', type);
        }
        snapshot = await fallbackQuery.limit(limit + 10).get();
      } else {
        throw queryErr;
      }
    }

    let allDocs = [...snapshot.docs];
    // Sort in-memory by issuedAt desc
    allDocs.sort((a, b) => {
      const ta = a.data()?.issuedAt?.seconds || (a.data()?.issuedAt ? new Date(a.data().issuedAt).getTime() / 1000 : 0);
      const tb = b.data()?.issuedAt?.seconds || (b.data()?.issuedAt ? new Date(b.data().issuedAt).getTime() / 1000 : 0);
      return tb - ta;
    });

    const hasMore = allDocs.length > limit;
    const docs = hasMore ? allDocs.slice(0, limit) : allDocs;

    const items = docs.map(doc => {
      const d = doc.data();
      return {
        id:             doc.id,
        catalogId:      d.catalogId      || doc.id,
        catalogCode:    d.catalogCode    || d.batchCode || doc.id,
        supplierId:     d.supplierId     || null,
        supplierLabel:  d.supplierLabel  || d.catalogueFilter || d.supplierId || 'All Suppliers',
        margin:         d.priceMarkupPercent ?? 0,
        currency:       d.currency       || 'USD',
        recipientName:  d.recipientName  || null,
        recipientType:  d.recipientType  || null,
        sourceType:     d.sourceType     || 'web',
        issuedAt:       d.issuedAt       || null,
        validityDays:   d.validityDays   || 30,
        // Interaction tracking
        pdfDownloaded:      d.interactions?.pdfDownloaded      ?? false,
        webOpened:          d.interactions?.webOpened          ?? false,
        orderPlaced:        d.interactions?.orderPlaced        ?? false,
        lastInteractionAt:  d.interactions?.lastInteractionAt  ?? null,
        // Share URL
        shareableUrl:   d.shareableUrl   || null,
        pdfDownloadUrl: d.pdfDownloadUrl || null,
      };
    });

    return NextResponse.json({ items, hasMore, nextCursor: hasMore ? docs[docs.length - 1].id : null });
  } catch (err) {
    console.error('[catalog/shares GET]', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * PATCH /api/catalog/shares
 * Body: { shareId: string, interaction: 'pdfDownloaded' | 'webOpened' | 'orderPlaced' }
 *
 * Marks an interaction on a shared catalog link. Idempotent.
 */
export async function PATCH(request) {
  try {
    const body = await request.json();
    const { shareId, interaction } = body;

    const VALID_INTERACTIONS = ['pdfDownloaded', 'webOpened', 'orderPlaced'];

    if (!shareId) {
      return NextResponse.json({ error: 'shareId is required' }, { status: 400 });
    }
    if (!VALID_INTERACTIONS.includes(interaction)) {
      return NextResponse.json({ error: `interaction must be one of: ${VALID_INTERACTIONS.join(', ')}` }, { status: 400 });
    }

    const docRef = adminDb.collection('shared_catalog_links').doc(shareId);
    await docRef.update({
      [`interactions.${interaction}`]: true,
      'interactions.lastInteractionAt': new Date().toISOString(),
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('[catalog/shares PATCH]', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
