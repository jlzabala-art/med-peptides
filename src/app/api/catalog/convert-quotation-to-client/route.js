import { NextResponse } from 'next/server';
import { dbAdmin } from '@/lib/firebaseAdmin';

export async function POST(request) {
  try {
    const body = await request.json();
    const { 
      quotationId, 
      clientId = 'CE0nXEryOPhBs4fkA80WtnoSBx83', // Default: Magenta Health (Lynn Iglesia)
      marginPercent = 6.0,
      notes = '' 
    } = body;

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
        { success: false, error: `Supplier Quotation ${quotationId} not found` },
        { status: 404 }
      );
    }

    const quoteData = quoteDoc.data();

    // Fetch Client Data (Magenta Health or specific clientId)
    let clientData = null;
    let clientRef = null;

    if (clientId) {
      clientRef = dbAdmin.collection('users').doc(clientId);
      const clientSnap = await clientRef.get();
      if (clientSnap.exists) {
        clientData = { id: clientSnap.id, ...clientSnap.data() };
      }
    }

    if (!clientData) {
      // Fallback search by email / company
      const usersSnap = await dbAdmin.collection('users').get();
      const found = usersSnap.docs.find(d => {
        const dData = d.data();
        return (dData.email && dData.email.toLowerCase().includes('magenta')) ||
               (dData.displayName && dData.displayName.toLowerCase().includes('magenta')) ||
               (dData.wholesellerId && dData.wholesellerId.toLowerCase().includes('magenta'));
      });
      if (found) {
        clientData = { id: found.id, ...found.data() };
      }
    }

    const marginFactor = 1 + (Number(marginPercent) || 6.0) / 100;
    const year = new Date().getFullYear() || 2026;
    const shortRand = Math.random().toString(36).substring(2, 6).toUpperCase();
    const clientCode = (clientData?.wholesellerId || clientData?.displayName || 'MAGENTA')
      .toUpperCase().replace(/[^A-Z]/g, '').slice(0, 7) || 'MAGENTA';
    const clientQuoteNumber = `QT-${year}-${clientCode}-${shortRand}`;

    const itemsRaw = quoteData.lineItems || quoteData.items || [];
    let calculatedSubtotal = 0;

    const clientItems = itemsRaw.map((it, idx) => {
      const supplierUnitCost = Number(it.supplierCost || it.unitPrice || it.unit_price || 0);
      const clientUnitPrice = parseFloat((supplierUnitCost * marginFactor).toFixed(2));
      const qty = Number(it.quantity || 1);
      const lineTotal = parseFloat((clientUnitPrice * qty).toFixed(2));
      calculatedSubtotal += lineTotal;

      return {
        lineIndex: idx + 1,
        productId: it.productId || null,
        variantId: it.variantId || null,
        name: it.name || it.itemName || it.peptide_name || 'Product',
        dosage: it.dosage || null,
        format: it.format || null,
        quantity: qty,
        supplierCost: supplierUnitCost,
        supplierName: quoteData.supplierName || 'Lotusland Limited',
        unitRate: clientUnitPrice,
        unitPrice: clientUnitPrice,
        totalPrice: lineTotal,
        marginPercent: Number(marginPercent),
        originWarehouse: it.originWarehouse || null
      };
    });

    const shippingCost = Number(quoteData.shippingCost || 0);
    const grandTotal = parseFloat((calculatedSubtotal + shippingCost).toFixed(2));

    const publicToken = `token_quote_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;

    const newClientQuotation = {
      quotationNumber: clientQuoteNumber,
      refNumber: clientQuoteNumber,
      linkedSupplierQuotationId: quotationId,
      linkedSupplierQuotationNumber: quoteData.quotationNumber || quotationId,
      supplierName: quoteData.supplierName || 'Lotusland Limited',
      
      // Client Details (Magenta Health)
      recipientType: 'clinic',
      clientId: clientData?.id || clientId,
      clientName: clientData?.displayName || 'Lynn Iglesia (Magenta Health)',
      clinicName: 'Magenta Health',
      wholesalerId: clientData?.wholesellerId || 'magenta-health',
      wholesalerName: 'Magenta Health',
      contactEmail: clientData?.email || 'procurement@magenta-health.ae',
      contactPhone: clientData?.phone || '04-2222500',
      zohoContactId: clientData?.zohoContactId || '7006116000000593278',

      // Commercials
      status: 'draft', // DRAFT mode - not dispatched to client
      currency: quoteData.currency || 'USD',
      marginPercent: Number(marginPercent),
      marginTotal: parseFloat((calculatedSubtotal - (quoteData.subtotal || 2400)).toFixed(2)),
      subtotal: calculatedSubtotal,
      shippingCost,
      taxTotal: 0,
      grandTotal,
      
      paymentTerms: 'due_on_receipt',
      pricingTier: 'wholesale',
      docType: 'quotation',
      items: clientItems,
      publicToken,
      
      notes: notes || `Generated from Supplier Quotation ${quoteData.quotationNumber || quotationId} with ${marginPercent}% margin. Strictly internal draft.`,
      dispatchPolicy: 'manual_only', // Internal guarantee
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const clientQuoteDocRef = dbAdmin.collection('quotations').doc();
    const clientQuoteId = clientQuoteDocRef.id;
    newClientQuotation.id = clientQuoteId;

    await clientQuoteDocRef.set(newClientQuotation);

    // Update Supplier Quotation record with linkage
    await quoteRef.update({
      linkedClientQuotationId: clientQuoteId,
      linkedClientQuotationNumber: clientQuoteNumber,
      clientTargetName: 'Magenta Health',
      updatedAt: new Date().toISOString()
    });

    return NextResponse.json({
      success: true,
      clientQuoteId,
      quotationNumber: clientQuoteNumber,
      clientName: newClientQuotation.clientName,
      subtotal: calculatedSubtotal,
      shippingCost,
      grandTotal,
      marginPercent: Number(marginPercent),
      status: 'draft'
    });
  } catch (err) {
    console.error('[convert-quotation-to-client] Error:', err);
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to convert quotation to client quotation' },
      { status: 500 }
    );
  }
}
