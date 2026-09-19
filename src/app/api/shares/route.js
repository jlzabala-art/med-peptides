import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebaseAdmin';

/**
 * GET /api/shares?q=term&recipientType=all&assetType=all&timeframe=all&limit=50
 * Fetches audit and tracking records of all shared assets across the platform.
 */
export async function GET(request) {
  try {
    if (!adminDb) {
      return NextResponse.json({ error: 'Firebase Admin not initialized' }, { status: 500 });
    }

    const { searchParams } = new URL(request.url);
    const limitNum = Math.min(parseInt(searchParams.get('limit') || '50', 10), 150);
    const recipientType = searchParams.get('recipientType') || 'all';
    const assetType = searchParams.get('assetType') || 'all';
    const timeframe = searchParams.get('timeframe') || 'all';
    const q = (searchParams.get('q') || '').toLowerCase().trim();

    // 1. Query shared_records collection with composite index resilience
    let records = [];
    try {
      let query = adminDb.collection('shared_records').orderBy('createdAt', 'desc').limit(limitNum);

      if (recipientType && recipientType !== 'all') {
        query = query.where('recipient.type', '==', recipientType);
      }
      if (assetType && assetType !== 'all') {
        query = query.where('assetType', '==', assetType);
      }

      const snap = await query.get();
      snap.forEach(doc => {
        records.push({ id: doc.id, ...doc.data() });
      });
    } catch (queryErr) {
      console.warn('Firestore index missing or query failed, falling back to in-memory filter:', queryErr.message);
      // Fallback: fetch recent records without where clause and filter in memory
      const fallbackSnap = await adminDb.collection('shared_records')
        .orderBy('createdAt', 'desc')
        .limit(Math.max(limitNum * 2, 80))
        .get();
      
      fallbackSnap.forEach(doc => {
        const data = doc.data();
        let match = true;
        if (recipientType && recipientType !== 'all') {
          match = match && (data.recipient?.type === recipientType);
        }
        if (assetType && assetType !== 'all') {
          match = match && (data.assetType === assetType);
        }
        if (match) {
          records.push({ id: doc.id, ...data });
        }
      });
    }

    // Also pull legacy catalog_generation_logs if shared_records is sparse or assetType allows it
    if (records.length < limitNum && (assetType === 'all' || assetType === 'catalog_pdf' || assetType === 'pricelist')) {
      try {
        const legacySnap = await adminDb.collection('catalog_generation_logs')
          .orderBy('generatedAt', 'desc')
          .limit(limitNum - records.length)
          .get();
        
        legacySnap.forEach(doc => {
          const d = doc.data();
          // Map to unified format if not already in records
          if (!records.some(r => r.id === doc.id)) {
            records.push({
              id: doc.id,
              shareCode: d.refNumber || doc.id.slice(0, 8).toUpperCase(),
              assetType: d.docType === 'pricelist' ? 'catalog_pdf' : (d.docType || 'catalog_pdf'),
              assetTitle: d.productSummary || d.productName || 'Catalog / Price List PDF',
              assetMeta: {
                variantCount: d.variantCount || 0,
                priceSource: d.tier || d.priceSource || 'cost',
                currency: d.currency || 'USD',
                url: d.pdfUrl || d.shareUrl || null,
              },
              recipient: {
                type: d.recipient?.type || (d.tier === 'wholeseller' ? 'wholeseller' : 'doctor'),
                id: d.recipient?.id || null,
                name: d.recipient?.name || d.sharedWith || 'Unknown',
                company: d.recipient?.company || '',
                email: d.recipient?.email || d.sharedEmail || '',
                phone: d.recipient?.phone || d.sharedPhone || '',
              },
              sharedBy: {
                name: d.accountManager?.name || 'Atlas Commercial Desk',
                email: d.accountManager?.email || 'orders@atlas-solutions.com',
              },
              deliveryChannel: d.channel || (d.sharedPhone ? 'whatsapp' : 'pdf_download'),
              status: d.status || 'sent',
              createdAt: d.generatedAt || new Date().toISOString(),
              viewCount: d.viewCount || 0,
              lastViewedAt: d.lastViewedAt || null,
            });
          }
        });
      } catch (legacyErr) {
        console.warn('Could not read legacy catalog_generation_logs:', legacyErr.message);
      }
    }

    // Sort combined records by createdAt desc
    records.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));

    // Timeframe filtering in memory
    if (timeframe && timeframe !== 'all') {
      const now = new Date();
      let cutOff = new Date();
      if (timeframe === 'today') {
        cutOff.setHours(0, 0, 0, 0);
      } else if (timeframe === '7d') {
        cutOff.setDate(now.getDate() - 7);
      } else if (timeframe === '30d') {
        cutOff.setDate(now.getDate() - 30);
      }
      records = records.filter(r => new Date(r.createdAt || 0) >= cutOff);
    }

    // Search query filtering in memory
    if (q) {
      records = records.filter(r => 
        (r.recipient?.name || '').toLowerCase().includes(q) ||
        (r.recipient?.company || '').toLowerCase().includes(q) ||
        (r.recipient?.email || '').toLowerCase().includes(q) ||
        (r.assetTitle || '').toLowerCase().includes(q) ||
        (r.shareCode || '').toLowerCase().includes(q) ||
        (r.assetMeta?.vialCode || '').toLowerCase().includes(q) ||
        (r.assetMeta?.sku || '').toLowerCase().includes(q) ||
        (r.notes || '').toLowerCase().includes(q)
      );
    }

    // Pre-calculate summary KPIs for tracking
    const kpis = {
      totalShared: records.length,
      doctorCount: records.filter(r => r.recipient?.type === 'doctor' || r.recipient?.type === 'clinic').length,
      patientCount: records.filter(r => r.recipient?.type === 'patient').length,
      wholesalerCount: records.filter(r => r.recipient?.type === 'wholeseller').length,
      labelsCount: records.filter(r => r.assetType?.startsWith('label')).length,
      viewedCount: records.filter(r => r.status === 'viewed' || (r.viewCount && r.viewCount > 0)).length,
    };

    return NextResponse.json({
      items: records.slice(0, limitNum),
      total: records.length,
      kpis,
    });
  } catch (err) {
    console.error('[/api/shares] GET Error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

/**
 * POST /api/shares
 * Creates a new universal share record when sharing an asset.
 */
export async function POST(request) {
  try {
    if (!adminDb) {
      return NextResponse.json({ error: 'Firebase Admin not initialized' }, { status: 500 });
    }

    const body = await request.json();
    const {
      assetType = 'document',
      assetTitle = 'Shared Asset',
      assetMeta = {},
      recipient = {},
      sharedBy = {},
      deliveryChannel = 'link',
      notes = '',
      shareUrl = '',
    } = body;

    // Generate human-friendly tracking code: SH-YYYY-XXXX
    const year = new Date().getFullYear();
    const randPart = Math.random().toString(36).substring(2, 6).toUpperCase();
    const shareCode = `SH-${year}-${randPart}`;
    const origin = request.headers.get('origin') || process.env.NEXT_PUBLIC_APP_URL || 'https://med-peptides.com';
    const shortUrl = `${origin}/c/${shareCode}`;

    const docData = {
      shareCode,
      shortUrl,
      assetType,
      assetTitle,
      assetMeta: {
        ...assetMeta,
        shareUrl: shareUrl || assetMeta.shareUrl || null,
      },
      recipient: {
        type: recipient.type || 'external',
        id: recipient.id || null,
        name: recipient.name || 'Unnamed Recipient',
        company: recipient.company || '',
        email: recipient.email || '',
        phone: recipient.phone || '',
      },
      sharedBy: {
        uid: sharedBy.uid || null,
        name: sharedBy.name || 'Atlas Health Staff',
        email: sharedBy.email || '',
        role: sharedBy.role || 'admin',
      },
      deliveryChannel,
      notes: notes || '',
      status: 'sent',
      createdAt: new Date().toISOString(),
      viewCount: 0,
      lastViewedAt: null,
      views: [],
    };

    const docRef = await adminDb.collection('shared_records').add(docData);

    // Also persist lightweight record into shared_catalog_links so /c/[shareCode] resolves instantly
    const isProto = assetType === 'protocols_catalog' || assetType === 'protocol';
    try {
      await adminDb.collection('shared_catalog_links').doc(shareCode).set({
        catalogId: shareCode,
        catalogCode: shareCode,
        catalogType: isProto ? 'protocols' : (assetType === 'catalog' || assetType === 'catalog_pdf' ? 'products' : assetType),
        assetType,
        recipientUserId: recipient.id || null,
        recipientName: recipient.name || 'Valued Partner',
        recipientEmail: recipient.email || null,
        recipientPhone: recipient.phone || null,
        recipientType: recipient.type || 'doctor',
        targetUrl: shareUrl || (isProto ? '/proto' : '/catalog'),
        shortUrl,
        channel: deliveryChannel,
        status: 'sent',
        visitsCount: 0,
        createdAt: new Date().toISOString(),
      });
    } catch (linkErr) {
      console.warn('[POST /api/shares] Could not mirror to shared_catalog_links:', linkErr.message);
    }

    return NextResponse.json({
      success: true,
      id: docRef.id,
      shareCode,
      shortUrl,
      shareRecord: { id: docRef.id, ...docData }
    });
  } catch (err) {
    console.error('[/api/shares] POST Error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
