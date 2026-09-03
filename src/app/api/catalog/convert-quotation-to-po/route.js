import { NextResponse } from 'next/server';
import { dbAdmin } from '@/lib/firebaseAdmin';

export async function POST(request) {
  try {
    const body = await request.json();
    const { quotationId, notes = '' } = body;

    if (!quotationId) {
      return NextResponse.json(
        { success: false, error: 'quotationId is required' },
        { status: 400 }
      );
    }

    const quoteRef = dbAdmin.collection('supplier_quotations').doc(quotationId);
    const quoteDoc = await quoteRef.get();

    if (!quoteDoc.exists) {
      return NextResponse.json(
        { success: false, error: `Quotation ${quotationId} not found` },
        { status: 404 }
      );
    }

    const quoteData = quoteDoc.data();

    // Generate unique PO Number
    const shortRand = Math.random().toString(36).substring(2, 6).toUpperCase();
    const supCode = (quoteData.supplierName || 'SUP').toUpperCase().replace(/[^A-Z]/g, '').slice(0, 5) || 'SUP';
    const year = new Date().getFullYear() || 2026;
    const poNumber = `PO-${year}-${supCode}-${shortRand}`;

    const poDocRef = dbAdmin.collection('purchase_orders').doc();
    const poId = poDocRef.id;

    // Estimated delivery: ~21 days from today
    const expDeliv = new Date();
    expDeliv.setDate(expDeliv.getDate() + 21);

    const newPO = {
      id: poId,
      poNumber,
      quotationId: quoteData.id,
      quotationNumber: quoteData.quotationNumber || `SQ-${quotationId}`,
      supplierId: quoteData.supplierId || 'supplier-lotusland',
      supplierName: quoteData.supplierName || 'Lotusland',
      orderDate: new Date().toISOString().split('T')[0],
      expectedDeliveryDate: expDeliv.toISOString().split('T')[0],
      status: 'po_created', // 'po_created' | 'awaiting_payment' | 'in_transit' | 'delivered'
      paymentTerms: quoteData.paymentTerms || '50% Advance / 50% on B/L',
      shippingCost: quoteData.shippingCost || 0,
      incoterm: quoteData.incoterm || 'DAP',
      currency: quoteData.currency || 'USD',
      grossSubtotal: quoteData.grossSubtotal || 0,
      discountPercentage: quoteData.discountPercentage || 0,
      discountAmount: quoteData.discountAmount || 0,
      netSubtotal: quoteData.netSubtotal || 0,
      totalPayable: quoteData.totalPayable || 0,
      sourceFile: quoteData.sourceFile || null,
      items: (quoteData.items || []).map((it, idx) => ({
        lineIndex: idx + 1,
        peptide_name: it.peptide_name,
        quantity: it.quantity,
        unit_of_measure: it.unit_of_measure || 'g',
        purity_or_grade: it.purity_or_grade || 'USP / API Grade',
        unit_price: it.unit_price,
        line_total: it.line_total,
        productId: it.productId || null,
        variantId: it.variantId || null,
        status: 'ordered'
      })),
      notes: notes || `Converted from quotation ${quoteData.quotationNumber || quotationId}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // Save PO in purchase_orders
    await poDocRef.set(newPO);

    // Also update quotation record
    await quoteRef.update({
      status: 'converted_to_po',
      poId,
      poNumber,
      convertedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });

    return NextResponse.json({
      success: true,
      poId,
      poNumber,
      quotationNumber: quoteData.quotationNumber,
      totalPayable: newPO.totalPayable
    });
  } catch (err) {
    console.error('[convert-quotation-to-po] Error converting quote to PO:', err);
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to convert quotation to PO' },
      { status: 500 }
    );
  }
}
