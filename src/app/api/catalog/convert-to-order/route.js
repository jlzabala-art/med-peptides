import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebaseAdmin';

/**
 * POST /api/catalog/convert-to-order
 * Converts a generated catalog or quotation into an official B2B Sales Order / Purchase Order.
 */
export async function POST(request) {
  try {
    if (!adminDb) {
      return NextResponse.json({ error: 'Firebase Admin not initialized' }, { status: 500 });
    }

    const body = await request.json();
    const { logId, orderNotes } = body;

    if (!logId) {
      return NextResponse.json({ error: 'Missing logId' }, { status: 400 });
    }

    const logRef = adminDb.collection('catalog_generation_logs').doc(logId);
    const logSnap = await logRef.get();

    if (!logSnap.exists) {
      return NextResponse.json({ error: 'Catalog log record not found' }, { status: 404 });
    }

    const logData = logSnap.data();
    const poNumber = `PO-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

    // Create B2B Sales Order in Firestore
    const orderDoc = {
      poNumber,
      sourceCatalogId: logId,
      docType: logData.docType || 'pricelist',
      client: {
        id: logData.recipient?.id || null,
        name: logData.recipient?.name || 'Direct Client',
        email: logData.recipient?.email || '',
        type: logData.recipient?.type || 'custom',
      },
      accountManager: {
        id: logData.accountManager?.id || null,
        name: logData.accountManager?.name || 'Atlas Commercial Desk',
        email: logData.accountManager?.email || 'orders@atlas-solutions.com',
      },
      productSummary: logData.productSummary || 'Peptide Order',
      variantCount: logData.variantCount || 1,
      currency: logData.currency || 'USD',
      incoterm: logData.incoterm || 'EXW',
      priceTier: logData.tier || 'wholesale',
      status: 'pending',
      orderNotes: orderNotes || logData.followUpNotes || '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const orderRef = await adminDb.collection('b2b_sales_orders').add(orderDoc);

    // Update the catalog tracking log to 'converted_to_order'
    await logRef.update({
      status: 'converted_to_order',
      salesOrderId: orderRef.id,
      poNumber,
      convertedAt: new Date().toISOString(),
    });

    return NextResponse.json({
      success: true,
      orderId: orderRef.id,
      poNumber,
      order: orderDoc,
    });
  } catch (err) {
    console.error('[/api/catalog/convert-to-order] Error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
