import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebaseAdmin';

/**
 * POST /api/orders/create-draft
 * Creates an incoming draft order from the shared catalog.
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

    const formattedItems = cartItems.map(item => {
      const isBulk = item.quantity >= 10 && item.tier10UnitPrice && item.tier10UnitPrice > 0;
      const unitPrice = isBulk ? item.tier10UnitPrice : item.price;
      const totalPrice = Number((item.quantity * unitPrice).toFixed(2));
      return {
        id: item.id || '',
        productName: String(item.productName || item.name || '').trim(),
        dosage: String(item.dosage || '').trim(),
        presentation: String(item.presentation || 'vial').trim(),
        quantity: Number(item.quantity) || 0,
        kits: Math.floor((item.quantity || 0) / 10),
        singleUnits: (item.quantity || 0) % 10,
        unitPrice: Number(unitPrice) || 0,
        totalPrice,
        isBulk
      };
    });

    const clientDisplayName = String(customerName || 'Clinical Client').trim();

    const orderDocData = {
      orderId: orderCode,
      code: orderCode,
      status: 'draft', // Regla #28 Taxonomía Unificada de Estados
      source,
      catalogId: String(catalogId || '').trim(),
      customerName: clientDisplayName,
      customerEmail: String(customerEmail || '').trim(),
      customerPhone: String(customerPhone || '').trim(),
      customerAddress: String(customerAddress || '').trim(),
      customerVat: String(customerVat || '').trim(),
      customerNotes: String(customerNotes || '').trim(),
      items: formattedItems,
      totalUnits: Number(totalUnits) || formattedItems.reduce((acc, i) => acc + i.quantity, 0),
      subtotal: Number(subtotal) || 0,
      shippingCost: Number(shippingCost) || 0,
      shippingDestination: String(shippingDestination || 'Standard Dispatch').trim(),
      shippingCode: String(shippingCode || 'EU').trim(),
      grandTotal: Number(grandTotal) || 0,
      currency: String(currency || 'USD').toUpperCase(),
      currencySymbol: String(currencySymbol || '$'),
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

    // Create high-priority notification for Admin and Account Manager
    const notifData = {
      title: `🚨 New Order Draft: ${orderCode}`,
      message: `${clientDisplayName} created a draft order for ${orderDocData.totalUnits} units (${orderDocData.currency} ${orderDocData.grandTotal.toFixed(2)}) via shared catalog. Requires immediate reception acknowledgment.`,
      type: 'order_draft',
      severity: 'critical',
      orderId: orderRef.id,
      orderCode,
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
