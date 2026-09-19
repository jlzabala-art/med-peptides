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

    // Also query universal shared_records for any protocol or catalog shares
    try {
      const recordsSnap = await adminDb
        .collection('shared_records')
        .where('recipient.id', '==', recipientId)
        .limit(limit)
        .get();

      recordsSnap.docs.forEach(rd => {
        const rdata = rd.data();
        // Check if not already in allDocs by shareCode / catalogId
        const code = rdata.shareCode || rd.id;
        const exists = allDocs.some(d => (d.data()?.catalogId === code || d.id === code));
        if (!exists) {
          allDocs.push({
            id: rd.id,
            data: () => ({
              catalogId: code,
              catalogCode: code,
              catalogTitle: rdata.assetTitle || (rdata.assetType === 'protocols_catalog' ? 'Directorio de Protocolos Clínicos' : 'Catálogo Clínico'),
              catalogType: (rdata.assetType === 'protocols_catalog' || rdata.assetType === 'protocol') ? 'protocols' : 'products',
              supplierLabel: rdata.assetTitle || 'Catálogo General',
              sourceType: 'web',
              issuedAt: rdata.createdAt || new Date().toISOString(),
              recipientName: rdata.recipient?.name,
              recipientType: rdata.recipient?.type,
              channel: rdata.deliveryChannel || 'whatsapp',
              visitsCount: rdata.viewCount || 0,
              shareableUrl: rdata.shareUrl || `https://med-peptides.com/c/${code}`,
              status: rdata.status || 'sent',
              interactions: {
                webOpened: (rdata.viewCount || 0) > 0,
                lastInteractionAt: rdata.lastViewedAt
              }
            })
          });
        }
      });
    } catch (recordsErr) {
      console.warn('[catalog/shares] Optional shared_records query failed:', recordsErr.message);
    }

    // Sort in-memory by issuedAt desc
    allDocs.sort((a, b) => {
      const da = typeof a.data === 'function' ? a.data() : a;
      const db = typeof b.data === 'function' ? b.data() : b;
      const ta = da?.issuedAt?.seconds ? da.issuedAt.seconds * 1000 : (da?.issuedAt ? new Date(da.issuedAt).getTime() : 0);
      const tb = db?.issuedAt?.seconds ? db.issuedAt.seconds * 1000 : (db?.issuedAt ? new Date(db.issuedAt).getTime() : 0);
      return tb - ta;
    });

    const hasMore = allDocs.length > limit;
    const docs = hasMore ? allDocs.slice(0, limit) : allDocs;

    const items = docs.map(doc => {
      const d = typeof doc.data === 'function' ? doc.data() : doc;
      const catCode = d.catalogId || d.catalogCode || doc.id;
      const isProto = d.catalogType === 'protocols' || d.assetType === 'protocols_catalog' || String(catCode).startsWith('PR-');

      return {
        id:             doc.id,
        catalogId:      catCode,
        catalogCode:    catCode,
        catalogType:    isProto ? 'protocols' : 'products',
        catalogTitle:   d.catalogTitle || (isProto ? 'Directorio de Protocolos Clínicos' : `Catálogo • ${d.supplierLabel || 'General'}`),
        supplierId:     d.supplierId     || null,
        supplierLabel:  d.supplierLabel  || d.catalogueFilter || d.supplierId || (isProto ? 'Protocolos Clínicos' : 'All Products'),
        margin:         d.priceMarkupPercent ?? d.margin ?? 0,
        currency:       d.currency       || 'USD',
        recipientName:  d.recipientName  || null,
        recipientType:  d.recipientType  || null,
        sourceType:     d.sourceType     || 'web',
        channel:        d.channel        || 'whatsapp',
        issuedAt:       d.issuedAt       || null,
        validityDays:   d.validityDays   || 30,
        visitsCount:    d.visitsCount    || (d.interactions?.webOpened ? 1 : 0),
        status:         d.status         || 'sent',
        // Interaction tracking
        pdfDownloaded:      d.interactions?.pdfDownloaded      ?? false,
        webOpened:          d.interactions?.webOpened          ?? (d.visitsCount > 0),
        orderPlaced:        d.interactions?.orderPlaced        ?? false,
        lastInteractionAt:  d.interactions?.lastInteractionAt  ?? null,
        // Share URL
        shareableUrl:   d.shareableUrl   || (catCode ? `https://med-peptides.com/c/${catCode}` : null),
        shortUrl:       catCode ? `https://med-peptides.com/c/${catCode}` : (d.shareableUrl || null),
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
