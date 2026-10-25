import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebaseAdmin';
import { FieldValue } from 'firebase-admin/firestore';

/**
 * POST /api/orders/create-draft
 * Creates an incoming draft order from the shared catalog or public referral links.
 * Triggers unclosable notifications for Admin and Account Managers.
 */
export async function POST(request) {
  try {
    const body = await request.json();
    const {
      cartItems = [],
      customerName,
      customerEmail = '',
      customerPhone = '',
      customerAddress = '',
      customerVat = '',
      customerNotes = '',
      shippingDestination = '',
      shippingCode = '',
      shippingCost = 0,
      subtotal = 0,
      grandTotal = 0,
      currency = 'USD',
      currencySymbol = '$',
      totalUnits = 0,
      catalogId = '',
      catalogCode = '',
      catalogToken = '',
      catalogTitle = '',
      priceTier = 'wholesale',
      priceTierLabel = 'Direct',
      priceTierCode = '',
      priceMarkupPercent = 0,
      priceSource = 'wholesale',
      supplierFilter = '',
      categoryFilter = '',
      collection = 'vials',
      wholesalerId = null,
      referralCode = null,
      wholesalerName = '',
      wholesalerEmail = '',
      paymentMethod = 'payment_link_24h',
      accountManagerName = '',
      accountManagerEmail = '',
      accountManagerId = '',
      source = 'shared_catalog'
    } = body;

    if (!cartItems || cartItems.length === 0) {
      return NextResponse.json(
        { error: 'Cannot create draft order with an empty cart.' },
        { status: 400 }
      );
    }

    if (!adminDb) {
      return NextResponse.json(
        { error: 'Database service temporarily unavailable.' },
        { status: 503 }
      );
    }

    const now = new Date();
    const orderCode = `PO-DRAFT-${now.getFullYear().toString().slice(-2)}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}-${Math.floor(1000 + Math.random() * 9000)}`;

    // Auto-resolve wholesaler attribution from shared catalog link if not directly passed
    let effectiveWholesalerId = wholesalerId ? String(wholesalerId).trim() : null;
    let effectiveWholesalerName = wholesalerName ? String(wholesalerName).trim() : null;
    let effectiveWholesalerEmail = wholesalerEmail ? String(wholesalerEmail).trim() : null;
    let effectiveReferralCode = referralCode ? String(referralCode).trim() : (effectiveWholesalerId || null);

    if (!effectiveWholesalerId && catalogId && adminDb) {
      try {
        const linkSnap = await adminDb.collection('shared_catalog_links').doc(String(catalogId).trim()).get();
        if (linkSnap.exists) {
          const lData = linkSnap.data();
          const isWs = lData.recipientType === 'wholesaler' || lData.recipientType === 'wholeseller' || Boolean(lData.wholesalerId);
          if (isWs) {
            effectiveWholesalerId = lData.recipientUserId || lData.wholesalerId || null;
            effectiveWholesalerName = lData.recipientName || lData.wholesalerName || null;
            effectiveWholesalerEmail = lData.recipientEmail || lData.wholesalerEmail || null;
            effectiveReferralCode = effectiveReferralCode || effectiveWholesalerId || String(catalogId).trim();
          }
        }
      } catch (wsLookupErr) {
        console.warn('[create-draft] Could not auto-resolve wholesaler from catalog link:', wsLookupErr.message);
      }
    }

    const formattedItems = cartItems.map(item => {
      const isBulk = item.quantity >= 10 && item.tier10UnitPrice && item.tier10UnitPrice > 0;
      const unitPrice = isBulk ? item.tier10UnitPrice : item.price;
      const totalPrice = Number((item.quantity * unitPrice).toFixed(2));
      return {
        id: item.id || '',
        name: String(item.productName || item.name || '').trim(),
        productName: String(item.productName || item.name || '').trim(),
        dosage: String(item.dosage || '').trim(),
        presentation: String(item.presentation || 'vial').trim(),
        variant: [item.dosage, item.presentation].filter(Boolean).join(' • '),
        quantity: Number(item.quantity) || 0,
        kits: Math.floor((item.quantity || 0) / 10),
        singleUnits: (item.quantity || 0) % 10,
        unitPrice: Number(unitPrice) || 0,
        price: Number(unitPrice) || 0,
        totalPrice,
        total: totalPrice,
        lineTotal: totalPrice,
        isBulk,
        apiItems: item.apiItems || item.apis || item.constituents || null,
        posology: item.posology || null
      };
    });

    const clientDisplayName = String(customerName || 'Clinical Client').trim();

    const orderDocData = {
      orderId: orderCode,
      code: orderCode,
      status: 'draft', // Regla #28 Taxonomía Unificada de Estados
      source,
      catalogId: String(catalogId || '').trim(),
      catalogCode: String(catalogCode || '').trim(),
      catalogToken: String(catalogToken || '').trim(),
      catalogTitle: String(catalogTitle || '').trim(),
      priceTier: String(priceTier || '').trim(),
      priceTierLabel: String(priceTierLabel || 'Institutional Direct').trim(),
      priceTierCode: String(priceTierCode || '').trim(),
      priceMarkupPercent: Number(priceMarkupPercent || 0),
      priceSource: String(priceSource || 'wholesale').trim(),
      supplierFilter: String(supplierFilter || '').trim(),
      categoryFilter: String(categoryFilter || '').trim(),
      customerName: clientDisplayName,
      customerEmail: String(customerEmail || '').trim(),
      customerPhone: String(customerPhone || '').trim(),
      customerAddress: String(customerAddress || '').trim(),
      deliveryAddress: String(customerAddress || '').trim(),
      customerVat: String(customerVat || '').trim(),
      customerNotes: String(customerNotes || '').trim(),
      items: formattedItems,
      totalUnits: Number(totalUnits) || formattedItems.reduce((acc, i) => acc + i.quantity, 0),
      subtotal: Number(subtotal) || 0,
      shippingCost: Number(shippingCost) || 0,
      shippingDestination: String(shippingDestination || 'Standard Dispatch').trim(),
      shippingCode: String(shippingCode || 'EU').trim(),
      grandTotal: Number(grandTotal) || 0,
      total: Number(grandTotal || 0),
      totalAmount: Number(grandTotal || 0),
      paymentMethod: String(paymentMethod || 'payment_link_24h').trim(), // Default: payment link within 24h
      currency: String(currency || 'USD').toUpperCase(),
      currencySymbol: String(currencySymbol || '$'),
      wholesalerId: effectiveWholesalerId,
      referralCode: effectiveReferralCode,
      wholesalerName: effectiveWholesalerName,
      wholesalerEmail: effectiveWholesalerEmail,
      collection: String(collection || 'vials').toLowerCase(),
      accountManagerName: String(accountManagerName || '').trim(),
      accountManagerEmail: String(accountManagerEmail || '').trim() || null,
      accountManagerId: String(accountManagerId || '').trim() || null,
      
      // Strict reception & acknowledgment tracking
      requiresAcknowledgment: true,
      acknowledged: false,
      isRead: false,
      readAt: null,
      readBy: null,
      acknowledgedAt: null,
      acknowledgedBy: null,
      receptionNotes: '',

      createdAt: now.toISOString(),
      updatedAt: now.toISOString()
    };

    const orderRef = await adminDb.collection('orders').add(orderDocData);

    // Update Wholesaler Referral analytics in Firestore if attributed
    if (orderDocData.wholesalerId) {
      try {
        const refDocRef = adminDb.collection('wholesaler_referrals').doc(orderDocData.wholesalerId);
        const colKey = orderDocData.collection;
        await refDocRef.set({
          wholesalerId: orderDocData.wholesalerId,
          referralCode: orderDocData.referralCode || orderDocData.wholesalerId,
          ordersCount: FieldValue.increment(1),
          totalRevenue: FieldValue.increment(orderDocData.grandTotal),
          totalUnits: FieldValue.increment(orderDocData.totalUnits),
          [`collections.${colKey}.ordersCount`]: FieldValue.increment(1),
          [`collections.${colKey}.totalRevenue`]: FieldValue.increment(orderDocData.grandTotal),
          lastOrderAt: now.toISOString(),
          updatedAt: now.toISOString()
        }, { merge: true });

        // Also add to subcollection for individual referral order ledger
        await refDocRef.collection('orders').doc(orderRef.id).set({
          orderId: orderRef.id,
          orderCode,
          collection: orderDocData.collection,
          customerName: clientDisplayName,
          customerEmail: orderDocData.customerEmail,
          totalUnits: orderDocData.totalUnits,
          grandTotal: orderDocData.grandTotal,
          currency: orderDocData.currency,
          status: 'draft',
          paymentMethod: orderDocData.paymentMethod,
          createdAt: now.toISOString()
        });
      } catch (refErr) {
        console.warn('[orders/create-draft] Non-blocking referral tracking update warning:', refErr.message);
      }
    }

    // Create high-priority notification for Admin, Wholesaler and Account Manager
    const isWholesalerOrder = Boolean(orderDocData.wholesalerId);
    const notifData = {
      title: isWholesalerOrder
        ? `🚨 Wholesaler Referral Order: ${orderCode} (Send Payment Link <24h)`
        : `🚨 New Order Draft: ${orderCode}`,
      message: isWholesalerOrder
        ? `${clientDisplayName} placed an order via Wholesaler [${orderDocData.wholesalerId}] for ${orderDocData.totalUnits} units (${orderDocData.currency} ${orderDocData.grandTotal.toFixed(2)}). Send secure payment link within 24 hours.`
        : `${clientDisplayName} created a draft order for ${orderDocData.totalUnits} units (${orderDocData.currency} ${orderDocData.grandTotal.toFixed(2)}) via shared catalog. Requires immediate reception acknowledgment.`,
      type: 'order_draft',
      severity: 'critical',
      orderId: orderRef.id,
      orderCode,
      wholesalerId: orderDocData.wholesalerId,
      targetRoles: ['admin', 'account_manager', 'wholesaler'],
      accountManagerEmail: orderDocData.accountManagerEmail,
      requiresAcknowledgment: true,
      acknowledged: false,
      read: false,
      link: `/admin?tab=orders&orderId=${orderRef.id}`,
      createdAt: now.toISOString()
    };

    await adminDb.collection('notifications').add(notifData);

    return NextResponse.json({
      success: true,
      orderId: orderRef.id,
      orderCode,
      message: 'Draft order successfully registered in portal.'
    });
  } catch (error) {
    console.error('Error creating draft order:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create draft order.' },
      { status: 500 }
    );
  }
}
